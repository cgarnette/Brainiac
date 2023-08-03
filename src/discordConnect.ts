import { Client, GatewayIntentBits, TextChannel } from 'discord.js';
import cron from 'cron';
import { getAiResponse } from './aiIntegration';
import { BOT_DISCORD_ID, BRANIAC_ARTICLE_TRIGGER, DISCORD_TOKEN, articleMapping as channelMapping, channels } from './constants';
import { parseFeedForArticles, prepArticlesForDiscord, reduceAndDiversifyArticles } from './services';

// Future Improvements:
// https://github.com/techleadhd/chatgpt-retrieval/blob/main/chatgpt.py
// https://python.langchain.com/docs/get_started/introduction.html
// https://beebom.com/how-train-ai-chatbot-custom-knowledge-base-chatgpt-api/

export const startBrainiacBot = async () => {
    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent
        ]
    });

    client.once('ready', () => {
        console.log('Bot is ready!');
    });

    client.login(DISCORD_TOKEN);

    client.on('messageCreate', async (message) => {

        if (message.content === BRANIAC_ARTICLE_TRIGGER) {
            const feedUrl = channelMapping[message.channelId] || channelMapping[channels.aotd];
            if (!feedUrl) return;

            const channel = await client.channels.fetch(channels.botDev) as TextChannel;

            const allArticles = await parseFeedForArticles(feedUrl.link);
            const selectedArticles = reduceAndDiversifyArticles(allArticles);
            const articlesMessage = await prepArticlesForDiscord(selectedArticles);

            articlesMessage.forEach((message) => channel.send(message));
            return;
        }

        if (message.author.bot || !message.mentions.users.has(BOT_DISCORD_ID)) {
            return;
        }

        await getAiResponse(message.content)
            .then((reply) => message.reply(reply))
            .catch((e) => {
                console.error('Error: ', e);
                message.reply('Unable to process your query. Please try again');
            });
        
    });

    const job = new cron.CronJob('30 8 * * *', async () => {
        Object.keys(channelMapping).forEach( async (channel) => {
            const today = new Date().getDay();

            if (channelMapping[channel].releaseDays.includes(today)) {
                const feedUrl = channelMapping[channel].link;

                const textChannel = await client.channels.fetch(channels.botDev) as TextChannel;

                const allArticles = await parseFeedForArticles(feedUrl);
                const selectedArticles = reduceAndDiversifyArticles(allArticles);
                const articlesMessage = await prepArticlesForDiscord(selectedArticles);

                articlesMessage.forEach((message) => textChannel.send(message));
            }
        });
    });

    job.start();
};