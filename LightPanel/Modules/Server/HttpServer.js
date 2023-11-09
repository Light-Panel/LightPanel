const http = require('http')
const path = require('path')
const url = require('url')
const fs = require('fs')

//Start HTTP Server
module.exports = (core) => {
  core.log('running', getTranslation('log>>正在啟動伺服器 (端口: {port})', { port: core.options.port }))

  let start = performance.now()

  let server = http.createServer((req, res) => {
    if (checkClient(req.socket.remoteAddress)) {
      let reqPath = url.parse(req.url).pathname.split('/')
      reqPath.splice(0, 1)

      if (reqPath[0] === 'Api') {
        let query = url.parse(req.url, true).query

        if (reqPath[1] === 'CheckSession') res.end(JSON.stringify(core.session.checkSession(query.sessionID)))
        else if (reqPath[1] === 'Login') res.end(JSON.stringify(core.account.login(query.name, query.password)))
      } else if (reqPath[0] === 'Script') {
        if (fs.existsSync(getPath(__dirname, ['<', 'App', 'Scripts', reqPath[1]]))) {
          res.setHeader('Content-Type', 'text/javascript')
          res.end(fs.readFileSync(getPath(__dirname, ['<', 'App', 'Scripts', reqPath[1]])))
        } else res.end('Resource Not Found')
      } else if (reqPath[0] === 'NodeModule') {
        if (fs.existsSync(getPath(__dirname, ['<', '<', 'node_modules'].concat(reqPath.slice(1, reqPath.length))))) {
          res.setHeader('Content-Type', getContentType(path.extname(getPath(__dirname, ['<', '<', 'node_modules'].concat(reqPath.slice(1, reqPath.length))))))
          res.end(fs.readFileSync(getPath(__dirname, ['<', '<', 'node_modules'].concat(reqPath.slice(1, reqPath.length)))))
        } else res.end('Resource Not Found')
      } else if (reqPath[0] === 'Language') {
        if (fs.existsSync(getPath(__dirname, ['<', '<', 'Data', 'Languages', `${reqPath[1]}.json`]))) {
          let data = JSON.parse(fs.readFileSync(getPath(__dirname, ['<', '<', 'Data', 'Languages', `${reqPath[1]}.json`])))

          res.end(JSON.stringify({ info: data.info, content: data.content.app }))
        } else res.end('Resource Not Found')
      } else if (reqPath[0] === 'Theme') {
        if (reqPath[1] === 'Default') res.end(fs.readFileSync(getPath(__dirname, ['<', 'App', 'DefaultTheme.css'])))
        else {
          if (fs.existsSync(getPath(__dirname, ['<', 'App', 'Theme', `${reqPath[1]}.css`]))) res.end(fs.readFileSync(getPath(__dirname, ['<', 'App', 'Theme', `${reqPath[1]}.css`])))
          else res.end('Resource Not Found')
       }
      } else if (reqPath[0] === 'Image') {
        if (fs.existsSync(getPath(__dirname, ['<', 'App', 'Images', reqPath[1]]))) {
          res.setHeader('Content-Type', getContentType(getPath(__dirname, ['<', 'App', 'Images', reqPath[1]])))
          res.end(fs.readFileSync(getPath(__dirname, ['<', 'App', 'Images', reqPath[1]])))
        } else res.end('Resource Not Found')
      } else if (reqPath[0] === 'Page') {
        if (fs.existsSync(getPath(__dirname, ['<', 'App', 'Pages', `${reqPath[1]}.js`]))) {
          res.setHeader('Content-Type', 'text/javascript')
          res.end(fs.readFileSync(getPath(__dirname, ['<', 'App', 'Pages', `${reqPath[1]}.js`])))
        } else res.end('Resource Not Found')
      } else res.end(fs.readFileSync(getPath(__dirname, ['<', 'App', 'App.html']))) 
    } else req.socket.destroy()
  })

  server.listen(core.options.port, () => core.log('complete', getTranslation('log>>成功啟動伺服器 (花費: {time}ms)', { time: Math.round(performance.now()-start) })))

  //Request Monitoring
  let client = {}

  setInterval(() => {
    Object.keys(client).forEach((item) => {
      if (client[item].block) {
        //5 Minute
        if (performance.now()-client[item].blockStart > 300000) {
          core.log('warn', getTranslation('log>>已解封 {address}', { address: item }))

          client[item].block = false
          client[item].blockStart = undefined
        }
      } else {
        //5 Minute
        if (performance.now()-client[item].lastActiveTime > 300000) delete client[item]
        else {
          client[item].record.push(client[item].count)

          if (client[item].record.length > 10) client[item].record.splice(0, 1)
    
          if (client[item].count > 50 || (client[item].record.length === 10 && client[item].record.reduce((a, b) => a+b)/client[item].record.length > 25)) {
            core.log('warn', getTranslation('log>>檢測到 DoS 攻擊，將在未來的 5 分鐘內阻擋來自 {address} 的請求 (平均每秒 {averageRequestPerSecond} 個請求)', { address: item, averageRequestPerSecond: Math.round(client[item].record.reduce((a, b) => a+b)/client[item].record.length) }))
            
            client[item].block = true
            client[item].blockStart = performance.now()
            client[item].record = []
          }
  
          client[item].count = 0
        }
      }
    })
  }, 1000)

  //Check Is Client Sending To Many Request
  function checkClient (address) {
    if (client[address] === undefined) client[address] = { block: false, blockStart: undefined, record: [], count: 0, lastActiveTime: performance.now() }
    else if (client[address].block) return false
    else {
      client[address].count++
      client[address].lastActiveTime = performance.now()
    }

    return true
  }

  return server
}

const { getTranslation } = require('./Tools/Translation')
const getContentType = require('./Tools/GetContentType')
const getPath = require('./Tools/GetPath')