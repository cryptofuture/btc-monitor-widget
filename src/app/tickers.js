'use strict'
const requestClient = require('requestretry')
const gui = window.require('nw.gui')
const fs = require('fs')
const os = require('os')
const platform = os.platform()
var btcMonitorWidget
var configFolderHome
var settingsFile
var coinsFile
var binanceApi = 'https://api.binance.com'
var binanceFuturesApi = 'https://fapi.binance.com'
var kucoinApi = 'https://openapi-v2.kucoin.com'
var poloniexApi = 'https://poloniex.com'
var btcMarketsApi = 'https://api.btcmarkets.net'
var bitmexApi = 'https://www.bitmex.com'
var bitpayApi = 'https://bitpay.com'
var bitfinexApi = 'https://api.bitfinex.com'
var bitsoApi = 'https://api.bitso.com'
var bitstampApi = 'https://www.bitstamp.net'
var cexApi = 'https://cex.io'
var coingeckoApi = 'https://api.coingecko.com'
var coinbaseApi = 'https://api.pro.coinbase.com'
var cryptoCompareApi = 'https://min-api.cryptocompare.com'
var ftxApi = 'https://ftx.com/api'
var hitBtcApi = 'https://api.hitbtc.com'
var huobiApi = 'https://api.huobi.pro'
var krakenApi = 'https://api.kraken.com'
var paymiumApi = 'https://paymium.com'
var tdaxApi = 'https://api.tdax.com'
var vccApi = 'https://api.vcc.exchange'
var okexApi = 'https://www.okex.com/api'
var geminiApi = 'https://api.gemini.com'
const cryptoCompareApiKey = 'Apikey 8ba9e6ae8feddfaf814b03d12b8fdc0e92bb6b132a521502872b43f0011d98b4'

if (platform.includes('win32')) {
  btcMonitorWidget = process.env.APPDATA + '\\btc-monitor-widget'
  configFolderHome = btcMonitorWidget + '\\config'
  settingsFile = configFolderHome + '\\settings.json'
  coinsFile = configFolderHome + '\\coins.json'
} else if (platform.includes('darwin')) {
  btcMonitorWidget = process.env.HOME + '/Library/btc-monitor-widget'
  configFolderHome = btcMonitorWidget + '/config'
  settingsFile = configFolderHome + '/settings.json'
  coinsFile = configFolderHome + '/coins.json'
} else if (platform.includes('linux')) {
  btcMonitorWidget = process.env.HOME + '/.btc-monitor-widget'
  configFolderHome = btcMonitorWidget + '/config'
  settingsFile = configFolderHome + '/settings.json'
  coinsFile = configFolderHome + '/coins.json'
}

const lang = require('./lang')
const settings = JSON.parse(fs.readFileSync(settingsFile, 'utf-8')) // eslint-disable-line
const coins = JSON.parse(fs.readFileSync(coinsFile, 'utf-8'))

function binanceTicker (ticker) {
  return new Promise(function (resolve, reject) {
    var price = '0'
    requestClient.get({
      options: global.tlsSettings,
      maxAttempts: 3,
      retryDelay: 2000,
      uri: global.corsProxy + binanceApi + '/api/v3/ticker/price?symbol=' + ticker,
      json: true
    }, function (error, response, body) {
      console.error('error:', error)
      price = body.price
      resolve(price)
    })
  })
}

function binanceFuturesTicker (ticker) {
  return new Promise(function (resolve, reject) {
    var price = '0'
    requestClient.get({
      options: global.tlsSettings,
      maxAttempts: 3,
      retryDelay: 2000,
      uri: global.corsProxy + binanceFuturesApi + '/fapi/v1/ticker/price?symbol=' + ticker,
      json: true
    }, function (error, response, body) {
      console.error('error:', error)
      price = body.price
      resolve(price)
    })
  })
}

function kucoinTicker (ticker1, ticker2) {
  return new Promise(function (resolve, reject) {
    var price = '0'
    requestClient.get({
      options: global.tlsSettings,
      maxAttempts: 3,
      retryDelay: 2000,
      uri: global.corsProxy + kucoinApi + '/api/v1/market/orderbook/level1?symbol=' + ticker1 + '-' + ticker2,
      json: true
    }, function (error, response, body) {
      console.error('error:', error)
      price = body.data.price
      resolve(price)
    })
  })
}

function poloniexTicker (ticker1, ticker2) {
  return new Promise(function (resolve, reject) {
    var price = '0'
    requestClient.get({
      options: global.tlsSettings,
      maxAttempts: 3,
      retryDelay: 2000,
      uri: global.corsProxy + poloniexApi + '/public?command=returnTicker',
      json: true
    }, function (error, response, body) {
      const pair = ticker2 + '_' + ticker1
      if (!body[pair]) {
        throw new Error('no data for pair ' + pair)
      }
      console.error('error:', error)
      price = body[pair].last
      resolve(price)
    })
  })
}

