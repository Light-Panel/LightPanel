import { loadPage, displayFeatures, event } from '/Script/PageAPI.js'
import { getTranslation } from '/Script/Translation.js'
import { data, sendRequest } from '/Script/Session.js'
import { Component } from '/Script/UI.js'

(async () => {
  data.accountInfo = await sendRequest({ type: 'getAccountInfo' })

  window.document.title = `Light Panel | ${getTranslation('ui>>容器')}`
  displayFeatures('global')

  const page = document.getElementById('page')
  
  const div = page.appendChild(Component.div({ style: { display: 'flex', marginTop: '[0.5ps]', width: 'calc(100vw - [11ps])' }}))
  const input_search = div.appendChild(Component.input('text', '', { style: { flex: 1, marginLeft: '[0.5ps]', marginRight: '[0.5ps]' }}, getTranslation('ui>>搜尋容器')))
  if (data.accountInfo.permissions.includes('manageContainers')) event(div.appendChild(Component.button(getTranslation('ui>>創建容器'), () => '', { style: { marginRight: '[0.5ps]' }})), 'click', () => loadPage('CreateContainer'))
})()