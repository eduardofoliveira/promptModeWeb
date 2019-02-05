const mariadb = require('mariadb')

const connection = mariadb.createConnection({
  host: '35.171.122.245',
  user: 'root',
  password: '190790edu',
  database: 'promptmode',
  socketPath: '/var/run/mysqld/mysqld.sock'
})

setInterval(async () => {
  await connection.query('SELECT 1 + 1')
    .catch(error => {
      console.log(error)
    })
  //console.log('KeepAlive DB ' + new Date().toLocaleString())
}, 300000)

module.exports = connection