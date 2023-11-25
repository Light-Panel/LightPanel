//Load Account Settings
export default (settings, shortkeys) => {
  if (settings.language !== getCookie('language')) changeLanguage(settings.language)
	if (settings.theme !== getCookie('theme')) loadTheme(settings.theme) 
  
	setCookie('cachePage', settings.cachePage)
	setCookie('syncSettings', settings.syncSettings)

	if (window.localStorage.getItem('shortkeys') !== JSON.stringify(shortkeys)) saveShortkeys(shortkeys)
	loadShortkeys()
}

import { loadShortkeys, saveShortkeys } from '/Script/Shortkey.js'
import { setCookie, getCookie } from '/Script/Cookie.js' 
import { changeLanguage } from '/Script/Translation.js'
import { loadTheme } from '/Script/Theme.js'

