require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const app = express()

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(express.static('public'))

app.set('view engine', 'ejs')

let indexController = require('./controller/index')

let init = async() => {
  let connection = await require('./service/mariadb')

  app.use(indexController(connection))

  let port = process.env.PORT || 81

  app.listen(port, () => {
    console.log(`PromptMode Running on port ${port}`)
    connection.query('INSERT INTO log (informacao) values (?)', [`PromptMode Running on port ${port}`])
  })
}

init()