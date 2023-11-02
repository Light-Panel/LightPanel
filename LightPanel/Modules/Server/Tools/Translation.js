const fs = require('fs')

module.exports = { loadTranslation, getTranslation }

const getPath = require('./GetPath')

let data

//Load Translation
function loadTranslation (language) {
  if (!fs.existsSync(getPath(__dirname, ['<', '<', '<', 'Languages', `${language}.json`]))) throw new Error(`Language Not Found: "${language}"`)
  
  data = JSON.parse(fs.readFileSync(getPath(__dirname, ['<', '<', '<', 'Languages', `${language}.json`])))
}

//Get Translation
function getTranslation (path, parameters) {
  if (data === undefined) throw new Error('Translation Is Not Loaded')

  let target = data.content.server
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