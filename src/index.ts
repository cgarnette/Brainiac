import express from 'express';
import cors from 'cors';
import { APP_PORT } from './constants';
import bodyParser from 'body-parser';
import { initializeBot } from './bot';
import { getArticleContent } from './BrainFunctions';

// initializeBot();

const app = express();
app.use(cors())
app.use( bodyParser.json() ); 
app.use(express.json({ limit: '50mb' }));

app.get('/', (_req, res) => res.send('Connected!'));

app.post('/webhook', (req, res) => {

    console.log('webhook hit!')

    console.log(req.body);

    res.send('ok');
});

app.post('/article/parse', async (req, res) => {
    const articleUrl = req.body.url;
    const articleData = await getArticleContent({ url: articleUrl });

    console.log('data', articleData);

    res.send(articleData);
});

app.listen(APP_PORT, () => console.log(`Zipkey Backend listening on port ${APP_PORT}`));