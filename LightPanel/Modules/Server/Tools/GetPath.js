//Get Absolute Path
module.exports = (basePath, move) => {
  let analysis = basePath.split('/')

  move.forEach((item) => {
    if (item === '<') analysis.splice(analysis.length-1, 1)
    else analysis.push(item)
  })

  return analysis.join('/')
}
