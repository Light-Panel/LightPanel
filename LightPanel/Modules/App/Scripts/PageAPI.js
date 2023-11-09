export { loadPage, displayFeatures, event }

import { getTranslation } from '/Script/Translation.js'
import createElement from '/Script/CreateElement.js'
import { Component, FontSize } from '/Script/UI.js'

let eventListeners = []

let featureType

//Load Page
async function loadPage (name) {
  window.history.pushState({}, null, name)
  
  let response = await (await fetch(`/Page/${name}`)).text()

  const script = document.getElementById('script')
  const page = document.getElementById('page')

  while (page.firstChild) page.removeChild(page.firstChild)

  if (script !== null) {
    eventListeners.forEach((item) => item.target.removeEventListener(item.name, item.callback))

    eventListeners = []

    script.remove()
  }

  if (response === 'Resource Not Found') await loadPage('Containers')
  else document.body.appendChild(createElement('script', { innerHTML: response, type: 'module' }))
}

//Display Features
function displayFeatures (type) {
  if (featureType !== type) {
    featureType = type

    const features = document.getElementById('features')
    while (features.firstChild) features.removeChild(features.firstChild)

    if (type === 'global') {
      addFeature(getTranslation('ui>>容器'), 'Containers.svg', 'Containers')
      addFeature(getTranslation('ui>>範本'), 'Image.svg', 'Templates')
      addFeature(getTranslation('ui>>用戶管理'), 'Users.svg', 'Users')
      addFeature(getTranslation('ui>>設定'), 'Settings.svg', 'Settings')
    }
  }
}

//Add Feture To Feture Tab
function addFeature (label, image, pageName) {
  let div = document.getElementById('features').appendChild(Component.div({ style: { center: 'column', height: '[3ps]', cursor: 'pointer' }}))
  if (image !== undefined) div.appendChild(Component.svgImage(`/Image/${image}`, { style: { height: '[1.5ps]', marginLeft: '[0.75ps]' }}))
  div.appendChild(Component.text(FontSize.title3, label, { style: { marginLeft: '[0.75ps]' }}))

  div.onclick = () => loadPage(pageName)
}

//Listen To Event
function event (target, name, callback) {
  target.addEventListener(name, callback)

  eventListeners.push({ target, name, callback })
}