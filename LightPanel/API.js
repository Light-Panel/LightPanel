const { exec, execSync } = require('child_process')
const fs = require('fs')

const getPath = require('./Modules/Server/Tools/GetPath')

if (!fs.existsSync(getPath(__dirname, ['node_modules']))) {
  console.log('Installing packages')

  execSync(`cd "${__dirname}" && npm i`)

  console.log('Installation complete, please restart the process')
  
  process.exit()
}

//API
module.exports = {
  Server: require('./Modules/Server/Main')
}