//Get Content Type From File Extension
module.exports = (extension) => {
  if (extension === '.css') return 'text/css'
  else if (extension === '.js') return 'text/javascript'
  else if (extension === '.json' || extension === '.map') return 'application/json'
  else if (extension === '.svg') return 'image/svg+xml'
  else return 'text/plan'
}