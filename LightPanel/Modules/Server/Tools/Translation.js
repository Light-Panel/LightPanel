const path = require('path')
const fs = require('fs')

module.exports = { loadTranslation, getAllLanguages, getTranslation }

const applyParameters = require('./ApplyParameters')
const getPath = require('./GetPath')

let data
let allLanguages = {}

//Load Translation
function loadTranslation (language) {
  if (!fs.existsSync(getPath(__dirname, ['<', '<', '<', 'Data', 'Languages', `${language}.json`]))) throw new Error(`Language Not Found: "${language}"`)
  
  data = JSON.parse(fs.readFileSync(getPath(__dirname, ['<', '<', '<', 'Data', 'Languages', `${language}.json`])))

  allLanguages = {}
  fs.readdirSync(getPath(__dirname, ['<', '<', '<', 'Data', 'Languages'])).forEach((item) => {
    let info = JSON.parse(fs.readFileSync(getPath(__dirname, ['<', '<', '<', 'Data', 'Languages', item]))).info

    allLanguages[path.parse(item).name] = { name: info.name, flag: info.flag }
  })
}

//Get All Languages
function getAllLanguages () {
  return allLanguages
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
  
  if (parameters !== undefined) target = applyParameters(target, parameters)

  return target
}