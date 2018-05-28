import User from '../../models/user';
import Post from '../../models/post';
import Markup from 'telegraf/markup';
import Extra from 'telegraf/extra';

export class BuyAgreement {
    constructor(bot, client) {
        // Конструктор. Выбор канала
        bot.hears(/^🕊 /, async (ctx) => {
            try {
                const post = await Post.findOne({
                   userId: ctx.message.from.id,
                   isSending: false,
                });

                post.status = 'agreement';
                post.isSending = true;
                await post.save();

                const channelOwner = await User.findOne({
                    'channels.id': post.channelId,
                });

                const channel = channelOwner.channels.find((el) => el.id === post.channelId);

                // Если выбран свой канал
                // if (channelOwner._id === ctx.message.from.id) {
                //     return ctx.reply('aggrement, Выбран свой канал');
                // }

                ctx.reply(ctx.i18n.t('postAgreementSend'), Markup
                    .keyboard([
                        [`🤝 ${ctx.i18n.t('sellAdvertising')}`, `🚀 ${ctx.i18n.t('advertisingPurchase')}`],
                        [`☸ ${ctx.i18n.t('statistic')}`],
                    ])
                    .oneTime()
                    .resize()
                    .extra()
                );

                this.generateViewPost(client, post, channelOwner._id);

                return client.sendMessage(channelOwner._id, `В Ваш канал ${channel.title}(@${channel.username})` +
                    ` хотят разместить рекламу`, Markup.inlineKeyboard([
                        [
                            Markup.callbackButton(`📢 ${ctx.i18n.t('publishNow')}`, `publish_now|${post._id}`),
                        ],
                        [
                            Markup.callbackButton(`🕒 ${ctx.i18n.t('publishLater')}`, `publish_later|${post._id}`)],
                        [
                            Markup.callbackButton(`⛔ ${ctx.i18n.t('decline')}`, `decline_post|${post._id}`),
                        ],
                    ])
                    .extra());
            } catch (e) {
                return ctx.reply(e.toString());
            }
        });

        // Отклонение поста
        bot.action(/^decline_post/, async (ctx, next) => {
            try {
                const prevParams = ctx.update.callback_query.data;
                const postId = prevParams.split('|')[1];
                const post = await Post.findById(postId);
                if (!post) {
                    return next();
                }

                const userSender = await User.findById(post.userId);

                await Post.remove({ _id: postId });

                client.sendMessage(userSender._id, 'Ваш пост был отклонен');

                return ctx.reply(ctx.i18n.t('greeting'), Markup
                .keyboard([
                    [`🤝 ${ctx.i18n.t('sellAdvertising')}`, `🚀 ${ctx.i18n.t('advertisingPurchase')}`],
                    [`☸ ${ctx.i18n.t('statistic')}`],
                ])
                .oneTime()
                .resize()
                .extra()
            );
            } catch (e) {
                console.error(e);
                return ctx.reply(e.toString());
            }
        });

        // Немедленное размещение
        bot.action(/^publish_now/, async (ctx) => {
            try {
                const prevParams = ctx.update.callback_query.data;
                const postId = prevParams.split('|')[1];
                const post = await Post.findById(postId);
                const userSender = await User.findById(post.userId);

                client.sendMessage(userSender._id, 'Ваш пост был успешно размещен в канале');

                return this.generateViewPost(client, post, post.channelId);
            } catch (e) {
                console.error(e);
                return ctx.reply(e.toString());
            }
        });

        // Отложенное размещение
        bot.action(/^publish_later/, async (ctx) => {
            try {
                const prevParams = ctx.update.callback_query.data;
                ctx.session.postId = prevParams.split('|')[1];

                return ctx.reply('Введите дату публикации в формате ДД.ММ.ГГГГ ЧЧ:ММ:СС');
            } catch (e) {
                console.error(e);
                return ctx.reply(e.toString());
            }
        });

        // Ввод цены за пост
        bot.hears(/^\d{2}.\d{2}.\d{4} \d{2}:\d{2}:\d{2}$/, async (ctx) => {
            try {
                return ctx.reply('Дата установлена');
            } catch (e) {
                console.error(e);
                return ctx.reply(e.toString());
            }
        });
    }

    // Генерация поста для просмотра
    generateViewPost(client, post, chatId) {
        if (post.photo.length) {
            client.sendPhoto(chatId, post.photo[0].file_id,
                Extra.load({
                    caption: post.text || 'Пустой текст поста',
                    parse_mode: 'Markdown',
                })
                    .markdown()
                    .markup((m) =>
                        m.inlineKeyboard(post.buttons)
                    )
            );
        } else if (post.document.length) {
            client.sendDocument(chatId, post.document[0].file_id,
                Extra.load({
                    caption: post.text || 'Пустой текст поста',
                    parse_mode: 'Markdown',
                })
                    .markdown()
                    .markup((m) =>
                        m.inlineKeyboard(post.buttons)
                    )
            );
        } else {
            client.sendMessage(chatId, post.text || 'Пустой текст поста',
                Markup.inlineKeyboard(post.buttons).extra()
            );
        }
    }
}
