const mysql = require('mysql2/promise')

module.exports = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'promptmode',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
})