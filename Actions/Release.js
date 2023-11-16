const fs = require('fs')

fs.writeFileSync(getPath(__dirname, ['<', 'Assets', 'Files.json']), JSON.stringify(getAllFilesInFolder(getPath(__dirname, ['<', 'LightPanel']), '')))

//Get All Files In Folder
function getAllFilesInFolder (path, folderName) {
  let data = []

  fs.readdirSync(path).forEach((item) => {
    console.log(item)
    if (fs.statSync(getPath(path, [item])).isDirectory()) {
      data.push({ type: 'folder', path: getPath(folderName, [item]) })
      data = data.concat(getAllFilesInFolder(getPath(path, [item]), getPath(folderName, [item])))
    } else data.push({ type: 'file', path: getPath(folderName, [item]) })
  })

  return data
}

//Get Absolute Path
function getPath (basePath, move) {
  let analysis = basePath.split('/')

  move.forEach((item) => {
    if (item === '<') analysis.splice(analysis.length-1, 1)
    else analysis.push(item)
  })

  return analysis.join('/')
}
