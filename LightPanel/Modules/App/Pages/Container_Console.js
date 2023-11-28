const page = document.getElementById('page')

const div = page.appendChild(Component.div({ style: { display: 'flex', flexDirection: 'column', center: 'column', backgroundColor: 'var(--mainColor_dark)', border: '[0.1ps] solid var(--mainColor_border)', borderRadius: '[0.5ps]', boxSizing: 'border-box', marginTop: '[0.5ps]', marginBottom: '[0.5ps]', width: 'calc(100vw - [12ps])' }}))
const div2 = div.appendChild(Component.div({ style: { backgroundColor: 'var(--subColor)', border: '[0.1ps] solid var(--subColor_border)', borderRadius: '[0.5ps]', boxSizing: 'border-box', marginTop: '[1ps]', paddingLeft: '[1ps]', paddingTop: '[0.75ps]', paddingBottom: '[0.75ps]', width: 'calc(100vw - [14ps])', height: 'calc(100vh - [11.25ps])', overflowY: 'scroll' }}))
const div3 = div.appendChild(Component.div({ style: { display: 'flex', width: 'calc(100vw - [14ps])', overflow: 'hidden' }}))
const input = div.appendChild(Component.input('text', '', { style: { marginBottom: '[1ps]', width: 'calc(100vw - [14ps])' }}))

//Load TTY
async function loadTTY () {
  let response = await sendRequest({ type: 'getContainerLog', id })

  let terminal = new Terminal({
		rows: 100,

		theme: { background: getComputedStyle(document.body).getPropertyValue('--subColor') },
  
    fontFamily: 'Sans-serif',
    letterSpacing: 0,

    scrollback: 0
  })
  
  terminal.open(div2)

  terminal.write(response.data)

  div2.scrollTo(0, div2.scrollHeight)

	terminal.onKey(async (data) => {
    sendRequest({ type: 'ttyInput', id, data: data.key })
  })

	event(input, 'change', () => {
    if (data.ttyConnection.connected) {
			sendRequest({ type: 'ttyInput', id, data: `${input.value}\r` })    
		  
			input.value = ''
		}
	})

  terminal.attachCustomKeyEventHandler(async (arg) => {
    if ((arg.ctrlKey && arg.code === "KeyV" && arg.type === "keydown") || (arg.metaKey && arg.code === "KeyV" && arg.type === "keydown")) {
      sendRequest({ type: 'ttyInput', id, data: await navigator.clipboard.readText() })
    }
    return true
  })

  data.ttyConnection.event('update', (data) => terminal.write(data))

	function updateTTY () {
    if (data.ttyConnection.connected) {
      terminal.element.style.filter = null
			terminal.element.style.cursor = null
		} else {
			terminal.element.style.filter = 'blur(3px)'
			terminal.element.style.cursor = 'not-allowed'
		}
	}

	terminal.element.style.transitionDuration = '0.5s'

	updateTTY()

	data.ttyConnection.event('connect', () => console.log(true))
	data.ttyConnection.event('connect', updateTTY)
	data.ttyConnection.event('disconnect', updateTTY)
}

//Load Shortcuts
async function loadShortcuts () {
 data.containerShortcuts = await sendRequest({ type: 'getContainerShortcuts', id })

	Object.keys(data.containerShortcuts.shortcuts).forEach((item) => {
  	event(div3.appendChild(Component.text(FontSize.title3, item, { style: { backgroundColor: 'var(--mainColor)', border: '[0.1ps] solid var(--mainColor_border)', borderRadius: '[0.5ps]', boxSizing: 'border-box', marginRight: '[0.5ps]', marginTop: '[0.5ps]', marginBottom: '[0.5ps]', padding: '[0.1ps] [0.5ps]', cursor: 'pointer' }})), 'click', () => {
			sendRequest({ type: 'ttyInput', id, data: `${applyParameters(data.containerShortcuts.shortcuts[item], data.containerShortcuts.templateParameters)}\r` })
		})
	})
}

loadTTY()
loadShortcuts()
