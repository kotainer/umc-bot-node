import { ClientProvider } from './clientProvider';
import { CacheService } from '../services/cache.service.mjs';

import array from 'lodash/array';

export class ChannelComparer {
    constructor() {
        this.cache = new CacheService();
    }

    async compare({ userChannel, userChannelTitle, advChannel, advChannelTitle, ctx }) {
        try {
            console.log(userChannel);
            let userChannelUsers = [];
            let cachedChannel = await this.cache.getField(userChannel);
            if (cachedChannel) {
                userChannelUsers = cachedChannel;
            } else {
                userChannelUsers = await ClientProvider.getChannelUsers(userChannel);
                if (!Array.isArray(userChannelUsers)) {
                    return 'Ошибка при сравнении попробуй немного попозже';
                }
                this.cache.setField(userChannel, userChannelUsers, 30);
            }

            let advChannelUsers = [];
            cachedChannel = await this.cache.getField(advChannel);
            if (cachedChannel) {
                advChannelUsers = cachedChannel;
            } else {
                advChannelUsers = await ClientProvider.getChannelUsers(advChannel);
                if (!Array.isArray(advChannelUsers)) {
                    return 'Ошибка при сравнении попробуй немного попозже';
                }
                this.cache.setField(advChannel, advChannelUsers, 30);
            }

            const userChannelInfo = this.getUserListInfo(userChannelUsers);
            userChannelInfo.intersection = array.intersectionBy(userChannelUsers, advChannelUsers, 'id').length;

            const advChannelInfo = this.getUserListInfo(advChannelUsers);

            console.table(userChannelInfo);
            // console.table(userChannelUsers);
            console.table(advChannelInfo);
            // console.table(advChannelUsers);

            /*
                var firstUserName = firstChannel.Username;
                var secondUserName = secondChannel.Username;
            */

            const compareResult = `⭐️ Результат поиска пересечения:\n\n` +
            `📢 @${userChannel}(${userChannelTitle}) ${userChannelInfo.usersCount} подписчиков\n` +
            `📢 @${advChannel}(${advChannelTitle}) ${advChannelInfo.usersCount} подписчиков\n` +
            `Пересечение аудитории: ${userChannelInfo.intersection} участников (${Math.round(userChannelInfo.intersection * 100.00 / userChannelInfo.usersCount, 2)}% для @${userChannel}, ${Math.round(userChannelInfo.intersection * 100.00 / advChannelInfo.usersCount, 2)} % для @${advChannel}\n` +
            `➖➖➖➖➖➖➖➖➖➖➖\n\n` +
            `📋 Детально по @${userChannel}\n` +
            `🤖 Telegram боты: ${userChannelInfo.botCount}(${Math.round(userChannelInfo.botCount * 100.00 / userChannelInfo.usersCount, 2)}%)\n` +
            `💚 Живые люди: ${userChannelInfo.usersCount - userChannelInfo.botCount}(${Math.round((userChannelInfo.usersCount - userChannelInfo.botCount) * 100.00 / (userChannelInfo.usersCount), 2)}%)\n\n` +

            `👁 Подписчики, которые заходили последний раз:\n` +
            `▫️ от 1 секунды до 3 дней назад: ${userChannelInfo.lastOnline.l3} (${Math.round(userChannelInfo.lastOnline.l3 * 100.00 / userChannelInfo.usersCount)}%)\n` +
            `▫️ от 3 дней до 7 дней назад: ${userChannelInfo.lastOnline.l7} (${Math.round(userChannelInfo.lastOnline.l7 * 100.00 / userChannelInfo.usersCount)}%)\n` +
            `▫️ от 7 дней до месяца назад: ${userChannelInfo.lastOnline.l30} (${Math.round(userChannelInfo.lastOnline.l30 * 100.00 / userChannelInfo.usersCount)}%)\n` +
            `▫️ больше месяца назад: ${userChannelInfo.lastOnline.lMore30} (${Math.round(userChannelInfo.lastOnline.lMore30 * 100.00 / userChannelInfo.usersCount)}%)\n\n` +
            `〰〰〰〰〰〰〰〰〰〰〰\n\n` +

            `📋 Детально по @${advChannel}\n` +
            `🤖 Telegram боты: ${advChannelInfo.botCount}(${Math.round(advChannelInfo.botCount * 100.00 / advChannelInfo.usersCount, 2)}%)\n` +
            `💚 Живые люди: ${advChannelInfo.usersCount - advChannelInfo.botCount}(${Math.round((advChannelInfo.usersCount - advChannelInfo.botCount) * 100.00 / (advChannelInfo.usersCount), 2)}%)\n\n` +

            `👁 Подписчики, которые заходили последний раз:\n` +
            `▫️ от 1 секунды до 3 дней назад: ${advChannelInfo.lastOnline.l3} (${Math.round(advChannelInfo.lastOnline.l3 * 100.00 / advChannelInfo.usersCount, 2)}%)\n` +
            `▫️ от 3 дней до 7 дней назад: ${advChannelInfo.lastOnline.l7} (${Math.round(advChannelInfo.lastOnline.l7 * 100.00 / advChannelInfo.usersCount, 2)}%)\n` +
            `▫️ от 7 дней до месяца назад: ${advChannelInfo.lastOnline.l30} (${Math.round(advChannelInfo.lastOnline.l30 * 100.00 / advChannelInfo.usersCount, 2)}%)\n` +
            `▫️ больше месяца назад: ${advChannelInfo.lastOnline.lMore30} (${Math.round(advChannelInfo.lastOnline.lMore30 * 100.00 / advChannelInfo.usersCount, 2)}%)\n`;

            return compareResult;
        } catch (e) {
            console.error(e);
            return 'Ошибка при сравнении попробуй немного попозже';
        }
    }

    getDaysLeft(compareDate, today) {
        return compareDate < today ? Math.ceil((today - compareDate) / (1000 * 60 * 60 * 24)) : null;
    }

    getUserListInfo(list) {
        // console.log(list);
        const info = {
            usersCount: 0,
            botCount: 0,
            userDeletedCount: 0,
            intersection: 0,
            lastOnline: {
                l3: 0,
                l7: 0,
                l30: 0,
                lMore30: 0,
            },
        };

        info.usersCount = list.length;

        for (const user of list) {
            if (user.bot) {
                info.botCount ++;
                continue;
            }

            if (user.status === 'online') {
                info.lastOnline.l3 ++;
            } else if (user.status === 'recently') {
                info.lastOnline.l3 ++;
            } else if (user.status === 'week') {
                info.lastOnline.l7 ++;
            } else if (user.status === 'month') {
                info.lastOnline.l30 ++;
            } else {
                const date = new Date(user.status);
                const daysLeft = this.getDaysLeft(date, new Date());

                if (!daysLeft) {
                    continue;
                }

                if (daysLeft <= 3) {
                    info.lastOnline.l3 ++;
                } else if (daysLeft <= 7) {
                    info.lastOnline.l7 ++;
                } else if (daysLeft <= 30) {
                    info.lastOnline.l30 ++;
                } else {
                    info.lastOnline.lMore30 ++;
                }
            }
        }

        return info;
    }
}
