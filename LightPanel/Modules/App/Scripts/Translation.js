export { loadTranslation, getTranslation, changeLanguage }

import { showPromptMessage } from '/Script/PromptMessage.js'
import { setCookie, getCookie } from '/Script/Cookie.js'
import { Component, FontSize } from '/Script/UI.js'
import { loadPage } from '/Script/PageAPI.js'

let data

//Load Translation Data
async function loadTranslation (language) {
	if (language !== undefined) setCookie('language', language)
	else if (getCookie('language') === undefined) setCookie('language', 'zh-TW')
  
  let response = await (await fetch(`/Language/${getCookie('language')}`)).text()

  if (response === 'Resource Not Found') {
    setCookie('language', 'zh-TW')

    await loadTranslation()
  } else data = JSON.parse(response)
}

//Get Translation
function getTranslation (path, parameters) {
  if (data === undefined) throw new Error('Translation Is Not Loaded')

  let target = data.content
  let keys = path.split('>>')

  keys.forEach((item, index) => {
    if (typeof target !== 'object') throw new Error(`Category Not Found (${keys[index-1]})`)
    target = target[item]
  })

  if (target === undefined) throw new Error(`Translation Not Found (${path})`)
  if (typeof target !== 'string') throw new Error (`This Path Is A Category (${path})`)
  
  if (parameters !== undefined) Object.keys(parameters).forEach((item) => target = target.replaceAll(`{${item}}`, parameters[item]))

  return target
}

//Change Langauge
async function changeLanguage (language) {
	if (language === undefined) {
  	let div = document.body.appendChild(Component.div({ style: { position: 'fixed', flexDirection: 'column', center: 'column', left: '0px', top: '0px', width: '100vw', height: '100vh', backdropFilter: 'blur(2.5px) brightness(75%)', animation: 'changeLanguage_show 0.25s 1', zIndex: 998 }}))
  	div.appendChild(Component.text(FontSize.title, getTranslation('ui>>更改語言'), { style: { marginTop: '[1ps]', marginBottom: '[2.5ps]' }}))
  	let div2 = div.appendChild(Component.div({ style: { display: 'flex', flexWrap: 'wrap', center: 'row', width: '[35ps]' }}))

  	let response = await (await fetch('/Api/GetAllLanguages')).json()

  	let state = false

  	Object.keys(response).forEach((item) => {
    	div2.appendChild(Component.text(FontSize.title2, `${response[item].flag} ${response[item].name}`, { style: { marginLeft: '[1ps]', marginRight: '[1ps]', marginBottom: '[0.5ps]', opacity: (getCookie('language') === item) ? 1 : 0.5, cursor: 'pointer' }})).onclick = async () => {
      	if (!state) {
         state = true
       
        	setCookie('language', item)
  
        	await loadTranslation()

        	showPromptMessage('var(--successColor)', getTranslation('ui>>成功更改語言至 {language}', { language: response[item].name }), getTranslation('ui>>部分內容需刷新頁面才會套用'))

      	  if (window.location.pathname === '/') loadPage('Containers', true)
					else loadPage(`${window.location.pathname.substring(1, window.location.pathname.length)}${(window.location.search === '') ? '' : window.location.search}`, true)

					let animation = div.animate([
      	    { opacity: 1 },
      	    { opacity: 0 }
      	  ], { duration: 250 })
  
    	    animation.addEventListener('finish', () => div.remove(), { once: true })
  	    }
  	  }
  	})

  	div.onclick = (e) => {
    	if (!state && e.target === div) {
      	state = true

      	let animation = div.animate([
      	  { opacity: 1 },
      	  { opacity: 0 }
      	], { duration: 250 })

     	  animation.addEventListener('finish', () => div.remove(), { once: true })
    	}
  	}
	} else {
    setCookie('language', language)

    await loadTranslation()

		showPromptMessage('var(--successColor)', getTranslation('ui>>成功更改語言至 {language}', { language }), getTranslation('ui>>部分內容需刷新頁面才會套用'))
	
    if (window.location.pathname === '/') loadPage('Containers', true)
		else loadPage(`${window.location.pathname.substring(1, window.location.pathname.length)}${(window.location.search === '') ? '' : window.location.search}`, true)
	}
}
