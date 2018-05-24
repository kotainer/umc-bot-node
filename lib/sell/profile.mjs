import User from '../../models/user';
import Markup from 'telegraf/markup';

export class SellProfile {
    constructor(bot) {
        // Профиль рекламодателя
        bot.hears(/👤 /g, async (ctx) => {
            const user = await User.findById(ctx.message.from.id);
            let result = `👤 ${ctx.message.from.id}\n💰 \n`;
            if (!user) {
                return ctx.reply(ctx.i18n.t('yourEmptyChannels'));
            }

            for (const channel of user.channels) {
                result += `${channel.title}: ${channel.price}\n`;
            }

            const setPrice = ctx.i18n.t('setPostPrice');
            const profile = ctx.i18n.t('profile');
            const back = ctx.i18n.t('back');

            return ctx.reply(result, Markup
                .keyboard([
                    [`💰 ${setPrice}`],
                    [`👤 ${profile}`, `⬅️ ${back}`],
                ])
                .oneTime()
                .resize()
                .extra()
            );
        });
    }
}
