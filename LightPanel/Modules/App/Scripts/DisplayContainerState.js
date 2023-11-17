import { showPromptMessage } from '/Script/PromptMessage.js'
import { event, createInterval } from '/Script/PageAPI.js'
import { getTranslation } from '/Script/Translation.js'
import { data, sendRequest } from '/Script/Session.js'
import { Component, FontSize } from '/Script/UI.js'

//Display Container State
export default (id) => {
  const page = document.getElementById('page')

  const div = page.appendChild(Component.div({ style: { flexShrink: 0, display: 'flex', backgroundColor: 'var(--mainColor_dark)', border: '[0.1ps] solid var(--mainColor_border)', borderRadius: '[0.5ps]', boxSizing: 'border-box', marginTop: '[1ps]', width: 'calc(100vw - [13ps])', overflow: 'hidden' }}))
  const div2 = div.appendChild(Component.div({ style: { flex: 1 }}))
  const text_name = div2.appendChild(Component.text(FontSize.title2, '', { style: { marginLeft: '[1ps]', marginTop: '[0.75ps]' }}))
  const div3 = div2.appendChild(Component.div({ style: { display: 'flex' }}))
  const text_state = div3.appendChild(Component.text(FontSize.subTitle2, '', { style: { flex: 1, marginLeft: '[1ps]' }}))
  const text_networkPort = div3.appendChild(Component.text(FontSize.subTitle2, '', { style: { flex: 1 }}))
  const div4 = div2.appendChild(Component.div({ style: { display: 'flex', marginBottom: '[0.75ps]' }}))
  const text_cpu = div4.appendChild(Component.text(FontSize.subTitle2, '', { style: { flex: 1, marginLeft: '[1ps]' }}))
  const text_memory = div4.appendChild(Component.text(FontSize.subTitle2, '', { style: { flex: 1 }}))
  const div5 = div.appendChild(Component.div({ style: { backgroundColor: 'var(--mainColor)', width: '[3ps]', cursor: 'pointer' }}))
  const div6 = div5.appendChild(Component.div({ class: 'hover_changeState', style: { center: 'row column', width: '[3ps]', height: '100%' }}))

  let state = false

  event(div6, 'click', async () => {
    if (!state) {
      state = true
      div6.style.opacity = 0.5
      
      let response = await sendRequest({ type: 'changeContainerState', id })

      if (response.error) showPromptMessage('var(--errorColor)', getTranslation('ui>>無法改變容器的狀態'), getTranslation('ui>>請稍候再試'))

      state = false
      div6.style.opacity = 1
    } else showPromptMessage('var(--errorColor)', getTranslation('ui>>無法改變容器的狀態'), getTranslation('ui>>請稍候再試'))
  })

  let oldContainerState

  //Update Container Info
  async function update () {
    data.containerInfo = await sendRequest({ type: 'getContainerInfo', id })

    if (data.containerInfo.state !== oldContainerState) {
      oldContainerState = data.containerInfo.state

      let image
      if (oldContainerState === 'running' || oldContainerState === 'starting') image = Component.svgImage('/Image/Stop.svg', { style: { width: '[1.5ps]' }})
      else if (oldContainerState === 'idle' || oldContainerState === 'stopping') image = Component.svgImage('/Image/Start.svg', { style: { width: '[1.5ps]' }})
    
      if (div6.firstChild === null) div6.appendChild(image)
      else div6.replaceChild(image, div6.firstChild)
    }

    text_state.innerHTML = `${getTranslation('ui>>狀態')}: ${getTranslation(`ui>>${data.containerInfo.state}`)}`
    text_networkPort.innerHTML = `${getTranslation('ui>>網路端口')}: ${data.containerInfo.networkPort}`
    text_name.innerHTML = data.containerInfo.name
    text_cpu.innerHTML = `CPU: ${data.containerInfo.cpuRecord[data.containerInfo.cpuRecord.length-1]}%`
    text_memory.innerHTML = `${getTranslation('ui>>記憶體')}: ${data.containerInfo.memoryRecord[data.containerInfo.memoryRecord.length-1]}MB / ${data.containerInfo.maxMemory}MB`
  }

  update()
  createInterval(1000, () => update())
}