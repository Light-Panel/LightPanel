export { showPromptMessage }

import { Component } from '/Script/UI.js'

//Show A New Prompt Message
function showPromptMessage (color, title, content) {
  const promptMessages = document.getElementById('promptMessages')

  let div = promptMessages.insertBefore(Component.div({ style: { display: 'flex', backgroundColor: 'var(--mainColor_dark)', border: '[0.1ps] solid var(--mainColor_border)', borderRadius: '[0.5ps]', marginLeft: '[0.5ps]', marginTop: '[0.5ps]', width: '[12.5ps]', height: '[4.25ps]', animation: 'promptMessage_show 0.25s 1', overflow: 'hidden', cursor: 'pointer' }}), promptMessages.childNodes[0])
  div.appendChild(Component.div({ style: { backgroundColor: color, width: '[0.25ps]', height: '[4.35ps]' }}))
  let div2 = div.appendChild(Component.div({ style: { width: '[12.25ps]', height: '[4.35ps]' }}))
  div2.appendChild(Component.text(1, title, { style: { whiteSpace: 'wrap', marginLeft: '[0.5ps]', marginTop: '[0.3ps]' }}))
  div2.appendChild(Component.text(0.7, content, { style: { marginLeft: '[0.5ps]', opacity: 0.75 }}))

  let timeout = setTimeout(() => closePromptMessage(div), 5000)

  div.addEventListener('click', () => {
    clearTimeout(timeout)
    closePromptMessage(div)
  }, { once: true })
}

//Close Prompt Message
function closePromptMessage (div) {
  let animation = div.animate([
    { borderRadius: `${((window.innerWidth+window.innerHeight)/100)*0.5}px`, height: `${((window.innerWidth+window.innerHeight)/100)*4.25}px` },
    { borderRadius: `${((window.innerWidth+window.innerHeight)/100)*0.25}px`, height: '0px' }
  ], { duration: 250 })

  animation.addEventListener('finish', () => div.remove(), { once: true })
}