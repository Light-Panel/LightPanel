import { socket, data, sendRequest } from '/Script/Session.js'
import { showPromptMessage } from '/Script/PromptMessage.js'
import { event, createInterval } from '/Script/PageAPI.js'
import { encrypt, decrypt } from '/Script/Encryption.js'
import { getTranslation } from '/Script/Translation.js'
import { Component, FontSize } from '/Script/UI.js'

//Display Container State
export default async (id) => {
  const page = document.getElementById('page')
  const script = document.getElementById('script')

  const div = page.appendChild(Component.div({ style: { flexShrink: 0, display: 'flex', backgroundColor: 'var(--mainColor_dark)', border: '[0.1ps] solid var(--mainColor_border)', borderRadius: '[0.5ps]', boxSizing: 'border-box', marginTop: '[0.5ps]', marginBottom: '[0.5ps]', width: 'calc(100vw - [12ps])', overflow: 'hidden' }}))
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
      else {
				await update()
				await updateTTY()
			}

      state = false
      div6.style.opacity = 1
    } else showPromptMessage('var(--errorColor)', getTranslation('ui>>無法改變容器的狀態'), getTranslation('ui>>請稍候再試'))
  })

  let oldContainerState

  //Update Container Info
  async function update () {
    let response = await sendRequest({ type: 'getContainerInfo', id })

		if (data.containerInfo === undefined || data.containerInfo.id !== response.id) {
      data.containerInfo = response

			response = await sendRequest({ type: 'getContainerRecord', id })

			data.containerInfo.cpuRecord = response.cpu
			data.containerInfo.memoryRecord = response.memory
		} else {
			data.containerInfo.state = response.state
			data.containerInfo.cpu = response.cpu
      data.containerInfo.memory = response.memory
			data.containerInfo.storage = response.storage
			data.containerInfo.networkPort = response.networkPort

			data.containerInfo.cpuRecord.push(data.containerInfo.cpu)
			data.containerInfo.memoryRecord.push(data.containerInfo.memory)

			if (data.containerInfo.cpuRecord.length > 120) data.containerInfo.cpuRecord.splice(0, 1)
			if (data.containerInfo.memoryRecord.length > 120) data.containerInfo.memoryRecord.splice(0, 1)
		}

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
    text_cpu.innerHTML = `CPU: ${data.containerInfo.cpu}%`
    text_memory.innerHTML = `${getTranslation('ui>>記憶體')}: ${data.containerInfo.memory}MB / ${data.containerInfo.maxMemory}MB`
  }

  //Update TTY Connection
  async function updateTTY () {
		if (data.ttyConnection === undefined) {
      data.ttyConnection = {
        connected: false,
  
        id,
        token: undefined,
        handler: (data2) => {
          let request = JSON.parse(decrypt(window.localStorage.getItem('sessionSecret'), data2))

          if (request.type === 'ttyUpdate' && request.token === data.ttyConnection.token) {
            data.ttyConnection.callEvent('update', request.data)

            socket.emit('response', { requestID: request.requestID })
          }
        },
  
        events: {},

        event: (name, callback) => {
          if (data.ttyConnection.events[name] === undefined) data.ttyConnection.events[name] = []

          data.ttyConnection.events[name].push(callback)
        },

        callEvent: (name, data2) => {
          if (data.ttyConnection.events[name] !== undefined) data.ttyConnection.events[name].forEach((item) => item(data2))
        },

        clearEvents: () => {
          data.ttyConnection.events = {}
        }
      }
    }

    if (data.containerInfo.state === 'running') {
      if (!data.ttyConnection.connected || id !== data.ttyConnection.id) {

				let response = await sendRequest({ type: 'connectTTY', id })

      	if (response.error) {
      	  showPromptMessage('var(--errorColor)', getTranslation('ui>>無法連接到控制台，正在重試'), getTranslation('ui>>如果持續出現此錯誤，請嘗試刷新頁面'))
      
     	    setTimeout(() => updateTTY(), 1000)
      	} else {
      	  data.ttyConnection.connected = true
      	  data.ttyConnection.id = id
      	  data.ttyConnection.token = (await sendRequest({ type: 'connectTTY', id })).token
  
          socket.on('request', data.ttyConnection.handler)
      	}

			 data.ttyConnection.callEvent('connect')
			}
    } else {
      data.ttyConnection.connected = false
			data.ttyConnection.id = undefined
			data.ttyConnection.token = undefined

			data.ttyConnection.callEvent('disconnect')
    }
  }

  await update()
  createInterval(1000, () => update())

  updateTTY()

  event(script, 'leavePage', (e) => {
    data.ttyConnection.clearEvents()
   
    if (new URL(`${window.location.protocol}//${window.location.host}/${e.detail.name}`).pathname !== '/Container') {
      data.ttyConnection.connected = false  
      
      socket.off('request', data.ttyConnection.handler)
    }
  })
}
