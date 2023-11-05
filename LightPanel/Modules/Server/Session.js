//Session
module.exports = class {
  #core

  constructor (core) {
    this.core = core

    this.data = {}

    setInterval(() => {
      Object.keys(this.data).forEach((item) => {
        //1 Day
        if (performance.now()-this.data[item].createTime > 86400000) delete this.data[item]
      })
    }, 60000)
  }

  //Create Session
  createSession (accountName) {
    //Delete Session Open By The Same Account
    Object.keys(this.data).forEach((item) => {
      if (this.data[item].accountName === accountName) delete this.data[item]
    })

    let id = generateID(50, Object.keys(this.data))
    let secret = generateID(10, Object.keys(this.data).map((item) => this.data[item].secret))

    this.data[id] = {
      accountName,

      secret,

      createTime: performance.now()
    }

    return { id, secret }
  }

  //Check If Session Exist
  checkSession (sessionID) {
    return this.data[sessionID] !== undefined
  }

  //Get Session
  getSession (sessionID) {
    return this.data[sessionID]
  }
}

const generateID = require('./Tools/GenerateID')