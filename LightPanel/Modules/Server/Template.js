const path = require('path')
const fs = require('fs')

//Template
module.exports = class {
  #core

  constructor (core) {
    this.#core = core
    
    this.data = {}

    this.load()
  }

  //Load Templates
  load () {
    this.#core.checkFiles()

    this.data = JSON.parse(fs.readFileSync(getPath(this.#core.path, ['TemplatesInfo.json'])))

    fs.readdirSync(getPath(this.#core.path, ['Templates'])).forEach((item) => {
      let name = path.parse(item).name

      let data = JSON.parse(fs.readFileSync(getPath(this.#core.path, ['Templates', `${name}.json`])))
  
      if (this.data[name] === undefined) {
        let id = generateID(5, Object.keys(this.data).map((item) => this.data[item].id))

        this.data[name] = {
          state: 'building',

          id: generateID(5, Object.keys(this.data).map((item) => this.data[item].id)),

          parameters: data.parameters,
          shortcuts: data.shortcuts
        }

        this.buildTemplate(name, data)
      } else if (this.data[name].state === 'building') this.buildTemplate(name, data)
    })

    let ids = Object.keys(this.data).map((item) => this.data[item].id)

    fs.readdirSync(getPath(this.#core.path, ['TemplatesBuildData']), (item) => {
      if (!ids.includes(item)) fs.unlinkSync(getPath(this.#core.path, ['TemplatesBuildData', item]))
    })

    this.save()
  }

  //Save Templates Info
  save () {
    this.#core.checkFiles()

    fs.writeFileSync(getPath(this.#core.path, ['TemplatesInfo.json']), JSON.stringify(this.data))
  }

  //Build Template
  async buildTemplate (name, data) {
    this.#core.log('running', getTranslation('log>>正在建構範本 {template} (這可能會花費一段時間)', { template: name }))

    let checkResult = this.checkTemplate(data)
    
    if (data.error) this.#core.log('warn', getTranslation('log>>無法建構範本 {template} (原因: 參數 {parameter} 的類型錯誤，應該為 <{type}>)', { template: name, parameter: checkResult.key, type: checkResult.type }))
    else {
      let start = performance.now()

      fs.writeFileSync(getPath(this.#core.path, ['TemplatesBuildData', `${this.data[name].id}.txt`]), applyParameters('FROM ubuntu\n\n{installEnv}\n\{installCommands}\n\nCMD {startCommand}', { installEnv: data.installEnv.map((item) => `ENV ${item}`).join('\n'), installCommands: data.installCommands.map((item) => `RUN ${item}`).join('\n'), startCommand: data.startCommand.map((item2) => `"${item2}"`).join(' ') }))
    
      let buildResult = await Docker.buildImage(`lightpanel-${this.data[name].id}`, getPath(this.#core.path, ['TemplatesBuildData']), getPath(this.#core.path, ['TemplatesBuildData', `${this.data[name].id}.txt`]))

      if (buildResult.error) {
        this.#core.log('warn', getTranslation('log>>範本構建失敗 {template} (原因: {reason})', { template: name, reason: buildResult.message.replaceAll('\n', '') }))
      } else {
        this.data[name].state = 'builded'

        this.save()

        this.#core.log('complete', getTranslation('log>>成功建構範本 {template} (花費 {time}s)', { template: name, time: parseFloat((performance.now()-start)/1000).toFixed(2) }))
      }
    }
  }  

  //Get All Templates
  getAllTemplates () {
    let data = []

    Object.keys(this.data).forEach((item) => {
      if (this.data[item].state === 'builded') data.push(item)
    })

    return data
  }

  //Get Template
  getTemplate (name) {
    return this.data[name]
  }

  //Check Template
  checkTemplate (data) {
    if (typeof data.parameters !== 'object' || data.parameters === null) return { error: true, content: 'Parameter Type Error', key: 'parameters', type: 'object' }
    for (let item of Object.keys(data.parameters)) {
      if (typeof data.parameters[item].label !== 'string') return { error: true, content: 'Parameter Type Error', key: `parameters.${item}.name`, type: 'string' }
      if (typeof data.parameters[item].value !== 'string') return { error: true, content: 'Parameter Type Error', key: `parameters.${item}.value`, type: 'string' }
    }

    if (!Array.isArray(data.installEnv)) return { error: true, content: 'Parameter Type Error', key: 'installEnv', type: 'array' }
    if (!Array.isArray(data.installCommands)) return { error: true, content: 'Parameter Type Error', key: 'installCommands', type: 'array' }
    if (!Array.isArray(data.startCommand)) return { error: true, content: 'Parameter Type Error', key: 'startCommand', type: 'array' }

    if (typeof data.shortcuts !== 'object' || data.shortcuts === null) return { error: true, content: 'Parameter Type Error', key: 'shortcuts', type: 'object' }
    for (let item of Object.keys(data.shortcuts)) {
      if (typeof data.shortcuts[item] !== 'string') return { error: true, content: 'Parameter Type Error', key: `shortcuts.${item}`, type: 'string' }
    }
  
    return { error: false }
  }
}

const applyParameters = require('./Tools/ApplyParameters')
const { getTranslation } = require('./Tools/Translation')
const generateID = require('./Tools/GenerateID')
const getPath = require('./Tools/GetPath')

const Docker = require('./Docker')

//rm -r Data/Templates && rm -r Data/TemplatesBuildData && rm Data/TemplatesInfo.json