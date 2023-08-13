import { Client, GatewayIntentBits, TextChannel } from 'discord.js';
import { getAiResponse } from './aiIntegration';
import { BOT_DISCORD_ID, BRANIAC_ARTICLE_TRIGGER, DISCORD_TOKEN, articleMapping as channelMapping, channels } from './constants';
import { sendArticlesToDiscordChannel, startArticleJob } from './services/channelArticles';

// Future Improvements:
// https://github.com/techleadhd/chatgpt-retrieval/blob/main/chatgpt.py
// https://python.langchain.com/docs/get_started/introduction.html
// https://beebom.com/how-train-ai-chatbot-custom-knowledge-base-chatgpt-api/

class DiscordConnector {
    client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent
        ]
    });

    postErrorNotification = async (errorObject: any) => {
        let log = `Brainiac Error Report: ${new Date()}`;
        if (typeof errorObject === 'string') {
            log += `\n\n${errorObject}`;
        } else {
            log += `\n\n${JSON.stringify(errorObject)}`;
        }

        const channel = await this.client.channels.fetch(channels.notifications) as TextChannel;
        channel.send(log);
    };
}

export const discordConnector = Object.freeze(new DiscordConnector());

const startBrainiacBot = async () => {
    const { client, postErrorNotification } = discordConnector;
    client.once('ready', () => {
        console.log('Brainiac is active!');
    });

    client.login(DISCORD_TOKEN);

    client.on('messageCreate', async (message) => {

        if (message.content === BRANIAC_ARTICLE_TRIGGER) {
            return sendArticlesToDiscordChannel(message.channelId);
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
                postErrorNotification(e);
            });
        
    });
};

export const initializeBot = () => {
    startBrainiacBot();
    startArticleJob();
};