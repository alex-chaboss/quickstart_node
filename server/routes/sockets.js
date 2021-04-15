const logger = require('../logger')
const modules = require('./modules')
const _ = require('lodash')
const validator = require('validator')
const dJSON = require('dirty-json')
const models = require('../models/index')
const getIP = require('ipware')().get_ip

module.exports = {
  init: function () {
    return function (ws, req, next) {

      ws.query = ws.query ? ws.query : req.query

      if (ws.query && ws.query.name && ws.query.pass) {
        ws.query['Application-Token'] = ws.query['Application-Token'] ?
          ws.query['Application-Token'] : 'empty'
        ws.query['Authorization'] = ws.query['Authorization'] ? ws.query[
          'Authorization'] : 'empty'
      }
      if (req.headers) ws.id = req.headers['sec-websocket-key']

      ws.customerSocketIdentifier = ws.originalUrl ? (ws.originalUrl.indexOf('/.websocket') !== -1) : false

      const url = ws.originalUrl

      if (ws.ws) ws.ws.myCurrentUrl = url
      const dataIp = getIP(req).clientIp.split(':')
      ws.myClientIp = dataIp[dataIp.length - 1]
      if (ws.ws) ws.ws.myClientIp = dataIp[dataIp.length - 1]

      return next()
    }
  },

  checkApplicationToken: function () {
    return function (ws, res, next) {
      if (ws.customerSocketIdentifier) {
        const tokenHeader = ws.query['Application-Token']
        if (!tokenHeader) {
          logger.failed(
            'Invalid application token - application token missing')
          ws.ws.send(JSON.stringify({
            message: 'Invalid application token - application token missing',
            status: 400
          }))
          return ws.ws.close()
        } else {
          // TODO: need to add the token validation here
          return next()
        }
      } else {
        return next()
      }
    }
  },

  checkAuthorizationToken: function () {
    return async function (ws, res, next) {
      if (ws.customerSocketIdentifier) {
        const tokenHeader = ws.query['Authorization']
        if (!tokenHeader) {
          logger.failed(
            '#[W] Invalid authorization token - authorization token missing'
          )
          ws.ws.send(JSON.stringify({
            message: 'Invalid authorization token - authorization token missing',
            status: 400
          }))
          return ws.ws.close()
        } else {
          if (ws.originalUrl.indexOf('/v1/entities/ws/auth') === -1) {
            const tokenContent = modules.getToken(tokenHeader)
            if (!(tokenContent && tokenContent.data && tokenContent.expiration)) {
              logger.failed(
                '#[W] Invalid authorization token - authorization data is incorrect or does not exist'
              )
              ws.ws.send(JSON.stringify({
                message: 'Invalid authorization token - authorization data is incorrect or does not exist.',
                status: 400,
                code: '400-001'
              }))
              return ws.ws.close()
            }
            const expiration = modules.tokenHasNotExpired(tokenContent.expiration)
            if (!expiration) {
              logger.failed(
                '#[W] Invalid authorization token - authorization token have expired'
              )
              ws.ws.send(JSON.stringify({
                message: 'Invalid authorization token - authorization token have expired.',
                status: 400,
                code: '400-002'
              }))
              return ws.ws.close()
            }
            const data = tokenContent.data
            if (!(data && modules.dataTokenIsValid(data))) {
              logger.failed(
                '#[W] Invalid authorization token - authorization token have incorrect content'
              )
              ws.ws.send(JSON.stringify({
                message: 'Invalid authorization token - authorization token have incorrect content.',
                status: 400,
                code: '400-003'
              }))
              return ws.ws.close()
            }
            const userExist = await modules.isExistUserId(data.id)
            if (!userExist) {
              logger.failed(
                '#[W] Invalid authorization token - user which has this token does not exist (most likely it\'s a server error)'
              )
              ws.ws.send(JSON.stringify({
                message: 'Invalid authorization token - user which has this token does not exist (most likely it\'s a server error).',
                status: 400,
                code: '400-004'
              }))
              return ws.ws.close()
            }
          }
          return next()
        }
      } else {
        return next()
      }
    }
  },

  checkGlobals: function () {
    return function (ws, res, next) {
      if (global.mySecretSalt) return next()
      else {
        logger.failed('# global variables was not set!!!')
        ws.send(JSON.stringify({
          message: 'Some server error',
          status: 500
        }))
        return ws.close()
      }
    }
  },

  sequelizeErrorHandlerWS: function (ws) {
    return function (err) {
      logger.failed("# sequelize error handler on ws got error: ", err.message)
      ws.send(JSON.stringify({
        message: err.message || 'Internal error',
        code: err.code || 500
      }))
    }
  },

  sendToAll: function (req, data) {
    sendToAll(req, data)
  },

  isUUID: function (uuid) {
    return validator.isUUID(uuid, 4)
  }
}

function sendToAll (req, data) {
  const currentUrl = String(req.url).split('.websocket')[0]
  logger.print('sendToAll url: ', currentUrl)
  global.ewsServer.getWss().clients.forEach(function each (client) {
    const clientUrl = String(client.myCurrentUrl).split('.websocket')[0]
    logger.print('clientUrl: ', clientUrl)
    if (clientUrl.indexOf(currentUrl) !== -1) {
      typeof data === 'string' ? client.send(data) : client.send(JSON.stringify(
        data))
    }
  })
}

function headerImitator (ws) {
  return function (key) {
    return ws.query[key]
  }
}
