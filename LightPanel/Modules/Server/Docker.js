const { exec } = require('child_process')
const pty = require('node-pty')

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

    return (data === undefined) ? [] : JSON.parse(`[${data.substring(0, data.length-2)}]`)
  }

  //Get Containers State
  static async getContainersState () {
    let data = (await executeCommand(['docker', 'stats', '--no-stream', '--format', '{{ json . }},'])).message

    return (data === undefined) ? [] : JSON.parse(`[${data.substring(0, data.length-2)}]`)
  }

  //Get Container TTY
  static async getContainerTTY (name) {
    return pty.spawn('docker', ['attach', name], {
      name: 'xterm-color',
      cwd: process.env.HOME,
      env: process.env
    })
  }

  //Start Container
  static async startContainer (name, image, workDir, maxCPU, maxMemory, networkPort) {
    for (let item of await this.getRunningContainers()) {
      if (item.Names === name) return { error: true, content: 'Container Is Already Running' }
    }

    //spawn('docker', ['run', '--name', name, '-w', workDir, '--cpus', parseFloat(maxCPU/100).toFixed(2), '--memory', `${maxMemory}m`, '--expose', networkPort, '-it', '--rm', image], { stdio: ['pipe', 'pipe', 'pipe'] })
    // docker run --name ${name} -w "${workDir}" --cpus ${parseFloat(maxCPU/100).toFixed(2)} --memory ${maxMemory}m --expose ${networkPort} -it --rm ${image}
    
    return {
      error: false,
      tty: pty.spawn('docker', ['run', '--name', name, '-w', workDir, '--mount', `type=bind,source=${workDir},target=${workDir}`, '--cpus', parseFloat(maxCPU/100).toFixed(2), '--memory', `${maxMemory}m`, '--expose', networkPort, '-it', '--rm', image], {
        name: 'xterm-color',
        cwd: process.env.HOME,
        env: process.env
      })
    }
  }

  //Stop Container
  static async stopContainer (name) {
    let result = await executeCommand(['docker', 'stop', name])

    if (result.code === 0) return { error: false }
    else return { error: true, content: result.message }
  }
}

const executeCommand = require('./Tools/ExecuteCommcnad')
