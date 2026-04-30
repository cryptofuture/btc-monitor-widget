'use strict'
const gui = window.require('nw.gui')
const fs = require('fs')
const path = require('path')
const os = require('os')
const platform = os.platform()
const requestClient = require('requestretry')
const { Telegraf } = require('telegraf')
const crypto = require('crypto')

const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs))
const leadingZero = (num) => `0${num}`.slice(-2)

const formatTime = (date) =>
  [date.getHours(), date.getMinutes(), date.getSeconds()]
    .map(leadingZero)
    .join(':')

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

const lang = require('../app/lang')
const tickers = require('../app/tickers')
const settings = JSON.parse(fs.readFileSync(settingsFile, 'utf-8'))
const coins = JSON.parse(fs.readFileSync(coinsFile, 'utf-8')) // eslint-disable-line
const coinsCmc = JSON.parse(fs.readFileSync(coinsFileCmc, 'utf-8')) // eslint-disable-line

function sendTelegramMessage(msg) {
  if (global.licenseRender === 'true') {
    if (settings.tgBotApiKey !== '') {
      const bot = new Telegraf(settings.tgBotApiKey)
      if (settings.tgBotChatId === '') {
        requestClient.get({
          options: global.tlsSettings,
          maxAttempts: 3,
          retryDelay: 2000,
          uri: global.corsProxy + 'https://api.telegram.org/bot' + settings.tgBotApiKey + '/getUpdates',
          json: true
        }, function (error, response, body) {
          console.error('error-telegram:', error)
          settings.tgBotChatId = body.result[0].message.chat.id
          fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
          bot.telegram.sendMessage(body.result[0].message.chat.id
            , msg.toString())
        })
      } else {
        bot.telegram.sendMessage(settings.tgBotChatId
          , msg.toString())
      }
    }
  }
}

function appDialogWindowCode(content) {
  gui.Window.open('views/appDialogCode.html', {
    focus: true,
    position: 'center',
    width: 600,
    height: 450,
    frame: false,
    title: content,
    resizable: false
  })
}

function appDialogWindowCodeCoinGecko(content) {
  gui.Window.open('views/appDialogCodeCoinGecko.html', {
    focus: true,
    position: 'center',
    width: 600,
    height: 450,
    frame: false,
    title: content,
    resizable: false
  })
}

module.exports = {
  preBackgroundColor: function () {
    global.backgroundColor = settings.background_color
  },
  preLicense: function () {
    requestClient.post({
      maxAttempts: 3,
      retryDelay: 2000,
      uri: 'https://api.btcwid.com' + '/v1/validate-license',
      form: { lang: settings.locale, license: settings.license, userid: settings.userid },
      json: true,
    }, function (error, response, body) {
      if (typeof (body.error) !== 'undefined') {
        global.licenseRender = 'false'
        global.mainWindow.reload()
      } else {
        if (body.status === true) {
          global.licenseRender = 'true'
          global.mainWindow.reload()
        }
      }
    })
  },
  preTelegram: function () {
    global.tgBotApiKey = settings.tgBotApiKey
    global.tgBotChatId = settings.tgBotChatId
  },
  preMarketCap: function () {
    global.marketCap = settings.market_cap
  },
  preBoardTicker: function () {
    global.boardOneTicker = (settings.board1_ticker).split(',')
    global.boardTwoTicker = (settings.board2_ticker).split(',')
    global.boardThreeTicker = (settings.board3_ticker).split(',')
    global.boardFourTicker = (settings.board4_ticker).split(',')
    if (global.licenseRender === 'true') {
      global.boardFiveTicker = (settings.board5_ticker).split(',')
      global.boardSixTicker = (settings.board6_ticker).split(',')
      global.boardSevenTicker = (settings.board7_ticker).split(',')
      global.boardEightTicker = (settings.board8_ticker).split(',')
      global.boardNineTicker = (settings.board9_ticker).split(',')
      global.boardTenTicker = (settings.board10_ticker).split(',')
      global.boardElevenTicker = (settings.board11_ticker).split(',')
      global.boardTwelveTicker = (settings.board12_ticker).split(',')
      global.boardThirteenTicker = (settings.board13_ticker).split(',')
      global.boardFourteenTicker = (settings.board14_ticker).split(',')
      global.boardFifteenTicker = (settings.board15_ticker).split(',')
      global.boardSixteenTicker = (settings.board16_ticker).split(',')
    }
  },
  preBoardAlarm: function () {
    global.boardOneAlarm = (settings.board1_alarm).split(',')
    global.boardTwoAlarm = (settings.board2_alarm).split(',')
    global.boardThreeAlarm = (settings.board3_alarm).split(',')
    global.boardFourAlarm = (settings.board4_alarm).split(',')
    if (global.licenseRender === 'true') {
      global.boardFiveAlarm = (settings.board5_alarm).split(',')
      global.boardSixAlarm = (settings.board6_alarm).split(',')
      global.boardSevenAlarm = (settings.board7_alarm).split(',')
      global.boardEightAlarm = (settings.board8_alarm).split(',')
      global.boardNineAlarm = (settings.board9_alarm).split(',')
      global.boardTenAlarm = (settings.board10_alarm).split(',')
      global.boardElevenAlarm = (settings.board11_alarm).split(',')
      global.boardTwelveAlarm = (settings.board12_alarm).split(',')
      global.boardThirteenAlarm = (settings.board13_alarm).split(',')
      global.boardFourteenAlarm = (settings.board14_alarm).split(',')
      global.boardFifteenAlarm = (settings.board15_alarm).split(',')
      global.boardSixteenAlarm = (settings.board16_alarm).split(',')
    }
  },
  preBoardColor: function () {
    global.boardOneColor = settings.board1_color
    global.boardTwoColor = settings.board2_color
    global.boardThreeColor = settings.board3_color
    global.boardFourColor = settings.board4_color
    if (global.licenseRender === 'true') {
      global.boardFiveColor = settings.board5_color
      global.boardSixColor = settings.board6_color
      global.boardSevenColor = settings.board7_color
      global.boardEightColor = settings.board8_color
      global.boardNineColor = settings.board9_color
      global.boardTenColor = settings.board10_color
      global.boardElevenColor = settings.board11_color
      global.boardTwelveColor = settings.board12_color
      global.boardThirteenColor = settings.board13_color
      global.boardFourteenColor = settings.board14_color
      global.boardFifteenColor = settings.board15_color
      global.boardSixteenColor = settings.board16_color
    }
  },
  preAssets: function () {
    global.asset1 = (settings.asset1).split(',')
    global.asset2 = (settings.asset2).split(',')
    global.asset3 = (settings.asset3).split(',')
    global.asset4 = (settings.asset4).split(',')
    global.asset5 = (settings.asset5).split(',')
    global.asset6 = (settings.asset6).split(',')
    global.asset7 = (settings.asset7).split(',')
    global.asset8 = (settings.asset8).split(',')
    global.asset9 = (settings.asset9).split(',')
    global.asset10 = (settings.asset10).split(',')
    global.asset11 = (settings.asset11).split(',')
    global.asset12 = (settings.asset12).split(',')
    global.asset13 = (settings.asset13).split(',')
    global.asset14 = (settings.asset14).split(',')
    global.asset15 = (settings.asset15).split(',')
    global.asset16 = (settings.asset16).split(',')
    global.asset17 = (settings.asset17).split(',')
    global.asset18 = (settings.asset18).split(',')
    global.asset19 = (settings.asset19).split(',')
    global.asset20 = (settings.asset20).split(',')
    global.asset21 = (settings.asset21).split(',')
    global.asset22 = (settings.asset22).split(',')
    global.asset23 = (settings.asset23).split(',')
    global.asset24 = (settings.asset24).split(',')
    global.asset25 = (settings.asset25).split(',')
    global.asset26 = (settings.asset26).split(',')
    global.asset27 = (settings.asset27).split(',')
    global.asset28 = (settings.asset28).split(',')
    global.asset29 = (settings.asset29).split(',')
    global.asset30 = (settings.asset30).split(',')
    global.asset31 = (settings.asset31).split(',')
    global.asset32 = (settings.asset32).split(',')
    global.asset33 = (settings.asset33).split(',')
    global.asset34 = (settings.asset34).split(',')
    global.asset35 = (settings.asset35).split(',')
    global.asset36 = (settings.asset36).split(',')
    global.asset37 = (settings.asset37).split(',')
    global.asset38 = (settings.asset38).split(',')
    global.asset39 = (settings.asset39).split(',')
    global.asset40 = (settings.asset40).split(',')
    global.asset41 = (settings.asset41).split(',')
    global.asset42 = (settings.asset42).split(',')
    global.asset43 = (settings.asset43).split(',')
    global.asset44 = (settings.asset44).split(',')
    global.asset45 = (settings.asset45).split(',')
    global.asset46 = (settings.asset46).split(',')
    global.asset47 = (settings.asset47).split(',')
    global.asset48 = (settings.asset48).split(',')
    global.asset49 = (settings.asset49).split(',')
    global.asset50 = (settings.asset50).split(',')
  },
  setBoardTicker: function () {
    var board1 = global.mainWindow.window.document.getElementById('board1')
    var board2 = global.mainWindow.window.document.getElementById('board2')
    var board3 = global.mainWindow.window.document.getElementById('board3')
    var board4 = global.mainWindow.window.document.getElementById('board4')
    var board5 = global.mainWindow.window.document.getElementById('board5')
    var board6 = global.mainWindow.window.document.getElementById('board6')
    var board7 = global.mainWindow.window.document.getElementById('board7')
    var board8 = global.mainWindow.window.document.getElementById('board8')
    var board9 = global.mainWindow.window.document.getElementById('board9')
    var board10 = global.mainWindow.window.document.getElementById('board10')
    var board11 = global.mainWindow.window.document.getElementById('board11')
    var board12 = global.mainWindow.window.document.getElementById('board12')
    var board13 = global.mainWindow.window.document.getElementById('board13')
    var board14 = global.mainWindow.window.document.getElementById('board14')
    var board15 = global.mainWindow.window.document.getElementById('board15')
    var board16 = global.mainWindow.window.document.getElementById('board16')
    var up1 = global.mainWindow.window.document.getElementById('up1')
    var up2 = global.mainWindow.window.document.getElementById('up2')
    var up3 = global.mainWindow.window.document.getElementById('up3')
    var up4 = global.mainWindow.window.document.getElementById('up4')
    var up5 = global.mainWindow.window.document.getElementById('up5')
    var up6 = global.mainWindow.window.document.getElementById('up6')
    var up7 = global.mainWindow.window.document.getElementById('up7')
    var up8 = global.mainWindow.window.document.getElementById('up8')
    var up9 = global.mainWindow.window.document.getElementById('up9')
    var up10 = global.mainWindow.window.document.getElementById('up10')
    var up11 = global.mainWindow.window.document.getElementById('up11')
    var up12 = global.mainWindow.window.document.getElementById('up12')
    var up13 = global.mainWindow.window.document.getElementById('up13')
    var up14 = global.mainWindow.window.document.getElementById('up14')
    var up15 = global.mainWindow.window.document.getElementById('up15')
    var up16 = global.mainWindow.window.document.getElementById('up16')
    if (global.boardOneTicker[2] === 'Binance') {
      clearInterval(window.boardHandle1)
      tickers.binanceTickerDisplay(global.boardOneTicker[0], global.boardOneTicker[1], board1, global.boardOneTicker[3], 'production')
      window.boardHandle1 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up1.innerHTML = time
        tickers.binanceTickerDisplay(global.boardOneTicker[0], global.boardOneTicker[1], board1, global.boardOneTicker[3], 'production')
      }, 25000)
    }
    if (global.boardOneTicker[2] === 'Gemini') {
      clearInterval(window.boardHandle1)
      tickers.geminiTickerDisplay(global.boardOneTicker[0], global.boardOneTicker[1], board1, global.boardOneTicker[3], 'production')
      window.boardHandle1 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up1.innerHTML = time
        tickers.geminiTickerDisplay(global.boardOneTicker[0], global.boardOneTicker[1], board1, global.boardOneTicker[3], 'production')
      }, 25000)
    }
    if (global.boardOneTicker[2] === 'OKEx') {
      clearInterval(window.boardHandle1)
      tickers.okexTickerDisplay(global.boardOneTicker[0], global.boardOneTicker[1], board1, global.boardOneTicker[3], 'production')
      window.boardHandle1 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up1.innerHTML = time
        tickers.okexTickerDisplay(global.boardOneTicker[0], global.boardOneTicker[1], board1, global.boardOneTicker[3], 'production')
      }, 25000)
    }
    if (global.boardOneTicker[2] === 'Binance Futures') {
      clearInterval(window.boardHandle1)
      tickers.binanceFuturesTickerDisplay(global.boardOneTicker[0], global.boardOneTicker[1], board1, global.boardOneTicker[3], 'production')
      window.boardHandle1 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up1.innerHTML = time
        tickers.binanceFuturesTickerDisplay(global.boardOneTicker[0], global.boardOneTicker[1], board1, global.boardOneTicker[3], 'production')
      }, 25000)
    }
    if (global.boardOneTicker[2] === 'KuCoin') {
      clearInterval(window.boardHandle1)
      tickers.kucoinTickerDisplay(global.boardOneTicker[0], global.boardOneTicker[1], board1, global.boardOneTicker[3], 'production')
      window.boardHandle1 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up1.innerHTML = time
        tickers.kucoinTickerDisplay(global.boardOneTicker[0], global.boardOneTicker[1], board1, global.boardOneTicker[3], 'production')
      }, 25000)
    }
    if (global.boardOneTicker[2] === 'Poloniex') {
      clearInterval(window.boardHandle1)
      tickers.poloniexTickerDisplay(global.boardOneTicker[0], global.boardOneTicker[1], board1, global.boardOneTicker[3], 'production')
      window.boardHandle1 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up1.innerHTML = time
        tickers.poloniexTickerDisplay(global.boardOneTicker[0], global.boardOneTicker[1], board1, global.boardOneTicker[3], 'production')
      }, 25000)
    }
    if (global.boardOneTicker[2] === 'BTC Markets') {
      clearInterval(window.boardHandle1)
      tickers.btcMarketsTickerDisplay(global.boardOneTicker[0], global.boardOneTicker[1], board1, global.boardOneTicker[3], 'production')
      window.boardHandle1 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up1.innerHTML = time
        tickers.btcMarketsTickerDisplay(global.boardOneTicker[0], global.boardOneTicker[1], board1, global.boardOneTicker[3], 'production')
      }, 25000)
    }
    if (global.boardOneTicker[2] === 'BitMEX') {
      clearInterval(window.boardHandle1)
      tickers.bitmexTickerDisplay(global.boardOneTicker[0], global.boardOneTicker[1], board1, global.boardOneTicker[3], 'production')
      window.boardHandle1 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up1.innerHTML = time
        tickers.bitmexTickerDisplay(global.boardOneTicker[0], global.boardOneTicker[1], board1, global.boardOneTicker[3], 'production')
      }, 25000)
    }
    if (global.boardOneTicker[2] === 'BitPay') {
      clearInterval(window.boardHandle1)
      tickers.bitpayTickerDisplay(global.boardOneTicker[0], global.boardOneTicker[1], board1, global.boardOneTicker[3], 'production')
      window.boardHandle1 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up1.innerHTML = time
        tickers.bitpayTickerDisplay(global.boardOneTicker[0], global.boardOneTicker[1], board1, global.boardOneTicker[3], 'production')
      }, 25000)
    }
    if (global.boardOneTicker[2] === 'Bitfinex') {
      clearInterval(window.boardHandle1)
      tickers.bitfinexTickerDisplay(global.boardOneTicker[0], global.boardOneTicker[1], board1, global.boardOneTicker[3], 'production')
      window.boardHandle1 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up1.innerHTML = time
        tickers.bitfinexTickerDisplay(global.boardOneTicker[0], global.boardOneTicker[1], board1, global.boardOneTicker[3], 'production')
      }, 25000)
    }
    if (global.boardOneTicker[2] === 'Bitso') {
      clearInterval(window.boardHandle1)
      tickers.bitsoTickerDisplay(global.boardOneTicker[0], global.boardOneTicker[1], board1, global.boardOneTicker[3], 'production')
      window.boardHandle1 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up1.innerHTML = time
        tickers.bitsoTickerDisplay(global.boardOneTicker[0], global.boardOneTicker[1], board1, global.boardOneTicker[3], 'production')
      }, 25000)
    }
    if (global.boardOneTicker[2] === 'Bitstamp') {
      clearInterval(window.boardHandle1)
      tickers.bitstampTickerDisplay(global.boardOneTicker[0], global.boardOneTicker[1], board1, global.boardOneTicker[3], 'production')
      window.boardHandle1 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up1.innerHTML = time
        tickers.bitstampTickerDisplay(global.boardOneTicker[0], global.boardOneTicker[1], board1, global.boardOneTicker[3], 'production')
      }, 25000)
    }
    if (global.boardOneTicker[2] === 'CEX.IO') {
      clearInterval(window.boardHandle1)
      tickers.cextradeTickerDisplay(global.boardOneTicker[0], global.boardOneTicker[1], board1, global.boardOneTicker[3], 'production')
      window.boardHandle1 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up1.innerHTML = time
        tickers.cextradeTickerDisplay(global.boardOneTicker[0], global.boardOneTicker[1], board1, global.boardOneTicker[3], 'production')
      }, 25000)
    }
    if (global.boardOneTicker[2] === 'CoinGecko') {
      clearInterval(window.boardHandle1)
      tickers.coingeckoTickerDisplay(global.boardOneTicker[0], global.boardOneTicker[1], board1, global.boardOneTicker[3], 'production')
      window.boardHandle1 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up1.innerHTML = time
        tickers.coingeckoTickerDisplay(global.boardOneTicker[0], global.boardOneTicker[1], board1, global.boardOneTicker[3], 'production')
      }, 25000)
    }
    if (global.boardOneTicker[2] === 'Coinbase') {
      clearInterval(window.boardHandle1)
      tickers.coinbaseTickerDisplay(global.boardOneTicker[0], global.boardOneTicker[1], board1, global.boardOneTicker[3], 'production')
      window.boardHandle1 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up1.innerHTML = time
        tickers.coinbaseTickerDisplay(global.boardOneTicker[0], global.boardOneTicker[1], board1, global.boardOneTicker[3], 'production')
      }, 25000)
    }
    if (global.boardOneTicker[2] === 'CryptoCompare') {
      clearInterval(window.boardHandle1)
      tickers.cryptoCompareTickerDisplay(global.boardOneTicker[0], global.boardOneTicker[1], board1, global.boardOneTicker[3], 'production')
      window.boardHandle1 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up1.innerHTML = time
        tickers.cryptoCompareTickerDisplay(global.boardOneTicker[0], global.boardOneTicker[1], board1, global.boardOneTicker[3], 'production')
      }, 25000)
    }
    if (global.boardOneTicker[2] === 'FTX') {
      clearInterval(window.boardHandle1)
      tickers.ftxTickerDisplay(global.boardOneTicker[0], global.boardOneTicker[1], board1, global.boardOneTicker[3], 'production')
      window.boardHandle1 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up1.innerHTML = time
        tickers.ftxTickerDisplay(global.boardOneTicker[0], global.boardOneTicker[1], board1, global.boardOneTicker[3], 'production')
      }, 25000)
    }
    if (global.boardOneTicker[2] === 'HitBTC') {
      clearInterval(window.boardHandle1)
      tickers.hitBtcTickerDisplay(global.boardOneTicker[0], global.boardOneTicker[1], board1, global.boardOneTicker[3], 'production')
      window.boardHandle1 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up1.innerHTML = time
        tickers.hitBtcTickerDisplay(global.boardOneTicker[0], global.boardOneTicker[1], board1, global.boardOneTicker[3], 'production')
      }, 25000)
    }
    if (global.boardOneTicker[2] === 'Huobi') {
      clearInterval(window.boardHandle1)
      tickers.huobiBtcTickerDisplay(global.boardOneTicker[0], global.boardOneTicker[1], board1, global.boardOneTicker[3], 'production')
      window.boardHandle1 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up1.innerHTML = time
        tickers.huobiBtcTickerDisplay(global.boardOneTicker[0], global.boardOneTicker[1], board1, global.boardOneTicker[3], 'production')
      }, 25000)
    }
    if (global.boardOneTicker[2] === 'Kraken') {
      clearInterval(window.boardHandle1)
      tickers.krakenTickerDisplay(global.boardOneTicker[0], global.boardOneTicker[1], board1, global.boardOneTicker[3], 'production')
      window.boardHandle1 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up1.innerHTML = time
        tickers.krakenTickerDisplay(global.boardOneTicker[0], global.boardOneTicker[1], board1, global.boardOneTicker[3], 'production')
      }, 25000)
    }
    if (global.boardOneTicker[2] === 'Paymium') {
      clearInterval(window.boardHandle1)
      tickers.paymiumTickerDisplay(global.boardOneTicker[0], board1, global.boardOneTicker[0], 'production')
      window.boardHandle1 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up1.innerHTML = time
        tickers.paymiumTickerDisplay(global.boardOneTicker[0], board1, global.boardOneTicker[0], 'production')
      }, 25000)
    }
    if (global.boardOneTicker[2] === 'TDAX') {
      clearInterval(window.boardHandle1)
      tickers.tdaxTickerDisplay(global.boardOneTicker[0], global.boardOneTicker[1], board1, global.boardOneTicker[3], 'production')
      window.boardHandle1 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up1.innerHTML = time
        tickers.tdaxTickerDisplay(global.boardOneTicker[0], global.boardOneTicker[1], board1, global.boardOneTicker[3], 'production')
      }, 25000)
    }
    if (global.boardOneTicker[2] === 'VCC Exchange') {
      clearInterval(window.boardHandle1)
      tickers.vccTickerDisplay(global.boardOneTicker[0], global.boardOneTicker[1], board1, global.boardOneTicker[3], 'production')
      window.boardHandle1 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up1.innerHTML = time
        tickers.vccTickerDisplay(global.boardOneTicker[0], global.boardOneTicker[1], board1, global.boardOneTicker[3], 'production')
      }, 25000)
    }
    if (global.boardTwoTicker[2] === 'Binance') {
      clearInterval(window.boardHandle2)
      tickers.binanceTickerDisplay(global.boardTwoTicker[0], global.boardTwoTicker[1], board2, global.boardTwoTicker[3], 'production')
      window.boardHandle2 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up2.innerHTML = time
        tickers.binanceTickerDisplay(global.boardTwoTicker[0], global.boardTwoTicker[1], board2, global.boardTwoTicker[3], 'production')
      }, 25000)
    }
    if (global.boardTwoTicker[2] === 'Gemini') {
      clearInterval(window.boardHandle2)
      tickers.geminiTickerDisplay(global.boardTwoTicker[0], global.boardTwoTicker[1], board2, global.boardTwoTicker[3], 'production')
      window.boardHandle2 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up2.innerHTML = time
        tickers.geminiTickerDisplay(global.boardTwoTicker[0], global.boardTwoTicker[1], board2, global.boardTwoTicker[3], 'production')
      }, 25000)
    }
    if (global.boardTwoTicker[2] === 'OKEx') {
      clearInterval(window.boardHandle2)
      tickers.okexTickerDisplay(global.boardTwoTicker[0], global.boardTwoTicker[1], board2, global.boardTwoTicker[3], 'production')
      window.boardHandle2 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up2.innerHTML = time
        tickers.okexTickerDisplay(global.boardTwoTicker[0], global.boardTwoTicker[1], board2, global.boardTwoTicker[3], 'production')
      }, 25000)
    }
    if (global.boardTwoTicker[2] === 'Binance Futures') {
      clearInterval(window.boardHandle2)
      tickers.binanceFuturesTickerDisplay(global.boardTwoTicker[0], global.boardTwoTicker[1], board2, global.boardTwoTicker[3], 'production')
      window.boardHandle2 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up2.innerHTML = time
        tickers.binanceFuturesTickerDisplay(global.boardTwoTicker[0], global.boardTwoTicker[1], board2, global.boardTwoTicker[3], 'production')
      }, 25000)
    }
    if (global.boardTwoTicker[2] === 'KuCoin') {
      clearInterval(window.boardHandle2)
      tickers.kucoinTickerDisplay(global.boardTwoTicker[0], global.boardTwoTicker[1], board2, global.boardTwoTicker[3], 'production')
      window.boardHandle2 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up2.innerHTML = time
        tickers.kucoinTickerDisplay(global.boardTwoTicker[0], global.boardTwoTicker[1], board2, global.boardTwoTicker[3], 'production')
      }, 25000)
    }
    if (global.boardTwoTicker[2] === 'Poloniex') {
      clearInterval(window.boardHandle2)
      tickers.poloniexTickerDisplay(global.boardTwoTicker[0], global.boardTwoTicker[1], board2, global.boardTwoTicker[3], 'production')
      window.boardHandle2 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up2.innerHTML = time
        tickers.poloniexTickerDisplay(global.boardTwoTicker[0], global.boardTwoTicker[1], board2, global.boardTwoTicker[3], 'production')
      }, 25000)
    }
    if (global.boardTwoTicker[2] === 'BTC Markets') {
      clearInterval(window.boardHandle2)
      tickers.btcMarketsTickerDisplay(global.boardTwoTicker[0], global.boardTwoTicker[1], board2, global.boardTwoTicker[3], 'production')
      window.boardHandle2 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up2.innerHTML = time
        tickers.btcMarketsTickerDisplay(global.boardTwoTicker[0], global.boardTwoTicker[1], board2, global.boardTwoTicker[3], 'production')
      }, 25000)
    }
    if (global.boardTwoTicker[2] === 'BitMEX') {
      clearInterval(window.boardHandle2)
      tickers.bitmexTickerDisplay(global.boardTwoTicker[0], global.boardTwoTicker[1], board2, global.boardTwoTicker[3], 'production')
      window.boardHandle2 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up2.innerHTML = time
        tickers.bitmexTickerDisplay(global.boardTwoTicker[0], global.boardTwoTicker[1], board2, global.boardTwoTicker[3], 'production')
      }, 25000)
    }
    if (global.boardTwoTicker[2] === 'BitPay') {
      clearInterval(window.boardHandle2)
      tickers.bitpayTickerDisplay(global.boardTwoTicker[0], global.boardTwoTicker[1], board2, global.boardTwoTicker[3], 'production')
      window.boardHandle2 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up2.innerHTML = time
        tickers.bitpayTickerDisplay(global.boardTwoTicker[0], global.boardTwoTicker[1], board2, global.boardTwoTicker[3], 'production')
      }, 25000)
    }
    if (global.boardTwoTicker[2] === 'Bitfinex') {
      clearInterval(window.boardHandle2)
      tickers.bitfinexTickerDisplay(global.boardTwoTicker[0], global.boardTwoTicker[1], board2, global.boardTwoTicker[3], 'production')
      window.boardHandle2 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up2.innerHTML = time
        tickers.bitfinexTickerDisplay(global.boardTwoTicker[0], global.boardTwoTicker[1], board2, global.boardTwoTicker[3], 'production')
      }, 25000)
    }
    if (global.boardTwoTicker[2] === 'Bitso') {
      clearInterval(window.boardHandle2)
      tickers.bitsoTickerDisplay(global.boardTwoTicker[0], global.boardTwoTicker[1], board2, global.boardTwoTicker[3], 'production')
      window.boardHandle2 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up2.innerHTML = time
        tickers.bitsoTickerDisplay(global.boardTwoTicker[0], global.boardTwoTicker[1], board2, global.boardTwoTicker[3], 'production')
      }, 25000)
    }
    if (global.boardTwoTicker[2] === 'Bitstamp') {
      clearInterval(window.boardHandle2)
      tickers.bitstampTickerDisplay(global.boardTwoTicker[0], global.boardTwoTicker[1], board2, global.boardTwoTicker[3], 'production')
      window.boardHandle2 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up2.innerHTML = time
        tickers.bitstampTickerDisplay(global.boardTwoTicker[0], global.boardTwoTicker[1], board2, global.boardTwoTicker[3], 'production')
      }, 25000)
    }
    if (global.boardTwoTicker[2] === 'CEX.IO') {
      clearInterval(window.boardHandle2)
      tickers.cextradeTickerDisplay(global.boardTwoTicker[0], global.boardTwoTicker[1], board2, global.boardTwoTicker[3], 'production')
      window.boardHandle2 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up2.innerHTML = time
        tickers.cextradeTickerDisplay(global.boardTwoTicker[0], global.boardTwoTicker[1], board2, global.boardTwoTicker[3], 'production')
      }, 25000)
    }
    if (global.boardTwoTicker[2] === 'CoinGecko') {
      clearInterval(window.boardHandle2)
      tickers.coingeckoTickerDisplay(global.boardTwoTicker[0], global.boardTwoTicker[1], board2, global.boardTwoTicker[3], 'production')
      window.boardHandle2 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up2.innerHTML = time
        tickers.coingeckoTickerDisplay(global.boardTwoTicker[0], global.boardTwoTicker[1], board2, global.boardTwoTicker[3], 'production')
      }, 25000)
    }
    if (global.boardTwoTicker[2] === 'Coinbase') {
      clearInterval(window.boardHandle2)
      tickers.coinbaseTickerDisplay(global.boardTwoTicker[0], global.boardTwoTicker[1], board2, global.boardTwoTicker[3], 'production')
      window.boardHandle2 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up2.innerHTML = time
        tickers.coinbaseTickerDisplay(global.boardTwoTicker[0], global.boardTwoTicker[1], board2, global.boardTwoTicker[3], 'production')
      }, 25000)
    }
    if (global.boardTwoTicker[2] === 'CryptoCompare') {
      clearInterval(window.boardHandle2)
      tickers.cryptoCompareTickerDisplay(global.boardTwoTicker[0], global.boardTwoTicker[1], board2, global.boardTwoTicker[3], 'production')
      window.boardHandle2 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up2.innerHTML = time
        tickers.cryptoCompareTickerDisplay(global.boardTwoTicker[0], global.boardTwoTicker[1], board2, global.boardTwoTicker[3], 'production')
      }, 25000)
    }
    if (global.boardTwoTicker[2] === 'FTX') {
      clearInterval(window.boardHandle2)
      tickers.ftxTickerDisplay(global.boardTwoTicker[0], global.boardTwoTicker[1], board2, global.boardTwoTicker[3], 'production')
      window.boardHandle2 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up2.innerHTML = time
        tickers.ftxTickerDisplay(global.boardTwoTicker[0], global.boardTwoTicker[1], board2, global.boardTwoTicker[3], 'production')
      }, 25000)
    }
    if (global.boardTwoTicker[2] === 'HitBTC') {
      clearInterval(window.boardHandle2)
      tickers.hitBtcTickerDisplay(global.boardTwoTicker[0], global.boardTwoTicker[1], board2, global.boardTwoTicker[3], 'production')
      window.boardHandle2 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up2.innerHTML = time
        tickers.hitBtcTickerDisplay(global.boardTwoTicker[0], global.boardTwoTicker[1], board2, global.boardTwoTicker[3], 'production')
      }, 25000)
    }
    if (global.boardTwoTicker[2] === 'Huobi') {
      clearInterval(window.boardHandle2)
      tickers.huobiBtcTickerDisplay(global.boardTwoTicker[0], global.boardTwoTicker[1], board2, global.boardTwoTicker[3], 'production')
      window.boardHandle2 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up2.innerHTML = time
        tickers.huobiBtcTickerDisplay(global.boardTwoTicker[0], global.boardTwoTicker[1], board2, global.boardTwoTicker[3], 'production')
      }, 25000)
    }
    if (global.boardTwoTicker[2] === 'Kraken') {
      clearInterval(window.boardHandle2)
      tickers.krakenTickerDisplay(global.boardTwoTicker[0], global.boardTwoTicker[1], board2, global.boardTwoTicker[3], 'production')
      window.boardHandle2 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up2.innerHTML = time
        tickers.krakenTickerDisplay(global.boardTwoTicker[0], global.boardTwoTicker[1], board2, global.boardTwoTicker[3], 'production')
      }, 25000)
    }
    if (global.boardTwoTicker[2] === 'Paymium') {
      clearInterval(window.boardHandle2)
      tickers.paymiumTickerDisplay(global.boardTwoTicker[0], board2, global.boardTwoTicker[0], 'production')
      window.boardHandle2 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up2.innerHTML = time
        tickers.paymiumTickerDisplay(global.boardTwoTicker[0], board2, global.boardTwoTicker[0], 'production')
      }, 25000)
    }
    if (global.boardTwoTicker[2] === 'TDAX') {
      clearInterval(window.boardHandle2)
      tickers.tdaxTickerDisplay(global.boardTwoTicker[0], global.boardTwoTicker[1], board2, global.boardTwoTicker[3], 'production')
      window.boardHandle2 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up2.innerHTML = time
        tickers.tdaxTickerDisplay(global.boardTwoTicker[0], global.boardTwoTicker[1], board2, global.boardTwoTicker[3], 'production')
      }, 25000)
    }
    if (global.boardTwoTicker[2] === 'VCC Exchange') {
      clearInterval(window.boardHandle2)
      tickers.vccTickerDisplay(global.boardTwoTicker[0], global.boardTwoTicker[1], board2, global.boardTwoTicker[3], 'production')
      window.boardHandle2 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up2.innerHTML = time
        tickers.vccTickerDisplay(global.boardTwoTicker[0], global.boardTwoTicker[1], board2, global.boardTwoTicker[3], 'production')
      }, 25000)
    }
    if (global.boardThreeTicker[2] === 'Binance') {
      clearInterval(window.boardHandle3)
      tickers.binanceTickerDisplay(global.boardThreeTicker[0], global.boardThreeTicker[1], board3, global.boardThreeTicker[3], 'production')
      window.boardHandle3 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up3.innerHTML = time
        tickers.binanceTickerDisplay(global.boardThreeTicker[0], global.boardThreeTicker[1], board3, global.boardThreeTicker[3], 'production')
      }, 25000)
    }
    if (global.boardThreeTicker[2] === 'Gemini') {
      clearInterval(window.boardHandle3)
      tickers.geminiTickerDisplay(global.boardThreeTicker[0], global.boardThreeTicker[1], board3, global.boardThreeTicker[3], 'production')
      window.boardHandle3 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up3.innerHTML = time
        tickers.geminiTickerDisplay(global.boardThreeTicker[0], global.boardThreeTicker[1], board3, global.boardThreeTicker[3], 'production')
      }, 25000)
    }
    if (global.boardThreeTicker[2] === 'OKEx') {
      clearInterval(window.boardHandle3)
      tickers.okexTickerDisplay(global.boardThreeTicker[0], global.boardThreeTicker[1], board3, global.boardThreeTicker[3], 'production')
      window.boardHandle3 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up3.innerHTML = time
        tickers.okexTickerDisplay(global.boardThreeTicker[0], global.boardThreeTicker[1], board3, global.boardThreeTicker[3], 'production')
      }, 25000)
    }
    if (global.boardThreeTicker[2] === 'Binance Futures') {
      clearInterval(window.boardHandle3)
      tickers.binanceFuturesTickerDisplay(global.boardThreeTicker[0], global.boardThreeTicker[1], board3, global.boardThreeTicker[3], 'production')
      window.boardHandle3 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up3.innerHTML = time
        tickers.binanceFuturesTickerDisplay(global.boardThreeTicker[0], global.boardThreeTicker[1], board3, global.boardThreeTicker[3], 'production')
      }, 25000)
    }
    if (global.boardThreeTicker[2] === 'KuCoin') {
      clearInterval(window.boardHandle3)
      tickers.kucoinTickerDisplay(global.boardThreeTicker[0], global.boardThreeTicker[1], board3, global.boardThreeTicker[3], 'production')
      window.boardHandle3 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up3.innerHTML = time
        tickers.kucoinTickerDisplay(global.boardThreeTicker[0], global.boardThreeTicker[1], board3, global.boardThreeTicker[3], 'production')
      }, 25000)
    }
    if (global.boardThreeTicker[2] === 'Poloniex') {
      clearInterval(window.boardHandle3)
      tickers.poloniexTickerDisplay(global.boardThreeTicker[0], global.boardThreeTicker[1], board3, global.boardThreeTicker[3], 'production')
      window.boardHandle3 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up3.innerHTML = time
        tickers.poloniexTickerDisplay(global.boardThreeTicker[0], global.boardThreeTicker[1], board3, global.boardThreeTicker[3], 'production')
      }, 25000)
    }
    if (global.boardThreeTicker[2] === 'BTC Markets') {
      clearInterval(window.boardHandle3)
      tickers.btcMarketsTickerDisplay(global.boardThreeTicker[0], global.boardThreeTicker[1], board3, global.boardThreeTicker[3], 'production')
      window.boardHandle3 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up3.innerHTML = time
        tickers.btcMarketsTickerDisplay(global.boardThreeTicker[0], global.boardThreeTicker[1], board3, global.boardThreeTicker[3], 'production')
      }, 25000)
    }
    if (global.boardThreeTicker[2] === 'BitMEX') {
      clearInterval(window.boardHandle3)
      tickers.bitmexTickerDisplay(global.boardThreeTicker[0], global.boardThreeTicker[1], board3, global.boardThreeTicker[3], 'production')
      window.boardHandle3 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up3.innerHTML = time
        tickers.bitmexTickerDisplay(global.boardThreeTicker[0], global.boardThreeTicker[1], board3, global.boardThreeTicker[3], 'production')
      }, 25000)
    }
    if (global.boardThreeTicker[2] === 'BitPay') {
      clearInterval(window.boardHandle3)
      tickers.bitpayTickerDisplay(global.boardThreeTicker[0], global.boardThreeTicker[1], board3, global.boardThreeTicker[3], 'production')
      window.boardHandle3 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up3.innerHTML = time
        tickers.bitpayTickerDisplay(global.boardThreeTicker[0], global.boardThreeTicker[1], board3, global.boardThreeTicker[3], 'production')
      }, 25000)
    }
    if (global.boardThreeTicker[2] === 'Bitfinex') {
      clearInterval(window.boardHandle3)
      tickers.bitfinexTickerDisplay(global.boardThreeTicker[0], global.boardThreeTicker[1], board3, global.boardThreeTicker[3], 'production')
      window.boardHandle3 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up3.innerHTML = time
        tickers.bitfinexTickerDisplay(global.boardThreeTicker[0], global.boardThreeTicker[1], board3, global.boardThreeTicker[3], 'production')
      }, 25000)
    }
    if (global.boardThreeTicker[2] === 'Bitso') {
      clearInterval(window.boardHandle3)
      tickers.bitsoTickerDisplay(global.boardThreeTicker[0], global.boardThreeTicker[1], board3, global.boardThreeTicker[3], 'production')
      window.boardHandle3 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up3.innerHTML = time
        tickers.bitsoTickerDisplay(global.boardThreeTicker[0], global.boardThreeTicker[1], board3, global.boardThreeTicker[3], 'production')
      }, 25000)
    }
    if (global.boardThreeTicker[2] === 'Bitstamp') {
      clearInterval(window.boardHandle3)
      tickers.bitstampTickerDisplay(global.boardThreeTicker[0], global.boardThreeTicker[1], board3, global.boardThreeTicker[3], 'production')
      window.boardHandle3 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up3.innerHTML = time
        tickers.bitstampTickerDisplay(global.boardThreeTicker[0], global.boardThreeTicker[1], board3, global.boardThreeTicker[3], 'production')
      }, 25000)
    }
    if (global.boardThreeTicker[2] === 'CEX.IO') {
      clearInterval(window.boardHandle3)
      tickers.cextradeTickerDisplay(global.boardThreeTicker[0], global.boardThreeTicker[1], board3, global.boardThreeTicker[3], 'production')
      window.boardHandle3 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up3.innerHTML = time
        tickers.cextradeTickerDisplay(global.boardThreeTicker[0], global.boardThreeTicker[1], board3, global.boardThreeTicker[3], 'production')
      }, 25000)
    }
    if (global.boardThreeTicker[2] === 'CoinGecko') {
      clearInterval(window.boardHandle3)
      tickers.coingeckoTickerDisplay(global.boardThreeTicker[0], global.boardThreeTicker[1], board3, global.boardThreeTicker[3], 'production')
      window.boardHandle3 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up3.innerHTML = time
        tickers.coingeckoTickerDisplay(global.boardThreeTicker[0], global.boardThreeTicker[1], board3, global.boardThreeTicker[3], 'production')
      }, 25000)
    }
    if (global.boardThreeTicker[2] === 'Coinbase') {
      clearInterval(window.boardHandle3)
      tickers.coinbaseTickerDisplay(global.boardThreeTicker[0], global.boardThreeTicker[1], board3, global.boardThreeTicker[3], 'production')
      window.boardHandle3 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up3.innerHTML = time
        tickers.coinbaseTickerDisplay(global.boardThreeTicker[0], global.boardThreeTicker[1], board3, global.boardThreeTicker[3], 'production')
      }, 25000)
    }
    if (global.boardThreeTicker[2] === 'CryptoCompare') {
      clearInterval(window.boardHandle3)
      tickers.cryptoCompareTickerDisplay(global.boardThreeTicker[0], global.boardThreeTicker[1], board3, global.boardThreeTicker[3], 'production')
      window.boardHandle3 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up3.innerHTML = time
        tickers.cryptoCompareTickerDisplay(global.boardThreeTicker[0], global.boardThreeTicker[1], board3, global.boardThreeTicker[3], 'production')
      }, 25000)
    }
    if (global.boardThreeTicker[2] === 'FTX') {
      clearInterval(window.boardHandle3)
      tickers.ftxTickerDisplay(global.boardThreeTicker[0], global.boardThreeTicker[1], board3, global.boardThreeTicker[3], 'production')
      window.boardHandle3 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up3.innerHTML = time
        tickers.ftxTickerDisplay(global.boardThreeTicker[0], global.boardThreeTicker[1], board3, global.boardThreeTicker[3], 'production')
      }, 25000)
    }
    if (global.boardThreeTicker[2] === 'HitBTC') {
      clearInterval(window.boardHandle3)
      tickers.hitBtcTickerDisplay(global.boardThreeTicker[0], global.boardThreeTicker[1], board3, global.boardThreeTicker[3], 'production')
      window.boardHandle3 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up3.innerHTML = time
        tickers.hitBtcTickerDisplay(global.boardThreeTicker[0], global.boardThreeTicker[1], board3, global.boardThreeTicker[3], 'production')
      }, 25000)
    }
    if (global.boardThreeTicker[2] === 'Huobi') {
      clearInterval(window.boardHandle3)
      tickers.huobiBtcTickerDisplay(global.boardThreeTicker[0], global.boardThreeTicker[1], board3, global.boardThreeTicker[3], 'production')
      window.boardHandle3 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up3.innerHTML = time
        tickers.huobiBtcTickerDisplay(global.boardThreeTicker[0], global.boardThreeTicker[1], board3, global.boardThreeTicker[3], 'production')
      }, 25000)
    }
    if (global.boardThreeTicker[2] === 'Kraken') {
      clearInterval(window.boardHandle3)
      tickers.krakenTickerDisplay(global.boardThreeTicker[0], global.boardThreeTicker[1], board3, global.boardThreeTicker[3], 'production')
      window.boardHandle3 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up3.innerHTML = time
        tickers.krakenTickerDisplay(global.boardThreeTicker[0], global.boardThreeTicker[1], board3, global.boardThreeTicker[3], 'production')
      }, 25000)
    }
    if (global.boardThreeTicker[2] === 'Paymium') {
      clearInterval(window.boardHandle3)
      tickers.paymiumTickerDisplay(global.boardThreeTicker[0], board3, global.boardThreeTicker[0], 'production')
      window.boardHandle3 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up3.innerHTML = time
        tickers.paymiumTickerDisplay(global.boardThreeTicker[0], board3, global.boardThreeTicker[0], 'production')
      }, 25000)
    }
    if (global.boardThreeTicker[2] === 'TDAX') {
      clearInterval(window.boardHandle3)
      tickers.tdaxTickerDisplay(global.boardThreeTicker[0], global.boardThreeTicker[1], board3, global.boardThreeTicker[3], 'production')
      window.boardHandle3 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up3.innerHTML = time
        tickers.tdaxTickerDisplay(global.boardThreeTicker[0], global.boardThreeTicker[1], board3, global.boardThreeTicker[3], 'production')
      }, 25000)
    }
    if (global.boardThreeTicker[2] === 'VCC Exchange') {
      clearInterval(window.boardHandle3)
      tickers.vccTickerDisplay(global.boardThreeTicker[0], global.boardThreeTicker[1], board3, global.boardThreeTicker[3], 'production')
      window.boardHandle3 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up3.innerHTML = time
        tickers.vccTickerDisplay(global.boardThreeTicker[0], global.boardThreeTicker[1], board3, global.boardThreeTicker[3], 'production')
      }, 25000)
    }
    if (global.boardFourTicker[2] === 'Binance') {
      clearInterval(window.boardHandle4)
      tickers.binanceTickerDisplay(global.boardFourTicker[0], global.boardFourTicker[1], board4, global.boardFourTicker[3], 'production')
      window.boardHandle4 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up4.innerHTML = time
        tickers.binanceTickerDisplay(global.boardFourTicker[0], global.boardFourTicker[1], board4, global.boardFourTicker[3], 'production')
      }, 25000)
    }
    if (global.boardFourTicker[2] === 'Gemini') {
      clearInterval(window.boardHandle4)
      tickers.geminiTickerDisplay(global.boardFourTicker[0], global.boardFourTicker[1], board4, global.boardFourTicker[3], 'production')
      window.boardHandle4 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up4.innerHTML = time
        tickers.geminiTickerDisplay(global.boardFourTicker[0], global.boardFourTicker[1], board4, global.boardFourTicker[3], 'production')
      }, 25000)
    }
    if (global.boardFourTicker[2] === 'OKEx') {
      clearInterval(window.boardHandle4)
      tickers.okexTickerDisplay(global.boardFourTicker[0], global.boardFourTicker[1], board4, global.boardFourTicker[3], 'production')
      window.boardHandle4 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up4.innerHTML = time
        tickers.okexTickerDisplay(global.boardFourTicker[0], global.boardFourTicker[1], board4, global.boardFourTicker[3], 'production')
      }, 25000)
    }
    if (global.boardFourTicker[2] === 'Binance Futures') {
      clearInterval(window.boardHandle4)
      tickers.binanceFuturesTickerDisplay(global.boardFourTicker[0], global.boardFourTicker[1], board4, global.boardFourTicker[3], 'production')
      window.boardHandle4 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up4.innerHTML = time
        tickers.binanceFuturesTickerDisplay(global.boardFourTicker[0], global.boardFourTicker[1], board4, global.boardFourTicker[3], 'production')
      }, 25000)
    }
    if (global.boardFourTicker[2] === 'KuCoin') {
      clearInterval(window.boardHandle4)
      tickers.kucoinTickerDisplay(global.boardFourTicker[0], global.boardFourTicker[1], board4, global.boardFourTicker[3], 'production')
      window.boardHandle4 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up4.innerHTML = time
        tickers.kucoinTickerDisplay(global.boardFourTicker[0], global.boardFourTicker[1], board4, global.boardFourTicker[3], 'production')
      }, 25000)
    }
    if (global.boardFourTicker[2] === 'Poloniex') {
      clearInterval(window.boardHandle4)
      tickers.poloniexTickerDisplay(global.boardFourTicker[0], global.boardFourTicker[1], board4, global.boardFourTicker[3], 'production')
      window.boardHandle4 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up4.innerHTML = time
        tickers.poloniexTickerDisplay(global.boardFourTicker[0], global.boardFourTicker[1], board4, global.boardFourTicker[3], 'production')
      }, 25000)
    }
    if (global.boardFourTicker[2] === 'BTC Markets') {
      clearInterval(window.boardHandle4)
      tickers.btcMarketsTickerDisplay(global.boardFourTicker[0], global.boardFourTicker[1], board4, global.boardFourTicker[3], 'production')
      window.boardHandle4 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up4.innerHTML = time
        tickers.btcMarketsTickerDisplay(global.boardFourTicker[0], global.boardFourTicker[1], board4, global.boardFourTicker[3], 'production')
      }, 25000)
    }
    if (global.boardFourTicker[2] === 'BitMEX') {
      clearInterval(window.boardHandle4)
      tickers.bitmexTickerDisplay(global.boardFourTicker[0], global.boardFourTicker[1], board4, global.boardFourTicker[3], 'production')
      window.boardHandle4 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up4.innerHTML = time
        tickers.bitmexTickerDisplay(global.boardFourTicker[0], global.boardFourTicker[1], board4, global.boardFourTicker[3], 'production')
      }, 25000)
    }
    if (global.boardFourTicker[2] === 'BitPay') {
      clearInterval(window.boardHandle4)
      tickers.bitpayTickerDisplay(global.boardFourTicker[0], global.boardFourTicker[1], board4, global.boardFourTicker[3], 'production')
      window.boardHandle4 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up4.innerHTML = time
        tickers.bitpayTickerDisplay(global.boardFourTicker[0], global.boardFourTicker[1], board4, global.boardFourTicker[3], 'production')
      }, 25000)
    }
    if (global.boardFourTicker[2] === 'Bitfinex') {
      clearInterval(window.boardHandle4)
      tickers.bitfinexTickerDisplay(global.boardFourTicker[0], global.boardFourTicker[1], board4, global.boardFourTicker[3], 'production')
      window.boardHandle4 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up4.innerHTML = time
        tickers.bitfinexTickerDisplay(global.boardFourTicker[0], global.boardFourTicker[1], board4, global.boardFourTicker[3], 'production')
      }, 25000)
    }
    if (global.boardFourTicker[2] === 'Bitso') {
      clearInterval(window.boardHandle4)
      tickers.bitsoTickerDisplay(global.boardFourTicker[0], global.boardFourTicker[1], board4, global.boardFourTicker[3], 'production')
      window.boardHandle4 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up4.innerHTML = time
        tickers.bitsoTickerDisplay(global.boardFourTicker[0], global.boardFourTicker[1], board4, global.boardFourTicker[3], 'production')
      }, 25000)
    }
    if (global.boardFourTicker[2] === 'Bitstamp') {
      clearInterval(window.boardHandle4)
      tickers.bitstampTickerDisplay(global.boardFourTicker[0], global.boardFourTicker[1], board4, global.boardFourTicker[3], 'production')
      window.boardHandle4 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up4.innerHTML = time
        tickers.bitstampTickerDisplay(global.boardFourTicker[0], global.boardFourTicker[1], board4, global.boardFourTicker[3], 'production')
      }, 25000)
    }
    if (global.boardFourTicker[2] === 'CEX.IO') {
      clearInterval(window.boardHandle4)
      tickers.cextradeTickerDisplay(global.boardFourTicker[0], global.boardFourTicker[1], board4, global.boardFourTicker[3], 'production')
      window.boardHandle4 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up4.innerHTML = time
        tickers.cextradeTickerDisplay(global.boardFourTicker[0], global.boardFourTicker[1], board4, global.boardFourTicker[3], 'production')
      }, 25000)
    }
    if (global.boardFourTicker[2] === 'CoinGecko') {
      clearInterval(window.boardHandle4)
      tickers.coingeckoTickerDisplay(global.boardFourTicker[0], global.boardFourTicker[1], board4, global.boardFourTicker[3], 'production')
      window.boardHandle4 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up4.innerHTML = time
        tickers.coingeckoTickerDisplay(global.boardFourTicker[0], global.boardFourTicker[1], board4, global.boardFourTicker[3], 'production')
      }, 25000)
    }
    if (global.boardFourTicker[2] === 'Coinbase') {
      clearInterval(window.boardHandle4)
      tickers.coinbaseTickerDisplay(global.boardFourTicker[0], global.boardFourTicker[1], board4, global.boardFourTicker[3], 'production')
      window.boardHandle4 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up4.innerHTML = time
        tickers.coinbaseTickerDisplay(global.boardFourTicker[0], global.boardFourTicker[1], board4, global.boardFourTicker[3], 'production')
      }, 25000)
    }
    if (global.boardFourTicker[2] === 'CryptoCompare') {
      clearInterval(window.boardHandle4)
      tickers.cryptoCompareTickerDisplay(global.boardFourTicker[0], global.boardFourTicker[1], board4, global.boardFourTicker[3], 'production')
      window.boardHandle4 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up4.innerHTML = time
        tickers.cryptoCompareTickerDisplay(global.boardFourTicker[0], global.boardFourTicker[1], board4, global.boardFourTicker[3], 'production')
      }, 25000)
    }
    if (global.boardFourTicker[2] === 'FTX') {
      clearInterval(window.boardHandle4)
      tickers.ftxTickerDisplay(global.boardFourTicker[0], global.boardFourTicker[1], board4, global.boardFourTicker[3], 'production')
      window.boardHandle4 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up4.innerHTML = time
        tickers.ftxTickerDisplay(global.boardFourTicker[0], global.boardFourTicker[1], board4, global.boardFourTicker[3], 'production')
      }, 25000)
    }
    if (global.boardFourTicker[2] === 'HitBTC') {
      clearInterval(window.boardHandle4)
      tickers.hitBtcTickerDisplay(global.boardFourTicker[0], global.boardFourTicker[1], board4, global.boardFourTicker[3], 'production')
      window.boardHandle4 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up4.innerHTML = time
        tickers.hitBtcTickerDisplay(global.boardFourTicker[0], global.boardFourTicker[1], board4, global.boardFourTicker[3], 'production')
      }, 25000)
    }
    if (global.boardFourTicker[2] === 'Huobi') {
      clearInterval(window.boardHandle4)
      tickers.huobiBtcTickerDisplay(global.boardFourTicker[0], global.boardFourTicker[1], board4, global.boardFourTicker[3], 'production')
      window.boardHandle4 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up4.innerHTML = time
        tickers.huobiBtcTickerDisplay(global.boardFourTicker[0], global.boardFourTicker[1], board4, global.boardFourTicker[3], 'production')
      }, 25000)
    }
    if (global.boardFourTicker[2] === 'Kraken') {
      clearInterval(window.boardHandle4)
      tickers.krakenTickerDisplay(global.boardFourTicker[0], global.boardFourTicker[1], board4, global.boardFourTicker[3], 'production')

      window.boardHandle4 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up4.innerHTML = time
        tickers.krakenTickerDisplay(global.boardFourTicker[0], global.boardFourTicker[1], board4, global.boardFourTicker[3], 'production')
      }, 25000)
    }
    if (global.boardFourTicker[2] === 'Paymium') {
      clearInterval(window.boardHandle4)
      tickers.paymiumTickerDisplay(global.boardFourTicker[0], board4, global.boardFourTicker[0], 'production')
      window.boardHandle4 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up4.innerHTML = time
        tickers.paymiumTickerDisplay(global.boardFourTicker[0], board4, global.boardFourTicker[0], 'production')
      }, 25000)
    }
    if (global.boardFourTicker[2] === 'TDAX') {
      clearInterval(window.boardHandle4)
      tickers.tdaxTickerDisplay(global.boardFourTicker[0], global.boardFourTicker[1], board4, global.boardFourTicker[3], 'production')
      window.boardHandle4 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up4.innerHTML = time
        tickers.tdaxTickerDisplay(global.boardFourTicker[0], global.boardFourTicker[1], board4, global.boardFourTicker[3], 'production')
      }, 25000)
    }
    if (global.boardFourTicker[2] === 'VCC Exchange') {
      clearInterval(window.boardHandle4)
      tickers.vccTickerDisplay(global.boardFourTicker[0], global.boardFourTicker[1], board4, global.boardFourTicker[3], 'production')
      window.boardHandle4 = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        up4.innerHTML = time
        tickers.vccTickerDisplay(global.boardFourTicker[0], global.boardFourTicker[1], board4, global.boardFourTicker[3], 'production')
      }, 25000)
    }
    if (global.licenseRender === 'true') {
      if (global.boardFiveTicker[2] === 'Binance') {
        clearInterval(window.boardHandle5)
        tickers.binanceTickerDisplay(global.boardFiveTicker[0], global.boardFiveTicker[1], board5, global.boardFiveTicker[3], 'production')
        window.boardHandle5 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up5.innerHTML = time
          tickers.binanceTickerDisplay(global.boardFiveTicker[0], global.boardFiveTicker[1], board5, global.boardFiveTicker[3], 'production')
        }, 25000)
      }
      if (global.boardFiveTicker[2] === 'Gemini') {
        clearInterval(window.boardHandle5)
        tickers.geminiTickerDisplay(global.boardFiveTicker[0], global.boardFiveTicker[1], board5, global.boardFiveTicker[3], 'production')
        window.boardHandle5 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up5.innerHTML = time
          tickers.geminiTickerDisplay(global.boardFiveTicker[0], global.boardFiveTicker[1], board5, global.boardFiveTicker[3], 'production')
        }, 25000)
      }
      if (global.boardFiveTicker[2] === 'OKEx') {
        clearInterval(window.boardHandle5)
        tickers.okexTickerDisplay(global.boardFiveTicker[0], global.boardFiveTicker[1], board5, global.boardFiveTicker[3], 'production')
        window.boardHandle5 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up5.innerHTML = time
          tickers.okexTickerDisplay(global.boardFiveTicker[0], global.boardFiveTicker[1], board5, global.boardFiveTicker[3], 'production')
        }, 25000)
      }
      if (global.boardFiveTicker[2] === 'Binance Futures') {
        clearInterval(window.boardHandle5)
        tickers.binanceFuturesTickerDisplay(global.boardFiveTicker[0], global.boardFiveTicker[1], board5, global.boardFiveTicker[3], 'production')
        window.boardHandle5 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up5.innerHTML = time
          tickers.binanceFuturesTickerDisplay(global.boardFiveTicker[0], global.boardFiveTicker[1], board5, global.boardFiveTicker[3], 'production')
        }, 25000)
      }
      if (global.boardFiveTicker[2] === 'KuCoin') {
        clearInterval(window.boardHandle5)
        tickers.kucoinTickerDisplay(global.boardFiveTicker[0], global.boardFiveTicker[1], board5, global.boardFiveTicker[3], 'production')
        window.boardHandle5 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up5.innerHTML = time
          tickers.kucoinTickerDisplay(global.boardFiveTicker[0], global.boardFiveTicker[1], board5, global.boardFiveTicker[3], 'production')
        }, 25000)
      }
      if (global.boardFiveTicker[2] === 'Poloniex') {
        clearInterval(window.boardHandle5)
        tickers.poloniexTickerDisplay(global.boardFiveTicker[0], global.boardFiveTicker[1], board5, global.boardFiveTicker[3], 'production')
        window.boardHandle5 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up5.innerHTML = time
          tickers.poloniexTickerDisplay(global.boardFiveTicker[0], global.boardFiveTicker[1], board5, global.boardFiveTicker[3], 'production')
        }, 25000)
      }
      if (global.boardFiveTicker[2] === 'BTC Markets') {
        clearInterval(window.boardHandle5)
        tickers.btcMarketsTickerDisplay(global.boardFiveTicker[0], global.boardFiveTicker[1], board5, global.boardFiveTicker[3], 'production')
        window.boardHandle5 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up5.innerHTML = time
          tickers.btcMarketsTickerDisplay(global.boardFiveTicker[0], global.boardFiveTicker[1], board5, global.boardFiveTicker[3], 'production')
        }, 25000)
      }
      if (global.boardFiveTicker[2] === 'BitMEX') {
        clearInterval(window.boardHandle5)
        tickers.bitmexTickerDisplay(global.boardFiveTicker[0], global.boardFiveTicker[1], board5, global.boardFiveTicker[3], 'production')
        window.boardHandle5 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up5.innerHTML = time
          tickers.bitmexTickerDisplay(global.boardFiveTicker[0], global.boardFiveTicker[1], board5, global.boardFiveTicker[3], 'production')
        }, 25000)
      }
      if (global.boardFiveTicker[2] === 'BitPay') {
        clearInterval(window.boardHandle5)
        tickers.bitpayTickerDisplay(global.boardFiveTicker[0], global.boardFiveTicker[1], board5, global.boardFiveTicker[3], 'production')
        window.boardHandle5 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up5.innerHTML = time
          tickers.bitpayTickerDisplay(global.boardFiveTicker[0], global.boardFiveTicker[1], board5, global.boardFiveTicker[3], 'production')
        }, 25000)
      }
      if (global.boardFiveTicker[2] === 'Bitfinex') {
        clearInterval(window.boardHandle5)
        tickers.bitfinexTickerDisplay(global.boardFiveTicker[0], global.boardFiveTicker[1], board5, global.boardFiveTicker[3], 'production')
        window.boardHandle5 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up5.innerHTML = time
          tickers.bitfinexTickerDisplay(global.boardFiveTicker[0], global.boardFiveTicker[1], board5, global.boardFiveTicker[3], 'production')
        }, 25000)
      }
      if (global.boardFiveTicker[2] === 'Bitso') {
        clearInterval(window.boardHandle5)
        tickers.bitsoTickerDisplay(global.boardFiveTicker[0], global.boardFiveTicker[1], board5, global.boardFiveTicker[3], 'production')
        window.boardHandle5 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up5.innerHTML = time
          tickers.bitsoTickerDisplay(global.boardFiveTicker[0], global.boardFiveTicker[1], board5, global.boardFiveTicker[3], 'production')
        }, 25000)
      }
      if (global.boardFiveTicker[2] === 'Bitstamp') {
        clearInterval(window.boardHandle5)
        tickers.bitstampTickerDisplay(global.boardFiveTicker[0], global.boardFiveTicker[1], board5, global.boardFiveTicker[3], 'production')
        window.boardHandle5 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up5.innerHTML = time
          tickers.bitstampTickerDisplay(global.boardFiveTicker[0], global.boardFiveTicker[1], board5, global.boardFiveTicker[3], 'production')
        }, 25000)
      }
      if (global.boardFiveTicker[2] === 'CEX.IO') {
        clearInterval(window.boardHandle5)
        tickers.cextradeTickerDisplay(global.boardFiveTicker[0], global.boardFiveTicker[1], board5, global.boardFiveTicker[3], 'production')
        window.boardHandle5 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up5.innerHTML = time
          tickers.cextradeTickerDisplay(global.boardFiveTicker[0], global.boardFiveTicker[1], board5, global.boardFiveTicker[3], 'production')
        }, 25000)
      }
      if (global.boardFiveTicker[2] === 'CoinGecko') {
        clearInterval(window.boardHandle5)
        tickers.coingeckoTickerDisplay(global.boardFiveTicker[0], global.boardFiveTicker[1], board5, global.boardFiveTicker[3], 'production')
        window.boardHandle5 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up5.innerHTML = time
          tickers.coingeckoTickerDisplay(global.boardFiveTicker[0], global.boardFiveTicker[1], board5, global.boardFiveTicker[3], 'production')
        }, 25000)
      }
      if (global.boardFiveTicker[2] === 'Coinbase') {
        clearInterval(window.boardHandle5)
        tickers.coinbaseTickerDisplay(global.boardFiveTicker[0], global.boardFiveTicker[1], board5, global.boardFiveTicker[3], 'production')
        window.boardHandle5 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up5.innerHTML = time
          tickers.coinbaseTickerDisplay(global.boardFiveTicker[0], global.boardFiveTicker[1], board5, global.boardFiveTicker[3], 'production')
        }, 25000)
      }
      if (global.boardFiveTicker[2] === 'CryptoCompare') {
        clearInterval(window.boardHandle5)
        tickers.cryptoCompareTickerDisplay(global.boardFiveTicker[0], global.boardFiveTicker[1], board5, global.boardFiveTicker[3], 'production')
        window.boardHandle5 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up5.innerHTML = time
          tickers.cryptoCompareTickerDisplay(global.boardFiveTicker[0], global.boardFiveTicker[1], board5, global.boardFiveTicker[3], 'production')
        }, 25000)
      }
      if (global.boardFiveTicker[2] === 'FTX') {
        clearInterval(window.boardHandle5)
        tickers.ftxTickerDisplay(global.boardFiveTicker[0], global.boardFiveTicker[1], board5, global.boardFiveTicker[3], 'production')
        window.boardHandle5 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up5.innerHTML = time
          tickers.ftxTickerDisplay(global.boardFiveTicker[0], global.boardFiveTicker[1], board5, global.boardFiveTicker[3], 'production')
        }, 25000)
      }
      if (global.boardFiveTicker[2] === 'HitBTC') {
        clearInterval(window.boardHandle5)
        tickers.hitBtcTickerDisplay(global.boardFiveTicker[0], global.boardFiveTicker[1], board5, global.boardFiveTicker[3], 'production')
        window.boardHandle5 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up5.innerHTML = time
          tickers.hitBtcTickerDisplay(global.boardFiveTicker[0], global.boardFiveTicker[1], board5, global.boardFiveTicker[3], 'production')
        }, 25000)
      }
      if (global.boardFiveTicker[2] === 'Huobi') {
        clearInterval(window.boardHandle5)
        tickers.huobiBtcTickerDisplay(global.boardFiveTicker[0], global.boardFiveTicker[1], board5, global.boardFiveTicker[3], 'production')
        window.boardHandle5 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up5.innerHTML = time
          tickers.huobiBtcTickerDisplay(global.boardFiveTicker[0], global.boardFiveTicker[1], board5, global.boardFiveTicker[3], 'production')
        }, 25000)
      }
      if (global.boardFiveTicker[2] === 'Kraken') {
        clearInterval(window.boardHandle5)
        tickers.krakenTickerDisplay(global.boardFiveTicker[0], global.boardFiveTicker[1], board5, global.boardFiveTicker[3], 'production')
        window.boardHandle5 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up5.innerHTML = time
          tickers.krakenTickerDisplay(global.boardFiveTicker[0], global.boardFiveTicker[1], board5, global.boardFiveTicker[3], 'production')
        }, 25000)
      }
      if (global.boardFiveTicker[2] === 'Paymium') {
        clearInterval(window.boardHandle5)
        tickers.paymiumTickerDisplay(global.boardFiveTicker[0], board5, global.boardFiveTicker[0], 'production')
        window.boardHandle5 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up5.innerHTML = time
          tickers.paymiumTickerDisplay(global.boardFiveTicker[0], board5, global.boardFiveTicker[0], 'production')
        }, 25000)
      }
      if (global.boardFiveTicker[2] === 'TDAX') {
        clearInterval(window.boardHandle5)
        tickers.tdaxTickerDisplay(global.boardFiveTicker[0], global.boardFiveTicker[1], board5, global.boardFiveTicker[3], 'production')
        window.boardHandle5 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up5.innerHTML = time
          tickers.tdaxTickerDisplay(global.boardFiveTicker[0], global.boardFiveTicker[1], board5, global.boardFiveTicker[3], 'production')
        }, 25000)
      }
      if (global.boardFiveTicker[2] === 'VCC Exchange') {
        clearInterval(window.boardHandle5)
        tickers.vccTickerDisplay(global.boardFiveTicker[0], global.boardFiveTicker[1], board5, global.boardFiveTicker[3], 'production')
        window.boardHandle5 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up5.innerHTML = time
          tickers.vccTickerDisplay(global.boardFiveTicker[0], global.boardFiveTicker[1], board5, global.boardFiveTicker[3], 'production')
        }, 25000)
      }
      if (global.boardSixTicker[2] === 'Binance') {
        clearInterval(window.boardHandle6)
        tickers.binanceTickerDisplay(global.boardSixTicker[0], global.boardSixTicker[1], board6, global.boardSixTicker[3], 'production')
        window.boardHandle6 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up6.innerHTML = time
          tickers.binanceTickerDisplay(global.boardSixTicker[0], global.boardSixTicker[1], board6, global.boardSixTicker[3], 'production')
        }, 25000)
      }
      if (global.boardSixTicker[2] === 'Gemini') {
        clearInterval(window.boardHandle6)
        tickers.geminiTickerDisplay(global.boardSixTicker[0], global.boardSixTicker[1], board6, global.boardSixTicker[3], 'production')
        window.boardHandle6 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up6.innerHTML = time
          tickers.geminiTickerDisplay(global.boardSixTicker[0], global.boardSixTicker[1], board6, global.boardSixTicker[3], 'production')
        }, 25000)
      }
      if (global.boardSixTicker[2] === 'OKEx') {
        clearInterval(window.boardHandle6)
        tickers.okexTickerDisplay(global.boardSixTicker[0], global.boardSixTicker[1], board6, global.boardSixTicker[3], 'production')
        window.boardHandle6 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up6.innerHTML = time
          tickers.okexTickerDisplay(global.boardSixTicker[0], global.boardSixTicker[1], board6, global.boardSixTicker[3], 'production')
        }, 25000)
      }
      if (global.boardSixTicker[2] === 'Binance Futures') {
        clearInterval(window.boardHandle6)
        tickers.binanceFuturesTickerDisplay(global.boardSixTicker[0], global.boardSixTicker[1], board6, global.boardSixTicker[3], 'production')
        window.boardHandle6 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up6.innerHTML = time
          tickers.binanceFuturesTickerDisplay(global.boardSixTicker[0], global.boardSixTicker[1], board6, global.boardSixTicker[3], 'production')
        }, 25000)
      }
      if (global.boardSixTicker[2] === 'KuCoin') {
        clearInterval(window.boardHandle6)
        tickers.kucoinTickerDisplay(global.boardSixTicker[0], global.boardSixTicker[1], board6, global.boardSixTicker[3], 'production')
        window.boardHandle6 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up6.innerHTML = time
          tickers.kucoinTickerDisplay(global.boardSixTicker[0], global.boardSixTicker[1], board6, global.boardSixTicker[3], 'production')
        }, 25000)
      }
      if (global.boardSixTicker[2] === 'Poloniex') {
        clearInterval(window.boardHandle6)
        tickers.poloniexTickerDisplay(global.boardSixTicker[0], global.boardSixTicker[1], board6, global.boardSixTicker[3], 'production')
        window.boardHandle6 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up6.innerHTML = time
          tickers.poloniexTickerDisplay(global.boardSixTicker[0], global.boardSixTicker[1], board6, global.boardSixTicker[3], 'production')
        }, 25000)
      }
      if (global.boardSixTicker[2] === 'BTC Markets') {
        clearInterval(window.boardHandle6)
        tickers.btcMarketsTickerDisplay(global.boardSixTicker[0], global.boardSixTicker[1], board6, global.boardSixTicker[3], 'production')
        window.boardHandle6 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up6.innerHTML = time
          tickers.btcMarketsTickerDisplay(global.boardSixTicker[0], global.boardSixTicker[1], board6, global.boardSixTicker[3], 'production')
        }, 25000)
      }
      if (global.boardSixTicker[2] === 'BitMEX') {
        clearInterval(window.boardHandle6)
        tickers.bitmexTickerDisplay(global.boardSixTicker[0], global.boardSixTicker[1], board6, global.boardSixTicker[3], 'production')
        window.boardHandle6 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up6.innerHTML = time
          tickers.bitmexTickerDisplay(global.boardSixTicker[0], global.boardSixTicker[1], board6, global.boardSixTicker[3], 'production')
        }, 25000)
      }
      if (global.boardSixTicker[2] === 'BitPay') {
        clearInterval(window.boardHandle6)
        tickers.bitpayTickerDisplay(global.boardSixTicker[0], global.boardSixTicker[1], board6, global.boardSixTicker[3], 'production')
        window.boardHandle6 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up6.innerHTML = time
          tickers.bitpayTickerDisplay(global.boardSixTicker[0], global.boardSixTicker[1], board6, global.boardSixTicker[3], 'production')
        }, 25000)
      }
      if (global.boardSixTicker[2] === 'Bitfinex') {
        clearInterval(window.boardHandle6)
        tickers.bitfinexTickerDisplay(global.boardSixTicker[0], global.boardSixTicker[1], board6, global.boardSixTicker[3], 'production')
        window.boardHandle6 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up6.innerHTML = time
          tickers.bitfinexTickerDisplay(global.boardSixTicker[0], global.boardSixTicker[1], board6, global.boardSixTicker[3], 'production')
        }, 25000)
      }
      if (global.boardSixTicker[2] === 'Bitso') {
        clearInterval(window.boardHandle6)
        tickers.bitsoTickerDisplay(global.boardSixTicker[0], global.boardSixTicker[1], board6, global.boardSixTicker[3], 'production')
        window.boardHandle6 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up6.innerHTML = time
          tickers.bitsoTickerDisplay(global.boardSixTicker[0], global.boardSixTicker[1], board6, global.boardSixTicker[3], 'production')
        }, 25000)
      }
      if (global.boardSixTicker[2] === 'Bitstamp') {
        clearInterval(window.boardHandle6)
        tickers.bitstampTickerDisplay(global.boardSixTicker[0], global.boardSixTicker[1], board6, global.boardSixTicker[3], 'production')
        window.boardHandle6 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up6.innerHTML = time
          tickers.bitstampTickerDisplay(global.boardSixTicker[0], global.boardSixTicker[1], board6, global.boardSixTicker[3], 'production')
        }, 25000)
      }
      if (global.boardSixTicker[2] === 'CEX.IO') {
        clearInterval(window.boardHandle6)
        tickers.cextradeTickerDisplay(global.boardSixTicker[0], global.boardSixTicker[1], board6, global.boardSixTicker[3], 'production')
        window.boardHandle6 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up6.innerHTML = time
          tickers.cextradeTickerDisplay(global.boardSixTicker[0], global.boardSixTicker[1], board6, global.boardSixTicker[3], 'production')
        }, 25000)
      }
      if (global.boardSixTicker[2] === 'CoinGecko') {
        clearInterval(window.boardHandle6)
        tickers.coingeckoTickerDisplay(global.boardSixTicker[0], global.boardSixTicker[1], board6, global.boardSixTicker[3], 'production')
        window.boardHandle6 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up6.innerHTML = time
          tickers.coingeckoTickerDisplay(global.boardSixTicker[0], global.boardSixTicker[1], board6, global.boardSixTicker[3], 'production')
        }, 25000)
      }
      if (global.boardSixTicker[2] === 'Coinbase') {
        clearInterval(window.boardHandle6)
        tickers.coinbaseTickerDisplay(global.boardSixTicker[0], global.boardSixTicker[1], board6, global.boardSixTicker[3], 'production')
        window.boardHandle6 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up6.innerHTML = time
          tickers.coinbaseTickerDisplay(global.boardSixTicker[0], global.boardSixTicker[1], board6, global.boardSixTicker[3], 'production')
        }, 25000)
      }
      if (global.boardSixTicker[2] === 'CryptoCompare') {
        clearInterval(window.boardHandle6)
        tickers.cryptoCompareTickerDisplay(global.boardSixTicker[0], global.boardSixTicker[1], board6, global.boardSixTicker[3], 'production')
        window.boardHandle6 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up6.innerHTML = time
          tickers.cryptoCompareTickerDisplay(global.boardSixTicker[0], global.boardSixTicker[1], board6, global.boardSixTicker[3], 'production')
        }, 25000)
      }
      if (global.boardSixTicker[2] === 'FTX') {
        clearInterval(window.boardHandle6)
        tickers.ftxTickerDisplay(global.boardSixTicker[0], global.boardSixTicker[1], board6, global.boardSixTicker[3], 'production')
        window.boardHandle6 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up6.innerHTML = time
          tickers.ftxTickerDisplay(global.boardSixTicker[0], global.boardSixTicker[1], board6, global.boardSixTicker[3], 'production')
        }, 25000)
      }
      if (global.boardSixTicker[2] === 'HitBTC') {
        clearInterval(window.boardHandle6)
        tickers.hitBtcTickerDisplay(global.boardSixTicker[0], global.boardSixTicker[1], board6, global.boardSixTicker[3], 'production')
        window.boardHandle6 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up6.innerHTML = time
          tickers.hitBtcTickerDisplay(global.boardSixTicker[0], global.boardSixTicker[1], board6, global.boardSixTicker[3], 'production')
        }, 25000)
      }
      if (global.boardSixTicker[2] === 'Huobi') {
        clearInterval(window.boardHandle6)
        tickers.huobiBtcTickerDisplay(global.boardSixTicker[0], global.boardSixTicker[1], board6, global.boardSixTicker[3], 'production')
        window.boardHandle6 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up6.innerHTML = time
          tickers.huobiBtcTickerDisplay(global.boardSixTicker[0], global.boardSixTicker[1], board6, global.boardSixTicker[3], 'production')
        }, 25000)
      }
      if (global.boardSixTicker[2] === 'Kraken') {
        clearInterval(window.boardHandle6)
        tickers.krakenTickerDisplay(global.boardSixTicker[0], global.boardSixTicker[1], board6, global.boardSixTicker[3], 'production')
        window.boardHandle6 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up6.innerHTML = time
          tickers.krakenTickerDisplay(global.boardSixTicker[0], global.boardSixTicker[1], board6, global.boardSixTicker[3], 'production')
        }, 25000)
      }
      if (global.boardSixTicker[2] === 'Paymium') {
        clearInterval(window.boardHandle6)
        tickers.paymiumTickerDisplay(global.boardSixTicker[0], board6, global.boardSixTicker[0], 'production')
        window.boardHandle6 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up6.innerHTML = time
          tickers.paymiumTickerDisplay(global.boardSixTicker[0], board6, global.boardSixTicker[0], 'production')
        }, 25000)
      }
      if (global.boardSixTicker[2] === 'TDAX') {
        clearInterval(window.boardHandle6)
        tickers.tdaxTickerDisplay(global.boardSixTicker[0], global.boardSixTicker[1], board6, global.boardSixTicker[3], 'production')
        window.boardHandle6 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up6.innerHTML = time
          tickers.tdaxTickerDisplay(global.boardSixTicker[0], global.boardSixTicker[1], board6, global.boardSixTicker[3], 'production')
        }, 25000)
      }
      if (global.boardSixTicker[2] === 'VCC Exchange') {
        clearInterval(window.boardHandle6)
        tickers.vccTickerDisplay(global.boardSixTicker[0], global.boardSixTicker[1], board6, global.boardSixTicker[3], 'production')
        window.boardHandle6 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up6.innerHTML = time
          tickers.vccTickerDisplay(global.boardSixTicker[0], global.boardSixTicker[1], board6, global.boardSixTicker[3], 'production')
        }, 25000)
      }
      if (global.boardSevenTicker[2] === 'Binance') {
        clearInterval(window.boardHandle7)
        tickers.binanceTickerDisplay(global.boardSevenTicker[0], global.boardSevenTicker[1], board7, global.boardSevenTicker[3], 'production')
        window.boardHandle7 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up7.innerHTML = time
          tickers.binanceTickerDisplay(global.boardSevenTicker[0], global.boardSevenTicker[1], board7, global.boardSevenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardSevenTicker[2] === 'Gemini') {
        clearInterval(window.boardHandle7)
        tickers.geminiTickerDisplay(global.boardSevenTicker[0], global.boardSevenTicker[1], board7, global.boardSevenTicker[3], 'production')
        window.boardHandle7 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up7.innerHTML = time
          tickers.geminiTickerDisplay(global.boardSevenTicker[0], global.boardSevenTicker[1], board7, global.boardSevenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardSevenTicker[2] === 'OKEx') {
        clearInterval(window.boardHandle7)
        tickers.okexTickerDisplay(global.boardSevenTicker[0], global.boardSevenTicker[1], board7, global.boardSevenTicker[3], 'production')
        window.boardHandle7 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up7.innerHTML = time
          tickers.okexTickerDisplay(global.boardSevenTicker[0], global.boardSevenTicker[1], board7, global.boardSevenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardSevenTicker[2] === 'Binance Futures') {
        clearInterval(window.boardHandle7)
        tickers.binanceFuturesTickerDisplay(global.boardSevenTicker[0], global.boardSevenTicker[1], board7, global.boardSevenTicker[3], 'production')
        window.boardHandle7 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up7.innerHTML = time
          tickers.binanceFuturesTickerDisplay(global.boardSevenTicker[0], global.boardSevenTicker[1], board7, global.boardSevenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardSevenTicker[2] === 'KuCoin') {
        clearInterval(window.boardHandle7)
        tickers.kucoinTickerDisplay(global.boardSevenTicker[0], global.boardSevenTicker[1], board7, global.boardSevenTicker[3], 'production')
        window.boardHandle7 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up7.innerHTML = time
          tickers.kucoinTickerDisplay(global.boardSevenTicker[0], global.boardSevenTicker[1], board7, global.boardSevenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardSevenTicker[2] === 'Poloniex') {
        clearInterval(window.boardHandle7)
        tickers.kucoinTickerDisplay(global.boardSevenTicker[0], global.boardSevenTicker[1], board7, global.boardSevenTicker[3], 'production')
        window.boardHandle7 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up7.innerHTML = time
          tickers.poloniexTickerDisplay(global.boardSevenTicker[0], global.boardSevenTicker[1], board7, global.boardSevenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardSevenTicker[2] === 'BTC Markets') {
        clearInterval(window.boardHandle7)
        tickers.btcMarketsTickerDisplay(global.boardSevenTicker[0], global.boardSevenTicker[1], board7, global.boardSevenTicker[3], 'production')
        window.boardHandle7 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up7.innerHTML = time
          tickers.btcMarketsTickerDisplay(global.boardSevenTicker[0], global.boardSevenTicker[1], board7, global.boardSevenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardSevenTicker[2] === 'BitMEX') {
        clearInterval(window.boardHandle7)
        tickers.bitmexTickerDisplay(global.boardSevenTicker[0], global.boardSevenTicker[1], board7, global.boardSevenTicker[3], 'production')
        window.boardHandle7 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up7.innerHTML = time
          tickers.bitmexTickerDisplay(global.boardSevenTicker[0], global.boardSevenTicker[1], board7, global.boardSevenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardSevenTicker[2] === 'BitPay') {
        clearInterval(window.boardHandle7)
        tickers.bitpayTickerDisplay(global.boardSevenTicker[0], global.boardSevenTicker[1], board7, global.boardSevenTicker[3], 'production')
        window.boardHandle7 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up7.innerHTML = time
          tickers.bitpayTickerDisplay(global.boardSevenTicker[0], global.boardSevenTicker[1], board7, global.boardSevenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardSevenTicker[2] === 'Bitfinex') {
        clearInterval(window.boardHandle7)
        tickers.bitfinexTickerDisplay(global.boardSevenTicker[0], global.boardSevenTicker[1], board7, global.boardSevenTicker[3], 'production')
        window.boardHandle7 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up7.innerHTML = time
          tickers.bitfinexTickerDisplay(global.boardSevenTicker[0], global.boardSevenTicker[1], board7, global.boardSevenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardSevenTicker[2] === 'Bitso') {
        clearInterval(window.boardHandle7)
        tickers.bitsoTickerDisplay(global.boardSevenTicker[0], global.boardSevenTicker[1], board7, global.boardSevenTicker[3], 'production')
        window.boardHandle7 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up7.innerHTML = time
          tickers.bitsoTickerDisplay(global.boardSevenTicker[0], global.boardSevenTicker[1], board7, global.boardSevenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardSevenTicker[2] === 'Bitstamp') {
        clearInterval(window.boardHandle7)
        tickers.bitstampTickerDisplay(global.boardSevenTicker[0], global.boardSevenTicker[1], board7, global.boardSevenTicker[3], 'production')
        window.boardHandle7 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up7.innerHTML = time
          tickers.bitstampTickerDisplay(global.boardSevenTicker[0], global.boardSevenTicker[1], board7, global.boardSevenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardSevenTicker[2] === 'CEX.IO') {
        clearInterval(window.boardHandle7)
        tickers.cextradeTickerDisplay(global.boardSevenTicker[0], global.boardSevenTicker[1], board7, global.boardSevenTicker[3], 'production')
        window.boardHandle7 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up7.innerHTML = time
          tickers.cextradeTickerDisplay(global.boardSevenTicker[0], global.boardSevenTicker[1], board7, global.boardSevenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardSevenTicker[2] === 'CoinGecko') {
        clearInterval(window.boardHandle7)
        tickers.coingeckoTickerDisplay(global.boardSevenTicker[0], global.boardSevenTicker[1], board7, global.boardSevenTicker[3], 'production')
        window.boardHandle7 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up7.innerHTML = time
          tickers.coingeckoTickerDisplay(global.boardSevenTicker[0], global.boardSevenTicker[1], board7, global.boardSevenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardSevenTicker[2] === 'Coinbase') {
        clearInterval(window.boardHandle7)
        tickers.coinbaseTickerDisplay(global.boardSevenTicker[0], global.boardSevenTicker[1], board7, global.boardSevenTicker[3], 'production')
        window.boardHandle7 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up7.innerHTML = time
          tickers.coinbaseTickerDisplay(global.boardSevenTicker[0], global.boardSevenTicker[1], board7, global.boardSevenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardSevenTicker[2] === 'CryptoCompare') {
        clearInterval(window.boardHandle7)
        tickers.cryptoCompareTickerDisplay(global.boardSevenTicker[0], global.boardSevenTicker[1], board7, global.boardSevenTicker[3], 'production')
        window.boardHandle7 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up7.innerHTML = time
          tickers.cryptoCompareTickerDisplay(global.boardSevenTicker[0], global.boardSevenTicker[1], board7, global.boardSevenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardSevenTicker[2] === 'FTX') {
        clearInterval(window.boardHandle7)
        tickers.ftxTickerDisplay(global.boardSevenTicker[0], global.boardSevenTicker[1], board7, global.boardSevenTicker[3], 'production')
        window.boardHandle7 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up7.innerHTML = time
          tickers.ftxTickerDisplay(global.boardSevenTicker[0], global.boardSevenTicker[1], board7, global.boardSevenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardSevenTicker[2] === 'HitBTC') {
        clearInterval(window.boardHandle7)
        tickers.hitBtcTickerDisplay(global.boardSevenTicker[0], global.boardSevenTicker[1], board7, global.boardSevenTicker[3], 'production')
        window.boardHandle7 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up7.innerHTML = time
          tickers.hitBtcTickerDisplay(global.boardSevenTicker[0], global.boardSevenTicker[1], board7, global.boardSevenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardSevenTicker[2] === 'Huobi') {
        clearInterval(window.boardHandle7)
        tickers.huobiBtcTickerDisplay(global.boardSevenTicker[0], global.boardSevenTicker[1], board7, global.boardSevenTicker[3], 'production')
        window.boardHandle7 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up7.innerHTML = time
          tickers.huobiBtcTickerDisplay(global.boardSevenTicker[0], global.boardSevenTicker[1], board7, global.boardSevenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardSevenTicker[2] === 'Kraken') {
        clearInterval(window.boardHandle7)
        tickers.krakenTickerDisplay(global.boardSevenTicker[0], global.boardSevenTicker[1], board7, global.boardSevenTicker[3], 'production')
        window.boardHandle7 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up7.innerHTML = time
          tickers.krakenTickerDisplay(global.boardSevenTicker[0], global.boardSevenTicker[1], board7, global.boardSevenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardSevenTicker[2] === 'Paymium') {
        clearInterval(window.boardHandle7)
        tickers.paymiumTickerDisplay(global.boardSevenTicker[0], board7, global.boardSevenTicker[0], 'production')
        window.boardHandle7 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up7.innerHTML = time
          tickers.paymiumTickerDisplay(global.boardSevenTicker[0], board7, global.boardSevenTicker[0], 'production')
        }, 25000)
      }
      if (global.boardSevenTicker[2] === 'TDAX') {
        clearInterval(window.boardHandle7)
        tickers.tdaxTickerDisplay(global.boardSevenTicker[0], global.boardSevenTicker[1], board7, global.boardSevenTicker[3], 'production')
        window.boardHandle7 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up7.innerHTML = time
          tickers.tdaxTickerDisplay(global.boardSevenTicker[0], global.boardSevenTicker[1], board7, global.boardSevenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardSevenTicker[2] === 'VCC Exchange') {
        clearInterval(window.boardHandle7)
        tickers.vccTickerDisplay(global.boardSevenTicker[0], global.boardSevenTicker[1], board7, global.boardSevenTicker[3], 'production')
        window.boardHandle7 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up7.innerHTML = time
          tickers.vccTickerDisplay(global.boardSevenTicker[0], global.boardSevenTicker[1], board7, global.boardSevenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardEightTicker[2] === 'Binance') {
        clearInterval(window.boardHandle8)
        tickers.binanceTickerDisplay(global.boardEightTicker[0], global.boardEightTicker[1], board8, global.boardEightTicker[3], 'production')
        window.boardHandle8 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up8.innerHTML = time
          tickers.binanceTickerDisplay(global.boardEightTicker[0], global.boardEightTicker[1], board8, global.boardEightTicker[3], 'production')
        }, 25000)
      }
      if (global.boardEightTicker[2] === 'Gemini') {
        clearInterval(window.boardHandle8)
        tickers.geminiTickerDisplay(global.boardEightTicker[0], global.boardEightTicker[1], board8, global.boardEightTicker[3], 'production')
        window.boardHandle8 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up8.innerHTML = time
          tickers.geminiTickerDisplay(global.boardEightTicker[0], global.boardEightTicker[1], board8, global.boardEightTicker[3], 'production')
        }, 25000)
      }
      if (global.boardEightTicker[2] === 'OKEx') {
        clearInterval(window.boardHandle8)
        tickers.okexTickerDisplay(global.boardEightTicker[0], global.boardEightTicker[1], board8, global.boardEightTicker[3], 'production')
        window.boardHandle8 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up8.innerHTML = time
          tickers.okexTickerDisplay(global.boardEightTicker[0], global.boardEightTicker[1], board8, global.boardEightTicker[3], 'production')
        }, 25000)
      }
      if (global.boardEightTicker[2] === 'Binance Futures') {
        clearInterval(window.boardHandle8)
        tickers.binanceFuturesTickerDisplay(global.boardEightTicker[0], global.boardEightTicker[1], board8, global.boardEightTicker[3], 'production')
        window.boardHandle8 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up8.innerHTML = time
          tickers.binanceFuturesTickerDisplay(global.boardEightTicker[0], global.boardEightTicker[1], board8, global.boardEightTicker[3], 'production')
        }, 25000)
      }
      if (global.boardEightTicker[2] === 'KuCoin') {
        clearInterval(window.boardHandle8)
        tickers.kucoinTickerDisplay(global.boardEightTicker[0], global.boardEightTicker[1], board8, global.boardEightTicker[3], 'production')
        window.boardHandle8 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up8.innerHTML = time
          tickers.kucoinTickerDisplay(global.boardEightTicker[0], global.boardEightTicker[1], board8, global.boardEightTicker[3], 'production')
        }, 25000)
      }
      if (global.boardEightTicker[2] === 'Poloniex') {
        clearInterval(window.boardHandle8)
        tickers.poloniexTickerDisplay(global.boardEightTicker[0], global.boardEightTicker[1], board8, global.boardEightTicker[3], 'production')
        window.boardHandle8 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up8.innerHTML = time
          tickers.poloniexTickerDisplay(global.boardEightTicker[0], global.boardEightTicker[1], board8, global.boardEightTicker[3], 'production')
        }, 25000)
      }
      if (global.boardEightTicker[2] === 'BTC Markets') {
        clearInterval(window.boardHandle8)
        tickers.btcMarketsTickerDisplay(global.boardEightTicker[0], global.boardEightTicker[1], board8, global.boardEightTicker[3], 'production')
        window.boardHandle8 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up8.innerHTML = time
          tickers.btcMarketsTickerDisplay(global.boardEightTicker[0], global.boardEightTicker[1], board8, global.boardEightTicker[3], 'production')
        }, 25000)
      }
      if (global.boardEightTicker[2] === 'BitMEX') {
        clearInterval(window.boardHandle8)
        tickers.bitmexTickerDisplay(global.boardEightTicker[0], global.boardEightTicker[1], board8, global.boardEightTicker[3], 'production')
        window.boardHandle8 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up8.innerHTML = time
          tickers.bitmexTickerDisplay(global.boardEightTicker[0], global.boardEightTicker[1], board8, global.boardEightTicker[3], 'production')
        }, 25000)
      }
      if (global.boardEightTicker[2] === 'BitPay') {
        clearInterval(window.boardHandle8)
        tickers.bitpayTickerDisplay(global.boardEightTicker[0], global.boardEightTicker[1], board8, global.boardEightTicker[3], 'production')
        window.boardHandle8 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up8.innerHTML = time
          tickers.bitpayTickerDisplay(global.boardEightTicker[0], global.boardEightTicker[1], board8, global.boardEightTicker[3], 'production')
        }, 25000)
      }
      if (global.boardEightTicker[2] === 'Bitfinex') {
        clearInterval(window.boardHandle8)
        tickers.bitfinexTickerDisplay(global.boardEightTicker[0], global.boardEightTicker[1], board8, global.boardEightTicker[3], 'production')
        window.boardHandle8 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up8.innerHTML = time
          tickers.bitfinexTickerDisplay(global.boardEightTicker[0], global.boardEightTicker[1], board8, global.boardEightTicker[3], 'production')
        }, 25000)
      }
      if (global.boardEightTicker[2] === 'Bitso') {
        clearInterval(window.boardHandle8)
        tickers.bitsoTickerDisplay(global.boardEightTicker[0], global.boardEightTicker[1], board8, global.boardEightTicker[3], 'production')
        window.boardHandle8 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up8.innerHTML = time
          tickers.bitsoTickerDisplay(global.boardEightTicker[0], global.boardEightTicker[1], board8, global.boardEightTicker[3], 'production')
        }, 25000)
      }
      if (global.boardEightTicker[2] === 'Bitstamp') {
        clearInterval(window.boardHandle8)
        tickers.bitsoTickerDisplay(global.boardEightTicker[0], global.boardEightTicker[1], board8, global.boardEightTicker[3], 'production')
        window.boardHandle8 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up8.innerHTML = time
          tickers.bitstampTickerDisplay(global.boardEightTicker[0], global.boardEightTicker[1], board8, global.boardEightTicker[3], 'production')
        }, 25000)
      }
      if (global.boardEightTicker[2] === 'CEX.IO') {
        clearInterval(window.boardHandle8)
        tickers.cextradeTickerDisplay(global.boardEightTicker[0], global.boardEightTicker[1], board8, global.boardEightTicker[3], 'production')
        window.boardHandle8 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up8.innerHTML = time
          tickers.cextradeTickerDisplay(global.boardEightTicker[0], global.boardEightTicker[1], board8, global.boardEightTicker[3], 'production')
        }, 25000)
      }
      if (global.boardEightTicker[2] === 'CoinGecko') {
        clearInterval(window.boardHandle8)
        tickers.coingeckoTickerDisplay(global.boardEightTicker[0], global.boardEightTicker[1], board8, global.boardEightTicker[3], 'production')
        window.boardHandle8 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up8.innerHTML = time
          tickers.coingeckoTickerDisplay(global.boardEightTicker[0], global.boardEightTicker[1], board8, global.boardEightTicker[3], 'production')
        }, 25000)
      }
      if (global.boardEightTicker[2] === 'Coinbase') {
        clearInterval(window.boardHandle8)
        tickers.coinbaseTickerDisplay(global.boardEightTicker[0], global.boardEightTicker[1], board8, global.boardEightTicker[3], 'production')
        window.boardHandle8 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up8.innerHTML = time
          tickers.coinbaseTickerDisplay(global.boardEightTicker[0], global.boardEightTicker[1], board8, global.boardEightTicker[3], 'production')
        }, 25000)
      }
      if (global.boardEightTicker[2] === 'CryptoCompare') {
        clearInterval(window.boardHandle8)
        tickers.coinbaseTickerDisplay(global.boardEightTicker[0], global.boardEightTicker[1], board8, global.boardEightTicker[3], 'production')
        window.boardHandle8 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up8.innerHTML = time
          tickers.cryptoCompareTickerDisplay(global.boardEightTicker[0], global.boardEightTicker[1], board8, global.boardEightTicker[3], 'production')
        }, 25000)
      }
      if (global.boardEightTicker[2] === 'FTX') {
        clearInterval(window.boardHandle8)
        tickers.ftxTickerDisplay(global.boardEightTicker[0], global.boardEightTicker[1], board8, global.boardEightTicker[3], 'production')
        window.boardHandle8 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up8.innerHTML = time
          tickers.ftxTickerDisplay(global.boardEightTicker[0], global.boardEightTicker[1], board8, global.boardEightTicker[3], 'production')
        }, 25000)
      }
      if (global.boardEightTicker[2] === 'HitBTC') {
        clearInterval(window.boardHandle8)
        tickers.hitBtcTickerDisplay(global.boardEightTicker[0], global.boardEightTicker[1], board8, global.boardEightTicker[3], 'production')
        window.boardHandle8 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up8.innerHTML = time
          tickers.hitBtcTickerDisplay(global.boardEightTicker[0], global.boardEightTicker[1], board8, global.boardEightTicker[3], 'production')
        }, 25000)
      }
      if (global.boardEightTicker[2] === 'Huobi') {
        clearInterval(window.boardHandle8)
        tickers.huobiBtcTickerDisplay(global.boardEightTicker[0], global.boardEightTicker[1], board8, global.boardEightTicker[3], 'production')
        window.boardHandle8 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up8.innerHTML = time
          tickers.huobiBtcTickerDisplay(global.boardEightTicker[0], global.boardEightTicker[1], board8, global.boardEightTicker[3], 'production')
        }, 25000)
      }
      if (global.boardEightTicker[2] === 'Kraken') {
        clearInterval(window.boardHandle8)
        tickers.krakenTickerDisplay(global.boardEightTicker[0], global.boardEightTicker[1], board8, global.boardEightTicker[3], 'production')
        window.boardHandle8 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up8.innerHTML = time
          tickers.krakenTickerDisplay(global.boardEightTicker[0], global.boardEightTicker[1], board8, global.boardEightTicker[3], 'production')
        }, 25000)
      }
      if (global.boardEightTicker[2] === 'Paymium') {
        clearInterval(window.boardHandle8)
        tickers.krakenTickerDisplay(global.boardEightTicker[0], global.boardEightTicker[1], board8, global.boardEightTicker[3], 'production')
        window.boardHandle8 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up8.innerHTML = time
          tickers.paymiumTickerDisplay(global.boardEightTicker[0], board8, global.boardEightTicker[0], 'production')
        }, 25000)
      }
      if (global.boardEightTicker[2] === 'TDAX') {
        clearInterval(window.boardHandle8)
        tickers.tdaxTickerDisplay(global.boardEightTicker[0], global.boardEightTicker[1], board8, global.boardEightTicker[3], 'production')
        window.boardHandle8 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up8.innerHTML = time
          tickers.tdaxTickerDisplay(global.boardEightTicker[0], global.boardEightTicker[1], board8, global.boardEightTicker[3], 'production')
        }, 25000)
      }
      if (global.boardEightTicker[2] === 'VCC Exchange') {
        clearInterval(window.boardHandle8)
        tickers.vccTickerDisplay(global.boardEightTicker[0], global.boardEightTicker[1], board8, global.boardEightTicker[3], 'production')
        window.boardHandle8 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up8.innerHTML = time
          tickers.vccTickerDisplay(global.boardEightTicker[0], global.boardEightTicker[1], board8, global.boardEightTicker[3], 'production')
        }, 25000)
      }
      if (global.boardNineTicker[2] === 'Binance') {
        clearInterval(window.boardHandle9)
        tickers.binanceTickerDisplay(global.boardNineTicker[0], global.boardNineTicker[1], board9, global.boardNineTicker[3], 'production')
        window.boardHandle9 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up9.innerHTML = time
          tickers.binanceTickerDisplay(global.boardNineTicker[0], global.boardNineTicker[1], board9, global.boardNineTicker[3], 'production')
        }, 25000)
      }
      if (global.boardNineTicker[2] === 'Gemini') {
        clearInterval(window.boardHandle9)
        tickers.geminiTickerDisplay(global.boardNineTicker[0], global.boardNineTicker[1], board9, global.boardNineTicker[3], 'production')
        window.boardHandle9 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up9.innerHTML = time
          tickers.geminiTickerDisplay(global.boardNineTicker[0], global.boardNineTicker[1], board9, global.boardNineTicker[3], 'production')
        }, 25000)
      }
      if (global.boardNineTicker[2] === 'OKEx') {
        clearInterval(window.boardHandle9)
        tickers.okexTickerDisplay(global.boardNineTicker[0], global.boardNineTicker[1], board9, global.boardNineTicker[3], 'production')
        window.boardHandle9 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up9.innerHTML = time
          tickers.okexTickerDisplay(global.boardNineTicker[0], global.boardNineTicker[1], board9, global.boardNineTicker[3], 'production')
        }, 25000)
      }
      if (global.boardNineTicker[2] === 'Binance Futures') {
        clearInterval(window.boardHandle9)
        tickers.binanceFuturesTickerDisplay(global.boardNineTicker[0], global.boardNineTicker[1], board9, global.boardNineTicker[3], 'production')
        window.boardHandle9 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up9.innerHTML = time
          tickers.binanceFuturesTickerDisplay(global.boardNineTicker[0], global.boardNineTicker[1], board9, global.boardNineTicker[3], 'production')
        }, 25000)
      }
      if (global.boardNineTicker[2] === 'KuCoin') {
        clearInterval(window.boardHandle9)
        tickers.kucoinTickerDisplay(global.boardNineTicker[0], global.boardNineTicker[1], board9, global.boardNineTicker[3], 'production')
        window.boardHandle9 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up9.innerHTML = time
          tickers.kucoinTickerDisplay(global.boardNineTicker[0], global.boardNineTicker[1], board9, global.boardNineTicker[3], 'production')
        }, 25000)
      }
      if (global.boardNineTicker[2] === 'Poloniex') {
        clearInterval(window.boardHandle9)
        tickers.poloniexTickerDisplay(global.boardNineTicker[0], global.boardNineTicker[1], board9, global.boardNineTicker[3], 'production')
        window.boardHandle9 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up9.innerHTML = time
          tickers.poloniexTickerDisplay(global.boardNineTicker[0], global.boardNineTicker[1], board9, global.boardNineTicker[3], 'production')
        }, 25000)
      }
      if (global.boardNineTicker[2] === 'BTC Markets') {
        clearInterval(window.boardHandle9)
        tickers.btcMarketsTickerDisplay(global.boardNineTicker[0], global.boardNineTicker[1], board9, global.boardNineTicker[3], 'production')
        window.boardHandle9 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up9.innerHTML = time
          tickers.btcMarketsTickerDisplay(global.boardNineTicker[0], global.boardNineTicker[1], board9, global.boardNineTicker[3], 'production')
        }, 25000)
      }
      if (global.boardNineTicker[2] === 'BitMEX') {
        clearInterval(window.boardHandle9)
        tickers.bitmexTickerDisplay(global.boardNineTicker[0], global.boardNineTicker[1], board9, global.boardNineTicker[3], 'production')
        window.boardHandle9 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up9.innerHTML = time
          tickers.bitmexTickerDisplay(global.boardNineTicker[0], global.boardNineTicker[1], board9, global.boardNineTicker[3], 'production')
        }, 25000)
      }
      if (global.boardNineTicker[2] === 'BitPay') {
        clearInterval(window.boardHandle9)
        tickers.bitpayTickerDisplay(global.boardNineTicker[0], global.boardNineTicker[1], board9, global.boardNineTicker[3], 'production')
        window.boardHandle9 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up9.innerHTML = time
          tickers.bitpayTickerDisplay(global.boardNineTicker[0], global.boardNineTicker[1], board9, global.boardNineTicker[3], 'production')
        }, 25000)
      }
      if (global.boardNineTicker[2] === 'Bitfinex') {
        clearInterval(window.boardHandle9)
        tickers.bitfinexTickerDisplay(global.boardNineTicker[0], global.boardNineTicker[1], board9, global.boardNineTicker[3], 'production')
        window.boardHandle9 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up9.innerHTML = time
          tickers.bitfinexTickerDisplay(global.boardNineTicker[0], global.boardNineTicker[1], board9, global.boardNineTicker[3], 'production')
        }, 25000)
      }
      if (global.boardNineTicker[2] === 'Bitso') {
        clearInterval(window.boardHandle9)
        tickers.bitsoTickerDisplay(global.boardNineTicker[0], global.boardNineTicker[1], board9, global.boardNineTicker[3], 'production')
        window.boardHandle9 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up9.innerHTML = time
          tickers.bitsoTickerDisplay(global.boardNineTicker[0], global.boardNineTicker[1], board9, global.boardNineTicker[3], 'production')
        }, 25000)
      }
      if (global.boardNineTicker[2] === 'Bitstamp') {
        clearInterval(window.boardHandle9)
        tickers.bitstampTickerDisplay(global.boardNineTicker[0], global.boardNineTicker[1], board9, global.boardNineTicker[3], 'production')
        window.boardHandle9 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up9.innerHTML = time
          tickers.bitstampTickerDisplay(global.boardNineTicker[0], global.boardNineTicker[1], board9, global.boardNineTicker[3], 'production')
        }, 25000)
      }
      if (global.boardNineTicker[2] === 'CEX.IO') {
        clearInterval(window.boardHandle9)
        tickers.cextradeTickerDisplay(global.boardNineTicker[0], global.boardNineTicker[1], board9, global.boardNineTicker[3], 'production')
        window.boardHandle9 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up9.innerHTML = time
          tickers.cextradeTickerDisplay(global.boardNineTicker[0], global.boardNineTicker[1], board9, global.boardNineTicker[3], 'production')
        }, 25000)
      }
      if (global.boardNineTicker[2] === 'CoinGecko') {
        clearInterval(window.boardHandle9)
        tickers.coingeckoTickerDisplay(global.boardNineTicker[0], global.boardNineTicker[1], board9, global.boardNineTicker[3], 'production')
        window.boardHandle9 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up9.innerHTML = time
          tickers.coingeckoTickerDisplay(global.boardNineTicker[0], global.boardNineTicker[1], board9, global.boardNineTicker[3], 'production')
        }, 25000)
      }
      if (global.boardNineTicker[2] === 'Coinbase') {
        clearInterval(window.boardHandle9)
        tickers.coinbaseTickerDisplay(global.boardNineTicker[0], global.boardNineTicker[1], board9, global.boardNineTicker[3], 'production')
        window.boardHandle9 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up9.innerHTML = time
          tickers.coinbaseTickerDisplay(global.boardNineTicker[0], global.boardNineTicker[1], board9, global.boardNineTicker[3], 'production')
        }, 25000)
      }
      if (global.boardNineTicker[2] === 'CryptoCompare') {
        clearInterval(window.boardHandle9)
        tickers.cryptoCompareTickerDisplay(global.boardNineTicker[0], global.boardNineTicker[1], board9, global.boardNineTicker[3], 'production')
        window.boardHandle9 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up9.innerHTML = time
          tickers.cryptoCompareTickerDisplay(global.boardNineTicker[0], global.boardNineTicker[1], board9, global.boardNineTicker[3], 'production')
        }, 25000)
      }
      if (global.boardNineTicker[2] === 'FTX') {
        clearInterval(window.boardHandle9)
        tickers.ftxTickerDisplay(global.boardNineTicker[0], global.boardNineTicker[1], board9, global.boardNineTicker[3], 'production')
        window.boardHandle9 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up9.innerHTML = time
          tickers.ftxTickerDisplay(global.boardNineTicker[0], global.boardNineTicker[1], board9, global.boardNineTicker[3], 'production')
        }, 25000)
      }
      if (global.boardNineTicker[2] === 'HitBTC') {
        clearInterval(window.boardHandle9)
        tickers.hitBtcTickerDisplay(global.boardNineTicker[0], global.boardNineTicker[1], board9, global.boardNineTicker[3], 'production')
        window.boardHandle9 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up9.innerHTML = time
          tickers.hitBtcTickerDisplay(global.boardNineTicker[0], global.boardNineTicker[1], board9, global.boardNineTicker[3], 'production')
        }, 25000)
      }
      if (global.boardNineTicker[2] === 'Huobi') {
        clearInterval(window.boardHandle9)
        tickers.huobiBtcTickerDisplay(global.boardNineTicker[0], global.boardNineTicker[1], board9, global.boardNineTicker[3], 'production')
        window.boardHandle9 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up9.innerHTML = time
          tickers.huobiBtcTickerDisplay(global.boardNineTicker[0], global.boardNineTicker[1], board9, global.boardNineTicker[3], 'production')
        }, 25000)
      }
      if (global.boardNineTicker[2] === 'Kraken') {
        clearInterval(window.boardHandle9)
        tickers.krakenTickerDisplay(global.boardNineTicker[0], global.boardNineTicker[1], board9, global.boardNineTicker[3], 'production')
        window.boardHandle9 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up9.innerHTML = time
          tickers.krakenTickerDisplay(global.boardNineTicker[0], global.boardNineTicker[1], board9, global.boardNineTicker[3], 'production')
        }, 25000)
      }
      if (global.boardNineTicker[2] === 'Paymium') {
        clearInterval(window.boardHandle9)
        tickers.paymiumTickerDisplay(global.boardNineTicker[0], board9, global.boardNineTicker[0], 'production')
        window.boardHandle9 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up9.innerHTML = time
          tickers.paymiumTickerDisplay(global.boardNineTicker[0], board9, global.boardNineTicker[0], 'production')
        }, 25000)
      }
      if (global.boardNineTicker[2] === 'TDAX') {
        clearInterval(window.boardHandle9)
        tickers.tdaxTickerDisplay(global.boardNineTicker[0], global.boardNineTicker[1], board9, global.boardNineTicker[3], 'production')
        window.boardHandle9 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up9.innerHTML = time
          tickers.tdaxTickerDisplay(global.boardNineTicker[0], global.boardNineTicker[1], board9, global.boardNineTicker[3], 'production')
        }, 25000)
      }
      if (global.boardNineTicker[2] === 'VCC Exchange') {
        clearInterval(window.boardHandle9)
        tickers.vccTickerDisplay(global.boardNineTicker[0], global.boardNineTicker[1], board9, global.boardNineTicker[3], 'production')
        window.boardHandle9 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up10.innerHTML = time
          tickers.vccTickerDisplay(global.boardNineTicker[0], global.boardNineTicker[1], board9, global.boardNineTicker[3], 'production')
        }, 25000)
      }
      if (global.boardTenTicker[2] === 'Binance') {
        clearInterval(window.boardHandle10)
        tickers.binanceTickerDisplay(global.boardTenTicker[0], global.boardTenTicker[1], board10, global.boardTenTicker[3], 'production')
        window.boardHandle10 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up10.innerHTML = time
          tickers.binanceTickerDisplay(global.boardTenTicker[0], global.boardTenTicker[1], board10, global.boardTenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardTenTicker[2] === 'Gemini') {
        clearInterval(window.boardHandle10)
        tickers.geminiTickerDisplay(global.boardTenTicker[0], global.boardTenTicker[1], board10, global.boardTenTicker[3], 'production')
        window.boardHandle10 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up10.innerHTML = time
          tickers.geminiTickerDisplay(global.boardTenTicker[0], global.boardTenTicker[1], board10, global.boardTenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardTenTicker[2] === 'OKEx') {
        clearInterval(window.boardHandle10)
        tickers.okexTickerDisplay(global.boardTenTicker[0], global.boardTenTicker[1], board10, global.boardTenTicker[3], 'production')
        window.boardHandle10 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up10.innerHTML = time
          tickers.okexTickerDisplay(global.boardTenTicker[0], global.boardTenTicker[1], board10, global.boardTenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardTenTicker[2] === 'Binance Futures') {
        clearInterval(window.boardHandle10)
        tickers.binanceFuturesTickerDisplay(global.boardTenTicker[0], global.boardTenTicker[1], board10, global.boardTenTicker[3], 'production')
        window.boardHandle10 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up10.innerHTML = time
          tickers.binanceFuturesTickerDisplay(global.boardTenTicker[0], global.boardTenTicker[1], board10, global.boardTenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardTenTicker[2] === 'KuCoin') {
        clearInterval(window.boardHandle10)
        tickers.kucoinTickerDisplay(global.boardTenTicker[0], global.boardTenTicker[1], board10, global.boardTenTicker[3], 'production')
        window.boardHandle10 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up10.innerHTML = time
          tickers.kucoinTickerDisplay(global.boardTenTicker[0], global.boardTenTicker[1], board10, global.boardTenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardTenTicker[2] === 'Poloniex') {
        clearInterval(window.boardHandle10)
        tickers.poloniexTickerDisplay(global.boardTenTicker[0], global.boardTenTicker[1], board10, global.boardTenTicker[3], 'production')
        window.boardHandle10 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up10.innerHTML = time
          tickers.poloniexTickerDisplay(global.boardTenTicker[0], global.boardTenTicker[1], board10, global.boardTenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardTenTicker[2] === 'BTC Markets') {
        clearInterval(window.boardHandle10)
        tickers.btcMarketsTickerDisplay(global.boardTenTicker[0], global.boardTenTicker[1], board10, global.boardTenTicker[3], 'production')
        window.boardHandle10 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up10.innerHTML = time
          tickers.btcMarketsTickerDisplay(global.boardTenTicker[0], global.boardTenTicker[1], board10, global.boardTenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardTenTicker[2] === 'BitMEX') {
        clearInterval(window.boardHandle10)
        tickers.bitmexTickerDisplay(global.boardTenTicker[0], global.boardTenTicker[1], board10, global.boardTenTicker[3], 'production')
        window.boardHandle10 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up10.innerHTML = time
          tickers.bitmexTickerDisplay(global.boardTenTicker[0], global.boardTenTicker[1], board10, global.boardTenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardTenTicker[2] === 'BitPay') {
        clearInterval(window.boardHandle10)
        tickers.bitpayTickerDisplay(global.boardTenTicker[0], global.boardTenTicker[1], board10, global.boardTenTicker[3], 'production')
        window.boardHandle10 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up10.innerHTML = time
          tickers.bitpayTickerDisplay(global.boardTenTicker[0], global.boardTenTicker[1], board10, global.boardTenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardTenTicker[2] === 'Bitfinex') {
        clearInterval(window.boardHandle10)
        tickers.bitfinexTickerDisplay(global.boardTenTicker[0], global.boardTenTicker[1], board10, global.boardTenTicker[3], 'production')
        window.boardHandle10 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up10.innerHTML = time
          tickers.bitfinexTickerDisplay(global.boardTenTicker[0], global.boardTenTicker[1], board10, global.boardTenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardTenTicker[2] === 'Bitso') {
        clearInterval(window.boardHandle10)
        tickers.bitsoTickerDisplay(global.boardTenTicker[0], global.boardTenTicker[1], board10, global.boardTenTicker[3], 'production')
        window.boardHandle10 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up10.innerHTML = time
          tickers.bitsoTickerDisplay(global.boardTenTicker[0], global.boardTenTicker[1], board10, global.boardTenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardTenTicker[2] === 'Bitstamp') {
        clearInterval(window.boardHandle10)
        tickers.bitstampTickerDisplay(global.boardTenTicker[0], global.boardTenTicker[1], board10, global.boardTenTicker[3], 'production')
        window.boardHandle10 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up10.innerHTML = time
          tickers.bitstampTickerDisplay(global.boardTenTicker[0], global.boardTenTicker[1], board10, global.boardTenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardTenTicker[2] === 'CEX.IO') {
        clearInterval(window.boardHandle10)
        tickers.cextradeTickerDisplay(global.boardTenTicker[0], global.boardTenTicker[1], board10, global.boardTenTicker[3], 'production')
        window.boardHandle10 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up10.innerHTML = time
          tickers.cextradeTickerDisplay(global.boardTenTicker[0], global.boardTenTicker[1], board10, global.boardTenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardTenTicker[2] === 'CoinGecko') {
        clearInterval(window.boardHandle10)
        tickers.coingeckoTickerDisplay(global.boardTenTicker[0], global.boardTenTicker[1], board10, global.boardTenTicker[3], 'production')
        window.boardHandle10 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up10.innerHTML = time
          tickers.coingeckoTickerDisplay(global.boardTenTicker[0], global.boardTenTicker[1], board10, global.boardTenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardTenTicker[2] === 'Coinbase') {
        clearInterval(window.boardHandle10)
        tickers.coinbaseTickerDisplay(global.boardTenTicker[0], global.boardTenTicker[1], board10, global.boardTenTicker[3], 'production')
        window.boardHandle10 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up10.innerHTML = time
          tickers.coinbaseTickerDisplay(global.boardTenTicker[0], global.boardTenTicker[1], board10, global.boardTenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardTenTicker[2] === 'CryptoCompare') {
        clearInterval(window.boardHandle10)
        tickers.cryptoCompareTickerDisplay(global.boardTenTicker[0], global.boardTenTicker[1], board10, global.boardTenTicker[3], 'production')
        window.boardHandle10 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up10.innerHTML = time
          tickers.cryptoCompareTickerDisplay(global.boardTenTicker[0], global.boardTenTicker[1], board10, global.boardTenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardTenTicker[2] === 'FTX') {
        clearInterval(window.boardHandle10)
        tickers.ftxTickerDisplay(global.boardTenTicker[0], global.boardTenTicker[1], board10, global.boardTenTicker[3], 'production')
        window.boardHandle10 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up10.innerHTML = time
          tickers.ftxTickerDisplay(global.boardTenTicker[0], global.boardTenTicker[1], board10, global.boardTenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardTenTicker[2] === 'HitBTC') {
        clearInterval(window.boardHandle10)
        tickers.hitBtcTickerDisplay(global.boardTenTicker[0], global.boardTenTicker[1], board10, global.boardTenTicker[3], 'production')
        window.boardHandle10 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up10.innerHTML = time
          tickers.hitBtcTickerDisplay(global.boardTenTicker[0], global.boardTenTicker[1], board10, global.boardTenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardTenTicker[2] === 'Huobi') {
        clearInterval(window.boardHandle10)
        tickers.huobiBtcTickerDisplay(global.boardTenTicker[0], global.boardTenTicker[1], board10, global.boardTenTicker[3], 'production')
        window.boardHandle10 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up10.innerHTML = time
          tickers.huobiBtcTickerDisplay(global.boardTenTicker[0], global.boardTenTicker[1], board10, global.boardTenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardTenTicker[2] === 'Kraken') {
        clearInterval(window.boardHandle10)
        tickers.krakenTickerDisplay(global.boardTenTicker[0], global.boardTenTicker[1], board10, global.boardTenTicker[3], 'production')
        window.boardHandle10 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up10.innerHTML = time
          tickers.krakenTickerDisplay(global.boardTenTicker[0], global.boardTenTicker[1], board10, global.boardTenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardTenTicker[2] === 'Paymium') {
        clearInterval(window.boardHandle10)
        tickers.paymiumTickerDisplay(global.boardTenTicker[0], board10, global.boardTenTicker[0], 'production')
        window.boardHandle10 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up10.innerHTML = time
          tickers.paymiumTickerDisplay(global.boardTenTicker[0], board10, global.boardTenTicker[0], 'production')
        }, 25000)
      }
      if (global.boardTenTicker[2] === 'TDAX') {
        clearInterval(window.boardHandle10)
        tickers.tdaxTickerDisplay(global.boardTenTicker[0], global.boardTenTicker[1], board10, global.boardTenTicker[3], 'production')
        window.boardHandle10 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up10.innerHTML = time
          tickers.tdaxTickerDisplay(global.boardTenTicker[0], global.boardTenTicker[1], board10, global.boardTenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardTenTicker[2] === 'VCC Exchange') {
        clearInterval(window.boardHandle10)
        tickers.vccTickerDisplay(global.boardTenTicker[0], global.boardTenTicker[1], board10, global.boardTenTicker[3], 'production')
        window.boardHandle10 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up10.innerHTML = time
          tickers.vccTickerDisplay(global.boardTenTicker[0], global.boardTenTicker[1], board10, global.boardTenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardElevenTicker[2] === 'Binance') {
        clearInterval(window.boardHandle11)
        tickers.binanceTickerDisplay(global.boardElevenTicker[0], global.boardElevenTicker[1], board11, global.boardElevenTicker[3], 'production')
        window.boardHandle11 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up11.innerHTML = time
          tickers.binanceTickerDisplay(global.boardElevenTicker[0], global.boardElevenTicker[1], board11, global.boardElevenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardElevenTicker[2] === 'Gemini') {
        clearInterval(window.boardHandle11)
        tickers.geminiTickerDisplay(global.boardElevenTicker[0], global.boardElevenTicker[1], board11, global.boardElevenTicker[3], 'production')
        window.boardHandle11 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up11.innerHTML = time
          tickers.geminiTickerDisplay(global.boardElevenTicker[0], global.boardElevenTicker[1], board11, global.boardElevenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardElevenTicker[2] === 'OKEx') {
        clearInterval(window.boardHandle11)
        tickers.okexTickerDisplay(global.boardElevenTicker[0], global.boardElevenTicker[1], board11, global.boardElevenTicker[3], 'production')
        window.boardHandle11 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up11.innerHTML = time
          tickers.okexTickerDisplay(global.boardElevenTicker[0], global.boardElevenTicker[1], board11, global.boardElevenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardElevenTicker[2] === 'Binance Futures') {
        clearInterval(window.boardHandle11)
        tickers.binanceFuturesTickerDisplay(global.boardElevenTicker[0], global.boardElevenTicker[1], board11, global.boardElevenTicker[3], 'production')
        window.boardHandle11 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up11.innerHTML = time
          tickers.binanceFuturesTickerDisplay(global.boardElevenTicker[0], global.boardElevenTicker[1], board11, global.boardElevenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardElevenTicker[2] === 'KuCoin') {
        clearInterval(window.boardHandle11)
        tickers.kucoinTickerDisplay(global.boardElevenTicker[0], global.boardElevenTicker[1], board11, global.boardElevenTicker[3], 'production')
        window.boardHandle11 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up11.innerHTML = time
          tickers.kucoinTickerDisplay(global.boardElevenTicker[0], global.boardElevenTicker[1], board11, global.boardElevenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardElevenTicker[2] === 'Poloniex') {
        clearInterval(window.boardHandle11)
        tickers.poloniexTickerDisplay(global.boardElevenTicker[0], global.boardElevenTicker[1], board11, global.boardElevenTicker[3], 'production')
        window.boardHandle11 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up11.innerHTML = time
          tickers.poloniexTickerDisplay(global.boardElevenTicker[0], global.boardElevenTicker[1], board11, global.boardElevenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardElevenTicker[2] === 'BTC Markets') {
        clearInterval(window.boardHandle11)
        tickers.btcMarketsTickerDisplay(global.boardElevenTicker[0], global.boardElevenTicker[1], board11, global.boardElevenTicker[3], 'production')
        window.boardHandle11 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up11.innerHTML = time
          tickers.btcMarketsTickerDisplay(global.boardElevenTicker[0], global.boardElevenTicker[1], board11, global.boardElevenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardElevenTicker[2] === 'BitMEX') {
        clearInterval(window.boardHandle11)
        tickers.bitmexTickerDisplay(global.boardElevenTicker[0], global.boardElevenTicker[1], board11, global.boardElevenTicker[3], 'production')
        window.boardHandle11 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up11.innerHTML = time
          tickers.bitmexTickerDisplay(global.boardElevenTicker[0], global.boardElevenTicker[1], board11, global.boardElevenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardElevenTicker[2] === 'BitPay') {
        clearInterval(window.boardHandle11)
        tickers.bitpayTickerDisplay(global.boardElevenTicker[0], global.boardElevenTicker[1], board11, global.boardElevenTicker[3], 'production')
        window.boardHandle11 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up11.innerHTML = time
          tickers.bitpayTickerDisplay(global.boardElevenTicker[0], global.boardElevenTicker[1], board11, global.boardElevenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardElevenTicker[2] === 'Bitfinex') {
        clearInterval(window.boardHandle11)
        tickers.bitfinexTickerDisplay(global.boardElevenTicker[0], global.boardElevenTicker[1], board11, global.boardElevenTicker[3], 'production')
        window.boardHandle11 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up11.innerHTML = time
          tickers.bitfinexTickerDisplay(global.boardElevenTicker[0], global.boardElevenTicker[1], board11, global.boardElevenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardElevenTicker[2] === 'Bitso') {
        clearInterval(window.boardHandle11)
        tickers.bitsoTickerDisplay(global.boardElevenTicker[0], global.boardElevenTicker[1], board11, global.boardElevenTicker[3], 'production')
        window.boardHandle11 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up11.innerHTML = time
          tickers.bitsoTickerDisplay(global.boardElevenTicker[0], global.boardElevenTicker[1], board11, global.boardElevenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardElevenTicker[2] === 'Bitstamp') {
        clearInterval(window.boardHandle11)
        tickers.bitstampTickerDisplay(global.boardElevenTicker[0], global.boardElevenTicker[1], board11, global.boardElevenTicker[3], 'production')
        window.boardHandle11 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up11.innerHTML = time
          tickers.bitstampTickerDisplay(global.boardElevenTicker[0], global.boardElevenTicker[1], board11, global.boardElevenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardElevenTicker[2] === 'CEX.IO') {
        clearInterval(window.boardHandle11)
        tickers.cextradeTickerDisplay(global.boardElevenTicker[0], global.boardElevenTicker[1], board11, global.boardElevenTicker[3], 'production')
        window.boardHandle11 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up11.innerHTML = time
          tickers.cextradeTickerDisplay(global.boardElevenTicker[0], global.boardElevenTicker[1], board11, global.boardElevenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardElevenTicker[2] === 'CoinGecko') {
        clearInterval(window.boardHandle11)
        tickers.coingeckoTickerDisplay(global.boardElevenTicker[0], global.boardElevenTicker[1], board11, global.boardElevenTicker[3], 'production')
        window.boardHandle11 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up11.innerHTML = time
          tickers.coingeckoTickerDisplay(global.boardElevenTicker[0], global.boardElevenTicker[1], board11, global.boardElevenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardElevenTicker[2] === 'Coinbase') {
        clearInterval(window.boardHandle11)
        tickers.coinbaseTickerDisplay(global.boardElevenTicker[0], global.boardElevenTicker[1], board11, global.boardElevenTicker[3], 'production')
        window.boardHandle11 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up11.innerHTML = time
          tickers.coinbaseTickerDisplay(global.boardElevenTicker[0], global.boardElevenTicker[1], board11, global.boardElevenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardElevenTicker[2] === 'CryptoCompare') {
        clearInterval(window.boardHandle11)
        tickers.cryptoCompareTickerDisplay(global.boardElevenTicker[0], global.boardElevenTicker[1], board11, global.boardElevenTicker[3], 'production')
        window.boardHandle11 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up11.innerHTML = time
          tickers.cryptoCompareTickerDisplay(global.boardElevenTicker[0], global.boardElevenTicker[1], board11, global.boardElevenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardElevenTicker[2] === 'FTX') {
        clearInterval(window.boardHandle11)
        tickers.ftxTickerDisplay(global.boardElevenTicker[0], global.boardElevenTicker[1], board11, global.boardElevenTicker[3], 'production')
        window.boardHandle11 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up11.innerHTML = time
          tickers.ftxTickerDisplay(global.boardElevenTicker[0], global.boardElevenTicker[1], board11, global.boardElevenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardElevenTicker[2] === 'HitBTC') {
        clearInterval(window.boardHandle11)
        tickers.hitBtcTickerDisplay(global.boardElevenTicker[0], global.boardElevenTicker[1], board11, global.boardElevenTicker[3], 'production')
        window.boardHandle11 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up11.innerHTML = time
          tickers.hitBtcTickerDisplay(global.boardElevenTicker[0], global.boardElevenTicker[1], board11, global.boardElevenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardElevenTicker[2] === 'Huobi') {
        clearInterval(window.boardHandle11)
        tickers.huobiBtcTickerDisplay(global.boardElevenTicker[0], global.boardElevenTicker[1], board11, global.boardElevenTicker[3], 'production')
        window.boardHandle11 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up11.innerHTML = time
          tickers.huobiBtcTickerDisplay(global.boardElevenTicker[0], global.boardElevenTicker[1], board11, global.boardElevenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardElevenTicker[2] === 'Kraken') {
        clearInterval(window.boardHandle11)
        tickers.krakenTickerDisplay(global.boardElevenTicker[0], global.boardElevenTicker[1], board11, global.boardElevenTicker[3], 'production')
        window.boardHandle11 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up11.innerHTML = time
          tickers.krakenTickerDisplay(global.boardElevenTicker[0], global.boardElevenTicker[1], board11, global.boardElevenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardElevenTicker[2] === 'Paymium') {
        clearInterval(window.boardHandle11)
        tickers.paymiumTickerDisplay(global.boardElevenTicker[0], board11, global.boardElevenTicker[0], 'production')
        window.boardHandle11 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up11.innerHTML = time
          tickers.paymiumTickerDisplay(global.boardElevenTicker[0], board11, global.boardElevenTicker[0], 'production')
        }, 25000)
      }
      if (global.boardElevenTicker[2] === 'TDAX') {
        clearInterval(window.boardHandle11)
        tickers.tdaxTickerDisplay(global.boardElevenTicker[0], global.boardElevenTicker[1], board11, global.boardElevenTicker[3], 'production')
        window.boardHandle11 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up11.innerHTML = time
          tickers.tdaxTickerDisplay(global.boardElevenTicker[0], global.boardElevenTicker[1], board11, global.boardElevenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardElevenTicker[2] === 'VCC Exchange') {
        clearInterval(window.boardHandle11)
        tickers.vccTickerDisplay(global.boardElevenTicker[0], global.boardElevenTicker[1], board11, global.boardElevenTicker[3], 'production')
        window.boardHandle11 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up11.innerHTML = time
          tickers.vccTickerDisplay(global.boardElevenTicker[0], global.boardElevenTicker[1], board11, global.boardElevenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardTwelveTicker[2] === 'Binance') {
        clearInterval(window.boardHandle12)
        tickers.binanceTickerDisplay(global.boardTwelveTicker[0], global.boardTwelveTicker[1], board12, global.boardTwelveTicker[3], 'production')
        window.boardHandle12 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up12.innerHTML = time
          tickers.binanceTickerDisplay(global.boardTwelveTicker[0], global.boardTwelveTicker[1], board12, global.boardTwelveTicker[3], 'production')
        }, 25000)
      }
      if (global.boardTwelveTicker[2] === 'Gemini') {
        clearInterval(window.boardHandle12)
        tickers.geminiTickerDisplay(global.boardTwelveTicker[0], global.boardTwelveTicker[1], board12, global.boardTwelveTicker[3], 'production')
        window.boardHandle12 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up12.innerHTML = time
          tickers.geminiTickerDisplay(global.boardTwelveTicker[0], global.boardTwelveTicker[1], board12, global.boardTwelveTicker[3], 'production')
        }, 25000)
      }
      if (global.boardTwelveTicker[2] === 'OKEx') {
        clearInterval(window.boardHandle12)
        tickers.okexTickerDisplay(global.boardTwelveTicker[0], global.boardTwelveTicker[1], board12, global.boardTwelveTicker[3], 'production')
        window.boardHandle12 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up12.innerHTML = time
          tickers.okexTickerDisplay(global.boardTwelveTicker[0], global.boardTwelveTicker[1], board12, global.boardTwelveTicker[3], 'production')
        }, 25000)
      }
      if (global.boardTwelveTicker[2] === 'Binance Futures') {
        clearInterval(window.boardHandle12)
        tickers.binanceFuturesTickerDisplay(global.boardTwelveTicker[0], global.boardTwelveTicker[1], board12, global.boardTwelveTicker[3], 'production')
        window.boardHandle12 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up12.innerHTML = time
          tickers.binanceFuturesTickerDisplay(global.boardTwelveTicker[0], global.boardTwelveTicker[1], board12, global.boardTwelveTicker[3], 'production')
        }, 25000)
      }
      if (global.boardTwelveTicker[2] === 'KuCoin') {
        clearInterval(window.boardHandle12)
        tickers.kucoinTickerDisplay(global.boardTwelveTicker[0], global.boardTwelveTicker[1], board12, global.boardTwelveTicker[3], 'production')
        window.boardHandle12 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up12.innerHTML = time
          tickers.kucoinTickerDisplay(global.boardTwelveTicker[0], global.boardTwelveTicker[1], board12, global.boardTwelveTicker[3], 'production')
        }, 25000)
      }
      if (global.boardTwelveTicker[2] === 'Poloniex') {
        clearInterval(window.boardHandle12)
        tickers.poloniexTickerDisplay(global.boardTwelveTicker[0], global.boardTwelveTicker[1], board12, global.boardTwelveTicker[3], 'production')
        window.boardHandle12 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up12.innerHTML = time
          tickers.poloniexTickerDisplay(global.boardTwelveTicker[0], global.boardTwelveTicker[1], board12, global.boardTwelveTicker[3], 'production')
        }, 25000)
      }
      if (global.boardTwelveTicker[2] === 'BTC Markets') {
        clearInterval(window.boardHandle12)
        tickers.btcMarketsTickerDisplay(global.boardTwelveTicker[0], global.boardTwelveTicker[1], board12, global.boardTwelveTicker[3], 'production')
        window.boardHandle12 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up12.innerHTML = time
          tickers.btcMarketsTickerDisplay(global.boardTwelveTicker[0], global.boardTwelveTicker[1], board12, global.boardTwelveTicker[3], 'production')
        }, 25000)
      }
      if (global.boardTwelveTicker[2] === 'BitMEX') {
        clearInterval(window.boardHandle12)
        tickers.bitmexTickerDisplay(global.boardTwelveTicker[0], global.boardTwelveTicker[1], board12, global.boardTwelveTicker[3], 'production')
        window.boardHandle12 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up12.innerHTML = time
          tickers.bitmexTickerDisplay(global.boardTwelveTicker[0], global.boardTwelveTicker[1], board12, global.boardTwelveTicker[3], 'production')
        }, 25000)
      }
      if (global.boardTwelveTicker[2] === 'BitPay') {
        clearInterval(window.boardHandle12)
        tickers.bitpayTickerDisplay(global.boardTwelveTicker[0], global.boardTwelveTicker[1], board12, global.boardTwelveTicker[3], 'production')
        window.boardHandle12 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up12.innerHTML = time
          tickers.bitpayTickerDisplay(global.boardTwelveTicker[0], global.boardTwelveTicker[1], board12, global.boardTwelveTicker[3], 'production')
        }, 25000)
      }
      if (global.boardTwelveTicker[2] === 'Bitfinex') {
        clearInterval(window.boardHandle12)
        tickers.bitfinexTickerDisplay(global.boardTwelveTicker[0], global.boardTwelveTicker[1], board12, global.boardTwelveTicker[3], 'production')
        window.boardHandle12 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up12.innerHTML = time
          tickers.bitfinexTickerDisplay(global.boardTwelveTicker[0], global.boardTwelveTicker[1], board12, global.boardTwelveTicker[3], 'production')
        }, 25000)
      }
      if (global.boardTwelveTicker[2] === 'Bitso') {
        clearInterval(window.boardHandle12)
        tickers.bitsoTickerDisplay(global.boardTwelveTicker[0], global.boardTwelveTicker[1], board12, global.boardTwelveTicker[3], 'production')
        window.boardHandle12 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up12.innerHTML = time
          tickers.bitsoTickerDisplay(global.boardTwelveTicker[0], global.boardTwelveTicker[1], board12, global.boardTwelveTicker[3], 'production')
        }, 25000)
      }
      if (global.boardTwelveTicker[2] === 'Bitstamp') {
        clearInterval(window.boardHandle12)
        tickers.bitstampTickerDisplay(global.boardTwelveTicker[0], global.boardTwelveTicker[1], board12, global.boardTwelveTicker[3], 'production')
        window.boardHandle12 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up12.innerHTML = time
          tickers.bitstampTickerDisplay(global.boardTwelveTicker[0], global.boardTwelveTicker[1], board12, global.boardTwelveTicker[3], 'production')
        }, 25000)
      }
      if (global.boardTwelveTicker[2] === 'CEX.IO') {
        clearInterval(window.boardHandle12)
        tickers.cextradeTickerDisplay(global.boardTwelveTicker[0], global.boardTwelveTicker[1], board12, global.boardTwelveTicker[3], 'production')
        window.boardHandle12 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up12.innerHTML = time
          tickers.cextradeTickerDisplay(global.boardTwelveTicker[0], global.boardTwelveTicker[1], board12, global.boardTwelveTicker[3], 'production')
        }, 25000)
      }
      if (global.boardTwelveTicker[2] === 'CoinGecko') {
        clearInterval(window.boardHandle12)
        tickers.coingeckoTickerDisplay(global.boardTwelveTicker[0], global.boardTwelveTicker[1], board12, global.boardTwelveTicker[3], 'production')
        window.boardHandle12 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up12.innerHTML = time
          tickers.coingeckoTickerDisplay(global.boardTwelveTicker[0], global.boardTwelveTicker[1], board12, global.boardTwelveTicker[3], 'production')
        }, 25000)
      }
      if (global.boardTwelveTicker[2] === 'Coinbase') {
        clearInterval(window.boardHandle12)
        tickers.coinbaseTickerDisplay(global.boardTwelveTicker[0], global.boardTwelveTicker[1], board12, global.boardTwelveTicker[3], 'production')
        window.boardHandle12 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up12.innerHTML = time
          tickers.coinbaseTickerDisplay(global.boardTwelveTicker[0], global.boardTwelveTicker[1], board12, global.boardTwelveTicker[3], 'production')
        }, 25000)
      }
      if (global.boardTwelveTicker[2] === 'CryptoCompare') {
        clearInterval(window.boardHandle12)
        tickers.cryptoCompareTickerDisplay(global.boardTwelveTicker[0], global.boardTwelveTicker[1], board12, global.boardTwelveTicker[3], 'production')
        window.boardHandle12 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up12.innerHTML = time
          tickers.cryptoCompareTickerDisplay(global.boardTwelveTicker[0], global.boardTwelveTicker[1], board12, global.boardTwelveTicker[3], 'production')
        }, 25000)
      }
      if (global.boardTwelveTicker[2] === 'FTX') {
        clearInterval(window.boardHandle12)
        tickers.ftxTickerDisplay(global.boardTwelveTicker[0], global.boardTwelveTicker[1], board12, global.boardTwelveTicker[3], 'production')
        window.boardHandle12 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up12.innerHTML = time
          tickers.ftxTickerDisplay(global.boardTwelveTicker[0], global.boardTwelveTicker[1], board12, global.boardTwelveTicker[3], 'production')
        }, 25000)
      }
      if (global.boardTwelveTicker[2] === 'HitBTC') {
        clearInterval(window.boardHandle12)
        tickers.hitBtcTickerDisplay(global.boardTwelveTicker[0], global.boardTwelveTicker[1], board12, global.boardTwelveTicker[3], 'production')
        window.boardHandle12 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up12.innerHTML = time
          tickers.hitBtcTickerDisplay(global.boardTwelveTicker[0], global.boardTwelveTicker[1], board12, global.boardTwelveTicker[3], 'production')
        }, 25000)
      }
      if (global.boardTwelveTicker[2] === 'Huobi') {
        clearInterval(window.boardHandle12)
        tickers.huobiBtcTickerDisplay(global.boardTwelveTicker[0], global.boardTwelveTicker[1], board12, global.boardTwelveTicker[3], 'production')
        window.boardHandle12 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up12.innerHTML = time
          tickers.huobiBtcTickerDisplay(global.boardTwelveTicker[0], global.boardTwelveTicker[1], board12, global.boardTwelveTicker[3], 'production')
        }, 25000)
      }
      if (global.boardTwelveTicker[2] === 'Kraken') {
        clearInterval(window.boardHandle12)
        tickers.krakenTickerDisplay(global.boardTwelveTicker[0], global.boardTwelveTicker[1], board12, global.boardTwelveTicker[3], 'production')
        window.boardHandle12 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up12.innerHTML = time
          tickers.krakenTickerDisplay(global.boardTwelveTicker[0], global.boardTwelveTicker[1], board12, global.boardTwelveTicker[3], 'production')
        }, 25000)
      }
      if (global.boardTwelveTicker[2] === 'Paymium') {
        clearInterval(window.boardHandle12)
        tickers.paymiumTickerDisplay(global.boardTwelveTicker[0], board12, global.boardTwelveTicker[0], 'production')
        window.boardHandle12 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up12.innerHTML = time
          tickers.paymiumTickerDisplay(global.boardTwelveTicker[0], board12, global.boardTwelveTicker[0], 'production')
        }, 25000)
      }
      if (global.boardTwelveTicker[2] === 'TDAX') {
        clearInterval(window.boardHandle12)
        tickers.tdaxTickerDisplay(global.boardTwelveTicker[0], global.boardTwelveTicker[1], board12, global.boardTwelveTicker[3], 'production')
        window.boardHandle12 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up12.innerHTML = time
          tickers.tdaxTickerDisplay(global.boardTwelveTicker[0], global.boardTwelveTicker[1], board12, global.boardTwelveTicker[3], 'production')
        }, 25000)
      }
      if (global.boardTwelveTicker[2] === 'VCC Exchange') {
        clearInterval(window.boardHandle12)
        tickers.vccTickerDisplay(global.boardTwelveTicker[0], global.boardTwelveTicker[1], board12, global.boardTwelveTicker[3], 'production')
        window.boardHandle12 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up12.innerHTML = time
          tickers.vccTickerDisplay(global.boardTwelveTicker[0], global.boardTwelveTicker[1], board12, global.boardTwelveTicker[3], 'production')
        }, 25000)
      }
      if (global.boardThirteenTicker[2] === 'Binance') {
        clearInterval(window.boardHandle13)
        tickers.binanceTickerDisplay(global.boardThirteenTicker[0], global.boardThirteenTicker[1], board13, global.boardThirteenTicker[3], 'production')
        window.boardHandle13 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up13.innerHTML = time
          tickers.binanceTickerDisplay(global.boardThirteenTicker[0], global.boardThirteenTicker[1], board13, global.boardThirteenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardThirteenTicker[2] === 'Gemini') {
        clearInterval(window.boardHandle13)
        tickers.geminiTickerDisplay(global.boardThirteenTicker[0], global.boardThirteenTicker[1], board13, global.boardThirteenTicker[3], 'production')
        window.boardHandle13 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up13.innerHTML = time
          tickers.geminiTickerDisplay(global.boardThirteenTicker[0], global.boardThirteenTicker[1], board13, global.boardThirteenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardThirteenTicker[2] === 'OKEx') {
        clearInterval(window.boardHandle13)
        tickers.okexTickerDisplay(global.boardThirteenTicker[0], global.boardThirteenTicker[1], board13, global.boardThirteenTicker[3], 'production')
        window.boardHandle13 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up13.innerHTML = time
          tickers.okexTickerDisplay(global.boardThirteenTicker[0], global.boardThirteenTicker[1], board13, global.boardThirteenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardThirteenTicker[2] === 'Binance Futures') {
        clearInterval(window.boardHandle13)
        tickers.binanceFuturesTickerDisplay(global.boardThirteenTicker[0], global.boardThirteenTicker[1], board13, global.boardThirteenTicker[3], 'production')
        window.boardHandle13 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up13.innerHTML = time
          tickers.binanceFuturesTickerDisplay(global.boardThirteenTicker[0], global.boardThirteenTicker[1], board13, global.boardThirteenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardThirteenTicker[2] === 'KuCoin') {
        clearInterval(window.boardHandle13)
        tickers.kucoinTickerDisplay(global.boardThirteenTicker[0], global.boardThirteenTicker[1], board13, global.boardThirteenTicker[3], 'production')
        window.boardHandle13 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up13.innerHTML = time
          tickers.kucoinTickerDisplay(global.boardThirteenTicker[0], global.boardThirteenTicker[1], board13, global.boardThirteenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardThirteenTicker[2] === 'Poloniex') {
        clearInterval(window.boardHandle13)
        tickers.poloniexTickerDisplay(global.boardThirteenTicker[0], global.boardThirteenTicker[1], board13, global.boardThirteenTicker[3], 'production')
        window.boardHandle13 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up13.innerHTML = time
          tickers.poloniexTickerDisplay(global.boardThirteenTicker[0], global.boardThirteenTicker[1], board13, global.boardThirteenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardThirteenTicker[2] === 'BTC Markets') {
        clearInterval(window.boardHandle13)
        tickers.btcMarketsTickerDisplay(global.boardThirteenTicker[0], global.boardThirteenTicker[1], board13, global.boardThirteenTicker[3], 'production')
        window.boardHandle13 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up13.innerHTML = time
          tickers.btcMarketsTickerDisplay(global.boardThirteenTicker[0], global.boardThirteenTicker[1], board13, global.boardThirteenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardThirteenTicker[2] === 'BitMEX') {
        clearInterval(window.boardHandle13)
        tickers.bitmexTickerDisplay(global.boardThirteenTicker[0], global.boardThirteenTicker[1], board13, global.boardThirteenTicker[3], 'production')
        window.boardHandle13 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up13.innerHTML = time
          tickers.bitmexTickerDisplay(global.boardThirteenTicker[0], global.boardThirteenTicker[1], board13, global.boardThirteenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardThirteenTicker[2] === 'BitPay') {
        clearInterval(window.boardHandle13)
        tickers.bitpayTickerDisplay(global.boardThirteenTicker[0], global.boardThirteenTicker[1], board13, global.boardThirteenTicker[3], 'production')
        window.boardHandle13 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up13.innerHTML = time
          tickers.bitpayTickerDisplay(global.boardThirteenTicker[0], global.boardThirteenTicker[1], board13, global.boardThirteenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardThirteenTicker[2] === 'Bitfinex') {
        clearInterval(window.boardHandle13)
        tickers.bitfinexTickerDisplay(global.boardThirteenTicker[0], global.boardThirteenTicker[1], board13, global.boardThirteenTicker[3], 'production')
        window.boardHandle13 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up13.innerHTML = time
          tickers.bitfinexTickerDisplay(global.boardThirteenTicker[0], global.boardThirteenTicker[1], board13, global.boardThirteenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardThirteenTicker[2] === 'Bitso') {
        clearInterval(window.boardHandle13)
        tickers.bitsoTickerDisplay(global.boardThirteenTicker[0], global.boardThirteenTicker[1], board13, global.boardThirteenTicker[3], 'production')
        window.boardHandle13 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up13.innerHTML = time
          tickers.bitsoTickerDisplay(global.boardThirteenTicker[0], global.boardThirteenTicker[1], board13, global.boardThirteenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardThirteenTicker[2] === 'Bitstamp') {
        clearInterval(window.boardHandle13)
        tickers.bitstampTickerDisplay(global.boardThirteenTicker[0], global.boardThirteenTicker[1], board13, global.boardThirteenTicker[3], 'production')
        window.boardHandle13 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up13.innerHTML = time
          tickers.bitstampTickerDisplay(global.boardThirteenTicker[0], global.boardThirteenTicker[1], board13, global.boardThirteenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardThirteenTicker[2] === 'CEX.IO') {
        clearInterval(window.boardHandle13)
        tickers.cextradeTickerDisplay(global.boardThirteenTicker[0], global.boardThirteenTicker[1], board13, global.boardThirteenTicker[3], 'production')
        window.boardHandle13 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up13.innerHTML = time
          tickers.cextradeTickerDisplay(global.boardThirteenTicker[0], global.boardThirteenTicker[1], board13, global.boardThirteenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardThirteenTicker[2] === 'CoinGecko') {
        clearInterval(window.boardHandle13)
        tickers.coingeckoTickerDisplay(global.boardThirteenTicker[0], global.boardThirteenTicker[1], board13, global.boardThirteenTicker[3], 'production')
        window.boardHandle13 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up13.innerHTML = time
          tickers.coingeckoTickerDisplay(global.boardThirteenTicker[0], global.boardThirteenTicker[1], board13, global.boardThirteenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardThirteenTicker[2] === 'Coinbase') {
        clearInterval(window.boardHandle13)
        tickers.coinbaseTickerDisplay(global.boardThirteenTicker[0], global.boardThirteenTicker[1], board13, global.boardThirteenTicker[3], 'production')
        window.boardHandle13 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up13.innerHTML = time
          tickers.coinbaseTickerDisplay(global.boardThirteenTicker[0], global.boardThirteenTicker[1], board13, global.boardThirteenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardThirteenTicker[2] === 'CryptoCompare') {
        clearInterval(window.boardHandle13)
        tickers.cryptoCompareTickerDisplay(global.boardThirteenTicker[0], global.boardThirteenTicker[1], board13, global.boardThirteenTicker[3], 'production')
        window.boardHandle13 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up13.innerHTML = time
          tickers.cryptoCompareTickerDisplay(global.boardThirteenTicker[0], global.boardThirteenTicker[1], board13, global.boardThirteenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardThirteenTicker[2] === 'FTX') {
        clearInterval(window.boardHandle13)
        tickers.ftxTickerDisplay(global.boardThirteenTicker[0], global.boardThirteenTicker[1], board13, global.boardThirteenTicker[3], 'production')
        window.boardHandle13 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up13.innerHTML = time
          tickers.ftxTickerDisplay(global.boardThirteenTicker[0], global.boardThirteenTicker[1], board13, global.boardThirteenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardThirteenTicker[2] === 'HitBTC') {
        clearInterval(window.boardHandle13)
        tickers.hitBtcTickerDisplay(global.boardThirteenTicker[0], global.boardThirteenTicker[1], board13, global.boardThirteenTicker[3], 'production')
        window.boardHandle13 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up13.innerHTML = time
          tickers.hitBtcTickerDisplay(global.boardThirteenTicker[0], global.boardThirteenTicker[1], board13, global.boardThirteenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardThirteenTicker[2] === 'Huobi') {
        clearInterval(window.boardHandle13)
        tickers.huobiBtcTickerDisplay(global.boardThirteenTicker[0], global.boardThirteenTicker[1], board13, global.boardThirteenTicker[3], 'production')
        window.boardHandle13 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up13.innerHTML = time
          tickers.huobiBtcTickerDisplay(global.boardThirteenTicker[0], global.boardThirteenTicker[1], board13, global.boardThirteenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardThirteenTicker[2] === 'Kraken') {
        clearInterval(window.boardHandle13)
        tickers.krakenTickerDisplay(global.boardThirteenTicker[0], global.boardThirteenTicker[1], board13, global.boardThirteenTicker[3], 'production')
        window.boardHandle13 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up13.innerHTML = time
          tickers.krakenTickerDisplay(global.boardThirteenTicker[0], global.boardThirteenTicker[1], board13, global.boardThirteenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardThirteenTicker[2] === 'Paymium') {
        clearInterval(window.boardHandle13)
        tickers.paymiumTickerDisplay(global.boardThirteenTicker[0], board13, global.boardThirteenTicker[0], 'production')
        window.boardHandle13 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up13.innerHTML = time
          tickers.paymiumTickerDisplay(global.boardThirteenTicker[0], board13, global.boardThirteenTicker[0], 'production')
        }, 25000)
      }
      if (global.boardThirteenTicker[2] === 'TDAX') {
        clearInterval(window.boardHandle13)
        tickers.tdaxTickerDisplay(global.boardThirteenTicker[0], global.boardThirteenTicker[1], board13, global.boardThirteenTicker[3], 'production')
        window.boardHandle13 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up13.innerHTML = time
          tickers.tdaxTickerDisplay(global.boardThirteenTicker[0], global.boardThirteenTicker[1], board13, global.boardThirteenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardThirteenTicker[2] === 'VCC Exchange') {
        clearInterval(window.boardHandle13)
        tickers.vccTickerDisplay(global.boardThirteenTicker[0], global.boardThirteenTicker[1], board13, global.boardThirteenTicker[3], 'production')
        window.boardHandle13 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up13.innerHTML = time
          tickers.vccTickerDisplay(global.boardThirteenTicker[0], global.boardThirteenTicker[1], board13, global.boardThirteenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardFourteenTicker[2] === 'Binance') {
        clearInterval(window.boardHandle14)
        tickers.binanceTickerDisplay(global.boardFourteenTicker[0], global.boardFourteenTicker[1], board14, global.boardFourteenTicker[3], 'production')
        window.boardHandle14 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up14.innerHTML = time
          tickers.binanceTickerDisplay(global.boardFourteenTicker[0], global.boardFourteenTicker[1], board14, global.boardFourteenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardFourteenTicker[2] === 'Gemini') {
        clearInterval(window.boardHandle14)
        tickers.geminiTickerDisplay(global.boardFourteenTicker[0], global.boardFourteenTicker[1], board14, global.boardFourteenTicker[3], 'production')
        window.boardHandle14 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up14.innerHTML = time
          tickers.geminiTickerDisplay(global.boardFourteenTicker[0], global.boardFourteenTicker[1], board14, global.boardFourteenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardFourteenTicker[2] === 'OKEx') {
        clearInterval(window.boardHandle14)
        tickers.okexTickerDisplay(global.boardFourteenTicker[0], global.boardFourteenTicker[1], board14, global.boardFourteenTicker[3], 'production')
        window.boardHandle14 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up14.innerHTML = time
          tickers.okexTickerDisplay(global.boardFourteenTicker[0], global.boardFourteenTicker[1], board14, global.boardFourteenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardFourteenTicker[2] === 'Binance Futures') {
        clearInterval(window.boardHandle14)
        tickers.binanceFuturesTickerDisplay(global.boardFourteenTicker[0], global.boardFourteenTicker[1], board14, global.boardFourteenTicker[3], 'production')
        window.boardHandle14 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up14.innerHTML = time
          tickers.binanceFuturesTickerDisplay(global.boardFourteenTicker[0], global.boardFourteenTicker[1], board14, global.boardFourteenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardFourteenTicker[2] === 'KuCoin') {
        clearInterval(window.boardHandle14)
        tickers.kucoinTickerDisplay(global.boardFourteenTicker[0], global.boardFourteenTicker[1], board14, global.boardFourteenTicker[3], 'production')
        window.boardHandle14 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up14.innerHTML = time
          tickers.kucoinTickerDisplay(global.boardFourteenTicker[0], global.boardFourteenTicker[1], board14, global.boardFourteenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardFourteenTicker[2] === 'Poloniex') {
        clearInterval(window.boardHandle14)
        tickers.poloniexTickerDisplay(global.boardFourteenTicker[0], global.boardFourteenTicker[1], board14, global.boardFourteenTicker[3], 'production')
        window.boardHandle14 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up14.innerHTML = time
          tickers.poloniexTickerDisplay(global.boardFourteenTicker[0], global.boardFourteenTicker[1], board14, global.boardFourteenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardFourteenTicker[2] === 'BTC Markets') {
        clearInterval(window.boardHandle14)
        tickers.btcMarketsTickerDisplay(global.boardFourteenTicker[0], global.boardFourteenTicker[1], board14, global.boardFourteenTicker[3], 'production')
        window.boardHandle14 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up14.innerHTML = time
          tickers.btcMarketsTickerDisplay(global.boardFourteenTicker[0], global.boardFourteenTicker[1], board14, global.boardFourteenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardFourteenTicker[2] === 'BitMEX') {
        clearInterval(window.boardHandle14)
        tickers.bitmexTickerDisplay(global.boardFourteenTicker[0], global.boardFourteenTicker[1], board14, global.boardFourteenTicker[3], 'production')
        window.boardHandle14 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up14.innerHTML = time
          tickers.bitmexTickerDisplay(global.boardFourteenTicker[0], global.boardFourteenTicker[1], board14, global.boardFourteenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardFourteenTicker[2] === 'BitPay') {
        clearInterval(window.boardHandle14)
        tickers.bitpayTickerDisplay(global.boardFourteenTicker[0], global.boardFourteenTicker[1], board14, global.boardFourteenTicker[3], 'production')
        window.boardHandle14 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up14.innerHTML = time
          tickers.bitpayTickerDisplay(global.boardFourteenTicker[0], global.boardFourteenTicker[1], board14, global.boardFourteenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardFourteenTicker[2] === 'Bitfinex') {
        clearInterval(window.boardHandle14)
        tickers.bitfinexTickerDisplay(global.boardFourteenTicker[0], global.boardFourteenTicker[1], board14, global.boardFourteenTicker[3], 'production')
        window.boardHandle14 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up14.innerHTML = time
          tickers.bitfinexTickerDisplay(global.boardFourteenTicker[0], global.boardFourteenTicker[1], board14, global.boardFourteenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardFourteenTicker[2] === 'Bitso') {
        clearInterval(window.boardHandle14)
        tickers.bitsoTickerDisplay(global.boardFourteenTicker[0], global.boardFourteenTicker[1], board14, global.boardFourteenTicker[3], 'production')
        window.boardHandle14 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up14.innerHTML = time
          tickers.bitsoTickerDisplay(global.boardFourteenTicker[0], global.boardFourteenTicker[1], board14, global.boardFourteenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardFourteenTicker[2] === 'Bitstamp') {
        clearInterval(window.boardHandle14)
        tickers.bitstampTickerDisplay(global.boardFourteenTicker[0], global.boardFourteenTicker[1], board14, global.boardFourteenTicker[3], 'production')
        window.boardHandle14 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up14.innerHTML = time
          tickers.bitstampTickerDisplay(global.boardFourteenTicker[0], global.boardFourteenTicker[1], board14, global.boardFourteenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardFourteenTicker[2] === 'CEX.IO') {
        clearInterval(window.boardHandle14)
        tickers.cextradeTickerDisplay(global.boardFourteenTicker[0], global.boardFourteenTicker[1], board14, global.boardFourteenTicker[3], 'production')
        window.boardHandle14 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up14.innerHTML = time
          tickers.cextradeTickerDisplay(global.boardFourteenTicker[0], global.boardFourteenTicker[1], board14, global.boardFourteenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardFourteenTicker[2] === 'CoinGecko') {
        clearInterval(window.boardHandle14)
        tickers.coingeckoTickerDisplay(global.boardFourteenTicker[0], global.boardFourteenTicker[1], board14, global.boardFourteenTicker[3], 'production')
        window.boardHandle14 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up14.innerHTML = time
          tickers.coingeckoTickerDisplay(global.boardFourteenTicker[0], global.boardFourteenTicker[1], board14, global.boardFourteenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardFourteenTicker[2] === 'Coinbase') {
        clearInterval(window.boardHandle14)
        tickers.coingeckoTickerDisplay(global.boardFourteenTicker[0], global.boardFourteenTicker[1], board14, global.boardFourteenTicker[3], 'production')
        window.boardHandle14 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up14.innerHTML = time
          tickers.coinbaseTickerDisplay(global.boardFourteenTicker[0], global.boardFourteenTicker[1], board14, global.boardFourteenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardFourteenTicker[2] === 'CryptoCompare') {
        clearInterval(window.boardHandle14)
        tickers.cryptoCompareTickerDisplay(global.boardFourteenTicker[0], global.boardFourteenTicker[1], board14, global.boardFourteenTicker[3], 'production')
        window.boardHandle14 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up14.innerHTML = time
          tickers.cryptoCompareTickerDisplay(global.boardFourteenTicker[0], global.boardFourteenTicker[1], board14, global.boardFourteenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardFourteenTicker[2] === 'FTX') {
        clearInterval(window.boardHandle14)
        tickers.ftxTickerDisplay(global.boardFourteenTicker[0], global.boardFourteenTicker[1], board14, global.boardFourteenTicker[3], 'production')
        window.boardHandle14 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up14.innerHTML = time
          tickers.ftxTickerDisplay(global.boardFourteenTicker[0], global.boardFourteenTicker[1], board14, global.boardFourteenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardFourteenTicker[2] === 'HitBTC') {
        clearInterval(window.boardHandle14)
        tickers.hitBtcTickerDisplay(global.boardFourteenTicker[0], global.boardFourteenTicker[1], board14, global.boardFourteenTicker[3], 'production')
        window.boardHandle14 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up14.innerHTML = time
          tickers.hitBtcTickerDisplay(global.boardFourteenTicker[0], global.boardFourteenTicker[1], board14, global.boardFourteenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardFourteenTicker[2] === 'Huobi') {
        clearInterval(window.boardHandle14)
        tickers.huobiBtcTickerDisplay(global.boardFourteenTicker[0], global.boardFourteenTicker[1], board14, global.boardFourteenTicker[3], 'production')
        window.boardHandle14 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up14.innerHTML = time
          tickers.huobiBtcTickerDisplay(global.boardFourteenTicker[0], global.boardFourteenTicker[1], board14, global.boardFourteenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardFourteenTicker[2] === 'Kraken') {
        clearInterval(window.boardHandle14)
        tickers.huobiBtcTickerDisplay(global.boardFourteenTicker[0], global.boardFourteenTicker[1], board14, global.boardFourteenTicker[3], 'production')
        window.boardHandle14 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up14.innerHTML = time
          tickers.krakenTickerDisplay(global.boardFourteenTicker[0], global.boardFourteenTicker[1], board14, global.boardFourteenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardFourteenTicker[2] === 'Paymium') {
        clearInterval(window.boardHandle14)
        tickers.paymiumTickerDisplay(global.boardFourteenTicker[0], board14, global.boardFourteenTicker[0], 'production')
        window.boardHandle14 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up14.innerHTML = time
          tickers.paymiumTickerDisplay(global.boardFourteenTicker[0], board14, global.boardFourteenTicker[0], 'production')
        }, 25000)
      }
      if (global.boardFourteenTicker[2] === 'TDAX') {
        clearInterval(window.boardHandle14)
        tickers.tdaxTickerDisplay(global.boardFourteenTicker[0], global.boardFourteenTicker[1], board14, global.boardFourteenTicker[3], 'production')
        window.boardHandle14 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up14.innerHTML = time
          tickers.tdaxTickerDisplay(global.boardFourteenTicker[0], global.boardFourteenTicker[1], board14, global.boardFourteenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardFourteenTicker[2] === 'VCC Exchange') {
        clearInterval(window.boardHandle14)
        tickers.vccTickerDisplay(global.boardFourteenTicker[0], global.boardFourteenTicker[1], board14, global.boardFourteenTicker[3], 'production')
        window.boardHandle14 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up14.innerHTML = time
          tickers.vccTickerDisplay(global.boardFourteenTicker[0], global.boardFourteenTicker[1], board14, global.boardFourteenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardFifteenTicker[2] === 'Binance') {
        clearInterval(window.boardHandle15)
        tickers.binanceTickerDisplay(global.boardFifteenTicker[0], global.boardFifteenTicker[1], board15, global.boardFifteenTicker[3], 'production')
        window.boardHandle15 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up15.innerHTML = time
          tickers.binanceTickerDisplay(global.boardFifteenTicker[0], global.boardFifteenTicker[1], board15, global.boardFifteenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardFifteenTicker[2] === 'Gemini') {
        clearInterval(window.boardHandle15)
        tickers.geminiTickerDisplay(global.boardFifteenTicker[0], global.boardFifteenTicker[1], board15, global.boardFifteenTicker[3], 'production')
        window.boardHandle15 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up15.innerHTML = time
          tickers.geminiTickerDisplay(global.boardFifteenTicker[0], global.boardFifteenTicker[1], board15, global.boardFifteenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardFifteenTicker[2] === 'OKEx') {
        clearInterval(window.boardHandle15)
        tickers.okexTickerDisplay(global.boardFifteenTicker[0], global.boardFifteenTicker[1], board15, global.boardFifteenTicker[3], 'production')
        window.boardHandle15 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up15.innerHTML = time
          tickers.okexTickerDisplay(global.boardFifteenTicker[0], global.boardFifteenTicker[1], board15, global.boardFifteenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardFifteenTicker[2] === 'Binance Futures') {
        clearInterval(window.boardHandle15)
        tickers.binanceFuturesTickerDisplay(global.boardFifteenTicker[0], global.boardFifteenTicker[1], board15, global.boardFifteenTicker[3], 'production')
        window.boardHandle15 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up15.innerHTML = time
          tickers.binanceFuturesTickerDisplay(global.boardFifteenTicker[0], global.boardFifteenTicker[1], board15, global.boardFifteenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardFifteenTicker[2] === 'KuCoin') {
        clearInterval(window.boardHandle15)
        tickers.kucoinTickerDisplay(global.boardFifteenTicker[0], global.boardFifteenTicker[1], board15, global.boardFifteenTicker[3], 'production')
        window.boardHandle15 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up15.innerHTML = time
          tickers.kucoinTickerDisplay(global.boardFifteenTicker[0], global.boardFifteenTicker[1], board15, global.boardFifteenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardFifteenTicker[2] === 'Poloniex') {
        clearInterval(window.boardHandle15)
        tickers.poloniexTickerDisplay(global.boardFifteenTicker[0], global.boardFifteenTicker[1], board15, global.boardFifteenTicker[3], 'production')
        window.boardHandle15 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up15.innerHTML = time
          tickers.poloniexTickerDisplay(global.boardFifteenTicker[0], global.boardFifteenTicker[1], board15, global.boardFifteenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardFifteenTicker[2] === 'BTC Markets') {
        clearInterval(window.boardHandle15)
        tickers.btcMarketsTickerDisplay(global.boardFifteenTicker[0], global.boardFifteenTicker[1], board15, global.boardFifteenTicker[3], 'production')
        window.boardHandle15 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up15.innerHTML = time
          tickers.btcMarketsTickerDisplay(global.boardFifteenTicker[0], global.boardFifteenTicker[1], board15, global.boardFifteenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardFifteenTicker[2] === 'BitMEX') {
        clearInterval(window.boardHandle15)
        tickers.bitmexTickerDisplay(global.boardFifteenTicker[0], global.boardFifteenTicker[1], board15, global.boardFifteenTicker[3], 'production')
        window.boardHandle15 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up15.innerHTML = time
          tickers.bitmexTickerDisplay(global.boardFifteenTicker[0], global.boardFifteenTicker[1], board15, global.boardFifteenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardFifteenTicker[2] === 'BitPay') {
        clearInterval(window.boardHandle15)
        tickers.bitpayTickerDisplay(global.boardFifteenTicker[0], global.boardFifteenTicker[1], board15, global.boardFifteenTicker[3], 'production')
        window.boardHandle15 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up15.innerHTML = time
          tickers.bitpayTickerDisplay(global.boardFifteenTicker[0], global.boardFifteenTicker[1], board15, global.boardFifteenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardFifteenTicker[2] === 'Bitfinex') {
        clearInterval(window.boardHandle15)
        tickers.bitfinexTickerDisplay(global.boardFifteenTicker[0], global.boardFifteenTicker[1], board15, global.boardFifteenTicker[3], 'production')
        window.boardHandle15 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up15.innerHTML = time
          tickers.bitfinexTickerDisplay(global.boardFifteenTicker[0], global.boardFifteenTicker[1], board15, global.boardFifteenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardFifteenTicker[2] === 'Bitso') {
        clearInterval(window.boardHandle15)
        tickers.bitsoTickerDisplay(global.boardFifteenTicker[0], global.boardFifteenTicker[1], board15, global.boardFifteenTicker[3], 'production')
        window.boardHandle15 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up15.innerHTML = time
          tickers.bitsoTickerDisplay(global.boardFifteenTicker[0], global.boardFifteenTicker[1], board15, global.boardFifteenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardFifteenTicker[2] === 'Bitstamp') {
        clearInterval(window.boardHandle15)
        tickers.bitstampTickerDisplay(global.boardFifteenTicker[0], global.boardFifteenTicker[1], board15, global.boardFifteenTicker[3], 'production')
        window.boardHandle15 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up15.innerHTML = time
          tickers.bitstampTickerDisplay(global.boardFifteenTicker[0], global.boardFifteenTicker[1], board15, global.boardFifteenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardFifteenTicker[2] === 'CEX.IO') {
        clearInterval(window.boardHandle15)
        tickers.cextradeTickerDisplay(global.boardFifteenTicker[0], global.boardFifteenTicker[1], board15, global.boardFifteenTicker[3], 'production')
        window.boardHandle15 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up15.innerHTML = time
          tickers.cextradeTickerDisplay(global.boardFifteenTicker[0], global.boardFifteenTicker[1], board15, global.boardFifteenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardFifteenTicker[2] === 'CoinGecko') {
        clearInterval(window.boardHandle15)
        tickers.coingeckoTickerDisplay(global.boardFifteenTicker[0], global.boardFifteenTicker[1], board15, global.boardFifteenTicker[3], 'production')
        window.boardHandle15 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up15.innerHTML = time
          tickers.coingeckoTickerDisplay(global.boardFifteenTicker[0], global.boardFifteenTicker[1], board15, global.boardFifteenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardFifteenTicker[2] === 'Coinbase') {
        clearInterval(window.boardHandle15)
        tickers.coinbaseTickerDisplay(global.boardFifteenTicker[0], global.boardFifteenTicker[1], board15, global.boardFifteenTicker[3], 'production')
        window.boardHandle15 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up15.innerHTML = time
          tickers.coinbaseTickerDisplay(global.boardFifteenTicker[0], global.boardFifteenTicker[1], board15, global.boardFifteenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardFifteenTicker[2] === 'CryptoCompare') {
        clearInterval(window.boardHandle15)
        tickers.cryptoCompareTickerDisplay(global.boardFifteenTicker[0], global.boardFifteenTicker[1], board15, global.boardFifteenTicker[3], 'production')
        window.boardHandle15 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up15.innerHTML = time
          tickers.cryptoCompareTickerDisplay(global.boardFifteenTicker[0], global.boardFifteenTicker[1], board15, global.boardFifteenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardFifteenTicker[2] === 'FTX') {
        clearInterval(window.boardHandle15)
        tickers.ftxTickerDisplay(global.boardFifteenTicker[0], global.boardFifteenTicker[1], board15, global.boardFifteenTicker[3], 'production')
        window.boardHandle15 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up15.innerHTML = time
          tickers.ftxTickerDisplay(global.boardFifteenTicker[0], global.boardFifteenTicker[1], board15, global.boardFifteenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardFifteenTicker[2] === 'HitBTC') {
        clearInterval(window.boardHandle15)
        tickers.hitBtcTickerDisplay(global.boardFifteenTicker[0], global.boardFifteenTicker[1], board15, global.boardFifteenTicker[3], 'production')
        window.boardHandle15 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up15.innerHTML = time
          tickers.hitBtcTickerDisplay(global.boardFifteenTicker[0], global.boardFifteenTicker[1], board15, global.boardFifteenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardFifteenTicker[2] === 'Huobi') {
        clearInterval(window.boardHandle15)
        tickers.huobiBtcTickerDisplay(global.boardFifteenTicker[0], global.boardFifteenTicker[1], board15, global.boardFifteenTicker[3], 'production')
        window.boardHandle15 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up15.innerHTML = time
          tickers.huobiBtcTickerDisplay(global.boardFifteenTicker[0], global.boardFifteenTicker[1], board15, global.boardFifteenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardFifteenTicker[2] === 'Kraken') {
        clearInterval(window.boardHandle15)
        tickers.krakenTickerDisplay(global.boardFifteenTicker[0], global.boardFifteenTicker[1], board15, global.boardFifteenTicker[3], 'production')
        window.boardHandle15 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up15.innerHTML = time
          tickers.krakenTickerDisplay(global.boardFifteenTicker[0], global.boardFifteenTicker[1], board15, global.boardFifteenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardFifteenTicker[2] === 'Paymium') {
        clearInterval(window.boardHandle15)
        tickers.paymiumTickerDisplay(global.boardFifteenTicker[0], board15, global.boardFifteenTicker[0], 'production')
        window.boardHandle15 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up15.innerHTML = time
          tickers.paymiumTickerDisplay(global.boardFifteenTicker[0], board15, global.boardFifteenTicker[0], 'production')
        }, 25000)
      }
      if (global.boardFifteenTicker[2] === 'TDAX') {
        clearInterval(window.boardHandle15)
        tickers.tdaxTickerDisplay(global.boardFifteenTicker[0], global.boardFifteenTicker[1], board15, global.boardFifteenTicker[3], 'production')
        window.boardHandle15 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up15.innerHTML = time
          tickers.tdaxTickerDisplay(global.boardFifteenTicker[0], global.boardFifteenTicker[1], board15, global.boardFifteenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardFifteenTicker[2] === 'VCC Exchange') {
        clearInterval(window.boardHandle15)
        tickers.vccTickerDisplay(global.boardFifteenTicker[0], global.boardFifteenTicker[1], board15, global.boardFifteenTicker[3], 'production')
        window.boardHandle15 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up15.innerHTML = time
          tickers.vccTickerDisplay(global.boardFifteenTicker[0], global.boardFifteenTicker[1], board15, global.boardFifteenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardSixteenTicker[2] === 'Binance') {
        clearInterval(window.boardHandle16)
        tickers.binanceTickerDisplay(global.boardSixteenTicker[0], global.boardSixteenTicker[1], board16, global.boardSixteenTicker[3], 'production')
        window.boardHandle16 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up16.innerHTML = time
          tickers.binanceTickerDisplay(global.boardSixteenTicker[0], global.boardSixteenTicker[1], board16, global.boardSixteenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardSixteenTicker[2] === 'Gemini') {
        clearInterval(window.boardHandle16)
        tickers.geminiTickerDisplay(global.boardSixteenTicker[0], global.boardSixteenTicker[1], board16, global.boardSixteenTicker[3], 'production')
        window.boardHandle16 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up16.innerHTML = time
          tickers.geminiTickerDisplay(global.boardSixteenTicker[0], global.boardSixteenTicker[1], board16, global.boardSixteenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardSixteenTicker[2] === 'OKEx') {
        clearInterval(window.boardHandle16)
        tickers.okexTickerDisplay(global.boardSixteenTicker[0], global.boardSixteenTicker[1], board16, global.boardSixteenTicker[3], 'production')
        window.boardHandle16 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up16.innerHTML = time
          tickers.okexTickerDisplay(global.boardSixteenTicker[0], global.boardSixteenTicker[1], board16, global.boardSixteenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardSixteenTicker[2] === 'Binance Futures') {
        clearInterval(window.boardHandle16)
        tickers.binanceFuturesTickerDisplay(global.boardSixteenTicker[0], global.boardSixteenTicker[1], board16, global.boardSixteenTicker[3], 'production')
        window.boardHandle16 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up16.innerHTML = time
          tickers.binanceFuturesTickerDisplay(global.boardSixteenTicker[0], global.boardSixteenTicker[1], board16, global.boardSixteenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardSixteenTicker[2] === 'KuCoin') {
        clearInterval(window.boardHandle16)
        tickers.kucoinTickerDisplay(global.boardSixteenTicker[0], global.boardSixteenTicker[1], board16, global.boardSixteenTicker[3], 'production')
        window.boardHandle16 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up16.innerHTML = time
          tickers.kucoinTickerDisplay(global.boardSixteenTicker[0], global.boardSixteenTicker[1], board16, global.boardSixteenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardSixteenTicker[2] === 'Poloniex') {
        clearInterval(window.boardHandle16)
        tickers.poloniexTickerDisplay(global.boardSixteenTicker[0], global.boardSixteenTicker[1], board16, global.boardSixteenTicker[3], 'production')
        window.boardHandle16 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up16.innerHTML = time
          tickers.poloniexTickerDisplay(global.boardSixteenTicker[0], global.boardSixteenTicker[1], board16, global.boardSixteenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardSixteenTicker[2] === 'BTC Markets') {
        clearInterval(window.boardHandle16)
        tickers.btcMarketsTickerDisplay(global.boardSixteenTicker[0], global.boardSixteenTicker[1], board16, global.boardSixteenTicker[3], 'production')
        window.boardHandle16 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up16.innerHTML = time
          tickers.btcMarketsTickerDisplay(global.boardSixteenTicker[0], global.boardSixteenTicker[1], board16, global.boardSixteenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardSixteenTicker[2] === 'BitMEX') {
        clearInterval(window.boardHandle16)
        tickers.bitmexTickerDisplay(global.boardSixteenTicker[0], global.boardSixteenTicker[1], board16, global.boardSixteenTicker[3], 'production')
        window.boardHandle16 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up16.innerHTML = time
          tickers.bitmexTickerDisplay(global.boardSixteenTicker[0], global.boardSixteenTicker[1], board16, global.boardSixteenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardSixteenTicker[2] === 'BitPay') {
        clearInterval(window.boardHandle16)
        tickers.bitpayTickerDisplay(global.boardSixteenTicker[0], global.boardSixteenTicker[1], board16, global.boardSixteenTicker[3], 'production')
        window.boardHandle16 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up16.innerHTML = time
          tickers.bitpayTickerDisplay(global.boardSixteenTicker[0], global.boardSixteenTicker[1], board16, global.boardSixteenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardSixteenTicker[2] === 'Bitfinex') {
        clearInterval(window.boardHandle16)
        tickers.bitfinexTickerDisplay(global.boardSixteenTicker[0], global.boardSixteenTicker[1], board16, global.boardSixteenTicker[3], 'production')
        window.boardHandle16 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up16.innerHTML = time
          tickers.bitfinexTickerDisplay(global.boardSixteenTicker[0], global.boardSixteenTicker[1], board16, global.boardSixteenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardSixteenTicker[2] === 'Bitso') {
        clearInterval(window.boardHandle16)
        tickers.bitsoTickerDisplay(global.boardSixteenTicker[0], global.boardSixteenTicker[1], board16, global.boardSixteenTicker[3], 'production')
        window.boardHandle16 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up16.innerHTML = time
          tickers.bitsoTickerDisplay(global.boardSixteenTicker[0], global.boardSixteenTicker[1], board16, global.boardSixteenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardSixteenTicker[2] === 'Bitstamp') {
        clearInterval(window.boardHandle16)
        tickers.bitstampTickerDisplay(global.boardSixteenTicker[0], global.boardSixteenTicker[1], board16, global.boardSixteenTicker[3], 'production')
        window.boardHandle16 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up16.innerHTML = time
          tickers.bitstampTickerDisplay(global.boardSixteenTicker[0], global.boardSixteenTicker[1], board16, global.boardSixteenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardSixteenTicker[2] === 'CEX.IO') {
        clearInterval(window.boardHandle16)
        tickers.cextradeTickerDisplay(global.boardSixteenTicker[0], global.boardSixteenTicker[1], board16, global.boardSixteenTicker[3], 'production')
        window.boardHandle16 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up16.innerHTML = time
          tickers.cextradeTickerDisplay(global.boardSixteenTicker[0], global.boardSixteenTicker[1], board16, global.boardSixteenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardSixteenTicker[2] === 'CoinGecko') {
        clearInterval(window.boardHandle16)
        tickers.coingeckoTickerDisplay(global.boardSixteenTicker[0], global.boardSixteenTicker[1], board16, global.boardSixteenTicker[3], 'production')
        window.boardHandle16 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up16.innerHTML = time
          tickers.coingeckoTickerDisplay(global.boardSixteenTicker[0], global.boardSixteenTicker[1], board16, global.boardSixteenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardSixteenTicker[2] === 'Coinbase') {
        clearInterval(window.boardHandle16)
        tickers.coinbaseTickerDisplay(global.boardSixteenTicker[0], global.boardSixteenTicker[1], board16, global.boardSixteenTicker[3], 'production')
        window.boardHandle16 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up16.innerHTML = time
          tickers.coinbaseTickerDisplay(global.boardSixteenTicker[0], global.boardSixteenTicker[1], board16, global.boardSixteenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardSixteenTicker[2] === 'CryptoCompare') {
        clearInterval(window.boardHandle16)
        tickers.cryptoCompareTickerDisplay(global.boardSixteenTicker[0], global.boardSixteenTicker[1], board16, global.boardSixteenTicker[3], 'production')
        window.boardHandle16 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up16.innerHTML = time
          tickers.cryptoCompareTickerDisplay(global.boardSixteenTicker[0], global.boardSixteenTicker[1], board16, global.boardSixteenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardSixteenTicker[2] === 'FTX') {
        clearInterval(window.boardHandle16)
        tickers.ftxTickerDisplay(global.boardSixteenTicker[0], global.boardSixteenTicker[1], board16, global.boardSixteenTicker[3], 'production')
        window.boardHandle16 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up16.innerHTML = time
          tickers.ftxTickerDisplay(global.boardSixteenTicker[0], global.boardSixteenTicker[1], board16, global.boardSixteenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardSixteenTicker[2] === 'HitBTC') {
        clearInterval(window.boardHandle16)
        tickers.hitBtcTickerDisplay(global.boardSixteenTicker[0], global.boardSixteenTicker[1], board16, global.boardSixteenTicker[3], 'production')
        window.boardHandle16 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up16.innerHTML = time
          tickers.hitBtcTickerDisplay(global.boardSixteenTicker[0], global.boardSixteenTicker[1], board16, global.boardSixteenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardSixteenTicker[2] === 'Huobi') {
        clearInterval(window.boardHandle16)
        tickers.huobiBtcTickerDisplay(global.boardSixteenTicker[0], global.boardSixteenTicker[1], board16, global.boardSixteenTicker[3], 'production')
        window.boardHandle16 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up16.innerHTML = time
          tickers.huobiBtcTickerDisplay(global.boardSixteenTicker[0], global.boardSixteenTicker[1], board16, global.boardSixteenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardSixteenTicker[2] === 'Kraken') {
        clearInterval(window.boardHandle16)
        tickers.krakenTickerDisplay(global.boardSixteenTicker[0], global.boardSixteenTicker[1], board16, global.boardSixteenTicker[3], 'production')
        window.boardHandle16 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up16.innerHTML = time
          tickers.krakenTickerDisplay(global.boardSixteenTicker[0], global.boardSixteenTicker[1], board16, global.boardSixteenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardSixteenTicker[2] === 'Paymium') {
        clearInterval(window.boardHandle16)
        tickers.paymiumTickerDisplay(global.boardSixteenTicker[0], board16, global.boardSixteenTicker[0], 'production')
        window.boardHandle16 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up16.innerHTML = time
          tickers.paymiumTickerDisplay(global.boardSixteenTicker[0], board16, global.boardSixteenTicker[0], 'production')
        }, 25000)
      }
      if (global.boardSixteenTicker[2] === 'TDAX') {
        clearInterval(window.boardHandle16)
        tickers.tdaxTickerDisplay(global.boardSixteenTicker[0], global.boardSixteenTicker[1], board16, global.boardSixteenTicker[3], 'production')
        window.boardHandle16 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up16.innerHTML = time
          tickers.tdaxTickerDisplay(global.boardSixteenTicker[0], global.boardSixteenTicker[1], board16, global.boardSixteenTicker[3], 'production')
        }, 25000)
      }
      if (global.boardSixteenTicker[2] === 'VCC Exchange') {
        clearInterval(window.boardHandle16)
        tickers.vccTickerDisplay(global.boardSixteenTicker[0], global.boardSixteenTicker[1], board16, global.boardSixteenTicker[3], 'production')
        window.boardHandle16 = setInterval(function () {
          const currentDate = formatTime(new Date())
          const time = lang.echo('Updated: ') + currentDate
          up16.innerHTML = time
          tickers.vccTickerDisplay(global.boardSixteenTicker[0], global.boardSixteenTicker[1], board16, global.boardSixteenTicker[3], 'production')
        }, 25000)
      }
    }
  },
  testBoardTicker: function (boardNumber, market, ticker1, ticker2, fixed) {
    var board = global.mainWindow.window.document.getElementById('board' + boardNumber)
    if ((ticker1).replace(/ /g, '') === '') {
      tickers.appDialogWindow('{"window": "Empty ticker", "title": "Empty ticker", "message": "Please, set the value for the first ticker!"}')
    }
    if ((ticker2).replace(/ /g, '') === '') {
      if (market === 'bitmex') {
      } else {
        tickers.appDialogWindow('{"window": "Empty ticker", "title": "Empty ticker", "message": "Please, set the value for the second ticker!"}')
      }
    }
    if (fixed === '') {
      tickers.appDialogWindow('{"window": "Empty number", "title": "Empty number", "message": "Please, set the number!"}')
    }
    if (market === 'binance') {
      tickers.binanceTickerDisplay(ticker1, ticker2, board, fixed, 'test')
    }
    if (market === 'okex') {
      tickers.okexTickerDisplay(ticker1, ticker2, board, fixed, 'test')
    }
    if (market === 'gemini') {
      tickers.geminiTickerDisplay(ticker1, ticker2, board, fixed, 'test')
    }
    if (market === 'binanceFutures') {
      tickers.binanceFuturesTickerDisplay(ticker1, ticker2, board, fixed, 'test')
    }
    if (market === 'kucoin') {
      tickers.kucoinTickerDisplay(ticker1, ticker2, board, fixed, 'test')
    }
    if (market === 'poloniex') {
      tickers.poloniexTickerDisplay(ticker1, ticker2, board, fixed, 'test')
    }
    if (market === 'btcmarkets') {
      tickers.btcMarketsTickerDisplay(ticker1, ticker2, board, fixed, 'test')
    }
    if (market === 'bitmex') {
      tickers.bitmexTickerDisplay(ticker1, ticker2, board, fixed, 'test')
    }
    if (market === 'bitpay') {
      tickers.bitpayTickerDisplay(ticker1, ticker2, board, fixed, 'test')
    }
    if (market === 'bitfinex') {
      tickers.bitfinexTickerDisplay(ticker1, ticker2, board, fixed, 'test')
    }
    if (market === 'bitso') {
      tickers.bitsoTickerDisplay(ticker1, ticker2, board, fixed, 'test')
    }
    if (market === 'bitstamp') {
      tickers.bitstampTickerDisplay(ticker1, ticker2, board, fixed, 'test')
    }
    if (market === 'cex') {
      tickers.cextradeTickerDisplay(ticker1, ticker2, board, fixed, 'test')
    }
    if (market === 'coingecko') {
      tickers.coingeckoTickerDisplay(ticker1, ticker2, board, fixed, 'test')
    }
    if (market === 'coinbase') {
      tickers.coinbaseTickerDisplay(ticker1, ticker2, board, fixed, 'test')
    }
    if (market === 'cryptocompare') {
      tickers.cryptoCompareTickerDisplay(ticker1, ticker2, board, fixed, 'test')
    }
    if (market === 'ftx') {
      tickers.ftxTickerDisplay(ticker1, ticker2, board, fixed, 'test')
    }
    if (market === 'hitbtc') {
      tickers.hitBtcTickerDisplay(ticker1, ticker2, board, fixed, 'test')
    }
    if (market === 'huobi') {
      tickers.huobiBtcTickerDisplay(ticker1, ticker2, board, fixed, 'test')
    }
    if (market === 'kraken') {
      tickers.krakenTickerDisplay(ticker1, ticker2, board, fixed, 'test')
    }
    if (market === 'paymium') {
      tickers.paymiumTickerDisplay(ticker1, board, fixed, 'test')
    }
    if (market === 'tdax') {
      tickers.tdaxTickerDisplay(ticker1, ticker2, board, fixed, 'test')
    }
    if (market === 'vcc') {
      tickers.vccTickerDisplay(ticker1, ticker2, board, fixed, 'test')
    }
  },
  changeBoardTicker: function (boardNumber, market, ticker1, ticker2, fixed, sourceName, name) {
    if ((name).replace(/ /g, '') === '') {
      const currency = coins.find(coin => coin.symbol === ticker1.toLowerCase())
      name = currency.name
    }
    var board = global.mainWindow.window.document.getElementById('board' + boardNumber)
    var imageBoard = global.mainWindow.window.document.getElementById('iboard' + boardNumber)
    var titleBoard = global.mainWindow.window.document.getElementById('nboard' + boardNumber)
    var sourceBoard = global.mainWindow.window.document.getElementById('sboard' + boardNumber)
    var tickerBoard = global.mainWindow.window.document.getElementById('tboard' + boardNumber)
    var updBoard = global.mainWindow.window.document.getElementById('up' + boardNumber)
    const currentDate = formatTime(new Date())
    const time = lang.echo('Updated: ') + currentDate
    if ((ticker1).replace(/ /g, '') === '') {
      tickers.appDialogWindow('{"window": "Empty ticker", "title": "Empty ticker", "message": "Please, set the value for the first ticker!"}')
    }
    if ((ticker2).replace(/ /g, '') === '') {
      if (market === 'bitmex') {
      } else {
        tickers.appDialogWindow('{"window": "Empty ticker", "title": "Empty ticker", "message": "Please, set the value for the second ticker!"}')
      }
    }
    if (fixed === '') {
      tickers.appDialogWindow('{"window": "Empty number", "title": "Empty number", "message": "Please, set the number!"}')
    }
    if (market === 'binance') {
      titleBoard.innerHTML = name
      sourceBoard.innerHTML = sourceName
      updBoard.innerHTML = time
      tickerBoard.innerHTML = ticker1 + '/' + ticker2
      imageBoard.src = (imageBoard.src).substring(0, (imageBoard.src).lastIndexOf('/') + 1) + (ticker1).toLowerCase() + '.png'
      tickers.binanceTickerDisplay(ticker1, ticker2, board, fixed, 'production')
      clearInterval(window['boardHandle' + boardNumber])
      window['boardHandle' + boardNumber] = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        updBoard.innerHTML = time
        tickers.binanceTickerDisplay(ticker1, ticker2, board, fixed, 'production')
      }, 25000)
    }
    if (market === 'okex') {
      titleBoard.innerHTML = name
      sourceBoard.innerHTML = sourceName
      updBoard.innerHTML = time
      tickerBoard.innerHTML = ticker1 + '/' + ticker2
      imageBoard.src = (imageBoard.src).substring(0, (imageBoard.src).lastIndexOf('/') + 1) + (ticker1).toLowerCase() + '.png'
      tickers.okexTickerDisplay(ticker1, ticker2, board, fixed, 'production')
      clearInterval(window['boardHandle' + boardNumber])
      window['boardHandle' + boardNumber] = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        updBoard.innerHTML = time
        tickers.okexTickerDisplay(ticker1, ticker2, board, fixed, 'production')
      }, 25000)
    }
    if (market === 'gemini') {
      titleBoard.innerHTML = name
      sourceBoard.innerHTML = sourceName
      updBoard.innerHTML = time
      tickerBoard.innerHTML = ticker1 + '/' + ticker2
      imageBoard.src = (imageBoard.src).substring(0, (imageBoard.src).lastIndexOf('/') + 1) + (ticker1).toLowerCase() + '.png'
      tickers.geminiTickerDisplay(ticker1, ticker2, board, fixed, 'production')
      clearInterval(window['boardHandle' + boardNumber])
      window['boardHandle' + boardNumber] = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        updBoard.innerHTML = time
        tickers.geminiTickerDisplay(ticker1, ticker2, board, fixed, 'production')
      }, 25000)
    }
    if (market === 'binanceFutures') {
      titleBoard.innerHTML = name
      sourceBoard.innerHTML = sourceName
      updBoard.innerHTML = time
      tickerBoard.innerHTML = ticker1 + '/' + ticker2
      imageBoard.src = (imageBoard.src).substring(0, (imageBoard.src).lastIndexOf('/') + 1) + (ticker1).toLowerCase() + '.png'
      tickers.binanceFuturesTickerDisplay(ticker1, ticker2, board, fixed, 'production')
      clearInterval(window['boardHandle' + boardNumber])
      window['boardHandle' + boardNumber] = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        updBoard.innerHTML = time
        tickers.binanceFuturesTickerDisplay(ticker1, ticker2, board, fixed, 'production')
      }, 25000)
    }
    if (market === 'kucoin') {
      titleBoard.innerHTML = name
      sourceBoard.innerHTML = sourceName
      updBoard.innerHTML = time
      tickerBoard.innerHTML = ticker1 + '/' + ticker2
      imageBoard.src = (imageBoard.src).substring(0, (imageBoard.src).lastIndexOf('/') + 1) + (ticker1).toLowerCase() + '.png'
      tickers.kucoinTickerDisplay(ticker1, ticker2, board, fixed, 'production')
      clearInterval(window['boardHandle' + boardNumber])
      window['boardHandle' + boardNumber] = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        updBoard.innerHTML = time
        tickers.kucoinTickerDisplay(ticker1, ticker2, board, fixed, 'production')
      }, 25000)
    }
    if (market === 'poloniex') {
      titleBoard.innerHTML = name
      sourceBoard.innerHTML = sourceName
      updBoard.innerHTML = time
      tickerBoard.innerHTML = ticker1 + '/' + ticker2
      imageBoard.src = (imageBoard.src).substring(0, (imageBoard.src).lastIndexOf('/') + 1) + (ticker1).toLowerCase() + '.png'
      tickers.poloniexTickerDisplay(ticker1, ticker2, board, fixed, 'production')
      clearInterval(window['boardHandle' + boardNumber])
      window['boardHandle' + boardNumber] = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        updBoard.innerHTML = time
        tickers.poloniexTickerDisplay(ticker1, ticker2, board, fixed, 'production')
      }, 25000)
    }
    if (market === 'btcmarkets') {
      titleBoard.innerHTML = name
      sourceBoard.innerHTML = sourceName
      updBoard.innerHTML = time
      tickerBoard.innerHTML = ticker1 + '/' + ticker2
      imageBoard.src = (imageBoard.src).substring(0, (imageBoard.src).lastIndexOf('/') + 1) + (ticker1).toLowerCase() + '.png'
      tickers.btcMarketsTickerDisplay(ticker1, ticker2, board, fixed, 'production')
      clearInterval(window['boardHandle' + boardNumber])
      window['boardHandle' + boardNumber] = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        updBoard.innerHTML = time
        tickers.btcMarketsTickerDisplay(ticker1, ticker2, board, fixed, 'production')
      }, 25000)
    }
    if (market === 'bitmex') {
      titleBoard.innerHTML = name
      sourceBoard.innerHTML = sourceName
      updBoard.innerHTML = time
      tickerBoard.innerHTML = ticker1 + '/' + ticker2
      imageBoard.src = (imageBoard.src).substring(0, (imageBoard.src).lastIndexOf('/') + 1) + (ticker1).toLowerCase() + '.png'
      tickers.bitmexTickerDisplay(ticker1, ticker2, board, fixed, 'production')
      clearInterval(window['boardHandle' + boardNumber])
      window['boardHandle' + boardNumber] = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        updBoard.innerHTML = time
        tickers.bitmexTickerDisplay(ticker1, ticker2, board, fixed, 'production')
      }, 25000)
    }
    if (market === 'bitpay') {
      titleBoard.innerHTML = name
      sourceBoard.innerHTML = sourceName
      updBoard.innerHTML = time
      tickerBoard.innerHTML = ticker1 + '/' + ticker2
      imageBoard.src = (imageBoard.src).substring(0, (imageBoard.src).lastIndexOf('/') + 1) + (ticker1).toLowerCase() + '.png'
      tickers.bitpayTickerDisplay(ticker1, ticker2, board, fixed, 'production')
      clearInterval(window['boardHandle' + boardNumber])
      window['boardHandle' + boardNumber] = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        updBoard.innerHTML = time
        tickers.bitpayTickerDisplay(ticker1, ticker2, board, fixed, 'production')
      }, 25000)
    }
    if (market === 'bitfinex') {
      titleBoard.innerHTML = name
      sourceBoard.innerHTML = sourceName
      updBoard.innerHTML = time
      tickerBoard.innerHTML = ticker1 + '/' + ticker2
      imageBoard.src = (imageBoard.src).substring(0, (imageBoard.src).lastIndexOf('/') + 1) + (ticker1).toLowerCase() + '.png'
      tickers.bitfinexTickerDisplay(ticker1, ticker2, board, fixed, 'production')
      clearInterval(window['boardHandle' + boardNumber])
      window['boardHandle' + boardNumber] = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        updBoard.innerHTML = time
        tickers.bitfinexTickerDisplay(ticker1, ticker2, board, fixed, 'production')
      }, 25000)
    }
    if (market === 'bitso') {
      titleBoard.innerHTML = name
      sourceBoard.innerHTML = sourceName
      updBoard.innerHTML = time
      tickerBoard.innerHTML = ticker1 + '/' + ticker2
      imageBoard.src = (imageBoard.src).substring(0, (imageBoard.src).lastIndexOf('/') + 1) + (ticker1).toLowerCase() + '.png'
      tickers.bitsoTickerDisplay(ticker1, ticker2, board, fixed, 'production')
      clearInterval(window['boardHandle' + boardNumber])
      window['boardHandle' + boardNumber] = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        updBoard.innerHTML = time
        tickers.bitsoTickerDisplay(ticker1, ticker2, board, fixed, 'production')
      }, 25000)
    }
    if (market === 'bitstamp') {
      titleBoard.innerHTML = name
      sourceBoard.innerHTML = sourceName
      updBoard.innerHTML = time
      tickerBoard.innerHTML = ticker1 + '/' + ticker2
      imageBoard.src = (imageBoard.src).substring(0, (imageBoard.src).lastIndexOf('/') + 1) + (ticker1).toLowerCase() + '.png'
      clearInterval(window['boardHandle' + boardNumber])
      window['boardHandle' + boardNumber] = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        updBoard.innerHTML = time
        tickers.bitstampTickerDisplay(ticker1, ticker2, board, fixed, 'production')
      }, 25000)
    }
    if (market === 'cex') {
      titleBoard.innerHTML = name
      sourceBoard.innerHTML = sourceName
      updBoard.innerHTML = time
      tickerBoard.innerHTML = ticker1 + '/' + ticker2
      imageBoard.src = (imageBoard.src).substring(0, (imageBoard.src).lastIndexOf('/') + 1) + (ticker1).toLowerCase() + '.png'
      tickers.cextradeTickerDisplay(ticker1, ticker2, board, fixed, 'production')
      clearInterval(window['boardHandle' + boardNumber])
      window['boardHandle' + boardNumber] = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        updBoard.innerHTML = time
        tickers.cextradeTickerDisplay(ticker1, ticker2, board, fixed, 'production')
      }, 25000)
    }
    if (market === 'coingecko') {
      titleBoard.innerHTML = name
      sourceBoard.innerHTML = sourceName
      updBoard.innerHTML = time
      tickerBoard.innerHTML = ticker1 + '/' + ticker2
      imageBoard.src = (imageBoard.src).substring(0, (imageBoard.src).lastIndexOf('/') + 1) + (ticker1).toLowerCase() + '.png'
      tickers.coingeckoTickerDisplay(ticker1, ticker2, board, fixed, 'production')
      clearInterval(window['boardHandle' + boardNumber])
      window['boardHandle' + boardNumber] = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        updBoard.innerHTML = time
        tickers.coingeckoTickerDisplay(ticker1, ticker2, board, fixed, 'production')
      }, 25000)
    }
    if (market === 'coinbase') {
      titleBoard.innerHTML = name
      sourceBoard.innerHTML = sourceName
      updBoard.innerHTML = time
      tickerBoard.innerHTML = ticker1 + '/' + ticker2
      imageBoard.src = (imageBoard.src).substring(0, (imageBoard.src).lastIndexOf('/') + 1) + (ticker1).toLowerCase() + '.png'
      tickers.coinbaseTickerDisplay(ticker1, ticker2, board, fixed, 'production')
      clearInterval(window['boardHandle' + boardNumber])
      window['boardHandle' + boardNumber] = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        updBoard.innerHTML = time
        tickers.coinbaseTickerDisplay(ticker1, ticker2, board, fixed, 'production')
      }, 25000)
    }
    if (market === 'cryptocompare') {
      titleBoard.innerHTML = name
      sourceBoard.innerHTML = sourceName
      updBoard.innerHTML = time
      tickerBoard.innerHTML = ticker1 + '/' + ticker2
      imageBoard.src = (imageBoard.src).substring(0, (imageBoard.src).lastIndexOf('/') + 1) + (ticker1).toLowerCase() + '.png'
      tickers.cryptoCompareTickerDisplay(ticker1, ticker2, board, fixed, 'production')
      clearInterval(window['boardHandle' + boardNumber])
      window['boardHandle' + boardNumber] = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        updBoard.innerHTML = time
        tickers.cryptoCompareTickerDisplay(ticker1, ticker2, board, fixed, 'production')
      }, 25000)
    }
    if (market === 'ftx') {
      titleBoard.innerHTML = name
      sourceBoard.innerHTML = sourceName
      updBoard.innerHTML = time
      tickerBoard.innerHTML = ticker1 + '/' + ticker2
      imageBoard.src = (imageBoard.src).substring(0, (imageBoard.src).lastIndexOf('/') + 1) + (ticker1).toLowerCase() + '.png'
      tickers.ftxTickerDisplay(ticker1, ticker2, board, fixed, 'production')
      clearInterval(window['boardHandle' + boardNumber])
      window['boardHandle' + boardNumber] = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        updBoard.innerHTML = time
        tickers.ftxTickerDisplay(ticker1, ticker2, board, fixed, 'production')
      }, 25000)
    }
    if (market === 'hitbtc') {
      titleBoard.innerHTML = name
      sourceBoard.innerHTML = sourceName
      updBoard.innerHTML = time
      tickerBoard.innerHTML = ticker1 + '/' + ticker2
      imageBoard.src = (imageBoard.src).substring(0, (imageBoard.src).lastIndexOf('/') + 1) + (ticker1).toLowerCase() + '.png'
      tickers.hitBtcTickerDisplay(ticker1, ticker2, board, fixed, 'production')
      clearInterval(window['boardHandle' + boardNumber])
      window['boardHandle' + boardNumber] = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        updBoard.innerHTML = time
        tickers.hitBtcTickerDisplay(ticker1, ticker2, board, fixed, 'production')
      }, 25000)
    }
    if (market === 'huobi') {
      titleBoard.innerHTML = name
      sourceBoard.innerHTML = sourceName
      updBoard.innerHTML = time
      tickerBoard.innerHTML = ticker1 + '/' + ticker2
      imageBoard.src = (imageBoard.src).substring(0, (imageBoard.src).lastIndexOf('/') + 1) + (ticker1).toLowerCase() + '.png'
      tickers.huobiBtcTickerDisplay(ticker1, ticker2, board, fixed, 'production')
      clearInterval(window['boardHandle' + boardNumber])
      window['boardHandle' + boardNumber] = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        updBoard.innerHTML = time
        tickers.huobiBtcTickerDisplay(ticker1, ticker2, board, fixed, 'production')
      }, 25000)
    }
    if (market === 'kraken') {
      titleBoard.innerHTML = name
      sourceBoard.innerHTML = sourceName
      updBoard.innerHTML = time
      tickerBoard.innerHTML = ticker1 + '/' + ticker2
      imageBoard.src = (imageBoard.src).substring(0, (imageBoard.src).lastIndexOf('/') + 1) + (ticker1).toLowerCase() + '.png'
      tickers.krakenTickerDisplay(ticker1, ticker2, board, fixed, 'production')
      clearInterval(window['boardHandle' + boardNumber])
      window['boardHandle' + boardNumber] = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        updBoard.innerHTML = time
        tickers.krakenTickerDisplay(ticker1, ticker2, board, fixed, 'production')
      }, 25000)
    }
    if (market === 'paymium') {
      titleBoard.innerHTML = name
      sourceBoard.innerHTML = sourceName
      updBoard.innerHTML = time
      tickerBoard.innerHTML = ticker1 + '/' + ticker2
      imageBoard.src = (imageBoard.src).substring(0, (imageBoard.src).lastIndexOf('/') + 1) + (ticker1).toLowerCase() + '.png'
      tickers.paymiumTickerDisplay(ticker1, board, fixed, 'production')
      clearInterval(window['boardHandle' + boardNumber])
      window['boardHandle' + boardNumber] = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        updBoard.innerHTML = time
        tickers.paymiumTickerDisplay(ticker1, board, fixed, 'production')
      }, 25000)
    }
    if (market === 'tdax') {
      titleBoard.innerHTML = name
      sourceBoard.innerHTML = sourceName
      updBoard.innerHTML = time
      tickerBoard.innerHTML = ticker1 + '/' + ticker2
      imageBoard.src = (imageBoard.src).substring(0, (imageBoard.src).lastIndexOf('/') + 1) + (ticker1).toLowerCase() + '.png'
      tickers.tdaxTickerDisplay(ticker1, ticker2, board, fixed, 'production')
      clearInterval(window['boardHandle' + boardNumber])
      window['boardHandle' + boardNumber] = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        updBoard.innerHTML = time
        tickers.tdaxTickerDisplay(ticker1, ticker2, board, fixed, 'production')
      }, 25000)
    }
    if (market === 'vcc') {
      titleBoard.innerHTML = name
      sourceBoard.innerHTML = sourceName
      updBoard.innerHTML = time
      tickerBoard.innerHTML = ticker1 + '/' + ticker2
      imageBoard.src = (imageBoard.src).substring(0, (imageBoard.src).lastIndexOf('/') + 1) + (ticker1).toLowerCase() + '.png'
      tickers.vccTickerDisplay(ticker1, ticker2, board, fixed, 'production')
      clearInterval(window['boardHandle' + boardNumber])
      window['boardHandle' + boardNumber] = setInterval(function () {
        const currentDate = formatTime(new Date())
        const time = lang.echo('Updated: ') + currentDate
        updBoard.innerHTML = time
        tickers.vccTickerDisplay(ticker1, ticker2, board, fixed, 'production')
      }, 25000)
    }
    if (Number(boardNumber) === 1) {
      settings.board1_ticker = ticker1 + ',' + ticker2 + ',' + sourceName + ',' + fixed + ',' + name + ',' + time
    }
    if (Number(boardNumber) === 2) {
      settings.board2_ticker = ticker1 + ',' + ticker2 + ',' + sourceName + ',' + fixed + ',' + name + ',' + time
    }
    if (Number(boardNumber) === 3) {
      settings.board3_ticker = ticker1 + ',' + ticker2 + ',' + sourceName + ',' + fixed + ',' + name + ',' + time
    }
    if (Number(boardNumber) === 4) {
      settings.board4_ticker = ticker1 + ',' + ticker2 + ',' + sourceName + ',' + fixed + ',' + name + ',' + time
    }
    if (Number(boardNumber) === 5) {
      settings.board5_ticker = ticker1 + ',' + ticker2 + ',' + sourceName + ',' + fixed + ',' + name + ',' + time
    }
    if (Number(boardNumber) === 6) {
      settings.board6_ticker = ticker1 + ',' + ticker2 + ',' + sourceName + ',' + fixed + ',' + name + ',' + time
    }
    if (Number(boardNumber) === 7) {
      settings.board7_ticker = ticker1 + ',' + ticker2 + ',' + sourceName + ',' + fixed + ',' + name + ',' + time
    }
    if (Number(boardNumber) === 8) {
      settings.board8_ticker = ticker1 + ',' + ticker2 + ',' + sourceName + ',' + fixed + ',' + name + ',' + time
    }
    if (Number(boardNumber) === 9) {
      settings.board9_ticker = ticker1 + ',' + ticker2 + ',' + sourceName + ',' + fixed + ',' + name + ',' + time
    }
    if (Number(boardNumber) === 10) {
      settings.board10_ticker = ticker1 + ',' + ticker2 + ',' + sourceName + ',' + fixed + ',' + name + ',' + time
    }
    if (Number(boardNumber) === 11) {
      settings.board11_ticker = ticker1 + ',' + ticker2 + ',' + sourceName + ',' + fixed + ',' + name + ',' + time
    }
    if (Number(boardNumber) === 12) {
      settings.board12_ticker = ticker1 + ',' + ticker2 + ',' + sourceName + ',' + fixed + ',' + name + ',' + time
    }
    if (Number(boardNumber) === 13) {
      settings.board13_ticker = ticker1 + ',' + ticker2 + ',' + sourceName + ',' + fixed + ',' + name + ',' + time
    }
    if (Number(boardNumber) === 14) {
      settings.board14_ticker = ticker1 + ',' + ticker2 + ',' + sourceName + ',' + fixed + ',' + name + ',' + time
    }
    if (Number(boardNumber) === 15) {
      settings.board15_ticker = ticker1 + ',' + ticker2 + ',' + sourceName + ',' + fixed + ',' + name + ',' + time
    }
    if (Number(boardNumber) === 16) {
      settings.board16_ticker = ticker1 + ',' + ticker2 + ',' + sourceName + ',' + fixed + ',' + name + ',' + time
    }
    fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
  },
  supportedTickers: async function (market) {
    if (market === 'binance') {
      tickers.binanceAllTickers().then((tickers) => {
        appDialogWindowCode('{"window": "Binance ' + lang.echo('Supported Tickers') + '", "title": "Binance ' + lang.echo('Supported Tickers') + '", "message": "' + tickers + '"' + ', "messageTwo": "' + lang.echo('Type') + ' ETHUSDT ' + lang.echo('as') + ' ETH (' + lang.echo('ticker') + ' #1) ' + lang.echo('and') + ' USDT (' + lang.echo('ticker') + ' #2) ' + lang.echo('in the form') + '"}')
      })
    }
    if (market === 'okex') {
      tickers.okexAllTickers().then((tickers) => {
        appDialogWindowCode('{"window": "OKEx ' + lang.echo('Supported Tickers') + '", "title": "OKEx ' + lang.echo('Supported Tickers') + '", "message": "' + tickers + '"' + ', "messageTwo": "' + lang.echo('Type') + ' BTC-USDT ' + lang.echo('as') + ' BTC (' + lang.echo('ticker') + ' #1) ' + lang.echo('and') + ' USDT (' + lang.echo('ticker') + ' #2) ' + lang.echo('in the form') + '"}')
      })
    }
    if (market === 'gemini') {
      tickers.geminiAllTickers().then((tickers) => {
        appDialogWindowCode('{"window": "Gemini ' + lang.echo('Supported Tickers') + '", "title": "Gemini ' + lang.echo('Supported Tickers') + '", "message": "' + tickers + '"' + ', "messageTwo": "' + lang.echo('Type') + ' btcusd ' + lang.echo('as') + ' BTC (' + lang.echo('ticker') + ' #1) ' + lang.echo('and') + ' USD (' + lang.echo('ticker') + ' #2) ' + lang.echo('in the form') + '"}')
      })
    }
    if (market === 'binanceFutures') {
      tickers.binanceFuturesAllTickers().then((tickers) => {
        appDialogWindowCode('{"window": "Binance Futures ' + lang.echo('Supported Tickers') + '", "title": "Binance Futures ' + lang.echo('Supported Tickers') + '", "message": "' + tickers + '"' + ', "messageTwo": "' + lang.echo('Type') + ' btcusd ' + lang.echo('as') + ' BTC (' + lang.echo('ticker') + ' #1) ' + lang.echo('and') + ' USD (' + lang.echo('ticker') + ' #2) ' + lang.echo('in the form') + '"}')
      })
    }
    if (market === 'kucoin') {
      tickers.kucoinAllTickers().then((tickers) => {
        appDialogWindowCode('{"window": "KuCoin ' + lang.echo('Supported Tickers') + '", "title": "KuCoin ' + lang.echo('Supported Tickers') + '", "message": "' + tickers + '"' + ', "messageTwo": "' + lang.echo('Type') + ' SHA-USDT ' + lang.echo('as') + ' SHA (' + lang.echo('ticker') + ' #1) ' + lang.echo('and') + ' USDT (' + lang.echo('ticker') + ' #2) ' + lang.echo('in the form') + '"}')
      })
    }
    if (market === 'poloniex') {
      tickers.poloniexAllTickers().then((tickers) => {
        appDialogWindowCode('{"window": "Poloniex ' + lang.echo('Supported Tickers') + '", "title": "Poloniex ' + lang.echo('Supported Tickers') + '", "message": "' + tickers + '"' + ', "messageTwo": "' + lang.echo('Type') + ' BTC_DASH ' + lang.echo('as') + ' DASH (' + lang.echo('ticker') + ' #1) ' + lang.echo('and') + ' BTC (' + lang.echo('ticker') + ' #2) ' + lang.echo('and') + ' ' + lang.echo('increase float to 6 or more from the default 2 (only useful when value is lower than 0.00)') + '"}')
      })
    }
    if (market === 'btcmarkets') {
      tickers.btcMarketsAllTickers().then((tickers) => {
        appDialogWindowCode('{"window": "BTC Markets ' + lang.echo('Supported Tickers') + '", "title": "BTC Markets ' + lang.echo('Supported Tickers') + '", "message": "' + tickers + '"' + ', "messageTwo": "' + lang.echo('Type') + ' USDTAUD ' + lang.echo('as') + ' USDT (' + lang.echo('ticker') + ' #1) ' + lang.echo('and') + ' AUD (' + lang.echo('ticker') + ' #2) ' + lang.echo('in the form') + '"}')
      })
    }
    if (market === 'bitmex') {
      tickers.bitmexAllTickers().then((tickers) => {
        appDialogWindowCode('{"window": "BitMEX ' + lang.echo('Supported Tickers') + '", "title": "BitMEX ' + lang.echo('Supported Tickers') + '", "message": "' + tickers + '"' + ', "messageTwo": "' + lang.echo('Type') + ' XBTZ14 ' + lang.echo('as') + ' XBTZ14 (' + lang.echo('ticker') + ' #1) ' + lang.echo('in the form') + '"}')
      })
    }
    if (market === 'bitpay') {
      tickers.bitpayAllTickers().then((tickers) => {
        appDialogWindowCode('{"window": "BitPay ' + lang.echo('Supported Tickers') + '", "title": "BitPay ' + lang.echo('Supported Tickers') + '", "message": "' + tickers + '"' + ', "messageTwo": "' + lang.echo('Use cryptocurrency for the ticker') + ' #1 ' + lang.echo('and') + lang.echo(' fiat currency ') + lang.echo('as') + ' ' + lang.echo('ticker') + ' #2 ' + lang.echo('from the available list') + '"}')
      })
    }
    if (market === 'bitfinex') {
      tickers.bitfinexAllTickers().then((tickers) => {
        appDialogWindowCode('{"window": "Bitfinex ' + lang.echo('Supported Tickers') + '", "title": "Bitfinex ' + lang.echo('Supported Tickers') + '", "message": "' + tickers + '"' + ', "messageTwo": "' + lang.echo('Type') + ' btcusd ' + lang.echo('as') + ' BTC (' + lang.echo('ticker') + ' #1) ' + lang.echo('and') + ' USD (' + lang.echo('ticker') + ' #2) ' + lang.echo('in the form') + '"}')
      })
    }
    if (market === 'bitso') {
      tickers.bitsoAllTickers().then((tickers) => {
        appDialogWindowCode('{"window": "Bitso ' + lang.echo('Supported Tickers') + '", "title": "Bitso ' + lang.echo('Supported Tickers') + '", "message": "' + tickers + '"' + ', "messageTwo": "' + lang.echo('Type') + ' btc_mxn ' + lang.echo('as') + ' BTC (' + lang.echo('ticker') + ' #1) ' + lang.echo('and') + ' MXN (' + lang.echo('ticker') + ' #2) ' + lang.echo('in the form') + '"}')
      })
    }
    if (market === 'bitstamp') {
      tickers.bitstampAllTickers().then((tickers) => {
        appDialogWindowCode('{"window": "Bitstamp ' + lang.echo('Supported Tickers') + '", "title": "Bitstamp ' + lang.echo('Supported Tickers') + '", "message": "' + tickers + '"' + ', "messageTwo": "' + lang.echo('Type') + ' btcusd ' + lang.echo('as') + ' BTC (' + lang.echo('ticker') + ' #1) ' + lang.echo('and') + ' USD (' + lang.echo('ticker') + ' #2) ' + lang.echo('in the form') + lang.echo('. Sometimes Bitstamp only working using CORS proxy enabled in the settings.') + '"}')
      })
    }
    if (market === 'cex') {
      tickers.cexAllTickers().then((tickers) => {
        appDialogWindowCode('{"window": "CEX.IO ' + lang.echo('Supported Tickers') + '", "title": "CEX.IO ' + lang.echo('Supported Tickers') + '", "message": "' + tickers + '"' + ', "messageTwo": "' + lang.echo('Type') + ' BTCUSD ' + lang.echo('as') + ' BTC (' + lang.echo('ticker') + ' #1) ' + lang.echo('and') + ' USD (' + lang.echo('ticker') + ' #2) ' + lang.echo('in the form') + '."}')
      })
    }
    if (market === 'coingecko') {
      tickers.coingeckoAllTickers().then((tickers) => {
        appDialogWindowCodeCoinGecko('{"window": "CoinGecko ' + lang.echo('Supported Tickers') + '", "title": "CoinGecko ' + lang.echo('Supported Tickers') + '", "message": "' + tickers + '"' + ', "messageTwo": "' + lang.echo('Type') + ' supported ticker into (' + lang.echo('ticker') + ' #1) ' + lang.echo('and') + ' target into (' + lang.echo('ticker') + ' #2). ' + lang.echo('You could check ticker for the supported targets right there.') + '"}')
      })
    }
    if (market === 'coinbase') {
      tickers.coinbaseAllTickers().then((tickers) => {
        appDialogWindowCode('{"window": "Coinbase ' + lang.echo('Supported Tickers') + '", "title": "Coinbase ' + lang.echo('Supported Tickers') + '", "message": "' + tickers + '"' + ', "messageTwo": "' + lang.echo('Type') + ' ETC-EUR ' + lang.echo('as') + ' ETH (' + lang.echo('ticker') + ' #1) ' + lang.echo('and') + ' EUR (' + lang.echo('ticker') + ' #2) ' + lang.echo('in the form') + '."}')
      })
    }
    if (market === 'cryptocompare') {
      tickers.cryptoCompareAllTickers().then((tickers) => {
        appDialogWindowCode('{"window": "CryptoCompare ' + lang.echo('Supported Tickers') + '", "title": "CryptoCompare ' + lang.echo('Supported Tickers') + '", "message": "' + tickers + '"' + ', "messageTwo": "' + lang.echo('You could mix any ticker') + ' #1 ' + lang.echo('with') + ' ' + lang.echo('ticker') + ' #2, ' + lang.echo('just consider you might need to increase default float of 2') + '"}')
      })
    }
    if (market === 'ftx') {
      tickers.ftxAllTickers().then((tickers) => {
        appDialogWindowCode('{"window": "FTX ' + lang.echo('Supported Tickers') + '", "title": "FTX ' + lang.echo('Supported Tickers') + '", "message": "' + tickers + '"' + ', "messageTwo": "' + lang.echo('Type') + ' 1INCH-PERP ' + lang.echo('as') + ' 1INCH (' + lang.echo('ticker') + ' #1) ' + lang.echo('and') + ' PERP (' + lang.echo('ticker') + ' #2) ' + lang.echo('in the form') + '."}')
      })
    }
    if (market === 'hitbtc') {
      tickers.hitBtcAllTickers().then((tickers) => {
        appDialogWindowCode('{"window": "FTX ' + lang.echo('Supported Tickers') + '", "title": "FTX ' + lang.echo('Supported Tickers') + '", "message": "' + tickers + '"' + ', "messageTwo": "' + lang.echo('Type') + ' BCHBTC ' + lang.echo('as') + ' BCH (' + lang.echo('ticker') + ' #1) ' + lang.echo('and') + ' BTC (' + lang.echo('ticker') + ' #2) ' + lang.echo('in the form') + '."}')
      })
    }
    if (market === 'huobi') {
      tickers.huobiAllTickers().then((tickers) => {
        appDialogWindowCode('{"window": "Huobi ' + lang.echo('Supported Tickers') + '", "title": "Huobi ' + lang.echo('Supported Tickers') + '", "message": "' + tickers + '"' + ', "messageTwo": "' + lang.echo('Type') + ' cmteth ' + lang.echo('as') + ' CMT (' + lang.echo('ticker') + ' #1) ' + lang.echo('and') + ' ETH (' + lang.echo('ticker') + ' #2) ' + lang.echo('in the form') + '."}')
      })
    }
    if (market === 'kraken') {
      tickers.krakeAllTickers().then((tickers) => {
        appDialogWindowCode('{"window": "Kraken ' + lang.echo('Supported Tickers') + '", "title": "Kraken ' + lang.echo('Supported Tickers') + '", "message": "' + tickers + '"' + ', "messageTwo": "' + lang.echo('Type') + ' AAVEAUD ' + lang.echo('as') + ' AAVE (' + lang.echo('ticker') + ' #1) ' + lang.echo('and') + ' AUD (' + lang.echo('ticker') + ' #2) ' + lang.echo('in the form') + '."}')
      })
    }
    if (market === 'paymium') {
      appDialogWindowCode('{"window": "Paymium ' + lang.echo('Supported Tickers') + '", "title": "Paymium ' + lang.echo('Supported Tickers') + '", "message": "' + 'EURBTC' + '"' + ', "messageTwo": "' + lang.echo('Type') + ' EURBTC ' + lang.echo('as') + ' EUR (' + lang.echo('ticker') + ' #1) ' + lang.echo('and') + ' BTC (' + lang.echo('ticker') + ' #2) ' + lang.echo('in the form') + '."}')
    }
    if (market === 'tdax') {
      tickers.tdaxAllTickers().then((tickers) => {
        appDialogWindowCode('{"window": "TDAX ' + lang.echo('Supported Tickers') + '", "title": "TDAX ' + lang.echo('Supported Tickers') + '", "message": "' + tickers + '"' + ', "messageTwo": "' + lang.echo('Type') + ' btc_thb ' + lang.echo('as') + ' BTC (' + lang.echo('ticker') + ' #1) ' + lang.echo('and') + ' THB (' + lang.echo('ticker') + ' #2) ' + lang.echo('in the form') + '."}')
      })
    }
    if (market === 'vcc') {
      tickers.vccAllTickers().then((tickers) => {
        appDialogWindowCode('{"window": "VCC ' + lang.echo('Supported Tickers') + '", "title": "VCC ' + lang.echo('Supported Tickers') + '", "message": "' + tickers + '"' + ', "messageTwo": "' + lang.echo('Type') + ' ETH_BTC ' + lang.echo('as') + ' ETH (' + lang.echo('ticker') + ' #1) ' + lang.echo('and') + ' BTC (' + lang.echo('ticker') + ' #2) ' + lang.echo('in the form') + '."}')
      })
    }
  },
  setBoardAlarm: function (time) {
    sleep(time).then(() => {
      var board1 = global.mainWindow.window.document.getElementById('board1')
      var board2 = global.mainWindow.window.document.getElementById('board2')
      var board3 = global.mainWindow.window.document.getElementById('board3')
      var board4 = global.mainWindow.window.document.getElementById('board4')
      var board5 = global.mainWindow.window.document.getElementById('board5')
      var board6 = global.mainWindow.window.document.getElementById('board6')
      var board7 = global.mainWindow.window.document.getElementById('board7')
      var board8 = global.mainWindow.window.document.getElementById('board8')
      var board9 = global.mainWindow.window.document.getElementById('board9')
      var board10 = global.mainWindow.window.document.getElementById('board10')
      var board11 = global.mainWindow.window.document.getElementById('board11')
      var board12 = global.mainWindow.window.document.getElementById('board12')
      var board13 = global.mainWindow.window.document.getElementById('board13')
      var board14 = global.mainWindow.window.document.getElementById('board14')
      var board15 = global.mainWindow.window.document.getElementById('board15')
      var board16 = global.mainWindow.window.document.getElementById('board16')
      if (global.boardOneAlarm[2] === 'enable') {
        if (global.boardOneAlarm[1] === 'more') {
          clearInterval(window.boardAlert1)
          window.boardAlert1 = setInterval(function () {
            if (Number(board1.innerHTML) > Number(global.boardOneAlarm[0])) {
              // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
              var Sound = { // eslint-disable-line
                audio: null,
                play: function (path) {
                  this.audio = new Audio(path) // eslint-disable-line
                  if (this.audio !== null) this.audio.pause()
                  this.audio.play()
                }
              }
              Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
              var options = { // eslint-disable-line
                icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                body: lang.echo('Ticker\'s value higher than ') + global.boardOneAlarm[0] + ' (' + lang.echo('board #') + '1)'
              }
              sendTelegramMessage(options.body)
              new Notification(board1.innerHTML, options) // eslint-disable-line
              clearInterval(window.boardAlert1)
              settings.board1_alarm = global.boardOneAlarm[0] + ',' + global.boardOneAlarm[1] + ',' + 'disable' + ','
              fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
            }
          }, 5000)
        }
        if (global.boardOneAlarm[1] === 'moreEqual') {
          clearInterval(window.boardAlert1)
          window.boardAlert1 = setInterval(function () {
            if (Number(board1.innerHTML) >= Number(global.boardOneAlarm[0])) {
              // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
              var Sound = { // eslint-disable-line
                audio: null,
                play: function (path) {
                  this.audio = new Audio(path) // eslint-disable-line
                  if (this.audio !== null) this.audio.pause()
                  this.audio.play()
                }
              }
              Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
              var options = { // eslint-disable-line
                icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                body: lang.echo('Ticker\'s value higher or equal to ') + global.boardOneAlarm[0] + ' (' + lang.echo('board #') + '1)'
              }
              sendTelegramMessage(options.body)
              new Notification(board1.innerHTML, options) // eslint-disable-line
              clearInterval(window.boardAlert1)
              settings.board1_alarm = global.boardOneAlarm[0] + ',' + global.boardOneAlarm[1] + ',' + 'disable' + ','
              fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
            }
          }, 5000)
        }
        if (global.boardOneAlarm[1] === 'equal') {
          clearInterval(window.boardAlert1)
          window.boardAlert1 = setInterval(function () {
            if (Number(board1.innerHTML) === Number(global.boardOneAlarm[0])) {
              // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
              var Sound = { // eslint-disable-line
                audio: null,
                play: function (path) {
                  this.audio = new Audio(path) // eslint-disable-line
                  if (this.audio !== null) this.audio.pause()
                  this.audio.play()
                }
              }
              Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
              var options = { // eslint-disable-line
                icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                body: lang.echo('Ticker\'s value equal to ') + global.boardOneAlarm[0] + ' (' + lang.echo('board #') + '1)'
              }
              sendTelegramMessage(options.body)
              new Notification(board1.innerHTML, options) // eslint-disable-line
              clearInterval(window.boardAlert1)
              settings.board1_alarm = global.boardOneAlarm[0] + ',' + global.boardOneAlarm[1] + ',' + 'disable' + ','
              fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
            }
          }, 5000)
        }
        if (global.boardOneAlarm[1] === 'less') {
          clearInterval(window.boardAlert1)
          window.boardAlert1 = setInterval(function () {
            if (Number(board1.innerHTML) < Number(global.boardOneAlarm[0])) {
              // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
              var Sound = { // eslint-disable-line
                audio: null,
                play: function (path) {
                  this.audio = new Audio(path) // eslint-disable-line
                  if (this.audio !== null) this.audio.pause()
                  this.audio.play()
                }
              }
              Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
              var options = { // eslint-disable-line
                icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                body: lang.echo('Ticker\'s value less than ') + global.boardOneAlarm[0] + ' (' + lang.echo('board #') + '1)'
              }
              sendTelegramMessage(options.body)
              new Notification(board1.innerHTML, options) // eslint-disable-line
              clearInterval(window.boardAlert1)
              settings.board1_alarm = global.boardOneAlarm[0] + ',' + global.boardOneAlarm[1] + ',' + 'disable' + ','
              fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
            }
          }, 5000)
        }
        if (global.boardOneAlarm[1] === 'lessEqual') {
          clearInterval(window.boardAlert1)
          window.boardAlert1 = setInterval(function () {
            if (Number(board1.innerHTML) <= Number(global.boardOneAlarm[0])) {
              // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
              var Sound = { // eslint-disable-line
                audio: null,
                play: function (path) {
                  this.audio = new Audio(path) // eslint-disable-line
                  if (this.audio !== null) this.audio.pause()
                  this.audio.play()
                }
              }
              Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
              var options = { // eslint-disable-line
                icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                body: lang.echo('Ticker\'s value less or equal to ') + global.boardOneAlarm[0] + ' (' + lang.echo('board #') + '1)'
              }
              sendTelegramMessage(options.body)
              new Notification(board1.innerHTML, options) // eslint-disable-line
              clearInterval(window.boardAlert1)
              settings.board1_alarm = global.boardOneAlarm[0] + ',' + global.boardOneAlarm[1] + ',' + 'disable' + ','
              fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
            }
          }, 5000)
        }
        if (global.boardOneAlarm[1] === 'date') {
          clearInterval(window.boardAlert1)
          window.boardAlert1 = setInterval(function () {
            const setDate = new Date(global.boardOneAlarm[3])
            if (setDate.getTime() <= new Date().getTime()) {
              // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
              var Sound = { // eslint-disable-line
                audio: null,
                play: function (path) {
                  this.audio = new Audio(path) // eslint-disable-line
                  if (this.audio !== null) this.audio.pause()
                  this.audio.play()
                }
              }
              Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
              var options = { // eslint-disable-line
                icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                body: lang.echo('Ticker\'s value ') + board1.innerHTML + ' (' + lang.echo('board #') + '1)'
              }
              sendTelegramMessage(options.body)
              new Notification(new Date(), options) // eslint-disable-line
              clearInterval(window.boardAlert1)
              settings.board1_alarm = global.boardOneAlarm[0] + ',' + global.boardOneAlarm[1] + ',' + 'disable' + ',' + global.boardOneAlarm[3]
              fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
            }
          }, 5000)
        }
      }
      if (global.boardTwoAlarm[2] === 'enable') {
        if (global.boardTwoAlarm[1] === 'more') {
          clearInterval(window.boardAlert2)
          window.boardAlert2 = setInterval(function () {
            if (Number(board2.innerHTML) > Number(global.boardTwoAlarm[0])) {
              // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
              var Sound = { // eslint-disable-line
                audio: null,
                play: function (path) {
                  this.audio = new Audio(path) // eslint-disable-line
                  if (this.audio !== null) this.audio.pause()
                  this.audio.play()
                }
              }
              Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
              var options = { // eslint-disable-line
                icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                body: lang.echo('Ticker\'s value higher than ') + global.boardTwoAlarm[0] + ' (' + lang.echo('board #') + '2)'
              }
              sendTelegramMessage(options.body)
              new Notification(board2.innerHTML, options) // eslint-disable-line
              clearInterval(window.boardAlert2)
              settings.board2_alarm = global.boardTwoAlarm[0] + ',' + global.boardTwoAlarm[1] + ',' + 'disable' + ','
              fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
            }
          }, 5000)
        }
        if (global.boardTwoAlarm[1] === 'moreEqual') {
          clearInterval(window.boardAlert2)
          window.boardAlert2 = setInterval(function () {
            if (Number(board2.innerHTML) >= Number(global.boardTwoAlarm[0])) {
              // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
              var Sound = { // eslint-disable-line
                audio: null,
                play: function (path) {
                  this.audio = new Audio(path) // eslint-disable-line
                  if (this.audio !== null) this.audio.pause()
                  this.audio.play()
                }
              }
              Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
              var options = { // eslint-disable-line
                icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                body: lang.echo('Ticker\'s value higher or equal to ') + global.boardTwoAlarm[0] + ' (' + lang.echo('board #') + '2)'
              }
              sendTelegramMessage(options.body)
              new Notification(board2.innerHTML, options) // eslint-disable-line
              clearInterval(window.boardAlert2)
              settings.board2_alarm = global.boardTwoAlarm[0] + ',' + global.boardTwoAlarm[1] + ',' + 'disable' + ','
              fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
            }
          }, 5000)
        }
        if (global.boardTwoAlarm[1] === 'equal') {
          clearInterval(window.boardAlert2)
          window.boardAlert2 = setInterval(function () {
            if (Number(board2.innerHTML) === Number(global.boardTwoAlarm[0])) {
              // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
              var Sound = { // eslint-disable-line
                audio: null,
                play: function (path) {
                  this.audio = new Audio(path) // eslint-disable-line
                  if (this.audio !== null) this.audio.pause()
                  this.audio.play()
                }
              }
              Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
              var options = { // eslint-disable-line
                icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                body: lang.echo('Ticker\'s value equal to ') + global.boardTwoAlarm[0] + ' (' + lang.echo('board #') + '2)'
              }
              sendTelegramMessage(options.body)
              new Notification(board2.innerHTML, options) // eslint-disable-line
              clearInterval(window.boardAlert2)
              settings.board2_alarm = global.boardTwoAlarm[0] + ',' + global.boardTwoAlarm[1] + ',' + 'disable' + ','
              fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
            }
          }, 5000)
        }
        if (global.boardTwoAlarm[1] === 'less') {
          clearInterval(window.boardAlert2)
          window.boardAlert2 = setInterval(function () {
            if (Number(board2.innerHTML) < Number(global.boardTwoAlarm[0])) {
              // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
              var Sound = { // eslint-disable-line
                audio: null,
                play: function (path) {
                  this.audio = new Audio(path) // eslint-disable-line
                  if (this.audio !== null) this.audio.pause()
                  this.audio.play()
                }
              }
              Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
              var options = { // eslint-disable-line
                icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                body: lang.echo('Ticker\'s value less than ') + global.boardTwoAlarm[0] + ' (' + lang.echo('board #') + '2)'
              }
              sendTelegramMessage(options.body)
              new Notification(board2.innerHTML, options) // eslint-disable-line
              clearInterval(window.boardAlert2)
              settings.board2_alarm = global.boardTwoAlarm[0] + ',' + global.boardTwoAlarm[1] + ',' + 'disable' + ','
              fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
            }
          }, 5000)
        }
        if (global.boardTwoAlarm[1] === 'lessEqual') {
          clearInterval(window.boardAlert2)
          window.boardAlert2 = setInterval(function () {
            if (Number(board2.innerHTML) <= Number(global.boardTwoAlarm[0])) {
              // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
              var Sound = { // eslint-disable-line
                audio: null,
                play: function (path) {
                  this.audio = new Audio(path) // eslint-disable-line
                  if (this.audio !== null) this.audio.pause()
                  this.audio.play()
                }
              }
              Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
              var options = { // eslint-disable-line
                icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                body: lang.echo('Ticker\'s value less or equal to ') + global.boardTwoAlarm[0] + ' (' + lang.echo('board #') + '2)'
              }
              sendTelegramMessage(options.body)
              new Notification(board2.innerHTML, options) // eslint-disable-line
              clearInterval(window.boardAlert2)
              settings.board2_alarm = global.boardTwoAlarm[0] + ',' + global.boardTwoAlarm[1] + ',' + 'disable' + ','
              fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
            }
          }, 5000)
        }
        if (global.boardTwoAlarm[1] === 'date') {
          clearInterval(window.boardAlert2)
          window.boardAlert2 = setInterval(function () {
            const setDate = new Date(global.boardTwoAlarm[3])
            if (setDate.getTime() <= new Date().getTime()) {
              // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
              var Sound = { // eslint-disable-line
                audio: null,
                play: function (path) {
                  this.audio = new Audio(path) // eslint-disable-line
                  if (this.audio !== null) this.audio.pause()
                  this.audio.play()
                }
              }
              Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
              var options = { // eslint-disable-line
                icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                body: lang.echo('Ticker\'s value ') + board2.innerHTML + ' (' + lang.echo('board #') + '2)'
              }
              sendTelegramMessage(options.body)
              new Notification(new Date(), options) // eslint-disable-line
              clearInterval(window.boardAlert2)
              settings.board2_alarm = global.boardTwoAlarm[0] + ',' + global.boardTwoAlarm[1] + ',' + 'disable' + ',' + global.boardTwoAlarm[3]
              fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
            }
          }, 5000)
        }
      }
      if (global.boardThreeAlarm[2] === 'enable') {
        if (global.boardThreeAlarm[1] === 'more') {
          clearInterval(window.boardAlert3)
          window.boardAlert3 = setInterval(function () {
            if (Number(board3.innerHTML) > Number(global.boardThreeAlarm[0])) {
              // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
              var Sound = { // eslint-disable-line
                audio: null,
                play: function (path) {
                  this.audio = new Audio(path) // eslint-disable-line
                  if (this.audio !== null) this.audio.pause()
                  this.audio.play()
                }
              }
              Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
              var options = { // eslint-disable-line
                icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                body: lang.echo('Ticker\'s value higher than ') + global.boardThreeAlarm[0] + ' (' + lang.echo('board #') + '3)'
              }
              sendTelegramMessage(options.body)
              new Notification(board3.innerHTML, options) // eslint-disable-line
              clearInterval(window.boardAlert3)
              settings.board3_alarm = global.boardThreeAlarm[0] + ',' + global.boardThreeAlarm[1] + ',' + 'disable' + ','
              fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
            }
          }, 5000)
        }
        if (global.boardThreeAlarm[1] === 'moreEqual') {
          clearInterval(window.boardAlert3)
          window.boardAlert3 = setInterval(function () {
            if (Number(board3.innerHTML) >= Number(global.boardThreeAlarm[0])) {
              // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
              var Sound = { // eslint-disable-line
                audio: null,
                play: function (path) {
                  this.audio = new Audio(path) // eslint-disable-line
                  if (this.audio !== null) this.audio.pause()
                  this.audio.play()
                }
              }
              Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
              var options = { // eslint-disable-line
                icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                body: lang.echo('Ticker\'s value higher or equal to ') + global.boardThreeAlarm[0] + ' (' + lang.echo('board #') + '3)'
              }
              sendTelegramMessage(options.body)
              new Notification(board3.innerHTML, options) // eslint-disable-line
              clearInterval(window.boardAlert3)
              settings.board3_alarm = global.boardThreeAlarm[0] + ',' + global.boardThreeAlarm[1] + ',' + 'disable' + ','
              fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
            }
          }, 5000)
        }
        if (global.boardThreeAlarm[1] === 'equal') {
          clearInterval(window.boardAlert3)
          window.boardAlert3 = setInterval(function () {
            if (Number(board3.innerHTML) === Number(global.boardThreeAlarm[0])) {
              // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
              var Sound = { // eslint-disable-line
                audio: null,
                play: function (path) {
                  this.audio = new Audio(path) // eslint-disable-line
                  if (this.audio !== null) this.audio.pause()
                  this.audio.play()
                }
              }
              Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
              var options = { // eslint-disable-line
                icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                body: lang.echo('Ticker\'s value equal to ') + global.boardThreeAlarm[0] + ' (' + lang.echo('board #') + '3)'
              }
              sendTelegramMessage(options.body)
              new Notification(board3.innerHTML, options) // eslint-disable-line
              clearInterval(window.boardAlert3)
              settings.board3_alarm = global.boardThreeAlarm[0] + ',' + global.boardThreeAlarm[1] + ',' + 'disable' + ','
              fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
            }
          }, 5000)
        }
        if (global.boardThreeAlarm[1] === 'less') {
          clearInterval(window.boardAlert3)
          window.boardAlert3 = setInterval(function () {
            if (Number(board3.innerHTML) < Number(global.boardThreeAlarm[0])) {
              // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
              var Sound = { // eslint-disable-line
                audio: null,
                play: function (path) {
                  this.audio = new Audio(path) // eslint-disable-line
                  if (this.audio !== null) this.audio.pause()
                  this.audio.play()
                }
              }
              Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
              var options = { // eslint-disable-line
                icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                body: lang.echo('Ticker\'s value less than ') + global.boardThreeAlarm[0] + ' (' + lang.echo('board #') + '3)'
              }
              sendTelegramMessage(options.body)
              new Notification(board3.innerHTML, options) // eslint-disable-line
              clearInterval(window.boardAlert3)
              settings.board3_alarm = global.boardThreeAlarm[0] + ',' + global.boardThreeAlarm[1] + ',' + 'disable' + ','
              fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
            }
          }, 5000)
        }
        if (global.boardThreeAlarm[1] === 'lessEqual') {
          clearInterval(window.boardAlert3)
          window.boardAlert3 = setInterval(function () {
            if (Number(board3.innerHTML) <= Number(global.boardThreeAlarm[0])) {
              // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
              var Sound = { // eslint-disable-line
                audio: null,
                play: function (path) {
                  this.audio = new Audio(path) // eslint-disable-line
                  if (this.audio !== null) this.audio.pause()
                  this.audio.play()
                }
              }
              Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
              var options = { // eslint-disable-line
                icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                body: lang.echo('Ticker\'s value less or equal to ') + global.boardThreeAlarm[0] + ' (' + lang.echo('board #') + '3)'
              }
              sendTelegramMessage(options.body)
              new Notification(board3.innerHTML, options) // eslint-disable-line
              clearInterval(window.boardAlert3)
              settings.board3_alarm = global.boardThreeAlarm[0] + ',' + global.boardThreeAlarm[1] + ',' + 'disable' + ','
              fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
            }
          }, 5000)
        }
        if (global.boardThreeAlarm[1] === 'date') {
          clearInterval(window.boardAlert3)
          window.boardAlert3 = setInterval(function () {
            const setDate = new Date(global.boardThreeAlarm[3])
            if (setDate.getTime() <= new Date().getTime()) {
              // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
              var Sound = { // eslint-disable-line
                audio: null,
                play: function (path) {
                  this.audio = new Audio(path) // eslint-disable-line
                  if (this.audio !== null) this.audio.pause()
                  this.audio.play()
                }
              }
              Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
              var options = { // eslint-disable-line
                icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                body: lang.echo('Ticker\'s value ') + board3.innerHTML + ' (' + lang.echo('board #') + '3)'
              }
              sendTelegramMessage(options.body)
              new Notification(new Date(), options) // eslint-disable-line
              clearInterval(window.boardAlert3)
              settings.board3_alarm = global.boardThreeAlarm[0] + ',' + global.boardThreeAlarm[1] + ',' + 'disable' + ',' + global.boardThreeAlarm[3]
              fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
            }
          }, 5000)
        }
      }
      if (global.boardFourAlarm[2] === 'enable') {
        if (global.boardFourAlarm[1] === 'more') {
          clearInterval(window.boardAlert4)
          window.boardAlert4 = setInterval(function () {
            if (Number(board4.innerHTML) > Number(global.boardFourAlarm[0])) {
              // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
              var Sound = { // eslint-disable-line
                audio: null,
                play: function (path) {
                  this.audio = new Audio(path) // eslint-disable-line
                  if (this.audio !== null) this.audio.pause()
                  this.audio.play()
                }
              }
              Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
              var options = { // eslint-disable-line
                icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                body: lang.echo('Ticker\'s value higher than ') + global.boardFourAlarm[0] + ' (' + lang.echo('board #') + '4)'
              }
              sendTelegramMessage(options.body)
              new Notification(board4.innerHTML, options) // eslint-disable-line
              clearInterval(window.boardAlert4)
              settings.board4_alarm = global.boardFourAlarm[0] + ',' + global.boardFourAlarm[1] + ',' + 'disable' + ','
              fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
            }
          }, 5000)
        }
        if (global.boardFourAlarm[1] === 'moreEqual') {
          clearInterval(window.boardAlert4)
          window.boardAlert4 = setInterval(function () {
            if (Number(board4.innerHTML) >= Number(global.boardFourAlarm[0])) {
              // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
              var Sound = { // eslint-disable-line
                audio: null,
                play: function (path) {
                  this.audio = new Audio(path) // eslint-disable-line
                  if (this.audio !== null) this.audio.pause()
                  this.audio.play()
                }
              }
              Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
              var options = { // eslint-disable-line
                icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                body: lang.echo('Ticker\'s value higher or equal to ') + global.boardFourAlarm[0] + ' (' + lang.echo('board #') + '4)'
              }
              sendTelegramMessage(options.body)
              new Notification(board4.innerHTML, options) // eslint-disable-line
              clearInterval(window.boardAlert4)
              settings.board4_alarm = global.boardFourAlarm[0] + ',' + global.boardFourAlarm[1] + ',' + 'disable' + ','
              fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
            }
          }, 5000)
        }
        if (global.boardFourAlarm[1] === 'equal') {
          clearInterval(window.boardAlert4)
          window.boardAlert4 = setInterval(function () {
            if (Number(board4.innerHTML) === Number(global.boardFourAlarm[0])) {
              // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
              var Sound = { // eslint-disable-line
                audio: null,
                play: function (path) {
                  this.audio = new Audio(path) // eslint-disable-line
                  if (this.audio !== null) this.audio.pause()
                  this.audio.play()
                }
              }
              Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
              var options = { // eslint-disable-line
                icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                body: lang.echo('Ticker\'s value equal to ') + global.boardFourAlarm[0] + ' (' + lang.echo('board #') + '4)'
              }
              sendTelegramMessage(options.body)
              new Notification(board4.innerHTML, options) // eslint-disable-line
              clearInterval(window.boardAlert4)
              settings.board4_alarm = global.boardFourAlarm[0] + ',' + global.boardFourAlarm[1] + ',' + 'disable' + ','
              fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
            }
          }, 5000)
        }
        if (global.boardFourAlarm[1] === 'less') {
          clearInterval(window.boardAlert4)
          window.boardAlert4 = setInterval(function () {
            if (Number(board4.innerHTML) < Number(global.boardFourAlarm[0])) {
              // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
              var Sound = { // eslint-disable-line
                audio: null,
                play: function (path) {
                  this.audio = new Audio(path) // eslint-disable-line
                  if (this.audio !== null) this.audio.pause()
                  this.audio.play()
                }
              }
              Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
              var options = { // eslint-disable-line
                icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                body: lang.echo('Ticker\'s value less than ') + global.boardFourAlarm[0] + ' (' + lang.echo('board #') + '4)'
              }
              sendTelegramMessage(options.body)
              new Notification(board4.innerHTML, options) // eslint-disable-line
              clearInterval(window.boardAlert4)
              settings.board4_alarm = global.boardFourAlarm[0] + ',' + global.boardFourAlarm[1] + ',' + 'disable' + ','
              fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
            }
          }, 5000)
        }
        if (global.boardFourAlarm[1] === 'lessEqual') {
          clearInterval(window.boardAlert4)
          window.boardAlert4 = setInterval(function () {
            if (Number(board4.innerHTML) <= Number(global.boardFourAlarm[0])) {
              // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
              var Sound = { // eslint-disable-line
                audio: null,
                play: function (path) {
                  this.audio = new Audio(path) // eslint-disable-line
                  if (this.audio !== null) this.audio.pause()
                  this.audio.play()
                }
              }
              Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
              var options = { // eslint-disable-line
                icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                body: lang.echo('Ticker\'s value less or equal to ') + global.boardFourAlarm[0] + ' (' + lang.echo('board #') + '4)'
              }
              sendTelegramMessage(options.body)
              new Notification(board4.innerHTML, options) // eslint-disable-line
              clearInterval(window.boardAlert4)
              settings.board4_alarm = global.boardFourAlarm[0] + ',' + global.boardFourAlarm[1] + ',' + 'disable' + ','
              fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
            }
          }, 5000)
        }
        if (global.boardFourAlarm[1] === 'date') {
          clearInterval(window.boardAlert4)
          window.boardAlert4 = setInterval(function () {
            const setDate = new Date(global.boardFourAlarm[3])
            if (setDate.getTime() <= new Date().getTime()) {
              // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
              var Sound = { // eslint-disable-line
                audio: null,
                play: function (path) {
                  this.audio = new Audio(path) // eslint-disable-line
                  if (this.audio !== null) this.audio.pause()
                  this.audio.play()
                }
              }
              Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
              var options = { // eslint-disable-line
                icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                body: lang.echo('Ticker\'s value ') + board4.innerHTML + ' (' + lang.echo('board #') + '4)'
              }
              sendTelegramMessage(options.body)
              new Notification(new Date(), options) // eslint-disable-line
              clearInterval(window.boardAlert4)
              settings.board4_alarm = global.boardFourAlarm[0] + ',' + global.boardFourAlarm[1] + ',' + 'disable' + ',' + global.boardFourAlarm[3]
              fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
            }
          }, 5000)
        }
      }
      if (global.licenseRender === 'true') {
        if (global.boardFiveAlarm[2] === 'enable') {
          if (global.boardFiveAlarm[1] === 'more') {
            clearInterval(window.boardAlert5)
            window.boardAlert5 = setInterval(function () {
              if (Number(board5.innerHTML) > Number(global.boardFiveAlarm[0])) {
                // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
                var Sound = { // eslint-disable-line
                  audio: null,
                  play: function (path) {
                    this.audio = new Audio(path) // eslint-disable-line
                    if (this.audio !== null) this.audio.pause()
                    this.audio.play()
                  }
                }
                Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
                var options = { // eslint-disable-line
                  icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  body: lang.echo('Ticker\'s value higher than ') + global.boardFiveAlarm[0] + ' (' + lang.echo('board #') + '5)'
                }
                sendTelegramMessage(options.body)
                new Notification(board5.innerHTML, options) // eslint-disable-line
                clearInterval(window.boardAlert5)
                settings.board5_alarm = global.boardFiveAlarm[0] + ',' + global.boardFiveAlarm[1] + ',' + 'disable' + ','
                fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
              }
            }, 5000)
          }
          if (global.boardFiveAlarm[1] === 'moreEqual') {
            clearInterval(window.boardAlert5)
            window.boardAlert5 = setInterval(function () {
              if (Number(board5.innerHTML) >= Number(global.boardFiveAlarm[0])) {
                // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
                var Sound = { // eslint-disable-line
                  audio: null,
                  play: function (path) {
                    this.audio = new Audio(path) // eslint-disable-line
                    if (this.audio !== null) this.audio.pause()
                    this.audio.play()
                  }
                }
                Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
                var options = { // eslint-disable-line
                  icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  body: lang.echo('Ticker\'s value higher or equal to ') + global.boardFiveAlarm[0] + ' (' + lang.echo('board #') + '5)'
                }
                sendTelegramMessage(options.body)
                new Notification(board5.innerHTML, options) // eslint-disable-line
                clearInterval(window.boardAlert5)
                settings.board5_alarm = global.boardFiveAlarm[0] + ',' + global.boardFiveAlarm[1] + ',' + 'disable' + ','
                fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
              }
            }, 5000)
          }
          if (global.boardFiveAlarm[1] === 'equal') {
            clearInterval(window.boardAlert5)
            window.boardAlert5 = setInterval(function () {
              if (Number(board5.innerHTML) === Number(global.boardFiveAlarm[0])) {
                // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
                var Sound = { // eslint-disable-line
                  audio: null,
                  play: function (path) {
                    this.audio = new Audio(path) // eslint-disable-line
                    if (this.audio !== null) this.audio.pause()
                    this.audio.play()
                  }
                }
                Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
                var options = { // eslint-disable-line
                  icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  body: lang.echo('Ticker\'s value equal to ') + global.boardFiveAlarm[0] + ' (' + lang.echo('board #') + '5)'
                }
                sendTelegramMessage(options.body)
                new Notification(board5.innerHTML, options) // eslint-disable-line
                clearInterval(window.boardAlert5)
                settings.board5_alarm = global.boardFiveAlarm[0] + ',' + global.boardFiveAlarm[1] + ',' + 'disable' + ','
                fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
              }
            }, 5000)
          }
          if (global.boardFiveAlarm[1] === 'less') {
            clearInterval(window.boardAlert5)
            window.boardAlert5 = setInterval(function () {
              if (Number(board5.innerHTML) < Number(global.boardFiveAlarm[0])) {
                // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
                var Sound = { // eslint-disable-line
                  audio: null,
                  play: function (path) {
                    this.audio = new Audio(path) // eslint-disable-line
                    if (this.audio !== null) this.audio.pause()
                    this.audio.play()
                  }
                }
                Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
                var options = { // eslint-disable-line
                  icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  body: lang.echo('Ticker\'s value less than ') + global.boardFiveAlarm[0] + ' (' + lang.echo('board #') + '5)'
                }
                sendTelegramMessage(options.body)
                new Notification(board5.innerHTML, options) // eslint-disable-line
                clearInterval(window.boardAlert5)
                settings.board5_alarm = global.boardFiveAlarm[0] + ',' + global.boardFiveAlarm[1] + ',' + 'disable' + ','
                fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
              }
            }, 5000)
          }
          if (global.boardFiveAlarm[1] === 'lessEqual') {
            clearInterval(window.boardAlert5)
            window.boardAlert5 = setInterval(function () {
              if (Number(board5.innerHTML) <= Number(global.boardFiveAlarm[0])) {
                // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
                var Sound = { // eslint-disable-line
                  audio: null,
                  play: function (path) {
                    this.audio = new Audio(path) // eslint-disable-line
                    if (this.audio !== null) this.audio.pause()
                    this.audio.play()
                  }
                }
                Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
                var options = { // eslint-disable-line
                  icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  body: lang.echo('Ticker\'s value less or equal to ') + global.boardFiveAlarm[0] + ' (' + lang.echo('board #') + '5)'
                }
                sendTelegramMessage(options.body)
                new Notification(board5.innerHTML, options) // eslint-disable-line
                clearInterval(window.boardAlert5)
                settings.board5_alarm = global.boardFiveAlarm[0] + ',' + global.boardFiveAlarm[1] + ',' + 'disable' + ','
                fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
              }
            }, 5000)
          }
          if (global.boardFiveAlarm[1] === 'date') {
            clearInterval(window.boardAlert5)
            window.boardAlert5 = setInterval(function () {
              const setDate = new Date(global.boardFiveAlarm[3])
              if (setDate.getTime() <= new Date().getTime()) {
                // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
                var Sound = { // eslint-disable-line
                  audio: null,
                  play: function (path) {
                    this.audio = new Audio(path) // eslint-disable-line
                    if (this.audio !== null) this.audio.pause()
                    this.audio.play()
                  }
                }
                Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
                var options = { // eslint-disable-line
                  icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  body: lang.echo('Ticker\'s value ') + board5.innerHTML + ' (' + lang.echo('board #') + '5)'
                }
                sendTelegramMessage(options.body)
                new Notification(new Date(), options) // eslint-disable-line
                clearInterval(window.boardAlert5)
                settings.board5_alarm = global.boardFiveAlarm[0] + ',' + global.boardFiveAlarm[1] + ',' + 'disable' + ',' + global.boardFiveAlarm[3]
                fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
              }
            }, 5000)
          }
        }
        if (global.boardSixAlarm[2] === 'enable') {
          if (global.boardSixAlarm[1] === 'more') {
            clearInterval(window.boardAlert6)
            window.boardAlert6 = setInterval(function () {
              if (Number(board6.innerHTML) > Number(global.boardSixAlarm[0])) {
                // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
                var Sound = { // eslint-disable-line
                  audio: null,
                  play: function (path) {
                    this.audio = new Audio(path) // eslint-disable-line
                    if (this.audio !== null) this.audio.pause()
                    this.audio.play()
                  }
                }
                Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
                var options = { // eslint-disable-line
                  icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  body: lang.echo('Ticker\'s value higher than ') + global.boardSixAlarm[0] + ' (' + lang.echo('board #') + '6)'
                }
                sendTelegramMessage(options.body)
                new Notification(board6.innerHTML, options) // eslint-disable-line
                clearInterval(window.boardAlert6)
                settings.board6_alarm = global.boardSixAlarm[0] + ',' + global.boardSixAlarm[1] + ',' + 'disable' + ','
                fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
              }
            }, 5000)
          }
          if (global.boardSixAlarm[1] === 'moreEqual') {
            clearInterval(window.boardAlert6)
            window.boardAlert6 = setInterval(function () {
              if (Number(board6.innerHTML) >= Number(global.boardSixAlarm[0])) {
                // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
                var Sound = { // eslint-disable-line
                  audio: null,
                  play: function (path) {
                    this.audio = new Audio(path) // eslint-disable-line
                    if (this.audio !== null) this.audio.pause()
                    this.audio.play()
                  }
                }
                Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
                var options = { // eslint-disable-line
                  icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  body: lang.echo('Ticker\'s value higher or equal to ') + global.boardSixAlarm[0] + ' (' + lang.echo('board #') + '6)'
                }
                sendTelegramMessage(options.body)
                new Notification(board6.innerHTML, options) // eslint-disable-line
                clearInterval(window.boardAlert6)
                settings.board6_alarm = global.boardSixAlarm[0] + ',' + global.boardSixAlarm[1] + ',' + 'disable' + ','
                fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
              }
            }, 5000)
          }
          if (global.boardSixAlarm[1] === 'equal') {
            clearInterval(window.boardAlert6)
            window.boardAlert6 = setInterval(function () {
              if (Number(board6.innerHTML) === Number(global.boardSixAlarm[0])) {
                // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
                var Sound = { // eslint-disable-line
                  audio: null,
                  play: function (path) {
                    this.audio = new Audio(path) // eslint-disable-line
                    if (this.audio !== null) this.audio.pause()
                    this.audio.play()
                  }
                }
                Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
                var options = { // eslint-disable-line
                  icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  body: lang.echo('Ticker\'s value equal to ') + global.boardSixAlarm[0] + ' (' + lang.echo('board #') + '6)'
                }
                sendTelegramMessage(options.body)
                new Notification(board6.innerHTML, options) // eslint-disable-line
                clearInterval(window.boardAlert6)
                settings.board6_alarm = global.boardSixAlarm[0] + ',' + global.boardSixAlarm[1] + ',' + 'disable' + ','
                fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
              }
            }, 5000)
          }
          if (global.boardSixAlarm[1] === 'less') {
            clearInterval(window.boardAlert6)
            window.boardAlert6 = setInterval(function () {
              if (Number(board6.innerHTML) < Number(global.boardSixAlarm[0])) {
                // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
                var Sound = { // eslint-disable-line
                  audio: null,
                  play: function (path) {
                    this.audio = new Audio(path) // eslint-disable-line
                    if (this.audio !== null) this.audio.pause()
                    this.audio.play()
                  }
                }
                Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
                var options = { // eslint-disable-line
                  icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  body: lang.echo('Ticker\'s value less than ') + global.boardSixAlarm[0] + ' (' + lang.echo('board #') + '6)'
                }
                sendTelegramMessage(options.body)
                new Notification(board6.innerHTML, options) // eslint-disable-line
                clearInterval(window.boardAlert6)
                settings.board6_alarm = global.boardSixAlarm[0] + ',' + global.boardSixAlarm[1] + ',' + 'disable' + ','
                fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
              }
            }, 5000)
          }
          if (global.boardSixAlarm[1] === 'lessEqual') {
            clearInterval(window.boardAlert6)
            window.boardAlert6 = setInterval(function () {
              if (Number(board6.innerHTML) <= Number(global.boardSixAlarm[0])) {
                // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
                var Sound = { // eslint-disable-line
                  audio: null,
                  play: function (path) {
                    this.audio = new Audio(path) // eslint-disable-line
                    if (this.audio !== null) this.audio.pause()
                    this.audio.play()
                  }
                }
                Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
                var options = { // eslint-disable-line
                  icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  body: lang.echo('Ticker\'s value less or equal to ') + global.boardSixAlarm[0] + ' (' + lang.echo('board #') + '6)'
                }
                sendTelegramMessage(options.body)
                new Notification(board6.innerHTML, options) // eslint-disable-line
                clearInterval(window.boardAlert6)
                settings.board6_alarm = global.boardSixAlarm[0] + ',' + global.boardSixAlarm[1] + ',' + 'disable' + ','
                fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
              }
            }, 5000)
          }
          if (global.boardSixAlarm[1] === 'date') {
            clearInterval(window.boardAlert6)
            window.boardAlert6 = setInterval(function () {
              const setDate = new Date(global.boardSixAlarm[3])
              if (setDate.getTime() <= new Date().getTime()) {
                // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
                var Sound = { // eslint-disable-line
                  audio: null,
                  play: function (path) {
                    this.audio = new Audio(path) // eslint-disable-line
                    if (this.audio !== null) this.audio.pause()
                    this.audio.play()
                  }
                }
                Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
                var options = { // eslint-disable-line
                  icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  body: lang.echo('Ticker\'s value ') + board6.innerHTML + ' (' + lang.echo('board #') + '6)'
                }
                sendTelegramMessage(options.body)
                new Notification(new Date(), options) // eslint-disable-line
                clearInterval(window.boardAlert6)
                settings.board6_alarm = global.boardSixAlarm[0] + ',' + global.boardSixAlarm[1] + ',' + 'disable' + ',' + global.boardSixAlarm[3]
                fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
              }
            }, 5000)
          }
        }
        if (global.boardSevenAlarm[2] === 'enable') {
          if (global.boardSevenAlarm[1] === 'more') {
            clearInterval(window.boardAlert7)
            window.boardAlert7 = setInterval(function () {
              if (Number(board7.innerHTML) > Number(global.boardSevenAlarm[0])) {
                // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
                var Sound = { // eslint-disable-line
                  audio: null,
                  play: function (path) {
                    this.audio = new Audio(path) // eslint-disable-line
                    if (this.audio !== null) this.audio.pause()
                    this.audio.play()
                  }
                }
                Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
                var options = { // eslint-disable-line
                  icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  body: lang.echo('Ticker\'s value higher than ') + global.boardSevenAlarm[0] + ' (' + lang.echo('board #') + '7)'
                }
                sendTelegramMessage(options.body)
                new Notification(board7.innerHTML, options) // eslint-disable-line
                clearInterval(window.boardAlert7)
                settings.board7_alarm = global.boardSevenAlarm[0] + ',' + global.boardSevenAlarm[1] + ',' + 'disable' + ','
                fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
              }
            }, 5000)
          }
          if (global.boardSevenAlarm[1] === 'moreEqual') {
            clearInterval(window.boardAlert7)
            window.boardAlert7 = setInterval(function () {
              if (Number(board7.innerHTML) >= Number(global.boardSevenAlarm[0])) {
                // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
                var Sound = { // eslint-disable-line
                  audio: null,
                  play: function (path) {
                    this.audio = new Audio(path) // eslint-disable-line
                    if (this.audio !== null) this.audio.pause()
                    this.audio.play()
                  }
                }
                Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
                var options = { // eslint-disable-line
                  icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  body: lang.echo('Ticker\'s value higher or equal to ') + global.boardSevenAlarm[0] + ' (' + lang.echo('board #') + '7)'
                }
                sendTelegramMessage(options.body)
                new Notification(board7.innerHTML, options) // eslint-disable-line
                clearInterval(window.boardAlert7)
                settings.board7_alarm = global.boardSevenAlarm[0] + ',' + global.boardSevenAlarm[1] + ',' + 'disable' + ','
                fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
              }
            }, 5000)
          }
          if (global.boardSevenAlarm[1] === 'equal') {
            clearInterval(window.boardAlert7)
            window.boardAlert7 = setInterval(function () {
              if (Number(board7.innerHTML) === Number(global.boardSevenAlarm[0])) {
                // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
                var Sound = { // eslint-disable-line
                  audio: null,
                  play: function (path) {
                    this.audio = new Audio(path) // eslint-disable-line
                    if (this.audio !== null) this.audio.pause()
                    this.audio.play()
                  }
                }
                Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
                var options = { // eslint-disable-line
                  icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  body: lang.echo('Ticker\'s value equal to ') + global.boardSevenAlarm[0] + ' (' + lang.echo('board #') + '7)'
                }
                sendTelegramMessage(options.body)
                new Notification(board7.innerHTML, options) // eslint-disable-line
                clearInterval(window.boardAlert7)
                settings.board7_alarm = global.boardSevenAlarm[0] + ',' + global.boardSevenAlarm[1] + ',' + 'disable' + ','
                fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
              }
            }, 5000)
          }
          if (global.boardSevenAlarm[1] === 'less') {
            clearInterval(window.boardAlert7)
            window.boardAlert7 = setInterval(function () {
              if (Number(board7.innerHTML) < Number(global.boardSevenAlarm[0])) {
                // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
                var Sound = { // eslint-disable-line
                  audio: null,
                  play: function (path) {
                    this.audio = new Audio(path) // eslint-disable-line
                    if (this.audio !== null) this.audio.pause()
                    this.audio.play()
                  }
                }
                Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
                var options = { // eslint-disable-line
                  icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  body: lang.echo('Ticker\'s value less than ') + global.boardSevenAlarm[0] + ' (' + lang.echo('board #') + '7)'
                }
                sendTelegramMessage(options.body)
                new Notification(board7.innerHTML, options) // eslint-disable-line
                clearInterval(window.boardAlert7)
                settings.board7_alarm = global.boardSevenAlarm[0] + ',' + global.boardSevenAlarm[1] + ',' + 'disable' + ','
                fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
              }
            }, 5000)
          }
          if (global.boardSevenAlarm[1] === 'lessEqual') {
            clearInterval(window.boardAlert7)
            window.boardAlert7 = setInterval(function () {
              if (Number(board7.innerHTML) <= Number(global.boardSevenAlarm[0])) {
                // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
                var Sound = { // eslint-disable-line
                  audio: null,
                  play: function (path) {
                    this.audio = new Audio(path) // eslint-disable-line
                    if (this.audio !== null) this.audio.pause()
                    this.audio.play()
                  }
                }
                Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
                var options = { // eslint-disable-line
                  icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  body: lang.echo('Ticker\'s value less or equal to ') + global.boardSevenAlarm[0] + ' (' + lang.echo('board #') + '7)'
                }
                sendTelegramMessage(options.body)
                new Notification(board7.innerHTML, options) // eslint-disable-line
                clearInterval(window.boardAlert7)
                settings.board7_alarm = global.boardSevenAlarm[0] + ',' + global.boardSevenAlarm[1] + ',' + 'disable' + ','
                fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
              }
            }, 5000)
          }
          if (global.boardSevenAlarm[1] === 'date') {
            clearInterval(window.boardAlert7)
            window.boardAlert7 = setInterval(function () {
              const setDate = new Date(global.boardSevenAlarm[3])
              if (setDate.getTime() <= new Date().getTime()) {
                // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
                var Sound = { // eslint-disable-line
                  audio: null,
                  play: function (path) {
                    this.audio = new Audio(path) // eslint-disable-line
                    if (this.audio !== null) this.audio.pause()
                    this.audio.play()
                  }
                }
                Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
                var options = { // eslint-disable-line
                  icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  body: lang.echo('Ticker\'s value ') + board7.innerHTML + ' (' + lang.echo('board #') + '7)'
                }
                sendTelegramMessage(options.body)
                new Notification(new Date(), options) // eslint-disable-line
                clearInterval(window.boardAlert7)
                settings.board7_alarm = global.boardSevenAlarm[0] + ',' + global.boardSevenAlarm[1] + ',' + 'disable' + ',' + global.boardSevenAlarm[3]
                fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
              }
            }, 5000)
          }
        }
        if (global.boardEightAlarm[2] === 'enable') {
          if (global.boardEightAlarm[1] === 'more') {
            clearInterval(window.boardAlert8)
            window.boardAlert8 = setInterval(function () {
              if (Number(board8.innerHTML) > Number(global.boardEightAlarm[0])) {
                // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
                var Sound = { // eslint-disable-line
                  audio: null,
                  play: function (path) {
                    this.audio = new Audio(path) // eslint-disable-line
                    if (this.audio !== null) this.audio.pause()
                    this.audio.play()
                  }
                }
                Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
                var options = { // eslint-disable-line
                  icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  body: lang.echo('Ticker\'s value higher than ') + global.boardEightAlarm[0] + ' (' + lang.echo('board #') + '8)'
                }
                sendTelegramMessage(options.body)
                new Notification(board8.innerHTML, options) // eslint-disable-line
                clearInterval(window.boardAlert8)
                settings.board8_alarm = global.boardEightAlarm[0] + ',' + global.boardEightAlarm[1] + ',' + 'disable' + ','
                fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
              }
            }, 5000)
          }
          if (global.boardEightAlarm[1] === 'moreEqual') {
            clearInterval(window.boardAlert8)
            window.boardAlert8 = setInterval(function () {
              if (Number(board8.innerHTML) >= Number(global.boardEightAlarm[0])) {
                // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
                var Sound = { // eslint-disable-line
                  audio: null,
                  play: function (path) {
                    this.audio = new Audio(path) // eslint-disable-line
                    if (this.audio !== null) this.audio.pause()
                    this.audio.play()
                  }
                }
                Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
                var options = { // eslint-disable-line
                  icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  body: lang.echo('Ticker\'s value higher or equal to ') + global.boardEightAlarm[0] + ' (' + lang.echo('board #') + '8)'
                }
                sendTelegramMessage(options.body)
                new Notification(board8.innerHTML, options) // eslint-disable-line
                clearInterval(window.boardAlert8)
                settings.board8_alarm = global.boardEightAlarm[0] + ',' + global.boardEightAlarm[1] + ',' + 'disable' + ','
                fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
              }
            }, 5000)
          }
          if (global.boardEightAlarm[1] === 'equal') {
            clearInterval(window.boardAlert8)
            window.boardAlert8 = setInterval(function () {
              if (Number(board8.innerHTML) === Number(global.boardEightAlarm[0])) {
                // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
                var Sound = { // eslint-disable-line
                  audio: null,
                  play: function (path) {
                    this.audio = new Audio(path) // eslint-disable-line
                    if (this.audio !== null) this.audio.pause()
                    this.audio.play()
                  }
                }
                Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
                var options = { // eslint-disable-line
                  icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  body: lang.echo('Ticker\'s value equal to ') + global.boardEightAlarm[0] + ' (' + lang.echo('board #') + '8)'
                }
                sendTelegramMessage(options.body)
                new Notification(board8.innerHTML, options) // eslint-disable-line
                clearInterval(window.boardAlert8)
                settings.board8_alarm = global.boardEightAlarm[0] + ',' + global.boardEightAlarm[1] + ',' + 'disable' + ','
                fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
              }
            }, 5000)
          }
          if (global.boardEightAlarm[1] === 'less') {
            clearInterval(window.boardAlert8)
            window.boardAlert8 = setInterval(function () {
              if (Number(board8.innerHTML) < Number(global.boardEightAlarm[0])) {
                // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
                var Sound = { // eslint-disable-line
                  audio: null,
                  play: function (path) {
                    this.audio = new Audio(path) // eslint-disable-line
                    if (this.audio !== null) this.audio.pause()
                    this.audio.play()
                  }
                }
                Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
                var options = { // eslint-disable-line
                  icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  body: lang.echo('Ticker\'s value less than ') + global.boardEightAlarm[0] + ' (' + lang.echo('board #') + '8)'
                }
                sendTelegramMessage(options.body)
                new Notification(board8.innerHTML, options) // eslint-disable-line
                clearInterval(window.boardAlert8)
                settings.board8_alarm = global.boardEightAlarm[0] + ',' + global.boardEightAlarm[1] + ',' + 'disable' + ','
                fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
              }
            }, 5000)
          }
          if (global.boardEightAlarm[1] === 'lessEqual') {
            clearInterval(window.boardAlert8)
            window.boardAlert8 = setInterval(function () {
              if (Number(board8.innerHTML) <= Number(global.boardEightAlarm[0])) {
                // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
                var Sound = { // eslint-disable-line
                  audio: null,
                  play: function (path) {
                    this.audio = new Audio(path) // eslint-disable-line
                    if (this.audio !== null) this.audio.pause()
                    this.audio.play()
                  }
                }
                Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
                var options = { // eslint-disable-line
                  icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  body: lang.echo('Ticker\'s value less or equal to ') + global.boardEightAlarm[0] + ' (' + lang.echo('board #') + '8)'
                }
                sendTelegramMessage(options.body)
                new Notification(board8.innerHTML, options) // eslint-disable-line
                clearInterval(window.boardAlert8)
                settings.board8_alarm = global.boardEightAlarm[0] + ',' + global.boardEightAlarm[1] + ',' + 'disable' + ','
                fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
              }
            }, 5000)
          }
          if (global.boardEightAlarm[1] === 'date') {
            clearInterval(window.boardAlert8)
            window.boardAlert8 = setInterval(function () {
              const setDate = new Date(global.boardEightAlarm[3])
              if (setDate.getTime() <= new Date().getTime()) {
                // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
                var Sound = { // eslint-disable-line
                  audio: null,
                  play: function (path) {
                    this.audio = new Audio(path) // eslint-disable-line
                    if (this.audio !== null) this.audio.pause()
                    this.audio.play()
                  }
                }
                Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
                var options = { // eslint-disable-line
                  icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  body: lang.echo('Ticker\'s value ') + board8.innerHTML + ' (' + lang.echo('board #') + '8)'
                }
                sendTelegramMessage(options.body)
                new Notification(new Date(), options) // eslint-disable-line
                clearInterval(window.boardAlert8)
                settings.board8_alarm = global.boardEightAlarm[0] + ',' + global.boardEightAlarm[1] + ',' + 'disable' + ',' + global.boardEightAlarm[3]
                fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
              }
            }, 5000)
          }
        }
        if (global.boardNineAlarm[2] === 'enable') {
          if (global.boardNineAlarm[1] === 'more') {
            clearInterval(window.boardAlert9)
            window.boardAlert9 = setInterval(function () {
              if (Number(board9.innerHTML) > Number(global.boardNineAlarm[0])) {
                // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
                var Sound = { // eslint-disable-line
                  audio: null,
                  play: function (path) {
                    this.audio = new Audio(path) // eslint-disable-line
                    if (this.audio !== null) this.audio.pause()
                    this.audio.play()
                  }
                }
                Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
                var options = { // eslint-disable-line
                  icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  body: lang.echo('Ticker\'s value higher than ') + global.boardNineAlarm[0] + ' (' + lang.echo('board #') + '9)'
                }
                sendTelegramMessage(options.body)
                new Notification(board9.innerHTML, options) // eslint-disable-line
                clearInterval(window.boardAlert9)
                settings.board9_alarm = global.boardNineAlarm[0] + ',' + global.boardNineAlarm[1] + ',' + 'disable' + ','
                fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
              }
            }, 5000)
          }
          if (global.boardNineAlarm[1] === 'moreEqual') {
            clearInterval(window.boardAlert9)
            window.boardAlert9 = setInterval(function () {
              if (Number(board9.innerHTML) >= Number(global.boardNineAlarm[0])) {
                // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
                var Sound = { // eslint-disable-line
                  audio: null,
                  play: function (path) {
                    this.audio = new Audio(path) // eslint-disable-line
                    if (this.audio !== null) this.audio.pause()
                    this.audio.play()
                  }
                }
                Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
                var options = { // eslint-disable-line
                  icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  body: lang.echo('Ticker\'s value higher or equal to ') + global.boardNineAlarm[0] + ' (' + lang.echo('board #') + '9)'
                }
                sendTelegramMessage(options.body)
                new Notification(board9.innerHTML, options) // eslint-disable-line
                clearInterval(window.boardAlert9)
                settings.board9_alarm = global.boardNineAlarm[0] + ',' + global.boardNineAlarm[1] + ',' + 'disable' + ','
                fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
              }
            }, 5000)
          }
          if (global.boardNineAlarm[1] === 'equal') {
            clearInterval(window.boardAlert9)
            window.boardAlert9 = setInterval(function () {
              if (Number(board9.innerHTML) === Number(global.boardNineAlarm[0])) {
                // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
                var Sound = { // eslint-disable-line
                  audio: null,
                  play: function (path) {
                    this.audio = new Audio(path) // eslint-disable-line
                    if (this.audio !== null) this.audio.pause()
                    this.audio.play()
                  }
                }
                Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
                var options = { // eslint-disable-line
                  icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  body: lang.echo('Ticker\'s value equal to ') + global.boardNineAlarm[0] + ' (' + lang.echo('board #') + '9)'
                }
                sendTelegramMessage(options.body)
                new Notification(board9.innerHTML, options) // eslint-disable-line
                clearInterval(window.boardAlert9)
                settings.board9_alarm = global.boardNineAlarm[0] + ',' + global.boardNineAlarm[1] + ',' + 'disable' + ','
                fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
              }
            }, 5000)
          }
          if (global.boardNineAlarm[1] === 'less') {
            clearInterval(window.boardAlert9)
            window.boardAlert9 = setInterval(function () {
              if (Number(board9.innerHTML) < Number(global.boardNineAlarm[0])) {
                // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
                var Sound = { // eslint-disable-line
                  audio: null,
                  play: function (path) {
                    this.audio = new Audio(path) // eslint-disable-line
                    if (this.audio !== null) this.audio.pause()
                    this.audio.play()
                  }
                }
                Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
                var options = { // eslint-disable-line
                  icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  body: lang.echo('Ticker\'s value less than ') + global.boardNineAlarm[0] + ' (' + lang.echo('board #') + '9)'
                }
                sendTelegramMessage(options.body)
                new Notification(board9.innerHTML, options) // eslint-disable-line
                clearInterval(window.boardAlert9)
                settings.board9_alarm = global.boardNineAlarm[0] + ',' + global.boardNineAlarm[1] + ',' + 'disable' + ','
                fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
              }
            }, 5000)
          }
          if (global.boardNineAlarm[1] === 'lessEqual') {
            clearInterval(window.boardAlert9)
            window.boardAlert9 = setInterval(function () {
              if (Number(board9.innerHTML) <= Number(global.boardNineAlarm[0])) {
                // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
                var Sound = { // eslint-disable-line
                  audio: null,
                  play: function (path) {
                    this.audio = new Audio(path) // eslint-disable-line
                    if (this.audio !== null) this.audio.pause()
                    this.audio.play()
                  }
                }
                Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
                var options = { // eslint-disable-line
                  icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  body: lang.echo('Ticker\'s value less or equal to ') + global.boardNineAlarm[0] + ' (' + lang.echo('board #') + '9)'
                }
                sendTelegramMessage(options.body)
                new Notification(board9.innerHTML, options) // eslint-disable-line
                clearInterval(window.boardAlert9)
                settings.board9_alarm = global.boardNineAlarm[0] + ',' + global.boardNineAlarm[1] + ',' + 'disable' + ','
                fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
              }
            }, 5000)
          }
          if (global.boardNineAlarm[1] === 'date') {
            clearInterval(window.boardAlert9)
            window.boardAlert9 = setInterval(function () {
              const setDate = new Date(global.boardNineAlarm[3])
              if (setDate.getTime() <= new Date().getTime()) {
                // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
                var Sound = { // eslint-disable-line
                  audio: null,
                  play: function (path) {
                    this.audio = new Audio(path) // eslint-disable-line
                    if (this.audio !== null) this.audio.pause()
                    this.audio.play()
                  }
                }
                Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
                var options = { // eslint-disable-line
                  icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  body: lang.echo('Ticker\'s value ') + board9.innerHTML + ' (' + lang.echo('board #') + '9)'
                }
                sendTelegramMessage(options.body)
                new Notification(new Date(), options) // eslint-disable-line
                clearInterval(window.boardAlert9)
                settings.board9_alarm = global.boardNineAlarm[0] + ',' + global.boardNineAlarm[1] + ',' + 'disable' + ',' + global.boardNineAlarm[3]
                fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
              }
            }, 5000)
          }
        }
        if (global.boardTenAlarm[2] === 'enable') {
          if (global.boardTenAlarm[1] === 'more') {
            clearInterval(window.boardAlert10)
            window.boardAlert10 = setInterval(function () {
              if (Number(board10.innerHTML) > Number(global.boardTenAlarm[0])) {
                // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
                var Sound = { // eslint-disable-line
                  audio: null,
                  play: function (path) {
                    this.audio = new Audio(path) // eslint-disable-line
                    if (this.audio !== null) this.audio.pause()
                    this.audio.play()
                  }
                }
                Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
                var options = { // eslint-disable-line
                  icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  body: lang.echo('Ticker\'s value higher than ') + global.boardTenAlarm[0] + ' (' + lang.echo('board #') + '10)'
                }
                sendTelegramMessage(options.body)
                new Notification(board10.innerHTML, options) // eslint-disable-line
                clearInterval(window.boardAlert9)
                settings.board10_alarm = global.boardTenAlarm[0] + ',' + global.boardTenAlarm[1] + ',' + 'disable' + ','
                fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
              }
            }, 5000)
          }
          if (global.boardTenAlarm[1] === 'moreEqual') {
            clearInterval(window.boardAlert10)
            window.boardAlert10 = setInterval(function () {
              if (Number(board10.innerHTML) >= Number(global.boardTenAlarm[0])) {
                // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
                var Sound = { // eslint-disable-line
                  audio: null,
                  play: function (path) {
                    this.audio = new Audio(path) // eslint-disable-line
                    if (this.audio !== null) this.audio.pause()
                    this.audio.play()
                  }
                }
                Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
                var options = { // eslint-disable-line
                  icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  body: lang.echo('Ticker\'s value higher or equal to ') + global.boardTenAlarm[0] + ' (' + lang.echo('board #') + '10)'
                }
                sendTelegramMessage(options.body)
                new Notification(board10.innerHTML, options) // eslint-disable-line
                clearInterval(window.boardAlert10)
                settings.board10_alarm = global.boardTenAlarm[0] + ',' + global.boardTenAlarm[1] + ',' + 'disable' + ','
                fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
              }
            }, 5000)
          }
          if (global.boardTenAlarm[1] === 'equal') {
            clearInterval(window.boardAlert10)
            window.boardAlert10 = setInterval(function () {
              if (Number(board10.innerHTML) === Number(global.boardTenAlarm[0])) {
                // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
                var Sound = { // eslint-disable-line
                  audio: null,
                  play: function (path) {
                    this.audio = new Audio(path) // eslint-disable-line
                    if (this.audio !== null) this.audio.pause()
                    this.audio.play()
                  }
                }
                Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
                var options = { // eslint-disable-line
                  icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  body: lang.echo('Ticker\'s value equal to ') + global.boardTenAlarm[0] + ' (' + lang.echo('board #') + '10)'
                }
                sendTelegramMessage(options.body)
                new Notification(board10.innerHTML, options) // eslint-disable-line
                clearInterval(window.boardAlert10)
                settings.board10_alarm = global.boardTenAlarm[0] + ',' + global.boardTenAlarm[1] + ',' + 'disable' + ','
                fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
              }
            }, 5000)
          }
          if (global.boardTenAlarm[1] === 'less') {
            clearInterval(window.boardAlert10)
            window.boardAlert10 = setInterval(function () {
              if (Number(board10.innerHTML) < Number(global.boardTenAlarm[0])) {
                // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
                var Sound = { // eslint-disable-line
                  audio: null,
                  play: function (path) {
                    this.audio = new Audio(path) // eslint-disable-line
                    if (this.audio !== null) this.audio.pause()
                    this.audio.play()
                  }
                }
                Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
                var options = { // eslint-disable-line
                  icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  body: lang.echo('Ticker\'s value less than ') + global.boardTenAlarm[0] + ' (' + lang.echo('board #') + '10)'
                }
                sendTelegramMessage(options.body)
                new Notification(board10.innerHTML, options) // eslint-disable-line
                clearInterval(window.boardAlert10)
                settings.board10_alarm = global.boardTenAlarm[0] + ',' + global.boardTenAlarm[1] + ',' + 'disable' + ','
                fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
              }
            }, 5000)
          }
          if (global.boardTenAlarm[1] === 'lessEqual') {
            clearInterval(window.boardAlert10)
            window.boardAlert10 = setInterval(function () {
              if (Number(board10.innerHTML) <= Number(global.boardTenAlarm[0])) {
                // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
                var Sound = { // eslint-disable-line
                  audio: null,
                  play: function (path) {
                    this.audio = new Audio(path) // eslint-disable-line
                    if (this.audio !== null) this.audio.pause()
                    this.audio.play()
                  }
                }
                Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
                var options = { // eslint-disable-line
                  icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  body: lang.echo('Ticker\'s value less or equal to ') + global.boardTenAlarm[0] + ' (' + lang.echo('board #') + '10)'
                }
                sendTelegramMessage(options.body)
                new Notification(board10.innerHTML, options) // eslint-disable-line
                clearInterval(window.boardAlert10)
                settings.board10_alarm = global.boardTenAlarm[0] + ',' + global.boardTenAlarm[1] + ',' + 'disable' + ','
                fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
              }
            }, 5000)
          }
          if (global.boardTenAlarm[1] === 'date') {
            clearInterval(window.boardAlert10)
            window.boardAlert10 = setInterval(function () {
              const setDate = new Date(global.boardTenAlarm[3])
              if (setDate.getTime() <= new Date().getTime()) {
                // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
                var Sound = { // eslint-disable-line
                  audio: null,
                  play: function (path) {
                    this.audio = new Audio(path) // eslint-disable-line
                    if (this.audio !== null) this.audio.pause()
                    this.audio.play()
                  }
                }
                Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
                var options = { // eslint-disable-line
                  icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  body: lang.echo('Ticker\'s value ') + board10.innerHTML + ' (' + lang.echo('board #') + '10)'
                }
                sendTelegramMessage(options.body)
                new Notification(new Date(), options) // eslint-disable-line
                clearInterval(window.boardAlert10)
                settings.board10_alarm = global.boardTenAlarm[0] + ',' + global.boardTenAlarm[1] + ',' + 'disable' + ',' + global.boardTenAlarm[3]
                fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
              }
            }, 5000)
          }
        }
        if (global.boardElevenAlarm[2] === 'enable') {
          if (global.boardElevenAlarm[1] === 'more') {
            clearInterval(window.boardAlert11)
            window.boardAlert11 = setInterval(function () {
              if (Number(board11.innerHTML) > Number(global.boardElevenAlarm[0])) {
                // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
                var Sound = { // eslint-disable-line
                  audio: null,
                  play: function (path) {
                    this.audio = new Audio(path) // eslint-disable-line
                    if (this.audio !== null) this.audio.pause()
                    this.audio.play()
                  }
                }
                Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
                var options = { // eslint-disable-line
                  icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  body: lang.echo('Ticker\'s value higher than ') + global.boardElevenAlarm[0] + ' (' + lang.echo('board #') + '11)'
                }
                sendTelegramMessage(options.body)
                new Notification(board11.innerHTML, options) // eslint-disable-line
                clearInterval(window.boardAlert11)
                settings.board11_alarm = global.boardElevenAlarm[0] + ',' + global.boardElevenAlarm[1] + ',' + 'disable' + ','
                fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
              }
            }, 5000)
          }
          if (global.boardElevenAlarm[1] === 'moreEqual') {
            clearInterval(window.boardAlert11)
            window.boardAlert11 = setInterval(function () {
              if (Number(board11.innerHTML) >= Number(global.boardElevenAlarm[0])) {
                // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
                var Sound = { // eslint-disable-line
                  audio: null,
                  play: function (path) {
                    this.audio = new Audio(path) // eslint-disable-line
                    if (this.audio !== null) this.audio.pause()
                    this.audio.play()
                  }
                }
                Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
                var options = { // eslint-disable-line
                  icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  body: lang.echo('Ticker\'s value higher or equal to ') + global.boardElevenAlarm[0] + global.boardElevenAlarm[0] + ' (' + lang.echo('board #') + '11)'
                }
                sendTelegramMessage(options.body)
                new Notification(board11.innerHTML, options) // eslint-disable-line
                clearInterval(window.boardAlert11)
                settings.board11_alarm = global.boardElevenAlarm[0] + ',' + global.boardElevenAlarm[1] + ',' + 'disable' + ','
                fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
              }
            }, 5000)
          }
          if (global.boardElevenAlarm[1] === 'equal') {
            clearInterval(window.boardAlert11)
            window.boardAlert11 = setInterval(function () {
              if (Number(board11.innerHTML) === Number(global.boardElevenAlarm[0])) {
                // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
                var Sound = { // eslint-disable-line
                  audio: null,
                  play: function (path) {
                    this.audio = new Audio(path) // eslint-disable-line
                    if (this.audio !== null) this.audio.pause()
                    this.audio.play()
                  }
                }
                Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
                var options = { // eslint-disable-line
                  icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  body: lang.echo('Ticker\'s value equal to ') + global.boardElevenAlarm[0] + global.boardElevenAlarm[0] + ' (' + lang.echo('board #') + '11)'
                }
                sendTelegramMessage(options.body)
                new Notification(board11.innerHTML, options) // eslint-disable-line
                clearInterval(window.boardAlert11)
                settings.board11_alarm = global.boardElevenAlarm[0] + ',' + global.boardElevenAlarm[1] + ',' + 'disable' + ','
                fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
              }
            }, 5000)
          }
          if (global.boardElevenAlarm[1] === 'less') {
            clearInterval(window.boardAlert11)
            window.boardAlert11 = setInterval(function () {
              if (Number(board11.innerHTML) < Number(global.boardElevenAlarm[0])) {
                // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
                var Sound = { // eslint-disable-line
                  audio: null,
                  play: function (path) {
                    this.audio = new Audio(path) // eslint-disable-line
                    if (this.audio !== null) this.audio.pause()
                    this.audio.play()
                  }
                }
                Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
                var options = { // eslint-disable-line
                  icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  body: lang.echo('Ticker\'s value less than ') + global.boardElevenAlarm[0] + global.boardElevenAlarm[0] + ' (' + lang.echo('board #') + '11)'
                }
                sendTelegramMessage(options.body)
                new Notification(board11.innerHTML, options) // eslint-disable-line
                clearInterval(window.boardAlert11)
                settings.board11_alarm = global.boardElevenAlarm[0] + ',' + global.boardElevenAlarm[1] + ',' + 'disable' + ','
                fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
              }
            }, 5000)
          }
          if (global.boardElevenAlarm[1] === 'lessEqual') {
            clearInterval(window.boardAlert11)
            window.boardAlert11 = setInterval(function () {
              if (Number(board11.innerHTML) <= Number(global.boardElevenAlarm[0])) {
                // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
                var Sound = { // eslint-disable-line
                  audio: null,
                  play: function (path) {
                    this.audio = new Audio(path) // eslint-disable-line
                    if (this.audio !== null) this.audio.pause()
                    this.audio.play()
                  }
                }
                Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
                var options = { // eslint-disable-line
                  icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  body: lang.echo('Ticker\'s value less or equal to ') + global.boardElevenAlarm[0] + global.boardElevenAlarm[0] + ' (' + lang.echo('board #') + '11)'
                }
                sendTelegramMessage(options.body)
                new Notification(board11.innerHTML, options) // eslint-disable-line
                clearInterval(window.boardAlert11)
                settings.board11_alarm = global.boardElevenAlarm[0] + ',' + global.boardElevenAlarm[1] + ',' + 'disable' + ','
                fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
              }
            }, 5000)
          }
          if (global.boardElevenAlarm[1] === 'date') {
            clearInterval(window.boardAlert11)
            window.boardAlert11 = setInterval(function () {
              const setDate = new Date(global.boardElevenAlarm[3])
              if (setDate.getTime() <= new Date().getTime()) {
                // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
                var Sound = { // eslint-disable-line
                  audio: null,
                  play: function (path) {
                    this.audio = new Audio(path) // eslint-disable-line
                    if (this.audio !== null) this.audio.pause()
                    this.audio.play()
                  }
                }
                Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
                var options = { // eslint-disable-line
                  icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  body: lang.echo('Ticker\'s value ') + board11.innerHTML + global.boardElevenAlarm[0] + ' (' + lang.echo('board #') + '11)'
                }
                sendTelegramMessage(options.body)
                new Notification(new Date(), options) // eslint-disable-line
                clearInterval(window.boardAlert11)
                settings.board11_alarm = global.boardElevenAlarm[0] + ',' + global.boardElevenAlarm[1] + ',' + 'disable' + ',' + global.boardElevenAlarm[3]
                fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
              }
            }, 5000)
          }
        }
        if (global.boardTwelveAlarm[2] === 'enable') {
          if (global.boardTwelveAlarm[1] === 'more') {
            clearInterval(window.boardAlert12)
            window.boardAlert12 = setInterval(function () {
              if (Number(board12.innerHTML) > Number(global.boardTwelveAlarm[0])) {
                // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
                var Sound = { // eslint-disable-line
                  audio: null,
                  play: function (path) {
                    this.audio = new Audio(path) // eslint-disable-line
                    if (this.audio !== null) this.audio.pause()
                    this.audio.play()
                  }
                }
                Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
                var options = { // eslint-disable-line
                  icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  body: lang.echo('Ticker\'s value higher than ') + global.boardTwelveAlarm[0] + global.boardElevenAlarm[0] + ' (' + lang.echo('board #') + '12)'
                }
                sendTelegramMessage(options.body)
                new Notification(board12.innerHTML, options) // eslint-disable-line
                clearInterval(window.boardAlert12)
                settings.board12_alarm = global.boardTwelveAlarm[0] + ',' + global.boardTwelveAlarm[1] + ',' + 'disable' + ','
                fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
              }
            }, 5000)
          }
          if (global.boardTwelveAlarm[1] === 'moreEqual') {
            clearInterval(window.boardAlert12)
            window.boardAlert12 = setInterval(function () {
              if (Number(board12.innerHTML) >= Number(global.boardTwelveAlarm[0])) {
                // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
                var Sound = { // eslint-disable-line
                  audio: null,
                  play: function (path) {
                    this.audio = new Audio(path) // eslint-disable-line
                    if (this.audio !== null) this.audio.pause()
                    this.audio.play()
                  }
                }
                Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
                var options = { // eslint-disable-line
                  icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  body: lang.echo('Ticker\'s value higher or equal to ') + global.boardTwelveAlarm[0] + global.boardElevenAlarm[0] + ' (' + lang.echo('board #') + '12)'
                }
                sendTelegramMessage(options.body)
                new Notification(board12.innerHTML, options) // eslint-disable-line
                clearInterval(window.boardAlert12)
                settings.board12_alarm = global.boardTwelveAlarm[0] + ',' + global.boardTwelveAlarm[1] + ',' + 'disable' + ','
                fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
              }
            }, 5000)
          }
          if (global.boardTwelveAlarm[1] === 'equal') {
            clearInterval(window.boardAlert12)
            window.boardAlert12 = setInterval(function () {
              if (Number(board12.innerHTML) === Number(global.boardTwelveAlarm[0])) {
                // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
                var Sound = { // eslint-disable-line
                  audio: null,
                  play: function (path) {
                    this.audio = new Audio(path) // eslint-disable-line
                    if (this.audio !== null) this.audio.pause()
                    this.audio.play()
                  }
                }
                Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
                var options = { // eslint-disable-line
                  icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  body: lang.echo('Ticker\'s value equal to ') + global.boardTwelveAlarm[0] + global.boardElevenAlarm[0] + ' (' + lang.echo('board #') + '12)'
                }
                sendTelegramMessage(options.body)
                new Notification(board12.innerHTML, options) // eslint-disable-line
                clearInterval(window.boardAlert12)
                settings.board12_alarm = global.boardTwelveAlarm[0] + ',' + global.boardTwelveAlarm[1] + ',' + 'disable' + ','
                fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
              }
            }, 5000)
          }
          if (global.boardTwelveAlarm[1] === 'less') {
            clearInterval(window.boardAlert12)
            window.boardAlert12 = setInterval(function () {
              if (Number(board12.innerHTML) < Number(global.boardTwelveAlarm[0])) {
                // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
                var Sound = { // eslint-disable-line
                  audio: null,
                  play: function (path) {
                    this.audio = new Audio(path) // eslint-disable-line
                    if (this.audio !== null) this.audio.pause()
                    this.audio.play()
                  }
                }
                Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
                var options = { // eslint-disable-line
                  icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  body: lang.echo('Ticker\'s value less than ') + global.boardTwelveAlarm[0] + global.boardElevenAlarm[0] + ' (' + lang.echo('board #') + '12)'
                }
                sendTelegramMessage(options.body)
                new Notification(board12.innerHTML, options) // eslint-disable-line
                clearInterval(window.boardAlert12)
                settings.board12_alarm = global.boardTwelveAlarm[0] + ',' + global.boardTwelveAlarm[1] + ',' + 'disable' + ','
                fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
              }
            }, 5000)
          }
          if (global.boardTwelveAlarm[1] === 'lessEqual') {
            clearInterval(window.boardAlert12)
            window.boardAlert12 = setInterval(function () {
              if (Number(board12.innerHTML) <= Number(global.boardTwelveAlarm[0])) {
                // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
                var Sound = { // eslint-disable-line
                  audio: null,
                  play: function (path) {
                    this.audio = new Audio(path) // eslint-disable-line
                    if (this.audio !== null) this.audio.pause()
                    this.audio.play()
                  }
                }
                Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
                var options = { // eslint-disable-line
                  icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  body: lang.echo('Ticker\'s value less or equal to ') + global.boardTwelveAlarm[0] + global.boardElevenAlarm[0] + ' (' + lang.echo('board #') + '12)'
                }
                sendTelegramMessage(options.body)
                new Notification(board12.innerHTML, options) // eslint-disable-line
                clearInterval(window.boardAlert12)
                settings.board12_alarm = global.boardTwelveAlarm[0] + ',' + global.boardTwelveAlarm[1] + ',' + 'disable' + ','
                fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
              }
            }, 5000)
          }
          if (global.boardTwelveAlarm[1] === 'date') {
            clearInterval(window.boardAlert12)
            window.boardAlert12 = setInterval(function () {
              const setDate = new Date(global.boardTwelveAlarm[3])
              if (setDate.getTime() <= new Date().getTime()) {
                // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
                var Sound = { // eslint-disable-line
                  audio: null,
                  play: function (path) {
                    this.audio = new Audio(path) // eslint-disable-line
                    if (this.audio !== null) this.audio.pause()
                    this.audio.play()
                  }
                }
                Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
                var options = { // eslint-disable-line
                  icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  body: lang.echo('Ticker\'s value ') + board12.innerHTML + global.boardElevenAlarm[0] + ' (' + lang.echo('board #') + '12)'
                }
                sendTelegramMessage(options.body)
                new Notification(new Date(), options) // eslint-disable-line
                clearInterval(window.boardAlert12)
                settings.board12_alarm = global.boardTwelveAlarm[0] + ',' + global.boardTwelveAlarm[1] + ',' + 'disable' + ',' + global.boardTwelveAlarm[3]
                fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
              }
            }, 5000)
          }
        }
        if (global.boardThirteenAlarm[2] === 'enable') {
          if (global.boardThirteenAlarm[1] === 'more') {
            clearInterval(window.boardAlert13)
            window.boardAlert13 = setInterval(function () {
              if (Number(board13.innerHTML) > Number(global.boardThirteenAlarm[0])) {
                // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
                var Sound = { // eslint-disable-line
                  audio: null,
                  play: function (path) {
                    this.audio = new Audio(path) // eslint-disable-line
                    if (this.audio !== null) this.audio.pause()
                    this.audio.play()
                  }
                }
                Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
                var options = { // eslint-disable-line
                  icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  body: lang.echo('Ticker\'s value higher than ') + global.boardThirteenAlarm[0] + global.boardElevenAlarm[0] + ' (' + lang.echo('board #') + '13)'
                }
                sendTelegramMessage(options.body)
                new Notification(board13.innerHTML, options) // eslint-disable-line
                clearInterval(window.boardAlert13)
                settings.board13_alarm = global.boardThirteenAlarm[0] + ',' + global.boardThirteenAlarm[1] + ',' + 'disable' + ','
                fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
              }
            }, 5000)
          }
          if (global.boardThirteenAlarm[1] === 'moreEqual') {
            clearInterval(window.boardAlert13)
            window.boardAlert13 = setInterval(function () {
              if (Number(board13.innerHTML) >= Number(global.boardThirteenAlarm[0])) {
                // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
                var Sound = { // eslint-disable-line
                  audio: null,
                  play: function (path) {
                    this.audio = new Audio(path) // eslint-disable-line
                    if (this.audio !== null) this.audio.pause()
                    this.audio.play()
                  }
                }
                Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
                var options = { // eslint-disable-line
                  icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  body: lang.echo('Ticker\'s value higher or equal to ') + global.boardThirteenAlarm[0] + global.boardElevenAlarm[0] + ' (' + lang.echo('board #') + '13)'
                }
                sendTelegramMessage(options.body)
                new Notification(board13.innerHTML, options) // eslint-disable-line
                clearInterval(window.boardAlert13)
                settings.board13_alarm = global.boardThirteenAlarm[0] + ',' + global.boardThirteenAlarm[1] + ',' + 'disable' + ','
                fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
              }
            }, 5000)
          }
          if (global.boardThirteenAlarm[1] === 'equal') {
            clearInterval(window.boardAlert13)
            window.boardAlert13 = setInterval(function () {
              if (Number(board13.innerHTML) === Number(global.boardThirteenAlarm[0])) {
                // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
                var Sound = { // eslint-disable-line
                  audio: null,
                  play: function (path) {
                    this.audio = new Audio(path) // eslint-disable-line
                    if (this.audio !== null) this.audio.pause()
                    this.audio.play()
                  }
                }
                Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
                var options = { // eslint-disable-line
                  icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  body: lang.echo('Ticker\'s value equal to ') + global.boardThirteenAlarm[0] + global.boardElevenAlarm[0] + ' (' + lang.echo('board #') + '13)'
                }
                sendTelegramMessage(options.body)
                new Notification(board13.innerHTML, options) // eslint-disable-line
                clearInterval(window.boardAlert13)
                settings.board13_alarm = global.boardThirteenAlarm[0] + ',' + global.boardThirteenAlarm[1] + ',' + 'disable' + ','
                fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
              }
            }, 5000)
          }
          if (global.boardThirteenAlarm[1] === 'less') {
            clearInterval(window.boardAlert13)
            window.boardAlert13 = setInterval(function () {
              if (Number(board13.innerHTML) < Number(global.boardThirteenAlarm[0])) {
                // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
                var Sound = { // eslint-disable-line
                  audio: null,
                  play: function (path) {
                    this.audio = new Audio(path) // eslint-disable-line
                    if (this.audio !== null) this.audio.pause()
                    this.audio.play()
                  }
                }
                Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
                var options = { // eslint-disable-line
                  icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  body: lang.echo('Ticker\'s value less than ') + global.boardThirteenAlarm[0] + global.boardElevenAlarm[0] + ' (' + lang.echo('board #') + '13)'
                }
                sendTelegramMessage(options.body)
                new Notification(board13.innerHTML, options) // eslint-disable-line
                clearInterval(window.boardAlert13)
                settings.board13_alarm = global.boardThirteenAlarm[0] + ',' + global.boardThirteenAlarm[1] + ',' + 'disable' + ','
                fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
              }
            }, 5000)
          }
          if (global.boardThirteenAlarm[1] === 'lessEqual') {
            window.boardAlert13 = setInterval(function () {
              if (Number(board13.innerHTML) <= Number(global.boardThirteenAlarm[0])) {
                // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
                var Sound = { // eslint-disable-line
                  audio: null,
                  play: function (path) {
                    this.audio = new Audio(path) // eslint-disable-line
                    if (this.audio !== null) this.audio.pause()
                    this.audio.play()
                  }
                }
                Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
                var options = { // eslint-disable-line
                  icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  body: lang.echo('Ticker\'s value less or equal to ') + global.boardThirteenAlarm[0] + global.boardElevenAlarm[0] + ' (' + lang.echo('board #') + '13)'
                }
                sendTelegramMessage(options.body)
                new Notification(board13.innerHTML, options) // eslint-disable-line
                clearInterval(window.boardAlert13)
                settings.board13_alarm = global.boardThirteenAlarm[0] + ',' + global.boardThirteenAlarm[1] + ',' + 'disable' + ','
                fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
              }
            }, 5000)
          }
          if (global.boardThirteenAlarm[1] === 'date') {
            clearInterval(window.boardAlert13)
            window.boardAlert13 = setInterval(function () {
              const setDate = new Date(global.boardThirteenAlarm[3])
              if (setDate.getTime() <= new Date().getTime()) {
                // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
                var Sound = { // eslint-disable-line
                  audio: null,
                  play: function (path) {
                    this.audio = new Audio(path) // eslint-disable-line
                    if (this.audio !== null) this.audio.pause()
                    this.audio.play()
                  }
                }
                Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
                var options = { // eslint-disable-line
                  icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  body: lang.echo('Ticker\'s value ') + board13.innerHTML + global.boardElevenAlarm[0] + ' (' + lang.echo('board #') + '13)'
                }
                sendTelegramMessage(options.body)
                new Notification(new Date(), options) // eslint-disable-line
                clearInterval(window.boardAlert13)
                settings.board13_alarm = global.boardThirteenAlarm[0] + ',' + global.boardThirteenAlarm[1] + ',' + 'disable' + ',' + global.boardThirteenAlarm[3]
                fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
              }
            }, 5000)
          }
        }
        if (global.boardFourteenAlarm[2] === 'enable') {
          if (global.boardFourteenAlarm[1] === 'more') {
            clearInterval(window.boardAlert14)
            window.boardAlert14 = setInterval(function () {
              if (Number(board14.innerHTML) > Number(global.boardFourteenAlarm[0])) {
                // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
                var Sound = { // eslint-disable-line
                  audio: null,
                  play: function (path) {
                    this.audio = new Audio(path) // eslint-disable-line
                    if (this.audio !== null) this.audio.pause()
                    this.audio.play()
                  }
                }
                Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
                var options = { // eslint-disable-line
                  icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  body: lang.echo('Ticker\'s value higher than ') + global.boardFourteenAlarm[0] + global.boardElevenAlarm[0] + ' (' + lang.echo('board #') + '14)'
                }
                sendTelegramMessage(options.body)
                new Notification(board14.innerHTML, options) // eslint-disable-line
                clearInterval(window.boardAlert14)
                settings.board14_alarm = global.boardFourteenAlarm[0] + ',' + global.boardFourteenAlarm[1] + ',' + 'disable' + ','
                fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
              }
            }, 5000)
          }
          if (global.boardFourteenAlarm[1] === 'moreEqual') {
            clearInterval(window.boardAlert14)
            window.boardAlert14 = setInterval(function () {
              if (Number(board14.innerHTML) >= Number(global.boardFourteenAlarm[0])) {
                // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
                var Sound = { // eslint-disable-line
                  audio: null,
                  play: function (path) {
                    this.audio = new Audio(path) // eslint-disable-line
                    if (this.audio !== null) this.audio.pause()
                    this.audio.play()
                  }
                }
                Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
                var options = { // eslint-disable-line
                  icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  body: lang.echo('Ticker\'s value higher or equal to ') + global.boardFourteenAlarm[0] + global.boardElevenAlarm[0] + ' (' + lang.echo('board #') + '14)'
                }
                sendTelegramMessage(options.body)
                new Notification(board14.innerHTML, options) // eslint-disable-line
                clearInterval(window.boardAlert14)
                settings.board14_alarm = global.boardFourteenAlarm[0] + ',' + global.boardFourteenAlarm[1] + ',' + 'disable' + ','
                fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
              }
            }, 5000)
          }
          if (global.boardFourteenAlarm[1] === 'equal') {
            clearInterval(window.boardAlert14)
            window.boardAlert14 = setInterval(function () {
              if (Number(board14.innerHTML) === Number(global.boardFourteenAlarm[0])) {
                // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
                var Sound = { // eslint-disable-line
                  audio: null,
                  play: function (path) {
                    this.audio = new Audio(path) // eslint-disable-line
                    if (this.audio !== null) this.audio.pause()
                    this.audio.play()
                  }
                }
                Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
                var options = { // eslint-disable-line
                  icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  body: lang.echo('Ticker\'s value equal to ') + global.boardFourteenAlarm[0] + global.boardElevenAlarm[0] + ' (' + lang.echo('board #') + '14)'
                }
                sendTelegramMessage(options.body)
                new Notification(board14.innerHTML, options) // eslint-disable-line
                clearInterval(window.boardAlert14)
                settings.board14_alarm = global.boardFourteenAlarm[0] + ',' + global.boardFourteenAlarm[1] + ',' + 'disable' + ','
                fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
              }
            }, 5000)
          }
          if (global.boardFourteenAlarm[1] === 'less') {
            clearInterval(window.boardAlert14)
            window.boardAlert14 = setInterval(function () {
              if (Number(board14.innerHTML) < Number(global.boardFourteenAlarm[0])) {
                // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
                var Sound = { // eslint-disable-line
                  audio: null,
                  play: function (path) {
                    this.audio = new Audio(path) // eslint-disable-line
                    if (this.audio !== null) this.audio.pause()
                    this.audio.play()
                  }
                }
                Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
                var options = { // eslint-disable-line
                  icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  body: lang.echo('Ticker\'s value less than ') + global.boardFourteenAlarm[0] + global.boardElevenAlarm[0] + ' (' + lang.echo('board #') + '14)'
                }
                sendTelegramMessage(options.body)
                new Notification(board14.innerHTML, options) // eslint-disable-line
                clearInterval(window.boardAlert14)
                settings.board14_alarm = global.boardFourteenAlarm[0] + ',' + global.boardFourteenAlarm[1] + ',' + 'disable' + ','
                fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
              }
            }, 5000)
          }
          if (global.boardFourteenAlarm[1] === 'lessEqual') {
            clearInterval(window.boardAlert14)
            window.boardAlert14 = setInterval(function () {
              if (Number(board14.innerHTML) <= Number(global.boardFourteenAlarm[0])) {
                // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
                var Sound = { // eslint-disable-line
                  audio: null,
                  play: function (path) {
                    this.audio = new Audio(path) // eslint-disable-line
                    if (this.audio !== null) this.audio.pause()
                    this.audio.play()
                  }
                }
                Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
                var options = { // eslint-disable-line
                  icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  body: lang.echo('Ticker\'s value less or equal to ') + global.boardFourteenAlarm[0] + global.boardElevenAlarm[0] + ' (' + lang.echo('board #') + '14)'
                }
                sendTelegramMessage(options.body)
                new Notification(board14.innerHTML, options) // eslint-disable-line
                clearInterval(window.boardAlert14)
                settings.board14_alarm = global.boardFourteenAlarm[0] + ',' + global.boardFourteenAlarm[1] + ',' + 'disable' + ','
                fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
              }
            }, 5000)
          }
          if (global.boardFourteenAlarm[1] === 'date') {
            clearInterval(window.boardAlert14)
            window.boardAlert14 = setInterval(function () {
              const setDate = new Date(global.boardFourteenAlarm[3])
              if (setDate.getTime() <= new Date().getTime()) {
                // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
                var Sound = { // eslint-disable-line
                  audio: null,
                  play: function (path) {
                    this.audio = new Audio(path) // eslint-disable-line
                    if (this.audio !== null) this.audio.pause()
                    this.audio.play()
                  }
                }
                Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
                var options = { // eslint-disable-line
                  icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  body: lang.echo('Ticker\'s value ') + board14.innerHTML + global.boardElevenAlarm[0] + ' (' + lang.echo('board #') + '14)'
                }
                sendTelegramMessage(options.body)
                new Notification(new Date(), options) // eslint-disable-line
                clearInterval(window.boardAlert14)
                settings.board14_alarm = global.boardFourteenAlarm[0] + ',' + global.boardFourteenAlarm[1] + ',' + 'disable' + ',' + global.boardFourteenAlarm[3]
                fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
              }
            }, 5000)
          }
        }
        if (global.boardFifteenAlarm[2] === 'enable') {
          if (global.boardFifteenAlarm[1] === 'more') {
            clearInterval(window.boardAlert15)
            window.boardAlert15 = setInterval(function () {
              if (Number(board15.innerHTML) > Number(global.boardFifteenAlarm[0])) {
                // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
                var Sound = { // eslint-disable-line
                  audio: null,
                  play: function (path) {
                    this.audio = new Audio(path) // eslint-disable-line
                    if (this.audio !== null) this.audio.pause()
                    this.audio.play()
                  }
                }
                Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
                var options = { // eslint-disable-line
                  icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  body: lang.echo('Ticker\'s value higher than ') + global.boardFifteenAlarm[0] + global.boardElevenAlarm[0] + ' (' + lang.echo('board #') + '15)'
                }
                sendTelegramMessage(options.body)
                new Notification(board15.innerHTML, options) // eslint-disable-line
                clearInterval(window.boardAlert15)
                settings.board15_alarm = global.boardFifteenAlarm[0] + ',' + global.boardFifteenAlarm[1] + ',' + 'disable' + ','
                fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
              }
            }, 5000)
          }
          if (global.boardFifteenAlarm[1] === 'moreEqual') {
            clearInterval(window.boardAlert15)
            window.boardAlert15 = setInterval(function () {
              if (Number(board15.innerHTML) >= Number(global.boardFifteenAlarm[0])) {
                // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
                var Sound = { // eslint-disable-line
                  audio: null,
                  play: function (path) {
                    this.audio = new Audio(path) // eslint-disable-line
                    if (this.audio !== null) this.audio.pause()
                    this.audio.play()
                  }
                }
                Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
                var options = { // eslint-disable-line
                  icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  body: lang.echo('Ticker\'s value higher or equal to ') + global.boardFifteenAlarm[0] + global.boardElevenAlarm[0] + ' (' + lang.echo('board #') + '15)'
                }
                sendTelegramMessage(options.body)
                new Notification(board15.innerHTML, options) // eslint-disable-line
                clearInterval(window.boardAlert15)
                settings.board15_alarm = global.boardFifteenAlarm[0] + ',' + global.boardFifteenAlarm[1] + ',' + 'disable' + ','
                fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
              }
            }, 5000)
          }
          if (global.boardFifteenAlarm[1] === 'equal') {
            clearInterval(window.boardAlert15)
            window.boardAlert15 = setInterval(function () {
              if (Number(board15.innerHTML) === Number(global.boardFifteenAlarm[0])) {
                // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
                var Sound = { // eslint-disable-line
                  audio: null,
                  play: function (path) {
                    this.audio = new Audio(path) // eslint-disable-line
                    if (this.audio !== null) this.audio.pause()
                    this.audio.play()
                  }
                }
                Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
                var options = { // eslint-disable-line
                  icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  body: lang.echo('Ticker\'s value equal to ') + global.boardFifteenAlarm[0] + global.boardElevenAlarm[0] + ' (' + lang.echo('board #') + '15)'
                }
                sendTelegramMessage(options.body)
                new Notification(board15.innerHTML, options) // eslint-disable-line
                clearInterval(window.boardAlert15)
                settings.board15_alarm = global.boardFifteenAlarm[0] + ',' + global.boardFifteenAlarm[1] + ',' + 'disable' + ','
                fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
              }
            }, 5000)
          }
          if (global.boardFifteenAlarm[1] === 'less') {
            clearInterval(window.boardAlert15)
            window.boardAlert15 = setInterval(function () {
              if (Number(board15.innerHTML) < Number(global.boardFifteenAlarm[0])) {
                // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
                var Sound = { // eslint-disable-line
                  audio: null,
                  play: function (path) {
                    this.audio = new Audio(path) // eslint-disable-line
                    if (this.audio !== null) this.audio.pause()
                    this.audio.play()
                  }
                }
                Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
                var options = { // eslint-disable-line
                  icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  body: lang.echo('Ticker\'s value less than ') + global.boardFifteenAlarm[0] + global.boardElevenAlarm[0] + ' (' + lang.echo('board #') + '15)'
                }
                sendTelegramMessage(options.body)
                new Notification(board15.innerHTML, options) // eslint-disable-line
                clearInterval(window.boardAlert15)
                settings.board15_alarm = global.boardFifteenAlarm[0] + ',' + global.boardFifteenAlarm[1] + ',' + 'disable' + ','
                fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
              }
            }, 5000)
          }
          if (global.boardFifteenAlarm[1] === 'lessEqual') {
            clearInterval(window.boardAlert15)
            window.boardAlert15 = setInterval(function () {
              if (Number(board15.innerHTML) <= Number(global.boardFifteenAlarm[0])) {
                // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
                var Sound = { // eslint-disable-line
                  audio: null,
                  play: function (path) {
                    this.audio = new Audio(path) // eslint-disable-line
                    if (this.audio !== null) this.audio.pause()
                    this.audio.play()
                  }
                }
                Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
                var options = { // eslint-disable-line
                  icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  body: lang.echo('Ticker\'s value less or equal to ') + global.boardFifteenAlarm[0] + global.boardElevenAlarm[0] + ' (' + lang.echo('board #') + '15)'
                }
                sendTelegramMessage(options.body)
                new Notification(board15.innerHTML, options) // eslint-disable-line
                clearInterval(window.boardAlert15)
                settings.board15_alarm = global.boardFifteenAlarm[0] + ',' + global.boardFifteenAlarm[1] + ',' + 'disable' + ','
                fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
              }
            }, 5000)
          }
          if (global.boardFifteenAlarm[1] === 'date') {
            clearInterval(window.boardAlert15)
            window.boardAlert15 = setInterval(function () {
              const setDate = new Date(global.boardFifteenAlarm[3])
              if (setDate.getTime() <= new Date().getTime()) {
                // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
                var Sound = { // eslint-disable-line
                  audio: null,
                  play: function (path) {
                    this.audio = new Audio(path) // eslint-disable-line
                    if (this.audio !== null) this.audio.pause()
                    this.audio.play()
                  }
                }
                Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
                var options = { // eslint-disable-line
                  icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  body: lang.echo('Ticker\'s value ') + board15.innerHTML + global.boardElevenAlarm[0] + ' (' + lang.echo('board #') + '15)'
                }
                sendTelegramMessage(options.body)
                new Notification(new Date(), options) // eslint-disable-line
                clearInterval(window.boardAlert15)
                settings.board15_alarm = global.boardFifteenAlarm[0] + ',' + global.boardFifteenAlarm[1] + ',' + 'disable' + ',' + global.boardFifteenAlarm[3]
                fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
              }
            }, 5000)
          }
        }
        if (global.boardSixteenAlarm[2] === 'enable') {
          if (global.boardSixteenAlarm[1] === 'more') {
            clearInterval(window.boardAlert16)
            window.boardAlert16 = setInterval(function () {
              if (Number(board16.innerHTML) > Number(global.boardSixteenAlarm[0])) {
                // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
                var Sound = { // eslint-disable-line
                  audio: null,
                  play: function (path) {
                    this.audio = new Audio(path) // eslint-disable-line
                    if (this.audio !== null) this.audio.pause()
                    this.audio.play()
                  }
                }
                Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
                var options = { // eslint-disable-line
                  icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  body: lang.echo('Ticker\'s value higher than ') + global.boardSixteenAlarm[0] + global.boardElevenAlarm[0] + ' (' + lang.echo('board #') + '16)'
                }
                sendTelegramMessage(options.body)
                new Notification(board16.innerHTML, options) // eslint-disable-line
                clearInterval(window.boardAlert16)
                settings.board16_alarm = global.boardSixteenAlarm[0] + ',' + global.boardSixteenAlarm[1] + ',' + 'disable' + ','
                fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
              }
            }, 5000)
          }
          if (global.boardSixteenAlarm[1] === 'moreEqual') {
            clearInterval(window.boardAlert16)
            window.boardAlert16 = setInterval(function () {
              if (Number(board16.innerHTML) >= Number(global.boardSixteenAlarm[0])) {
                // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
                var Sound = { // eslint-disable-line
                  audio: null,
                  play: function (path) {
                    this.audio = new Audio(path) // eslint-disable-line
                    if (this.audio !== null) this.audio.pause()
                    this.audio.play()
                  }
                }
                Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
                var options = { // eslint-disable-line
                  icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  body: lang.echo('Ticker\'s value higher or equal to ') + global.boardSixteenAlarm[0] + global.boardElevenAlarm[0] + ' (' + lang.echo('board #') + '16)'
                }
                sendTelegramMessage(options.body)
                new Notification(board16.innerHTML, options) // eslint-disable-line
                clearInterval(window.boardAlert16)
                settings.board16_alarm = global.boardSixteenAlarm[0] + ',' + global.boardSixteenAlarm[1] + ',' + 'disable' + ','
                fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
              }
            }, 5000)
          }
          if (global.boardSixteenAlarm[1] === 'equal') {
            clearInterval(window.boardAlert16)
            window.boardAlert16 = setInterval(function () {
              if (Number(board16.innerHTML) === Number(global.boardSixteenAlarm[0])) {
                // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
                var Sound = { // eslint-disable-line
                  audio: null,
                  play: function (path) {
                    this.audio = new Audio(path) // eslint-disable-line
                    if (this.audio !== null) this.audio.pause()
                    this.audio.play()
                  }
                }
                Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
                var options = { // eslint-disable-line
                  icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  body: lang.echo('Ticker\'s value equal to ') + global.boardSixteenAlarm[0] + global.boardElevenAlarm[0] + ' (' + lang.echo('board #') + '16)'
                }
                sendTelegramMessage(options.body)
                new Notification(board16.innerHTML, options) // eslint-disable-line
                clearInterval(window.boardAlert16)
                settings.board16_alarm = global.boardSixteenAlarm[0] + ',' + global.boardSixteenAlarm[1] + ',' + 'disable' + ','
                fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
              }
            }, 5000)
          }
          if (global.boardSixteenAlarm[1] === 'less') {
            clearInterval(window.boardAlert16)
            window.boardAlert16 = setInterval(function () {
              if (Number(board16.innerHTML) < Number(global.boardSixteenAlarm[0])) {
                // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
                var Sound = { // eslint-disable-line
                  audio: null,
                  play: function (path) {
                    this.audio = new Audio(path) // eslint-disable-line
                    if (this.audio !== null) this.audio.pause()
                    this.audio.play()
                  }
                }
                Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
                var options = { // eslint-disable-line
                  icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  body: lang.echo('Ticker\'s value less than ') + global.boardSixteenAlarm[0] + global.boardElevenAlarm[0] + ' (' + lang.echo('board #') + '16)'
                }
                sendTelegramMessage(options.body)
                new Notification(board16.innerHTML, options) // eslint-disable-line
                clearInterval(window.boardAlert16)
                settings.board16_alarm = global.boardSixteenAlarm[0] + ',' + global.boardSixteenAlarm[1] + ',' + 'disable' + ','
                fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
              }
            }, 5000)
          }
          if (global.boardSixteenAlarm[1] === 'lessEqual') {
            clearInterval(window.boardAlert16)
            window.boardAlert16 = setInterval(function () {
              if (Number(board16.innerHTML) <= Number(global.boardSixteenAlarm[0])) {
                // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
                var Sound = { // eslint-disable-line
                  audio: null,
                  play: function (path) {
                    this.audio = new Audio(path) // eslint-disable-line
                    if (this.audio !== null) this.audio.pause()
                    this.audio.play()
                  }
                }
                Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
                var options = { // eslint-disable-line
                  icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  body: lang.echo('Ticker\'s value less or equal to ') + global.boardSixteenAlarm[0] + global.boardElevenAlarm[0] + ' (' + lang.echo('board #') + '16)'
                }
                sendTelegramMessage(options.body)
                new Notification(board16.innerHTML, options) // eslint-disable-line
                clearInterval(window.boardAlert16)
                settings.board16_alarm = global.boardSixteenAlarm[0] + ',' + global.boardSixteenAlarm[1] + ',' + 'disable' + ','
                fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
              }
            }, 5000)
          }
          if (global.boardSixteenAlarm[1] === 'date') {
            clearInterval(window.boardAlert16)
            window.boardAlert16 = setInterval(function () {
              const setDate = new Date(global.boardSixteenAlarm[3])
              if (setDate.getTime() <= new Date().getTime()) {
                // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
                var Sound = { // eslint-disable-line
                  audio: null,
                  play: function (path) {
                    this.audio = new Audio(path) // eslint-disable-line
                    if (this.audio !== null) this.audio.pause()
                    this.audio.play()
                  }
                }
                Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
                var options = { // eslint-disable-line
                  icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  body: lang.echo('Ticker\'s value ') + board16.innerHTML + global.boardElevenAlarm[0] + ' (' + lang.echo('board #') + '16)'
                }
                sendTelegramMessage(options.body)
                new Notification(new Date(), options) // eslint-disable-line
                clearInterval(window.boardAlert16)
                settings.board16_alarm = global.boardSixteenAlarm[0] + ',' + global.boardSixteenAlarm[1] + ',' + 'disable' + ',' + global.boardSixteenAlarm[3]
                fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
              }
            }, 5000)
          }
        }
      }
    })
  },
  testBoardAlarm: function (boardNumber, value, sign, status, calendar) {
    var board = global.mainWindow.window.document.getElementById('board' + boardNumber)
    if (status === 'enable') {
      if (value !== '') {
        if (sign === 'more') {
          if (Number(board.innerHTML) > Number(value)) {
            // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
            var Sound = { // eslint-disable-line
              audio: null,
              play: function (path) {
                this.audio = new Audio(path) // eslint-disable-line
                if (this.audio !== null) this.audio.pause()
                this.audio.play()
              }
            }
            Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
            var options = { // eslint-disable-line
              icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
              badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
              body: lang.echo('Ticker\'s value higher than ') + value + ' (' + lang.echo('board #') + boardNumber + ')'
            }
            sendTelegramMessage(options.body)
            new Notification(board.innerHTML, options) // eslint-disable-line
          } else {
            tickers.appDialogWindow('{"window": "' + lang.echo('Rule execution failed') + '", "title": "' + lang.echo('Rule execution failed') + '", "message": "' + lang.echo('Rule execution test failed!') + lang.echo(' Current ticker\'s value ') + board.innerHTML + '"}')
          }
        }
        if (sign === 'moreEqual') {
          if (Number(board.innerHTML) >= Number(value)) {
            // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
            var Sound = { // eslint-disable-line
              audio: null,
              play: function (path) {
                this.audio = new Audio(path) // eslint-disable-line
                if (this.audio !== null) this.audio.pause()
                this.audio.play()
              }
            }
            Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
            var options = { // eslint-disable-line
              icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
              badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
              body: lang.echo('Ticker\'s value higher or equal to ') + value + ' (' + lang.echo('board #') + boardNumber + ')'
            }
            sendTelegramMessage(options.body)
            new Notification(board.innerHTML, options) // eslint-disable-line
          } else {
            tickers.appDialogWindow('{"window": "' + lang.echo('Rule execution failed') + '", "title": "' + lang.echo('Rule execution failed') + '", "message": "' + lang.echo('Rule execution test failed!') + lang.echo(' Current ticker\'s value ') + board.innerHTML + '"}')
          }
        }
        if (sign === 'equal') {
          if (Number(board.innerHTML) === Number(value)) {
            // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
            var Sound = { // eslint-disable-line
              audio: null,
              play: function (path) {
                this.audio = new Audio(path) // eslint-disable-line
                if (this.audio !== null) this.audio.pause()
                this.audio.play()
              }
            }
            Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
            var options = { // eslint-disable-line
              icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
              badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
              body: lang.echo('Ticker\'s value equal to ') + value + ' (' + lang.echo('board #') + boardNumber + ')'
            }
            sendTelegramMessage(options.body)
            new Notification(board.innerHTML, options) // eslint-disable-line
          } else {
            tickers.appDialogWindow('{"window": "' + lang.echo('Rule execution failed') + '", "title": "' + lang.echo('Rule execution failed') + '", "message": "' + lang.echo('Rule execution test failed!') + lang.echo(' Current ticker\'s value ') + board.innerHTML + '"}')
          }
        }
        if (sign === 'less') {
          if (Number(board.innerHTML) < Number(value)) {
            // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
            var Sound = { // eslint-disable-line
              audio: null,
              play: function (path) {
                this.audio = new Audio(path) // eslint-disable-line
                if (this.audio !== null) this.audio.pause()
                this.audio.play()
              }
            }
            Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
            var options = { // eslint-disable-line
              icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
              badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
              body: lang.echo('Ticker\'s value less than ') + value + ' (' + lang.echo('board #') + boardNumber + ')'
            }
            sendTelegramMessage(options.body)
            new Notification(board.innerHTML, options) // eslint-disable-line
          } else {
            tickers.appDialogWindow('{"window": "' + lang.echo('Rule execution failed') + '", "title": "' + lang.echo('Rule execution failed') + '", "message": "' + lang.echo('Rule execution test failed!') + lang.echo(' Current ticker\'s value ') + board.innerHTML + '"}')
          }
        }
        if (sign === 'lessEqual') {
          if (Number(board.innerHTML) <= Number(value)) {
            // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
            var Sound = { // eslint-disable-line
              audio: null,
              play: function (path) {
                this.audio = new Audio(path) // eslint-disable-line
                if (this.audio !== null) this.audio.pause()
                this.audio.play()
              }
            }
            Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
            var options = { // eslint-disable-line
              icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
              badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
              body: lang.echo('Ticker\'s value less or equal to ') + value + ' (' + lang.echo('board #') + boardNumber + ')'
            }
            sendTelegramMessage(options.body)
            new Notification(board.innerHTML, options) // eslint-disable-line
          } else {
            tickers.appDialogWindow('{"window": "' + lang.echo('Rule execution failed') + '", "title": "' + lang.echo('Rule execution failed') + '", "message": "' + lang.echo('Rule execution test failed!') + lang.echo(' Current ticker\'s value ') + board.innerHTML + '"}')
          }
        }
      }
      if (sign === 'date') {
        const setDate = new Date(calendar)
        if (setDate.getTime() <= new Date().getTime()) {
          // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
          var Sound = { // eslint-disable-line
            audio: null,
            play: function (path) {
              this.audio = new Audio(path) // eslint-disable-line
              if (this.audio !== null) this.audio.pause()
              this.audio.play()
            }
          }
          Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
          var options = { // eslint-disable-line
            icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
            badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
            body: lang.echo('Ticker\'s value ') + board.innerHTML + ' (' + lang.echo('board #') + boardNumber + ')'
          }
          sendTelegramMessage(options.body)
          new Notification(new Date(), options) // eslint-disable-line
        } else {
          tickers.appDialogWindow('{"window": "' + lang.echo('Rule execution failed') + '", "title": "' + lang.echo('Rule execution failed') + '", "message": "' + lang.echo('Rule execution test failed!') + ' ' + setDate + lang.echo(' is lower than ') + new Date() + '"}')
        }
      }
    }
  },
  changeBoardAlarm: function (boardNumber, value, sign, status, calendar) {
    var board = global.mainWindow.window.document.getElementById('board' + boardNumber)
    function saveBoardAlarm(d) {
      if (d === 'disable') {
        status = 'disable'
      }
      if (Number(boardNumber) === 1) {
        settings.board1_alarm = value + ',' + sign + ',' + status + ',' + calendar
      }
      if (Number(boardNumber) === 2) {
        settings.board2_alarm = value + ',' + sign + ',' + status + ',' + calendar
      }
      if (Number(boardNumber) === 3) {
        settings.board3_alarm = value + ',' + sign + ',' + status + ',' + calendar
      }
      if (Number(boardNumber) === 4) {
        settings.board4_alarm = value + ',' + sign + ',' + status + ',' + calendar
      }
      if (Number(boardNumber) === 5) {
        settings.board5_alarm = value + ',' + sign + ',' + status + ',' + calendar
      }
      if (Number(boardNumber) === 6) {
        settings.board6_alarm = value + ',' + sign + ',' + status + ',' + calendar
      }
      if (Number(boardNumber) === 7) {
        settings.board7_alarm = value + ',' + sign + ',' + status + ',' + calendar
      }
      if (Number(boardNumber) === 8) {
        settings.board8_alarm = value + ',' + sign + ',' + status + ',' + calendar
      }
      if (Number(boardNumber) === 9) {
        settings.board9_alarm = value + ',' + sign + ',' + status + ',' + calendar
      }
      if (Number(boardNumber) === 10) {
        settings.board10_alarm = value + ',' + sign + ',' + status + ',' + calendar
      }
      if (Number(boardNumber) === 11) {
        settings.board11_alarm = value + ',' + sign + ',' + status + ',' + calendar
      }
      if (Number(boardNumber) === 12) {
        settings.board12_alarm = value + ',' + sign + ',' + status + ',' + calendar
      }
      if (Number(boardNumber) === 13) {
        settings.board13_alarm = value + ',' + sign + ',' + status + ',' + calendar
      }
      if (Number(boardNumber) === 14) {
        settings.board14_alarm = value + ',' + sign + ',' + status + ',' + calendar
      }
      if (Number(boardNumber) === 15) {
        settings.board15_alarm = value + ',' + sign + ',' + status + ',' + calendar
      }
      if (Number(boardNumber) === 16) {
        settings.board16_alarm = value + ',' + sign + ',' + status + ',' + calendar
      }
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
    }
    if (status === 'enable') {
      if (value !== '') {
        if (sign === 'more') {
          if (Number(board.innerHTML) > Number(value)) {
            // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
            var Sound = { // eslint-disable-line
              audio: null,
              play: function (path) {
                this.audio = new Audio(path) // eslint-disable-line
                if (this.audio !== null) this.audio.pause()
                this.audio.play()
              }
            }
            Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
            var options = { // eslint-disable-line
              icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
              badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
              body: lang.echo('Ticker\'s value higher than ') + value + ' (' + lang.echo('board #') + boardNumber + ')'
            }
            sendTelegramMessage(options.body)
            new Notification(board.innerHTML, options) // eslint-disable-line
          } else {
            clearInterval(window['boardAlert' + boardNumber])
            window['boardAlert' + boardNumber] = setInterval(function () {
              if (Number(board.innerHTML) > Number(value)) {
                // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
                var Sound = { // eslint-disable-line
                  audio: null,
                  play: function (path) {
                    this.audio = new Audio(path) // eslint-disable-line
                    if (this.audio !== null) this.audio.pause()
                    this.audio.play()
                  }
                }
                Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
                var options = { // eslint-disable-line
                  icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  body: lang.echo('Ticker\'s value higher than ') + value + ' (' + lang.echo('board #') + boardNumber + ')'
                }
                sendTelegramMessage(options.body)
                new Notification(board.innerHTML, options) // eslint-disable-line
                clearInterval(window['boardAlert' + boardNumber])
                saveBoardAlarm('disable')
              }
            }, 5000)
            saveBoardAlarm()
          }
        }
        if (sign === 'moreEqual') {
          if (Number(board.innerHTML) >= Number(value)) {
            // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
            var Sound = { // eslint-disable-line
              audio: null,
              play: function (path) {
                this.audio = new Audio(path) // eslint-disable-line
                if (this.audio !== null) this.audio.pause()
                this.audio.play()
              }
            }
            Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
            var options = { // eslint-disable-line
              icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
              badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
              body: lang.echo('Ticker\'s value higher or equal to ') + value + ' (' + lang.echo('board #') + boardNumber + ')'
            }
            sendTelegramMessage(options.body)
            new Notification(board.innerHTML, options) // eslint-disable-line
          } else {
            clearInterval(window['boardAlert' + boardNumber])
            window['boardAlert' + boardNumber] = setInterval(function () {
              if (Number(board.innerHTML) >= Number(value)) {
                // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
                var Sound = { // eslint-disable-line
                  audio: null,
                  play: function (path) {
                    this.audio = new Audio(path) // eslint-disable-line
                    if (this.audio !== null) this.audio.pause()
                    this.audio.play()
                  }
                }
                Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
                var options = { // eslint-disable-line
                  icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  body: lang.echo('Ticker\'s value higher or equal to ') + value + ' (' + lang.echo('board #') + boardNumber + ')'
                }
                sendTelegramMessage(options.body)
                new Notification(board.innerHTML, options) // eslint-disable-line
                clearInterval(window['boardAlert' + boardNumber])
                saveBoardAlarm('disable')
              }
            }, 5000)
            saveBoardAlarm()
          }
        }
        if (sign === 'equal') {
          if (Number(board.innerHTML) === Number(value)) {
            // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
            var Sound = { // eslint-disable-line
              audio: null,
              play: function (path) {
                this.audio = new Audio(path) // eslint-disable-line
                if (this.audio !== null) this.audio.pause()
                this.audio.play()
              }
            }
            Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
            var options = { // eslint-disable-line
              icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
              badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
              body: lang.echo('Ticker\'s value equal to ') + value + ' (' + lang.echo('board #') + boardNumber + ')'
            }
            sendTelegramMessage(options.body)
            new Notification(board.innerHTML, options) // eslint-disable-line
          } else {
            clearInterval(window['boardAlert' + boardNumber])
            window['boardAlert' + boardNumber] = setInterval(function () {
              if (Number(board.innerHTML) === Number(value)) {
                // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
                var Sound = { // eslint-disable-line
                  audio: null,
                  play: function (path) {
                    this.audio = new Audio(path) // eslint-disable-line
                    if (this.audio !== null) this.audio.pause()
                    this.audio.play()
                  }
                }
                Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
                var options = { // eslint-disable-line
                  icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  body: lang.echo('Ticker\'s value equal to ') + value + ' (' + lang.echo('board #') + boardNumber + ')'
                }
                sendTelegramMessage(options.body)
                new Notification(board.innerHTML, options) // eslint-disable-line
                clearInterval(window['boardAlert' + boardNumber])
                saveBoardAlarm('disable')
              }
            }, 5000)
            saveBoardAlarm()
          }
        }
        if (sign === 'less') {
          if (Number(board.innerHTML) < Number(value)) {
            // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
            var Sound = { // eslint-disable-line
              audio: null,
              play: function (path) {
                this.audio = new Audio(path) // eslint-disable-line
                if (this.audio !== null) this.audio.pause()
                this.audio.play()
              }
            }
            Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
            var options = { // eslint-disable-line
              icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
              badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
              body: lang.echo('Ticker\'s value less than ') + value + ' (' + lang.echo('board #') + boardNumber + ')'
            }
            sendTelegramMessage(options.body)
            new Notification(board.innerHTML, options) // eslint-disable-line
          } else {
            clearInterval(window['boardAlert' + boardNumber])
            window['boardAlert' + boardNumber] = setInterval(function () {
              if (Number(board.innerHTML) < Number(value)) {
                // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
                var Sound = { // eslint-disable-line
                  audio: null,
                  play: function (path) {
                    this.audio = new Audio(path) // eslint-disable-line
                    if (this.audio !== null) this.audio.pause()
                    this.audio.play()
                  }
                }
                Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
                var options = { // eslint-disable-line
                  icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  body: lang.echo('Ticker\'s value less than ') + value + ' (' + lang.echo('board #') + boardNumber + ')'
                }
                sendTelegramMessage(options.body)
                new Notification(board.innerHTML, options) // eslint-disable-line
                clearInterval(window['boardAlert' + boardNumber])
                saveBoardAlarm('disable')
              }
            }, 5000)
            saveBoardAlarm()
          }
        }
        if (sign === 'lessEqual') {
          if (Number(board.innerHTML) <= Number(value)) {
            // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
            var Sound = { // eslint-disable-line
              audio: null,
              play: function (path) {
                this.audio = new Audio(path) // eslint-disable-line
                if (this.audio !== null) this.audio.pause()
                this.audio.play()
              }
            }
            Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
            var options = { // eslint-disable-line
              icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
              badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
              body: lang.echo('Ticker\'s value less or equal to ') + value + ' (' + lang.echo('board #') + boardNumber + ')'
            }
            sendTelegramMessage(options.body)
            new Notification(board.innerHTML, options) // eslint-disable-line
          } else {
            clearInterval(window['boardAlert' + boardNumber])
            window['boardAlert' + boardNumber] = setInterval(function () {
              if (Number(board.innerHTML) <= Number(value)) {
                // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
                var Sound = { // eslint-disable-line
                  audio: null,
                  play: function (path) {
                    this.audio = new Audio(path) // eslint-disable-line
                    if (this.audio !== null) this.audio.pause()
                    this.audio.play()
                  }
                }
                Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
                var options = { // eslint-disable-line
                  icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                  body: lang.echo('Ticker\'s value less or equal to ') + value + ' (' + lang.echo('board #') + boardNumber + ')'
                }
                sendTelegramMessage(options.body)
                new Notification(board.innerHTML, options) // eslint-disable-line
                clearInterval(window['boardAlert' + boardNumber])
                saveBoardAlarm('disable')
              }
            }, 5000)
            saveBoardAlarm()
          }
        }
      }
      if (sign === 'date') {
        const setDate = new Date(calendar)
        if (setDate.getTime() <= new Date().getTime()) {
          // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
          var Sound = { // eslint-disable-line
            audio: null,
            play: function (path) {
              this.audio = new Audio(path) // eslint-disable-line
              if (this.audio !== null) this.audio.pause()
              this.audio.play()
            }
          }
          Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
          var options = { // eslint-disable-line
            icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
            badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
            body: lang.echo('Ticker\'s value ') + board.innerHTML + ' (' + lang.echo('board #') + boardNumber + ')'
          }
          sendTelegramMessage(options.body)
          new Notification(new Date(), options) // eslint-disable-line
        } else {
          clearInterval(window['boardAlert' + boardNumber])
          window['boardAlert' + boardNumber] = setInterval(function () {
            if (setDate.getTime() <= new Date().getTime()) {
              // console.log('file://' + (path.normalize(nw.__dirname + '/assets/logo.png')))
              var Sound = { // eslint-disable-line
                audio: null,
                play: function (path) {
                  this.audio = new Audio(path) // eslint-disable-line
                  if (this.audio !== null) this.audio.pause()
                  this.audio.play()
                }
              }
              Sound.play(path.normalize('file://' + nw.__dirname + '/assets/sounds/fadein.ogg')) // eslint-disable-line
              var options = { // eslint-disable-line
                icon: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                badge: path.normalize('file://' + nw.__dirname + '/assets/logo.png'), // eslint-disable-line
                body: lang.echo('Ticker\'s value ') + board.innerHTML + ' (' + lang.echo('board #') + boardNumber + ')'
              }
              sendTelegramMessage(options.body)
              new Notification(new Date(), options) // eslint-disable-line
              clearInterval(window['boardAlert' + boardNumber])
              saveBoardAlarm('disable')
            }
          }, 5000)
          saveBoardAlarm()
        }
      }
    }
  },
  disableBoardAlarm: function (boardNumber) {
    if (Number(boardNumber) === 1) {
      settings.board1_alarm = global.boardOneAlarm[0] + ',' + global.boardOneAlarm[1] + ',' + 'disable' + ',' + global.boardOneAlarm[3]
    }
    if (Number(boardNumber) === 2) {
      settings.board2_alarm = global.boardTwoAlarm[0] + ',' + global.boardTwoAlarm[1] + ',' + 'disable' + ',' + global.boardTwoAlarm[3]
    }
    if (Number(boardNumber) === 3) {
      settings.board3_alarm = global.boardThreeAlarm[0] + ',' + global.boardThreeAlarm[1] + ',' + 'disable' + ',' + global.boardThreeAlarm[3]
    }
    if (Number(boardNumber) === 4) {
      settings.board4_alarm = global.boardFourAlarm[0] + ',' + global.boardFourAlarm[1] + ',' + 'disable' + ',' + global.boardFourAlarm[3]
    }
    if (Number(boardNumber) === 5) {
      settings.board5_alarm = global.boardFiveAlarm[0] + ',' + global.boardFiveAlarm[1] + ',' + 'disable' + ',' + global.boardFiveAlarm[3]
    }
    if (Number(boardNumber) === 6) {
      settings.board6_alarm = global.boardSixAlarm[0] + ',' + global.boardSixAlarm[1] + ',' + 'disable' + ',' + global.boardSixAlarm[3]
    }
    if (Number(boardNumber) === 7) {
      settings.board7_alarm = global.boardSevenAlarm[0] + ',' + global.boardSevenAlarm[1] + ',' + 'disable' + ',' + global.boardSevenAlarm[3]
    }
    if (Number(boardNumber) === 8) {
      settings.board8_alarm = global.boardEightAlarm[0] + ',' + global.boardEightAlarm[1] + ',' + 'disable' + ',' + global.boardEightAlarm[3]
    }
    if (Number(boardNumber) === 9) {
      settings.board9_alarm = global.boardNineAlarm[0] + ',' + global.boardNineAlarm[1] + ',' + 'disable' + ',' + global.boardNineAlarm[3]
    }
    if (Number(boardNumber) === 10) {
      settings.board10_alarm = global.boardTenAlarm[0] + ',' + global.boardTenAlarm[1] + ',' + 'disable' + ',' + global.boardTenAlarm[3]
    }
    if (Number(boardNumber) === 11) {
      settings.board11_alarm = global.boardElevenAlarm[0] + ',' + global.boardElevenAlarm[1] + ',' + 'disable' + ',' + global.boardElevenAlarm[3]
    }
    if (Number(boardNumber) === 12) {
      settings.board12_alarm = global.boardTwelveAlarm[0] + ',' + global.boardTwelveAlarm[1] + ',' + 'disable' + ',' + global.boardTwelveAlarm[3]
    }
    if (Number(boardNumber) === 13) {
      settings.board13_alarm = global.boardThirteenAlarm[0] + ',' + global.boardThirteenAlarm[1] + ',' + 'disable' + ',' + global.boardThirteenAlarm[3]
    }
    if (Number(boardNumber) === 14) {
      settings.board14_alarm = global.boardFourteenAlarm[0] + ',' + global.boardFourteenAlarm[1] + ',' + 'disable' + ',' + global.boardFourteenAlarm[3]
    }
    if (Number(boardNumber) === 15) {
      settings.board15_alarm = global.boardFifteenAlarm[0] + ',' + global.boardFifteenAlarm[1] + ',' + 'disable' + ',' + global.boardFifteenAlarm[3]
    }
    if (Number(boardNumber) === 16) {
      settings.board16_alarm = global.boardSixteenAlarm[0] + ',' + global.boardSixteenAlarm[1] + ',' + 'disable' + ',' + global.boardSixteenAlarm[3]
    }
    tickers.appDialogWindow('{"window": "' + lang.echo('Notification disabled') + '", "title": "' + lang.echo('Notification disabled') + '", "message": "' + lang.echo('Board\'s ') + boardNumber + ' ' + lang.echo('Notification disabled') + '!"}')
    fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
  },
  disableOrEnableBoardAlarm: function (boardNumber) {
    var status
    if (Number(boardNumber) === 1) {
      if (global.boardOneAlarm[2] === 'enable') {
        status = 'Notification disabled'
        settings.board1_alarm = global.boardOneAlarm[0] + ',' + global.boardOneAlarm[1] + ',' + 'disable' + ',' + global.boardOneAlarm[3]
        clearInterval(window.boardAlert1)
      } else {
        status = 'Notification enabled'
        settings.board1_alarm = global.boardOneAlarm[0] + ',' + global.boardOneAlarm[1] + ',' + 'enable' + ',' + global.boardOneAlarm[3]
        this.setBoardAlarm(1000)
      }
    }
    if (Number(boardNumber) === 2) {
      if (global.boardTwoAlarm[2] === 'enable') {
        status = 'Notification disabled'
        settings.board2_alarm = global.boardTwoAlarm[0] + ',' + global.boardTwoAlarm[1] + ',' + 'disable' + ',' + global.boardTwoAlarm[3]
        clearInterval(window.boardAlert2)
      } else {
        status = 'Notification enabled'
        settings.board2_alarm = global.boardTwoAlarm[0] + ',' + global.boardTwoAlarm[1] + ',' + 'enable' + ',' + global.boardTwoAlarm[3]
        this.setBoardAlarm(1000)
      }
    }
    if (Number(boardNumber) === 3) {
      if (global.boardThreeAlarm[2] === 'enable') {
        status = 'Notification disabled'
        settings.board3_alarm = global.boardThreeAlarm[0] + ',' + global.boardThreeAlarm[1] + ',' + 'disable' + ',' + global.boardThreeAlarm[3]
        clearInterval(window.boardAlert3)
      } else {
        status = 'Notification enabled'
        settings.board3_alarm = global.boardThreeAlarm[0] + ',' + global.boardThreeAlarm[1] + ',' + 'enable' + ',' + global.boardThreeAlarm[3]
        this.setBoardAlarm(1000)
      }
    }
    if (Number(boardNumber) === 4) {
      if (global.boardFourAlarm[2] === 'enable') {
        status = 'Notification disabled'
        settings.board4_alarm = global.boardFourAlarm[0] + ',' + global.boardFourAlarm[1] + ',' + 'disable' + ',' + global.boardFourAlarm[3]
        clearInterval(window.boardAlert4)
      } else {
        status = 'Notification enabled'
        settings.board4_alarm = global.boardFourAlarm[0] + ',' + global.boardFourAlarm[1] + ',' + 'enable' + ',' + global.boardFourAlarm[3]
        this.setBoardAlarm(1000)
      }
    }
    if (Number(boardNumber) === 5) {
      if (global.boardFiveAlarm[2] === 'enable') {
        status = 'Notification disabled'
        settings.board5_alarm = global.boardFiveAlarm[0] + ',' + global.boardFiveAlarm[1] + ',' + 'disable' + ',' + global.boardFiveAlarm[3]
        clearInterval(window.boardAlert5)
      } else {
        status = 'Notification enabled'
        settings.board5_alarm = global.boardFiveAlarm[0] + ',' + global.boardFiveAlarm[1] + ',' + 'enable' + ',' + global.boardFiveAlarm[3]
        this.setBoardAlarm(1000)
      }
    }
    if (Number(boardNumber) === 6) {
      if (global.boardSixAlarm[2] === 'enable') {
        status = 'Notification disabled'
        settings.board6_alarm = global.boardSixAlarm[0] + ',' + global.boardSixAlarm[1] + ',' + 'disable' + ',' + global.boardSixAlarm[3]
        clearInterval(window.boardAlert6)
      } else {
        status = 'Notification enabled'
        settings.board6_alarm = global.boardSixAlarm[0] + ',' + global.boardSixAlarm[1] + ',' + 'enable' + ',' + global.boardSixAlarm[3]
        this.setBoardAlarm(1000)
      }
    }
    if (Number(boardNumber) === 7) {
      if (global.boardSevenAlarm[2] === 'enable') {
        status = 'Notification disabled'
        settings.board7_alarm = global.boardSevenAlarm[0] + ',' + global.boardSevenAlarm[1] + ',' + 'disable' + ',' + global.boardSevenAlarm[3]
        clearInterval(window.boardAlert7)
      } else {
        status = 'Notification enabled'
        settings.board7_alarm = global.boardSevenAlarm[0] + ',' + global.boardSevenAlarm[1] + ',' + 'enable' + ',' + global.boardSevenAlarm[3]
        this.setBoardAlarm(1000)
      }
    }
    if (Number(boardNumber) === 8) {
      if (global.boardEightAlarm[2] === 'enable') {
        status = 'Notification disabled'
        settings.board8_alarm = global.boardEightAlarm[0] + ',' + global.boardEightAlarm[1] + ',' + 'disable' + ',' + global.boardEightAlarm[3]
        clearInterval(window.boardAlert8)
      } else {
        status = 'Notification enabled'
        settings.board8_alarm = global.boardEightAlarm[0] + ',' + global.boardEightAlarm[1] + ',' + 'enable' + ',' + global.boardEightAlarm[3]
        this.setBoardAlarm(1000)
      }
    }
    if (Number(boardNumber) === 9) {
      if (global.boardNineAlarm[2] === 'enable') {
        status = 'Notification disabled'
        settings.board9_alarm = global.boardNineAlarm[0] + ',' + global.boardNineAlarm[1] + ',' + 'disable' + ',' + global.boardNineAlarm[3]
        clearInterval(window.boardAlert9)
      } else {
        status = 'Notification enabled'
        settings.board9_alarm = global.boardNineAlarm[0] + ',' + global.boardNineAlarm[1] + ',' + 'enable' + ',' + global.boardNineAlarm[3]
        this.setBoardAlarm(1000)
      }
    }
    if (Number(boardNumber) === 10) {
      if (global.boardTenAlarm[2] === 'enable') {
        status = 'Notification disabled'
        settings.board10_alarm = global.boardTenAlarm[0] + ',' + global.boardTenAlarm[1] + ',' + 'disable' + ',' + global.boardTenAlarm[3]
        clearInterval(window.boardAlert10)
      } else {
        status = 'Notification enabled'
        settings.board10_alarm = global.boardTenAlarm[0] + ',' + global.boardTenAlarm[1] + ',' + 'enable' + ',' + global.boardTenAlarm[3]
        this.setBoardAlarm(1000)
      }
    }
    if (Number(boardNumber) === 11) {
      if (global.boardElevenAlarm[2] === 'enable') {
        status = 'Notification disabled'
        settings.board11_alarm = global.boardElevenAlarm[0] + ',' + global.boardElevenAlarm[1] + ',' + 'disable' + ',' + global.boardElevenAlarm[3]
        clearInterval(window.boardAlert11)
      } else {
        status = 'Notification enabled'
        settings.board11_alarm = global.boardElevenAlarm[0] + ',' + global.boardElevenAlarm[1] + ',' + 'enable' + ',' + global.boardElevenAlarm[3]
        this.setBoardAlarm(1000)
      }
    }
    if (Number(boardNumber) === 12) {
      if (global.boardTwelveAlarm[2] === 'enable') {
        status = 'Notification disabled'
        settings.board12_alarm = global.boardTwelveAlarm[0] + ',' + global.boardTwelveAlarm[1] + ',' + 'disable' + ',' + global.boardTwelveAlarm[3]
        clearInterval(window.boardAlert12)
      } else {
        status = 'Notification enabled'
        settings.board12_alarm = global.boardTwelveAlarm[0] + ',' + global.boardTwelveAlarm[1] + ',' + 'disable' + ',' + global.boardTwelveAlarm[3]
        this.setBoardAlarm(1000)
      }
    }
    if (Number(boardNumber) === 13) {
      if (global.boardThirteenAlarm[2] === 'enable') {
        status = 'Notification disabled'
        settings.board13_alarm = global.boardThirteenAlarm[0] + ',' + global.boardThirteenAlarm[1] + ',' + 'disable' + ',' + global.boardThirteenAlarm[3]
        clearInterval(window.boardAlert13)
      } else {
        status = 'Notification enabled'
        settings.board13_alarm = global.boardThirteenAlarm[0] + ',' + global.boardThirteenAlarm[1] + ',' + 'enable' + ',' + global.boardThirteenAlarm[3]
        this.setBoardAlarm(1000)
      }
    }
    if (Number(boardNumber) === 14) {
      if (global.boardFourteenAlarm[2] === 'enable') {
        status = 'Notification disabled'
        settings.board14_alarm = global.boardFourteenAlarm[0] + ',' + global.boardFourteenAlarm[1] + ',' + 'disable' + ',' + global.boardFourteenAlarm[3]
        clearInterval(window.boardAlert14)
      } else {
        status = 'Notification enabled'
        settings.board14_alarm = global.boardFourteenAlarm[0] + ',' + global.boardFourteenAlarm[1] + ',' + 'enable' + ',' + global.boardFourteenAlarm[3]
        this.setBoardAlarm(1000)
      }
    }
    if (Number(boardNumber) === 15) {
      if (global.boardFifteenAlarm[2] === 'enable') {
        status = 'Notification disabled'
        settings.board15_alarm = global.boardFifteenAlarm[0] + ',' + global.boardFifteenAlarm[1] + ',' + 'disable' + ',' + global.boardFifteenAlarm[3]
        clearInterval(window.boardAlert15)
      } else {
        status = 'Notification enabled'
        settings.board15_alarm = global.boardFifteenAlarm[0] + ',' + global.boardFifteenAlarm[1] + ',' + 'enable' + ',' + global.boardFifteenAlarm[3]
        this.setBoardAlarm(1000)
      }
    }
    if (Number(boardNumber) === 16) {
      if (global.boardSixteenAlarm[2] === 'enable') {
        status = 'Notification disabled'
        settings.board16_alarm = global.boardSixteenAlarm[0] + ',' + global.boardSixteenAlarm[1] + ',' + 'disable' + ',' + global.boardSixteenAlarm[3]
        clearInterval(window.boardAlert16)
      } else {
        status = 'Notification enabled'
        settings.board16_alarm = global.boardSixteenAlarm[0] + ',' + global.boardSixteenAlarm[1] + ',' + 'enable' + ',' + global.boardSixteenAlarm[3]
        this.setBoardAlarm(1000)
      }
    }
    tickers.appDialogWindow('{"window": "' + lang.echo(status) + '", "title": "' + lang.echo(status) + '", "message": "' + lang.echo('Board\'s ') + boardNumber + ' ' + lang.echo(status) + '!"}')
    fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
  },
  changeBackgroundColor: function (color) {
    global.mainWindow.window.document.getElementsByTagName('body')[0].style = 'background-color: ' + color
    settings.background_color = color
    global.backgroundColor = color
    fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
  },
  saveBoardColor: function (boardNumber, color) {
    var colorBoard = global.mainWindow.window.document.getElementById('cboard' + boardNumber)
    colorBoard.className = 'uk-card-large uk-card-' + color + ' uk-card-hover uk-card-body'
    settings.board1_color = global.boardOneColor
    settings.board2_color = global.boardTwoColor
    settings.board3_color = global.boardThreeColor
    settings.board4_color = global.boardFourColor
    settings.board5_color = global.boardFiveColor
    settings.board6_color = global.boardSixColor
    settings.board7_color = global.boardSevenColor
    settings.board8_color = global.boardEightColor
    settings.board9_color = global.boardNineColor
    settings.board10_color = global.boardTenColor
    settings.board11_color = global.boardElevenColor
    settings.board12_color = global.boardTwelveColor
    settings.board13_color = global.boardThirteenColor
    settings.board14_color = global.boardFourteenColor
    settings.board15_color = global.boardFifteenColor
    settings.board16_color = global.boardSixteenColor
    fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
  },
  setAsset: function (ticker, count, price) {
    var currency = coins.find(coin => coin.symbol === (ticker).toLowerCase())
    if (!currency) {
      tickers.appDialogWindow('{"window": "' + lang.echo('No support for that asset') + '", "title": "' + lang.echo('No support for that asset') + '", "message": "' + lang.echo('We support only cryptocurrency ') + '' + lang.echo('and') + lang.echo(' assets that are available on the CoinGecko') + '"}')
      return
    }
    if (global.asset1[4] === 'disable') {
      settings.asset1 = ticker + ',' + currency.name + ',' + price + ',' + count + ',' + 'enable'
      global.asset1[0] = ticker
      global.asset1[1] = currency.name
      global.asset1[2] = price
      global.asset1[3] = count
      global.asset1[4] = 'enable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.portfolioWindow.reload()
      return
    }
    if (global.asset2[4] === 'disable') {
      settings.asset2 = ticker + ',' + currency.name + ',' + price + ',' + count + ',' + 'enable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.asset2[0] = ticker
      global.asset2[1] = currency.name
      global.asset2[2] = price
      global.asset2[3] = count
      global.asset2[4] = 'enable'
      global.portfolioWindow.reload()
      return
    }
    if (global.asset3[4] === 'disable') {
      settings.asset3 = ticker + ',' + currency.name + ',' + price + ',' + count + ',' + 'enable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.asset3[0] = ticker
      global.asset3[1] = currency.name
      global.asset3[2] = price
      global.asset3[3] = count
      global.asset3[4] = 'enable'
      global.portfolioWindow.reload()
      return
    }
    if (global.asset4[4] === 'disable') {
      settings.asset4 = ticker + ',' + currency.name + ',' + price + ',' + count + ',' + 'enable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.asset4[0] = ticker
      global.asset4[1] = currency.name
      global.asset4[2] = price
      global.asset4[3] = count
      global.asset4[4] = 'enable'
      global.portfolioWindow.reload()
      return
    }
    if (global.asset5[4] === 'disable') {
      settings.asset5 = ticker + ',' + currency.name + ',' + price + ',' + count + ',' + 'enable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.asset5[0] = ticker
      global.asset5[1] = currency.name
      global.asset5[2] = price
      global.asset5[3] = count
      global.asset5[4] = 'enable'
      global.portfolioWindow.reload()
      return
    }
    if (global.asset6[4] === 'disable') {
      settings.asset6 = ticker + ',' + currency.name + ',' + price + ',' + count + ',' + 'enable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.asset6[0] = ticker
      global.asset6[1] = currency.name
      global.asset6[2] = price
      global.asset6[3] = count
      global.asset6[4] = 'enable'
      global.portfolioWindow.reload()
      return
    }
    if (global.asset7[4] === 'disable') {
      settings.asset7 = ticker + ',' + currency.name + ',' + price + ',' + count + ',' + 'enable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.asset7[0] = ticker
      global.asset7[1] = currency.name
      global.asset7[2] = price
      global.asset7[3] = count
      global.asset7[4] = 'enable'
      global.portfolioWindow.reload()
      return
    }
    if (global.asset8[4] === 'disable') {
      settings.asset8 = ticker + ',' + currency.name + ',' + price + ',' + count + ',' + 'enable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.asset8[0] = ticker
      global.asset8[1] = currency.name
      global.asset8[2] = price
      global.asset8[3] = count
      global.asset8[4] = 'enable'
      global.portfolioWindow.reload()
      return
    }
    if (global.asset9[4] === 'disable') {
      settings.asset9 = ticker + ',' + currency.name + ',' + price + ',' + count + ',' + 'enable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.asset9[0] = ticker
      global.asset9[1] = currency.name
      global.asset9[2] = price
      global.asset9[3] = count
      global.asset9[4] = 'enable'
      global.portfolioWindow.reload()
      return
    }
    if (global.asset10[4] === 'disable') {
      settings.asset10 = ticker + ',' + currency.name + ',' + price + ',' + count + ',' + 'enable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.asset10[0] = ticker
      global.asset10[1] = currency.name
      global.asset10[2] = price
      global.asset10[3] = count
      global.asset10[4] = 'enable'
      global.portfolioWindow.reload()
      return
    }
    if (global.asset11[4] === 'disable') {
      settings.asset11 = ticker + ',' + currency.name + ',' + price + ',' + count + ',' + 'enable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.asset11[0] = ticker
      global.asset11[1] = currency.name
      global.asset11[2] = price
      global.asset11[3] = count
      global.asset11[4] = 'enable'
      global.portfolioWindow.reload()
      return
    }
    if (global.asset12[4] === 'disable') {
      settings.asset12 = ticker + ',' + currency.name + ',' + price + ',' + count + ',' + 'enable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.asset12[0] = ticker
      global.asset12[1] = currency.name
      global.asset12[2] = price
      global.asset12[3] = count
      global.asset12[4] = 'enable'
      global.portfolioWindow.reload()
      return
    }
    if (global.asset13[4] === 'disable') {
      settings.asset13 = ticker + ',' + currency.name + ',' + price + ',' + count + ',' + 'enable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.asset13[0] = ticker
      global.asset13[1] = currency.name
      global.asset13[2] = price
      global.asset13[3] = count
      global.asset13[4] = 'enable'
      global.portfolioWindow.reload()
      return
    }
    if (global.asset14[4] === 'disable') {
      settings.asset14 = ticker + ',' + currency.name + ',' + price + ',' + count + ',' + 'enable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.asset14[0] = ticker
      global.asset14[1] = currency.name
      global.asset14[2] = price
      global.asset14[3] = count
      global.asset14[4] = 'enable'
      global.portfolioWindow.reload()
      return
    }
    if (global.asset15[4] === 'disable') {
      settings.asset15 = ticker + ',' + currency.name + ',' + price + ',' + count + ',' + 'enable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.asset15[0] = ticker
      global.asset15[1] = currency.name
      global.asset15[2] = price
      global.asset15[3] = count
      global.asset15[4] = 'enable'
      global.portfolioWindow.reload()
      return
    }
    if (global.asset16[4] === 'disable') {
      settings.asset16 = ticker + ',' + currency.name + ',' + price + ',' + count + ',' + 'enable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.asset16[0] = ticker
      global.asset16[1] = currency.name
      global.asset16[2] = price
      global.asset16[3] = count
      global.asset16[4] = 'enable'
      global.portfolioWindow.reload()
      return
    }
    if (global.asset17[4] === 'disable') {
      settings.asset17 = ticker + ',' + currency.name + ',' + price + ',' + count + ',' + 'enable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.asset17[0] = ticker
      global.asset17[1] = currency.name
      global.asset17[2] = price
      global.asset17[3] = count
      global.asset17[4] = 'enable'
      global.portfolioWindow.reload()
      return
    }
    if (global.asset18[4] === 'disable') {
      settings.asset18 = ticker + ',' + currency.name + ',' + price + ',' + count + ',' + 'enable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.asset18[0] = ticker
      global.asset18[1] = currency.name
      global.asset18[2] = price
      global.asset18[3] = count
      global.asset18[4] = 'enable'
      global.portfolioWindow.reload()
      return
    }
    if (global.asset19[4] === 'disable') {
      settings.asset19 = ticker + ',' + currency.name + ',' + price + ',' + count + ',' + 'enable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.asset19[0] = ticker
      global.asset19[1] = currency.name
      global.asset19[2] = price
      global.asset19[3] = count
      global.asset19[4] = 'enable'
      global.portfolioWindow.reload()
      return
    }
    if (global.asset20[4] === 'disable') {
      settings.asset20 = ticker + ',' + currency.name + ',' + price + ',' + count + ',' + 'enable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.asset20[0] = ticker
      global.asset20[1] = currency.name
      global.asset20[2] = price
      global.asset20[3] = count
      global.asset20[4] = 'enable'
      global.portfolioWindow.reload()
      return
    }
    if (global.asset21[4] === 'disable') {
      settings.asset21 = ticker + ',' + currency.name + ',' + price + ',' + count + ',' + 'enable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.asset21[0] = ticker
      global.asset21[1] = currency.name
      global.asset21[2] = price
      global.asset21[3] = count
      global.asset21[4] = 'enable'
      global.portfolioWindow.reload()
      return
    }
    if (global.asset22[4] === 'disable') {
      settings.asset22 = ticker + ',' + currency.name + ',' + price + ',' + count + ',' + 'enable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.asset22[0] = ticker
      global.asset22[1] = currency.name
      global.asset22[2] = price
      global.asset22[3] = count
      global.asset22[4] = 'enable'
      global.portfolioWindow.reload()
      return
    }
    if (global.asset23[4] === 'disable') {
      settings.asset23 = ticker + ',' + currency.name + ',' + price + ',' + count + ',' + 'enable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.asset23[0] = ticker
      global.asset23[1] = currency.name
      global.asset23[2] = price
      global.asset23[3] = count
      global.asset23[4] = 'enable'
      global.portfolioWindow.reload()
      return
    }
    if (global.asset24[4] === 'disable') {
      settings.asset24 = ticker + ',' + currency.name + ',' + price + ',' + count + ',' + 'enable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.asset24[0] = ticker
      global.asset24[1] = currency.name
      global.asset24[2] = price
      global.asset24[3] = count
      global.asset24[4] = 'enable'
      global.portfolioWindow.reload()
      return
    }
    if (global.asset25[4] === 'disable') {
      settings.asset25 = ticker + ',' + currency.name + ',' + price + ',' + count + ',' + 'enable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.asset25[0] = ticker
      global.asset25[1] = currency.name
      global.asset25[2] = price
      global.asset25[3] = count
      global.asset25[4] = 'enable'
      global.portfolioWindow.reload()
      return
    }
    if (global.asset26[4] === 'disable') {
      settings.asset26 = ticker + ',' + currency.name + ',' + price + ',' + count + ',' + 'enable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.asset26[0] = ticker
      global.asset26[1] = currency.name
      global.asset26[2] = price
      global.asset26[3] = count
      global.asset26[4] = 'enable'
      global.portfolioWindow.reload()
      return
    }
    if (global.asset27[4] === 'disable') {
      settings.asset27 = ticker + ',' + currency.name + ',' + price + ',' + count + ',' + 'enable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.asset27[0] = ticker
      global.asset27[1] = currency.name
      global.asset27[2] = price
      global.asset27[3] = count
      global.asset27[4] = 'enable'
      global.portfolioWindow.reload()
      return
    }
    if (global.asset28[4] === 'disable') {
      settings.asset28 = ticker + ',' + currency.name + ',' + price + ',' + count + ',' + 'enable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.asset28[0] = ticker
      global.asset28[1] = currency.name
      global.asset28[2] = price
      global.asset28[3] = count
      global.asset28[4] = 'enable'
      global.portfolioWindow.reload()
      return
    }
    if (global.asset29[4] === 'disable') {
      settings.asset29 = ticker + ',' + currency.name + ',' + price + ',' + count + ',' + 'enable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.asset29[0] = ticker
      global.asset29[1] = currency.name
      global.asset29[2] = price
      global.asset29[3] = count
      global.asset29[4] = 'enable'
      global.portfolioWindow.reload()
      return
    }
    if (global.asset30[4] === 'disable') {
      settings.asset30 = ticker + ',' + currency.name + ',' + price + ',' + count + ',' + 'enable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.asset30[0] = ticker
      global.asset30[1] = currency.name
      global.asset30[2] = price
      global.asset30[3] = count
      global.asset30[4] = 'enable'
      global.portfolioWindow.reload()
      return
    }
    if (global.asset31[4] === 'disable') {
      settings.asset31 = ticker + ',' + currency.name + ',' + price + ',' + count + ',' + 'enable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.asset31[0] = ticker
      global.asset31[1] = currency.name
      global.asset31[2] = price
      global.asset31[3] = count
      global.asset31[4] = 'enable'
      global.portfolioWindow.reload()
      return
    }
    if (global.asset32[4] === 'disable') {
      settings.asset32 = ticker + ',' + currency.name + ',' + price + ',' + count + ',' + 'enable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.asset32[0] = ticker
      global.asset32[1] = currency.name
      global.asset32[2] = price
      global.asset32[3] = count
      global.asset32[4] = 'enable'
      global.portfolioWindow.reload()
      return
    }
    if (global.asset33[4] === 'disable') {
      settings.asset33 = ticker + ',' + currency.name + ',' + price + ',' + count + ',' + 'enable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.asset33[0] = ticker
      global.asset33[1] = currency.name
      global.asset33[2] = price
      global.asset33[3] = count
      global.asset33[4] = 'enable'
      global.portfolioWindow.reload()
      return
    }
    if (global.asset34[4] === 'disable') {
      settings.asset34 = ticker + ',' + currency.name + ',' + price + ',' + count + ',' + 'enable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.asset34[0] = ticker
      global.asset34[1] = currency.name
      global.asset34[2] = price
      global.asset34[3] = count
      global.asset34[4] = 'enable'
      global.portfolioWindow.reload()
      return
    }
    if (global.asset35[4] === 'disable') {
      settings.asset35 = ticker + ',' + currency.name + ',' + price + ',' + count + ',' + 'enable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.asset35[0] = ticker
      global.asset35[1] = currency.name
      global.asset35[2] = price
      global.asset35[3] = count
      global.asset35[4] = 'enable'
      global.portfolioWindow.reload()
      return
    }
    if (global.asset36[4] === 'disable') {
      settings.asset36 = ticker + ',' + currency.name + ',' + price + ',' + count + ',' + 'enable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.asset36[0] = ticker
      global.asset36[1] = currency.name
      global.asset36[2] = price
      global.asset36[3] = count
      global.asset36[4] = 'enable'
      global.portfolioWindow.reload()
      return
    }
    if (global.asset37[4] === 'disable') {
      settings.asset37 = ticker + ',' + currency.name + ',' + price + ',' + count + ',' + 'enable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.asset37[0] = ticker
      global.asset37[1] = currency.name
      global.asset37[2] = price
      global.asset37[3] = count
      global.asset37[4] = 'enable'
      global.portfolioWindow.reload()
      return
    }
    if (global.asset38[4] === 'disable') {
      settings.asset38 = ticker + ',' + currency.name + ',' + price + ',' + count + ',' + 'enable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.asset38[0] = ticker
      global.asset38[1] = currency.name
      global.asset38[2] = price
      global.asset38[3] = count
      global.asset38[4] = 'enable'
      global.portfolioWindow.reload()
      return
    }
    if (global.asset39[4] === 'disable') {
      settings.asset39 = ticker + ',' + currency.name + ',' + price + ',' + count + ',' + 'enable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.asset39[0] = ticker
      global.asset39[1] = currency.name
      global.asset39[2] = price
      global.asset39[3] = count
      global.asset39[4] = 'enable'
      global.portfolioWindow.reload()
      return
    }
    if (global.asset40[4] === 'disable') {
      settings.asset40 = ticker + ',' + currency.name + ',' + price + ',' + count + ',' + 'enable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.asset40[0] = ticker
      global.asset40[1] = currency.name
      global.asset40[2] = price
      global.asset40[3] = count
      global.asset40[4] = 'enable'
      global.portfolioWindow.reload()
      return
    }
    if (global.asset41[4] === 'disable') {
      settings.asset41 = ticker + ',' + currency.name + ',' + price + ',' + count + ',' + 'enable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.asset41[0] = ticker
      global.asset41[1] = currency.name
      global.asset41[2] = price
      global.asset41[3] = count
      global.asset41[4] = 'enable'
      global.portfolioWindow.reload()
      return
    }
    if (global.asset42[4] === 'disable') {
      settings.asset42 = ticker + ',' + currency.name + ',' + price + ',' + count + ',' + 'enable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.asset42[0] = ticker
      global.asset42[1] = currency.name
      global.asset42[2] = price
      global.asset42[3] = count
      global.asset42[4] = 'enable'
      global.portfolioWindow.reload()
      return
    }
    if (global.asset43[4] === 'disable') {
      settings.asset43 = ticker + ',' + currency.name + ',' + price + ',' + count + ',' + 'enable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.asset43[0] = ticker
      global.asset43[1] = currency.name
      global.asset43[2] = price
      global.asset43[3] = count
      global.asset43[4] = 'enable'
      global.portfolioWindow.reload()
      return
    }
    if (global.asset44[4] === 'disable') {
      settings.asset44 = ticker + ',' + currency.name + ',' + price + ',' + count + ',' + 'enable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.asset44[0] = ticker
      global.asset44[1] = currency.name
      global.asset44[2] = price
      global.asset44[3] = count
      global.asset44[4] = 'enable'
      global.portfolioWindow.reload()
      return
    }
    if (global.asset45[4] === 'disable') {
      settings.asset45 = ticker + ',' + currency.name + ',' + price + ',' + count + ',' + 'enable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.asset45[0] = ticker
      global.asset45[1] = currency.name
      global.asset45[2] = price
      global.asset45[3] = count
      global.asset45[4] = 'enable'
      global.portfolioWindow.reload()
      return
    }
    if (global.asset46[4] === 'disable') {
      settings.asset46 = ticker + ',' + currency.name + ',' + price + ',' + count + ',' + 'enable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.asset46[0] = ticker
      global.asset46[1] = currency.name
      global.asset46[2] = price
      global.asset46[3] = count
      global.asset46[4] = 'enable'
      global.portfolioWindow.reload()
      return
    }
    if (global.asset47[4] === 'disable') {
      settings.asset47 = ticker + ',' + currency.name + ',' + price + ',' + count + ',' + 'enable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.asset47[0] = ticker
      global.asset47[1] = currency.name
      global.asset47[2] = price
      global.asset47[3] = count
      global.asset47[4] = 'enable'
      global.portfolioWindow.reload()
      return
    }
    if (global.asset48[4] === 'disable') {
      settings.asset48 = ticker + ',' + currency.name + ',' + price + ',' + count + ',' + 'enable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.asset48[0] = ticker
      global.asset48[1] = currency.name
      global.asset48[2] = price
      global.asset48[3] = count
      global.asset48[4] = 'enable'
      global.portfolioWindow.reload()
      return
    }
    if (global.asset49[4] === 'disable') {
      settings.asset49 = ticker + ',' + currency.name + ',' + price + ',' + count + ',' + 'enable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.asset49[0] = ticker
      global.asset49[1] = currency.name
      global.asset49[2] = price
      global.asset49[3] = count
      global.asset49[4] = 'enable'
      global.portfolioWindow.reload()
      return
    }
    if (global.asset50[4] === 'disable') {
      settings.asset50 = ticker + ',' + currency.name + ',' + price + ',' + count + ',' + 'enable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.asset50[0] = ticker
      global.asset50[1] = currency.name
      global.asset50[2] = price
      global.asset50[3] = count
      global.asset50[4] = 'enable'
      global.portfolioWindow.reload()
    }
  },
  saveMarketCapAndTg: function (marketCap, tgApi, tgChatId) {
    var website
    global.marketCap = marketCap
    settings.market_cap = marketCap
    settings.tgBotApiKey = tgApi
    settings.tgBotChatId = tgChatId
    if (marketCap === 'coinmarketcap') {
      website = 'CoinMarketCap'
    } else {
      website = 'CoinGecko'
    }
    if (tgApi !== '') {
      appDialogWindowCode('{"window": "' + lang.echo('Cryptocurrency logo on-click') + '", "title": "' + lang.echo('Cryptocurrency logo on-click') + '", "messageTwo": "' + lang.echo('New logo on-click website: ') + website + '"' + ', "message": "' + lang.echo('Updated: ') + lang.echo('Bot\'s HTTP API Token') + '"}')
    } else {
      tickers.appDialogWindow('{"window": "' + lang.echo('Cryptocurrency logo on-click') + '", "title": "' + lang.echo('Cryptocurrency logo on-click') + '", "message": "' + lang.echo('New logo on-click website: ') + website + '"}')
    }
    if (tgChatId !== '') {
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.tgBotApiKey = tgApi
      global.tgBotChatId = tgChatId
    } else {
      requestClient.get({
        options: global.tlsSettings,
        maxAttempts: 3,
        retryDelay: 2000,
        uri: global.corsProxy + 'https://api.telegram.org/bot' + settings.tgBotApiKey + '/getUpdates',
        json: true
      }, function (error, response, body) {
        console.error('error-telegram:', error)
        settings.tgBotChatId = body.result[0].message.chat.id
        fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
        global.tgBotApiKey = tgApi
        global.tgBotChatId = tgChatId
      })
    }
  },
  openMarketCap: function (board) {
    var url
    if (global.marketCap === 'coingecko') {
      url = 'https://www.coingecko.com/en/coins/'
    }
    if (global.marketCap === 'coinmarketcap') {
      url = 'https://coinmarketcap.com/currencies/'
    }
    if (board === '1') {
      if (global.marketCap === 'coingecko') {
        const currency = coins.find(coin => coin.symbol === global.boardOneTicker[0].toLowerCase())
        gui.Shell.openExternal(url + currency.id)
      } else {
        const currency = coinsCmc.data.find(coin => coin.symbol === global.boardOneTicker[0])
        gui.Shell.openExternal(url + currency.slug)
      }
    }
    if (board === '2') {
      if (global.marketCap === 'coingecko') {
        const currency = coins.find(coin => coin.symbol === global.boardTwoTicker[0].toLowerCase())
        gui.Shell.openExternal(url + currency.id)
      } else {
        const currency = coinsCmc.data.find(coin => coin.symbol === global.boardTwoTicker[0])
        gui.Shell.openExternal(url + currency.slug)
      }
    }
    if (board === '3') {
      if (global.marketCap === 'coingecko') {
        const currency = coins.find(coin => coin.symbol === global.boardThreeTicker[0].toLowerCase())
        gui.Shell.openExternal(url + currency.id)
      } else {
        const currency = coinsCmc.data.find(coin => coin.symbol === global.boardThreeTicker[0])
        gui.Shell.openExternal(url + currency.slug)
      }
    }
    if (board === '4') {
      if (global.marketCap === 'coingecko') {
        const currency = coins.find(coin => coin.symbol === global.boardFourTicker[0].toLowerCase())
        gui.Shell.openExternal(url + currency.id)
      } else {
        const currency = coinsCmc.data.find(coin => coin.symbol === global.boardFourTicker[0])
        gui.Shell.openExternal(url + currency.slug)
      }
    }
    if (board === '5') {
      if (global.marketCap === 'coingecko') {
        const currency = coins.find(coin => coin.symbol === global.boardFiveTicker[0].toLowerCase())
        gui.Shell.openExternal(url + currency.id)
      } else {
        const currency = coinsCmc.data.find(coin => coin.symbol === global.boardFiveTicker[0])
        gui.Shell.openExternal(url + currency.slug)
      }
    }
    if (board === '6') {
      if (global.marketCap === 'coingecko') {
        const currency = coins.find(coin => coin.symbol === global.boardSixTicker[0].toLowerCase())
        gui.Shell.openExternal(url + currency.id)
      } else {
        const currency = coinsCmc.data.find(coin => coin.symbol === global.boardSixTicker[0])
        gui.Shell.openExternal(url + currency.slug)
      }
    }
    if (board === '7') {
      if (global.marketCap === 'coingecko') {
        const currency = coins.find(coin => coin.symbol === global.boardSevenTicker[0].toLowerCase())
        gui.Shell.openExternal(url + currency.id)
      } else {
        const currency = coinsCmc.data.find(coin => coin.symbol === global.boardSevenTicker[0])
        gui.Shell.openExternal(url + currency.slug)
      }
    }
    if (board === '8') {
      if (global.marketCap === 'coingecko') {
        const currency = coins.find(coin => coin.symbol === global.boardEightTicker[0].toLowerCase())
        gui.Shell.openExternal(url + currency.id)
      } else {
        const currency = coinsCmc.data.find(coin => coin.symbol === global.boardEightTicker[0])
        gui.Shell.openExternal(url + currency.slug)
      }
    }
    if (board === '9') {
      if (global.marketCap === 'coingecko') {
        const currency = coins.find(coin => coin.symbol === global.boardNineTicker[0].toLowerCase())
        gui.Shell.openExternal(url + currency.id)
      } else {
        const currency = coinsCmc.data.find(coin => coin.symbol === global.boardNineTicker[0])
        gui.Shell.openExternal(url + currency.slug)
      }
    }
    if (board === '10') {
      if (global.marketCap === 'coingecko') {
        const currency = coins.find(coin => coin.symbol === global.boardTenTicker[0].toLowerCase())
        gui.Shell.openExternal(url + currency.id)
      } else {
        const currency = coinsCmc.data.find(coin => coin.symbol === global.boardTenTicker[0])
        gui.Shell.openExternal(url + currency.slug)
      }
    }
    if (board === '11') {
      if (global.marketCap === 'coingecko') {
        const currency = coins.find(coin => coin.symbol === global.boardElevenTicker[0].toLowerCase())
        gui.Shell.openExternal(url + currency.id)
      } else {
        const currency = coinsCmc.data.find(coin => coin.symbol === global.boardElevenTicker[0])
        gui.Shell.openExternal(url + currency.slug)
      }
    }
    if (board === '12') {
      if (global.marketCap === 'coingecko') {
        const currency = coins.find(coin => coin.symbol === global.boardTwelveTicker[0].toLowerCase())
        gui.Shell.openExternal(url + currency.id)
      } else {
        const currency = coinsCmc.data.find(coin => coin.symbol === global.boardTwelveTicker[0])
        gui.Shell.openExternal(url + currency.slug)
      }
    }
    if (board === '13') {
      if (global.marketCap === 'coingecko') {
        const currency = coins.find(coin => coin.symbol === global.boardThirteenTicker[0].toLowerCase())
        gui.Shell.openExternal(url + currency.id)
      } else {
        const currency = coinsCmc.data.find(coin => coin.symbol === global.boardThirteenTicker[0])
        gui.Shell.openExternal(url + currency.slug)
      }
    }
    if (board === '14') {
      if (global.marketCap === 'coingecko') {
        const currency = coins.find(coin => coin.symbol === global.boardFourteenTicker[0].toLowerCase())
        gui.Shell.openExternal(url + currency.id)
      } else {
        const currency = coinsCmc.data.find(coin => coin.symbol === global.boardFourteenTicker[0])
        gui.Shell.openExternal(url + currency.slug)
      }
    }
    if (board === '15') {
      if (global.marketCap === 'coingecko') {
        const currency = coins.find(coin => coin.symbol === global.boardFifteenTicker[0].toLowerCase())
        gui.Shell.openExternal(url + currency.id)
      } else {
        const currency = coinsCmc.data.find(coin => coin.symbol === global.boardFifteenTicker[0])
        gui.Shell.openExternal(url + currency.slug)
      }
    }
    if (board === '16') {
      if (global.marketCap === 'coingecko') {
        const currency = coins.find(coin => coin.symbol === global.boardSixteenTicker[0].toLowerCase())
        gui.Shell.openExternal(url + currency.id)
      } else {
        const currency = coinsCmc.data.find(coin => coin.symbol === global.boardSixteenTicker[0])
        gui.Shell.openExternal(url + currency.slug)
      }
    }
  },
  openMarketCapAsset: function (asset) {
    var url
    if (global.marketCap === 'coingecko') {
      url = 'https://www.coingecko.com/en/coins/'
    }
    if (global.marketCap === 'coinmarketcap') {
      url = 'https://coinmarketcap.com/currencies/'
    }
    if (asset === '1') {
      if (global.marketCap === 'coingecko') {
        const currency = coins.find(coin => coin.symbol === global.asset1[0].toLowerCase())
        gui.Shell.openExternal(url + currency.id)
      } else {
        const currency = coinsCmc.data.find(coin => coin.symbol === global.asset1[0])
        gui.Shell.openExternal(url + currency.slug)
      }
    }
    if (asset === '2') {
      if (global.marketCap === 'coingecko') {
        const currency = coins.find(coin => coin.symbol === global.asset2[0].toLowerCase())
        gui.Shell.openExternal(url + currency.id)
      } else {
        const currency = coinsCmc.data.find(coin => coin.symbol === global.asset2[0])
        gui.Shell.openExternal(url + currency.slug)
      }
    }
    if (asset === '3') {
      if (global.marketCap === 'coingecko') {
        const currency = coins.find(coin => coin.symbol === global.asset3[0].toLowerCase())
        gui.Shell.openExternal(url + currency.id)
      } else {
        const currency = coinsCmc.data.find(coin => coin.symbol === global.asset3[0])
        gui.Shell.openExternal(url + currency.slug)
      }
    }
    if (asset === '4') {
      if (global.marketCap === 'coingecko') {
        const currency = coins.find(coin => coin.symbol === global.asset4[0].toLowerCase())
        gui.Shell.openExternal(url + currency.id)
      } else {
        const currency = coinsCmc.data.find(coin => coin.symbol === global.asset4[0])
        gui.Shell.openExternal(url + currency.slug)
      }
    }
    if (asset === '5') {
      if (global.marketCap === 'coingecko') {
        const currency = coins.find(coin => coin.symbol === global.asset5[0].toLowerCase())
        gui.Shell.openExternal(url + currency.id)
      } else {
        const currency = coinsCmc.data.find(coin => coin.symbol === global.asset5[0])
        gui.Shell.openExternal(url + currency.slug)
      }
    }
    if (asset === '6') {
      if (global.marketCap === 'coingecko') {
        const currency = coins.find(coin => coin.symbol === global.asset6[0].toLowerCase())
        gui.Shell.openExternal(url + currency.id)
      } else {
        const currency = coinsCmc.data.find(coin => coin.symbol === global.asset6[0])
        gui.Shell.openExternal(url + currency.slug)
      }
    }
    if (asset === '7') {
      if (global.marketCap === 'coingecko') {
        const currency = coins.find(coin => coin.symbol === global.asset7[0].toLowerCase())
        gui.Shell.openExternal(url + currency.id)
      } else {
        const currency = coinsCmc.data.find(coin => coin.symbol === global.asset7[0])
        gui.Shell.openExternal(url + currency.slug)
      }
    }
    if (asset === '8') {
      if (global.marketCap === 'coingecko') {
        const currency = coins.find(coin => coin.symbol === global.asset8[0].toLowerCase())
        gui.Shell.openExternal(url + currency.id)
      } else {
        const currency = coinsCmc.data.find(coin => coin.symbol === global.asset8[0])
        gui.Shell.openExternal(url + currency.slug)
      }
    }
    if (asset === '9') {
      if (global.marketCap === 'coingecko') {
        const currency = coins.find(coin => coin.symbol === global.asset9[0].toLowerCase())
        gui.Shell.openExternal(url + currency.id)
      } else {
        const currency = coinsCmc.data.find(coin => coin.symbol === global.asset9[0])
        gui.Shell.openExternal(url + currency.slug)
      }
    }
    if (asset === '10') {
      if (global.marketCap === 'coingecko') {
        const currency = coins.find(coin => coin.symbol === global.asset10[0].toLowerCase())
        gui.Shell.openExternal(url + currency.id)
      } else {
        const currency = coinsCmc.data.find(coin => coin.symbol === global.asset10[0])
        gui.Shell.openExternal(url + currency.slug)
      }
    }
    if (asset === '11') {
      if (global.marketCap === 'coingecko') {
        const currency = coins.find(coin => coin.symbol === global.asset11[0].toLowerCase())
        gui.Shell.openExternal(url + currency.id)
      } else {
        const currency = coinsCmc.data.find(coin => coin.symbol === global.asset11[0])
        gui.Shell.openExternal(url + currency.slug)
      }
    }
    if (asset === '12') {
      if (global.marketCap === 'coingecko') {
        const currency = coins.find(coin => coin.symbol === global.asset12[0].toLowerCase())
        gui.Shell.openExternal(url + currency.id)
      } else {
        const currency = coinsCmc.data.find(coin => coin.symbol === global.asset12[0])
        gui.Shell.openExternal(url + currency.slug)
      }
    }
    if (asset === '13') {
      if (global.marketCap === 'coingecko') {
        const currency = coins.find(coin => coin.symbol === global.asset13[0].toLowerCase())
        gui.Shell.openExternal(url + currency.id)
      } else {
        const currency = coinsCmc.data.find(coin => coin.symbol === global.asset13[0])
        gui.Shell.openExternal(url + currency.slug)
      }
    }
    if (asset === '14') {
      if (global.marketCap === 'coingecko') {
        const currency = coins.find(coin => coin.symbol === global.asset14[0].toLowerCase())
        gui.Shell.openExternal(url + currency.id)
      } else {
        const currency = coinsCmc.data.find(coin => coin.symbol === global.asset14[0])
        gui.Shell.openExternal(url + currency.slug)
      }
    }
    if (asset === '15') {
      if (global.marketCap === 'coingecko') {
        const currency = coins.find(coin => coin.symbol === global.asset15[0].toLowerCase())
        gui.Shell.openExternal(url + currency.id)
      } else {
        const currency = coinsCmc.data.find(coin => coin.symbol === global.asset15[0])
        gui.Shell.openExternal(url + currency.slug)
      }
    }
    if (asset === '16') {
      if (global.marketCap === 'coingecko') {
        const currency = coins.find(coin => coin.symbol === global.asset16[0].toLowerCase())
        gui.Shell.openExternal(url + currency.id)
      } else {
        const currency = coinsCmc.data.find(coin => coin.symbol === global.asset16[0])
        gui.Shell.openExternal(url + currency.slug)
      }
    }
    if (asset === '17') {
      if (global.marketCap === 'coingecko') {
        const currency = coins.find(coin => coin.symbol === global.asset17[0].toLowerCase())
        gui.Shell.openExternal(url + currency.id)
      } else {
        const currency = coinsCmc.data.find(coin => coin.symbol === global.asset17[0])
        gui.Shell.openExternal(url + currency.slug)
      }
    }
    if (asset === '18') {
      if (global.marketCap === 'coingecko') {
        const currency = coins.find(coin => coin.symbol === global.asset18[0].toLowerCase())
        gui.Shell.openExternal(url + currency.id)
      } else {
        const currency = coinsCmc.data.find(coin => coin.symbol === global.asset18[0])
        gui.Shell.openExternal(url + currency.slug)
      }
    }
    if (asset === '19') {
      if (global.marketCap === 'coingecko') {
        const currency = coins.find(coin => coin.symbol === global.asset19[0].toLowerCase())
        gui.Shell.openExternal(url + currency.id)
      } else {
        const currency = coinsCmc.data.find(coin => coin.symbol === global.asset19[0])
        gui.Shell.openExternal(url + currency.slug)
      }
    }
    if (asset === '20') {
      if (global.marketCap === 'coingecko') {
        const currency = coins.find(coin => coin.symbol === global.asset20[0].toLowerCase())
        gui.Shell.openExternal(url + currency.id)
      } else {
        const currency = coinsCmc.data.find(coin => coin.symbol === global.asset20[0])
        gui.Shell.openExternal(url + currency.slug)
      }
    }
    if (asset === '21') {
      if (global.marketCap === 'coingecko') {
        const currency = coins.find(coin => coin.symbol === global.asset21[0].toLowerCase())
        gui.Shell.openExternal(url + currency.id)
      } else {
        const currency = coinsCmc.data.find(coin => coin.symbol === global.asset21[0])
        gui.Shell.openExternal(url + currency.slug)
      }
    }
    if (asset === '22') {
      if (global.marketCap === 'coingecko') {
        const currency = coins.find(coin => coin.symbol === global.asset22[0].toLowerCase())
        gui.Shell.openExternal(url + currency.id)
      } else {
        const currency = coinsCmc.data.find(coin => coin.symbol === global.asset22[0])
        gui.Shell.openExternal(url + currency.slug)
      }
    }
    if (asset === '23') {
      if (global.marketCap === 'coingecko') {
        const currency = coins.find(coin => coin.symbol === global.asset23[0].toLowerCase())
        gui.Shell.openExternal(url + currency.id)
      } else {
        const currency = coinsCmc.data.find(coin => coin.symbol === global.asset23[0])
        gui.Shell.openExternal(url + currency.slug)
      }
    }
    if (asset === '24') {
      if (global.marketCap === 'coingecko') {
        const currency = coins.find(coin => coin.symbol === global.asset24[0].toLowerCase())
        gui.Shell.openExternal(url + currency.id)
      } else {
        const currency = coinsCmc.data.find(coin => coin.symbol === global.asset24[0])
        gui.Shell.openExternal(url + currency.slug)
      }
    }
    if (asset === '25') {
      if (global.marketCap === 'coingecko') {
        const currency = coins.find(coin => coin.symbol === global.asset25[0].toLowerCase())
        gui.Shell.openExternal(url + currency.id)
      } else {
        const currency = coinsCmc.data.find(coin => coin.symbol === global.asset25[0])
        gui.Shell.openExternal(url + currency.slug)
      }
    }
    if (asset === '26') {
      if (global.marketCap === 'coingecko') {
        const currency = coins.find(coin => coin.symbol === global.asset26[0].toLowerCase())
        gui.Shell.openExternal(url + currency.id)
      } else {
        const currency = coinsCmc.data.find(coin => coin.symbol === global.asset26[0])
        gui.Shell.openExternal(url + currency.slug)
      }
    }
    if (asset === '27') {
      if (global.marketCap === 'coingecko') {
        const currency = coins.find(coin => coin.symbol === global.asset27[0].toLowerCase())
        gui.Shell.openExternal(url + currency.id)
      } else {
        const currency = coinsCmc.data.find(coin => coin.symbol === global.asset27[0])
        gui.Shell.openExternal(url + currency.slug)
      }
    }
    if (asset === '28') {
      if (global.marketCap === 'coingecko') {
        const currency = coins.find(coin => coin.symbol === global.asset28[0].toLowerCase())
        gui.Shell.openExternal(url + currency.id)
      } else {
        const currency = coinsCmc.data.find(coin => coin.symbol === global.asset28[0])
        gui.Shell.openExternal(url + currency.slug)
      }
    }
    if (asset === '29') {
      if (global.marketCap === 'coingecko') {
        const currency = coins.find(coin => coin.symbol === global.asset29[0].toLowerCase())
        gui.Shell.openExternal(url + currency.id)
      } else {
        const currency = coinsCmc.data.find(coin => coin.symbol === global.asset29[0])
        gui.Shell.openExternal(url + currency.slug)
      }
    }
    if (asset === '30') {
      if (global.marketCap === 'coingecko') {
        const currency = coins.find(coin => coin.symbol === global.asset30[0].toLowerCase())
        gui.Shell.openExternal(url + currency.id)
      } else {
        const currency = coinsCmc.data.find(coin => coin.symbol === global.asset30[0])
        gui.Shell.openExternal(url + currency.slug)
      }
    }
    if (asset === '31') {
      if (global.marketCap === 'coingecko') {
        const currency = coins.find(coin => coin.symbol === global.asset31[0].toLowerCase())
        gui.Shell.openExternal(url + currency.id)
      } else {
        const currency = coinsCmc.data.find(coin => coin.symbol === global.asset31[0])
        gui.Shell.openExternal(url + currency.slug)
      }
    }
    if (asset === '32') {
      if (global.marketCap === 'coingecko') {
        const currency = coins.find(coin => coin.symbol === global.asset32[0].toLowerCase())
        gui.Shell.openExternal(url + currency.id)
      } else {
        const currency = coinsCmc.data.find(coin => coin.symbol === global.asset32[0])
        gui.Shell.openExternal(url + currency.slug)
      }
    }
    if (asset === '33') {
      if (global.marketCap === 'coingecko') {
        const currency = coins.find(coin => coin.symbol === global.asset33[0].toLowerCase())
        gui.Shell.openExternal(url + currency.id)
      } else {
        const currency = coinsCmc.data.find(coin => coin.symbol === global.asset33[0])
        gui.Shell.openExternal(url + currency.slug)
      }
    }
    if (asset === '34') {
      if (global.marketCap === 'coingecko') {
        const currency = coins.find(coin => coin.symbol === global.asset34[0].toLowerCase())
        gui.Shell.openExternal(url + currency.id)
      } else {
        const currency = coinsCmc.data.find(coin => coin.symbol === global.asset34[0])
        gui.Shell.openExternal(url + currency.slug)
      }
    }
    if (asset === '35') {
      if (global.marketCap === 'coingecko') {
        const currency = coins.find(coin => coin.symbol === global.asset35[0].toLowerCase())
        gui.Shell.openExternal(url + currency.id)
      } else {
        const currency = coinsCmc.data.find(coin => coin.symbol === global.asset35[0])
        gui.Shell.openExternal(url + currency.slug)
      }
    }
    if (asset === '36') {
      if (global.marketCap === 'coingecko') {
        const currency = coins.find(coin => coin.symbol === global.asset36[0].toLowerCase())
        gui.Shell.openExternal(url + currency.id)
      } else {
        const currency = coinsCmc.data.find(coin => coin.symbol === global.asset36[0])
        gui.Shell.openExternal(url + currency.slug)
      }
    }
    if (asset === '37') {
      if (global.marketCap === 'coingecko') {
        const currency = coins.find(coin => coin.symbol === global.asset37[0].toLowerCase())
        gui.Shell.openExternal(url + currency.id)
      } else {
        const currency = coinsCmc.data.find(coin => coin.symbol === global.asset37[0])
        gui.Shell.openExternal(url + currency.slug)
      }
    }
    if (asset === '38') {
      if (global.marketCap === 'coingecko') {
        const currency = coins.find(coin => coin.symbol === global.asset38[0].toLowerCase())
        gui.Shell.openExternal(url + currency.id)
      } else {
        const currency = coinsCmc.data.find(coin => coin.symbol === global.asset38[0])
        gui.Shell.openExternal(url + currency.slug)
      }
    }
    if (asset === '39') {
      if (global.marketCap === 'coingecko') {
        const currency = coins.find(coin => coin.symbol === global.asset39[0].toLowerCase())
        gui.Shell.openExternal(url + currency.id)
      } else {
        const currency = coinsCmc.data.find(coin => coin.symbol === global.asset39[0])
        gui.Shell.openExternal(url + currency.slug)
      }
    }
    if (asset === '40') {
      if (global.marketCap === 'coingecko') {
        const currency = coins.find(coin => coin.symbol === global.asset40[0].toLowerCase())
        gui.Shell.openExternal(url + currency.id)
      } else {
        const currency = coinsCmc.data.find(coin => coin.symbol === global.asset40[0])
        gui.Shell.openExternal(url + currency.slug)
      }
    }
    if (asset === '41') {
      if (global.marketCap === 'coingecko') {
        const currency = coins.find(coin => coin.symbol === global.asset41[0].toLowerCase())
        gui.Shell.openExternal(url + currency.id)
      } else {
        const currency = coinsCmc.data.find(coin => coin.symbol === global.asset41[0])
        gui.Shell.openExternal(url + currency.slug)
      }
    }
    if (asset === '42') {
      if (global.marketCap === 'coingecko') {
        const currency = coins.find(coin => coin.symbol === global.asset42[0].toLowerCase())
        gui.Shell.openExternal(url + currency.id)
      } else {
        const currency = coinsCmc.data.find(coin => coin.symbol === global.asset42[0])
        gui.Shell.openExternal(url + currency.slug)
      }
    }
    if (asset === '43') {
      if (global.marketCap === 'coingecko') {
        const currency = coins.find(coin => coin.symbol === global.asset43[0].toLowerCase())
        gui.Shell.openExternal(url + currency.id)
      } else {
        const currency = coinsCmc.data.find(coin => coin.symbol === global.asset43[0])
        gui.Shell.openExternal(url + currency.slug)
      }
    }
    if (asset === '44') {
      if (global.marketCap === 'coingecko') {
        const currency = coins.find(coin => coin.symbol === global.asset44[0].toLowerCase())
        gui.Shell.openExternal(url + currency.id)
      } else {
        const currency = coinsCmc.data.find(coin => coin.symbol === global.asset44[0])
        gui.Shell.openExternal(url + currency.slug)
      }
    }
    if (asset === '45') {
      if (global.marketCap === 'coingecko') {
        const currency = coins.find(coin => coin.symbol === global.asset45[0].toLowerCase())
        gui.Shell.openExternal(url + currency.id)
      } else {
        const currency = coinsCmc.data.find(coin => coin.symbol === global.asset45[0])
        gui.Shell.openExternal(url + currency.slug)
      }
    }
    if (asset === '46') {
      if (global.marketCap === 'coingecko') {
        const currency = coins.find(coin => coin.symbol === global.asset46[0].toLowerCase())
        gui.Shell.openExternal(url + currency.id)
      } else {
        const currency = coinsCmc.data.find(coin => coin.symbol === global.asset46[0])
        gui.Shell.openExternal(url + currency.slug)
      }
    }
    if (asset === '47') {
      if (global.marketCap === 'coingecko') {
        const currency = coins.find(coin => coin.symbol === global.asset47[0].toLowerCase())
        gui.Shell.openExternal(url + currency.id)
      } else {
        const currency = coinsCmc.data.find(coin => coin.symbol === global.asset47[0])
        gui.Shell.openExternal(url + currency.slug)
      }
    }
    if (asset === '48') {
      if (global.marketCap === 'coingecko') {
        const currency = coins.find(coin => coin.symbol === global.asset48[0].toLowerCase())
        gui.Shell.openExternal(url + currency.id)
      } else {
        const currency = coinsCmc.data.find(coin => coin.symbol === global.asset48[0])
        gui.Shell.openExternal(url + currency.slug)
      }
    }
    if (asset === '49') {
      if (global.marketCap === 'coingecko') {
        const currency = coins.find(coin => coin.symbol === global.asset49[0].toLowerCase())
        gui.Shell.openExternal(url + currency.id)
      } else {
        const currency = coinsCmc.data.find(coin => coin.symbol === global.asset49[0])
        gui.Shell.openExternal(url + currency.slug)
      }
    }
    if (asset === '50') {
      if (global.marketCap === 'coingecko') {
        const currency = coins.find(coin => coin.symbol === global.asset50[0].toLowerCase())
        gui.Shell.openExternal(url + currency.id)
      } else {
        const currency = coinsCmc.data.find(coin => coin.symbol === global.asset50[0])
        gui.Shell.openExternal(url + currency.slug)
      }
    }
  },
  assetDisable: function (asset) {
    if (asset === '1') {
      settings.asset1 = global.asset1[0] + ',' + global.asset1[1] + ',' + global.asset1[2] + ',' + global.asset1[3] + ',' + 'disable'
      global.asset1[4] = 'disable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.portfolioWindow.window.document.getElementById('asset1').style.display = 'none'
    }
    if (asset === '2') {
      settings.asset2 = global.asset2[0] + ',' + global.asset2[1] + ',' + global.asset2[2] + ',' + global.asset2[3] + ',' + 'disable'
      global.asset2[4] = 'disable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.portfolioWindow.window.document.getElementById('asset2').style.display = 'none'
    }
    if (asset === '3') {
      settings.asset3 = global.asset3[0] + ',' + global.asset3[1] + ',' + global.asset3[2] + ',' + global.asset3[3] + ',' + 'disable'
      global.asset3[4] = 'disable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.portfolioWindow.window.document.getElementById('asset3').style.display = 'none'
    }
    if (asset === '4') {
      settings.asset4 = global.asset4[0] + ',' + global.asset4[1] + ',' + global.asset4[2] + ',' + global.asset4[3] + ',' + 'disable'
      global.asset4[4] = 'disable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.portfolioWindow.window.document.getElementById('asset4').style.display = 'none'
    }
    if (asset === '5') {
      settings.asset5 = global.asset5[0] + ',' + global.asset5[1] + ',' + global.asset5[2] + ',' + global.asset5[3] + ',' + 'disable'
      global.asset5[4] = 'disable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.portfolioWindow.window.document.getElementById('asset5').style.display = 'none'
    }
    if (asset === '6') {
      settings.asset6 = global.asset6[0] + ',' + global.asset6[1] + ',' + global.asset6[2] + ',' + global.asset6[3] + ',' + 'disable'
      global.asset6[4] = 'disable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.portfolioWindow.window.document.getElementById('asset6').style.display = 'none'
    }
    if (asset === '7') {
      settings.asset7 = global.asset7[0] + ',' + global.asset7[1] + ',' + global.asset7[2] + ',' + global.asset7[3] + ',' + 'disable'
      global.asset7[4] = 'disable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.portfolioWindow.window.document.getElementById('asset7').style.display = 'none'
    }
    if (asset === '8') {
      settings.asset8 = global.asset8[0] + ',' + global.asset8[1] + ',' + global.asset8[2] + ',' + global.asset8[3] + ',' + 'disable'
      global.asset8[4] = 'disable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.portfolioWindow.window.document.getElementById('asset8').style.display = 'none'
    }
    if (asset === '9') {
      settings.asset9 = global.asset9[0] + ',' + global.asset9[1] + ',' + global.asset9[2] + ',' + global.asset9[3] + ',' + 'disable'
      global.asset9[4] = 'disable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.portfolioWindow.window.document.getElementById('asset9').style.display = 'none'
    }
    if (asset === '10') {
      settings.asset10 = global.asset10[0] + ',' + global.asset10[1] + ',' + global.asset10[2] + ',' + global.asset10[3] + ',' + 'disable'
      global.asset10[4] = 'disable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.portfolioWindow.window.document.getElementById('asset10').style.display = 'none'
    }
    if (asset === '11') {
      settings.asset11 = global.asset11[0] + ',' + global.asset11[1] + ',' + global.asset11[2] + ',' + global.asset11[3] + ',' + 'disable'
      global.asset11[4] = 'disable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.portfolioWindow.window.document.getElementById('asset11').style.display = 'none'
    }
    if (asset === '12') {
      settings.asset12 = global.asset12[0] + ',' + global.asset12[1] + ',' + global.asset12[2] + ',' + global.asset12[3] + ',' + 'disable'
      global.asset12[4] = 'disable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.portfolioWindow.window.document.getElementById('asset12').style.display = 'none'
    }
    if (asset === '13') {
      settings.asset12 = global.asset13[0] + ',' + global.asset13[1] + ',' + global.asset13[2] + ',' + global.asset13[3] + ',' + 'disable'
      global.asset13[4] = 'disable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.portfolioWindow.window.document.getElementById('asset13').style.display = 'none'
    }
    if (asset === '14') {
      settings.asset14 = global.asset14[0] + ',' + global.asset14[1] + ',' + global.asset14[2] + ',' + global.asset14[3] + ',' + 'disable'
      global.asset14[4] = 'disable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.portfolioWindow.window.document.getElementById('asset14').style.display = 'none'
    }
    if (asset === '15') {
      settings.asset15 = global.asset15[0] + ',' + global.asset15[1] + ',' + global.asset15[2] + ',' + global.asset15[3] + ',' + 'disable'
      global.asset15[4] = 'disable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.portfolioWindow.window.document.getElementById('asset15').style.display = 'none'
    }
    if (asset === '16') {
      settings.asset16 = global.asset16[0] + ',' + global.asset16[1] + ',' + global.asset16[2] + ',' + global.asset16[3] + ',' + 'disable'
      global.asset16[4] = 'disable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.portfolioWindow.window.document.getElementById('asset16').style.display = 'none'
    }
    if (asset === '17') {
      settings.asset17 = global.asset17[0] + ',' + global.asset17[1] + ',' + global.asset17[2] + ',' + global.asset17[3] + ',' + 'disable'
      global.asset17[4] = 'disable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.portfolioWindow.window.document.getElementById('asset17').style.display = 'none'
    }
    if (asset === '18') {
      settings.asset18 = global.asset18[0] + ',' + global.asset18[1] + ',' + global.asset18[2] + ',' + global.asset18[3] + ',' + 'disable'
      global.asset18[4] = 'disable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.portfolioWindow.window.document.getElementById('asset18').style.display = 'none'
    }
    if (asset === '19') {
      settings.asset19 = global.asset19[0] + ',' + global.asset19[1] + ',' + global.asset19[2] + ',' + global.asset19[3] + ',' + 'disable'
      global.asset19[4] = 'disable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.portfolioWindow.window.document.getElementById('asset19').style.display = 'none'
    }
    if (asset === '20') {
      settings.asset20 = global.asset20[0] + ',' + global.asset20[1] + ',' + global.asset20[2] + ',' + global.asset20[3] + ',' + 'disable'
      global.asset20[4] = 'disable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.portfolioWindow.window.document.getElementById('asset20').style.display = 'none'
    }
    if (asset === '21') {
      settings.asset21 = global.asset21[0] + ',' + global.asset21[1] + ',' + global.asset21[2] + ',' + global.asset21[3] + ',' + 'disable'
      global.asset21[4] = 'disable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.portfolioWindow.window.document.getElementById('asset21').style.display = 'none'
    }
    if (asset === '22') {
      settings.asset22 = global.asset22[0] + ',' + global.asset22[1] + ',' + global.asset22[2] + ',' + global.asset22[3] + ',' + 'disable'
      global.asset22[4] = 'disable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.portfolioWindow.window.document.getElementById('asset22').style.display = 'none'
    }
    if (asset === '23') {
      settings.asset23 = global.asset23[0] + ',' + global.asset23[1] + ',' + global.asset23[2] + ',' + global.asset23[3] + ',' + 'disable'
      global.asset23[4] = 'disable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.portfolioWindow.window.document.getElementById('asset23').style.display = 'none'
    }
    if (asset === '24') {
      settings.asset24 = global.asset24[0] + ',' + global.asset24[1] + ',' + global.asset24[2] + ',' + global.asset24[3] + ',' + 'disable'
      global.asset24[4] = 'disable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.portfolioWindow.window.document.getElementById('asset24').style.display = 'none'
    }
    if (asset === '25') {
      settings.asset25 = global.asset25[0] + ',' + global.asset25[1] + ',' + global.asset25[2] + ',' + global.asset25[3] + ',' + 'disable'
      global.asset25[4] = 'disable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.portfolioWindow.window.document.getElementById('asset25').style.display = 'none'
    }
    if (asset === '26') {
      settings.asset26 = global.asset26[0] + ',' + global.asset26[1] + ',' + global.asset26[2] + ',' + global.asset26[3] + ',' + 'disable'
      global.asset26[4] = 'disable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.portfolioWindow.window.document.getElementById('asset26').style.display = 'none'
    }
    if (asset === '27') {
      settings.asset27 = global.asset27[0] + ',' + global.asset27[1] + ',' + global.asset27[2] + ',' + global.asset27[3] + ',' + 'disable'
      global.asset27[4] = 'disable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.portfolioWindow.window.document.getElementById('asset27').style.display = 'none'
    }
    if (asset === '28') {
      settings.asset28 = global.asset28[0] + ',' + global.asset28[1] + ',' + global.asset28[2] + ',' + global.asset28[3] + ',' + 'disable'
      global.asset28[4] = 'disable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.portfolioWindow.window.document.getElementById('asset28').style.display = 'none'
    }
    if (asset === '29') {
      settings.asset29 = global.asset29[0] + ',' + global.asset29[1] + ',' + global.asset29[2] + ',' + global.asset29[3] + ',' + 'disable'
      global.asset29[4] = 'disable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.portfolioWindow.window.document.getElementById('asset29').style.display = 'none'
    }
    if (asset === '30') {
      settings.asset30 = global.asset30[0] + ',' + global.asset30[1] + ',' + global.asset30[2] + ',' + global.asset30[3] + ',' + 'disable'
      global.asset30[4] = 'disable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.portfolioWindow.window.document.getElementById('asset30').style.display = 'none'
    }
    if (asset === '31') {
      settings.asset31 = global.asset31[0] + ',' + global.asset31[1] + ',' + global.asset31[2] + ',' + global.asset31[3] + ',' + 'disable'
      global.asset31[4] = 'disable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.portfolioWindow.window.document.getElementById('asset31').style.display = 'none'
    }
    if (asset === '32') {
      settings.asset32 = global.asset32[0] + ',' + global.asset32[1] + ',' + global.asset32[2] + ',' + global.asset32[3] + ',' + 'disable'
      global.asset32[4] = 'disable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.portfolioWindow.window.document.getElementById('asset32').style.display = 'none'
    }
    if (asset === '33') {
      settings.asset33 = global.asset33[0] + ',' + global.asset33[1] + ',' + global.asset33[2] + ',' + global.asset33[3] + ',' + 'disable'
      global.asset33[4] = 'disable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.portfolioWindow.window.document.getElementById('asset33').style.display = 'none'
    }
    if (asset === '34') {
      settings.asset34 = global.asset34[0] + ',' + global.asset34[1] + ',' + global.asset34[2] + ',' + global.asset34[3] + ',' + 'disable'
      global.asset34[4] = 'disable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.portfolioWindow.window.document.getElementById('asset34').style.display = 'none'
    }
    if (asset === '35') {
      settings.asset35 = global.asset35[0] + ',' + global.asset35[1] + ',' + global.asset35[2] + ',' + global.asset35[3] + ',' + 'disable'
      global.asset35[4] = 'disable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.portfolioWindow.window.document.getElementById('asset35').style.display = 'none'
    }
    if (asset === '36') {
      settings.asset36 = global.asset36[0] + ',' + global.asset36[1] + ',' + global.asset36[2] + ',' + global.asset36[3] + ',' + 'disable'
      global.asset36[4] = 'disable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.portfolioWindow.window.document.getElementById('asset36').style.display = 'none'
    }
    if (asset === '37') {
      settings.asset37 = global.asset37[0] + ',' + global.asset37[1] + ',' + global.asset37[2] + ',' + global.asset37[3] + ',' + 'disable'
      global.asset37[4] = 'disable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.portfolioWindow.window.document.getElementById('asset37').style.display = 'none'
    }
    if (asset === '38') {
      settings.asset38 = global.asset38[0] + ',' + global.asset38[1] + ',' + global.asset38[2] + ',' + global.asset38[3] + ',' + 'disable'
      global.asset38[4] = 'disable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.portfolioWindow.window.document.getElementById('asset38').style.display = 'none'
    }
    if (asset === '39') {
      settings.asset39 = global.asset39[0] + ',' + global.asset39[1] + ',' + global.asset39[2] + ',' + global.asset39[3] + ',' + 'disable'
      global.asset39[4] = 'disable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.portfolioWindow.window.document.getElementById('asset39').style.display = 'none'
    }
    if (asset === '40') {
      settings.asset40 = global.asset40[0] + ',' + global.asset40[1] + ',' + global.asset40[2] + ',' + global.asset40[3] + ',' + 'disable'
      global.asset40[4] = 'disable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.portfolioWindow.window.document.getElementById('asset40').style.display = 'none'
    }
    if (asset === '41') {
      settings.asset41 = global.asset41[0] + ',' + global.asset41[1] + ',' + global.asset41[2] + ',' + global.asset41[3] + ',' + 'disable'
      global.asset41[4] = 'disable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.portfolioWindow.window.document.getElementById('asset41').style.display = 'none'
    }
    if (asset === '42') {
      settings.asset42 = global.asset42[0] + ',' + global.asset42[1] + ',' + global.asset42[2] + ',' + global.asset42[3] + ',' + 'disable'
      global.asset42[4] = 'disable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.portfolioWindow.window.document.getElementById('asset42').style.display = 'none'
    }
    if (asset === '43') {
      settings.asset43 = global.asset43[0] + ',' + global.asset43[1] + ',' + global.asset43[2] + ',' + global.asset43[3] + ',' + 'disable'
      global.asset43[4] = 'disable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.portfolioWindow.window.document.getElementById('asset43').style.display = 'none'
    }
    if (asset === '44') {
      settings.asset44 = global.asset44[0] + ',' + global.asset44[1] + ',' + global.asset44[2] + ',' + global.asset44[3] + ',' + 'disable'
      global.asset44[4] = 'disable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.portfolioWindow.window.document.getElementById('asset44').style.display = 'none'
    }
    if (asset === '45') {
      settings.asset45 = global.asset45[0] + ',' + global.asset45[1] + ',' + global.asset45[2] + ',' + global.asset45[3] + ',' + 'disable'
      global.asset45[4] = 'disable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.portfolioWindow.window.document.getElementById('asset45').style.display = 'none'
    }
    if (asset === '46') {
      settings.asset46 = global.asset46[0] + ',' + global.asset46[1] + ',' + global.asset46[2] + ',' + global.asset46[3] + ',' + 'disable'
      global.asset46[4] = 'disable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.portfolioWindow.window.document.getElementById('asset46').style.display = 'none'
    }
    if (asset === '47') {
      settings.asset47 = global.asset47[0] + ',' + global.asset47[1] + ',' + global.asset47[2] + ',' + global.asset47[3] + ',' + 'disable'
      global.asset47[4] = 'disable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.portfolioWindow.window.document.getElementById('asset47').style.display = 'none'
    }
    if (asset === '48') {
      settings.asset48 = global.asset48[0] + ',' + global.asset48[1] + ',' + global.asset48[2] + ',' + global.asset48[3] + ',' + 'disable'
      global.asset48[4] = 'disable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.portfolioWindow.window.document.getElementById('asset48').style.display = 'none'
    }
    if (asset === '49') {
      settings.asset49 = global.asset49[0] + ',' + global.asset49[1] + ',' + global.asset49[2] + ',' + global.asset49[3] + ',' + 'disable'
      global.asset49[4] = 'disable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.portfolioWindow.window.document.getElementById('asset49').style.display = 'none'
    }
    if (asset === '50') {
      settings.asset50 = global.asset50[0] + ',' + global.asset50[1] + ',' + global.asset50[2] + ',' + global.asset50[3] + ',' + 'disable'
      global.asset50[4] = 'disable'
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
      global.portfolioWindow.window.document.getElementById('asset50').style.display = 'none'
    }
  },
  calculateTotalAssetCost: function () {
    return new Promise(function (resolve, reject) {
      var total = []
      var totalAcquireCost = 0
      var totalCurrentCost = 0
      var totalProfit = 0
      var profitPercent = 0
      var sign
      if (global.asset1[4] === 'enable') {
        tickers.findMarketValue(global.asset1[0]).then((price) => {
          totalAcquireCost += Number(global.asset1[3] * Number(global.asset1[2]))
          totalCurrentCost += Number(price[0]) * Number(global.asset1[3])
        })
      }
      if (global.asset2[4] === 'enable') {
        tickers.findMarketValue(global.asset2[0]).then((price) => {
          totalAcquireCost += Number(global.asset2[3] * Number(global.asset2[2]))
          totalCurrentCost += Number(price[0]) * Number(global.asset2[3])
        })
      }
      if (global.asset3[4] === 'enable') {
        tickers.findMarketValue(global.asset3[0]).then((price) => {
          totalAcquireCost += Number(global.asset3[3] * Number(global.asset3[2]))
          totalCurrentCost += Number(price[0]) * Number(global.asset3[3])
        })
      }
      if (global.asset4[4] === 'enable') {
        tickers.findMarketValue(global.asset4[0]).then((price) => {
          totalAcquireCost += Number(global.asset4[3] * Number(global.asset4[2]))
          totalCurrentCost += Number(price[0]) * Number(global.asset4[3])
        })
      }
      if (global.asset5[4] === 'enable') {
        tickers.findMarketValue(global.asset5[0]).then((price) => {
          totalAcquireCost += Number(global.asset5[3] * Number(global.asset5[2]))
          totalCurrentCost += Number(price[0]) * Number(global.asset5[3])
        })
      }
      if (global.asset6[4] === 'enable') {
        tickers.findMarketValue(global.asset6[0]).then((price) => {
          totalAcquireCost += Number(global.asset6[3] * Number(global.asset6[2]))
          totalCurrentCost += Number(price[0]) * Number(global.asset6[3])
        })
      }
      if (global.asset7[4] === 'enable') {
        tickers.findMarketValue(global.asset7[0]).then((price) => {
          totalAcquireCost += Number(global.asset7[3] * Number(global.asset7[2]))
          totalCurrentCost += Number(price[0]) * Number(global.asset7[3])
        })
      }
      if (global.asset8[4] === 'enable') {
        tickers.findMarketValue(global.asset8[0]).then((price) => {
          totalAcquireCost += Number(global.asset8[3] * Number(global.asset8[2]))
          totalCurrentCost += Number(price[0]) * Number(global.asset8[3])
        })
      }
      if (global.asset9[4] === 'enable') {
        tickers.findMarketValue(global.asset9[0]).then((price) => {
          totalAcquireCost += Number(global.asset9[3] * Number(global.asset9[2]))
          totalCurrentCost += Number(price[0]) * Number(global.asset9[3])
        })
      }
      if (global.asset10[4] === 'enable') {
        tickers.findMarketValue(global.asset10[0]).then((price) => {
          totalAcquireCost += Number(global.asset10[3] * Number(global.asset10[2]))
          totalCurrentCost += Number(price[0]) * Number(global.asset10[3])
        })
      }
      if (global.asset11[4] === 'enable') {
        tickers.findMarketValue(global.asset11[0]).then((price) => {
          totalAcquireCost += Number(global.asset11[3] * Number(global.asset11[2]))
          totalCurrentCost += Number(price[0]) * Number(global.asset11[3])
        })
      }
      if (global.asset12[4] === 'enable') {
        tickers.findMarketValue(global.asset12[0]).then((price) => {
          totalAcquireCost += Number(global.asset12[3] * Number(global.asset12[2]))
          totalCurrentCost += Number(price[0]) * Number(global.asset12[3])
        })
      }
      if (global.asset13[4] === 'enable') {
        tickers.findMarketValue(global.asset13[0]).then((price) => {
          totalAcquireCost += Number(global.asset13[3] * Number(global.asset13[2]))
          totalCurrentCost += Number(price[0]) * Number(global.asset13[3])
        })
      }
      if (global.asset14[4] === 'enable') {
        tickers.findMarketValue(global.asset14[0]).then((price) => {
          totalAcquireCost += Number(global.asset14[3] * Number(global.asset14[2]))
          totalCurrentCost += Number(price[0]) * Number(global.asset14[3])
        })
      }
      if (global.asset15[4] === 'enable') {
        tickers.findMarketValue(global.asset15[0]).then((price) => {
          totalAcquireCost += Number(global.asset15[3] * Number(global.asset15[2]))
          totalCurrentCost += Number(price[0]) * Number(global.asset15[3])
        })
      }
      if (global.asset16[4] === 'enable') {
        tickers.findMarketValue(global.asset16[0]).then((price) => {
          totalAcquireCost += Number(global.asset16[3] * Number(global.asset16[2]))
          totalCurrentCost += Number(price[0]) * Number(global.asset16[3])
        })
      }
      if (global.asset17[4] === 'enable') {
        tickers.findMarketValue(global.asset17[0]).then((price) => {
          totalAcquireCost += Number(global.asset17[3] * Number(global.asset17[2]))
          totalCurrentCost += Number(price[0]) * Number(global.asset17[3])
        })
      }
      if (global.asset18[4] === 'enable') {
        tickers.findMarketValue(global.asset18[0]).then((price) => {
          totalAcquireCost += Number(global.asset18[3] * Number(global.asset18[2]))
          totalCurrentCost += Number(price[0]) * Number(global.asset18[3])
        })
      }
      if (global.asset19[4] === 'enable') {
        tickers.findMarketValue(global.asset19[0]).then((price) => {
          totalAcquireCost += Number(global.asset19[3] * Number(global.asset19[2]))
          totalCurrentCost += Number(price[0]) * Number(global.asset19[3])
        })
      }
      if (global.asset20[4] === 'enable') {
        tickers.findMarketValue(global.asset20[0]).then((price) => {
          totalAcquireCost += Number(global.asset20[3] * Number(global.asset20[2]))
          totalCurrentCost += Number(price[0]) * Number(global.asset20[3])
        })
      }
      if (global.asset21[4] === 'enable') {
        tickers.findMarketValue(global.asset21[0]).then((price) => {
          totalAcquireCost += Number(global.asset21[3] * Number(global.asset21[2]))
          totalCurrentCost += Number(price[0]) * Number(global.asset21[3])
        })
      }
      if (global.asset22[4] === 'enable') {
        tickers.findMarketValue(global.asset22[0]).then((price) => {
          totalAcquireCost += Number(global.asset22[3] * Number(global.asset22[2]))
          totalCurrentCost += Number(price[0]) * Number(global.asset22[3])
        })
      }
      if (global.asset23[4] === 'enable') {
        tickers.findMarketValue(global.asset23[0]).then((price) => {
          totalAcquireCost += Number(global.asset23[3] * Number(global.asset23[2]))
          totalCurrentCost += Number(price[0]) * Number(global.asset23[3])
        })
      }
      if (global.asset24[4] === 'enable') {
        tickers.findMarketValue(global.asset24[0]).then((price) => {
          totalAcquireCost += Number(global.asset24[3] * Number(global.asset24[2]))
          totalCurrentCost += Number(price[0]) * Number(global.asset24[3])
        })
      }
      if (global.asset25[4] === 'enable') {
        tickers.findMarketValue(global.asset25[0]).then((price) => {
          totalAcquireCost += Number(global.asset25[3] * Number(global.asset25[2]))
          totalCurrentCost += Number(price[0]) * Number(global.asset25[3])
        })
      }
      if (global.asset26[4] === 'enable') {
        tickers.findMarketValue(global.asset26[0]).then((price) => {
          totalAcquireCost += Number(global.asset26[3] * Number(global.asset26[2]))
          totalCurrentCost += Number(price[0]) * Number(global.asset26[3])
        })
      }
      if (global.asset27[4] === 'enable') {
        tickers.findMarketValue(global.asset27[0]).then((price) => {
          totalAcquireCost += Number(global.asset27[3] * Number(global.asset27[2]))
          totalCurrentCost += Number(price[0]) * Number(global.asset27[3])
        })
      }
      if (global.asset28[4] === 'enable') {
        tickers.findMarketValue(global.asset28[0]).then((price) => {
          totalAcquireCost += Number(global.asset28[3] * Number(global.asset28[2]))
          totalCurrentCost += Number(price[0]) * Number(global.asset28[3])
        })
      }
      if (global.asset29[4] === 'enable') {
        tickers.findMarketValue(global.asset29[0]).then((price) => {
          totalAcquireCost += Number(global.asset29[3] * Number(global.asset29[2]))
          totalCurrentCost += Number(price[0]) * Number(global.asset29[3])
        })
      }
      if (global.asset30[4] === 'enable') {
        tickers.findMarketValue(global.asset30[0]).then((price) => {
          totalAcquireCost += Number(global.asset30[3] * Number(global.asset30[2]))
          totalCurrentCost += Number(price[0]) * Number(global.asset30[3])
        })
      }
      if (global.asset31[4] === 'enable') {
        tickers.findMarketValue(global.asset31[0]).then((price) => {
          totalAcquireCost += Number(global.asset31[3] * Number(global.asset31[2]))
          totalCurrentCost += Number(price[0]) * Number(global.asset31[3])
        })
      }
      if (global.asset32[4] === 'enable') {
        tickers.findMarketValue(global.asset32[0]).then((price) => {
          totalAcquireCost += Number(global.asset32[3] * Number(global.asset32[2]))
          totalCurrentCost += Number(price[0]) * Number(global.asset32[3])
        })
      }
      if (global.asset33[4] === 'enable') {
        tickers.findMarketValue(global.asset33[0]).then((price) => {
          totalAcquireCost += Number(global.asset33[3] * Number(global.asset33[2]))
          totalCurrentCost += Number(price[0]) * Number(global.asset33[3])
        })
      }
      if (global.asset34[4] === 'enable') {
        tickers.findMarketValue(global.asset34[0]).then((price) => {
          totalAcquireCost += Number(global.asset34[3] * Number(global.asset34[2]))
          totalCurrentCost += Number(price[0]) * Number(global.asset34[3])
        })
      }
      if (global.asset35[4] === 'enable') {
        tickers.findMarketValue(global.asset35[0]).then((price) => {
          totalAcquireCost += Number(global.asset35[3] * Number(global.asset35[2]))
          totalCurrentCost += Number(price[0]) * Number(global.asset35[3])
        })
      }
      if (global.asset36[4] === 'enable') {
        tickers.findMarketValue(global.asset36[0]).then((price) => {
          totalAcquireCost += Number(global.asset36[3] * Number(global.asset36[2]))
          totalCurrentCost += Number(price[0]) * Number(global.asset36[3])
        })
      }
      if (global.asset37[4] === 'enable') {
        tickers.findMarketValue(global.asset37[0]).then((price) => {
          totalAcquireCost += Number(global.asset37[3] * Number(global.asset37[2]))
          totalCurrentCost += Number(price[0]) * Number(global.asset37[3])
        })
      }
      if (global.asset38[4] === 'enable') {
        tickers.findMarketValue(global.asset38[0]).then((price) => {
          totalAcquireCost += Number(global.asset38[3] * Number(global.asset38[2]))
          totalCurrentCost += Number(price[0]) * Number(global.asset38[3])
        })
      }
      if (global.asset39[4] === 'enable') {
        tickers.findMarketValue(global.asset39[0]).then((price) => {
          totalAcquireCost += Number(global.asset39[3] * Number(global.asset39[2]))
          totalCurrentCost += Number(price[0]) * Number(global.asset39[3])
        })
      }
      if (global.asset40[4] === 'enable') {
        tickers.findMarketValue(global.asset40[0]).then((price) => {
          totalAcquireCost += Number(global.asset40[3] * Number(global.asset40[2]))
          totalCurrentCost += Number(price[0]) * Number(global.asset40[3])
        })
      }
      if (global.asset41[4] === 'enable') {
        tickers.findMarketValue(global.asset41[0]).then((price) => {
          totalAcquireCost += Number(global.asset41[3] * Number(global.asset41[2]))
          totalCurrentCost += Number(price[0]) * Number(global.asset41[3])
        })
      }
      if (global.asset42[4] === 'enable') {
        tickers.findMarketValue(global.asset42[0]).then((price) => {
          totalAcquireCost += Number(global.asset42[3] * Number(global.asset42[2]))
          totalCurrentCost += Number(price[0]) * Number(global.asset42[3])
        })
      }
      if (global.asset43[4] === 'enable') {
        tickers.findMarketValue(global.asset43[0]).then((price) => {
          totalAcquireCost += Number(global.asset43[3] * Number(global.asset43[2]))
          totalCurrentCost += Number(price[0]) * Number(global.asset43[3])
        })
      }
      if (global.asset44[4] === 'enable') {
        tickers.findMarketValue(global.asset44[0]).then((price) => {
          totalAcquireCost += Number(global.asset44[3] * Number(global.asset44[2]))
          totalCurrentCost += Number(price[0]) * Number(global.asset44[3])
        })
      }
      if (global.asset45[4] === 'enable') {
        tickers.findMarketValue(global.asset45[0]).then((price) => {
          totalAcquireCost += Number(global.asset45[3] * Number(global.asset45[2]))
          totalCurrentCost += Number(price[0]) * Number(global.asset45[3])
        })
      }
      if (global.asset46[4] === 'enable') {
        tickers.findMarketValue(global.asset46[0]).then((price) => {
          totalAcquireCost += Number(global.asset46[3] * Number(global.asset46[2]))
          totalCurrentCost += Number(price[0]) * Number(global.asset46[3])
        })
      }
      if (global.asset47[4] === 'enable') {
        tickers.findMarketValue(global.asset47[0]).then((price) => {
          totalAcquireCost += Number(global.asset47[3] * Number(global.asset47[2]))
          totalCurrentCost += Number(price[0]) * Number(global.asset47[3])
        })
      }
      if (global.asset48[4] === 'enable') {
        tickers.findMarketValue(global.asset48[0]).then((price) => {
          totalAcquireCost += Number(global.asset48[3] * Number(global.asset48[2]))
          totalCurrentCost += Number(price[0]) * Number(global.asset48[3])
        })
      }
      if (global.asset49[4] === 'enable') {
        tickers.findMarketValue(global.asset49[0]).then((price) => {
          totalAcquireCost += Number(global.asset49[3] * Number(global.asset49[2]))
          totalCurrentCost += Number(price[0]) * Number(global.asset49[3])
        })
      }
      if (global.asset50[4] === 'enable') {
        tickers.findMarketValue(global.asset50[0]).then((price) => {
          totalAcquireCost += Number(global.asset50[3] * Number(global.asset50[2]))
          totalCurrentCost += Number(price[0]) * Number(global.asset50[3])
        })
      }
      sleep(10000).then(() => {
        if (totalCurrentCost >= totalAcquireCost) {
          sign = ''
        } else {
          sign = '-'
          profitPercent = 100 - profitPercent
        }
        totalProfit += totalCurrentCost - totalAcquireCost
        profitPercent = totalCurrentCost / totalAcquireCost * 100
        total[0] = (totalAcquireCost).toFixed(2)
        total[1] = (totalCurrentCost).toFixed(2)
        total[2] = (totalProfit).toFixed(2)
        total[3] = (profitPercent).toFixed(2)
        total[4] = sign
        resolve(total)
      })
    })
  },
  totalAssetCostDialog: async function () {
    tickers.appDialogWindowSpinner('{"window": "' + lang.echo('Loading') + '", "title": "' + lang.echo('Loading') + '"}')
    this.calculateTotalAssetCost().then((total) => {
      global.windowSpinner.close()
      tickers.appDialogWindowCalc('{"window": "' + lang.echo('Total assets cost') + '", "title": "' + lang.echo('Total assets cost') + '", "message": "' + lang.echo('Acquire assets cost: ') + total[0] + '", ' + '"messageTwo": "' + lang.echo('Current assets cost: ') + total[1] + '", ' + '"messageThree": "' + lang.echo('Total profit: ') + total[2] + ' (' + total[4] + total[3] + '%)"}')
    })
  },
  changeUpdColor: function (boardNumber) {
    var updBoard = global.mainWindow.window.document.getElementById('up' + boardNumber)
    var colorBoard = global.mainWindow.window.document.getElementById('cboard' + boardNumber)
    if (updBoard.style.color === 'transparent') {
      if (colorBoard.className === 'uk-card-large uk-card-secondary uk-card-hover uk-card-body') {
        updBoard.style.color = '#ffffff'
      } else {
        updBoard.style.color = '#3a3a3a'
      }
    } else {
      updBoard.style.color = 'transparent'
    }
  },
  createLicense: function (type, email) {
    var license
    if (typeof (settings.license) !== 'undefined') {
      license = settings.license
    } else {
      license = crypto.randomBytes(44).toString('hex')
    }
    requestClient.post({
      maxAttempts: 3,
      retryDelay: 2000,
      uri: 'https://api.btcwid.com' + '/v1/create-new-license',
      form: { lang: settings.locale, license: license, email: email, type: type },
      json: true,
    }, function (error, response, body) {
      var msg
      if (typeof (body.success) === 'undefined') {
        msg = body.error
        tickers.appDialogWindow('{"window": "License creation", "title": "License creation", "message": "' + msg + '"}')
      } else {
        msg = body.success
        settings.userid = body.userid
        settings.license = license
        fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
        global.licenseWindow.window.document.getElementById('select').style.display = 'none'
        global.licenseWindow.window.document.getElementById('verify').style.display = 'block'
        tickers.appDialogWindow('{"window": "License creation", "title": "License creation", "message": "' + msg + '"}')
      }
    })
  },
  restoreLicense: function (email) {
    requestClient.post({
      maxAttempts: 3,
      retryDelay: 2000,
      uri: 'https://api.btcwid.com' + '/v1/restore-license',
      form: { lang: settings.locale, email: email },
      json: true,
    }, function (error, response, body) {
      var msg
      if (typeof (body.success) === 'undefined') {
        msg = body.error
        tickers.appDialogWindow('{"window": "Restore license", "title": "Restore license", "message": "' + msg + '"}')
      } else {
        msg = body.success
        global.licenseWindow.window.document.getElementById('select').style.display = 'none'
        global.licenseWindow.window.document.getElementById('verifyAgain').style.display = 'block'
        tickers.appDialogWindow('{"window": "Restore license", "title": "Restore license", "message": "' + msg + '"}')
      }
    })
  },
  emailConfirm: function (code) {
    requestClient.post({
      maxAttempts: 3,
      retryDelay: 2000,
      uri: 'https://api.btcwid.com' + '/v1/verify-email',
      form: { lang: settings.locale, code: code },
      json: true,
    }, function (error, response, body) {
      var msg
      if (typeof (body.success) === 'undefined') {
        msg = body.error
        global.licenseWindow.window.document.getElementById('select').style.display = 'none'
        global.licenseWindow.window.document.getElementById('verify').style.display = 'block'
        tickers.appDialogWindow('{"window": "License email verification", "title": "License email verification", "message": "' + msg + '"}')
      } else {
        msg = body.success
        global.licenseWindow.window.document.getElementById('select').style.display = 'none'
        global.licenseWindow.window.document.getElementById('verify').style.display = 'none'
        tickers.appDialogWindow('{"window": "License email verification", "title": "License email verification", "message": "' + msg + '"}')
      }
    })
  },
  emailConfirmAgain: function (code) {
    requestClient.post({
      maxAttempts: 3,
      retryDelay: 2000,
      uri: 'https://api.btcwid.com' + '/v1/verify-email-restore',
      form: { lang: settings.locale, code: code },
      json: true,
    }, function (error, response, body) {
      var msg
      if (typeof (body.success) === 'undefined') {
        msg = body.error
        global.licenseWindow.window.document.getElementById('select').style.display = 'none'
        global.licenseWindow.window.document.getElementById('verifyAgain').style.display = 'block'
        tickers.appDialogWindow('{"window": "License email verification (restore)", "title": "License email verification (restore)", "message": "' + msg + '"}')
      } else {
        msg = body.success
        settings.userid = body.userid
        settings.license = body.license
        fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
        global.licenseWindow.window.document.getElementById('select').style.display = 'none'
        global.licenseWindow.window.document.getElementById('verifyAgain').style.display = 'none'
        global.licenseWindow.close()
        tickers.appDialogWindow('{"window": "License email verification (restore)", "title": "License email verification (restore)", "message": "' + msg + '"}')
      }
    })
  },
  resendEmail: function () {
    requestClient.post({
      maxAttempts: 3,
      retryDelay: 2000,
      uri: 'https://api.btcwid.com' + '/v1/resend-code',
      form: { lang: settings.locale, license: settings.license, userid: settings.userid },
      json: true,
    }, function (error, response, body) {
      var msg
      if (typeof (body.success) === 'undefined') {
        msg = body.error
        global.licenseWindow.window.document.getElementById('select').style.display = 'none'
        global.licenseWindow.window.document.getElementById('verify').style.display = 'block'
        tickers.appDialogWindow('{"window": "License email verification", "title": "License email verification", "message": "' + msg + '"}')
      } else {
        msg = body.success
        global.licenseWindow.window.document.getElementById('select').style.display = 'none'
        global.licenseWindow.window.document.getElementById('verify').style.display = 'block'
        tickers.appDialogWindow('{"window": "License email verification", "title": "License email verification", "message": "' + msg + '"}')
      }
    })
  },
  changeEmail: function (email) {
    requestClient.post({
      maxAttempts: 3,
      retryDelay: 2000,
      uri: 'https://api.btcwid.com' + '/v1/change-license-email',
      form: { lang: settings.locale, license: settings.license, userid: settings.userid, email: email },
      json: true,
    }, function (error, response, body) {
      var msg
      if (typeof (body.success) === 'undefined') {
        msg = body.error
        tickers.appDialogWindow('{"window": "Email change progress", "title": "Email change progress", "message": "' + msg + '"}')
      } else {
        msg = body.success
        global.licenseWindow.window.document.getElementById('status').style.display = 'none'
        global.licenseWindow.window.document.getElementById('verify').style.display = 'block'
        tickers.appDialogWindow('{"window": "Email change progress", "title": "Email change progress", "message": "' + msg + '"}')
      }
    })
  },
  licenseStatus: function () {
    return new Promise(function (resolve, reject) {
      requestClient.post({
        maxAttempts: 3,
        retryDelay: 2000,
        uri: 'https://api.btcwid.com' + '/v1/validate-license',
        form: { lang: settings.locale, license: settings.license, userid: settings.userid },
        json: true,
      }, function (error, response, body) {
        if (typeof (body.error) !== 'undefined') {
          resolve(false)
        } else {
          var verified
          if (body.verification === false) {
            verified = 'Email is not confirmed, consider changing it'
          } else {
            verified = 'Email is confirmed'
          }
          resolve({ "email": body.email, "created": body.created, "type": body.type, "verified": verified, "status": body.status })
        }
      })
    })
  },
  intelTitleSize: function () {
    var titleBoard1 = global.mainWindow.window.document.getElementById('nboard1')
    var titleBoard2 = global.mainWindow.window.document.getElementById('nboard2')
    var titleBoard3 = global.mainWindow.window.document.getElementById('nboard3')
    var titleBoard4 = global.mainWindow.window.document.getElementById('nboard4')
    var titleBoard5 = global.mainWindow.window.document.getElementById('nboard5')
    var titleBoard6 = global.mainWindow.window.document.getElementById('nboard6')
    var titleBoard7 = global.mainWindow.window.document.getElementById('nboard7')
    var titleBoard8 = global.mainWindow.window.document.getElementById('nboard8')
    var titleBoard9 = global.mainWindow.window.document.getElementById('nboard9')
    var titleBoard10 = global.mainWindow.window.document.getElementById('nboard10')
    var titleBoard11 = global.mainWindow.window.document.getElementById('nboard11')
    var titleBoard12 = global.mainWindow.window.document.getElementById('nboard12')
    var titleBoard13 = global.mainWindow.window.document.getElementById('nboard13')
    var titleBoard14 = global.mainWindow.window.document.getElementById('nboard14')
    var titleBoard15 = global.mainWindow.window.document.getElementById('nboard15')
    var titleBoard16 = global.mainWindow.window.document.getElementById('nboard16')
    if (titleBoard1.innerHTML.length > 11) {
      titleBoard1.style.fontSize = '1rem'
    } else {
      titleBoard1.style.fontSize = '1.6rem'
    }
    if (titleBoard2.innerHTML.length > 11) {
      titleBoard2.style.fontSize = '1rem'
    } else {
      titleBoard2.style.fontSize = '1.6rem'
    }
    if (titleBoard3.innerHTML.length > 11) {
      titleBoard3.style.fontSize = '1rem'
    } else {
      titleBoard3.style.fontSize = '1.6rem'
    }
    if (titleBoard4.innerHTML.length > 11) {
      titleBoard4.style.fontSize = '1rem'
    } else {
      titleBoard4.style.fontSize = '1.6rem'
    }
    if (global.licenseRender === 'true') {
      if (titleBoard5.innerHTML.length > 11) {
        titleBoard5.style.fontSize = '1rem'
      } else {
        titleBoard5.style.fontSize = '1.6rem'
      }
      if (titleBoard6.innerHTML.length > 11) {
        titleBoard6.style.fontSize = '1rem'
      } else {
        titleBoard6.style.fontSize = '1.6rem'
      }
      if (titleBoard7.innerHTML.length > 11) {
        titleBoard7.style.fontSize = '1rem'
      } else {
        titleBoard7.style.fontSize = '1.6rem'
      }
      if (titleBoard8.innerHTML.length > 11) {
        titleBoard8.style.fontSize = '1rem'
      } else {
        titleBoard8.style.fontSize = '1.6rem'
      }
      if (titleBoard9.innerHTML.length > 11) {
        titleBoard9.style.fontSize = '1rem'
      } else {
        titleBoard9.style.fontSize = '1.6rem'
      }
      if (titleBoard10.innerHTML.length > 11) {
        titleBoard10.style.fontSize = '1rem'
      } else {
        titleBoard10.style.fontSize = '1.6rem'
      }
      if (titleBoard11.innerHTML.length > 11) {
        titleBoard11.style.fontSize = '1rem'
      } else {
        titleBoard11.style.fontSize = '1.6rem'
      }
      if (titleBoard12.innerHTML.length > 11) {
        titleBoard12.style.fontSize = '1rem'
      } else {
        titleBoard12.style.fontSize = '1.6rem'
      }
      if (titleBoard13.innerHTML.length > 11) {
        titleBoard13.style.fontSize = '1rem'
      } else {
        titleBoard13.style.fontSize = '1.6rem'
      }
      if (titleBoard14.innerHTML.length > 11) {
        titleBoard14.style.fontSize = '1rem'
      } else {
        titleBoard14.style.fontSize = '1.6rem'
      }
      if (titleBoard15.innerHTML.length > 11) {
        titleBoard15.style.fontSize = '1rem'
      } else {
        titleBoard15.style.fontSize = '1.6rem'
      }
      if (titleBoard16.innerHTML.length > 11) {
        titleBoard16.style.fontSize = '1rem'
      } else {
        titleBoard16.style.fontSize = '1.6rem'
      }
    }
  },
  advancedSettings: function (tls, cors, coins, coinsCmc, restoreDefault, disableUseful) {
    if (tls === 'noTls') {
      if (global.strictTls === 'disable') {
      } else {
        global.strictTls = 'disable'
        settings.strictTls = global.strictTls
        global.tlsSettings = { rejectUnauthorized: false, requestCert: false, strictSSL: false }
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
        fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
        tickers.appDialogWindow('{"window": "' + lang.echo('TLS verification disabled') + '", "title": "' + lang.echo('TLS verification disabled') + '", "message": "' + lang.echo('TLS verification disabled') + '"}')
      }
    }
    if (tls === 'yesTls') {
      if (global.strictTls === 'enable') {
      } else {
        global.strictTls = 'enable'
        settings.strictTls = global.strictTls
        global.tlsSettings = {}
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1'
        fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
        tickers.appDialogWindow('{"window": "' + lang.echo('TLS validation enabled') + '", "title": "' + lang.echo('TLS validation enabled') + '", "message": "' + lang.echo('TLS validation enabled') + '"}')
      }
    }
    if (cors === 'noProxy') {
      if (global.corsProxy === '') {
      } else {
        global.corsProxy = ''
        settings.corsProxy = 'disable'
        fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
        tickers.appDialogWindow('{"window": "' + lang.echo('Cors Proxy Disabled') + '", "title": "' + lang.echo('Cors Proxy Disabled') + '", "message": "' + lang.echo('Cors Proxy Disabled') + '"}')
      }
    }
    if (cors === 'yesProxy') {
      if (global.corsProxy === 'https://autumn-wildflower-e3ba.bitcoin-monitor-widget.workers.dev/corsproxy/?apiurl=') {
      } else {
        global.corsProxy = 'https://autumn-wildflower-e3ba.bitcoin-monitor-widget.workers.dev/corsproxy/?apiurl='
        settings.corsProxy = 'enable'
        fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
        tickers.appDialogWindow('{"window": "' + lang.echo('Cors Proxy Activated') + '", "title": "' + lang.echo('Cors Proxy Activated') + '", "message": "' + lang.echo('Cors Proxy Activated') + '"}')
      }
    }
    if (coins === 'updCoins') {
      requestClient.get({
        options: global.tlsSettings,
        maxAttempts: 3,
        retryDelay: 2000,
        uri: global.corsProxy + 'https://api.coingecko.com/api/v3/coins/list'
      }, function (error, response, body) {
        console.error('error:', error)
        if (body.length > 10) {
          fs.writeFileSync(coinsFile, body)
          coins = JSON.parse(fs.readFileSync(coinsFile, 'utf-8'))
          tickers.appDialogWindow('{"window": "' + lang.echo('Coins Database Updated') + '", "title": "' + lang.echo('Coins Database Updated') + '", "message": "' + lang.echo('Coins Database Updated') + " " + lang.echo('From The CoinGecko') + '"}')
        }
      })
    }
    if (coinsCmc === 'updCoinMarketCap') {
      requestClient.get({
        options: global.tlsSettings,
        maxAttempts: 3,
        retryDelay: 2000,
        uri: global.corsProxy + 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/map',
        headers: { 'X-CMC_PRO_API_KEY': '74868bae-9a4c-4b7f-9869-3a69f0b808ff' }
      }, function (error, response, body) {
        console.error('error:', error)
        if (body.length > 10) {
          fs.writeFileSync(coinsFileCmc, body)
          coinsCmc = JSON.parse(fs.readFileSync(coinsFileCmc, 'utf-8'))
          tickers.appDialogWindow('{"window": "' + lang.echo('Coins Database Updated') + '", "title": "' + lang.echo('Coins Database Updated') + '", "message": "' + lang.echo('Coins Database Updated') + " " + lang.echo('From The CoinMarketCap') + '"}')
        }
      })
    }
    if (restoreDefault === 'doRestore') {
      fs.copyFileSync(path.normalize(nw.__dirname + '/styles/main/css/light.css'), stylesFile)
      tickers.appDialogWindow('{"window": "' + lang.echo('Default CSS File Restored') + '", "title": "' + lang.echo('Default CSS File Restored') + '", "message": "' + lang.echo('Default CSS File Restored. Restart application to reload it!') + '"}')
    }
    if (disableUseful === 'yesMenu') {
      if (global.useful === 'enable') {
      } else {
        global.useful === 'enable'
        settings.useful = 'enable'
        fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
        tickers.appDialogWindow('{"window": "' + lang.echo('Useful menu hidden') + '", "title": "' + lang.echo('Useful menu hidden') + '", "message": "' + lang.echo('Useful menu is hidden. Restart application to see the changes!') + '"}')
      }
    }
    if (disableUseful === 'noMenu') {
      if (global.useful === 'disable') {
      } else {
        global.useful === 'disable'
        settings.useful = 'disable'
        fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf-8')
        tickers.appDialogWindow('{"window": "' + lang.echo('Useful menu activated') + '", "title": "' + lang.echo('Useful menu activated') + '", "message": "' + lang.echo('Useful menu is reactivated. Restart application to see the changes!') + '"}')
      }
    }
  },
  alarmListWindow: function () {
    gui.Window.open('views/alarmList.html', {
      focus: true,
      position: 'center',
      width: 960,
      height: 720
    })
  },
  boardTickerConfigurationWindow: function (boardNumber) {
    gui.Window.open('views/boardTickerConfiguration.html', {
      focus: true,
      position: 'center',
      width: 960,
      height: 720,
      title: boardNumber
    })
  },
  boardAlarmConfigurationWindow: function (boardNumber) {
    gui.Window.open('views/boardAlarmConfiguration.html', {
      focus: true,
      position: 'center',
      width: 960,
      height: 720,
      title: boardNumber
    })
  },
  backgroundColorConfigurationWindow: function () {
    gui.Window.open('views/backgroundColorConfiguration.html', {
      focus: true,
      position: 'center',
      width: 960,
      height: 720
    })
  },
  portfolioConfigurationWindow: function () {
    gui.Window.open('views/portfolioConfiguration.html', {
      focus: true,
      position: 'center',
      width: 960,
      height: 720
    })
  },
  appConfigurationWindow: function () {
    gui.Window.open('views/appConfiguration.html', {
      focus: true,
      position: 'center',
      width: 800,
      height: 420
    })
  },
  appConfigurationWindowAdvanced: function () {
    gui.Window.open('views/appConfigurationAdvanced.html', {
      focus: true,
      position: 'center',
      width: 960,
      height: 820
    })
  },
  appLicenseWindow: function () {
    gui.Window.open('views/appLicense.html', {
      focus: true,
      position: 'center',
      width: 800,
      height: 700
    })
  }
}
