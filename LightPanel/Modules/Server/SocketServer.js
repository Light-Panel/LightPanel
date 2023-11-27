const { Server } = require('socket.io')

//Start Socket Server
module.exports = (core, httpServer) => {
  let server = new Server(httpServer, {
    transports: ['websocket']
  })

  server.on('connection', (client) => {
    if (core.session.checkSession(client.handshake.auth.sessionID) && decrypt(core.session.getSession(client.handshake.auth.sessionID).secret, client.handshake.auth.data) === client.handshake.auth.sessionID) {
      let session = core.session.getSession(client.handshake.auth.sessionID)

      let requests = {}

      //Send Request
      async function sendRequest (data) {
        return new Promise((resolve) => {
          let id = generateID(5, Object.keys(requests))

          requests[id] = resolve

          setTimeout(() => {
            if (requests[id] !== undefined) {
              delete requests[id]

              resolve('Timeout')
            }
          }, 1000)

          client.emit('request', encrypt(session.secret, JSON.stringify(Object.assign(data, { requestID: id }))))
        })
      } 
      
      client.on('request', async (data) => {
        let request = JSON.parse(decrypt(session.secret, data))
        let response

        let accountInfo = core.account.getAccountInfo(session.accountName)

        if (request.type === 'getPanelInfo') response = core.info
        else if (request.type === 'getAllTemplates') response = core.template.getAllTemplates()
        else if (request.type === 'getTemplate') response = core.template.getTemplate(request.name)
        else if (request.type === 'getContainerInfo') {
          if (accountInfo.permissions.includes('manageContainers') || accountInfo.containers.includes(request.id)) response = core.container.getContainerInfo(request.id)
          else response = { error: true, content: 'Permission Denied' }
        } else if (request.type === 'getContainerRecord') {
          if (accountInfo.permissions.includes('manageContainers') || accountInfo.containers.includes(request.id)) response = core.container.getContainerRecord(request.id)
          else response = { error: true, content: 'Permission Denied' }
				} else if (request.type === 'getContainerShortcuts') {
          if (accountInfo.permissions.includes('manageContainers') || accountInfo.containers.includes(request.id)) response = core.container.getContainerShortcuts(request.id)
          else response = { error: true, content: 'Permission Denied' }
        } else if (request.type === 'getContainerLog') {
          if (accountInfo.permissions.includes('manageContainers') || accountInfo.containers.includes(request.id)) response = core.container.getContainerLog(request.id)
          else response = { error: true, content: 'Permission Denied' }
        } else if (request.type === 'getAccountInfo') response = core.account.getAccountInfo(session.accountName)

        else if (request.type === 'createContainer') {
          if (core.account.getAccountInfo(session.accountName).permissions.includes('manageContainers')) response = core.container.createContainer(request.name, request.template, request.templateParameters, request.maxCPU, request.maxMemory, request.storage, request.networkPort)
          else response = { error: true, content: 'Permission Denied' }
        }
        
				else if (request.type === 'saveAccountSettings') response = core.account.saveAccountSettings(session.accountName, request.settings, request.shortkeys)
				else if (request.type === 'changeContainerState') {
          if (accountInfo.permissions.includes('manageContainers') || accountInfo.containers.includes(request.id)) response = await core.container.changeState(request.id)
          else response = { error: true, content: 'Permission Denied' }
        }

        else if (request.type === 'connectTTY') {
          if (accountInfo.permissions.includes('manageContainers') || accountInfo.containers.includes(request.id)) {
            let token = generateID(10, [])
            
            let data = core.ttyManager.listenTTY(request.id, async (data2) => {
              if (await sendRequest({ type: 'ttyUpdate', data: data2, token }) === 'Timeout') data.event.stop()
            })

            if (data.error) response = data
            else response = { error: false, token }
          } else response = { error: true, content: 'Permission Denied' }
        } else if (request.type === 'ttyInput') {
          if (accountInfo.permissions.includes('manageContainers') || accountInfo.containers.includes(request.id)) response = core.ttyManager.ttyInput(request.id, request.data)
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

const generateID = require('./Tools/GenerateID')
