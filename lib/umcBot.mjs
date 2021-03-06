import Telegraf from 'telegraf';
import Telegram from 'telegraf/telegram';
import session from 'telegraf/session';
import TelegrafI18n from 'telegraf-i18n';
import path from 'path';
import config from 'config';

import { CommandStart } from './commands/start';
import { ChannelsActions } from './channels/index.mjs';
import { SellHears } from './sell/index.mjs';
import { BuyHears } from './buy/index.mjs';

export class UmcBot {
    constructor() {
        this.bot = new Telegraf(config.get('token'));

        this.telegram = new Telegram(config.get('token'));

        const i18n = new TelegrafI18n({
            defaultLanguage: 'en',
            allowMissing: true,
            directory: path.resolve('./', 'locales'),
        });

        this.bot.use(Telegraf.log());
        this.bot.use(i18n.middleware());
        this.bot.use(session());

        // init all commands
        new CommandStart(this.bot);

        // init all hears
        new SellHears(this.bot, this.telegram);
        new BuyHears(this.bot, this.telegram);

        new ChannelsActions(this.bot, this.telegram);

        this.bot.catch((err) => {
            console.error(err);
        });

        this.bot.on('text', async (ctx, next) => {
            return ctx.reply('Неизвестное действие');
        });

        this.bot.action(/.+/, (ctx) => {
            return ctx.reply('Неизвестное действие');
        });

        this.bot.startPolling();
    }
}
