//Parse Memory (Docker Container Stats)
module.exports = (string) => {
  let data = string.replaceAll(' ', '').split('/')[0]

  if (data.substring(data.length-3, data.length) === 'Gib') return +parseFloat(data.substring(0, data.length-3)*1024).toFixed(2)
  else if (data.substring(data.length-3, data.length) === 'MiB') return +parseFloat(data.substring(0, data.length-3)).toFixed(2)
  else if (data.substring(data.length-3, data.length) === 'KiB') return +parseFloat(data.substring(0, data.length-3)/1024).toFixed(2)
}