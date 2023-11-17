import { displayFeatures, event, createInterval } from '/Script/PageAPI.js'
import displayContainerState from '/Script/DisplayContainerState.js'
import { socket, data, sendRequest } from '/Script/Session.js'
import { encrypt, decrypt } from '/Script/Encryption.js'
import { getTranslation } from '/Script/Translation.js'
import { Component, FontSize } from '/Script/UI.js'
import generateID from '/Script/GenerateID.js'
import drawGraph from '/Script/Graph.js'

(async () => {
  let id = new URLSearchParams(window.location.search).get('id')

  if (id === null) window.location.href = '/Containers'
  else {
    data.accountInfo = await sendRequest({ type: 'getAccountInfo' })

    if ((data.accountInfo.permissions.includes('manageContainers') || data.accountInfo.containers.includes(id)) && await sendRequest({ type: 'getContainerInfo', id }) !== undefined) {
      displayFeatures('container')

      displayContainerState(id)

      let feature = new URLSearchParams(window.location.search).get('feature')

      let pageData
      if (feature === 'state' || feature === null) pageData = await (await fetch('/Page/Container_State')).text()
      else if (feature === 'console') pageData = await (await fetch('/Page/Container_Console')).text()
      else window.location.href = `/Container?id=${id}`

      data.containerShortcuts = await sendRequest({ type: 'getContainerShortcuts', id })

      eval(pageData)
    } else window.location.href = '/Containers'
  }
})()