import express from 'express';
import cors from 'cors';

export const app = express();

// enable cors
app.use(cors());
app.options('*', cors());
