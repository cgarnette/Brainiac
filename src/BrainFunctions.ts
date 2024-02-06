import { ArticleData, extract } from '@extractus/article-extractor'
import { discordConnector } from './discordConnector';

const { postErrorNotification } = discordConnector;

interface GetWeatherArgs {
    city: string;
    state: string;
    country: string;
    metric: boolean;
}

interface GetArticleText {
    url: string
}

export const getWeather = (args: GetWeatherArgs) => {

};

export const getArticleContent = async (args: GetArticleText): Promise<ArticleData | null> => {
    console.log("Parsing Article")
    const parsedArticle = await extract(args.url);
    console.log("Article Parsed!");
    if (parsedArticle !== null) {
        console.log("Successfully done!");
        return parsedArticle;
    } else {
        console.error('Something went wrong parsing article: ', args.url);
        // console.error(parsedArticle)
        // postErrorNotification('Something went wrong parsing article: ' + args.url);
    }

    return null;
};