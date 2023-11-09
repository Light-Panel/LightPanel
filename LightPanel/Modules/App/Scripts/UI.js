import createElement from '/Script/CreateElement.js'

export { Component, FontSize, setAttribute } 

class Component {
  //Test
  static text (fontSize, text, options) {
    return createElement('h1', parseOptions({ innerHTML: text, style: { color: 'var(--textColor)', fontSize: (typeof fontSize === 'number') ? `[${fontSize}ps]` : fontSize, margin: '0px' }}, options))
  }

  //Url Text
  static url (fontSize, text, target, options) {
    let element = createElement('h1', parseOptions({ innerHTML: text, style: { color: 'var(--textColor)', fontSize, textDecoration: 'underline', margin: '0px', cursor: 'pointer' }}, options))
  
    element.addEventListener('click', () => {
      if (typeof target === 'function') target()
      else window.open(target)
    })

    return element
  }

  //Svg Image
  static svgImage (src, options) {
    let element = createElement('svg-image', parseOptions({ style: { color: 'var(--textColor)' }}, options))

    element.setAttribute('src', src)

    return element
  }

  //Button
  static button (label, callback, options) {
    let element = createElement('button', parseOptions({ class: 'hover_button', innerHTML: label, style: { outline: 'none', backgroundColor: 'var(--mainColor)', color: 'var(--textColor)', border: '[0.1ps] solid var(--mainColor_border)', borderRadius: '[0.5ps]', boxSizing: 'border-box', fontSize: FontSize.subTitle, padding: '[0.425ps]', paddingLeft: '[0.5ps]', paddingRight: '[0.5ps]', transitionDuration: '0.5s', cursor: 'pointer' }}, options))
    
    element.addEventListener('mouseover', () => element.style.backgroundColor = 'var(--mainColor_dark)')
    element.addEventListener('mouseleave', () => element.style.backgroundColor = 'var(--mainColor)')
    element.addEventListener('click', () => callback(element))

    return element
  }

  //Select Menu
  static select (items, options, placeholder) {
    if (options === undefined) options = {}

    let div = createElement('div', parseOptions({ style: { backgroundColor: 'var(--mainColor)', border: '[0.1ps] solid var(--mainColor_border)', borderRadius: '[0.5ps]', boxSizing: 'border-box', transitionDuration: '0.5s', cursor: 'pointer', overflow: 'hidden' }}, options.main))
    let div2 = div.appendChild(createElement('div', { style: { display: 'flex' }}))
    let selected = div2.appendChild(createElement('h1', parseOptions({ innerHTML: (placeholder === undefined) ? '' : placeholder, style: { flex: 1, color: 'var(--textColor)', fontSize: FontSize.subTitle, whiteSpace: 'nowrap', margin: '0px', padding: '[0.42ps]', paddingLeft: '[0.5ps]' }}, options.selected)))
    let div3 = div2.appendChild(createElement('div', parseOptions({ style: { display: 'flex', justifyContent: 'center', alignItems: 'center', marginRight: `[0.3ps]`, transitionDuration: '0.5s' }})))
    let image = div3.appendChild(createElement('svg-image', parseOptions({ style: { color: 'var(--textColor)', width: selected.style.fontSize }}, options.image)))
    image.setAttribute('src', '/Image/CaretUp.svg')
    let div4 = div.appendChild(createElement('div', parseOptions({ style: { backgroundColor: 'var(--mainColor_dark)', width: div.style.width, height: '0px', transitionDuration: '0.5s', overflowY: 'scroll' }}, options.options)))
    
    items.forEach((item, index) => {
      let option = div4.appendChild(createElement('h1', parseOptions({ class: 'hover_select_option', innerHTML: item.label, style: { color: 'var(--textColor)', fontSize: selected.style.fontSize, margin: '0px', marginLeft: '[0.5ps]', marginTop: (index === 0) ? '[0.25ps]' : '[0.25ps]', marginBottom: (index === items.length-1) ? '[0.25ps]' : '0px' }}, options.option)))
    
      option.onclick = () => {
        div.value = item.value
        div.dispatchEvent(new CustomEvent('select', { detail: item.value }))

        selected.innerHTML = item.label

        state = false

        div3.style.transform = 'rotate(0deg)'
        div4.style.height = '0px'
      }
    })

    let state = false

    div2.onclick = () => {
      if (state) {
        state = false

        div3.style.transform = 'rotate(0deg)'
        div4.style.height = '0px'
      } else {
        state = true

        div3.style.transform = 'rotate(180deg)'
        if (items.length > 5) div4.style.height = `${(div4.firstChild.getBoundingClientRect().height*5)+(((window.innerWidth+window.innerHeight)/100)*(0.5+(4*0.25)))}`
        else div4.style.height = `${(div4.firstChild.getBoundingClientRect().height*items.length)+(((window.innerWidth+window.innerHeight)/100)*(0.5+((items.length-1)*0.25)))}px`
      }
    }

    return div
  }

