export { loadPage, displayFeatures }

import { getTranslation } from '/Script/Translation.js'
import createElement from '/Script/CreateElement.js'
import { Component } from '/Script/UI.js'

let featureType

//Load Page
async function loadPage (name) {
  let response = await (await fetch(`/Page${name}`)).text()

  let script = document.getElementById('script')

  if (script !== null) script.remove()

  if (response === 'Resource Not Found') await loadPage('/Containers')
  else document.body.appendChild(createElement('script', { innerHTML: response, type: 'module' }))
}

//Display Features
function displayFeatures (type) {
  if (featureType !== type) {
    featureType = type

    const features = document.getElementById('features')
    while (features.firstChild) features.removeChild(features.firstChild)

    if (type === 'global') {
      addFeature(getTranslation('ui>>容器'), 'Containers.svg', '/Containers')
      addFeature(getTranslation('ui>>範本'), 'Image.svg', '/Templates')
      addFeature(getTranslation('ui>>用戶管理'), 'Users.svg', '/Users')
      addFeature(getTranslation('ui>>設定'), 'Settings.svg', '/Settings')
    }
  }
}

//Add Feture To Feture Tab
function addFeature (label, image, pageName) {
  let div = document.getElementById('features').appendChild(Component.div({ style: { center: 'column', height: '[2.5ps]', cursor: 'pointer' }}))
  if (image !== undefined) div.appendChild(Component.svgImage(`/Image/${image}`, { style: { height: '[1.25ps]', marginLeft: '[0.5ps]' }}))
  div.appendChild(Component.text(0.8, label, { style: { marginLeft: '[0.5ps]' }}))
}