import { TextChannel } from 'discord.js';
import { ARTICLE_SUMMARY_WORD_LIMIT, articleMapping as channelMapping, channels } from '../constants';
import { discordConnector } from '../discordConnector';
import cron from 'cron';
import { ParsedArticle, parseFeedForArticles, prepArticlesForDiscord, reduceAndDiversifyArticles } from './services';
import crypto from 'crypto';
import ArticlesData from '../../data/articles.json';
import * as fs from 'fs';
import { getAiResponse } from '../aiIntegration';
import { getArticleContent } from '../BrainFunctions';
import axios from 'axios';

const { client, postErrorNotification } = discordConnector;

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

const Articles: ArticlesDb = {
    ...ArticlesData
};

const job = new cron.CronJob('30 15 * * *', async () => {
    try {
        Object.keys(channelMapping).forEach(async (channel) => {
            const today = new Date().getDay();

            if (channelMapping[channel].releaseDays.includes(today)) {
                await executeDiscordArticleFlow(channel);
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

export const executeBrainiacArticleFlow = async (channelId: string) => {
    const articles = await getArticlesFromFeed(channelId) || [];
    const category = channelMapping[channelId].category;

    articles.forEach(async (article) => await sendArticleToBrainStore(article, category));
};

export const sendArticleToBrainStore = async (article: ParsedArticle, category: string) => {

    const articleData = await getArticleContent({ url: article.link })

    console.log(articleData);

    // axios.post('http://10.147.19.181:8082/documents/add/html', {
    //     source: article.link,
    //     category: category,
    //     text: articleText,
    //     metadata: {
    //         subs: [],
    //         author: "",
    //         publish_date: "",
    //         media_type: "article"
    //     }
    // })
}


/// FOR DISCORD //////
export const executeDiscordArticleFlow = async (channelId: string) => {
    const articles = await getArticlesFromFeed(channelId) || [];
    const category = channelMapping[channelId].category

    articles.forEach((article) => persistParsedArticle(article, category));
    await sendArticlesToDiscord(articles, channelId);
}

export const persistParsedArticle = async (article: ParsedArticle, category: string) => {
    const prompt = `Hi, please read the following article and summarize it for future ai such as yourself. I would like another ai to be able to read this summary and be able to gather all the key information that was present in this article. Please try to include major themes, people, places, actions, outcomes, buzzwords and key take aways. please try to do so in ${ARTICLE_SUMMARY_WORD_LIMIT} words or less.`;
    const summary = await getArticleContent({ url: article.link })
        .then(async (articleData) => {
            return (await getAiResponse(`${prompt} Article: ${article.title}: ${articleData?.content}`)).content as string;
        })
        .catch((e) => {
            // console.error('Unable to get a summary', e);
            return `Article: ${article.title}: ${article.description}`;
        });

    addArticleToDb(category, article, summary);
    saveToFile();
};

export const getArticlesFromFeed = async (channelId: string) => {
    const feedUrl = channelMapping[channelId] || channelMapping[channels.aotd];
    if (!feedUrl) return;

    return await parseFeedForArticles(feedUrl.link)
        .then(async (allArticles) => reduceAndDiversifyArticles(allArticles))
        .catch((e) => postErrorNotification(e))
};

export const sendArticlesToDiscord = async (selectedArticles: ParsedArticle[], channelId: string) => {
    const channel = await client.channels.fetch(channelId) as TextChannel;
    const category = channelMapping[channelId].category;
    const articleMessageQueue = await prepArticlesForDiscord(selectedArticles);

    articleMessageQueue.forEach(async (message, index) => {
        const sentMessage = await channel.send(message);
        sentMessage
            .createReactionCollector({ filter: () => true, max: 20, time: 60000 * 60 * 24 })
            .on('collect', (reaction) => {
                if (reaction.emoji.name === '👍' && index > 0) {
                    incrementArticleScore(category, selectedArticles[index - 1]);
                } else if (reaction.emoji.name === '👎' && index > 0) {
                    decrementArticleScore(category, selectedArticles[index - 1]);
                }
                saveToFile();
            });
    });
};

//////////////////////////////////////////////////////////////////////

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

const incrementArticleScore = (category: string, article: ParsedArticle) => {
    const articleId = crypto.createHash('sha256').update(article.link).digest('hex');
    Articles[category][articleId].rating += 1;
};

const decrementArticleScore = (category: string, article: ParsedArticle) => {
    const articleId = crypto.createHash('sha256').update(article.link).digest('hex');
    Articles[category][articleId].rating -= 1;
};

const saveToFile = async () => {
    return fs.writeFileSync('data/articles.json', JSON.stringify(Articles));
};