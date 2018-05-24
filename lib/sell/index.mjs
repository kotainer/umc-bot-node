import Markup from 'telegraf/markup';
import { MyChannelList } from './channelList.mjs';
import { SellSettings } from './settings.mjs';
import { SellProfile } from './profile.mjs';

export class SellHears {
    constructor(bot, client) {
        // Раздел рекламодателя
        bot.hears(/🤝 /g, (ctx) => {
            const sellSection = ctx.i18n.t('sellSection');
            const wallets = ctx.i18n.t('wallets');
            const channels = ctx.i18n.t('myChannels');
            const settings = ctx.i18n.t('settings');
            const back = ctx.i18n.t('back');

            return ctx.reply(sellSection, Markup
                .keyboard([
                    [`💵 ${wallets}`, `🔑 ${channels}`],
                    [`️️⚙️ ${settings}`, `⬅️ ${back}`],
                ])
                .oneTime()
                .resize()
                .extra()
            );
        });

        new MyChannelList(bot);
        new SellSettings(bot);
        new SellProfile(bot);
    }
}
