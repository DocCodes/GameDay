const main = module.exports = {
  init,
  send,
  setProgress,
  setTitle,
  show,
  toggleDevTools,
  win: null
}

const {BrowserWindow} = require('electron')
const config = require('../config')

async function init () {
  if (main.win) { return main.win.show() }
  var win = main.win = new BrowserWindow({
    backgroundColor: '#181818',
    darkTheme: true,
    // icon: getIconPath(),
    minWidth: config.WINDOW_MIN_WIDTH,
    minHeight: config.WINDOW_MIN_HEIGHT,
    width: 1.3 * config.WINDOW_MIN_WIDTH,
    height: 1.4 * config.WINDOW_MIN_HEIGHT,
    title: config.APP_WINDOW_TITLE,
    useContentSize: true,
    show: false
  })
  win.loadURL(config.WINDOW_MAIN)

  win.on('closed', () => {
    win = null
  })

  win.once('ready-to-show', () => {
    win.show()
  })
}

function send (...args) {
  if (!main.win) { return }
  main.win.send(...args)
}

function setProgress (progress) {
  if (!main.win) { return }
  main.win.setProgressBar(progress)
}

function setTitle (title) {
  if (!main.win) { return }
  main.win.setTitle(title)
}

function show () {
  if (!main.win) { return }
  main.win.show()
}

function toggleDevTools () {
  if (!main.win) { return }
  if (main.win.webContents.isDevToolsOpened()) {
    main.win.webContents.closeDevTools()
  } else {
    main.win.webContents.openDevTools({detach: true})
  }
}

// function getIconPath () {
//   return process.platform === 'win32' ? config.APP_ICON + '.ico' : config.APP_ICON + '.png'
// }
