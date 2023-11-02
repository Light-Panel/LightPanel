export { setCookie, getCookie }

//設定 Cookie
function setCookie (name, value) {
  document.cookie = `${name}=${value}`
}

//取得 Cokkie
function getCookie (name) {
  let data = document.cookie.split('; ').filter((item) => item.split('=')[0] === name)

  return (data.length > 0) ? data[0].split('=')[1] : undefined
}