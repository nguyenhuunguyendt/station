let { conn, sql } = require('../connect')
const axios = require('axios')
const res = require('express/lib/response')
require('dotenv').config()
const insertRealtime = async (req, res) => {
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

    return new Promise(async (resolve, reject) => {
        try {
            console.log(2)
            let pool = await conn
            let sqlString1 = `SELECT * FROM dataTs `
            await pool.request()
                .query(sqlString1, async function (err, data) {
                    let dataRecord = data.recordset
                    if (!dataRecord.length > 0) {
                        if (datacreate && datacreate.length > 0) {
                            datacreate.map(async (item) => {
                                let sqlString = `INSERT INTO dataTs (Ts_id,Ts_value,Timestamp) VALUES (@ts_id,@ts_value,@timestamp)`
                                await pool.request()
                                    .input('ts_id', sql.Int, item.ts_id)
                                    .input('ts_value', sql.Float, item.ts_value)
                                    .input('timestamp', sql.NVarChar, item.timestamp)
                                    .query(sqlString, function (err, data) {
                                        if (err) {
                                            reject(err)
                                        } else {
                                            console.log({ errMs: 'ok' })
                                        }
                                    })
                            })
                            resolve({
                                errCode: 0,
                                errMessage: "ok"
                            })
                        } else {
                            resolve({
                                errCode: 1,
                                errMessage: "fail"
                            })
                        }
                    }
                    else {
                        if (Array.isArray(datacreate) && datacreate.length > 0) {
                            datacreate.map(async (itemMap) => {
                                let result = dataRecord.find((itemFind) =>
                                    itemFind.Ts_id === itemMap.ts_id && itemFind.Ts_value === itemMap.ts_value && itemFind.Timestamp === itemMap.timestamp
                                )
                                if (!result) {
                                    let sqlString = `INSERT INTO dataTs (Ts_id,Ts_value,Timestamp) VALUES (@ts_id,@ts_value,@timestamp)`
                                    await pool.request()
                                        .input('ts_id', sql.Int, itemMap.ts_id)
                                        .input('ts_value', sql.Float, itemMap.ts_value)
                                        .input('timestamp', sql.NVarChar, itemMap.timestamp)
                                        .query(sqlString, function (err, data) {
                                            if (err) {
                                                resolve({
                                                    errCode: 2,
                                                    errMessage: "fail"
                                                })
                                            }
                                            console.log({ errMs: 'ok' })
                                        })
                                }

                            })
                            resolve({
                                errCode: 0,
                                errMessage: "ok"
                            })
                        } else {
                            resolve({
                                errCode: 1,
                                errMessage: "fail"
                            })
                        }
                    }
                })
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })




}

module.exports = {
    insertRealtime
}