function btcMarketsTicker (ticker1, ticker2) {
  return new Promise(function (resolve, reject) {
    var price = '0'
    requestClient.get({
      options: global.tlsSettings,
      maxAttempts: 3,
      retryDelay: 2000,
      uri: global.corsProxy + btcMarketsApi + '/market/' + ticker1 + '/' + ticker2 + '/tick',
      json: true
    }, function (error, response, body) {
      console.error('error:', error)
      price = body.data.lastPrice
      resolve(price)
    })
  })
}

function bitmexTicker (ticker) {
  return new Promise(function (resolve, reject) {
    var price = '0'
    requestClient.get({
      options: global.tlsSettings,
      maxAttempts: 3,
      retryDelay: 2000,
      uri: global.corsProxy + bitmexApi + '/api/v1/instrument?symbol=' + ticker + '&columns=lastPrice',
      json: true
    }, function (error, response, body) {
      console.error('error:', error)
      price = body[0].lastPrice
      resolve(price)
    })
  })
}

function bitpayTicker (ticker1, ticker2) {
  return new Promise(function (resolve, reject) {
    var price = '0'
    requestClient.get({
      options: global.tlsSettings,
      maxAttempts: 3,
      retryDelay: 2000,
      uri: global.corsProxy + bitpayApi + '/api/rates/' + ticker1,
      json: true
    }, function (error, response, body) {
      console.error('error:', error)
      const result = body.find(({ code }) => code === ticker2)
      price = result.rate
      resolve(price)
    })
  })
}

function bitfinexTicker (ticker) {
  return new Promise(function (resolve, reject) {
    var price = '0'
    requestClient.get({
      options: global.tlsSettings,
      maxAttempts: 3,
      retryDelay: 2000,
      uri: global.corsProxy + bitfinexApi + '/v1/pubticker/' + ticker,
      json: true
    }, function (error, response, body) {
      console.error('error:', error)
      price = body.ask
      resolve(price)
    })
  })
}

function bitsoTicker (ticker1, ticker2) {
  return new Promise(function (resolve, reject) {
    const pair = (ticker1 + '_' + ticker2).toLowerCase()
    var price = '0'
    requestClient.get({
      options: global.tlsSettings,
      maxAttempts: 3,
      retryDelay: 2000,
      uri: global.corsProxy + bitsoApi + '/v3/ticker?book=' + pair,
      json: true
    }, function (error, response, body) {
      console.error('error:', error)
      price = body.payload.last
      resolve(price)
    })
  })
}

function bitstampTicker (ticker1, ticker2) {
  return new Promise(function (resolve, reject) {
    const pair = (ticker1 + '' + ticker2).toLowerCase()
    var price = '0'
    requestClient.get({
      options: global.tlsSettings,
      maxAttempts: 3,
      retryDelay: 2000,
      uri: global.corsProxy + bitstampApi + '/api/v2/ticker/' + pair,
      json: true
    }, function (error, response, body) {
      console.error('error:', error)
      price = body.last
      resolve(price)
    })
  })
}

function cexTicker (ticker1, ticker2) {
  return new Promise(function (resolve, reject) {
    var price = '0'
    requestClient.get({
      options: global.tlsSettings,
      maxAttempts: 3,
      retryDelay: 2000,
      uri: global.corsProxy + cexApi + '/api/ticker/' + ticker1 + '/' + ticker2,
      json: true
    }, function (error, response, body) {
      console.error('error:', error)
      price = body.last
      resolve(price)
    })
  })
}

function coingeckoTicker (ticker1, ticker2) {
  var currency1 = coins.find(coin => coin.symbol === (ticker1).toLowerCase())
  var currency2 = coins.find(coin => coin.symbol === (ticker2).toLowerCase())
  return new Promise(function (resolve, reject) {
    var price = '0'
    requestClient.get({
      options: global.tlsSettings,
      maxAttempts: 3,
      retryDelay: 2000,
      uri: global.corsProxy + coingeckoApi + '/api/v3/coins/' + currency1.id + '/tickers',
      json: true
    }, function (error, response, body) {
      console.error('error:', error)
      const result = body.tickers.find(({ target }) => target === (currency2.symbol).toUpperCase())
      price = result.last
      resolve(price)
    })
  })
}

function coingeckoTarget (ticker) {
  var currency = coins.find(coin => coin.symbol === (ticker).toLowerCase())
  return new Promise(function (resolve, reject) {
    requestClient.get({
      options: global.tlsSettings,
      maxAttempts: 3,
      retryDelay: 2000,
      uri: global.corsProxy + coingeckoApi + '/api/v3/coins/' + currency.id + '/tickers',
      json: true
    }, function (error, response, body) {
      console.error('error:', error)
      var targetArr = []
      for (var i = 0; i < body.tickers.length; i++) {
        targetArr[i] = body.tickers[i].target
      }
      resolve(targetArr)
    })
  })
}

