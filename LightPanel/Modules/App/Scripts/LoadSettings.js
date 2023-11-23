//Load Account Settings
export default (data) => {
  if (data.language !== getCookie('language')) changeLanguage(data.language)
	if (data.theme !== getCookie('theme')) loadTheme(data.theme) 
  
	setCookie('cachePage', data.cachePage)
	setCookie('syncSettings', data.syncSettings)

	console.log(data, getCookie('cachePage'))
}

import { setCookie, getCookie } from '/Script/Cookie.js' 
import { changeLanguage } from '/Script/Translation.js'
import { loadTheme } from '/Script/Theme.js'
