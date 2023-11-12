import { io } from '/NodeModule/socket.io-client/dist/socket.io.esm.min.js'

export { data, checkSession, sendRequest }

import { showPromptMessage } from '/Script/PromptMessage.js'
import { encrypt, decrypt } from '/Script/Encryption.js'
import { getTranslation } from '/Script/Translation.js'
import generateID from '/Script/GenerateID.js'
import { Component } from '/Script/UI.js'

let socket
let data = {}
let requests = {}

//Check Session
async function checkSession () {
  return new Promise(async (resolve) => {
    if (window.localStorage.getItem('sessionID') === null || window.localStorage.getItem('sessionSecret') === null || await (await fetch(`/Api/CheckSession?sessionID=${window.localStorage.getItem('sessionID')}`)).text() === 'false') {
      const div = document.body.appendChild(Component.div({ style: { position: 'fixed', center: 'row column', top: '0px', height: '0px', width: '100vw', height: '100vh', backdropFilter: 'blur(2.5px) brightness(75%)', zIndex: 998 }}))
      const div2 = div.appendChild(Component.div({ style: { display: 'flex', flexDirection: 'column', center: 'column', backgroundColor: 'var(--mainColor_dark)', border: '[0.1ps] solid var(--mainColor_border)', borderRadius: '[1ps]', width: '[12.5ps]' }}))
      div2.appendChild(Component.text(1.25, getTranslation('ui>>登入'), { style: { marginTop: '[1.5ps]', marginBottom: '[1ps]', width: '[2.5ps]' }}))
      const input_name = div2.appendChild(Component.input('text', '', { style: { marginBottom: '[0.5ps]', width: '[10.5ps]' }}, getTranslation('ui>>帳號名')))
      const input_password = div2.appendChild(Component.input('password', '', { style: { marginBottom: '[1.25ps]', width: '[10.5ps]' }}, getTranslation('ui>>密碼')))
      
      let state = false
      
      div2.appendChild(Component.button(getTranslation('ui>>登入'), async (element) => {
        if (!state) {
          if (input_name.value === '') showPromptMessage('var(--errorColor)', getTranslation('ui>>無法登入'), getTranslation('ui>>請輸入帳號名'))
          else if (input_password.value === '') showPromptMessage('var(--errorColor)', getTranslation('ui>>無法登入'), getTranslation('ui>>請輸入密碼'))
          else {
            state = true
            element.style.opacity = 0.5

            let response = await (await fetch(`/Api/Login?name=${input_name.value}&password=${input_password.value}`)).json()
            
            if (response.error) {
              if (response.content === 'Account Not Found') showPromptMessage('var(--errorColor)', getTranslation('ui>>登入失敗'), getTranslation('ui>>找不到該帳號'))
              else if (response.content === 'Wrong Password') showPromptMessage('var(--errorColor)', getTranslation('ui>>登入失敗'), getTranslation('ui>>密碼錯誤'))

              state = false
              element.style.opacity = 1
            } else {
              window.localStorage.setItem('sessionID', response.session.id)
              window.localStorage.setItem('sessionSecret', response.session.secret)

              let animation = div.animate([
                { opacity: 1 },
                { opacity: 0 }
              ], { duration: 500 })

              animation.addEventListener('finish', async () => {
                div.remove()

                await checkSession()

                resolve()
              }, { once: true })
            }
          }
        }
      }, { style: { marginBottom: '[1.5ps]', paddingLeft: '[0.75ps]', paddingRight: '[0.75ps]' }}))
    } else {
      let refer = generateID(25, [])

      socket = io({
        transports: ['websocket'],
        auth: {
          sessionID: window.localStorage.getItem('sessionID'),
          data: encrypt(window.localStorage.getItem('sessionSecret'), window.localStorage.getItem('sessionID'))
        }
      })

      socket.on('connect', async () => {
        console.log(`[Socket]: ${getTranslation('log>>連接成功')}`)

        data.panelInfo = await sendRequest({ type: 'getPanelInfo' })

        console.log(getTranslation('log>>- Light Panel -\n\n版本: {version}', { version: data.panelInfo.version, platform: data.panelInfo.platform, toltalMemory: data.panelInfo.toltalMemory }))
      })

      socket.on('response', (data) => {
        let response = JSON.parse(decrypt(window.localStorage.getItem('sessionSecret'), data))
       
        if (requests[response.requestID] !== undefined) {
          requests[response.requestID](response.data)
          delete requests[response.requestID]
        }
      })

      socket.on('disconnect', () => {
        window.localStorage.removeItem('sessionID')
        window.localStorage.removeItem('sessionSecret')
        
        window.location.reload()
      })

      resolve()
    }
  })
}

//Send Request
async function sendRequest (data) {
  return new Promise((resolve) => {
    let id = generateID(5, Object.keys(requests))

    requests[id] = resolve

    socket.emit('request', encrypt(window.localStorage.getItem('sessionSecret'), JSON.stringify(Object.assign(data, { requestID: id }))))
  })
} 