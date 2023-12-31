import createElement from '/Script/CreateElement.js'

let cache = {}

//套用風格
function applyStyle (target, object) {
  Object.keys(object).forEach((item) => {
    if (typeof object[item] === 'object') applyStyle(target[item], object[item])
    else if (isNaN(+item)) target[item] = object[item]
  })
}

customElements.define('svg-image', class extends HTMLElement {
  constructor () {
    super()
  }

  static observedAttributes = ['src']

  //元素創建
  async connectedCallback() {
    if (this.attributes.src !== undefined) {
      let response = getData(this.attributes.src)
  
      let image = this.appendChild(createElement('div', { innerHTML: response })).children[0]
      
      if (image !== undefined) applyStyle(image.style, this.style)
      
      try {
        this.outerHTML = image.outerHTML
      } catch (error) {}
    }
  }

  //屬性改變
  async attributeChangedCallback (attributeName, oldValue, newValue) {
    if (attributeName === 'src') {
      let response = await getData(newValue)
  
      let image = this.appendChild(createElement('div', { innerHTML: response })).children[0]

      if (image !== undefined) applyStyle(image.style, this.style)
      
      try {
        this.outerHTML = image.outerHTML
      } catch (error) {}
    }
  }
})

//Get Data (Use Fetch or Cache)
async function getData (src) {
  if (cache[src] === undefined) {
    let response = await (await fetch(src)).text()

    cache[src] = response

    return response
  } else return cache[src]
}