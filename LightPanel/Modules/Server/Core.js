const wcwidth = require('wcwidth')
const crypto = require('crypto')
const fs = require('fs')
const os = require('os')

//Core (Private API)
module.exports = class {
  #path
  #options
  #info

  constructor (path, options) {
    this.#options = Object.assign({
      language: 'zh-TW',
      
      port: 8080,

      log: true
    }, options)

    loadTranslation(this.#options.language)

    if (!fs.existsSync(path)) throw new Error(getTranslation('error>>找不到資料夾 {path}', { path }))
    if (!fs.statSync(path).isDirectory()) throw new Error(getTranslation('error>>{path} 不是一個資料夾', { path }))

    this.#path = path
    this.#info = Object.assign(JSON.parse(fs.readFileSync(getPath(__dirname, ['<', 'Info.json']))), { platform: os.platform(), toltalMemory: Math.round(os.totalmem()/1000000) })

    this.checkFiles()

    console.log('')
    this.log('hint', getTranslation('log>>- Light Panel -\n\n版本: {version}\n平台: {platform}\n\n面板端口: {port}\n', { version: this.#info.version, platform: os.platform(), port: this.#options.port }))
    
    this.template = new Template(this)
    this.container = new Container(this)
    this.account = new Account(this)
    this.session = new Session(this)

    this.httpServer = startHttpServer(this)
    this.socketServer = startSocketServer(this, this.httpServer)
  }

  get path () {return this.#path}
  get options () {return this.#options}
  get info () {return this.#info}

  //Log
  log (type, content) {
    const logTypes = ['running', 'complete', 'warn', 'error', 'hint']

    if (!logTypes.includes(type)) throw new Error(getTranslation('找不到日誌類型 ${type}', { type }))
    if (this.#options.log) console.log(`${['', '\x1b[92m', '\x1b[93m', '\x1b[91m', '\x1b[95m'][logTypes.indexOf(type)]}[${getTranslation(`log>>${type}`)}]: ${content.split('\n').map((item, index) => (index > 0) ? `${' '.repeat(wcwidth(`[${getTranslation(`log>>${type}`)}]: `))}${item}` : item).join('\n')}\x1b[97m`)
  }

  //Check Files
  checkFiles () {
    if (!fs.existsSync(this.#path)) throw new Error(getTranslation('error>>找不到資料夾 [{path}]', { path }))

    if (!fs.existsSync(getPath(this.#path, ['Secret.json']))) fs.writeFileSync(getPath(this.#path, ['Secret.json']), JSON.stringify({ secret: crypto.randomBytes(32), iv: crypto.randomBytes(16) }))
    if (!fs.existsSync(getPath(this.#path, ['Accounts.txt']))) fs.writeFileSync(getPath(this.#path, ['Accounts.txt']), '')
    if (!fs.existsSync(getPath(this.#path, ['TemplatesInfo.json']))) fs.writeFileSync(getPath(this.#path, ['TemplatesInfo.json']), '{}')
    if (!fs.existsSync(getPath(this.#path, ['Containers.json']))) fs.writeFileSync(getPath(this.#path, ['Containers.json']), '{}')
    if (!fs.existsSync(getPath(this.#path, ['Templates']))) {
      fs.mkdirSync(getPath(this.#path, ['Templates']))
      fs.readdirSync(getPath(__dirname, ['<', '<', 'Data', 'Templates'])).forEach((item) => fs.writeFileSync(getPath(this.#path, ['Templates', item]), fs.readFileSync(getPath(__dirname, ['<', '<', 'Data', 'Templates', item]))))
    }
    if (!fs.existsSync(getPath(this.#path, ['TemplatesBuildData']))) fs.mkdirSync(getPath(this.#path, ['TemplatesBuildData']))
    if (!fs.existsSync(getPath(this.#path, ['Containers']))) fs.mkdirSync(getPath(this.#path, ['Containers']))
    if (!fs.existsSync(getPath(this.#path, ['Themes']))) fs.mkdirSync(getPath(this.#path, ['Themes']))
  }
}

const { loadTranslation, getTranslation } = require('./Tools/Translation')
const getPath = require('./Tools/GetPath')

const startSocketServer = require('./SocketServer')
const startHttpServer = require('./HttpServer')
const Container = require('./Container')
const Template = require('./Template')
const Session = require('./Session')
const Account = require('./Account')