const os = require('os')
const fs = require('fs')

if (['linux', 'win32'].includes(os.platform())) {
  (async () => {
    console.log('Downloading Light Panel')

    let files = {}
  
    await getDirectory(files, 'https://api.github.com/repos/Light-Panel/LightPanel/contents/LightPanel')
  
    async function getDirectory (parent, url) {
      let response = await (await fetch(url)).json()

      if (response.message === "API rate limit exceeded for 111.255.21.222. (But here's the good news: Authenticated requests get a higher rate limit. Check out the documentation for more details.)") throw new Error('Github Rate Limit (Please Try Again Later)')
  
      for (let item of response) {
        if (item.type === 'file') parent[item.name] = item.url
        else {
          parent[item.name] = {}
          await getDirectory(parent[item.name], item.url)
        }
      }
    }
  
    let installPath = getPath(process.cwd(), ['LightPanel-Data'])
    if (!fs.existsSync(installPath)) fs.mkdirSync(installPath)

    downloadDirectory(files, installPath)
  
    async function downloadDirectory (folder, path) {
      for (let item of Object.keys(folder)) {
        if (typeof folder[item] === 'string') {
          log(`Downloading ${item}`)

          fs.writeFileSync(getPath(path, [item]), Buffer.from(await (await fetch(folder[item])).arrayBuffer()))
        } else {
          log(`Creating Directory ${item}`)

          fs.mkdirSync(getPath(path, [item]))
          await downloadDirectory(folder[item], getPath(path, [item]))
        }
      }
    }
  })()
} else throw new Error(`Unsupported Platform: [${os.platform()}]`)

//Log
function log (string) {
  process.stdout.clearLine()
  process.stdout.cursorTo(0)
  process.stdout.write(string)
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

let pathSymbol
if (os.platform() === 'linux') pathSymbol = '/'
else if (os.platform() === 'win32') pathSymbol = '\\'