function coinbaseTicker (ticker1, ticker2) {
  return new Promise(function (resolve, reject) {
    var price = '0'
    requestClient.get({
      options: global.tlsSettings,
      maxAttempts: 3,
      retryDelay: 2000,
      uri: global.corsProxy + coinbaseApi + '/products/' + (ticker1).toUpperCase() + '-' + (ticker2).toUpperCase() + '/ticker',
      json: true
    }, function (error, response, body) {
      console.error('error:', error)
      price = body.ask
      resolve(price)
    })
  })
}

function cryptoCompareTicker (ticker1, ticker2) {
  return new Promise(function (resolve, reject) {
    var price = '0'
    requestClient.get({
      options: global.tlsSettings,
      maxAttempts: 3,
      retryDelay: 2000,
      uri: global.corsProxy + cryptoCompareApi + '/data/price?fsym=' + ticker1 + '&tsyms=' + ticker2,
      json: true
    }, function (error, response, body) {
      console.error('error:', error)
      price = body[ticker2]
      resolve(price)
    })
  })
}

function ftxTicker (ticker1, ticker2) {
  return new Promise(function (resolve, reject) {
    var price = '0'
    requestClient.get({
      options: global.tlsSettings,
      maxAttempts: 3,
      retryDelay: 2000,
      uri: global.corsProxy + ftxApi + '/markets/' + ticker1 + '-' + ticker2,
      json: true
    }, function (error, response, body) {
      console.error('error:', error)
      price = body.result.ask
      resolve(price)
    })
  })
}

function hitBtcTicker (ticker) {
  return new Promise(function (resolve, reject) {
    var price = '0'
    requestClient.get({
      options: global.tlsSettings,
      maxAttempts: 3,
      retryDelay: 2000,
      uri: global.corsProxy + hitBtcApi + '/api/2/public/ticker/' + ticker,
      json: true
    }, function (error, response, body) {
      console.error('error:', error)
      price = body.last
      resolve(price)
    })
  })
}

function huobiTicker (ticker) {
  return new Promise(function (resolve, reject) {
    var price = '0'
    requestClient.get({
      options: global.tlsSettings,
      maxAttempts: 3,
      retryDelay: 2000,
      uri: global.corsProxy + huobiApi + '/market/detail/' + ('merged?symbol=' + ticker).toLowerCase(),
      json: true
    }, function (error, response, body) {
      console.error('error:', error)
      price = body.tick.bid[0]
      resolve(price)
    })
  })
}

function krakenTicker (ticker) {
  return new Promise(function (resolve, reject) {
    var price = '0'
    requestClient.get({
      options: global.tlsSettings,
      maxAttempts: 3,
      retryDelay: 2000,
      uri: global.corsProxy + krakenApi + '/0/public/Ticker?pair=' + ticker,
      json: true
    }, function (error, response, body) {
      console.error('error:', error)
      price = body.result[ticker].c[0]
      resolve(price)
    })
  })
}

function paymiumTicker (ticker1) {
  return new Promise(function (resolve, reject) {
    var price = '0'
    requestClient.get({
      options: global.tlsSettings,
      maxAttempts: 3,
      retryDelay: 2000,
      uri: global.corsProxy + paymiumApi + ('/api/v1/data/' + ticker1 + '/ticker').toLowerCase(),
      json: true
    }, function (error, response, body) {
      console.error('error:', error)
      price = body.price
      resolve(price)
    })
  })
}

function tdaxTicker (ticker1, ticker2) {
  return new Promise(function (resolve, reject) {
    var price = '0'
    requestClient.get({
      options: global.tlsSettings,
      maxAttempts: 3,
      retryDelay: 2000,
      uri: global.corsProxy + tdaxApi + ('/api/orders/?pair=' + ticker1 + '_' + ticker2).toLowerCase(),
      json: true
    }, function (error, response, body) {
      console.error('error:', error)
      price = body.ask[0].price
      resolve(price)
    })
  })
}

function okexTicker (ticker1, ticker2) {
  return new Promise(function (resolve, reject) {
    var price = '0'
    requestClient.get({
      options: global.tlsSettings,
      maxAttempts: 3,
      retryDelay: 2000,
      uri: global.corsProxy + okexApi + '/spot/v3/instruments/' + ticker1 + '-' + ticker2 + '/book?size=1',
      json: true
    }, function (error, response, body) {
      console.error('error:', error)
      price = body.asks[0][0]
      resolve(price)
    })
  })
}

function geminiTicker (ticker1, ticker2) {
  return new Promise(function (resolve, reject) {
    var price = '0'
    requestClient.get({
      options: global.tlsSettings,
      maxAttempts: 3,
      retryDelay: 2000,
      uri: global.corsProxy + geminiApi + '/v2/ticker/' + (ticker1 + '' + ticker2).toLowerCase(),
      json: true
    }, function (error, response, body) {
      console.error('error:', error)
      price = body.ask
      resolve(price)
    })
  })
}

