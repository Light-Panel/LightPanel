import { saveShortkeys, getUserShortkeys } from '/Script/Shortkey.js'
import { showPromptMessage } from '/Script/PromptMessage.js'
import { getTranslation } from '/Script/Translation.js'
import { displayFeatures } from '/Script/PageAPI.js'
import { Component, FontSize } from '/Script/UI.js'
import loadSettings from '/Script/LoadSettings.js'
import { sendRequest } from '/Script/Session.js'
import { getCookie } from '/Script/Cookie.js'
import { event } from '/Script/PageAPI.js'

(async () => {
  window.document.title = `Light Panel | ${getTranslation('ui>>設定')}`
  displayFeatures('global')

  const page = document.getElementById('page')

  let allLanguages = await (await fetch('/Api/GetAllLanguages')).json()
  let allThemes = await (await fetch('Api/GetAllThemes')).json()

  const div = page.appendChild(Component.div({ style: { display: 'flex', marginTop: '[1ps]', width: 'calc(100vw - [13ps])' }}))
  const div2 = div.appendChild(Component.div({ style: { flex: 1, backgroundColor: 'var(--mainColor_dark)', border: '[0.1ps] solid var(--mainColor_border)', borderRadius: '[0.5ps]', boxSizing: 'border-box', marginRight: '[1ps]' }}))
  div2.appendChild(Component.text(FontSize.title2, getTranslation('ui>>語言'), { style: { marginLeft: '[1ps]', marginTop: '[0.75ps]', marginBottom: '[0.5ps]' }}))
  let select_language = div2.appendChild(Component.select(Object.keys(allLanguages).map((item) => {return { label: `${allLanguages[item].flag} ${allLanguages[item].name}`, value: item }}), { selected: { label: `${allLanguages[getCookie('language')].flag} ${allLanguages[getCookie('language')].name}`, value: getCookie('language')}, main: { style: { marginLeft: '[1ps]', marginBottom: '[1ps]', width: '[10ps]' }}}))
  const div3 = div.appendChild(Component.div({ style: { flex: 1, backgroundColor: 'var(--mainColor_dark)', border: '[0.1ps] solid var(--mainColor_border)', borderRadius: '[0.5ps]', boxSizing: 'border-box' }}))
  div3.appendChild(Component.text(FontSize.title2, getTranslation('ui>>主題'), { style: { marginLeft: '[1ps]', marginTop: '[0.75ps]', marginBottom: '[0.5ps]' }}))
  let select_theme = div3.appendChild(Component.select(allThemes.map((item) => { return { label: item, value: item }}), { selected: { label: getCookie('theme'), value: getCookie('theme') }, main: { style: { marginLeft: '[1ps]', marginBottom: '[1ps]', width: '[10ps]' }}}))
  const div4 = page.appendChild(Component.div({ style: { flex: 1, backgroundColor: 'var(--mainColor_dark)', border: '[0.1ps] solid var(--mainColor_border)', borderRadius: '[0.5ps]', boxSizing: 'border-box', marginTop: '[1ps]', width: 'calc(100vw - [13ps])' }}))
  div4.appendChild(Component.text(FontSize.title2, getTranslation('ui>>快捷鍵'), { style: { marginLeft: '[1ps]', marginTop: '[0.75ps]' }}))

  let allShortKey = getUserShortkeys()
  let inputs = {}

  Object.keys(allShortKey).forEach((item) => {
    const div5 = div4.appendChild(Component.div({ style: { display: 'flex', center: 'column', marginLeft: '[1ps]', marginTop: '[0.5ps]' }}))
    div5.appendChild(Component.text(FontSize.subTitle, `${getTranslation(`ui>>${allShortKey[item].name}`)}:`, { style: { marginRight: '[0.5ps]' }}))
    inputs[item] = div5.appendChild(Component.input('text', allShortKey[item].key, { style: { padding: '[0.2ps]', paddingLeft: '[0.4ps]' }}))
  
    let oldValue = inputs[item].value

    event(inputs[item], 'change', () => {
      for (let item2 of inputs[item].value.split('+')) {
        if (!keys.includes(item2.toLowerCase())) {
          inputs[item].value = oldValue

          showPromptMessage('var(--errorColor)', getTranslation('ui>>找不到按鍵 {key}', { key: item2.toLowerCase() }), getTranslation('ui>>支援的按鍵: a~z, 0~9, control, alt, meta'))
          
          break
        } else oldValue = inputs[item].value
      }
    })
  })

  const div5 = page.appendChild(Component.div({ style: { display: 'flex', marginTop: '[1ps]', marginBottom: '[1ps]', width: 'calc(100vw - [13ps])' }}))
  const div6 = div5.appendChild(Component.div({ style: { flex: 1, backgroundColor: 'var(--mainColor_dark)', border: '[0.1ps] solid var(--mainColor_border)', borderRadius: '[0.5ps]', boxSizing: 'border-box', marginRight: '[1ps]' }}))
  div6.appendChild(Component.text(FontSize.title2, getTranslation('ui>>其他'), { style: { marginLeft: '[1ps]', marginTop: '[0.75ps]', marginBottom: '[0.5ps]' }}))
  const div7 = div6.appendChild(Component.div({ style: { display: 'flex', center: 'column', marginLeft: '[1ps]', marginBottom: '[1ps]' }}))
  div7.appendChild(Component.text(FontSize.subTitle, `${getTranslation('ui>>頁面緩存')}:`, { style: { marginRight: '[0.3ps]' }}))
  const checkbox_cachePage = div7.appendChild(Component.checkbox(getCookie('cachePage') === 'true'))
  const div8 = div5.appendChild(Component.div({ style: { flex: 1, backgroundColor: 'var(--mainColor_dark)', border: '[0.1ps] solid var(--mainColor_border)', borderRadius: '[0.5ps]', boxSizing: 'border-box' }}))
  div8.appendChild(Component.text(FontSize.title2, getTranslation('ui>>帳號'), { style: { marginLeft: '[1ps]', marginTop: '[0.75ps]', marginBottom: '[0.5ps]' }}))
	const div9 = div8.appendChild(Component.div({ style: { display: 'flex', center: 'column', marginLeft: '[1ps]', marginBottom: '[1ps]'}}))
  div9.appendChild(Component.text(FontSize.subTitle, `${getTranslation('ui>>同步設定')}:`, { style: { marginRight: '[0.3ps]' }}))
	const checkbox_syncSettings = div9.appendChild(Component.checkbox(getCookie('syncSettings') === 'true', { style: { marginRight: '[0.5ps]' }}))
  div9.appendChild(Component.text(FontSize.subTitle, `(${getTranslation('ui>>在每次登入時同步設定')})`, { style: { opacity: 0.5 }}))
  
  let state = false

	const button = page.appendChild(Component.button(getTranslation('ui>>套用設定'), async () => {
    if (!state) {
			state = true
			button.style.opacity = 0.5

      let object = {}
		  Object.keys(inputs).forEach((item) => object[item] = inputs[item].value)

			if (checkbox_uploadSettings.checked) {
				let response = await sendRequest({
		      type: 'saveAccountSettings',
					settings: {
	  	      language: select_language.value,
						theme: select_theme.value,
	          cachePage: checkbox_cachePage.checked,
				    syncSettings: checkbox_syncSettings.checked	
					},
					shortkeys: object
				})
			}

	    loadSettings({
				language: select_language.value,
				theme: select_theme.value,
				cachePage: checkbox_cachePage.checked,
				syncSettings: checkbox_syncSettings.checked
			}, object)

			showPromptMessage('var(--successColor)', getTranslation('ui>>成功套用設定'), getTranslation('ui>>部分設定需刷新頁面才會套用'))

			button.style.opacity = 1
			state = false
		}
	}, { style: { marginBottom: '[0.25ps]', width: '[7ps]' }}))
  const div10 = page.appendChild(Component.div({ style: { display: 'flex', marginBottom: '[1ps]' }}))
	div10.appendChild(Component.text(FontSize.subTitle, getTranslation('ui>>同步至帳號'), { style: { marginRight: '[0.5ps]' }}))
	const checkbox_uploadSettings = div10.appendChild(Component.checkbox(true))
})()

const keys = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'enter', 'control', 'alt', 'meta']
