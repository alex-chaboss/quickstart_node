const express = require('express')
const router = express.Router()
require('express-ws')(router)
const uuidv4 = require('uuid/v4')
const models = require('../../models')
const modules = require('../modules')
const sockets = require('../sockets')
const logger = require('../../logger')
const constants = require('../../constants')
const initAuth = require('./route_socket_functions/initAuth')


router.post('/verify',
  function (req, res, next) {
    if(!req.body || !req.body.hash) return res.send({message: 'This request should contain the HASH for verification!'})

    res.myConnectionData = {}

    initAuth.emailCheckValidationKey(res, {hash: req.body.hash})
  })

module.exports = router
