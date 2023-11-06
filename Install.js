const os = require('os')
const fs = require('fs')

let pathSymbol
if (os.platform() === 'linux') pathSymbol = '/'
else if (os.platform() === 'win32') pathSymbol = '\\'

if (['linux', 'win32'].includes(os.platform())) {
  (async () => {
    log(`Installing Light Panel (${getPath(process.cwd(), ['LightPanel-Data'])})`)

    let files = {}
    let fileAmount = 0
  
    await getDirectory(files, 'https://api.github.com/repos/Light-Panel/LightPanel/contents/LightPanel')
  
    async function getDirectory (parent, url) {
      let response = await (await fetch(url)).json()

      if (response.message !== undefined && response.message.includes("API rate limit exceeded")) throw new Error('Github API Rate Limit (Please Try Again Later)')
  
      for (let item of response) {
        if (item.type === 'file') parent[item.name] = item.url
        else {
          parent[item.name] = {}
          await getDirectory(parent[item.name], item.url)
        }

        fileAmount++
      }
    }
  
    let installPath = getPath(process.cwd(), ['LightPanel-Data'])
    if (fs.existsSync(installPath)) fs.rmSync(installPath, { recursive: true })
    fs.mkdirSync(installPath)
    
    let downloadedFileAmount = 0

    await downloadDirectory(files, installPath)
  
    async function downloadDirectory (folder, path) {
      for (let item of Object.keys(folder)) {
        if (typeof folder[item] === 'string') {
          log(`${progress((100/fileAmount)*downloadedFileAmount)} Downloading ${item}`)

          fs.writeFileSync(getPath(path, [item]), Buffer.from(await (await fetch(folder[item])).arrayBuffer()))
        } else {
          fs.mkdirSync(getPath(path, [item]))
          await downloadDirectory(folder[item], getPath(path, [item]))
        }

        downloadedFileAmount++
      }
    }

    log(`Light Panel Installed (${getPath(process.cwd(), ['LightPanel-Data'])})\n`)
  })()
} else throw new Error(`Unsupported Platform: [${os.platform()}]`)

//Log
function log (string) {
  process.stdout.clearLine()
  process.stdout.cursorTo(0)
  process.stdout.write(string)
}

//Display Progress
function progress (value) {
  let string = ''

  for (let i = 0; i < value/5; i++) string+='|'
  while (string.length < 20) string+='-'

  return `[ ${string} ]`
}

//Get Absolute Path
function getPath (basePath, move) {
  let analysis = basePath.split(pathSymbol)

  move.forEach((item) => {
    if (item === '<') analysis.splice(analysis.length-1, 1)
    else analysis.push(item)
  })

  return analysis.join(pathSymbol)
}
