const {app, BrowserWindow, dialog, shell} = require('electron')
const fs = require('fs')
const path = require('path')
const url = require('url')
let win

try {
  global.settings = JSON.parse(fs.readFileSync(path.join(app.getPath('userData'), 'settings.json')))
} catch (e) {
  if (e.code === 'ENOENT') {
    let defaultSettings = {
      "home": "home"
    }
    fs.writeFileSync(path.join(app.getPath('userData'), 'settings.json'), JSON.stringify(defaultSettings))
    global.settings = defaultSettings
  } else {throw e}
}
try {
  global.subsites = fs.readdirSync(path.join(app.getPath('userData'), 'sites'))
} catch (e) {
  if (e.code === 'ENOENT') {
    fs.mkdirSync(path.join(app.getPath('userData'), 'sites'))
    global.subsites = fs.readdirSync(path.join(app.getPath('userData'), 'sites'))
  } else {throw e}
}
global.site = {name: global.settings.home}


function createWindow () {
  win = new BrowserWindow({
    minWidth: 600,
    minHeight: 600,
    backgroundColor: '#181818'
  })

  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  win.on('closed', () => {
    win = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})
