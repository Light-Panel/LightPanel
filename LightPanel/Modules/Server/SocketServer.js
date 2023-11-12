const { Server } = require('socket.io')

//Start Socket Server
module.exports = (core, httpServer) => {
  let server = new Server(httpServer, {
    transports: ['websocket']
  })

  server.on('connection', (client) => {
    if (core.session.checkSession(client.handshake.auth.sessionID) && decrypt(core.session.getSession(client.handshake.auth.sessionID).secret, client.handshake.auth.data) === client.handshake.auth.sessionID) {
      let session = core.session.getSession(client.handshake.auth.sessionID)
      
      client.on('request', async (data) => {
        let request = JSON.parse(decrypt(session.secret, data))
        let response

        if (request.type === 'getPanelInfo') response = core.info
        else if (request.type === 'getAllTemplates') response = core.template.getAllTemplates()
        else if (request.type === 'getTemplate') response = core.template.getTemplate(request.name)
        else if (request.type === 'getContainerInfo') response = core.container.getContainerInfo(request.id)
        else if (request.type === 'getAccountInfo') response = core.account.getAccountInfo(session.accountName)

        else if (request.type === 'createContainer') {
          if (core.account.getAccountInfo(session.accountName).permissions.includes('manageContainers')) response = core.container.createContainer(request.name, request.template, request.templateParameters, request.maxCPU, request.maxMemory, request.networkPort)
          else response = { error: true, content: 'Permission Denied' }
        }

        else if (request.type === 'changeContainerState') {
          let accountInfo = core.account.getAccountInfo(session.accountName)
  
          if (accountInfo.permissions.includes('manageContainers') || accountInfo.containers.includes(request.id)) response = await core.container.changeState(request.id)
          else response = { error: true, content: 'Permission Denied' }
        }

        client.emit('response', encrypt(session.secret, JSON.stringify({ data: response, requestID: request.requestID })))
      })

      let interval = setInterval(() => {
        if (!core.session.checkSession(client.handshake.auth.sessionID)) {
          clearInterval(interval)

          client.disconnect(true)
        }
      }, 1000)
    } else client.disconnect(true)
  })

  return server
}

//Encrypt
function encrypt (secret, string) {
  let result = ''

  for (let i = 0; i < string.length; i++) {
    let i2 = i
    while (i2 >= secret.length) i2-=secret.length

    result+=String.fromCharCode(string.charCodeAt(i)+secret.charCodeAt(i2))
  }

  return result
}

//Decrypt
function decrypt (secret, string) {
  let result = ''

  for (let i = 0; i < string.length; i++) {
    let i2 = i
    while (i2 >= secret.length) i2-=secret.length

    result+=String.fromCharCode(string.charCodeAt(i)-secret.charCodeAt(i2))
  }

  return result
}