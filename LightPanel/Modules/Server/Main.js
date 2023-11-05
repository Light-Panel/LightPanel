//Server API
module.exports = class {
  #core

  constructor (path, options) {
    this.#core = new Core(path, options)
  }
}

const Core = require('./Core')