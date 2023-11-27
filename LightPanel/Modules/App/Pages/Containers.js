import { loadPage, displayFeatures, event, createInterval } from '/Script/PageAPI.js'
import { showPromptMessage } from '/Script/PromptMessage.js'
import { getTranslation } from '/Script/Translation.js'
import { data, sendRequest } from '/Script/Session.js'
import { Component, FontSize } from '/Script/UI.js'
import drawGraph from '/Script/Graph.js'

(async () => {
  data.accountInfo = await sendRequest({ type: 'getAccountInfo' })

  window.document.title = `Light Panel | ${getTranslation('ui>>容器')}`
  displayFeatures('global')

  const page = document.getElementById('page')
  
  const div = page.appendChild(Component.div({ style: { display: 'flex', marginTop: '[0.5ps]', marginBottom: '[0.5ps]', width: 'calc(100vw - [11ps])' }}))
	const input_search = div.appendChild(Component.input('text', '', { style: { flex: 1, marginLeft: '[0.5ps]', marginRight: '[0.5ps]' }}, getTranslation('ui>>搜尋容器')))
  if (data.accountInfo.permissions.includes('manageContainers')) event(div.appendChild(Component.button(getTranslation('ui>>創建容器'), () => '', { style: { marginRight: '[0.5ps]' }})), 'click', () => loadPage('CreateContainer'))
  const div3 = page.appendChild(Component.div({ style: { display: 'flex', flexWrap: 'wrap', center: 'row', width: 'calc(100vw - [12ps])' }}))

  event(input_search, 'input', () => displayContainers(input_search.value))

	let containersInfo = {}

	async function updateContainersInfo () {
    for (let item of data.accountInfo.containers) {
      let response = await sendRequest({ type: 'getContainerInfo', id: item })
		
      if (response === undefined) delete containersInfo[item]
			else if (containersInfo[item] === undefined) {
				containersInfo[item] = response

				response = await sendRequest({ type: 'getContainerRecord', id: item })

				containersInfo[item].cpuRecord = response.cpu
				containersInfo[item].memoryRecord = response.memory
			} else {
				containersInfo[item].name = response.name

				containersInfo[item].cpuRecord.push(response.cpu)
				containersInfo[item].memoryRecord.push(response.memory)

				if (containersInfo[item].cpuRecord.length > 120) containersInfo[item].cpuRecord.splice(0, 1)
				if (containersInfo[item].memoryRecord.length > 120) containersInfo[item].memoryRecord.splice(0, 1)
			}
		}
	}

	let canvas = {}

  async function displayContainers (name) {
		while (div3.firstChild) div3.removeChild(div3.firstChild)

    data.accountInfo.containers.forEach((item) => {
      if (name === undefined || containersInfo[item].name.includes(name)) {
        const div4 = div3.appendChild(Component.div({ style: { backgroundColor: 'var(--mainColor_dark)', border: '[0.1ps] solid var(--mainColor_border)', borderRadius: '[0.5ps]', boxSizing: 'border-size', marginLeft: '[0.25ps]', marginRight: '[0.25ps]', marginBottom: '[0.5ps]', width: '[20ps]', overflow: 'hidden', cursor: 'pointer' }}))
				div4.appendChild(Component.text(FontSize.title2, containersInfo[item].name, { style: { marginLeft: '[0.5ps]', marginTop: '[0.2ps]', whiteSpace: 'nowrap' }}))
        const div5 = div4.appendChild(Component.div({ style: { display: 'flex', marginLeft: '[0.5ps]', marginBottom: '[0.25ps]', width: '[19.5ps]' }}))
				div5.appendChild(Component.text(FontSize.subTitle2, `CPU: ${containersInfo[item].cpu}%`, { style: { flex: 1, whiteSpace: 'nowrap' }}))
			  div5.appendChild(Component.text(FontSize.subTitle2, `${getTranslation('ui>>記憶體')}: ${containersInfo[item].memory}MB / ${containersInfo[item].maxMemory}MB`, { style: { flex: 1, whiteSpace: 'nowrap' }}))
			  const div6 = div4.appendChild(Component.div({ style: { display: 'flex', marginLeft: '[0.5ps]', marginBottom: '[0.5ps]', width: '[19.5ps]' }}))
			  const canvas_cpu = div6.appendChild(Component.canvas({ style: { flex: 1, backgroundColor: 'var(--subColor)', border: '[0.1ps] solid var(--mainColor_border)', borderRadius: '[0.5ps]', boxSizing: 'border-box', marginRight: '[0.5ps]', height: '[3ps]' }}))
        const canvas_memory = div6.appendChild(Component.canvas({ style: { flex: 1, backgroundColor: 'var(--subColor)', border: '[0.1ps] solid var(--mainColor_border)', borderRadius: '[0.5ps]', boxSizing: 'border-box', marginRight: '[0.5ps]', height: '[3ps]' }}))

				canvas[item] = { cpu: canvas_cpu, memory: canvas_memory } 

				drawGraph(canvas_cpu, containersInfo[item].cpuRecord, 100)
				drawGraph(canvas_memory, containersInfo[item].memoryRecord, containersInfo[item].maxMemory)
			
        event(div4, 'click', () => loadPage(`Container?id=${item}`))
			}
		})
	}

	await updateContainersInfo()
	displayContainers()

	createInterval(1000, async () => {
		await updateContainersInfo()

		Object.keys(canvas).forEach((item) => {
		  drawGraph(canvas[item].cpu, containersInfo[item].cpuRecord, 100)
			drawGraph(canvas[item].memory, containersInfo[item].memoryRecord, containersInfo[item].maxMemory)
		})
	})
})()
