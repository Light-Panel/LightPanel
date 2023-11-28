//Apply Parameters In String
export default (string, parameters) => {
  Object.keys(parameters).forEach((item) => string = string.replaceAll(`{${item}}`, parameters[item]))

  return string
}
