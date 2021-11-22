import express from 'express';
import cors from 'cors';
import redis from 'redis';
import { PORT, REDIS_HOST, REDIS_PORT } from './config.js';

const getRedisClient = (host, port) => {
    return redis.createClient(port, host);
}

export const redisClient = getRedisClient(REDIS_HOST, REDIS_PORT);

redisClient.on('connect', () => {
    console.info('INFO: Redis connected');
});

redisClient.on("error", (err) => {
    console.error(err);
});

export const app = express();

// enable cors
app.use(cors());
app.options('*', cors());

app.listen(PORT, () => {
    console.info('INFO: Listening on port ' + PORT);
});
