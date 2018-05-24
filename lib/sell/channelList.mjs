import User from '../../models/user';

export class MyChannelList {
    constructor(bot) {
        // Cписок моих каналов
        bot.hears(/🔑 /g, async (ctx) => {
            let result = ctx.i18n.t('yourChannels');

            const user = await User.findById(ctx.message.from.id);

            if (!user) {
                return ctx.reply(ctx.i18n.t('yourEmptyChannels'));
            }

            let number = 1;

            for (const channel of user.channels) {
                result += `\n${number}. ${channel.title}`;
                number++;
            }

            return ctx.reply(result);
        });
    }
}