function vccTicker (ticker1, ticker2) {
  return new Promise(function (resolve, reject) {
    var price = '0'
    requestClient.get({
      options: global.tlsSettings,
      maxAttempts: 3,
      retryDelay: 2000,
      uri: global.corsProxy + vccApi + '/v3/trades/' + ticker1 + '_' + ticker2,
      json: true
    }, function (error, response, body) {
      console.error('error:', error)
      price = body.data[0].price
      resolve(price)
    })
  })
}

module.exports = {
  appDialogWindow: function (content) {
    gui.Window.open('views/appDialog.html', {
      focus: true,
      position: 'center',
      width: 600,
      height: 250,
      frame: false,
      title: content,
      resizable: false
    })
  },
  appDialogWindowSpinner: function (content) {
    gui.Window.open('views/appDialogSpinner.html', {
      focus: true,
      position: 'center',
      width: 250,
      height: 250,
      frame: false,
      title: content,
      resizable: false
    })
  },
  appDialogWindowPortfolio: function (content) {
    gui.Window.open('views/appDialogPortfolio.html', {
      focus: true,
      position: 'center',
      width: 600,
      height: 480,
      frame: false,
      title: content
    })
  },
  appDialogWindowCalc: function (content) {
    gui.Window.open('views/appDialogCalc.html', {
      focus: true,
      position: 'center',
      width: 600,
      height: 320,
      frame: false,
      title: content,
      resizable: false
    })
  },
  appDialogWindowCode: function (content) {
    gui.Window.open('views/appDialogCode.html', {
      focus: true,
      position: 'center',
      width: 600,
      height: 450,
      frame: false,
      title: content
    })
  },
  findCoinGeckoId: function (cryptocurrency) {
    const currency = coins.find(coin => coin.symbol === cryptocurrency.toLowerCase())
    this.appDialogWindow('{"window": "Id from CoinGecko", "title": "Id from CoinGecko", "message": "' + currency.id + '"}')
  },
  findMarketValue: function (cryptocurrency) {
    return new Promise(function (resolve, reject) {
      var price = []
      const currency = coins.find(coin => coin.symbol === (cryptocurrency).toLowerCase())
      requestClient.get({
        options: global.tlsSettings,
        maxAttempts: 3,
        retryDelay: 2000,
        uri: global.corsProxy + 'https://api.coingecko.com/api/v3/simple/price?ids=,' + currency.id + '&vs_currencies=usd%2Cbtc&include_24hr_change=true',
        json: true
      }, function (error, response, body) {
        console.error('error-coingecko:', error)
        price[0] = body[currency.id].usd
        price[1] = body[currency.id].usd_24h_change
        resolve(price)
      })
    })
  },
  binanceTickerDisplay: function (ticker1, ticker2, el, fixed, status) {
    binanceTicker(ticker1 + '' + ticker2).then((price) => {
      if (status === 'test') {
        this.appDialogWindow('{"window": "Value from source/exchange", "title": "Value from source/exchange", "message": "' + Number(price).toFixed(fixed) + '"}')
      } else {
        el.innerHTML = Number(price).toFixed(fixed)
      }
    })
  },
  binanceAllTickers: function () {
    return new Promise(function (resolve, reject) {
      requestClient.get({
        options: global.tlsSettings,
        maxAttempts: 3,
        retryDelay: 2000,
        uri: global.corsProxy + binanceApi + '/api/v3/ticker/price',
        json: true
      }, function (error, response, body) {
        console.error('error:', error)
        var tickerArr = []
        for (var i = 0; i < body.length; i++) {
          tickerArr[i] = body[i].symbol
        }
        resolve(tickerArr)
      })
    })
  },
  kucoinTickerDisplay: function (ticker1, ticker2, el, fixed, status) {
    kucoinTicker(ticker1, ticker2).then((price) => {
      if (status === 'test') {
        this.appDialogWindow('{"window": "Value from source/exchange", "title": "Value from source/exchange", "message": "' + Number(price).toFixed(fixed) + '"}')
      } else {
        el.innerHTML = Number(price).toFixed(fixed)
      }
    })
  },
  kucoinAllTickers: function () {
    return new Promise(function (resolve, reject) {
      requestClient.get({
        options: global.tlsSettings,
        maxAttempts: 3,
        retryDelay: 2000,
        uri: global.corsProxy + kucoinApi + '/api/v1/market/allTickers',
        json: true
      }, function (error, response, body) {
        console.error('error:', error)
        var tickerArr = []
        for (var i = 0; i < body.data.ticker.length; i++) {
          tickerArr[i] = body.data.ticker[i].symbol
        }
        resolve(tickerArr)
      })
    })
  },
  poloniexTickerDisplay: function (ticker1, ticker2, el, fixed, status) {
    poloniexTicker(ticker1, ticker2).then((price) => {
      if (status === 'test') {
        this.appDialogWindow('{"window": "Value from source/exchange", "title": "Value from source/exchange", "message": "' + Number(price).toFixed(fixed) + '"}')
      } else {
        el.innerHTML = Number(price).toFixed(fixed)
      }
    })
  },
  poloniexAllTickers: function () {
    return new Promise(function (resolve, reject) {
      requestClient.get({
        options: global.tlsSettings,
        maxAttempts: 3,
        retryDelay: 2000,
        uri: global.corsProxy + poloniexApi + '/public?command=returnTicker',
        json: true
      }, function (error, response, body) {
        console.error('error:', error)
        var tickerArr = []
        var i = 0
        for (const property in body) {
          i++
          tickerArr[i] = property
        }
        resolve(tickerArr)
      })
    })
  },
  binanceFuturesTickerDisplay: function (ticker1, ticker2, el, fixed, status) {
    binanceFuturesTicker(ticker1 + '' + ticker2).then((price) => {
      if (status === 'test') {
        this.appDialogWindow('{"window": "Value from source/exchange", "title": "Value from source/exchange", "message": "' + Number(price).toFixed(fixed) + '"}')
      } else {
        el.innerHTML = Number(price).toFixed(fixed)
      }
    })
  },
  binanceFuturesAllTickers: function () {
    return new Promise(function (resolve, reject) {
      requestClient.get({
        options: global.tlsSettings,
        maxAttempts: 3,
        retryDelay: 2000,
        uri: global.corsProxy + binanceFuturesApi + '/fapi/v1/ticker/price',
        json: true
      }, function (error, response, body) {
        console.error('error:', error)
        var tickerArr = []
        for (var i = 0; i < body.length; i++) {
          tickerArr[i] = body[i].symbol
        }
        resolve(tickerArr)
      })
    })
  },
  btcMarketsTickerDisplay: function (ticker1, ticker2, el, fixed, status) {
    btcMarketsTicker(ticker1, ticker2).then((price) => {
      if (status === 'test') {
        this.appDialogWindow('{"window": "Value from source/exchange", "title": "Value from source/exchange", "message": "' + Number(price).toFixed(fixed) + '"}')
      } else {
        el.innerHTML = Number(price).toFixed(fixed)
      }
    })
  },
  btcMarketsAllTickers: function () {
    return new Promise(function (resolve, reject) {
      requestClient.get({
        options: global.tlsSettings,
        maxAttempts: 3,
        retryDelay: 2000,
        uri: global.corsProxy + btcMarketsApi + '/v2/market/active',
        json: true
      }, function (error, response, body) {
        console.error('error:', error)
        var tickerArr = []
        for (var i = 0; i < body.markets.length; i++) {
          tickerArr[i] = body.markets[i].instrument + '' + body.markets[i].currency
        }
        resolve(tickerArr)
      })
    })
  },
  bitmexTickerDisplay: function (ticker1, ticker2, el, fixed, status) {
    bitmexTicker(ticker1 + '' + ticker2).then((price) => {
      if (status === 'test') {
        this.appDialogWindow('{"window": "Value from source/exchange", "title": "Value from source/exchange", "message": "' + Number(price).toFixed(fixed) + '"}')
      } else {
        el.innerHTML = Number(price).toFixed(fixed)
      }
    })
  },
  bitmexAllTickers: function () {
    return new Promise(function (resolve, reject) {
      requestClient.get({
        options: global.tlsSettings,
        maxAttempts: 3,
        retryDelay: 2000,
        uri: global.corsProxy + bitmexApi + '/api/v1/instrument',
        json: true
      }, function (error, response, body) {
        console.error('error:', error)
        var tickerArr = []
        for (var i = 0; i < body.length; i++) {
          tickerArr[i] = body[i].symbol
        }
        resolve(tickerArr)
      })
    })
  },
  bitpayTickerDisplay: function (ticker1, ticker2, el, fixed, status) {
    bitpayTicker(ticker1, ticker2).then((price) => {
      if (status === 'test') {
        this.appDialogWindow('{"window": "Value from source/exchange", "title": "Value from source/exchange", "message": "' + Number(price).toFixed(fixed) + '"}')
      } else {
        el.innerHTML = Number(price).toFixed(fixed)
      }
    })
  },
  bitpayAllTickers: function () {
    return new Promise(function (resolve, reject) {
      requestClient.get({
        options: global.tlsSettings,
        maxAttempts: 3,
        retryDelay: 2000,
        uri: global.corsProxy + bitpayApi + '/api/rates/',
        json: true
      }, function (error, response, body) {
        console.error('error:', error)
        var tickerArr = []
        for (var i = 0; i < body.length; i++) {
          tickerArr[i] = body[i].code
        }
        resolve(tickerArr)
      })
    })
  },
  bitfinexTickerDisplay: function (ticker1, ticker2, el, fixed, status) {
    bitfinexTicker(ticker1 + '' + ticker2).then((price) => {
      if (status === 'test') {
        this.appDialogWindow('{"window": "Value from source/exchange", "title": "Value from source/exchange", "message": "' + Number(price).toFixed(fixed) + '"}')
      } else {
        el.innerHTML = Number(price).toFixed(fixed)
      }
    })
  },
  bitfinexAllTickers: function () {
    return new Promise(function (resolve, reject) {
      requestClient.get({
        options: global.tlsSettings,
        maxAttempts: 3,
        retryDelay: 2000,
        uri: global.corsProxy + bitfinexApi + '/v1/symbols',
        json: true
      }, function (error, response, body) {
        console.error('error:', error)
        resolve(body)
      })
    })
  },
  bitstampTickerDisplay: function (ticker1, ticker2, el, fixed, status) {
    bitstampTicker(ticker1, ticker2).then((price) => {
      if (status === 'test') {
        this.appDialogWindow('{"window": "Value from source/exchange", "title": "Value from source/exchange", "message": "' + Number(price).toFixed(fixed) + '"}')
      } else {
        el.innerHTML = Number(price).toFixed(fixed)
      }
    })
  },
  bitstampAllTickers: function () {
    return new Promise(function (resolve, reject) {
      requestClient.get({
        options: global.tlsSettings,
        maxAttempts: 3,
        retryDelay: 2000,
        uri: global.corsProxy + bitstampApi + '/api/v2/trading-pairs-info/',
        json: true
      }, function (error, response, body) {
        console.error('error:', error)
        var tickerArr = []
        for (var i = 0; i < body.length; i++) {
          tickerArr[i] = body[i].url_symbol
        }
        resolve(tickerArr)
      })
    })
  },
  bitsoTickerDisplay: function (ticker1, ticker2, el, fixed, status) {
    bitsoTicker(ticker1, ticker2).then((price) => {
      if (status === 'test') {
        this.appDialogWindow('{"window": "Value from source/exchange", "title": "Value from source/exchange", "message": "' + Number(price).toFixed(fixed) + '"}')
      } else {
        el.innerHTML = Number(price).toFixed(fixed)
      }
    })
  },
  bitsoAllTickers: function () {
    return new Promise(function (resolve, reject) {
      requestClient.get({
        options: global.tlsSettings,
        maxAttempts: 3,
        retryDelay: 2000,
        uri: global.corsProxy + bitsoApi + '/v3/ticker',
        json: true
      }, function (error, response, body) {
        console.error('error:', error)
        var tickerArr = []
        for (var i = 0; i < body.payload.length; i++) {
          tickerArr[i] = body.payload[i].book
        }
        resolve(tickerArr)
      })
    })
  },
  cextradeTickerDisplay: function (ticker1, ticker2, el, fixed, status) {
    cexTicker(ticker1, ticker2).then((price) => {
      if (status === 'test') {
        this.appDialogWindow('{"window": "Value from source/exchange", "title": "Value from source/exchange", "message": "' + Number(price).toFixed(fixed) + '"}')
      } else {
        el.innerHTML = Number(price).toFixed(fixed)
      }
    })
  },
  cexAllTickers: function () {
    return new Promise(function (resolve, reject) {
      requestClient.get({
        options: global.tlsSettings,
        maxAttempts: 3,
        retryDelay: 2000,
        uri: global.corsProxy + cexApi + '/api/currency_limits',
        json: true
      }, function (error, response, body) {
        console.error('error:', error)
        var tickerArr = []
        for (var i = 0; i < body.data.pairs.length; i++) {
          tickerArr[i] = body.data.pairs[i].symbol1 + '' + body.data.pairs[i].symbol2
        }
        resolve(tickerArr)
      })
    })
  },
  coingeckoTickerDisplay: function (ticker1, ticker2, el, fixed, status) {
    coingeckoTicker(ticker1, ticker2).then((price) => {
      if (status === 'test') {
        this.appDialogWindow('{"window": "Value from source/exchange", "title": "Value from source/exchange", "message": "' + Number(price).toFixed(fixed) + '"}')
      } else {
        el.innerHTML = Number(price).toFixed(fixed)
      }
    })
  },
  coingeckoAllTickers: function () {
    return new Promise(function (resolve, reject) {
      requestClient.get({
        options: global.tlsSettings,
        maxAttempts: 3,
        retryDelay: 2000,
        uri: global.corsProxy + coingeckoApi + '/api/v3/coins/list',
        json: true
      }, function (error, response, body) {
        console.error('error:', error)
        var tickerArr = []
        for (var i = 0; i < body.length; i++) {
          tickerArr[i] = body[i].symbol
        }
        resolve(tickerArr)
      })
    })
  },
  coingeckoGetTarget: function (ticker) {
    coingeckoTarget(ticker).then((targets) => {
      this.appDialogWindowCode('{"window": "Supported Targets for the ticker", "title": "Supported Targets for the ticker", "message": "' + targets + '"' + ', "messageTwo": "' + lang.echo('Type') + ' target into (ticker #2) in the form"}')
    })
  },
  coinbaseTickerDisplay: function (ticker1, ticker2, el, fixed, status) {
    coinbaseTicker(ticker1, ticker2).then((price) => {
      if (status === 'test') {
        this.appDialogWindow('{"window": "Value from source/exchange", "title": "Value from source/exchange", "message": "' + Number(price).toFixed(fixed) + '"}')
      } else {
        el.innerHTML = Number(price).toFixed(fixed)
      }
    })
  },
  coinbaseAllTickers: function () {
    return new Promise(function (resolve, reject) {
      requestClient.get({
        options: global.tlsSettings,
        maxAttempts: 3,
        retryDelay: 2000,
        uri: global.corsProxy + coinbaseApi + '/products',
        json: true
      }, function (error, response, body) {
        console.error('error:', error)
        var tickerArr = []
        for (var i = 0; i < body.length; i++) {
          tickerArr[i] = body[i].id
        }
        resolve(tickerArr)
      })
    })
  },
  cryptoCompareTickerDisplay: function (ticker1, ticker2, el, fixed, status) {
    cryptoCompareTicker(ticker1, ticker2).then((price) => {
      if (status === 'test') {
        this.appDialogWindow('{"window": "Value from source/exchange", "title": "Value from source/exchange", "message": "' + Number(price).toFixed(fixed) + '"}')
      } else {
        el.innerHTML = Number(price).toFixed(fixed)
      }
    })
  },
  cryptoCompareAllTickers: function () {
    return new Promise(function (resolve, reject) {
      requestClient.get({
        options: global.tlsSettings,
        maxAttempts: 3,
        retryDelay: 2000,
        uri: global.corsProxy + cryptoCompareApi + '/data/blockchain/list',
        headers: { authorization: cryptoCompareApiKey },
        json: true
      }, function (error, response, body) {
        console.error('error:', error)
        var tickerArr = []
        var i = 0
        for (const property in body.Data) {
          i++
          tickerArr[i] = property
        }
        resolve(tickerArr)
      })
    })
  },
  ftxTickerDisplay: function (ticker1, ticker2, el, fixed, status) {
    ftxTicker(ticker1, ticker2).then((price) => {
      if (status === 'test') {
        this.appDialogWindow('{"window": "Value from source/exchange", "title": "Value from source/exchange", "message": "' + Number(price).toFixed(fixed) + '"}')
      } else {
        el.innerHTML = Number(price).toFixed(fixed)
      }
    })
  },
  ftxAllTickers: function () {
    return new Promise(function (resolve, reject) {
      requestClient.get({
        options: global.tlsSettings,
        maxAttempts: 3,
        retryDelay: 2000,
        uri: global.corsProxy + ftxApi + '/markets',
        json: true
      }, function (error, response, body) {
        console.error('error:', error)
        var tickerArr = []
        for (var i = 0; i < body.result.length; i++) {
          tickerArr[i] = body.result[i].name
        }
        resolve(tickerArr)
      })
    })
  },
  hitBtcTickerDisplay: function (ticker1, ticker2, el, fixed, status) {
    hitBtcTicker(ticker1 + '' + ticker2).then((price) => {
      if (status === 'test') {
        this.appDialogWindow('{"window": "Value from source/exchange", "title": "Value from source/exchange", "message": "' + Number(price).toFixed(fixed) + '"}')
      } else {
        el.innerHTML = Number(price).toFixed(fixed)
      }
    })
  },
  hitBtcAllTickers: function () {
    return new Promise(function (resolve, reject) {
      requestClient.get({
        options: global.tlsSettings,
        maxAttempts: 3,
        retryDelay: 2000,
        uri: global.corsProxy + hitBtcApi + '/api/2/public/ticker/',
        json: true
      }, function (error, response, body) {
        console.error('error:', error)
        var tickerArr = []
        for (var i = 0; i < body.length; i++) {
          tickerArr[i] = body[i].symbol
        }
        resolve(tickerArr)
      })
    })
  },
  huobiBtcTickerDisplay: function (ticker1, ticker2, el, fixed, status) {
    huobiTicker(ticker1 + '' + ticker2).then((price) => {
      if (status === 'test') {
        this.appDialogWindow('{"window": "Value from source/exchange", "title": "Value from source/exchange", "message": "' + Number(price).toFixed(fixed) + '"}')
      } else {
        el.innerHTML = Number(price).toFixed(fixed)
      }
    })
  },
  huobiAllTickers: function () {
    return new Promise(function (resolve, reject) {
      requestClient.get({
        options: global.tlsSettings,
        maxAttempts: 3,
        retryDelay: 2000,
        uri: global.corsProxy + huobiApi + '/v1/common/symbols',
        json: true
      }, function (error, response, body) {
        console.error('error:', error)
        var tickerArr = []
        for (var i = 0; i < body.data.length; i++) {
          tickerArr[i] = body.data[i].symbol
        }
        resolve(tickerArr)
      })
    })
  },
  krakenTickerDisplay: function (ticker1, ticker2, el, fixed, status) {
    krakenTicker(ticker1 + '' + ticker2).then((price) => {
      if (status === 'test') {
        this.appDialogWindow('{"window": "Value from source/exchange", "title": "Value from source/exchange", "message": "' + Number(price).toFixed(fixed) + '"}')
      } else {
        el.innerHTML = Number(price).toFixed(fixed)
      }
    })
  },
  krakeAllTickers: function () {
    return new Promise(function (resolve, reject) {
      requestClient.get({
        options: global.tlsSettings,
        maxAttempts: 3,
        retryDelay: 2000,
        uri: global.corsProxy + krakenApi + '/0/public/AssetPairs',
        json: true
      }, function (error, response, body) {
        console.error('error:', error)
        var tickerArr = []
        var i = 0
        for (const property in body.result) {
          i++
          tickerArr[i] = property
        }
        resolve(tickerArr)
      })
    })
  },
  paymiumTickerDisplay: function (ticker1, el, fixed, status) {
    paymiumTicker(ticker1).then((price) => {
      // btc not realistic price
      if (status === 'test') {
        this.appDialogWindow('{"window": "Value from source/exchange", "title": "Value from source/exchange", "message": "' + Number(price).toFixed(fixed) + '"}')
      } else {
        el.innerHTML = Number(price).toFixed(fixed)
      }
    })
  },
  tdaxTickerDisplay: function (ticker1, ticker2, el, fixed, status) {
    tdaxTicker(ticker1, ticker2).then((price) => {
      if (status === 'test') {
        this.appDialogWindow('{"window": "Value from source/exchange", "title": "Value from source/exchange", "message": "' + Number(price).toFixed(fixed) + '"}')
      } else {
        el.innerHTML = Number(price).toFixed(fixed)
      }
    })
  },
  tdaxAllTickers: function () {
    return new Promise(function (resolve, reject) {
      requestClient.get({
        options: global.tlsSettings,
        maxAttempts: 3,
        retryDelay: 2000,
        uri: global.corsProxy + tdaxApi + '/api/v3/exchangeInfo',
        json: true
      }, function (error, response, body) {
        console.error('error:', error)
        var tickerArr = []
        for (var i = 0; i < body.symbols.length; i++) {
          tickerArr[i] = body.symbols[i].symbol
        }
        resolve(tickerArr)
      })
    })
  },
  vccTickerDisplay: function (ticker1, ticker2, el, fixed, status) {
    vccTicker(ticker1, ticker2).then((price) => {
      if (status === 'test') {
        this.appDialogWindow('{"window": "Value from source/exchange", "title": "Value from source/exchange", "message": "' + Number(price).toFixed(fixed) + '"}')
      } else {
        el.innerHTML = Number(price).toFixed(fixed)
      }
    })
  },
  vccAllTickers: function () {
    return new Promise(function (resolve, reject) {
      requestClient.get({
        options: global.tlsSettings,
        maxAttempts: 3,
        retryDelay: 2000,
        uri: global.corsProxy + vccApi + '/v3/ticker',
        json: true
      }, function (error, response, body) {
        console.error('error:', error)
        var tickerArr = []
        var i = 0
        for (const property in body.data) {
          i++
          tickerArr[i] = property
        }
        resolve(tickerArr)
      })
    })
  },
  okexTickerDisplay: function (ticker1, ticker2, el, fixed, status) {
    okexTicker(ticker1, ticker2).then((price) => {
      if (status === 'test') {
        this.appDialogWindow('{"window": "Value from source/exchange", "title": "Value from source/exchange", "message": "' + Number(price).toFixed(fixed) + '"}')
      } else {
        el.innerHTML = Number(price).toFixed(fixed)
      }
    })
  },
  okexAllTickers: function () {
    return new Promise(function (resolve, reject) {
      requestClient.get({
        options: global.tlsSettings,
        maxAttempts: 3,
        retryDelay: 2000,
        uri: global.corsProxy + okexApi + '/spot/v3/instruments',
        json: true
      }, function (error, response, body) {
        console.error('error:', error)
        var tickerArr = []
        for (var i = 0; i < body.length; i++) {
          tickerArr[i] = body[i].instrument_id
        }
        resolve(tickerArr)
      })
    })
  },
  geminiTickerDisplay: function (ticker1, ticker2, el, fixed, status) {
    geminiTicker(ticker1, ticker2).then((price) => {
      if (status === 'test') {
        this.appDialogWindow('{"window": "Value from source/exchange", "title": "Value from source/exchange", "message": "' + Number(price).toFixed(fixed) + '"}')
      } else {
        el.innerHTML = Number(price).toFixed(fixed)
      }
    })
  },
  geminiAllTickers: function () {
    return new Promise(function (resolve, reject) {
      requestClient.get({
        options: global.tlsSettings,
        maxAttempts: 3,
        retryDelay: 2000,
        uri: global.corsProxy + geminiApi + '/v1/symbols',
        json: true
      }, function (error, response, body) {
        console.error('error:', error)
        resolve(body)
      })
    })
  }
}
