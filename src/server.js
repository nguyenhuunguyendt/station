import express from "express";
import bodyParser from "body-parser";
import initWebRoutes from './route/index'
require('dotenv').config()
import stationUltils from './ultils/stationUltils'
let app = express()


app.use(function (req, res, next) {

    res.setHeader('Access-Control-Allow-Origin', process.env.URL_FE);

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    res.setHeader('Access-Control-Allow-Credentials', true);

    next();
});
app.use(bodyParser.json({ limit: '50mb' }))
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))

initWebRoutes(app)

let port = process.env.PORT || 6969
app.listen(port, () => {
    console.log('backend node js is runing on the port : ' + port)
    const realtimeDb = async () => {
        await stationUltils.insertRealtime()
    }
    setInterval(realtimeDb, 1200000);
}) 