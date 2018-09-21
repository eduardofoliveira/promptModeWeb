//const mysql = require('mysql2/promise')
const mysql = require('mariadb')

module.exports = mysql.createPool({
    host: '35.171.122.245',
    user: 'root',
    password: '190790edu',
    database: 'promptmode',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
})