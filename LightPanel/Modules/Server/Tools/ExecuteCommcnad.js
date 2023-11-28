const { spawn } = require('child_process')

//Execute Commnand
module.exports = async (command, callback) => {
  return new Promise((resolve) => {
    let childProcess = spawn(command[0], command.slice(1, command.length))

    let lastMessage

    childProcess.stdout.on('data', (data) => {
      lastMessage = data

      if (callback !== undefined) callback(data.toString())
    })
    childProcess.stderr.on('data', (data) => {
      lastMessage = data
      
      if (callback !== undefined) callback(data.toString())
    })

    childProcess.on('exit', (code) => resolve({ code, message: (lastMessage === undefined) ? undefined : lastMessage.toString() }))
  })
}
