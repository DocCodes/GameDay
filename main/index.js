console.time('init')

// <region> Variables
const {app} = require('electron')
const config = require('../config')
const file = require('./file')
const dock = require('./dock')
const ipc = require('./ipc')
const menu = require('./menu')
const main = require('./window')
// </region>

// <region> App Handling
ipc.init()
app.on('ready', () => {
  isReady = true

  file.init()
  main.init()
  menu.init()

  if (process.platform === 'darwin') {
    app.setAboutPanelOptions({
      'applicationName': config.APP_NAME,
      'applicationVersion': config.APP_VERSION,
      'copyright': `${config.APP_COPYRIGHT}.\n All rights reserved.`
    })
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (win === null) {
    main.init()
  }
})

app.once('ipcReady', function () {
  console.timeEnd('init')
})
// </region>
