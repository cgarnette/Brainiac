import { Client, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';
import { Configuration, OpenAIApi } from 'openai';

// Future Improvements:
// https://github.com/techleadhd/chatgpt-retrieval/blob/main/chatgpt.py
// https://python.langchain.com/docs/get_started/introduction.html
// https://beebom.com/how-train-ai-chatbot-custom-knowledge-base-chatgpt-api/
dotenv.config();

const BOT_DISCORD_ID = "1129859810465173534"

const startBraniac = () => {
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

        if (message.author.bot || !message.mentions.users.has(BOT_DISCORD_ID)) {
            return;
        }

        const text = message.content;
        await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [
                { "role": "system", "content": "You are a helpful assistant named Braniac." },
                { "role": "user", "content": text },
            ]
        })
            .then((response) => {
                if (!response.data) {
                    throw new Error(response.statusText);
                } else {
                    if (response.data.choices[0].message) {
                        message.reply(response.data.choices[0].message);
                    } else {
                        throw new Error("No response message received");
                    }
                    
                }
            })
            .catch((e) => {
                console.error('Error: ', e);
                message.reply('Unable to process your query. Please try again');
            })
    });
};

startBraniac();

const runTest = async () => {
    const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
    });
    // OpenAI instance creation
    const openai = new OpenAIApi(configuration);

    const prompt = 'Please list all video games since 2000 that have included the incredible hulk';

    await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
            { "role": "system", "content": "You are a helpful assistant." },
            { "role": "user", "content": prompt },
        ]
    })
        .then((response) => {
            if (!response.data) {
                throw new Error(response.statusText);
            } else {
                console.log(response.data);
                console.log(JSON.stringify(response.data));
                console.log(response.data.choices[0].message);
            }
        })
        .catch((e) => {
            console.error('Error: ', e);
            // message.reply('Unable to process your query. Please try again');
        });
};


// runTest()
startBraniac();