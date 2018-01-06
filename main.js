// <region> Variables
const {app, BrowserWindow, dialog, shell, Menu, ipcMain} = require('electron')
const fs = require('fs')
const path = require('path')
const url = require('url')
const pkg = require('./package.json')
let win
let userData = app.getPath('userData')
// </region>

// <region> Initialization
function readMakeDirSync (p) {
  try {
    return fs.readdirSync(p)
  } catch (e) {
    if (e.code === 'ENOENT') {
      fs.mkdirSync(p)
    } else {throw e}
  } finally {
    return fs.readdirSync(p)
  }
}
function readMakeFileSync (p, cont = '') {
  try {
    return fs.readFileSync(p)
  } catch (e) {
    fs.writeFileSync(p, cont)
  } finally {
    return fs.readFileSync(p)
  }
}

function initialize () {
  let defaultSettings = {
    "home": "home"
  }

  readMakeDirSync(userData)
  global.subsites = readMakeDirSync(path.join(userData, 'sites'))
  global.settings = JSON.parse(readMakeFileSync(path.join(userData, 'settings.json'), JSON.stringify(defaultSettings)))
  global.site = {name: global.settings.home, mode: 'view'}
}
initialize()
// </region>

// <region> Window Handling
function createWindow () {
  win = new BrowserWindow({
    minWidth: 600,
    minHeight: 600,
    backgroundColor: '#181818',
    show: false
  })

  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  win.on('closed', () => {
    win = null
  })

  win.on('ready-to-show', () => {
    win.show()
  })
}
// </region>

// <region> Menu
const template = [
  {
    label: 'File',
    submenu: [
      {role: 'exit'}
    ]
  },
  {
    label: 'Edit',
    submenu: [
      {role: 'cut'},
      {role: 'copy'},
      {role: 'selectall'}
    ]
  },
  {
    label: 'View',
    submenu: [
      {role: 'reload'},
      {role: 'forcereload'},
      {role: 'toggledevtools'},
      {type: 'separator'},
      {role: 'resetzoom'},
      {role: 'zoomin'},
      {role: 'zoomout'},
      {type: 'separator'},
      {role: 'togglefullscreen'}
    ]
  },
  {
    role: 'window',
    submenu: [
      {role: 'minimize'},
      {role: 'close'}
    ]
  }
]
const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)
// </region>

// <region> App Handling
app.on('ready', () => {
  switch (process.platform) {
    case 'darwin':
      app.setAboutPanelOptions({
        'applicationName': pkg.name,
        'applicationVersion': pkg.version,
        'copyright': `Copyright © 2018 ${pkg.author}.\n All rights reserved.`
      })
      break
    default:
      console.log(`Platform:${process.platform}`)
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
