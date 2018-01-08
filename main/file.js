module.exports = {
  readMakeDirSync,
  readMakeFileSync,
  init
}

const {app} = require('electron')
const fs = require('fs')
const path = require('path')

function init () {
  let userData = app.getPath('userData')
  let defaultSettings = {
    'home': 'home'
  }

  readMakeDirSync(userData)
  global.subsites = readMakeDirSync(path.join(userData, 'sites'))
  global.settings = JSON.parse(readMakeFileSync(path.join(userData, 'settings.json'), JSON.stringify(defaultSettings)))
  global.site = {name: global.settings.home, mode: 'view'}
}

function readMakeDirSync (p) {
  try {
    return fs.readdirSync(p)
  } catch (e) {
    if (e.code === 'ENOENT') {
      fs.mkdirSync(p)
    } else { throw e }
  }
  return fs.readdirSync(p)
}

function readMakeFileSync (p, cont = '') {
  try {
    return fs.readFileSync(p)
  } catch (e) {
    fs.writeFileSync(p, cont)
  }
  return fs.readFileSync(p)
}
