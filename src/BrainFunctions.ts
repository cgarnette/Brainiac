import axios from "axios";
import { extract, extractFromHtml } from '@extractus/article-extractor'
import { discordConnector } from './discordConnector';

const { client, postErrorNotification } = discordConnector;

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

export const getArticleText = async (args: GetArticleText): Promise<string> => {
    const parsedArticle = await axios.get(args.url, {maxRedirects: 10}).then((response) => extractFromHtml(response.data));

    if (parsedArticle?.content) {
        return parsedArticle.content;
    } else {
        console.error('Something went wrong parsing article: ', args.url);
        postErrorNotification('Something went wrong parsing article: ' + args.url);
    }

    return '';
};

const url = 'https://www.psychologytoday.com/intl/blog/fixing-families/202304/why-do-so-many-couples-divorce-after-8-years';

getArticleText({url});
// console.log(extract(url))