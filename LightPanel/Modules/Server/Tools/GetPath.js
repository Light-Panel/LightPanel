const os = require('os')

//Get Absolute Path
module.exports = (basePath, move) => {
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