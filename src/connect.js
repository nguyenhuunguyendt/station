let sql = require('mssql/msnodesqlv8')
const filePath = String.raw`DESKTOP-QBLRO6P\SQLEXPRESS`;  // Tên server database
let config = {
    database: "station", // Tên databse muốn kết nối
    server: filePath,
    user: "sa", // tai khoan ket noi database
    driver: "msnodesqlv8",
    password: '12345', // mat khau ket noi database

}
const conn = new sql.ConnectionPool(config).connect().then(pool => {
    console.log('success')
    return pool
})
module.exports = {
    conn: conn,
    sql: sql
}