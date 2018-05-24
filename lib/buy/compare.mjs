import { ChannelComparer } from '../../utils/channelComparer.mjs';

import User from '../../models/user';
import Markup from 'telegraf/markup';

export class CompareChannel {
    constructor(bot) {
        this.channelComparer = new ChannelComparer();

        // Каналы для сравнения
        bot.hears(/🔍 /g, async (ctx) => {
            try {
                const select = ctx.i18n.t('selectYourChannel');
                const emptyList = ctx.i18n.t('emptyList');

                const users = await User.find({
                    _id: ctx.message.from.id,
                }).lean();
                const list = [];

                ctx.session.userChannel = null;

                let tempArr = [];
                for (const user of users) {
                    for (const channel of user.channels) {
                        tempArr.push(Markup.callbackButton(channel.title, `s_m|${channel.username}`));
                        if (tempArr.length > 1) {
                            list.push(tempArr.slice(0, 2));
                            tempArr = [];
                        }
                    }
                }

                if (tempArr.length) {
                    list.push(tempArr.slice(0, 2));
                }

                if (list.length) {
                    return ctx.reply(`🤵 ${select}`,
                        Markup.inlineKeyboard(list).extra()
                    );
                } else {
                    return ctx.reply(emptyList);
                }
            } catch (e) {
                return ctx.reply(e.toString());
            }
        });

        // Выбора канала для сравнения
        bot.action(/^s_m/, async (ctx) => {
            try {
                const prevParams = ctx.update.callback_query.data;
                ctx.session.userChannel = prevParams.split('|')[1];
                ctx.session.userName = prevParams.split('|')[2];

                const userId = ctx.update.callback_query.message.chat.id;
                const compareList = ctx.i18n.t('channelForCompareList');
                const emptyList = ctx.i18n.t('emptyList');

                const users = await User.find({
                    _id: {
                        $ne: userId,
                    },
                }).lean();
                const list = [];

                let tempArr = [];
                for (const user of users) {
                    for (const channel of user.channels) {
                        tempArr.push(Markup.callbackButton(channel.title, `s_c|${channel.username}`));
                        if (tempArr.length > 1) {
                            list.push(tempArr.slice(0, 2));
                            tempArr = [];
                        }
                    }
                }

                if (tempArr.length) {
                    list.push(tempArr.slice(0, 2));
                }

                if (list.length) {
                    return ctx.editMessageText(compareList,
                        Markup.inlineKeyboard(list).extra());
                } else {
                    ctx.editMessageText(emptyList);
                }
            } catch (e) {
                return ctx.reply(e.toString());
            }
        });

        // Сравнение каналов
        bot.action(/^s_c/, async (ctx) => {
            try {
                const prevParams = ctx.update.callback_query.data;
                const advChannel = prevParams.split('|')[1];
                const advChannelTitle = prevParams.split('|')[2];

                const compare = ctx.i18n.t('channelForCompare');
                const builder = ctx.i18n.t('builder');
                const back = ctx.i18n.t('back');
                const adv = ctx.i18n.t('advertising');

                ctx.editMessageText('Идет сравнение');

                const compareResult = await this.channelComparer.compare({
                    userChannel: ctx.session.userChannel,
                    userChannelTitle: ctx.session.userName,
                    advChannel,
                    advChannelTitle,
                    ctx,
                });

                return ctx.reply(compareResult, Markup
                    .keyboard([
                        [`🔍 ${compare}`, `🏗 ${builder}`],
                        [`️️🏦 ${adv}`, `⬅️ ${back}`],
                    ])
                    .oneTime()
                    .resize()
                    .extra()
                );
            } catch (e) {
                return ctx.reply(e.toString());
            }
        });
    }
}
