var appConfig = require('application-config')('GameDay')
var fs = require('fs')
var path = require('path')

var APP_NAME = 'GameDay'
var APP_TEAM = 'Evan Young'
var APP_VERSION = require('./package.json').version

module.exports = {
  APP_COPYRIGHT: `Copyright © 2017-2018 ${APP_TEAM}`,
  APP_NAME: APP_NAME,
  APP_TEAM: APP_TEAM,
  APP_VERSION: APP_VERSION,
  APP_WINDOW_TITLE: APP_NAME,

  CONFIG_PATH: path.dirname(appConfig.filePath),

  GITHUB_URL: 'https://github.com/doccodes/gameday',
  GITHUB_URL_ISSUES: 'https://github.com/doccodes/gameday/issues',
  GITHUB_URL_RAW: 'https://raw.githubusercontent.com/doccodes/gameday',

  ROOT_PATH: __dirname,

  WINDOW_MAIN: `file://${path.join(__dirname, 'renderer', 'index.html')}`,
  WINDOW_MIN_WIDTH: 600,
  WINDOW_MIN_HEIGHT: 600
}
