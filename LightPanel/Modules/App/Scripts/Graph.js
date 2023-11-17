//Graph
export default (canvas, data, max, average) => {
  canvas.width = canvas.getBoundingClientRect().width*2
  canvas.height = canvas.getBoundingClientRect().height*2

  let ctx = canvas.getContext('2d')

  ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--textColor')
  ctx.lineWidth = ((window.innerWidth+window.innerHeight)/100)*0.15

  ctx.moveTo(0, canvas.height-((canvas.height/max)*data[0]))
  data.forEach((item, index) => {
    ctx.lineTo((canvas.width/(data.length-1))*index, canvas.height-((canvas.height/max)*item))
  })
  ctx.stroke()

  if (average === undefined || average === true) {
    ctx.beginPath()

    ctx.strokeStyle = hexToRgba(getComputedStyle(document.body).getPropertyValue('--textColor'), 0.1)
    ctx.lineWidth = ((window.innerWidth+window.innerHeight)/100)*0.3

    let averageData = data.slice(0, 10)
    ctx.moveTo(0, canvas.height-((canvas.height/max)*(averageData.reduce((a, b) => a+b)/averageData.length)))
    data.forEach((item, index) => {
      averageData = data.slice((index-10 < 0) ? 0 : index-10, index+10)
      ctx.lineTo((canvas.width/(data.length-1))*index, canvas.height-((canvas.height/max)*(averageData.reduce((a, b) => a+b)/averageData.length)))
    })
    ctx.stroke()
  }
}

//Turn Hex Color Into RGBA
function hexToRgba (hex, alpha) {
  if (hex === 'transparent') return 'rgba(0,0,0,0)'
  else {
    if (hex === undefined) hex = 'black'
    if (alpha === undefined) alpha = 1

    const [r, g, b] = hex.match(/\w\w/g).map(x => parseInt(x, 16))
    
    return `rgba(${r},${g},${b},${(alpha === undefined) ? 1 : alpha})`
  }
}