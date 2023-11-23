export { loadTheme }

import { setCookie, getCookie } from '/Script/Cookie.js'
import createElement from '/Script/CreateElement.js'

//Load Theme
async function loadTheme (theme) {
	if (theme !== undefined) setCookie('theme', theme)
	else if (getCookie('theme') === undefined) setCookie('theme', 'Default')

  let response = await (await fetch(`/Theme/${getCookie('theme')}`)).text()

  if (response === 'Resource Not Found') {
    setCookie('theme', 'Default')
    
    await loadTheme()
  } else document.head.appendChild(createElement('style', { id: 'theme', innerHTML: response }))
}
