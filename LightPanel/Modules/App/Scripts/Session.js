import { io } from '/NodeModule/socket.io-client/dist/socket.io.esm.min.js'

export { data, checkSession }

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
      let div = document.body.appendChild(Component.div({ style: { position: 'fixed', center: 'row column', top: '0px', height: '0px', width: '100vw', height: '100vh', backdropFilter: 'blur(2.5px) brightness(75%)', zIndex: 998 }}))
      let div2 = div.appendChild(Component.div({ style: { display: 'flex', flexDirection: 'column', center: 'column', backgroundColor: 'var(--mainColor_dark)', border: '[0.1ps] solid var(--mainColor_border)', borderRadius: '[1ps]', width: '[12.5ps]' }}))
      div2.appendChild(Component.text(1.25, getTranslation('ui>>登入'), { style: { marginTop: '[1ps]', marginBottom: '[1ps]', width: '[2.5ps]' }}))
      let input_name = div2.appendChild(Component.input('text', '', { style: { width: '[10ps]', marginBottom: '[0.5ps]' }}, getTranslation('ui>>帳號名')))
      let input_password = div2.appendChild(Component.input('password', '', { style: { width: '[10ps]', marginBottom: '[1ps]' }}, getTranslation('ui>>密碼')))
      
      let state = false
      
      div2.appendChild(Component.button(getTranslation('ui>>登入'), async () => {
        if (!state) {
          if (input_name.value === '') showPromptMessage('var(--errorColor)', getTranslation('ui>>無法登入'), getTranslation('ui>>請輸入帳號名'))
          else if (input_password.value === '') showPromptMessage('var(--errorColor)', getTranslation('ui>>無法登入'), getTranslation('ui>>請輸入密碼'))
          else {
            state = true

            let response = await (await fetch(`/Api/Login?name=${input_name.value}&password=${input_password.value}`)).json()
            
            if (response.error) {
              if (response.content === 'Account Not Found') showPromptMessage('var(--errorColor)', getTranslation('ui>>登入失敗'), getTranslation('ui>>找不到該帳號'))
              else if (response.content === 'Wrong Password') showPromptMessage('var(--errorColor)', getTranslation('ui>>登入失敗'), getTranslation('ui>>密碼錯誤'))

              state = false
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
      }, { style: { marginBottom: '[1ps]', paddingLeft: '[0.75ps]', paddingRight: '[0.75ps]' }}))

      resolve()
    } else {
      let refer = generateID(25, [])

      socket = io({
        transports: ['websocket'],
        auth: {
          sessionID: window.localStorage.getItem('sessionID'),
          data: encrypt(window.localStorage.getItem('sessionSecret'), window.localStorage.getItem('sessionID'))
        }
      })

      socket.on('connect', () => {
        sendRequest({ type: 'getPanelInfo' })
      })

      socket.on('response', (data) => {
        
      })

      socket.on('disconnect', () => {
        window.localStorage.removeItem('sessionID')
        window.localStorage.removeItem('sessionSecret')
        
        window.location.href = '/Containers'
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