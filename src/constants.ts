import dotenv from 'dotenv';
dotenv.config();

export const APP_PORT = process.env.APP_PORT || 3005;
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY
export const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
export const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
export const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID;
export const BOT_DISCORD_ID = "1129859810465173534";
export const channels = {
    notifications:'1135638120734404721',
    botDev: '1135638161364627486',
    cooking: '689260053156593688',
    shopping: '691511889666244648',
    drinks: '697475774072094801',
    nonsense: '688921518218281000',
    theshallows: '759921280979435531',
    adventure: '929465922123612230',
    homecoming: '884869573294309416',
    housing: '813914020834050068',
    projectSwole: '795667060516061194',
    mentalWealth: '828812423049510942',
    getmoney: '804100228386521118',
    xbox: '688921157516525843',
    stardew: '1135286177444933713',
    valheim: '1135635385498751126',
    aotd: '1133097028470198383',
    music: '688923816549810199',
    books: '827562646135504946',
    sports: '756303813371101345',
    podcast: '689306522823426072',
    tvMovie: '694362284079972462'
};

export const feeds = {
    psychology: 'https://feeds.qservices.io/i/?a=rss&get=c_2&rid=64cae797188ce&hours=168',
    business: 'https://feeds.qservices.io/i/?a=rss&get=c_3&rid=64cae872ee738&hours=168',
    sports: 'https://feeds.qservices.io/i/?a=rss&get=c_5&rid=64cae7e8c192f&hours=168',
    top: 'https://feeds.qservices.io/i/?a=rss&get=c_7&rid=64cae849080d1&hours=168',
    technology: 'https://feeds.qservices.io/i/?a=rss&get=c_6&rid=64cae82fd8859&hours=168',
    travel: 'https://feeds.qservices.io/i/?a=rss&get=c_8&rid=64cb12402d5b0&hours=168',
    gaming: '',
    entertainment: ''
}

export const articleMapping = {
    [channels.sports]: {
        link: feeds.sports,
        releaseDays: [2, 5],
        category: 'sports'
    },
    [channels.aotd]: {
        link: feeds.business,
        releaseDays: [1, 4],
        category: 'business'
    },
    [channels.getmoney]: {
        link: feeds.business,
        releaseDays: [1, 3, 5],
        category: 'business'
    },
    [channels.xbox]: {
        link: feeds.gaming,
        releaseDays: [],
        category: 'gaming'
    },
    [channels.tvMovie]: {
        link: feeds.entertainment,
        releaseDays: [0, 2, 4, 6],
        category: 'entertainment'
    },
    [channels.mentalWealth]: {
        link: feeds.psychology,
        releaseDays: [0, 4],
        category: 'psychology'
    },
    [channels.adventure]: {
        link: feeds.travel,
        releaseDays: [6],
        category: 'adventure'
    },
    [channels.botDev]: {
        link: feeds.business,
        releaseDays: [],
        category: 'business'
    }
};

export const BRANIAC_ARTICLE_TRIGGER = 'Hey Brainiac, What News do you have!';

export const GPT_MODELS = {
    gpt3: {
        model: 'gpt-3.5-turbo',
        purpose: 'Use this for most calls. Cheapest and handles most queries fine'
    },
    gpt4: {
        model: 'gpt-4',
        purpose: 'More advanced/expensive. I would use this for generating internal text, like summaries to be reviewed by ai later'
    },
    gpt3Expanded: {
        model: 'gpt-3.5-turbo-16k',
        purpose: 'Same as gpt3 but handles more text. Perhaps better used for parsing articles'
    },
    gpt4Expanded: {
        model: 'gpt-4-32k',
        purpose: 'Same as gpt4, twice as much context as gpt3Expanded. Use for reviewing long documents'
    },
    gpt3Functions: {
        model: 'gpt-3.5-turbo-0613',
        purpose: 'gpt3 but with the ability to call functions. Use internal to app'
    },
    gpt4Functions: {
        model: 'gpt-4-0613',
        purpose: 'gpt4 but with the ability to call functions. Use internal to app. Use for more sophisticated tasks'
    },
    davinci: {
        model: 'text-davinci-003',
        purpose: ''
    }
};

export const ARTICLE_SUMMARY_WORD_LIMIT = 300;