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

    this.data[id] = {
      accountName,

      createTime: performance.now()
    }

    return id
  }

  //Check If Session Exist
  checkSession (sessionID) {
    return this.data[sessionID] !== undefined
  }
}

const generateID = require('./Tools/GenerateID')