'use strict'
const os = require('os')
const platform = os.platform()
const fs = require('fs')
const path = require('path')
const requestClient = require('requestretry')
const gui = window.require('nw.gui')
var btcMonitorWidget
var configFolderHome
var settingsFile
var coinsFile
var coinsFileCmc
var stylesFile

if (platform.includes('win32')) {
  btcMonitorWidget = process.env.APPDATA + '\\btc-monitor-widget'
  configFolderHome = btcMonitorWidget + '\\config'
  settingsFile = configFolderHome + '\\settings.json'
  coinsFile = configFolderHome + '\\coins.json'
  coinsFileCmc = configFolderHome + '\\coins-cmc.json'
  stylesFile = configFolderHome + '\\light.css'
} else if (platform.includes('darwin')) {
  btcMonitorWidget = process.env.HOME + '/Library/btc-monitor-widget'
  configFolderHome = btcMonitorWidget + '/config'
  settingsFile = configFolderHome + '/settings.json'
  coinsFile = configFolderHome + '/coins.json'
  coinsFileCmc = configFolderHome + '/coins-cmc.json'
  stylesFile = configFolderHome + '/light.css'
} else if (platform.includes('linux')) {
  btcMonitorWidget = process.env.HOME + '/.btc-monitor-widget'
  configFolderHome = btcMonitorWidget + '/config'
  settingsFile = configFolderHome + '/settings.json'
  coinsFile = configFolderHome + '/coins.json'
  coinsFileCmc = configFolderHome + '/coins-cmc.json'
  stylesFile = configFolderHome + '/light.css'
}

if (!fs.existsSync(btcMonitorWidget)) fs.mkdirSync(btcMonitorWidget)
if (!fs.existsSync(configFolderHome)) fs.mkdirSync(configFolderHome)
if (!fs.existsSync(settingsFile)) fs.copyFileSync(path.normalize(nw.__dirname + '/app/json/settings.json'), settingsFile) // eslint-disable-line
if (!fs.existsSync(coinsFile)) fs.copyFileSync(path.normalize(nw.__dirname + '/app/json/coins.json'), coinsFile) // eslint-disable-line
if (!fs.existsSync(coinsFileCmc)) fs.copyFileSync(path.normalize(nw.__dirname + '/app/json/coins-cmc.json'), coinsFileCmc) // eslint-disable-line
if (!fs.existsSync(stylesFile)) fs.copyFileSync(path.normalize(nw.__dirname + '/styles/main/css/light.css'), stylesFile) // eslint-disable-line

global.stylesFileLocal = ('file://' + stylesFile)
global.stylesFile = fs.readFileSync(stylesFile).toString()

const settings = JSON.parse(fs.readFileSync(settingsFile, 'utf-8'))
global.useful = settings.useful

if (settings.strictTls === 'disable') {
  global.strictTls = settings.strictTls
  global.tlsSettings = { rejectUnauthorized: false, requestCert: false, strictSSL: false }
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
} else {
  global.strictTls = 'enable'
  global.tlsSettings = {}
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1'
}

if (settings.corsProxy === 'enable') {
  global.corsProxy = 'https://autumn-wildflower-e3ba.bitcoin-monitor-widget.workers.dev/corsproxy/?apiurl='
} else {
  global.corsProxy = ''
}

const tickers = require('../app/tickers') // eslint-disable-line
const lang = require('../app/lang')
const prefs = require('../app/prefs')
if (typeof (global.licenseRender) === 'undefined') {
  prefs.preLicense()
}

requestClient.get({
  options: global.tlsSettings,
  maxAttempts: 3,
  retryDelay: 2000,
  uri: global.corsProxy + 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd%2Cbtc',
  json: true
}, function (error, response, body) {
  console.error('error-coingecko:', error)
  if (typeof (body.bitcoin.usd) !== 'undefined' && body.bitcoin.usd !== null) {
    process.env.BTC_USD = body.bitcoin.usd
  }
})

setInterval(function () {
  requestClient.get({
    options: global.tlsSettings,
    maxAttempts: 3,
    retryDelay: 2000,
    uri: global.corsProxy + 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd%2Cbtc',
    json: true
  }, function (error, response, body) {
    console.error('error-coingecko:', error)
    if (typeof (body.bitcoin.usd) !== 'undefined' && body.bitcoin.usd !== null) {
      process.env.BTC_USD = body.bitcoin.usd
    }
  })
}, 896400)

