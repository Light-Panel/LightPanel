const page = document.getElementById('page')

const div = page.appendChild(Component.div({ style: { backgroundColor: 'var(--subColor)', border: '[0.1ps] solid var(--subColor_border)', borderRadius: '[0.5ps]', boxSizing: 'border-box', marginBottom: '[0.5ps]', width: 'calc(100vw - [12ps])' }}))
const div2 = div.appendChild(Component.div({ style: { display: 'flex', center: 'column', marginTop: '[1ps]', marginBottom: '[0.5ps]' }}))
const input_path = div2.appendChild(Component.input('text', '', { style: { flex: 1, marginLeft: '[1ps]', marginRight: '[1ps]', width: 'calc(100vw - [14ps])' }}))
const button_zip = div2.appendChild(Component.div({ style: { marginRight: '[0.5ps]', cursor: 'pointer' }}))
button_zip.appendChild(Component.svgImage('/Image/Archive.svg', { style: { width: '[1.5ps]' }}))
const button_delete = div2.appendChild(Component.div({ style: { cursor: 'pointer', marginRight: '[1ps]' }}))
button_delete.appendChild(Component.svgImage('/Image/Trash.svg', { style: { width: '[1.5ps]' }}))

const files = div.appendChild(Component.div({ style: { display: 'flex', flexDirection: 'column', center: 'column', paddingBottom: '[0.5ps]', width: 'calc(100vw - [12ps])' }}))

let div3 = document.body.appendChild(Component.div({ style: { display: 'flex', center: 'column', backgroundColor: 'var(--mainColor)', border: '[0.1ps] solid var(--mainColor_border)', borderRadius: '[0.5ps]', boxSizing: 'border-box', padding: '[0.1ps]', width: '[3ps]' }}))
div3.appendChild(Component.svgImage('/Image/File.svg', { style: { marginRight: '[0.2ps]', width: '[1ps]' }}))
let text_amount = div3.appendChild(Component.text(FontSize.title3, '0', { style: { whiteSpace: 'nowrap' }}))

event(input_path, 'change', () => {
	path = (input_path.value === '') ? [] : input_path.value.split('/')

	updateFiles()
})

let path = []
let fileSelect = []
let dragging = []

let state = false
let state2 = false

//Update Files
async function updateFiles () {
	if (!state) {
		state = true

		input_path.value = path.join('/')

  	let response = await sendRequest({ type: 'getContainerFiles', id, path })

		while (files.firstChild) files.removeChild(files.firstChild)

		if (response.error) return

		fileSelect = []

		if (path.length > 0) response.splice(0, 0, { type: 'parentDirectory', name: '..' })

		response.forEach((item, index) => {
			const div4 = files.appendChild(Component.div({ style: { display: 'flex', center: 'column', borderRadius: '[0.5ps]', padding: '[0.1ps]', width: 'calc(100vw - [14ps])' }}))
			fileSelect.push(div4.appendChild(Component.checkbox(false, { disabled: item.type === 'parentDirectory', style: { marginRight: '[0.5ps]', width: '[1ps]', opacity: (item.type === 'parentDirectory') ? 0 : 1 }})))
			const div5 = div4.appendChild(Component.div({ draggable: item.type !== 'parentDirectory', style: { flex: 2, display: 'flex', center: 'column', cursor: 'pointer' }}))
			div5.appendChild((item.type === 'file') ? Component.svgImage('/Image/File.svg', { style: { marginRight: '[0.25ps]', width: '[1ps]' }}) : Component.svgImage('/Image/Directory.svg', { style: { marginRight: '[0.25ps]', width: '[1ps]' }}))
			div5.appendChild(Component.text(FontSize.title3, item.name))
			if (item.type === 'file') div4.appendChild(Component.text(FontSize.subTitle, getNumberWithUnit(item.size), { style: { flex: 1 }}))
			if (item.type !== 'parentDirectory') {
				const button_options = div4.appendChild(Component.div({ style: { cursor: 'pointer' }}))
				button_options.appendChild(Component.svgImage('/Image/Ellipsis.svg', { style: { width: '[1ps]' }}))
			}

			event(div5, 'click', () => {
				if (item.type === 'parentDirectory') {
          path.splice(path.length-1, 1)

          updateFiles()
				} else if (item.type === 'directory') {
					path.push(item.name)

					updateFiles()
				}
			})

			if (item.type !== 'parentDirectory') {
				event(div5, 'dragstart', (e) => {
					dragging = []

					fileSelect.forEach((item2, index2) => {
						if (item2.checked || index2 === index) dragging.push(response[index2].name)
					})

        	text_amount.innerHTML = dragging.length

					e.dataTransfer.setDragImage(div3, 10, 25)
				})
			}

			if (item.type === 'parentDirectory' || item.type === 'directory') {
				let layer = 0

				event(div4, 'dragenter', () => {
					if (!dragging.includes(item.name)) {
						div4.style.backgroundColor = 'var(--mainColor)'
						layer++
					}
				})
				event(div4, 'dragleave', () => {
					if (!dragging.includes(item.name)) {
						layer--
						if (layer === 0) div4.style.backgroundColor = 'var(--subColor)'
					}
				})
				event(div4, 'dragover', (e) => {
          if (!dragging.includes(item.name)) e.preventDefault()
				})

				event(div4, 'drop', async () => {
					if (!dragging.includes(item.name) && !state2) {
						state2 = true

						let response2 = await sendRequest({ type: 'moveContainerFiles', id, target: dragging.map((item2) => path.concat([item2]).join('/')), destination: (item.type === 'parentDirectory') ? path.slice(0, path.length-1).join('/') : path.concat([item.name]).join('/') })

						if (response2.error) showPromptMessage('var(--errorColor)', getTranslation('ui>>檔案移動失敗'), getTranslation('ui>>請稍候再試')) 
            else updateFiles()

						state2 = false
					}
				})
			}
		})

		state = false
	}
}

updateFiles()

function getNumberWithUnit (number) {
	if (number >= 1073741824) return `${parseInt(number/1073741824).toFixed(1)} GB`
	if (number >= 1048576) return `${parseInt(number/1048576).toFixed(1)} MB`
	return `${number} Bytes`
}
