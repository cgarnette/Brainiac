import { getAiResponse } from "./aiIntegration";
import { BOT_DISCORD_ID, BRANIAC_ARTICLE_TRIGGER, DISCORD_TOKEN } from "./constants";
import { discordConnector } from "./discordConnector";
import { sendArticlesToDiscordChannel, startArticleJob } from "./services/channelArticles";

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