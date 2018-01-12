module.exports = {
  setBadge
}

const {app} = require('electron')

async function setBadge (text) {
  if (!app.dock) { return }
  console.log(`setBadge: ${text}`)
  app.dock.setBadge(String(text))
}
