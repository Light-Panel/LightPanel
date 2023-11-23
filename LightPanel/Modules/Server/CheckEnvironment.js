const { execSync } = require('child_process')
const os = require('os')
const fs = require('fs')

const getPath = require('./Tools/GetPath')

//Check Environment (Packages, Permission, OS, etc...)
module.exports = () => {
  if (os.platform() === 'linux') {
    if (!fs.existsSync(getPath(__dirname, ['<', '<', 'node_modules']))) {
      console.log('Installing packages')
  
      execSync(`cd "${getPath(__dirname, ['<', '<'])}" && npm i`)
  
      console.log('Installation complete, please restart the process')
    
      process.exit()
    }

		if (process.getuid() !== 0) throw new Error(`Light Panel Need Root Permission`)
  } else throw new Error(`Unsupported Platform: [${os.platform()}]`)
}
