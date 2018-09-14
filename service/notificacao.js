const nodemailer = require('nodemailer')

const transportCloud = nodemailer.createTransport({
  service: 'gmail',
  secure: true,
  port: 465,
  auth: {
      user: 'suporte1@cloudcom.com.br',
      pass: 'Cloud777'
  }
})

let enviarEmail = (to, dominio, did, destino, error_ws) => {

  let HelperOptions = {
    from: '"Suporte Basix" <suporte@cloudcom.com.br>',
    to: to,
    cc: 'suporte.basix@cloudcom.com.br',
    replyTo: {"name":'Suporte Basix', "address":'suporte@cloudcom.com.br'},
    subject: `PromptMode - Aviso de Falha - ${dominio} ${did} ${destino}`,
    html: `Falha ao alterar o DID: ${did} para o destino: ${destino} no dominio: ${dominio}<br>${error_ws}`
  }

  transportCloud.sendMail(HelperOptions, (error, info) => {
    if(error){
      return false
    }else{
      return true
    }
  })

}

module.exports = {
  enviarEmail
}