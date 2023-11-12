const { spawn, exec } = require('child_process')

//Docker
module.exports = class {
  //Build Docker Image
  static async buildImage (name, folder, file, callback) {
    let result = await executeCommand(['docker', 'build', '--file', file, '-t', name, '--no-cache', folder], callback) 
    
    if (result.code === 0) return { error: false }
    else return { error: true, message: result.message }
  }

  //Get Running Containers
  static async getRunningContainers () {
    let data = (await executeCommand(['docker', 'ps', '--format', '{{ json . }},'])).message

    return JSON.parse(`[${data.substring(0, data.length-2)}]`)
  }

  //Get Containers State
  static async getContainersState () {
    let data = (await executeCommand(['docker', 'stats', '--no-stream', '--format', '{{ json . }},'])).message

    return JSON.parse(`[${data.substring(0, data.length-2)}]`)
  }

  //Start Container
  static async startContainer (name, image, workDir, maxCPU, maxMemory, networkPort) {
    for (let item of await this.getRunningContainers()) {
      if (item.Names === name) return { error: true, content: 'Container Is Already Running' }
    }
     
    return { error: false, terminal: exec(`docker run --name ${name} -w "${workDir}" --cpus ${parseFloat(maxCPU/100).toFixed(2)} --memory ${maxMemory}m --expose ${networkPort} --tty --rm ${image}`) }
  }

  //Stop Container
  static async stopContainer (name) {
    let result = await executeCommand(['docker', 'stop', name])

    if (result.code === 0) return { error: false }
    else return { error: true, content: result.message }
  }
}

const executeCommand = require('./Tools/ExecuteCommcnad')