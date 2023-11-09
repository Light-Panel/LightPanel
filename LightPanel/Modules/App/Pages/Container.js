(async () => {
  let id = new URLSearchParams(window.location.search).get('id')

  if (id === null) {
    data.accountInfo = await sendRequest({ type: 'getAccountInfo' })
  }
})()