import Markup from 'telegraf/markup';
import { CompareChannel } from './compare.mjs';
import { PostBuilder } from './builder.mjs';

export class BuyHears {
    constructor(bot) {
        // Раздел покупателя
        bot.hears(/🚀 /g, (ctx) => {
            try {
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
                return ctx.reply(e.toString());
            }
        });

        new CompareChannel(bot);
        new PostBuilder(bot);
    };
}
