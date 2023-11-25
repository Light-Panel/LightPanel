import { loadPage, displayFeatures, event } from '/Script/PageAPI.js'
import { showPromptMessage } from '/Script/PromptMessage.js'
import { getTranslation } from '/Script/Translation.js'
import { data, sendRequest } from '/Script/Session.js'
import { Component, FontSize } from '/Script/UI.js'

(async () => {
  data.accountInfo = await sendRequest({ type: 'getAccountInfo' })

  if (data.accountInfo.permissions.includes('manageContainers')) {
    data.allTemplates = await sendRequest({ type: 'getAllTemplates' })

    window.document.title = `Light Panel | ${getTranslation('ui>>創建容器')}`
    displayFeatures('global')
  
    const page = document.getElementById('page')
    
    const div = page.appendChild(Component.div({ style: { backgroundColor: 'var(--mainColor_dark)', border: '[0.1ps] solid var(--mainColor_border)', borderRadius: '[0.5ps]', boxSizing: 'border-box', marginTop: '[1ps]', marginBottom: '[1ps]', width: 'calc(100vw - [13ps])' }}))
    div.appendChild(Component.text(FontSize.title2, getTranslation('ui>>容器名稱'), { style: { marginLeft: '[1ps]', marginTop: '[0.75ps]', marginBottom: '[0.75ps]' }}))
    const input_name = div.appendChild(Component.input('text', '', { style: { marginLeft: '[1ps]', width: 'calc(100vw - [15ps])', marginBottom: '[1.15ps]' }}))
  
    const div2 = page.appendChild(Component.div({ style: { backgroundColor: 'var(--mainColor_dark)', border: '[0.1ps] solid var(--mainColor_border)', borderRadius: '[0.5ps]', boxSizing: 'border-box', marginBottom: '[1ps]', width: 'calc(100vw - [13ps])' }}))
    div2.appendChild(Component.text(FontSize.title2, getTranslation('ui>>範本'), { style: { marginLeft: '[1ps]', marginTop: '[0.75ps]', marginBottom: '[0.75ps]' }}))
    const select_template = div2.appendChild(Component.select(data.allTemplates.map((item) => {return { label: item, value: item }}), { main: { style: { marginLeft: '[1ps]', marginBottom: '[1.15ps]', width: 'calc(100vw - [15ps])' }}}, getTranslation('ui>>未選取')))
    const div3 = div2.appendChild(Component.div({ style: { backgroundColor: 'var(--mainColor)', borderRadius: '[0.5ps]', marginLeft: '[1ps]', width: 'calc(100vw - [15ps])' }}))

    let templateParameters = {}

    event(select_template, 'select', async (e) => {
      select_template.style.marginBottom = 'calc(calc(100vw + 100vh) / 100 * 0.575)'
      div3.style.border = 'calc(calc(100vw + 100vh) / 100 * 0.1) solid var(--mainColor_border)'
      div3.style.marginBottom = 'calc(calc(100vw + 100vh) / 100 * 1.15)'
      while (div3.firstChild) div3.removeChild(div3.firstChild)
      templateParameters = {}

      let template = await sendRequest({ type: 'getTemplate', name: e.detail })

      let keys = Object.keys(template.parameters)
      keys.forEach((item, index) => {
        const div4 = div3.appendChild(Component.div({ style: { display: 'flex', center: 'column', marginLeft: '[0.5ps]', marginTop: '[0.5ps]', marginBottom: (index === keys.length-1) ? '[0.5ps]' : '0px' }}))
        div4.appendChild(Component.text(FontSize.subTitle, `${template.parameters[item].label}:`, { style: { marginRight: '[0.5ps]' }}))
        templateParameters[item] = div4.appendChild(Component.input('text', template.parameters[item].value, { style: { marginRight: '[0.3ps]', padding: '[0.2ps]', paddingLeft: '[0.4ps]' }}))
        const div5 = div4.appendChild(Component.div({ class: 'hover_reset' }))
        div5.appendChild(Component.svgImage('/Image/Refresh.svg', { style: { width: '[1ps]', cursor: 'pointer' }}))

        event(div5, 'click', () => parameters[item].value = template.parameters[item].value)
      })
    })

    const div4 = page.appendChild(Component.div({ style: { backgroundColor: 'var(--mainColor_dark)', border: '[0.1ps] solid var(--mainColor_border)', borderRadius: '[0.5ps]', boxSizing: 'border-box', marginBottom: '[1ps]', width: 'calc(100vw - [13ps])' }}))
    div4.appendChild(Component.text(FontSize.title2, getTranslation('ui>>容器設定'), { style: { marginLeft: '[1ps]', marginTop: '[0.75ps]', marginBottom: '[0.75ps]' }}))
    const div5 = div4.appendChild(Component.div({ style: { backgroundColor: 'var(--mainColor)', border: '[0.1ps] solid var(--mainColor_border)', borderRadius: '[0.5ps]', boxSizing: 'border-box', marginLeft: '[1ps]', marginBottom: '[1.15ps]', width: 'calc(100vw - [15ps])' }}))
    const div6 = div5.appendChild(Component.div({ style: { display: 'flex', center: 'column', marginLeft: '[0.5ps]', marginTop: '[0.5ps]' }}))
    div6.appendChild(Component.text(FontSize.subTitle, `${getTranslation('ui>>最大 CPU (%)')}:`, { style: { marginRight: '[0.5ps]' }}))
    const input_maxCPU = div6.appendChild(Component.input('number', '100', { min: 1, max: data.panelInfo.cpus*100, style: { marginRight: '[0.5ps]', padding: '[0.2ps]', paddingLeft: '[0.4ps]', width: '[5.5ps]' }}))
    div6.appendChild(Component.text(FontSize.subTitle2, `(${getTranslation('ui>>每個核心算作 100%')})`, { style: { opacity: 0.5 }}))

    event(input_maxCPU, 'change', () => {
      if (input_maxCPU.value > data.panelInfo.cpus*100) input_maxCPU.value = 100
      else if (input_maxCPU.value < 1) input_maxCPU.value = 1
    })

    const div7 = div5.appendChild(Component.div({ style: { display: 'flex', center: 'column', marginLeft: '[0.5ps]', marginTop: '[0.5ps]' }}))
    div7.appendChild(Component.text(FontSize.subTitle, `${getTranslation('ui>>最大記憶體 (MB)')}:`, { min: 1, max: data.panelInfo.toltalMemory, style: { marginRight: '[0.5ps]' }}))
    const input_maxMemory = div7.appendChild(Component.input('number', '1024', { style: { padding: '[0.2ps]', paddingLeft: '[0.4ps]', width: '[5.5ps]' }}))

    event(input_maxMemory, 'change', () => {
      if (input_maxMemory.value > data.panelInfo.toltalMemory) input_maxMemory.value = data.panelInfo.toltalMemory
      else if (input_maxMemory.value < 1) input_maxMemory.value = 1
    })

    const div8 = div5.appendChild(Component.div({ style: { display: 'flex', center: 'column', marginLeft: '[0.5ps]', marginTop: '[0.5ps]' }}))
    div8.appendChild(Component.text(FontSize.subTitle, `${getTranslation('ui>>儲存空間 (GB)')}:`, { min: 1, style: { marginRight: '[0.5ps]' }}))
    const input_storage = div8.appendChild(Component.input('number', '10', { style: { padding: '[0.2ps]', paddingLeft: '[0.4ps]', width: '[5.5ps]' }}))

    event(input_storage, 'change', () => {
      if (input_storage.value < 1) input_storage.value = 1
    })
    
    const div9 = div5.appendChild(Component.div({ style: { display: 'flex', center: 'column', marginLeft: '[0.5ps]', marginTop: '[0.5ps]', marginBottom: '[0.5ps]' }}))
    div9.appendChild(Component.text(FontSize.subTitle, `${getTranslation('ui>>網路端口')}:`, { style: { marginRight: '[0.5ps]' }}))
    const input_networkPort = div9.appendChild(Component.input('number', '3000', { style: { padding: '[0.2ps]',paddingLeft: '[0.4ps]', width: '[5.5ps]' }}))

    let state = false

    page.appendChild(Component.button(getTranslation('ui>>創建容器'), async (element) => {
      if (!state) {
        if (input_name.value === '') showPromptMessage('var(--errorColor)', getTranslation('ui>>無法創建容器'), getTranslation('ui>>請入容器名')) 
        else if (select_template.value === undefined) showPromptMessage('var(--errorColor)', getTranslation('ui>>無法創建容器'), getTranslation('ui>>請選擇一個範本')) 
        else {
          state = true
          element.style.opacity = 0.5
  
          let templateParametersData = {}
  
          Object.keys(templateParameters).forEach((item) => templateParametersData[item] = templateParameters[item].value)
  
          let response = await sendRequest({ type: 'createContainer', name: input_name.value, template: select_template.value, templateParameters: templateParametersData, maxCPU: input_maxCPU.value, maxMemory: input_maxMemory.value, storage: input_storage.value, networkPort: input_networkPort.value })
        
          if (response.error) {
            console.log(response) 
          } else loadPage(`Container?id=${response.id}`)
        }
      }
    }, { style: { marginBottom: '[1ps]', width: '[7ps]' }}))
  } else loadPage('Containers')
})()
