import { get } from 'https';
import redis from 'redis';

import { app } from './app.js';
import { PORT, URL } from './config.js';

const client = redis.createClient(6379, '127.0.0.1'); //creates a new client

client.on('connect', () => {
    console.log('connected');
});

client.on("error", (err) => {
    console.log(err);
});
// TODO: Refactor this object into a redis cache
let cacheObj = {};

app.get('/api/search', (req, res) => {
    let finalUrl = buildUrl(req.query.query, req.query.sort, req.query.filter)
    let result = '';
    res.set('Content-Type', 'application/json');

    try{
        client.get(finalUrl, async (err, results) => {
            if (err) throw err;
            
            if(results){
                console.log('cache hit');
                res.send(JSON.parse(results));
            }
            else{
                console.log('cache miss');
                get(finalUrl, (resp) => {
                    resp.on('data', (chunk) => {
                        result += chunk;
                    });
                    resp.on('end', () => {
                        cacheObj[finalUrl] = parseResult(result);
                        res.send(cacheObj[finalUrl]);
                        client.set(finalUrl, JSON.stringify(cacheObj[finalUrl]));
                    }).on('error', (error) => {
                        console.error(error);
                    });
                });
            }

        });
    } catch(err) {
        console.log(err);
    }

    /*
    if(cacheObj[finalUrl]) {
        console.log('Cache hit');

        res.send(cacheObj[finalUrl])
    } else {
	    console.log('Cache miss get the data');
        get(finalUrl, (resp) => {
            resp.on('data', (chunk) => {
                result += chunk;
            });
            resp.on('end', () => {
                cacheObj[finalUrl] = parseResult(result);
                res.send(cacheObj[finalUrl]);
                client.set(finalUrl, JSON.stringify(cacheObj[finalUrl]));
            }).on('error', (err) => {
                console.error(err);
            });
        });
    }
    */
});

function buildUrl(query, sortOption, filter) {
    query = (query) ? '?q=' + query  : '?q=""'
    sortOption = (sortOption) ? '&sort=' + sortOption : ''
    filter = (filter) ? '&ITEM_CONDITION=' + filter : ''
    return URL + query + sortOption + filter;
}

function parseResult(result) {
    return JSON.parse(result).results.map(element => {
        return {
            'id': element.id,
            'title': element.title,
            'price': element.price,
            'currency_id': element.currency_id,
            'available_quantity': element.available_quantity,
            'thumbnail': element.thumbnail,
            'condition': element.condition
        }
    });
}

app.listen(PORT, () => {
    console.log('Listening on port ' + PORT);
});
