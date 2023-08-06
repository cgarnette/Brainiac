import { Client, GatewayIntentBits, TextChannel } from 'discord.js';
import cron from 'cron';
import { getAiResponse } from './aiIntegration';
import { BOT_DISCORD_ID, BRANIAC_ARTICLE_TRIGGER, DISCORD_TOKEN, articleMapping as channelMapping, channels } from './constants';
import { parseFeedForArticles, prepArticlesForDiscord, reduceAndDiversifyArticles } from './services/services';

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
        console.log('Brainiac is active!');

        const job = new cron.CronJob('30 15 * * *', async () => {
            try {
                Object.keys(channelMapping).forEach(async (channel) => {
                    const today = new Date().getDay();
        
                    if (channelMapping[channel].releaseDays.includes(today)) {
                        const { link: feedUrl } = channelMapping[channel];
        
                        const textChannel = await client.channels.fetch(channel) as TextChannel;
        
                        await parseFeedForArticles(feedUrl)
                            .then((allArticles) => {
                                const selectedArticles = reduceAndDiversifyArticles(allArticles);
                                return prepArticlesForDiscord(selectedArticles);
                            })
                            .then((articlesMessage) => {
                                articlesMessage.forEach((message) => textChannel.send(message));
                            })
                            .catch((e) => {
                                processError(e);
                                return;
                            }); 
                    }
                });
            } catch (e) {
                console.error('Error: ', e);
                processError(e);
            }
            
        });
    
        job.start();
    });

    client.login(DISCORD_TOKEN);

    client.on('messageCreate', async (message) => {

        if (message.content === BRANIAC_ARTICLE_TRIGGER) {
            const feedUrl = channelMapping[message.channelId] || channelMapping[channels.aotd];
            if (!feedUrl) return;

            const channel = await client.channels.fetch(message.channelId) as TextChannel;

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
            .then((aiResponse) => {
                const reply = aiResponse.content as string;
                const partCount = Math.ceil(reply.length / 1500);
                for (let i = 0; i < partCount; i ++) {
                    message.reply(reply.substring(i * 1500, (i * 1500) + 1500));
                }
            })
            .catch((e) => {
                console.error('Error: ', e);
                message.reply('Unable to process your query. Please try again');
                processError(e);
            });
        
    });

    const processError = async (errorObject: any) => {
        let log = `Brainiac Error Report: ${new Date()}`;
        if (typeof errorObject === 'string') {
            log += `\n\n${errorObject}`;
        } else {
            log += `\n\n${JSON.stringify(errorObject)}`;
        }

        const channel = await client.channels.fetch(channels.notifications) as TextChannel;
        channel.send(log);

    };
};
