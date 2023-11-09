//Docker
module.exports = class {
  //Build Docker Image
  static async buildImage (name, folder, file, callback) {
    let result = await executeCommand(['docker', 'build', '--file', file, '-t', name, '--no-cache', folder], callback) 
    
    if (result.code === 0) return { error: false }
    else return { error: true, message: result.message }
  }

  //Start Container
  static startContainer () {
  
  }
}

const executeCommand = require('./Tools/ExecuteCommcnad')