prefs.preBackgroundColor()
prefs.preTelegram()
prefs.preBoardColor()
prefs.preAssets()
prefs.preBoardTicker()
prefs.preBoardAlarm()
prefs.preMarketCap()

const menu = new nw.Menu({ // eslint-disable-line
  type: 'menubar'
})

if (platform.includes('darwin')) {
  menu.createMacBuiltin('Bitcoin Monitor Widget', { // eslint-disable-line
    hideEdit: false,
    hideWindow: true
  })
}
const mCoinGecko = 'CoinGecko'
const mCoinMarketCap = 'CoinMarketCap'
const mDefiPulse = 'DeFi Pulse'
const mUniswap = 'Uniswap'
const mEtherscan = 'Etherscan Tokens'
const mDiscord = 'Discord'
const mForgingblock = 'Forgingblock'
const mTradingview = 'TradingView Cryptocurrency'
const mQuit = lang.echo('Quit')
const mAlarmList = lang.echo('Alarm List')
const mTelegram = lang.echo('Telegram (open discussion)')
const mContact = lang.echo('Contact Form')
const mReddit = 'Reddit'
const mMaximize = lang.echo('Maximize')
const mMinimize = lang.echo('Minimize')
const mEng = lang.echo('Change Language: English')
const mRus = lang.echo('Change Language: Russian')
const mAdvanced = lang.echo('Advanced Preferences')
// const mStyles = lang.echo('Edit CSS (styles) file')
const mSettings = lang.echo('Settings')
const mHelp = lang.echo('Help')
const mOfficial = lang.echo('Official Website')
const mBoard = lang.echo('App')
const mBackgroundColor = lang.echo('Select Background Color')
const mPortfolio = lang.echo('Launch Portfolio')
const mPreferences = lang.echo('Preferences')
const mlicenseStatus = lang.echo('License Status')

const app = new nw.Menu() // eslint-disable-line

app.append(new nw.MenuItem({ // eslint-disable-line
  label: mPortfolio,
  key: 'p',
  modifiers: 'ctrl',
  click: function () {
    prefs.portfolioConfigurationWindow()
  }
}))
app.append(new nw.MenuItem({ // eslint-disable-line
  label: mBackgroundColor,
  key: 'b',
  modifiers: 'ctrl',
  click: function () {
    prefs.backgroundColorConfigurationWindow()
  }
}))
app.append(new nw.MenuItem({ // eslint-disable-line
  label: mAlarmList,
  click: function () {
    prefs.alarmListWindow()
  }
}))
app.append(new nw.MenuItem({ // eslint-disable-line
  type: 'separator'
}))
app.append(new nw.MenuItem({ // eslint-disable-line
  label: mPreferences,
  key: 's',
  modifiers: 'ctrl',
  click: function () {
    prefs.appConfigurationWindow()
  }
}))

app.append(new nw.MenuItem({ // eslint-disable-line
  type: 'separator'
}))
app.append(new nw.MenuItem({ // eslint-disable-line
  label: mQuit,
  key: 'q',
  modifiers: 'ctrl',
  click: function () {
    require('process').exit(0)
  }
}))
menu.append(new nw.MenuItem({ // eslint-disable-line
  label: mBoard,
  submenu: app
}))

