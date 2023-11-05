export { encrypt, decrypt }

//Encrypt
function encrypt (secret, string) {
  let result = ''

  for (let i = 0; i < string.length; i++) {
    let i2 = i
    while (i2 >= secret.length) i2-=secret.length

    result+=String.fromCharCode(string.charCodeAt(i)+secret.charCodeAt(i2))
  }

  return result
}

//Decrypt
function decrypt (secret, string) {
  let result = ''

  for (let i = 0; i < string.length; i++) {
    let i2 = i
    while (i2 >= secret.length) i2-=secret.length

    result+=String.fromCharCode(string.charCodeAt(i)-secret.charCodeAt(i2))
  }

  return result
}