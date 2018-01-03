// <region> Variables
const {app, BrowserWindow, dialog, shell} = require('electron')
const fs = require('fs')
const path = require('path')
const url = require('url')
let win
let userPath = app.getPath('userData')
// </region>

// <region> Files and Directories
try {
  fs.readdirSync(userPath)
} catch (e) {
  if (e.code === 'ENOENT') {
    fs.mkdirSync(userPath)
  } else {throw e}
}
try {
  global.settings = JSON.parse(fs.readFileSync(path.join(userPath, 'settings.json')))
} catch (e) {
  if (e.code === 'ENOENT') {
    let defaultSettings = {
      "home": "home"
    }
    fs.writeFileSync(path.join(userPath, 'settings.json'), '')
    fs.writeFileSync(path.join(userPath, 'settings.json'), JSON.stringify(defaultSettings))
    global.settings = defaultSettings
  } else {throw e}
}
try {
  global.subsites = fs.readdirSync(path.join(userPath, 'sites'))
} catch (e) {
  if (e.code === 'ENOENT') {
    fs.mkdirSync(path.join(userPath, 'sites'))
    global.subsites = fs.readdirSync(path.join(userPath, 'sites'))
  } else {throw e}
}
global.site = {name: global.settings.home, mode: 'view'}
// </region>

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

app.on('ready', () => {
  if (process.platform === 'darwin') {
    app.setAboutPanelOptions({
      'applicationName': app.getName(),
      'applicationVersion': app.getVersion(),
      'copyright': 'Copyright © 2018 Evan Young.\n All rights reserved.'
    })
  }
  createWindow()
})

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
