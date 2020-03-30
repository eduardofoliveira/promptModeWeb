const mariadb = require('mariadb')
let connection = null

if(process.env.ENVIRONMENT === 'development'){
  connection = mariadb.createConnection({
    host: process.env.MARIA_DB_HOST,
    user: process.env.MARIA_DB_USER,
    password: process.env.MARIA_DB_PASS,
    database: process.env.MARIA_DB_DATABASE,
  })
}else{
  connection = mariadb.createConnection({
    host: process.env.MARIA_DB_HOST,
    user: process.env.MARIA_DB_USER,
    password: process.env.MARIA_DB_PASS,
    database: process.env.MARIA_DB_DATABASE,
    socketPath: process.env.MARIA_DB_SOCKET,
  })
}

module.exports = connection