//創建元素
export default (tagName, options) => {
  let element = document.createElement(tagName)

  //套用選項
  function applyOptions (target, object) {
    Object.keys(object).forEach((item) => {
      if (typeof object[item] === 'object' && object[item] !== null) applyOptions(target[item], object[item])
      else target[item] = object[item]
    })
  }

  if (options !== undefined) applyOptions(element, options)

  return element
}