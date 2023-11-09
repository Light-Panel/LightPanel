//Apply Parameters In String
module.exports = (string, parameters) => {
  Object.keys(parameters).forEach((item) => string = string.replaceAll(`{${item}}`, parameters[item]))

  return string
}