  //Input
  static input (type, value, options, placeholder) {
    let input = createElement('input', parseOptions({ type, value, style: { outline: 'none', backgroundColor: 'var(--mainColor_dark)', color: 'var(--textColor)', border: '[0.1ps] solid var(--mainColor_border)', borderRadius: '[0.5ps]', boxSizing: 'border-box', fontSize: FontSize.subTitle, padding: '[0.425ps]', paddingLeft: '[0.5ps]', paddingRight: '[0.5ps]', transitionDuration: '0.5s' }}, options))

    if (placeholder !== undefined) input.placeholder = placeholder

    input.addEventListener('focus', () => input.style.backgroundColor = 'var(--mainColor)')
    input.addEventListener('focusout', () => input.style.backgroundColor = 'var(--mainColor_dark)')

    return input
  }

  //Container
  static div (options) {
    return createElement('div', parseOptions(options))
  }
}

//Font Sizes
class FontSize {
  static get title () {return '[1.5ps]'}
  static get title2 () {return '[1.2ps]'}
  static get title3 () {return '[0.9ps]'}
  static get subTitle () {return '[0.75ps]'}
  static get subTitle2 () {return '[0.7ps]'}
}

//Parse Options
function parseOptions (defaultOptions, options) {
  options = mergeObject(defaultOptions, (options === undefined) ? {} : options)

  let object = {}

  Object.keys(options).forEach((item) => {
    if (item === 'class') object.classList = options[item]
    else if (item === 'style') {
      object.style = {}

      Object.keys(options.style).forEach((item2) => {
        if (item2 === 'center') {
          let types = options.style[item2].split(' ')
 
          if (types.length > 0) {
            object.style.display = 'flex'

            if (types.includes('row')) object.style.justifyContent = 'center'
            if (types.includes('column')) object.style.alignItems = 'center'
          }
        } else object.style[item2] = parseStyleValue(options.style[item2])
      })
    } else object[item] = options[item]
  })

  return object
}

//Parse Style Value
function parseStyleValue (value) {
  if (typeof value === 'string') {
    for (let i = 0; i < value.length; i++) {
      if (value[i] === '[') {
        let start = i+1
        let end = value.length
  
        for (let i2 = i; i2 < value.length; i2++) {
          if (value[i2] === ']') {
            end = i2
            break
          }
        }
  
        if (value.substring(end-2, end) === 'ps') value = (window.innerHeight > window.innerWidth*1.5) ? value.replaceAll(value.substring(start-1, end+1), `calc(calc(100vw + 100vh) / 70 * ${value.substring(start, end-2)})`) : value.replaceAll(value.substring(start-1, end+1), `calc(calc(100vw + 100vh) / 100 * ${value.substring(start, end-2)})`)
      }
    }
  }

  return value
}

//Merge Object
function mergeObject (target, object) {
  Object.keys(object).forEach((item) => {
    if (typeof object[item] === 'object' && object[item] !== null) target[item] = mergeObject(target[item], object[item])
    else target[item] = object[item]
  })

  return target
}

//Set Element Attribute
function setAttribute (target, name, value) {
  target.setAttribute(name, value)

  return target
}