const http = require('http')
const path = require('path')
const url = require('url')
const fs = require('fs')

//Start HTTP Server
module.exports = (core) => {
  core.log('running', getTranslation('log>>正在啟動伺服器 (端口: {port})', { port: core.options.port }))

  let start = performance.now()

  let server = http.createServer((req, res) => {
    let reqPath = url.parse(req.url).pathname.split('/')
    reqPath.splice(0, 1)

    if (reqPath[0] === 'Api') {
      let query = url.parse(req.url, true).query
    } else if (reqPath[0] === 'Script') {
      if (fs.existsSync(getPath(__dirname, ['<', 'App', 'Scripts', reqPath[1]]))) {
        res.setHeader('Content-Type', 'text/javascript')
        res.end(fs.readFileSync(getPath(__dirname, ['<', 'App', 'Scripts', reqPath[1]])))
      } else res.end('Resource Not Found')
    } else if (reqPath[0] === 'NodeModule') {
      if (fs.existsSync(getPath(__dirname, ['<', 'App', 'Scripts', reqPath[1]]))) {
        res.setHeader('Content-Type', getContentType(path.extname(getPath(__dirname, ['<', 'App', 'node_modules'.concat(reqPath.slice(1, reqPath.length))]))))
        res.end(fs.readFileSync(getPath(__dirname, ['<', 'App', 'node_modules'.concat(reqPath.slice(1, reqPath.length))])))
      } else res.end('Resource Not Found')
    } else if (reqPath[0] === 'Language') {
      if (fs.existsSync(getPath(__dirname, ['<', '<', 'Languages', `${reqPath[1]}.json`]))) {
        let data = JSON.parse(fs.readFileSync(getPath(__dirname, ['<', '<', 'Languages', `${reqPath[1]}.json`])))

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
      if (fs.existsSync(getPath(__dirname, ['<', 'App', 'Page', `${reqPath[1]}.js`]))) {
        res.setHeader('Content-Type', 'text/javascript')
        res.end(fs.readFileSync(getPath(__dirname, ['<', 'App', 'Page', `${reqPath[1]}.js`])))
      } else res.end('Resource Not Found')
    } else res.end(fs.readFileSync(getPath(__dirname, ['<', 'App', 'App.html'])))
  })

  server.listen(core.options.port, () => core.log('complete', getTranslation('log>>成功啟動伺服器 (花費: {time}ms)', { time: Math.round(performance.now()-start) })))
}

const { getTranslation } = require('./Tools/Translation')
const getContentType = require('./Tools/GetContentType')
const getPath = require('./Tools/GetPath')