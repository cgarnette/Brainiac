import { TextChannel } from 'discord.js';
import { BOT_DISCORD_ID, BRANIAC_ARTICLE_TRIGGER, DISCORD_TOKEN, articleMapping as channelMapping, channels } from '../constants';
import { discordConnector } from '../discordConnector';
import cron from 'cron';
import { ParsedArticle, parseFeedForArticles, prepArticlesForDiscord, reduceAndDiversifyArticles } from './services';
import crypto from 'crypto';
import * as ArticlesData from '../../data/articles.json';
import * as fs from 'fs';
import { getAiResponse } from '../aiIntegration';
import { getArticleText } from '../BrainFunctions';

const { client, postErrorNotification } = discordConnector;

const job = new cron.CronJob('30 15 * * *', async () => {
    try {
        Object.keys(channelMapping).forEach(async (channel) => {
            const today = new Date().getDay();

            if (channelMapping[channel].releaseDays.includes(today)) {
                await sendArticlesToDiscordChannel(channel);
            }
        });
    } catch (e) {
        console.error('Error: ', e);
        postErrorNotification(e);
    }

    saveToFile();
});

export const startArticleJob = () => {
    job.start();
};

export const sendArticlesToDiscordChannel  = async (channelId: string) => {
    const feedUrl = channelMapping[channelId] || channelMapping[channels.aotd];
    if (!feedUrl) return;

    const channel = await client.channels.fetch(channelId) as TextChannel;

    await parseFeedForArticles(feedUrl.link)
        .then((allArticles) => {
            const selectedArticles = reduceAndDiversifyArticles(allArticles);
            selectedArticles.forEach(async (article) => {
                const prompt = 'Hi, please read the following article and summarize it for future ai such as yourself. I would like another ai to be able to read this summary and be able to gather all the key information that was present in this article. Please try to include major themes, people, places, actions, outcomes, buzzwords and key take aways. please try to do so in 700 words or less.';
                const articleText = await getArticleText({ url: article.link });
                const summary = (await getAiResponse(`${prompt} Article: ${article.title}: ${articleText}`)).content as string;

                addArticleToDb(channelMapping[channelId].category, article, summary);

                const articlesMessage = await prepArticlesForDiscord(selectedArticles);
                articlesMessage.forEach((message) => channel.send(message));
            });
        })
        .catch((e) => {
            postErrorNotification(e);
            return;
        }); 
};

const addArticleToDb = (category: string, article: ParsedArticle, summary: string) => {
    const articleId = crypto.createHash('sha256').update(article.link).digest('hex');
    Articles[category] = {
        ...Articles[category],
        [articleId]: {
            url: article.link,
            rating: 0,
            votes: {},
            aiReadableSummary: summary
        }
    }
};

const saveToFile = async () => {
    return fs.writeFileSync('../../articles.json', JSON.stringify(Articles));
};

type ArticlesDb = {
    [category: string]: { // this should correspond to the categories we have listed elsewhere for articles and channels
        // This way we aren't looking through all the articles everytime it's time to post
        [articleId: string]: { // Maybe articleId is a hash made from the title of the article
            url: string;
            rating: number; // score based on votes
            votes: {// If a user liked the article then +1 if the disliked the article then -1. Simple
                [userId: string]: 1 | -1 // userId is the discord id of a user 
            }
            aiReadableSummary: string; // This should be a summary of the article that ai generates. 
            // The summary should be generated with key points, buzz words, themes and takeaways. A maximum of 500 words. 
            // Ai should be able to review this instead of rereading the full article.
        }
    }
};

const Articles: ArticlesDb = {};