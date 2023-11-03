export { checkSession }

import { getTranslation } from '/Script/Translation.js'
import { Component } from '/Script/UI.js'

//Check Session
async function checkSession () {
  return new Promise(async (resolve) => {
    if (window.localStorage.getItem('sessionID') === null && await (await fetch(`/Api/CheckSession?sessionID=${window.localStorage.getItem('sessionID')}`)).text() === 'false') {
      let div = document.body.appendChild(Component.div({ style: { position: 'fixed', center: 'row column', top: '0px', height: '0px', width: '100vw', height: '100vh', backdropFilter: 'blur(2.5px) brightness(75%)', zIndex: 999 }}))
      let div2 = div.appendChild(Component.div({ style: { display: 'flex', flexDirection: 'column', center: 'column', backgroundColor: 'var(--mainColor_dark)', border: '[0.1ps] solid var(--mainColor_border)', borderRadius: '10px', width: '[12.5ps]' }}))
      div2.appendChild(Component.text(1.25, getTranslation('ui>>登入'), { style: { marginTop: '[1ps]', marginBottom: '[1ps]', width: '[2.5ps]' }}))
      let input_name = div2.appendChild(Component.input('text', '', { style: { width: '[10ps]', marginBottom: '[0.5ps]' }}, getTranslation('ui>>帳號名')))
      let input_password = div2.appendChild(Component.input('text', '', { style: { width: '[10ps]', marginBottom: '[1ps]' }}, getTranslation('ui>>密碼')))
      div2.appendChild(Component.button(getTranslation('ui>>登入'), () => {
        
      }, { style: { marginBottom: '[1ps]', paddingLeft: '[0.75ps]', paddingRight: '[0.75ps]' }}))

      resolve()
    } else resolve()
  })
}