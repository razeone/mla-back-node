import express from "express";
import { get } from "https";
import cors from "cors";

let app = express();
app.use(cors());

const port = 3001
const url = "https://api.mercadolibre.com/sites/MLA/search?q=";

app.listen(port, () => {
    console.log('Listening on port ' + port);
});

app.get("/api/search", (req, res, next) => {
    let query = req.query.query;
    let result = '';
    get(url + query, (resp) => {
        resp.on('data', (chunk) => {
            result += chunk;
        });
        resp.on('end', () => {
            res.set('Content-Type', 'application/json');
            res.send(parseResult(result));
        }).on("error", (err) => {
            console.error(err);
        });
    });
});

function parseResult(result) {
    let json_result = JSON.parse(result).results;
    let final_result = []
    json_result.forEach(element => {
        let obj_template = {
            "id": element.id,
            "title": element.title,
            "price": element.price,
            "currency_id": element.currency_id,
            "available_quantity": element.available_quantity,
            "thumbnail": element.thumbnail,
            "condition": element.condition
        }
        final_result.push(obj_template);
    })
    return final_result;
}