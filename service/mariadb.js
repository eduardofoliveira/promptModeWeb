const mariadb = require('mariadb')

const connection = mariadb.createConnection({
  host: '35.171.122.245',
  user: 'root',
  password: '190790edu',
  database: 'promptmode'
})

module.exports = connection