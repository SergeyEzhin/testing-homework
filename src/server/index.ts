import express from 'express';
import { router } from './routes';
require('dotenv').config()

const port = Number(process.env.PORT) || 3000;
const basename = '/hw/store';

const app = express();

app.use(express.json());
app.use(basename, router);
app.use(basename, express.static('dist'));

app.listen(port, '::', () => {
    console.log(`Example app listening at http://localhost:${port}${basename}`);
});