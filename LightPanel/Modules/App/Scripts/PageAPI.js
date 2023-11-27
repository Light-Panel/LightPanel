export { loadPage, displayFeatures, event, createInterval }

import { getTranslation } from '/Script/Translation.js'
import createElement from '/Script/CreateElement.js'
import { Component, FontSize } from '/Script/UI.js'
import { clearEvents } from '/Script/Shortkey.js'
import { getCookie } from '/Script/Cookie.js'

let pageCache = {}

let eventListeners = []
let timers = []

setInterval(() => {
  timers.forEach((item) => {
		if (performance.now()-item.lastUpdateTime > item.interval) {
      item.lastUpdateTime = performance.now()

      item.callback()
    }
  })
}, 1)

let featureType
let state = false

//Load Page
async function loadPage (name, updateFeatures) {
  if (!state) {
		state = true

		window.history.pushState({}, null, name)
 
		let data
		if (pageCache[name.split('?')[0]] === undefined) {
    	data = await (await fetch(`/Page/${name}`)).text()
	
  	  if (getCookie('cachePage') === 'true') pageCache[name.split('?')[0]] = data
		} else data = pageCache[name.split('?')[0]]

  	const script = document.getElementById('script')
  	const page = document.getElementById('page')

  	while (page.firstChild) page.removeChild(page.firstChild)

  	if (script !== null) {
    	script.dispatchEvent(new CustomEvent('leavePage', { detail: { name }}))
      
			clearEvents()

    	eventListeners.forEach((item) => {
    	  if (item.method === undefined) item.target.removeEventListener(item.name, item.callback)
    	  else if (item.method === 'on') item.target.off(item.name, item.callback)
    	})

    	eventListeners = []
    	timers = []

    	script.remove()
  	}

  	if (updateFeatures === true) featureType = undefined

    state = false

  	if (data === 'Resource Not Found') await loadPage('Containers')
	  else document.body.appendChild(createElement('script', { id: 'script', innerHTML: data, type: 'module' }))
	}
}

let featuresPageName = []

window.addEventListener('keydown', (e) => {
  if (!isNaN(+e.key)) {
    if (document.activeElement === document.body && featuresPageName[+e.key-1] !== undefined) loadPage(featuresPageName[+e.key-1])
	}
})

//Display Features
function displayFeatures (type) {
  if (featureType !== type) {
    featureType = type
		featuresPageName = []

    const features = document.getElementById('features')
    while (features.firstChild) features.removeChild(features.firstChild)

    if (type === 'global') {
      addFeature(getTranslation('ui>>容器'), 'Containers.svg', 'Containers')
      addFeature(getTranslation('ui>>範本'), 'Image.svg', 'Templates')
      addFeature(getTranslation('ui>>用戶管理'), 'Users.svg', 'Users')
      addFeature(getTranslation('ui>>設定'), 'Settings.svg', 'Settings')
    } else if (type === 'container') {     
			let id = new URLSearchParams(window.location.search).get('id')

      addFeature(getTranslation('ui>>狀態'), 'Stats.svg', `Container?id=${id}&feature=state`)
      addFeature(getTranslation('ui>>控制台'), 'Terminal.svg', `Container?id=${id}&feature=console`)
      addFeature(getTranslation('ui>>檔案管理'), 'Folder.svg', `Container?id=${id}&feature=fileManager`)
      addFeature(getTranslation('ui>>設定'), 'Options.svg', `Container?id=${id}&feature=settings`)
    }
  }
}

//Add Feture To Feture Tab
function addFeature (label, image, pageName) {
  let div = document.getElementById('features').appendChild(Component.div({ style: { center: 'column', backgroundColor: 'var(--mainColor)', border: '[0.1ps] solid var(--mainColor_border)', borderRadius: '[0.5ps]', boxSizing: 'border-box', marginTop: '[0.5ps]', width: '[10ps]', height: '[2.5ps]', overflow: 'hidden', cursor: 'pointer' }}))
  if (image !== undefined) div.appendChild(Component.svgImage(`/Image/${image}`, { style: { height: '[1.25ps]', marginLeft: '[0.5ps]' }}))
  div.appendChild(Component.text(FontSize.subTitle2, label, { style: { marginLeft: '[0.5ps]' }}))

  div.onclick = () => loadPage(pageName)

	featuresPageName.push(pageName)
}

//Listen To Event
function event (target, name, callback, method) {
  if (method === undefined) target.addEventListener(name, callback)
  else target[method](name, callback)

  eventListeners.push({ target, name, callback, method })
}

//Create Interval
function createInterval (interval, callback) {
  timers.push({ interval, lastUpdateTime: performance.now(), callback })
}
