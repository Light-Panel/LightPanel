import { getTranslation } from '/Script/Translation.js'
import { displayFeatures } from '/Script/PageAPI.js'
import { Component } from '/Script/UI.js'

(async () => {
  displayFeatures('global')

  const page = document.getElementById('page')
  
  let div = page.appendChild(Component.div({ style: { display: 'flex', marginTop: '[0.5ps]', width: 'calc(100vw - [10ps])' }}))
  let input_search = div.appendChild(Component.input('text', '', { style: { flex: 1, marginLeft: '[0.5ps]', marginRight: '[0.5ps]' }}, getTranslation('ui>>搜尋容器')))
  let button_create = div.appendChild(Component.button(getTranslation('ui>>創建容器'), () => '', { style: { marginRight: '[0.5ps]' }}))
})()