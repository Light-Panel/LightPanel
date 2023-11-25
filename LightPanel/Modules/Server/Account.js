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
            
            settings: {
              language: 'zh-TW',
							theme: 'Default',
							cachePage: true,
							syncSettings: true
						},

            shortkeys: {}
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
  createAccount (name, password, permissions) {
    if (this.data.accounts[name] !== undefined) return { error: true, content: 'Duplicate Account Name' }

    this.data.accounts[name] = {
      password: encrypt(this.data.secret, this.data.iv, password),

      permissions,
      containers: [],

      settings: {
        language: 'zh-TW',
        theme: 'Default',
        cachePage: true,
				syncSettings: true
      },

      shortkeys: {}
    }

    return { error: false }
  }

  //Login
  login (name, password) {
    if (this.data.accounts[name] === undefined) return { error: true, content: 'Account Not Found' }
    else if (password !== decrypt(Buffer.from(this.data.secret), Buffer.from(this.data.iv), this.data.accounts[name].password)) return { error: true, content: 'Wrong Password' }
    else return { error: false, session: this.#core.session.createSession(name) }
  }

  //Get Account Info
  getAccountInfo (name) {
    if (this.data.accounts[name] === undefined) return undefined
    else {
      return { 
        permissions: this.data.accounts[name].permissions,
        containers: (this.data.accounts[name].permissions.includes('manageContainers')) ? Object.keys(this.#core.container.data) : this.data.accounts[name].containers,
      
        settings: this.data.accounts[name].settings,
				shortkeys: this.data.accounts[name].shortkeys
			}
    }
  }

	//Save Account Settings
	saveAccountSettings (name, settings, shortkeys) {
    if (this.data.accounts[name] === undefined) return { error: true, content: 'Account Not Found' }

		if (typeof settings.language !== 'string') return { error: true, content: 'Parameter Type Error', key: 'language', type: 'string'  }
	  if (typeof settings.theme !== 'string') return { error: true, content: 'Parameter Type Error', key: 'theme', type: 'string' }
    if (typeof settings.cachePage !== 'boolean') return { error: true, content: 'Parameter Type Error', key: 'cachePage', type: 'boolean' }
	  if (typeof settings.syncSettings !== 'boolean') return { error: true, content: 'Parameter Type Error', key: 'syncSettings', type: 'boolean' }

		if (typeof shortkeys !== 'object') return { error: true, content: 'Parameter Type Error', key: 'shortkeys', type: 'object' }

    this.data.accounts[name].settings = settings
		this.data.accounts[name].shortkeys = shortkeys

		return { error: false }
	}
}

const { encrypt, decrypt } = require('./Tools/Encryption')
const getPath = require('./Tools/GetPath')

