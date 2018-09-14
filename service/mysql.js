const mysql = require('mysql2/promise')

module.exports = mysql.createPool({
    host: 'duduhouse.dyndns.info',
    user: 'promptmode',
    password: '190790edu',
    database: 'promptmode',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
})