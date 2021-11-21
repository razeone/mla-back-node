import { get } from 'https';

import { app, redisClient } from './app.js';
import { URL } from './config.js';

const client = redisClient;


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
                        let parsed_result = parseResult(result);
                        res.send(parsed_result);
                        client.set(finalUrl, JSON.stringify(parsed_result));
                    }).on('error', (error) => {
                        console.error(error);
                    });
                });
            }

        });
    } catch(err) {
        console.log(err);
    }

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

