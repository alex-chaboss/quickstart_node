let express = require('express')
let router = express.Router()
let multipart = require('connect-multiparty')
const fs = require('fs')
const path = require('path')

let models = require('../../models/index')
let modules = require('../modules')
let sockets = require('../sockets')
let sequelize = require('sequelize')
const logger = require('../../logger')

const uuidv4 = require('uuid/v4')

const {param, query, body} = require('express-validator/check')
const {sanitizeQuery, sanitizeBody} = require('express-validator/filter')

//
router.ws('/test',
  sockets.init(),
  sockets.checkGlobals(),
  function (ws, req) {
    ws.send(JSON.stringify({
      status: 100,
      message: "Connection was started"
    }))
    ws.on('message', async function (msg) {

    })
  })

module.exports = router
module.exports.root = 'v1/user'

