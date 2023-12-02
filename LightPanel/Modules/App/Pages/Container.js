import { displayFeatures, event, createInterval } from '/Script/PageAPI.js'
import displayContainerState from '/Script/ContainerState.js'
import { showPromptMessage } from '/Script/PromptMessage.js'
import applyParameters from '/Script/ApplyParameters.js'
import { getTranslation } from '/Script/Translation.js'
import { data, sendRequest } from '/Script/Session.js'
import { Component, FontSize } from '/Script/UI.js'
import generateID from '/Script/GenerateID.js'
import drawGraph from '/Script/Graph.js'

(async () => {
  let id = new URLSearchParams(window.location.search).get('id')

  if (id === null) window.location.href = '/Containers'
  else {
    data.accountInfo = await sendRequest({ type: 'getAccountInfo' })

    if ((data.accountInfo.permissions.includes('manageContainers') || data.accountInfo.containers.includes(id)) && await sendRequest({ type: 'getContainerInfo', id }) !== undefined) {
      window.document.title = `Light Panel | ${getTranslation('ui>>容器 - {id}', { id })}`
      displayFeatures('container')

      displayContainerState(id)

			let feature = new URLSearchParams(window.location.search).get('feature')

      let pageData
      if (feature === 'state' || feature === null) pageData = await (await fetch('/Page/Container_State')).text()
      else if (feature === 'console') pageData = await (await fetch('/Page/Container_Console')).text()
      else if (feature === 'fileManager') pageData = await (await fetch('/Page/Container_FileManager')).text()
			else window.location.href = `/Container?id=${id}`

      eval(pageData)
    } else window.location.href = '/Containers'
  }
})()
