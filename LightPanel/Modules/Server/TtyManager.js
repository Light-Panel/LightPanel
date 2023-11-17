//TTY Manager
module.exports = class {
  #core

  constructor (core) {
    this.#core = core

    this.ttys = {}
    this.events = {}
  }

  //Add TTY
  addTTY (id, tty) {
    this.ttys[id] = {
      tty,
      event: this.onDataEvent(tty, (data) => this.#core.container.addContainerLog(id, data))
    }

    tty.write('\r')

    return { error: false }
  }

  //Remove TTY
  removeTTY (id) {
    if (this.ttys[id] === undefined) return { error: true, content: 'TTY Not Found' }

    this.ttys[id].event.stop()

    delete this.ttys[id]

    return { error: false }
  }

  //TTY Input
  ttyInput (id, data) {
    if (this.ttys[id] === undefined) return { error: true, content: 'TTY Not Found' }

    this.ttys[id].tty.write(data)

    return { error: false }
  }

  //Listen To TTY
  listenTTY (id, callback) {
    if (this.ttys[id] === undefined) return { error: true, content: 'TTY Not Found' }

    return { error: false, event: this.onDataEvent(this.ttys[id].tty, callback) }
  }

  //Listen To onData Event
  onDataEvent (target, callback) {
    target.onData(callback)

    this.events[generateID(5, Object.keys(this.events))] = callback
  
    return {
      stop: () => target.removeListener('onData', callback)
    }
  }
}

const generateID = require('./Tools/GenerateID')