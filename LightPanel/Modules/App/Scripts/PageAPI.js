export { loadPage, addFeatures }

//Load Page
async function loadPage (name) {
  let response = await (await fetch(`/Page/${name}`))

  console.log(response)
}

function addFeatures () {

}