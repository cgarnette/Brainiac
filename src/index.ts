import { Client, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';
import { Configuration, OpenAIApi } from 'openai';


dotenv.config();

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;
const guildId = process.env.DISCORD_GUILD_ID;

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ] 
});


// OpenAI configuration creation
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
// OpenAI instance creation
const openai = new OpenAIApi(configuration);

client.once('ready', () => {
  console.log('Bot is ready!');
});

client.login(token);

client.on('messageCreate', async (message) => {

    if (message.author.bot) {
        return;
    }

    const text = message.content;
    await openai.createCompletion({
        model: 'gpt-3.5-turbo',
        prompt: text
    })
    .then((response) => {
        if (!response.data) {
            throw new Error(response.statusText);
        } else {
            message.reply(response.data.choices[0].text as string);
        }
    })
    .catch((e) => {
        console.error('Error: ', e);
        message.reply('Unable to process your query. Please try again');
    })
});