console.time('app')
console.time('init')

// <region> Variables
const {app} = require('electron')
const config = require('../config')
const ipc = require('./ipc')
// </region>

// <region> App Handling
ipc.init()
app.on('ready', () => {
  console.timeEnd('app')
  const file = require('./file')
  const menu = require('./menu')
  const main = require('./window')
  let isReady = true

  main.init()
  file.init()
  menu.init()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (main === null) {
    main.init()
  }
})

app.once('ipcReady', function () {
  console.timeEnd('init')
})
// </region>
