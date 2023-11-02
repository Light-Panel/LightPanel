//取得隨機數
module.exports = (min, max) => {
  return Math.floor(Math.random()*max)+min
}