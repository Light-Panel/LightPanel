const { exec, execSync } = require('child_process')
const fs = require('fs')

const getPath = require('./Modules/Server/Tools/GetPath')

if (!fs.existsSync(getPath(__dirname, ['node_modules']))) {
  console.log('Installing Packages')

  execSync(`cd "${__dirname}" && npm i`)

  console.log('Installation Complete, Please Restart The Process')
  
  process.exit()
}

//API
module.exports = {
  Server: require('./Modules/Server/Main')
}