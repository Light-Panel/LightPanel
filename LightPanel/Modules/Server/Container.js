const fs = require('fs')

//Container
module.exports = class {
  #core

  constructor (core) {
    this.#core = core

    this.data = {}
    this.recordData = {}
    this.logData = {}
    this.ttys = {}

    this.load()

    Object.keys(this.data).forEach((item) => {
      if (this.data[item].state === 'building') this.buildContainer(item)
    })

    //Update Container State
    setInterval(async () => {
      (await Docker.getContainersState()).forEach((item) => {
        if (item.Name.substring(0, 10) === 'lightpanel') {
          let id = item.Name.split('-')[1]

          if (this.data[id] === undefined) Docker.stopContainer(`lightpanel-${id}`)
          else this.addRecord(id, parseInt((100/this.data[id].maxCPU)*(+item.CPUPerc.replace('%', ''))).toFixed(1), parseMemoryUsage(item.MemUsage))
        }
      })

      let runningContainers = []
      
      let result = await Docker.getRunningContainers()
      result.forEach((item) => {
        if (item.Names.substring(0, 10) === 'lightpanel') {
          let id = item.Names.split('-')[1]

          if (this.data[id] !== undefined && this.data[id].state !== 'running') this.data[id].state = 'running'

          runningContainers.push(id)
        }
      })

      Object.keys(this.data).forEach((item) => {
        if (!runningContainers.includes(item)) {
          if (this.data[item].state !== 'idle') this.data[item].state = 'idle'
          
          this.addRecord(item, 0, 0)
        }
      })
    }, 1000)

    //Save Data
    setInterval(() => {
      this.save()
      this.saveLogData()
    }, 1000)
  }

  //Load Containers Data
  load () {
    this.#core.checkFiles()

    this.data = JSON.parse(fs.readFileSync(getPath(this.#core.path, ['Containers.json'])))
    this.logData = {}

    let keys = Object.keys(this.data)
    fs.readdirSync(getPath(this.#core.path, ['Containers'])).forEach((item) => {
      if (!keys.includes(item)) fs.rmSync(getPath(this.#core.path, ['Containers', item]), { recursive: true })
      else this.logData[item] = fs.readFileSync(getPath(this.#core.path, ['Containers', item, 'log.txt']), 'utf8').split('\n')
    })

    Object.keys(this.data).forEach((item) => this.checkContainerState(item))

    this.save()
  }

  //Save Containers Data
  save () {
    this.#core.checkFiles()
    
    fs.writeFileSync(getPath(this.#core.path, ['Containers.json']), JSON.stringify(this.data))
  }

  //Save Containers Log Data
  saveLogData () {
    this.#core.checkFiles()

    Object.keys(this.data).forEach((item) => {
      if (fs.existsSync(getPath(this.#core.path, ['Containers', item]))) fs.writeFileSync(getPath(this.#core.path, ['Containers', item, 'log.txt']), this.logData[item].join('\n'))
    })
  }

  //Create Container
  createContainer (name, template, templateParameters, maxCPU, maxMemory, storage, networkPort) {
    if (this.#core.template.getTemplate(template) === undefined) return { error: true, content: 'Template Not Found' }
    if (maxCPU < 1 || maxCPU > 100) return { error: true, content: 'MaxCPU Is Out Of Range' }
    if (maxMemory < 1 || maxMemory > this.#core.info.toltalMemory) return { error: true, content: 'maxMemory Is Out Of Range' }
    for (let item of Object.keys(this.data)) {
      if (this.data[item].name === name) return { error: true, content: 'Name Duplicate' }
      if (this.data[item].networkPort === networkPort) return { error: true, content: 'Network Port Is Already Used' }
    }

    let templateData = this.#core.template.getTemplate(template)
    let templateParametersData = {}

    let id = generateID(10, Object.keys(this.data))

    this.data[id] = {
      name,

      state: 'idle',

      template,
      templateParameters: Object.assign(templateParameters, templateParametersData),
      shortcuts: templateData.shortcuts,

      maxCPU: +maxCPU,
      maxMemory: +maxMemory,
      storage: +storage,
      networkPort: +networkPort,

      cpuRecord: [0],
      memoryRecord: [0]
    }

    this.save()

    fs.mkdirSync(getPath(this.#core.path, ['Containers', id]))
    fs.mkdirSync(getPath(this.#core.path, ['Containers', id, 'Content']))
    fs.writeFileSync(getPath(this.#core.path, ['Containers', id, 'log.txt']), '')

    this.logData[id] = []

    return { error: false, id }
  }

  //Get Container Info
  getContainerInfo (id) {
    if (this.data[id] === undefined) return undefined

    return {
      name: this.data[id].name,

      state: this.data[id].state,

      maxCPU: this.data[id].maxCPU,
      maxMemory: this.data[id].maxMemory,
      storage: this.data[id].storage,
      networkPort: this.data[id].networkPort,

			cpu: (this.recordData[id] === undefined) ? 0 : this.recordData[id].cpu[this.recordData[id].cpu.length-1],
      memory: (this.recordData[id] === undefined) ? 0 : this.recordData[id].memory[this.recordData[id].memory.length-1]
    }
  }

	//Get Container Record
	getContainerRecord(id) {
    if (this.data[id] === undefined) return undefined

		return {
			cpu: (this.recordData[id] === undefined) ? [0] : this.recordData[id].cpu,
			memory: (this.recordData[id] === undefined) ? [0] : this.recordData[id].memory
		}
	}

  //Get Container Shortcuts
  getContainerShortcuts (id) {
    if (this.data[id] === undefined) return undefined

    return this.data[id].shortcuts
  }

  //Check Container State
  async checkContainerState (id) {
    for (let item of await Docker.getRunningContainers()) {
      if (item.Names === `lightpanel-${id}`) {
        if (this.data[id].state === 'idle') this.data[id].state = 'running'

        if (this.#core.ttyManager.ttys[id] === undefined) this.#core.ttyManager.addTTY(id, await Docker.getContainerTTY(`lightpanel-${id}`))

        return
      }
    }

    if (this.data[id].state === 'running') {
      this.data[id].state = 'idle'

      if (this.#core.ttyManager.ttys[id] !== undefined) this.#core.ttyManager.removeTTY(id)
    }
  }

  //Change Container State
  async changeState (id) {
    if (this.data[id] === undefined) return { error: true, content: 'Container Not Found' }
    
    await this.checkContainerState(id)

    if (this.data[id].state === 'idle') {
      this.data[id].state = 'starting'

      let data = await Docker.startContainer(`lightpanel-${id}`, `lightpanel-${this.#core.template.getTemplate(this.data[id].template).id}`, getPath(this.#core.path, ['Containers', id, 'Content']), this.data[id].maxCPU, this.data[id].maxMemory, this.data[id].networkPort)

      this.data[id].state = 'running'

      this.#core.ttyManager.addTTY(id, data.tty)
    } else if (this.data[id].state === 'running') {
      this.data[id].state = 'stopping'

      await Docker.stopContainer(`lightpanel-${id}`)

      this.data[id].state = 'idle'

      this.#core.ttyManager.removeTTY(id)
    } else return { error: true, content: 'Can Not Change State', state: this.data[id].state }

    this.save()

    return { error: false }
  }

  //Add Container Record
  addRecord (id, cpu, memory) {
    if (this.recordData[id] === undefined) this.recordData[id] = { cpu: [cpu], memory: [memory] }
    else {
      this.recordData[id].cpu.push(cpu)
      this.recordData[id].memory.push(memory)

      if (this.recordData[id].cpu.length > 120) this.recordData[id].cpu.splice(0, 1)
      if (this.recordData[id].memory.length > 120) this.recordData[id].memory.splice(0, 1)
    }
  }

  //Get Container Log
  getContainerLog (id) {
    if (this.logData[id] === undefined) return { error: true, content: 'Log Data Not Found' }
    else return { error: false, data: this.logData[id].join('\n') }
  }

  //Add Container Log
  addContainerLog (id, content) {
    if (this.logData[id] === undefined) return { error: true, content: 'Log Data Not Found' }
    else {
      let lines = content.split('\n')

      this.logData[id][this.logData[id].length-1]+=lines[0]

      lines.splice(0, 1)

      this.logData[id] = this.logData[id].concat(lines)
       
      while (this.logData[id].length > 100) this.logData[id].splice(0, 1)

      return { error: false }
    }
  }
}

const parseMemoryUsage = require('./Tools/ParseMemoryUsage')
const generateID = require('./Tools/GenerateID')
const getPath = require('./Tools/GetPath')

const Docker = require('./Docker')
