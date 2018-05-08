import Telegraf from 'telegraf';
import TelegrafI18n from 'telegraf-i18n';
import Extra from 'telegraf/extra';
import Markup from 'telegraf/markup';
import path from 'path';

import { CommandStart } from './commands/start';

export class UmcBot {
    constructor() {
        this.bot = new Telegraf('575744875:AAGT-mcfjpuiOhQuk3WtD7Pdomd8sSMeP0o');

        const i18n = new TelegrafI18n({
            defaultLanguage: 'en',
            allowMissing: true,
            directory: path.resolve('./', 'locales')
        })

        this.bot.use(Telegraf.log());
        this.bot.use(i18n.middleware());

        //init all commands
        new CommandStart(this.bot);        

        this.bot.startPolling();
    }

};
