module.exports = {
  init
}

const {app, ipcMain} = require('electron')
const dock = require('./dock')
const main = require('./window')


function init () {
  ipcMain.once('ipcReady', (e) => {
    app.ipcReady = true
    app.emit('ipcReady')
  })

  ipcMain.on('setBadge', (e, ...args) => dock.setBadge(...args))

  ipcMain.on('setProgress', (e, ...args) => main.setProgress(...args))
  ipcMain.on('setTitle', (e, ...args) => main.setTitle(...args))
  ipcMain.on('show', () => main.show())
  ipcMain.on('siteChange', (e, ...args) => {
    global.site = args[0]
  })
}
