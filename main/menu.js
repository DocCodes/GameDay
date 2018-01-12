module.exports = {
  init
}

const {app, shell, Menu} = require('electron')
const config = require('../config')
const win = require('./window')

async function init () {
  let menu = Menu.buildFromTemplate(getMenuTemplate())
  Menu.setApplicationMenu(menu)
}

function getMenuTemplate () {
  let template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Edit This Site',
          accelerator: 'CmdOrCtrl+Shift+E',
          click: () => {
            console.log(global.site)
            if (global.site.editable) { shell.openItem(global.site.src) }
          }
        },
        {
          type: 'separator'
        },
        {
          label: process.platform === 'win32' ? 'Close' : 'Close Window',
          accelerator: 'CmdOrCtrl+W',
          role: 'close'
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {role: 'reload'},
        {role: 'forcereload'},
        {
          label: 'Developer Tools',
          accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
          click: () => win.toggleDevTools()
        },
        {type: 'separator'},
        {role: 'togglefullscreen'}
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: `Learn more about ${config.APP_NAME}`,
          click: () => shell.openExternal(config.GITHUB_URL)
        },
        {
          label: 'Report an Issue...',
          click: () => shell.openExternal(config.GITHUB_URL_ISSUES)
        }
      ]
    }
  ]

  if (process.platform === 'darwin') {
    template.unshift({
      label: config.APP_NAME,
      submenu: [
        {
          label: 'About ' + config.APP_NAME,
          role: 'about'
        },
        {
          type: 'separator'
        },
        {
          label: 'Hide ' + config.APP_NAME,
          accelerator: 'Command+H',
          role: 'hide'
        },
        {
          label: 'Hide Others',
          accelerator: 'Command+Alt+H',
          role: 'hideothers'
        },
        {
          label: 'Show All',
          role: 'unhide'
        },
        {
          type: 'separator'
        },
        {
          label: 'Quit',
          accelerator: 'Command+Q',
          click: () => app.quit()
        }
      ]
    })

    template.splice(3, 0, {
      label: 'Window',
      role: 'window',
      submenu: [
        {
          label: 'Minimize',
          accelerator: 'CmdOrCtrl+M',
          role: 'minimize'
        },
        {
          type: 'separator'
        },
        {
          label: 'Bring All to Front',
          role: 'front'
        }
      ]
    })

    app.setAboutPanelOptions({
      'applicationName': config.APP_NAME,
      'applicationVersion': config.APP_VERSION,
      'copyright': `${config.APP_COPYRIGHT}.\n All rights reserved.`
    })
  }

  if (process.platform === 'linux') {
    template[0].submenu.push({
      label: 'Quit',
      click: () => app.quit()
    })
  }

  return template
}
