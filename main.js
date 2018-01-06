// <region> Variables
const {app, BrowserWindow, dialog, shell} = require('electron')
const fs = require('fs')
const path = require('path')
const url = require('url')
let win
let userData = app.getPath('userData')
// </region>

// <region> Files and Directories
// TODO: The file checking and creation, might be better to do a loading screen :/
try {
  fs.readdirSync(userData)
} catch (e) {
  if (e.code === 'ENOENT') {
    fs.mkdirSync(userData)
  } else {throw e}
}
try {
  global.settings = JSON.parse(fs.readFileSync(path.join(userData, 'settings.json')))
} catch (e) {
  if (e.code === 'ENOENT') {
    let defaultSettings = {
      "home": "home"
    }
    fs.writeFileSync(path.join(userData, 'settings.json'), '')
    fs.writeFileSync(path.join(userData, 'settings.json'), JSON.stringify(defaultSettings))
    global.settings = defaultSettings
  } else {throw e}
}
try {
  global.subsites = fs.readdirSync(path.join(userData, 'sites'))
} catch (e) {
  if (e.code === 'ENOENT') {
    fs.mkdirSync(path.join(userData, 'sites'))
    global.subsites = fs.readdirSync(path.join(userData, 'sites'))
  } else {throw e}
}
global.site = {name: global.settings.home, mode: 'view'}
// </region>

// <region> Window Handling
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
// </region>

// <region> App Handling
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
// </region>
