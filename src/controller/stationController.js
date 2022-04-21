let { conn, sql } = require('../connect')
import stationUltils from '../ultils/stationUltils'
const axios = require('axios')
require('dotenv').config()

let createStation = async (req, res) => {
    let arrPromise = []
    let datacreate = []
    for (let i = 1; i <= 9; i++) {
        let urlApi = `https://cdh.vnmha.gov.vn/KiWIS/KiWIS?service=kisters&type=queryServices&request=getTimeseriesValueLayer&datasource=0&format=json&ts_path=${i}/*/*/Manual.O&metadata=true&md_returnfields=stationparameter_name,stationparameter_no,station_name,station_no,site_name,site_no,ts_id,ts_path,ts_unitsymbol,ts_name,object_type&from=2022-3-01&to=2022-3-02`
        let aSyncData = async () => {
            try {
                let data = await axios.get(urlApi)
                if (data && Array.isArray(data.data) && data.data.length > 0) {
                    return data.data
                } else {
                    return []
                }
            } catch (error) {
                console.log(error)
            }
        }
        arrPromise.push(aSyncData)
    }
    let result = await Promise.all(arrPromise.map(callback => callback()))
    result.forEach(item => {
        datacreate = datacreate.concat(item)
    })

    try {
        let pool = await conn
        let sqlString1 = `SELECT * FROM station`
        await pool.request()
            .query(sqlString1, async function (err, data) {
                let dataRecord = data.recordset
                if (Array.isArray(dataRecord) && !dataRecord.length > 0) {
                    if (datacreate && datacreate.length > 0) {
                        datacreate.map(async (item) => {
                            let sqlString = `INSERT INTO station (Ts_id,Station_name,Station_no,Stationparameter_name,Stationparameter_no) VALUES (@Ts_id,@Station_name,@Station_no,@Stationparameter_name,@Stationparameter_no)`
                            await pool.request()
                                .input('Ts_id', sql.Int, item.ts_id)
                                .input('Station_name', sql.NVarChar, item.station_name)
                                .input('Station_no', sql.NVarChar, item.station_no)
                                .input('Stationparameter_name', sql.NVarChar, item.stationparameter_name)
                                .input('Stationparameter_no', sql.NVarChar, item.stationparameter_no)
                                .query(sqlString, function (err, data) {
                                    if (err) {
                                        res.status(200).json({
                                            errCode: 2,
                                            errMessage: "fail from server"
                                        })
                                    } else {
                                        console.log({ errMs: 'ok' })
                                    }
                                })
                        })
                    }
                    res.status(200).json({ errCode: 'ok' })
                }
                else {
                    if (Array.isArray(datacreate) && datacreate.length > 0) {
                        datacreate.map(async (itemMap) => {
                            let result = dataRecord.find((itemFind) =>
                                itemFind.Ts_id === itemMap.ts_id && itemFind.Station_no === itemMap.station_no && itemFind.Station_name === itemMap.station_name
                                && itemFind.Stationparameter_name === itemMap.stationparameter_name && itemFind.Stationparameter_no === itemMap.stationparameter_no
                            )
                            if (!result) {
                                let sqlString = `INSERT INTO station (Ts_id,Station_name,Station_no,Stationparameter_name,Stationparameter_no) VALUES (@Ts_id,@Station_name,@Station_no,@Stationparameter_name,@Stationparameter_no)`
                                await pool.request()
                                    .input('Ts_id', sql.Int, itemMap.ts_id)
                                    .input('Station_name', sql.NVarChar, itemMap.station_name)
                                    .input('Station_no', sql.NVarChar, itemMap.station_no)
                                    .input('Stationparameter_name', sql.NVarChar, itemMap.stationparameter_name)
                                    .input('Stationparameter_no', sql.NVarChar, itemMap.stationparameter_no)
                                    .query(sqlString, function (err, data) {
                                        if (err) {
                                            res.status(200).json({
                                                errCode: 2,
                                                errMessage: "Fail from server"
                                            })
                                        } else {
                                            console.log({ errMs: 'ok ok' })
                                        }
                                    })
                            }
                        })
                    }
                    res.status(200).json({ errCode: 'ok' })
                }
            })
    } catch (error) {
        console.log(error)
    }
}


let insertDataCurrent = async (req, res) => {
    try {
        let data = await stationUltils.insertRealtime(req, res)
        res.status(200).json(data)
    } catch (error) {
        res.status(200).json({
            errCode: 1,
            errMs: "fail"
        })
    }
    // res.status(200).json({ errMessage: "ok" })
}
let getAllrecord = async (req, res) => {
    try {
        var pool = await conn
        let sqlString = `SELECT dataTs.Ts_id,dataTs.Ts_value,dataTs.Timestamp,station.Station_no,station.Station_name,station.Stationparameter_name,station.Stationparameter_no
        FROM dataTs
        INNER JOIN station
        ON dataTs.Ts_id = station.Ts_id`
        return await pool.request()
            .input('ts_id', sql.Int, req.body.ts_id)
            .input('ts_value', sql.Float, req.body.ts_value)
            .input('timestamp', sql.VarChar, req.body.timestamp)
            .query(sqlString, function (err, data) {
                res.status(200).json({ data: data.recordset })
            })
    } catch (error) {
        console.log(error)
    }

}
module.exports = {
    createStation,
    insertDataCurrent,
    getAllrecord
}


