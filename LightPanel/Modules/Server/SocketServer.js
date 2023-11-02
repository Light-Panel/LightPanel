const { Server } = require('socket.io')

//Start Socket Server
module.exports = (core, httpServer) => {
  let server = new Server(httpServer)

  server.on('connection', () => {
    console.log(true)
  })

  return server
}