import { loadPage, displayFeatures, event } from '/Script/PageAPI.js'
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
  const div2 = page.appendChild(Component.div({ style: { display: 'flex', flexWrap: 'wrap', center: 'row', width: 'calc(100vw - [12ps])' }}))

  event(input_search, 'change', () => displayContainers(input_search.value))

  async function displayContainers (name) {
    let containersInfo = {}

		for (let item of data.accountInfo.containers) {
			containersInfo[item] = await sendRequest({ type: 'getContainerInfo', id: item })
		}

		while (div2.firstChild) div2.remove(div2.firstChild)

    data.accountInfo.containers.forEach((item) => {
      if (name === undefined || containersInfo[item].name.includes(name)) {
        const div3 = div2.appendChild(Component.div({ style: { backgroundColor: 'var(--mainColor_dark)', border: '[0.1ps] solid var(--mainColor_border)', borderRadius: '[0.5ps]', boxSizing: 'border-size', marginLeft: '[0.25ps]', marginRight: '[0.25ps]', marginBottom: '[0.5ps]', width: '[20ps]', overflow: 'hidden', cursor: 'pointer' }}))
				div3.appendChild(Component.text(FontSize.title2, containersInfo[item].name, { style: { marginLeft: '[0.5ps]', marginTop: '[0.2ps]', whiteSpace: 'nowrap' }}))
        const div4 = div3.appendChild(Component.div({ style: { display: 'flex', marginLeft: '[0.5ps]', marginBottom: '[0.25ps]', width: '[19.5ps]' }}))
				div4.appendChild(Component.text(FontSize.subTitle2, `CPU: ${containersInfo[item].cpuRecord[containersInfo[item].cpuRecord.length-1]}%`, { style: { flex: 1, whiteSpace: 'nowrap' }}))
			  div4.appendChild(Component.text(FontSize.subTitle2, `${getTranslation('ui>>記憶體')}: ${containersInfo[item].memoryRecord[containersInfo[item].memoryRecord.length-1]}MB / ${containersInfo[item].maxMemory}MB`, { style: { flex: 1, whiteSpace: 'nowrap' }}))
			  const div5 = div3.appendChild(Component.div({ style: { display: 'flex', marginLeft: '[0.5ps]', marginBottom: '[0.5ps]', width: '[19.5ps]' }}))
			  const canvas_cpu = div5.appendChild(Component.canvas({ style: { flex: 1, backgroundColor: 'var(--subColor)', border: '[0.1ps] solid var(--mainColor_border)', borderRadius: '[0.5ps]', boxSizing: 'border-box', marginRight: '[0.5ps]', height: '[3ps]' }}))
        const canvas_memory = div5.appendChild(Component.canvas({ style: { flex: 1, backgroundColor: 'var(--subColor)', border: '[0.1ps] solid var(--mainColor_border)', borderRadius: '[0.5ps]', boxSizing: 'border-box', marginRight: '[0.5ps]', height: '[3ps]' }}))

				drawGraph(canvas_cpu, containersInfo[item].cpuRecord, 100)
				drawGraph(canvas_memory, containersInfo[item].memoryRecord, containersInfo[item].maxMemory)
			
        event(div3, 'click', () => loadPage(`Container?id=${item}`))
			}
		})
	}

	displayContainers()
})()
