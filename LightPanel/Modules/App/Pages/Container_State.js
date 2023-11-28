const page = document.getElementById('page')

const div = page.appendChild(Component.div({ style: { display: 'flex', marginTop: '[0.5ps]', marginBottom: '[0.5ps]', width: 'calc(100vw - [12ps])', height: 'calc(100vh - [10ps])', overflow: 'hidden' }}))
const div2 = div.appendChild(Component.div({ style: { flex: 1, backgroundColor: 'var(--mainColor_dark)', border: '[0.1ps] solid var(--mainColor_border)', borderRadius: '[0.5ps]', boxSizing: 'border-box', marginRight: '[0.5ps]' }}))
const text_cpu = div2.appendChild(Component.text(FontSize.title3, '', { style: { marginLeft: '[1ps]', marginTop: '[0.75ps]' }}))
const canvas_cpu = div2.appendChild(Component.canvas({ style: { backgroundColor: 'var(--subColor)', border: '[0.1ps] solid var(--subColor_border)', borderRadius: '[0.5ps]', boxSizing: 'border-box', marginLeft: '[1ps]', marginTop: '[0.5ps]', width: 'calc(100% - [2ps])', height: 'calc(100% - [3.5ps])' }}))
const div3 = div.appendChild(Component.div({ style: { flex: 1, backgroundColor: 'var(--mainColor_dark)', border: '[0.1ps] solid var(--mainColor_border)', borderRadius: '[0.5ps]', boxSizing: 'border-box', overflow: 'hidden' }}))
const text_memory = div3.appendChild(Component.text(FontSize.title3, '', { style: { marginLeft: '[1ps]', marginTop: '[0.75ps]' }}))
const canvas_memory = div3.appendChild(Component.canvas({ style: { backgroundColor: 'var(--subColor)', border: '[0.1ps] solid var(--subColor_border)', borderRadius: '[0.5ps]', boxSizing: 'border-box', marginLeft: '[1ps]', marginTop: '[0.5ps]', width: 'calc(100% - [2ps])', height: 'calc(100% - [3.5ps])' }}))

//Update Container State
function update () {
  text_cpu.innerHTML = `CPU: ${data.containerInfo.cpuRecord[data.containerInfo.cpuRecord.length-1]}%`
  text_memory.innerHTML = `${getTranslation('ui>>記憶體')}: ${data.containerInfo.memoryRecord[data.containerInfo.memoryRecord.length-1]}MB / ${data.containerInfo.maxMemory}MB`

  drawGraph(canvas_cpu, data.containerInfo.cpuRecord, 100)
  drawGraph(canvas_memory, data.containerInfo.memoryRecord, data.containerInfo.maxMemory)
}

update()
createInterval(100, () => update())
