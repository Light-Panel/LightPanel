const fs = require('fs')

//Container
module.exports = class {
  #core

  constructor (core) {
    this.#core = core

    this.data = {}
    this.logData = {}
    this.terminals = {}

    this.load()

    Object.keys(this.data).forEach((item) => {
      if (this.data[item].state === 'building') this.buildContainer(item)
    })

    //Update Container State
    setInterval(async () => {
      (await Docker.getContainersState()).forEach((item) => {
        if (item.Name.substring(0, 10) === 'lightpanel') {
          let id = item.Name.split('-')[1]

          this.data[id].cpuRecord.push(+item.CPUPerc.replace('%', ''))

        }
      })
    }, 1000)

    //Save Log Data
    setInterval(() => this.saveLogData(), 10000)
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
  createContainer (name, template, templateParameters, maxCPU, maxMemory, networkPort) {
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

      maxCPU,
      maxMemory,
      networkPort,

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
      networkPort: this.data[id].networkPort,

      cpuRecord: this.data[id].cpuRecord,
      memoryRecord: this.data[id].memoryRecord
    }
  }

  //Check Container State
  async checkContainerState (id) {
    for (let item of await Docker.getRunningContainers()) {
      if (item.Names === `lightpanel-${id}`) {
        if (this.data[id].state === 'idle') {
          this.data[id].state = 'running'

          if (this.terminals[id] === undefined) {} //get terminal
        }

        return
      }
    }

    if (this.data[id].state === 'running') {
      this.data[id].state = 'idle'

      if (this.terminals[id] !== undefined) delete this.terminals[id]
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

      this.terminals[id] = data.terminal 
    } else if (this.data[id].state === 'running') {
      this.data[id].state = 'stopping'

      await Docker.stopContainer(`lightpanel-${id}`)

      this.data[id].state = 'idle'

      delete this.terminals[id]
    } else return { error: true, content: 'Can Not Change State', state: this.data[id].state }

    this.save()

    return { error: false }
  }

  //Add Log
  addLog (id, content) {
    if (this.logData[id] === undefined) return { error: true, content: 'Log Data Not Found' }
    else {
      this.logData[id] = this.logData[id].concat(content.split('\n'))
       
      while (this.logData[id].length > 100) this.logData[id].splice(0, 1)

      return { error: false }
    }
  }
}

const generateID = require('./Tools/GenerateID')
const getPath = require('./Tools/GetPath')

const Docker = require('./Docker')