import User from '../../models/user';
import { ClientProvider } from '../../utils/clientProvider.mjs';
import Markup from 'telegraf/markup';

export class ChannelsActions {
    constructor(bot, client) {
        // Добавление канала
        bot.on('message', async (ctx, next) => {
            if (ctx.message.hasOwnProperty('forward_from_chat')) {
                try {
                    const admins = await client.getChatAdministrators(ctx.message.forward_from_chat.id);
                    const channel = await client.getChat(ctx.message.forward_from_chat.id);
                    const admin = admins.find((el) => el.user.id === ctx.message.from.id);

                    if (!channel.username) {
                        // канал должен быть публичным
                        return ctx.reply('notPublic');
                    }

                    if (!admin) {
                        return ctx.reply(ctx.i18n.t('youHasBeenAdmin'));
                    }

                    let user = await User.findById(admin.user.id);
                    if (!user) {
                        user = new User({
                            _id: admin.user.id,
                            ...admin.user,
                        });
                    }

                    const existChannel = user.channels.find((el) => el.id === ctx.message.forward_from_chat.id);

                    if (existChannel) {
                        return ctx.reply(ctx.i18n.t('channelAlreadyAdded'), Markup
                            .keyboard([
                                [`🤝 ${ctx.i18n.t('sellAdvertising')}`, `🚀 ${ctx.i18n.t('advertisingPurchase')}`],
                                [`☸ ${ctx.i18n.t('statistic')}`],
                            ])
                            .oneTime()
                            .resize()
                            .extra()
                        );
                    }

                    const { userId, error } = await ClientProvider.joinToChannel(channel.username);
                    if (!userId) {
                        console.log(error);
                        return ctx.reply(error, Markup
                            .keyboard([
                                [`🤝 ${ctx.i18n.t('sellAdvertising')}`, `🚀 ${ctx.i18n.t('advertisingPurchase')}`],
                                [`☸ ${ctx.i18n.t('statistic')}`],
                            ])
                            .oneTime()
                            .resize()
                            .extra()
                        );
                    }

                    await client.promoteChatMember(channel.id, userId, {
                        can_change_info: true,
                    });

                    user.channels.push({
                        id: channel.id,
                        title: channel.title,
                        username: channel.username,
                        price: 0,
                    });
                    await user.save();

                    return ctx.reply(`${ctx.i18n.t('channel')} ${ctx.message.forward_from_chat.title} ${ctx.i18n.t('succesAdded')}`,
                        Markup
                            .keyboard([
                                [`🤝 ${ctx.i18n.t('sellAdvertising')}`, `🚀 ${ctx.i18n.t('advertisingPurchase')}`],
                                [`☸ ${ctx.i18n.t('statistic')}`],
                            ])
                            .oneTime()
                            .resize()
                            .extra()
                    );
                } catch (e) {
                    return ctx.reply(e, Markup
                        .keyboard([
                            [`🤝 ${ctx.i18n.t('sellAdvertising')}`, `🚀 ${ctx.i18n.t('advertisingPurchase')}`],
                            [`☸ ${ctx.i18n.t('statistic')}`],
                        ])
                        .oneTime()
                        .resize()
                        .extra()
                    );
                }
            } else {
                await next();
            }
        });
    }
}
