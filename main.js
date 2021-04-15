'use strict'

const path = require('path');
const envres = require('dotenv');
const envconfres = envres.config({path: path.resolve(process.cwd(), '.env')});
if (envconfres.error) {
  throw envconfres.error
} else {
  process.env = {...process.env, ...envconfres.parsed}
}

const env = process.env.NODE_ENV || 'development'
const express = require('express')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const correlator = require('express-correlation-id')
const cors = require('cors')
const models = require('./server/models')
const router = express.Router()
const WS = require('express-ws')
const expressWs = WS(express())
const app = expressWs.app
const forceSSL = require('express-force-ssl')
const fs = require('fs')
const https = require('https')
const http = require('http').Server(app)
const modules = require('./server/routes/modules')
const sockets = require('./server/routes/sockets')
const logger = require('./server/logger')
const helpers = require('./routes/v1/helpers/initialization')

const ewsServer = expressWs
global.ewsServer = ewsServer

logger.print("path.resolve(process.cwd(), '.env') : ", path.resolve(process.cwd(), '.env'))

let ssl_options = {}
try {
  ssl_options = {
    key: fs.readFileSync('../../../../../../etc/nginx/ssl/icolanding/ico.key'),
    cert: fs.readFileSync('../../../../../../etc/nginx/ssl/icolanding/zipcx_io.crt'),
    // ca: fs.readFileSync('./keys/intermediate.crt')
  }
} catch (e) {
  logger.failed('# error on init ssl_options: ', e.message)
}

const secureServer = https.createServer(ssl_options, app)

global.mySecretSalt = undefined

// add correlation id to response and log messages and trace the start of request (SS: has to be the first app.use())
app.use(correlator())
app.use(sockets.init(true))
app.use(
  function (req, res, next) {
    let correlationId = req.correlationId()
    // let token = req.header('Application-Token')
    logger.print('correlationId', correlationId)
    res.set('X-Correlation-ID', correlationId)
    if (req.originalUrl.indexOf('/.websocket') === -1) {
      logger.print('Executing route: ' + req.method + ' "' + req.originalUrl + '"')
    }
    return next()
  })
app.use(sockets.checkAuthorizationToken())
// app.use(sockets.checkApplicationToken())
app.use(modules.checkAuthorizationToken())
// app.use(modules.checkApplicationToken())

app.use(cors({origin:"*"}))
app.use(bodyParser.json())

// routing imports
const version = require('./server/routes/version')
const entities = require('./server/routes/v1/entities')
const auth = require('./server/routes/v1/auth')
const forgotPassword = require('./server/routes/v1/forgotPassword')
const nonAuthorized = require('./server/routes/v1/nonAuthorized')

// api v1
app.use('/version', version)
app.use('/v1', entities)
app.ws('/v1', entities)
app.use('/v1', auth)
app.ws('/v1', auth)
app.use('/v1', forgotPassword)
app.use('/v1', nonAuthorized)

// force SSL
app.use(forceSSL)

// error handlers
app.use(function (req, res, next) {
  logger.failed('not found: ' + req.url)
  if (req.originalUrl.indexOf('/.websocket') === -1) {
    return res.status(404).send({message: 'not found: ' + req.url})
  } else {
    return res.ws.send(JSON.stringify({message: 'not found: ' + req.url, status: 400}))
  }
})

app.use(function (err, req, res, next) {
  if (res.headersSent) {
    return next(err)
  }
  if (err.name === 'UnauthorizedError') {
    logger.warning(err.message)
  } else {
    logger.failed(err.message, err)
  }
  return res.status(err.status || 500).send({message: err.message || 'Internal error', code: err.code || 'unknown'})
})

// synchronize all models
models.sequelize.sync().then(() => {
  let serv;
  helpers.defaultPermissions()
    .then(res => {
      helpers.defaultRoles(res)
    })
    .catch(e => {})
  helpers.defaultCategories()

  ssl_options.key && ssl_options.cert
    ? (serv = secureServer.listen(parseInt(process.env.PORT))
    && logger.completed('Starting https...'))
    : (serv = app.listen(parseInt(process.env.PORT))
    && logger.completed('Starting http...'))

  logger.completed('Application started - listening on port ' + process.env.PORT + '...')
}).catch(err => {
  logger.failed("My sequelize ERROR: ", err)
})

// salt of authorization
let keypress = require('keypress')

keypress(process.stdin)

let complete = false
process.stdin.on('data', function (ch) {

  if (Number(ch.join('')) === 27 || Number(ch.join('')) === 3) {
    process.exit()
  }

  if (!complete) {
    try {
      const phrase = String(ch)
      global.mySecretSalt = phrase
      complete = true
      logger.completed('Complete!')
    } catch (e) {
      logger.failed('Wrong format, please try again.')
    }
  }
})
