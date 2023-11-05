const crypto = require('crypto')
const fs = require('fs')

//Account
module.exports = class {
  #core

  constructor (core) {
    this.#core = core

    this.secret = JSON.parse(fs.readFileSync(getPath(core.path, ['Secret.json']), 'utf8'))
    this.data = {}

    this.load()
  }

  //Load Account Data
  load () {
    this.#core.checkFiles()

    this.data = fs.readFileSync(getPath(this.#core.path, ['Accounts.txt']), 'utf8')
    if (this.data === '') {
      let secret = crypto.randomBytes(32)
      let iv = crypto.randomBytes(16)

      this.data = {
        accounts: {
          admin: {
            password: encrypt(Buffer.from(secret, 'hex'), Buffer.from(iv, 'hex'), 'aBc12345'),

            permissions: ['manageContainers', 'manageTemplates', 'manageUsers'],
            containers: [],

            shortcuts: {}
          }
        },
        secret,
        iv
      }

      this.save()
    } else this.data = JSON.parse(decrypt(Buffer.from(this.secret.secret), Buffer.from(this.secret.iv), this.data))
  }

  //Save Account Data
  save () {
    fs.writeFileSync(getPath(this.#core.path, ['Accounts.txt']), encrypt(Buffer.from(this.secret.secret, 'hex'), Buffer.from(this.secret.iv, 'hex'), JSON.stringify(this.data)))
  }

  //Create Account
  createAccount (name, password, permission) {
    if (this.data.accounts[name] !== undefined) return { error: true, content: 'Duplicate Account Name' }

    this.data.accounts[name] = {
      password: encrypt(this.data.secret, this.data.iv, password),

      permission,
      containers: [],

      shortcuts: {}
    }

    return { error: false }
  }

  //Login
  login (name, password) {
    if (this.data.accounts[name] === undefined) return { error: true, content: 'Account Not Found' }
    else if (password !== decrypt(Buffer.from(this.data.secret), Buffer.from(this.data.iv), this.data.accounts[name].password)) return { error: true, content: 'Wrong Password' }
    else return { error: false, session: this.#core.session.createSession(name) }
  }
}

const { encrypt, decrypt } = require('./Tools/Encryption')
const getPath = require('./Tools/GetPath')