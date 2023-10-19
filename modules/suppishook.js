const express = require('express');
const bodyparser = require('body-parser');

const missingParams = {error: "Missing parameters"};
const error = (message) => {return {error: message}};

const init = async (whatsappInterface, config) => {
    const app = express();
    app.use(bodyparser.json())
    app.post('/suppishook/send/:token/', async (req, res) => {
        if (!req.body.message) {
            res.status(400);
            res.json(missingParams);
            return;
        }
        if (!config.suppis_tokens.includes(req.params.token)) {
            res.status(400);
            res.json(missingParams);
            return;
        }
        try {
            let msg = await whatsappInterface.sendMessage(req.body.recipient, req.body.message);
            delete msg['_data'];
            res.json({message: msg});
        } catch (e) {
            console.error(e);
            res.status(500);
            res.json(error(e.toString()))
        }
    })
    app.get('/suppishook/status', async (req, res) => {
        if (!config.tokens.includes(req.params.token)) {
            res.status(400);
            res.json(missingParams);
            return;
        }
        try {
            const selectedNum = await whatsappInterface.getNumberId(config.test_number);
            res.json({status: selectedNum !== null});
        } catch (e) {
            console.error(e);
            res.status(500);
            res.json(error(e.toString()))
        }
    })
    await new Promise((resolve, reject) => {
        app.on('error', reject);
        try {
            app.listen(config.port, resolve);
        } catch (e) {
            reject(e);
        }
    })
}


module.exports = {
    init, info: {name: 'suppishook', version: 1.0}
}
