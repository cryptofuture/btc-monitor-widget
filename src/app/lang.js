'use strict'
const fs = require('fs')
const os = require('os')
const path = require('path')
const platform = os.platform()

var btcMonitorWidget
var configFolderHome
var settingsFile

if (platform.includes('win32')) {
  btcMonitorWidget = process.env.APPDATA + '\\btc-monitor-widget'
  configFolderHome = btcMonitorWidget + '\\config'
  settingsFile = configFolderHome + '\\settings.json'
} else if (platform.includes('darwin')) {
  btcMonitorWidget = process.env.HOME + '/Library/btc-monitor-widget'
  configFolderHome = btcMonitorWidget + '/config'
  settingsFile = configFolderHome + '/settings.json'
} else if (platform.includes('linux')) {
  btcMonitorWidget = process.env.HOME + '/.btc-monitor-widget'
  configFolderHome = btcMonitorWidget + '/config'
  settingsFile = configFolderHome + '/settings.json'
}

const settings = JSON.parse(fs.readFileSync(settingsFile, 'utf-8'))

module.exports = {
  echo: function (phrase) {
    var locales = path.normalize(nw.__dirname + '/locales') // eslint-disable-line
    var y18n = require('y18n')({
      updateFiles: false,
      directory: locales,
      locale: settings.locale,
      fallbackToLanguage: 'en'
    })
    return y18n.__(phrase + '')
  },
  changeLanguage: function (locale) {
    settings.locale = locale
    fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
    global.btcMonitorWidget.reloadIgnoringCache()
  }
}