if (global.useful !== 'enable') {
  const mUseful = lang.echo('Useful')
  const useful = new nw.Menu() // eslint-disable-line

  if (platform.includes('darwin')) {
    useful.append(new nw.MenuItem({ // eslint-disable-line
      label: mCoinGecko,
      click: function () {
        gui.Window.open('https://www.coingecko.com', {
          position: 'center',
          width: 800,
          height: 600
        })
      }
    }))
    useful.append(new nw.MenuItem({ // eslint-disable-line
      label: mCoinMarketCap,
      click: function () {
        gui.Window.open('https://coinmarketcap.com', {
          position: 'center',
          width: 800,
          height: 600
        })
      }
    }))
    useful.append(new nw.MenuItem({ // eslint-disable-line
      label: mEtherscan,
      click: function () {
        gui.Window.open('https://etherscan.io/tokens', {
          position: 'center',
          width: 800,
          height: 600
        })
      }
    }))
    useful.append(new nw.MenuItem({ // eslint-disable-line
      label: mTradingview,
      click: function () {
        gui.Window.open('https://www.tradingview.com/markets/cryptocurrencies/prices-all/', {
          position: 'center',
          width: 800,
          height: 600
        })
      }
    }))
    useful.append(new nw.MenuItem({ // eslint-disable-line
      type: 'separator'
    }))
    useful.append(new nw.MenuItem({ // eslint-disable-line
      label: mDefiPulse,
      click: function () {
        gui.Window.open('https://defipulse.com', {
          position: 'center',
          width: 800,
          height: 600
        })
      }
    }))
    useful.append(new nw.MenuItem({ // eslint-disable-line
      label: mUniswap,
      click: function () {
        gui.Window.open('https://app.uniswap.org/', {
          position: 'center',
          width: 800,
          height: 600
        })
      }
    }))
    useful.append(new nw.MenuItem({ // eslint-disable-line
      type: 'separator'
    }))
    useful.append(new nw.MenuItem({ // eslint-disable-line
      label: mForgingblock,
      click: function () {
        gui.Window.open('https://forgingblock.io', {
          position: 'center',
          width: 800,
          height: 600
        })
      }
    }))
  } else {
    useful.append(new nw.MenuItem({ // eslint-disable-line
      label: mCoinGecko,
      click: function () {
        gui.Shell.openExternal('https://www.coingecko.com')
      }
    }))
    useful.append(new nw.MenuItem({ // eslint-disable-line
      label: mCoinMarketCap,
      click: function () {
        gui.Shell.openExternal('https://coinmarketcap.com')
      }
    }))
    useful.append(new nw.MenuItem({ // eslint-disable-line
      label: mEtherscan,
      click: function () {
        gui.Shell.openExternal('https://etherscan.io/tokens')
      }
    }))
    useful.append(new nw.MenuItem({ // eslint-disable-line
      label: mTradingview,
      click: function () {
        gui.Shell.openExternal('https://www.tradingview.com/markets/cryptocurrencies/prices-all/')
      }
    }))
    useful.append(new nw.MenuItem({ // eslint-disable-line
      type: 'separator'
    }))
    useful.append(new nw.MenuItem({ // eslint-disable-line
      label: mDefiPulse,
      click: function () {
        gui.Shell.openExternal('https://defipulse.com')
      }
    }))
    useful.append(new nw.MenuItem({ // eslint-disable-line
      label: mUniswap,
      click: function () {
        gui.Shell.openExternal('https://app.uniswap.org')
      }
    }))
    useful.append(new nw.MenuItem({ // eslint-disable-line
      type: 'separator'
    }))
    useful.append(new nw.MenuItem({ // eslint-disable-line
      label: mForgingblock,
      click: function () {
        gui.Shell.openExternal('https://forgingblock.io')
      }
    }))
  }
  menu.append(new nw.MenuItem({ // eslint-disable-line
    label: mUseful,
    submenu: useful
  }))
}

const settingsA = new nw.Menu() // eslint-disable-line
settingsA.append(new nw.MenuItem({ // eslint-disable-line
  label: mEng,
  click: function () {
    lang.changeLanguage('en')
  }
}))
settingsA.append(new nw.MenuItem({ // eslint-disable-line
  label: mRus,
  click: function () {
    lang.changeLanguage('ru')
  }
}))
settingsA.append(new nw.MenuItem({ // eslint-disable-line
  type: 'separator'
}))
// settingsA.append(new nw.MenuItem({ // eslint-disable-line
//  label: mStyles,
//  click: function () {
//    gui.Shell.openExternal(global.stylesFileLocal)
// }
// }))
settingsA.append(new nw.MenuItem({ // eslint-disable-line
  label: mAdvanced,
  click: function () {
    prefs.appConfigurationWindowAdvanced()
  }
}))
menu.append(new nw.MenuItem({ // eslint-disable-line
  label: mSettings,
  submenu: settingsA
}))

const help = new nw.Menu() // eslint-disable-line

