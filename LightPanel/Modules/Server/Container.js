const fs = require('fs')

//Container
module.exports = class {
  #core

  constructor (core) {
    this.#core = core

    this.data = {}
    this.logData = {}

    this.load()

    Object.keys(this.data).forEach((item) => {
      if (this.data[item].state === 'building') this.buildContainer(item)
    })
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

    //10 Second
    setInterval(() => this.saveLogData(), 10000)
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

    Object.keys(templateData.parameters)

    let id = generateID(10, Object.keys(this.data))

    this.data[id] = {
      state: 'idle',

      name,

      template,
      templateParameters: Object.assign(templateParameters, templateParametersData),

      maxCPU,
      maxMemory,
      networkPort
    }

    this.save()

    fs.mkdirSync(getPath(this.#core.path, ['Containers', id]))
    fs.mkdirSync(getPath(this.#core.path, ['Containers', id, 'Content']))
    fs.writeFileSync(getPath(this.#core.path, ['Containers', id, 'log.txt']), '')

    this.logData[id] = []

    return { error: false, id }
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