import express from 'express';
import cors from 'cors';

const URL = 'https://api.mercadolibre.com/sites/MLA/search';

export const app = express();

// enable cors
app.use(cors());
app.options('*', cors());

