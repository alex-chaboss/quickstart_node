const express = require('express')
const router = express.Router()
require('express-ws')(router)
const uuidv4 = require('uuid/v4')
const models = require('../../models')
const modules = require('../modules')
const sockets = require('../sockets')
const logger = require('../../logger')
const constants = require('../../constants')
const _ = require('lodash')

//-----  Import and init main router
const rulesAndPermissions = require('./route_socket_functions/rulesAndPermissions')
const initAuth = require('./route_socket_functions/initAuth')
const personData = require('./route_socket_functions/person')

const _router = {
  roles: rulesAndPermissions,
  auth: initAuth,
  person: personData,
}
//-----

router.ws('/auth',
  sockets.init(),
  sockets.checkGlobals(),
  function (ws, req) {
    logger.print('init')
    if (!ws.query) {
      ws.send(
        JSON.stringify({ status: 400, message: 'query wasn\'t designate' }))
      return ws.close()
    }

    logger.print('connected to authorization server')

    const location = 'UA'  // geoip2.lookupSync(ws.myClientIp || '127.0.0.1')

    logger.print('location: ', location)

    if (modules.nameIsValid(ws.query.name) &&
      modules.passwordIsValid(ws.query.pass)) {
      initAuth.initConnectionByUserName(ws, location)
    } else if (ws.query['Authorization']) {
      const token = ws.query['Authorization']
      const dataToken = modules.getToken(token)
      initAuth.initConnectionByUserToken(ws, dataToken, location)
    } else {
      logger.print('# invalid query, socket connection was close')
      ws.send(JSON.stringify({ status: 400, message: 'Invalid query.' }))
      return ws.close()
    }

    ws.send(JSON.stringify({ status: 200, message: 'connected to authorization server' }))

    // communication side
    ws.on('message', async function (msg) {
      const msgObj = String(typeof msg) === 'string'
        ? modules.parsableData(msg)
        : msg
      logger.print('typeof msgObj : ', typeof msgObj, ' , msgObj.token: ',
        msgObj.token)

      if (!(msg && msgObj && msgObj.token)) {
        logger.failed('# invalid request, socket connection was close')
        ws.send(JSON.stringify({ status: 400, message: 'Invalid query.' }))
        return ws.close()
      }
      const token = msgObj.token
      const dataToken = modules.getToken(token)
      if (!(dataToken.data && modules.dataTokenIsValid(dataToken.data))) {
        logger.failed('# invalid socket hash, socket connection was close')
        ws.send(JSON.stringify({ status: 400, message: 'Invalid hash.' }))
        return ws.close()
      }
      if (!(dataToken.expiration &&
        modules.tokenHasNotExpired(dataToken.expiration))) {
        logger.failed('# token has expired, socket connection was close')
        ws.send(JSON.stringify({ status: 400, message: 'Token has expired.' }))
        return ws.close()
      }
      if (!(dataToken.data.id === ws.myConnectionData.userId)) {
        logger.failed('# it\'s token not for this user')
        ws.send(JSON.stringify(
          { status: 400, message: 'It\'s token not for this user.' }))
        return ws.close()
      }
      models.users.findOne({
        where: { id: dataToken.data.id },
      }).then(person => {
        if (!person) {
          logger.failed('# user was not found by this token')
          return ws.send(JSON.stringify(
            { status: 404, message: 'User was not found by this token!' }))
        }
        logger.print('# user found by ID: ', person.id)
        const newToken = modules.signToken({ id: person.id })

        const keyData = msgObj.key.split(':')

        const keyError = () => {
          logger.warning('Unfounded key : ', msgObj.key)
          return ws.send(JSON.stringify({
            status: 200,
            message: 'token updated',
            token: newToken,
            location: location,
            ip: ws.myClientIp || null,
          }))
        }
        //TODO: it is a hard "switch-case" realization and description of it should be added to readme !!!
        _router[keyData[0]] && _router[keyData[0]][keyData[1]]
          ? _router[keyData[0]][keyData[1]](ws, msgObj, { user: person, location: location, token: newToken })
          : keyError()

      }).catch(sockets.sequelizeErrorHandlerWS(ws))
    })
  })

module.exports = router

