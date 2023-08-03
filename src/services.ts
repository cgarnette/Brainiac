import * as xml2js from 'xml2js';
import { getAiResponse } from "./aiIntegration";

const MAX_ARTICLES_PER_SOURCE = 5;
const MAX_ARTICLES = 3;

type Feed = {
    rss: {
        $: any;
        channel: {
            0: {
                item: {
                    title: string[];
                    link: string[];
                    'dc:creator': any;
                    category: any;
                    description: string[];
                    pubDate: any;
                    guid: any;
                }[];
            }
        }
    }
}

type ParsedArticle = { 
    description: string, 
    title: string; 
    link: string 
};


export const parseFeedForArticles = async (feedAddress: string) => {
    const businessFeedXml = await fetch(feedAddress).then((response) => response.text());

    const parsedFeed: ParsedArticle[] = []

    xml2js.parseString(businessFeedXml, (err: any, result: Feed) => {
        if(err) {
          throw err; 
        }

        result.rss.channel[0].item.forEach((article) => {
            if (article.link[0].includes('kill-the-newsletter')) return;

            parsedFeed.push({
            description: article.description[0],
            title: article.title[0],
            link: article.link[0]
        });
      });
    });

    return parsedFeed;
};

export const reduceAndDiversifyArticles = (articles: ParsedArticle[]) => {
    const sources: { [x: string]: ParsedArticle[]} = {};

    // We want to know which news source is producing which articles
    articles.forEach((article) => {
        const source = article.link.split('.com')[0];

        if (sources[source]) {
            sources[source].push(article);
        } else {
            sources[source] = [article];
        }

    });

    const selectedArticles: ParsedArticle[] = [];

    Object.keys(sources).forEach((sourceKey) => {
        const source = sources[sourceKey];

        let sourceArticleCount = 0;

        while(sourceArticleCount < MAX_ARTICLES_PER_SOURCE && sourceArticleCount < source.length) {
            const randomIndex = Math.floor(Math.random() * source.length);
            selectedArticles.push(source[randomIndex]);
            sourceArticleCount ++;
        };
    });

    const articlesToKeep = [];
    const articleIndices = new Set();

    let emergencyCounter = 0;

    while (articleIndices.size < MAX_ARTICLES && emergencyCounter < MAX_ARTICLES) {
        const randomIndex = Math.floor(Math.random() * selectedArticles.length);

        if (!articleIndices.has(randomIndex)) {
            articlesToKeep.push(selectedArticles[randomIndex]);
        }
        emergencyCounter ++;
    }
    return articlesToKeep
};

export const prepArticlesForDiscord = async (articles: ParsedArticle[]): Promise<string[]> => {

    const header = await getAiResponse('I need a 1 to 3 word header letting people know their daily articles are ready to be read. Something like: "Fresh Articles!" or "Here Educate Yourself". Something like that, snarky words and sarcasm are encouraged but not necessary. Remember 1 to 3 words. Please present me with a single header');

    let message = [`# ${header.content?.replace(/"/g, '')}`];

    articles.forEach((article) => {
        message.push(`### [${article.title}](${article.link})
        ${article.description}
        `)
    });

    return message;
};