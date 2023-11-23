export { loadShortkey, getUserShortkeys, shortkeyEvent, clearEvents }

let shortkeys
let events = {}

let keyPressed = {}
window.addEventListener('keydown', (e) => {
  if (e.key !== undefined) {
		keyPressed[e.key.toLowerCase()] = true

		Object.keys(shortkeys).forEach((item) => {
  	  let state = true

			shortkeys[item].split('+').forEach((item2) => {
				if (keyPressed[item2] === undefined) state = false
			})

			if (state && events[item] !== undefined) events[item].forEach((item2) => item2())
		})
	}
})
window.addEventListener('keyup', (e) => {
  if (e.key !== undefined) delete keyPressed[e.key.toLowerCase()]
})

//Load Shortkey
function loadShortkey () {
  if (window.localStorage.getItem('shortkeys') === null) {
    let defaultShortkeys = getDefaultShortkeys()

    let object = {}
    Object.keys(defaultShortkeys).forEach((item) => object[item] = defaultShortkeys[item].key)

    window.localStorage.setItem('shortkeys', JSON.stringify(object))
  }

  shortkeys = JSON.parse(window.localStorage.getItem('shortkeys'))
}

//Get Users Shortkeys
function getUserShortkeys () {
  let defaultShortkeys = getDefaultShortkeys()

  let object = {}
  Object.keys(defaultShortkeys).forEach((item) => {
    object[item] = { name: defaultShortkeys[item].name, key: shortkeys[item] }
  })

  return object
}

//Get All Defalut Shortkeys
function getDefaultShortkeys () {
  return {
    fastComplete: { name: '快速完成', key: 'enter' },
    refreshPage: { name: '快速刷新', key: 'control+r' }
  }
}

//Shortkey Event
function shortkeyEvent (name, callback) {
  if (events[name] === undefined) events[name] = []

	events[name].push(callback)
}

//Clear Events
function clearEvents () {
  events = {}
}
