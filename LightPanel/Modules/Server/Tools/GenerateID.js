//生成ID
module.exports = (length, keys) => {
  let string = generateAnID(length)
  while (keys.includes(string)) string = generateAnID(length)
  return string
}

const getRandom = require('./GetRandom')

const letters = 'abcdefghijklmnopqrstuvwxyz1234567890'

//生成一串ID
function generateAnID (length) {
  let string = ''
  for (let i = 0; i < length; i++) string+=letters[getRandom(0, letters.length-1)]
  return string
}