import express from 'express';
import { get } from 'https';
import cors from 'cors';

let app = express();
app.use(cors());

const port = process.env.port || 3001;
const url = 'https://api.mercadolibre.com/sites/MLA/search';
let cacheObj = {};

app.get('/api/search', (req, res) => {
    let finalUrl = buildUrl(req.query.query, req.query.sort, req.query.filter)
    let result = '';
    res.set('Content-Type', 'application/json');

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
                cacheObj[finalUrl] = parseResult(result)
                res.send(cacheObj[finalUrl]);
            }).on('error', (err) => {
                console.error(err);
            });
        });
    }
});

function buildUrl(query, sortOption, filter) {
    query = (query) ? '?q=' + query  : '?q=""'
    sortOption = (sortOption) ? '&sort=' + sortOption : ''
    filter = (filter) ? '&ITEM_CONDITION=' + filter : ''
    return url + query + sortOption + filter;
}

function parseResult(result) {
    let jsonResult = JSON.parse(result).results;
    let finalResult = jsonResult.map(element => {
        let objTemplate = {
            'id': element.id,
            'title': element.title,
            'price': element.price,
            'currency_id': element.currency_id,
            'available_quantity': element.available_quantity,
            'thumbnail': element.thumbnail,
            'condition': element.condition
        }
        return objTemplate
    })
    return finalResult;
}

app.listen(port, () => {
    console.log('Listening on port ' + port);
});

