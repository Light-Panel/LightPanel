export { loadTranslation, getTranslation }

import { setCookie, getCookie } from '/Script/Cookie.js'

let data

//Load Translation Data
async function loadTranslation () {
  if (getCookie('language') === undefined) setCookie('language', 'zh-TW')
  
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