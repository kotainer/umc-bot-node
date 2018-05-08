import Markup from 'telegraf/markup';

export class CommandStart {
    constructor (bot) {
        bot.start((ctx) => {
            const greeting = ctx.i18n.t('greeting');
            const buy = ctx.i18n.t('advertisingPurchase');
            const sell = ctx.i18n.t('sellAdvertising');
            const stat = ctx.i18n.t('statistic');

            return ctx.reply(greeting, Markup
                .keyboard([
                    [`👤 ${sell}`, `🚀 ${buy}`],
                    [`☸ ${stat}`]
                ])
                .oneTime()
                .resize()
                .extra()
            )
        })
    }
};
