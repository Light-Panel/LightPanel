export { setCookie, getCookie }

//Set Cookie
function setCookie (name, value) {
  document.cookie = `${name}=${value}`
}

//Get Cokkie
function getCookie (name) {
  let data = document.cookie.split('; ').filter((item) => item.split('=')[0] === name)

  return (data.length > 0) ? data[0].split('=')[1] : undefined
}