import express from 'express';
import cors from 'cors';
import { APP_PORT } from './constants';
import bodyParser from 'body-parser';
import { initializeBot } from './bot';

initializeBot();

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

app.listen(APP_PORT, () => console.log(`Zipkey Backend listening on port ${APP_PORT}`));