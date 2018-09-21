const CronJob = require('cron').CronJob
const express = require('express')
const bodyParser = require('body-parser')
const axios = require('axios')
const app = express()
const notificacao = require('./service/notificacao')

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(express.static('public'))

app.set('view engine', 'ejs')

let indexController = require('./controller/index')

let init = async() => {
  let connection = await require('./service/mysql')
  app.use(indexController(connection))

  let port = process.env.PORT || 81

  app.listen(port, () => {
    console.log(`PromptMode Running on port ${port}`)
    connection.query('INSERT INTO log (informacao) values (?)', [`PromptMode Running on port ${port}`])
  })

  let job = new CronJob('0 */5 * * * *', async function() {
    agora = new Date()
    let diaSemana = agora.getDay()
    let hora = agora.getHours()
    let minuto = agora.getMinutes()

    let [rows] = await connection.query('SELECT dominio, did, destino FROM programacoes, dominios WHERE programacoes.fk_id_dominio = dominios.id and dia_semana = ? and hora = ? and minuto = ? and did not in (SELECT did FROM feriados WHERE now() BETWEEN inicio and fim and fk_id_dominio = dominios.id) order by did, dia_semana, hora, minuto desc', [diaSemana, hora, minuto])
      .catch(error => {
        connection.query('INSERT INTO log (informacao) values (?)', [error])
        .catch(error => {
          console.log(new Date().toLocaleString())
          console.log(error)
        })
      })
    let [url] = await connection.query('SELECT valor FROM config WHERE chave = "url_webservice"')
      .catch(error => {
        connection.query('INSERT INTO log (informacao) values (?)', [error])
        .catch(error => {
          console.log(new Date().toLocaleString())
          console.log(error)
        })
      })

    if(rows.length > 0){
      let verif = /^ERRO/
      rows.forEach(async item => {
        if(item.did === 'tronco'){
          await axios.get(`${url[0].valor}/setdefaultoperator/${item.destino}&${item.dominio}`)
          .then(async response => {
            if(verif.test(response.data)){
              connection.query('INSERT INTO log (informacao) values (?)', [`Tronco: ${item.dominio} ${item.destino} ${response.data}`])

              let [result] = await connection.query('SELECT valor FROM config where chave = "email_notificacao"')
              notificacao.enviarEmail(result[0].valor, item.dominio, 'tronco', item.destino, response.data)
            }else{
              connection.query('INSERT INTO log (informacao) values (?)', [`Alteração efetuada ${item.did} para ${item.destino}`])
            }
          })
          .catch(async error => {
            let [result] = await connection.query('SELECT valor FROM config where chave = "email_notificacao"')
            notificacao.enviarEmail(result[0].valor, item.dominio, 'tronco', item.destino, error)
            connection.query('INSERT INTO log (informacao) values (?)', [error])
          })
        }else{
          await axios.get(`${url[0].valor}/set/${item.destino}&${item.dominio}&${item.did}`)
          .then(async response => {
            if(verif.test(response.data)){
              connection.query('INSERT INTO log (informacao) values (?)', [`DID: ${item.did} ${item.dominio} ${item.destino} ${response.data}`])

              let [result] = await connection.query('SELECT valor FROM config where chave = "email_notificacao"')
              notificacao.enviarEmail(result[0].valor, item.dominio, item.did, item.destino, response.data)
            }else{
              connection.query('INSERT INTO log (informacao) values (?)', [`Alteração efetuada ${item.did} para ${item.destino}`])
            }
          })
          .catch(async error => {
            let [result] = await connection.query('SELECT valor FROM config where chave = "email_notificacao"')
            notificacao.enviarEmail(result[0].valor, item.dominio, item.did, item.destino, error)
            connection.query('INSERT INTO log (informacao) values (?)', [error])
          })
        }
      })
    }

    let timestamp_c = `${agora.getFullYear()}-${(agora.getMonth()+1).toString().padStart(2, '0')}-${agora.getDate().toString().padStart(2, '0')} ${agora.toLocaleTimeString()}`

    let [feriados_inicio] = await connection.query('SELECT dominio, did, destino FROM feriados, dominios WHERE feriados.fk_id_dominio = dominios.id and inicio = ?', [timestamp_c])
      .catch(error => {
        connection.query('INSERT INTO log (informacao) values (?)', [error])
      })

      if(feriados_inicio.length > 0){
        let verif = /^ERRO/
        feriados_inicio.forEach(async item => {
          if(item.did === 'tronco'){
            await axios.get(`${url[0].valor}/setdefaultoperator/${item.destino}&${item.dominio}`)
            .then(async response => {
              if(verif.test(response.data)){
                connection.query('INSERT INTO log (informacao) values (?)', [`INICIO FERIADO Tronco: ${item.dominio} ${item.destino} ${response.data}`])
  
                let [result] = await connection.query('SELECT valor FROM config where chave = "email_notificacao"')
                notificacao.enviarEmail(result[0].valor, item.dominio, 'tronco', item.destino, response.data)
              }else{
                connection.query('INSERT INTO log (informacao) values (?)', [`INICIO FERIADO Alteração efetuada ${item.did} para ${item.destino}`])
              }
            })
            .catch(async error => {
              let [result] = await connection.query('SELECT valor FROM config where chave = "email_notificacao"')
              notificacao.enviarEmail(result[0].valor, item.dominio, 'tronco', item.destino, error)
              connection.query('INSERT INTO log (informacao) values (?)', [error])
            })
          }else{
            await axios.get(`${url[0].valor}/set/${item.destino}&${item.dominio}&${item.did}`)
            .then(async response => {
              if(verif.test(response.data)){
                connection.query('INSERT INTO log (informacao) values (?)', [`INICIO FERIADO DID: ${item.did} ${item.dominio} ${item.destino} ${response.data}`])
  
                let [result] = await connection.query('SELECT valor FROM config where chave = "email_notificacao"')
                notificacao.enviarEmail(result[0].valor, item.dominio, item.did, item.destino, response.data)
              }else{
                connection.query('INSERT INTO log (informacao) values (?)', [`INICIO FERIADO Alteração efetuada ${item.did} para ${item.destino}`])
              }
            })
            .catch(async error => {
              let [result] = await connection.query('SELECT valor FROM config where chave = "email_notificacao"')
              notificacao.enviarEmail(result[0].valor, item.dominio, item.did, item.destino, error)
              connection.query('INSERT INTO log (informacao) values (?)', [error])
            })
          }
        })
      }
    
    let [feriados_fim] = await connection.query('SELECT dominio, did, destino_pos as destino FROM feriados, dominios WHERE feriados.fk_id_dominio = dominios.id and fim = ?', [timestamp_c])
    .catch(error => {
      connection.query('INSERT INTO log (informacao) values (?)', [error])
    })

    if(feriados_fim.length > 0){
      let verif = /^ERRO/
      feriados_fim.forEach(async item => {
        if(item.did === 'tronco'){
          await axios.get(`${url[0].valor}/setdefaultoperator/${item.destino}&${item.dominio}`)
          .then(async response => {
            if(verif.test(response.data)){
              connection.query('INSERT INTO log (informacao) values (?)', [`FIM FERIADO Tronco: ${item.dominio} ${item.destino} ${response.data}`])

              let [result] = await connection.query('SELECT valor FROM config where chave = "email_notificacao"')
              notificacao.enviarEmail(result[0].valor, item.dominio, 'tronco', item.destino, response.data)
            }else{
              connection.query('INSERT INTO log (informacao) values (?)', [`FIM FERIADO Alteração efetuada ${item.did} para ${item.destino}`])
            }
          })
          .catch(async error => {
            let [result] = await connection.query('SELECT valor FROM config where chave = "email_notificacao"')
            notificacao.enviarEmail(result[0].valor, item.dominio, 'tronco', item.destino, error)
            connection.query('INSERT INTO log (informacao) values (?)', [error])
          })
        }else{
          await axios.get(`${url[0].valor}/set/${item.destino}&${item.dominio}&${item.did}`)
          .then(async response => {
            if(verif.test(response.data)){
              connection.query('INSERT INTO log (informacao) values (?)', [`FIM FERIADO  DID: ${item.did} ${item.dominio} ${item.destino} ${response.data}`])

              let [result] = await connection.query('SELECT valor FROM config where chave = "email_notificacao"')
              notificacao.enviarEmail(result[0].valor, item.dominio, item.did, item.destino, response.data)
            }else{
              connection.query('INSERT INTO log (informacao) values (?)', [`FIM FERIADO  Alteração efetuada ${item.did} para ${item.destino}`])
            }
          })
          .catch(async error => {
            let [result] = await connection.query('SELECT valor FROM config where chave = "email_notificacao"')
            notificacao.enviarEmail(result[0].valor, item.dominio, item.did, item.destino, error)
            connection.query('INSERT INTO log (informacao) values (?)', [error])
          })
        }
      })
    }
    
  }, null, true, 'America/Sao_Paulo')
}

init()