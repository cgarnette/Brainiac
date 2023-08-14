import { Client, GatewayIntentBits, TextChannel } from 'discord.js';
import { channels } from './constants';

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