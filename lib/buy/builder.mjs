import User from '../../models/user';
import Post from '../../models/post';
import Markup from 'telegraf/markup';
import Extra from 'telegraf/extra';

const typesConsts = {
    image: [
        'photo',
        'file',
        'no',
    ],
    text: [
        'yes',
        'no',
    ],
    stats: [
        'yes',
        'no',
    ],
};

export class PostBuilder {
    constructor(bot) {
        // Конструктор. Выбор канала
        bot.hears(/^🏗 /, async (ctx) => {
            try {
                const users = await User.find({}).lean();
                const list = [];

                let tempArr = [];
                for (const user of users) {
                    for (const channel of user.channels) {
                        tempArr.push(Markup.callbackButton(channel.title, `build_c|${channel.username}`));
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
                    return ctx.reply(ctx.i18n.t('selectChannel'),
                        Markup.inlineKeyboard(list).extra());
                } else {
                    ctx.reply(emptyList);
                }
            } catch (e) {
                return ctx.reply(e.toString());
            }
        });

        // Создание поста
        bot.action(/^build_c/, async (ctx) => {
            try {
                const prevParams = ctx.update.callback_query.data;
                const selectedUsername = prevParams.split('|')[1];
                const channelOwner = await User.findOne({
                    'channels.username': selectedUsername,
                });
                const channel = channelOwner.channels.find((el) => el.username === selectedUsername);

                let post = await Post.findOne({
                    userId: ctx.update.callback_query.from.id,
                    isSending: false,
                });

                if (!post) {
                    post = new Post({
                        userId: ctx.update.callback_query.from.id,
                        channelId: channel.id,
                    });
                }

                post.photo = [];
                post.document = [];
                post.buttons = [];
                post.reactions = [];
                post.isSending = false;
                post.text = '';
                post.types = {
                    image: 0,
                    text: 0,
                    buttons: 0,
                    reactions: 0,
                    links: 0,
                    stats: 0,
                };

                await post.save();

                ctx.session.type = 'build_post';
                ctx.session.channelId = channel.id;

                return ctx.editMessageText(`${ctx.i18n.t('selectCanal1')} "${channel.title}"(@${channel.username})` +
                    `${ctx.i18n.t('selectCanal2')} \nВыберите компоненты необходимые Вам для формирования поста`,
                    Markup.inlineKeyboard([
                        [
                            Markup.callbackButton('Изображение', 'nullimage'),
                            Markup.callbackButton(typesConsts.image[post.types.image], `build_sel|image`),
                        ],
                        [
                            Markup.callbackButton(ctx.i18n.t('text'), 'null'),
                            Markup.callbackButton(typesConsts.text[post.types.text], `build_sel|text`),
                        ],
                        [
                            Markup.callbackButton(ctx.i18n.t('button'), 'null'),
                            Markup.callbackButton('-', `build_sel|button|minus`),
                            Markup.callbackButton(post.types.buttons, `null`),
                            Markup.callbackButton('+', `build_sel|button|plus`),
                        ],
                        [
                            Markup.callbackButton(ctx.i18n.t('reaction'), 'null'),
                            Markup.callbackButton('-', `build_sel|reaction|minus`),
                            Markup.callbackButton(post.types.reactions, `null`),
                            Markup.callbackButton('+', `build_sel|reaction|plus`),
                        ],
                        [
                            Markup.callbackButton(ctx.i18n.t('link'), 'null'),
                            Markup.callbackButton('-', `build_sel|link|minus`),
                            Markup.callbackButton(post.types.links, `null`),
                            Markup.callbackButton('+', `build_sel|link|plus`),
                        ],
                        [
                            Markup.callbackButton(ctx.i18n.t('statistic'), 'null'),
                            Markup.callbackButton(typesConsts.text[post.types.stats], `build_sel|stats`),
                        ],
                        [
                            Markup.callbackButton('Отменить', 'build_remove'),
                            Markup.callbackButton('Начать', `build_start`),
                        ],
                    ]).extra()
                );
            } catch (e) {
                console.error(e);
                return ctx.reply(e.toString());
            }
        });

        // Создание поста
        bot.action(/^build_sel/, async (ctx) => {
            try {
                const prevParams = ctx.update.callback_query.data.split('|');
                const selectedType = prevParams[1];
                const action = prevParams[2];

                let post = await Post.findOne({
                    userId: ctx.update.callback_query.from.id,
                    isSending: false,
                });

                switch (selectedType) {
                    case 'button':
                        if (action === 'plus') {
                            post.types.buttons ++;
                        } else {
                            post.types.buttons --;
                        }

                        if (post.types.buttons < 0) {
                            post.types.buttons = 0;
                        }
                        break;
                    case 'reaction':
                        if (action === 'plus') {
                            post.types.reactions ++;
                        } else {
                            post.types.reactions --;
                        }

                        if (post.types.reactions < 0) {
                            post.types.reactions = 0;
                        }
                        break;
                    case 'link':
                        if (action === 'plus') {
                            post.types.links ++;
                        } else {
                            post.types.links --;
                        }

                        if (post.types.links < 0) {
                            post.types.links = 0;
                        }
                        break;
                    default:
                        post.types[selectedType] ++;

                        if (typesConsts[selectedType].length <= post.types[selectedType]) {
                            post.types[selectedType] = 0;
                        }
                        break;
                }

                await post.save();

                ctx.session.channelId = ctx.session.channelId;

                return ctx.editMessageText(`Выберите компоненты необходимые Вам для формирования поста`,
                    Markup.inlineKeyboard([
                        [
                            Markup.callbackButton('Изображение', 'null'),
                            Markup.callbackButton(typesConsts.image[post.types.image], `build_sel|image`),
                        ],
                        [
                            Markup.callbackButton(ctx.i18n.t('text'), 'null'),
                            Markup.callbackButton(typesConsts.text[post.types.text], `build_sel|text`),
                        ],
                        [
                            Markup.callbackButton(ctx.i18n.t('button'), 'null'),
                            Markup.callbackButton('-', `build_sel|button|minus`),
                            Markup.callbackButton(post.types.buttons, `null`),
                            Markup.callbackButton('+', `build_sel|button|plus`),
                        ],
                        [
                            Markup.callbackButton(ctx.i18n.t('reaction'), 'null'),
                            Markup.callbackButton('-', `build_sel|reaction|minus`),
                            Markup.callbackButton(post.types.reactions, `null`),
                            Markup.callbackButton('+', `build_sel|reaction|plus`),
                        ],
                        [
                            Markup.callbackButton(ctx.i18n.t('link'), 'null'),
                            Markup.callbackButton('-', `build_sel|link|minus`),
                            Markup.callbackButton(post.types.links, `null`),
                            Markup.callbackButton('+', `build_sel|link|plus`),
                        ],
                        [
                            Markup.callbackButton(ctx.i18n.t('statistic'), 'null'),
                            Markup.callbackButton(typesConsts.text[post.types.stats], `build_sel|stats`),
                        ],
                        [
                            Markup.callbackButton('Отменить', 'build_remove'),
                            Markup.callbackButton('Начать', `build_start`),
                        ],
                    ]).extra()
                );
            } catch (e) {
                console.error(e);
                return ctx.reply(e.toString());
            }
        });

        // Ввод элементов для поста
        bot.action(/^build_start/, async (ctx) => {
            try {
            } catch (e) {
                console.error(e);
                return ctx.reply(e.toString());
            }
        });

        // Очистка поста
        bot.action(/^build_remove/, async (ctx) => {
            try {
                await Post.remove({
                    userId: ctx.update.callback_query.from.id,
                    isSending: false,
                });

                return ctx.reply(ctx.i18n.t('buySection'), Markup
                    .keyboard([
                        [`🔍 ${ctx.i18n.t('channelForCompare')}`, `🏗 ${ctx.i18n.t('builder')}`],
                        [`️️🏦 ${ctx.i18n.t('advertising')}`, `⬅️ ${ctx.i18n.t('back')}`],
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

        bot.on('photo', async (ctx) => {
            try {
                console.log(ctx.session);
                if (!ctx.session || !ctx.session.type || ctx.session.type !== 'build_post') {
                    return ctx.reply(ctx.i18n.t('greeting'), Markup
                        .keyboard([
                            [`🤝 ${ctx.i18n.t('sellAdvertising')}`, `🚀 ${ctx.i18n.t('advertisingPurchase')}`],
                            [`☸ ${ctx.i18n.t('statistic')}`],
                        ])
                        .oneTime()
                        .resize()
                        .extra()
                    );
                }

                const post = await Post.findOne({ userId: ctx.message.from.id });
                post.photo = ctx.message.photo;
                await post.save();

                ctx.session.type = 'build_post';

                return ctx.reply('photo_added', Markup
                    .keyboard([
                        [`✏️ ${ctx.i18n.t('text')}`, `⚡️ ${ctx.i18n.t('reaction')}`, `🎹 ${ctx.i18n.t('button')}`],
                        [`🏞 ${ctx.i18n.t('view')}`, `❌ ${ctx.i18n.t('clear')}`, `🕊 ${ctx.i18n.t('send')}`],
                        [`⬅️ ${ctx.i18n.t('back')}`],
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

        // Предпросмотр
        bot.hears(/^🏞 /, async (ctx) => {
            try {
                ctx.session.type = 'build_post';

                const post = await Post.findOne({ userId: ctx.message.from.id });

                if (post.photo.length) {
                    return ctx.replyWithPhoto(post.photo[0].file_id,
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
            } catch (e) {
                console.error(e);
                return ctx.reply(e.toString());
            }
        });

        bot.on('text', async (ctx) => {
            try {
                console.log('input text params', ctx.session);
                if (ctx.session && ctx.session.type && ctx.session.type === 'build_post' && ctx.session.newElemType) {
                    ctx.session.type = 'build_post';

                    const post = await Post.findOne({ userId: ctx.message.from.id });

                    switch (ctx.session.newElemType) {
                        case 'button':
                            const messageParams = ctx.message.text.split('|');
                            if (messageParams.length > 1) {
                                post.buttons.push(Markup.urlButton(messageParams[0], messageParams[1]));
                            }
                            break;
                        case 'text':
                            post.text = ctx.message.text;
                            break;
                    }

                    await post.save();

                    return ctx.reply(ctx.session.newElemType,
                        Markup
                        .keyboard([
                            [`🖊 ${ctx.i18n.t('text')}`, `⚡️ ${ctx.i18n.t('reaction')}`, `🎹 ${ctx.i18n.t('button')}`],
                            [`🏞 ${ctx.i18n.t('view')}`, `❌ ${ctx.i18n.t('clear')}`, `🕊 ${ctx.i18n.t('send')}`],
                            [`⬅️ ${ctx.i18n.t('back')}`],
                        ])
                        .oneTime()
                        .resize()
                        .extra()
                    );
                }
            } catch (e) {
                console.error(e);
                ctx.reply(e.toString());
            }
        });
    }
}
