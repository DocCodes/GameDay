module.exports = {
  setBadge
}

const {app} = require('electron')


function init () {
  if (!app.dock) {return}
}

function setBadge (text) {
  if (!app.dock) {return}
  log(`setBadge: ${text}`)
  app.dock.setBadge(String(text))
}
