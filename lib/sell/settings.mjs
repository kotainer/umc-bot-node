import User from '../../models/user';
import Markup from 'telegraf/markup';

export class SellSettings {
    constructor(bot) {
        // Настройки рекламодателя
        bot.hears(/⚙️ /g, async (ctx) => {
            const caption = ctx.i18n.t('sellSectionSettings');
            const setPrice = ctx.i18n.t('setPostPrice');
            const profile = ctx.i18n.t('profile');

            const back = ctx.i18n.t('back');

            return ctx.reply(caption, Markup
                .keyboard([
                    [`💰 ${setPrice}`],
                    [`👤 ${profile}`, `⬅️ ${back}`],
                ])
                .oneTime()
                .resize()
                .extra()
            );
        });

        // Установка цены за пость
        bot.hears(/💰 /g, async (ctx) => {
            const sellSection = ctx.i18n.t('setPriceCaption');
            ctx.session.action = 'setChannelPostPrice';

            return ctx.reply(`💰 ${sellSection}`);
        });

        // Ввод цены за пост
        bot.hears(/^\d+$/, async (ctx) => {
            const caption = ctx.i18n.t('selecetChannelForSetPrice');

            if (!ctx.session.action || ctx.session.action !== 'setChannelPostPrice') {
                return ctx.reply(ctx.i18n.t('unsipportedAction'));
            }

            ctx.session.price = Number.parseInt(ctx.message.text);

            const user = await User.findById(ctx.message.from.id);

            if (!user) {
                return ctx.reply(ctx.i18n.t('yourEmptyChannels'));
            }

            const list = [];

            for (const channel of user.channels) {
                list.push(Markup.callbackButton(channel.title, `set_price|${channel.username}`));
            }

            if (list.length) {
                return ctx.reply(caption,
                    Markup.inlineKeyboard(list).extra()
                );
            } else {
                return ctx.reply(ctx.i18n.t('emptyList'));
            }
        });

        // Сохранение цены
        bot.action(/^set_price/, async (ctx) => {
            try {
                const prevParams = ctx.update.callback_query.data;
                const username = prevParams.split('|')[1];

                const user = await User.findOne({
                    'channels.username': username,
                });

                if (!user) {
                    return ctx.reply(ctx.i18n.t('unsipportedAction'));
                }

                const channel = user.channels.find((el) => el.username === username);
                channel.price = ctx.session.price;

                await User.update({ _id: user._id }, user);

                return ctx.reply(`${ctx.i18n.t('succesSetPrice1')}"${channel.title}"(@${channel.username})${ctx.i18n.t('succesSetPrice2')}`);
            } catch (e) {
                console.error(e);
                ctx.reply(e.toString());
            }
        });
    }
}
