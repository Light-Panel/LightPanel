const crypto = require('crypto')

module.exports = { encrypt, decrypt }

//加密
function encrypt (secret, iv, string) {
  let cipher = crypto.createCipheriv('aes-256-cbc', secret, iv)

  return cipher.update(string, 'utf8', 'hex')+cipher.final('hex')
}

//解密
function decrypt (secret, iv, data) {
  let decipher = crypto.createDecipheriv('aes-256-cbc', secret, iv)

  return decipher.update(data, 'hex', 'utf8')+decipher.final('utf8')
}