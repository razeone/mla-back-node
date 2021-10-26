import { get } from 'https';
import { app } from './app.js';


const PORT = process.env.port || 3001;
const URL = 'https://api.mercadolibre.com/sites/MLA/search';
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
