import User from '../../models/user';
import Post from '../../models/post';
import Markup from 'telegraf/markup';
import Extra from 'telegraf/extra';

export class BuyAgreement {
    constructor(bot, client) {
        // Конструктор. Выбор канала
        bot.hears(/^🕊/, async (ctx) => {
            try {
                const post = await Post.findOne({
                   userId: ctx.message.from.id,
                   isSending: false,
                });

                const channelOwner = await User.findOne({
                    'channels.id': post.channelId,
                });

                const channel = channelOwner.channels.find((el) => el.id === post.channelId);

                // Если выбран свой канал
                // if (channelOwner._id === ctx.message.from.id) {
                //     return ctx.reply('aggrement, Выбран свой канал');
                // }

                this.generateViewPost(ctx, post);

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
        bot.action(/^decline_post/, async (ctx) => {
            try {
                const prevParams = ctx.update.callback_query.data;
                const postId = prevParams.split('|')[1];
                const post = await Post.findById(postId);
                const channelOwner = await User.findById(post.userId);

                await Post.remove({ _id: postId });

                client.sendMessage(channelOwner._id, 'Ваш пост был отклонен');

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
    }

    // Генерация поста для просмотра
    generateViewPost(ctx, post) {
        if (post.photo.length) {
            ctx.replyWithPhoto(post.photo[0].file_id,
                Extra.load({ caption: post.text || 'Пустой текст поста' })
                    .markdown()
                    .markup((m) =>
                        m.inlineKeyboard(post.buttons)
                    )
            );
        } else if (post.document.length) {
            ctx.replyWithDocument(post.document[0].file_id,
                Extra.load({ caption: post.text || 'Пустой текст поста' })
                    .markdown()
                    .markup((m) =>
                        m.inlineKeyboard(post.buttons)
                    )
            );
        } else {
            ctx.reply(post.text || 'Пустой текст поста',
                Markup.inlineKeyboard(post.buttons).extra()
            );
        }
    }
}