if (platform.includes('darwin')) {
  help.append(new nw.MenuItem({ // eslint-disable-line
    label: mlicenseStatus,
    click: function () {
      prefs.appLicenseWindow()
    }
  }))
  help.append(new nw.MenuItem({ // eslint-disable-line
    type: 'separator'
  }))
  help.append(new nw.MenuItem({ // eslint-disable-line
    label: mReddit,
    click: function () {
      gui.Window.open('https://www.reddit.com/r/bitcoin_monitor_app/', {
        position: 'center',
        width: 800,
        height: 600
      })
    }
  }))
  help.append(new nw.MenuItem({ // eslint-disable-line
    label: mTelegram,
    click: function () {
      gui.Window.open('https://t.me/bitcoin_monitor_app', {
        position: 'center',
        width: 800,
        height: 600
      })
    }
  }))
  help.append(new nw.MenuItem({ // eslint-disable-line
    label: mDiscord,
    click: function () {
      gui.Window.open('https://discord.gg/GM3eaJPnzK', {
        position: 'center',
        width: 800,
        height: 600
      })
    }
  }))
  help.append(new nw.MenuItem({ // eslint-disable-line
    label: mContact,
    click: function () {
      gui.Window.open('TODO', {
        position: 'center',
        width: 800,
        height: 600
      })
    }
  }))
  help.append(new nw.MenuItem({ // eslint-disable-line
    type: 'separator'
  }))
  help.append(new nw.MenuItem({ // eslint-disable-line
    label: mOfficial,
    click: function () {
      gui.Window.open('TODO', {
        position: 'center',
        width: 800,
        height: 600
      })
    }
  }))
} else {
  help.append(new nw.MenuItem({ // eslint-disable-line
    label: mlicenseStatus,
    click: function () {
      prefs.appLicenseWindow()
    }
  }))
  help.append(new nw.MenuItem({ // eslint-disable-line
    type: 'separator'
  }))
  help.append(new nw.MenuItem({ // eslint-disable-line
    label: mReddit,
    click: function () {
      gui.Shell.openExternal('https://www.reddit.com/r/bitcoin_monitor_app/')
    }
  }))
  help.append(new nw.MenuItem({ // eslint-disable-line
    label: mTelegram,
    click: function () {
      gui.Shell.openExternal('https://t.me/bitcoin_monitor_app')
    }
  }))
  help.append(new nw.MenuItem({ // eslint-disable-line
    label: mDiscord,
    click: function () {
      gui.Shell.openExternal('https://discord.gg/GM3eaJPnzK')
    }
  }))
  help.append(new nw.MenuItem({ // eslint-disable-line
    label: mContact,
    click: function () {
      gui.Shell.openExternal('TODO')
    }
  }))
  help.append(new nw.MenuItem({ // eslint-disable-line
    type: 'separator'
  }))
  help.append(new nw.MenuItem({ // eslint-disable-line
    label: mOfficial,
    click: function () {
      gui.Shell.openExternal('TODO')
    }
  }))
}
menu.append(new nw.MenuItem({ // eslint-disable-line
  label: mHelp,
  submenu: help
}))

nw.Window.get().menu = menu // eslint-disable-line

global.btcMonitorWidget = nw.Window.get() // eslint-disable-line
if (process.env.TRAY >= 1) {
} else {
  process.env.TRAY = 1
  var tray = new nw.Tray({ title: 'Tray', icon: path.normalize('./assets/logo.png') }) // eslint-disable-line
  var trayMenu = new nw.Menu() // eslint-disable-line
  if (platform.includes('linux')) {
    trayMenu.append(new nw.MenuItem({ // eslint-disable-line
      label: mMinimize,
      click: function () {
        if (global.mainWindow.cWindow.state === 'minimized') {
          global.btcMonitorWidget.restore()
        } else {
          global.btcMonitorWidget.minimize()
        }
      }
    }))
    trayMenu.append(new nw.MenuItem({ // eslint-disable-line
      label: mMaximize,
      click: function () {
        if (global.mainWindow.cWindow.state === 'maximized') {
          global.btcMonitorWidget.restore()
        } else {
          global.btcMonitorWidget.maximize()
        }
      }
    }))
  }
  trayMenu.append(new nw.MenuItem({ // eslint-disable-line
    label: mPortfolio,
    key: 'p',
    modifiers: 'ctrl',
    click: function () {
      prefs.portfolioConfigurationWindow()
    }
  }))
  trayMenu.append(new nw.MenuItem({ // eslint-disable-line
    label: mBackgroundColor,
    key: 'b',
    modifiers: 'ctrl',
    click: function () {
      prefs.backgroundColorConfigurationWindow()
    }
  }))
  trayMenu.append(new nw.MenuItem({ // eslint-disable-line
    type: 'separator'
  }))
  trayMenu.append(new nw.MenuItem({ // eslint-disable-line
    label: mPreferences,
    key: 's',
    modifiers: 'ctrl',
    click: function () {
      prefs.appConfigurationWindow()
    }
  }))

  trayMenu.append(new nw.MenuItem({ // eslint-disable-line
    type: 'separator'
  }))
  trayMenu.append(new nw.MenuItem({ // eslint-disable-line
    label: mQuit,
    key: 'q',
    modifiers: 'ctrl',
    click: function () {
      require('process').exit(0)
    }
  }))
  tray.menu = trayMenu
}
