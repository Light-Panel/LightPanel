require('./Modules/Server/CheckEnvironment')()

//API
module.exports = {
  Server: require('./Modules/Server/Main')
}