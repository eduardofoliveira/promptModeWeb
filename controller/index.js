const express = require('express')
const app = express.Router()
const semana = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sabado"]

let init = connection => {
  app.get('/', async (req, res) => {
    let rows = await connection.query('SELECT * FROM dominios')
    res.render('index', {dominios: rows})
  })

  app.post('/', async (req, res) => {
    let { dominio } = req.body
    let rows = await connection.query('SELECT * FROM dominios where dominio = ?', dominio)

    if(rows.length === 0){
      await connection.query('INSERT INTO dominios (dominio) values (?)', dominio)
      res.statusCode = 201
      res.json({ message: 'Dominio adicionado' })
      connection.query('INSERT INTO log (informacao) values (?)', [`Dominio ${dominio} adicionado`])
    }else{
      res.statusCode = 409
      res.json({ message: 'Dominio já existe' })
      connection.query('INSERT INTO log (informacao) values (?)', [`Error: Dominio ${dominio} já existe`])
    }
  })

  app.delete('/', async (req, res) => {
    let { id } = req.body
    let dominio = await connection.query('SELECT dominio FROM dominios where id = ?', id)
    await connection.query('DELETE FROM dominios where id = ?', id)
    .then(response => {
      res.statusCode = 202
      res.json({ message: 'Dominio deletado' })
      connection.query('INSERT INTO log (informacao) values (?)', [`Dominio ${dominio[0].dominio} deletado`])
    })
    .catch(error => {
      if(error.code === 'ER_ROW_IS_REFERENCED_2'){
        res.statusCode = 400
        res.json({ message: 'Dominio não pode ser deletado pois há programações' })
        connection.query('INSERT INTO log (informacao) values (?)', [`Dominio ${dominio[0].dominio} não pode ser deletado pois há programações`])
      }
    })
  })

  app.get('/config', async (req, res) => {
    let config = await connection.query('SELECT * FROM config order by id asc limit 100')
    res.render('config', {config})
  })

  app.put('/config/:id', async (req, res) => {
    let { id } = req.params
    let { valor } = req.body
    let result = await connection.query('SELECT chave, valor FROM config WHERE id = ?', [id])
    let rows = await connection.query('UPDATE config SET valor = ? WHERE id = ?', [valor, id])
    
    if(rows.affectedRows === 1){
      res.statusCode = 200
      res.json({ message: 'Parametro atualizado' })
      connection.query('INSERT INTO log (informacao) values (?)', [`Parametro ${result[0].chave} alterado de ${result[0].valor} para ${valor}`])
    }else{
      res.statusCode = 400
      res.json({ message: 'Erro ao atualizar parametro' })
      connection.query('INSERT INTO log (informacao) values (?)', [`Erro ao alterar parametro ${result[0].chave} de ${result[0].valor} para ${valor}`])
    }
  })

  app.get('/logs', async (req, res) => {
    let logs = await connection.query('SELECT * FROM log ORDER BY horario DESC LIMIT 100')
    res.render('logs', {logs})
  })

  app.get('/:id', async (req, res) => {
    let { id } = req.params
    let rows = await connection.query('SELECT * FROM programacoes WHERE fk_id_dominio = ? order by did, dia_semana, hora, minuto desc', id)
    let dominio = await connection.query('SELECT dominio FROM dominios WHERE id = ?', id)
    let feriados = await connection.query('SELECT * FROM feriados WHERE fk_id_dominio = ? order by did, inicio desc', id)
    res.render('programacao', {registros: rows, dominio, id, feriados})
  })

  app.post('/:id', async (req, res) => {
    let { id } = req.params
    let { dados } = req.body
    let result = await connection.query('SELECT dominio FROM dominios where id = ?', id)

    if(dados.dia_semana >= 0 && dados.dia_semana <= 6){
      let rows = await connection.query('INSERT INTO programacoes (fk_id_dominio, did, destino, dia_semana, hora, minuto) values (?, ?, ?, ?, ?, ?)', [id, dados.did, dados.destino, dados.dia_semana, dados.hora, dados.minuto])
      if(rows.affectedRows === 1){
        res.statusCode = 201
        res.json({ message: 'Programação adicionada' })
        connection.query('INSERT INTO log (informacao) values (?)', [`Programação ${result[0].dominio} ${dados.did} para ${dados.destino} em ${semana[dados.dia_semana]} ${dados.hora}:${dados.minuto} adicionada`])
      }
    }else if(dados.dia_semana === '7'){
      await connection.query('INSERT INTO programacoes (fk_id_dominio, did, destino, dia_semana, hora, minuto) values (?, ?, ?, ?, ?, ?)', [id, dados.did, dados.destino, 1, dados.hora, dados.minuto])
      await connection.query('INSERT INTO programacoes (fk_id_dominio, did, destino, dia_semana, hora, minuto) values (?, ?, ?, ?, ?, ?)', [id, dados.did, dados.destino, 2, dados.hora, dados.minuto])
      await connection.query('INSERT INTO programacoes (fk_id_dominio, did, destino, dia_semana, hora, minuto) values (?, ?, ?, ?, ?, ?)', [id, dados.did, dados.destino, 3, dados.hora, dados.minuto])
      await connection.query('INSERT INTO programacoes (fk_id_dominio, did, destino, dia_semana, hora, minuto) values (?, ?, ?, ?, ?, ?)', [id, dados.did, dados.destino, 4, dados.hora, dados.minuto])
      let rows = await connection.query('INSERT INTO programacoes (fk_id_dominio, did, destino, dia_semana, hora, minuto) values (?, ?, ?, ?, ?, ?)', [id, dados.did, dados.destino, 5, dados.hora, dados.minuto])
      
      if(rows.affectedRows === 1){
        res.statusCode = 201
        res.json({ message: 'Programação adicionada' })
        connection.query('INSERT INTO log (informacao) values (?)', [`Programação ${result[0].dominio} ${dados.did} para ${dados.destino} em Segunda a Sexta ${dados.hora}:${dados.minuto} adicionada`])
      }
    }else if(dados.dia_semana === '8'){
      await connection.query('INSERT INTO programacoes (fk_id_dominio, did, destino, dia_semana, hora, minuto) values (?, ?, ?, ?, ?, ?)', [id, dados.did, dados.destino, 1, dados.hora, dados.minuto])
      await connection.query('INSERT INTO programacoes (fk_id_dominio, did, destino, dia_semana, hora, minuto) values (?, ?, ?, ?, ?, ?)', [id, dados.did, dados.destino, 2, dados.hora, dados.minuto])
      await connection.query('INSERT INTO programacoes (fk_id_dominio, did, destino, dia_semana, hora, minuto) values (?, ?, ?, ?, ?, ?)', [id, dados.did, dados.destino, 3, dados.hora, dados.minuto])
      await connection.query('INSERT INTO programacoes (fk_id_dominio, did, destino, dia_semana, hora, minuto) values (?, ?, ?, ?, ?, ?)', [id, dados.did, dados.destino, 4, dados.hora, dados.minuto])
      await connection.query('INSERT INTO programacoes (fk_id_dominio, did, destino, dia_semana, hora, minuto) values (?, ?, ?, ?, ?, ?)', [id, dados.did, dados.destino, 5, dados.hora, dados.minuto])
      let rows = await connection.query('INSERT INTO programacoes (fk_id_dominio, did, destino, dia_semana, hora, minuto) values (?, ?, ?, ?, ?, ?)', [id, dados.did, dados.destino, 6, dados.hora, dados.minuto])
      
      if(rows.affectedRows === 1){
        res.statusCode = 201
        res.json({ message: 'Programação adicionada' })
        connection.query('INSERT INTO log (informacao) values (?)', [`Programação ${result[0].dominio} ${dados.did} para ${dados.destino} em Segunda a Sabado ${dados.hora}:${dados.minuto} adicionada`])
      }
    }else{
      await connection.query('INSERT INTO programacoes (fk_id_dominio, did, destino, dia_semana, hora, minuto) values (?, ?, ?, ?, ?, ?)', [id, dados.did, dados.destino, 0, dados.hora, dados.minuto])
      await connection.query('INSERT INTO programacoes (fk_id_dominio, did, destino, dia_semana, hora, minuto) values (?, ?, ?, ?, ?, ?)', [id, dados.did, dados.destino, 1, dados.hora, dados.minuto])
      await connection.query('INSERT INTO programacoes (fk_id_dominio, did, destino, dia_semana, hora, minuto) values (?, ?, ?, ?, ?, ?)', [id, dados.did, dados.destino, 2, dados.hora, dados.minuto])
      await connection.query('INSERT INTO programacoes (fk_id_dominio, did, destino, dia_semana, hora, minuto) values (?, ?, ?, ?, ?, ?)', [id, dados.did, dados.destino, 3, dados.hora, dados.minuto])
      await connection.query('INSERT INTO programacoes (fk_id_dominio, did, destino, dia_semana, hora, minuto) values (?, ?, ?, ?, ?, ?)', [id, dados.did, dados.destino, 4, dados.hora, dados.minuto])
      await connection.query('INSERT INTO programacoes (fk_id_dominio, did, destino, dia_semana, hora, minuto) values (?, ?, ?, ?, ?, ?)', [id, dados.did, dados.destino, 5, dados.hora, dados.minuto])
      let rows = await connection.query('INSERT INTO programacoes (fk_id_dominio, did, destino, dia_semana, hora, minuto) values (?, ?, ?, ?, ?, ?)', [id, dados.did, dados.destino, 6, dados.hora, dados.minuto])
      
      if(rows.affectedRows === 1){
        res.statusCode = 201
        res.json({ message: 'Programação adicionada' })
        connection.query('INSERT INTO log (informacao) values (?)', [`Programação ${result[0].dominio} ${dados.did} para ${dados.destino} em Domingo a Sabado ${dados.hora}:${dados.minuto} adicionada`])
      }
    }
  })

  app.post('/:id/feriado', async (req, res) => {
    let { id } = req.params
    let { dadosFeriado } = req.body

    let rows = await connection.query('INSERT INTO feriados (fk_id_dominio, did, destino, destino_pos, inicio, fim) values (?, ?, ?, ?, ?, ?)', [id, dadosFeriado.did, dadosFeriado.destino, dadosFeriado.destino_pos, dadosFeriado.inicio, dadosFeriado.final])
    if(rows.affectedRows === 1){
      res.statusCode = 201
      res.json({ message: 'Feriado Adicionado' })
    }
  })

  app.delete('/:id', async (req, res) => {
    let { id } = req.body
    let result = await connection.query('SELECT * FROM programacoes where id = ?', id)
    let domain = await connection.query('SELECT dominio FROM dominios, programacoes where dominios.id = programacoes.fk_id_dominio and programacoes.id = ?', id)

    await connection.query('DELETE FROM programacoes where id = ?', id)
    res.statusCode = 202
    res.json({ message: 'Programação deletada' })
    connection.query('INSERT INTO log (informacao) values (?)', [`Programação para ${domain[0].dominio} o DID: ${result[0].did} com destino: ${result[0].destino} em ${semana[result[0].dia_semana]} as ${result[0].hora}:${result[0].minuto} deletada`])
  })

  app.delete('/:id/feriado/:id_programacao', async (req, res) => {
    let { id, id_programacao } = req.params
    await connection.query('DELETE FROM feriados where id = ? and fk_id_dominio = ?', [id_programacao, id])
    .then(response => {
      res.statusCode = 202
      res.json({ message: 'Feriado deletado' })
    })
    .catch(error => {
      res.statusCode = 400
      res.json({ message: 'Feriado não pode ser deletado' })
    })

  })

  return app
}

module.exports = init