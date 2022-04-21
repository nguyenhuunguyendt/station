import express from "express";
let router = express.Router();
import stationcontroler from '../controller/stationController'
let initWebRoutes = (app) => {
    router.get('/get-all-recored', stationcontroler.getAllrecord)
    router.post('/api/station', stationcontroler.createStation)
    router.post('/api/insert-curent', stationcontroler.insertDataCurrent)
    return app.use("/", router)
}
module.exports = initWebRoutes