const models = require('../../../models')
const modules = require('../../modules')
const logger = require('../../../logger')
const constants = require('../../../constants')
const sockets = require('../../sockets')
const _ = require('lodash')
const uuidv4 = require('uuid/v4')
const sendToMail = require('../../sendToMail')

module.exports = {
  initConnectionByUserToken: initConnectionByUserToken,
  initConnectionByUserName: initConnectionByUserName,
  emailValidation: emailValidation,
  emailCheckValidationKey: emailCheckValidationKey,
}

function initConnectionByUserToken (ws, dataToken, location) {
  if (dataToken.data && modules.dataTokenIsValid(dataToken.data)) {
    if (dataToken.expiration &&
      modules.tokenHasNotExpired(dataToken.expiration)) {
      models.users.findOne({
        where: { id: dataToken.data.id },
      }).then(person => {
        if (person) {
          logger.print('# user found by token')
          ws.myConnectionData = { userId: person.id }
          modules.getAccess(ws.myConnectionData.userId).then(permissions => {
            ws.myConnectionData['permissions'] = permissions
            ws.send(JSON.stringify({
              status: 200,
              message: 'token updated',
              token: modules.signToken(
                { id: person.id, name: person.name }),
              location: location,
              permissions: permissions,
              ip: ws.myClientIp || null,
            }))
          }).catch(e => {
            logger.failed(
              '# can\'t get permissions for this user, error: ',
              e.message)
            ws.send(JSON.stringify({
              status: 500,
              message: 'Can\'t get permissions for this user',
            }))
          })
        } else {
          logger.failed('# user was not found by this token')
          ws.send(JSON.stringify({
            status: 404,
            message: 'User was not found by this token!',
          }))
        }
      }).catch(sockets.sequelizeErrorHandlerWS(ws))
    } else {
      logger.failed('# token has expired, socket connection was close')
      ws.send(
        JSON.stringify({ status: 400, message: 'Token has expired.' }))
      return ws.close()
    }
  } else {
    logger.failed('# invalid socket hash, socket connection was close')
    ws.send(JSON.stringify({ status: 400, message: 'Invalid hash.' }))
    return ws.close()
  }
}

function initConnectionByUserName (ws, location) {
  const queryData = ws.query
  models.users.findOne({
    where: { email: queryData.name },
  }).then(person => {
    if (person) {
      logger.print('# user found by name ---> person is: ', person)
      if (modules.checkPassword(queryData.pass, person.password)) {
        ws.myConnectionData = { userId: person.id }
        const newToken = modules.signToken({ id: person.id, name: person.name })
        modules.getAccess(ws.myConnectionData.userId).then(permissions => {
          ws.myConnectionData['permissions'] = permissions
          let personBody = JSON.parse(JSON.stringify(person))
          delete personBody.id
          delete personBody.password
          delete personBody.createdAt
          delete personBody.updatedAt

          if (person.active) {
            logger.print('person is active: ', personBody, ' , and send a welcome message !!!')
            return ws.send(JSON.stringify({
              status: 200,
              message: 'welcome',
              token: newToken,
              location: location,
              permissions: permissions,
              person: personBody,
              ip: ws.myClientIp || null,
            }))
          } else {
            emailValidation(ws)

            ws.send(JSON.stringify({
              status: 5000,
              message: 'User exist. Before login you need to verify your email. Please go to email and confirm account.'
            }))
            return ws.close()
          }
        }).catch(e => {
          logger.print(
            '# can\'t get permissions for this user, error: ',
            e.message)
          return ws.send(JSON.stringify({
            status: 500,
            message: 'Can\'t get permissions for this user',
          }))
        })
      } else {
        logger.print('# user already exist')
        ws.send(JSON.stringify({ status: 400, message: 'This user already exist' }))
        return ws.close()
      }
    } else {
      logger.print('# create new user')
      models.users.create({
        id: uuidv4(),
        email: queryData.name,
        password: modules.signPassword(queryData.pass),
      }).then(person => {
        logger.print('# user created')
        ws.myConnectionData = { userId: person.id }
        modules.getAccess(ws.myConnectionData.userId).then(permissions => {
          ws.myConnectionData['permissions'] = permissions
          let personBody = JSON.parse(JSON.stringify(person))
          delete personBody.id
          delete personBody.password
          delete personBody.createdAt
          delete personBody.updatedAt

          emailValidation(ws)

          ws.send(JSON.stringify({
            status: 5000,
            message: 'User created. Before login you need to verify your email. Please go to email and confirm account.'
          }))
          return ws.close()
        }).catch(e => {
          logger.print(
            '# can\'t get permissions for this user, error: ',
            e.message)
          return ws.send(JSON.stringify({
            status: 500,
            message: 'Can\'t get permissions for this user',
          }))
        })
      }).catch(sockets.sequelizeErrorHandlerWS(ws))
    }
  }).catch(sockets.sequelizeErrorHandlerWS(ws))
}

function emailValidation (ws, obj, data) {
  models.users.findOne({
    where: {
      id: ws.myConnectionData.userId,
    },
  }).then(user => {
    logger.print('# getting user to validation email was complete')
    if (user.active) {
      return logger.completed('# Your account have activated.')
    }
    sendToMail.validationEmail(user.email, { id: user.id }).then(result => {
      logger.completed('# Verification was sent: ', result)
    }).catch(e => {
      logger.failed('# getting user to validation email was failed, error: ', e)
    })
  }).catch(e => {
    logger.failed('# getting user to validation email was failed, error: ', e.message)
  })
}

function emailCheckValidationKey (ws, obj, data) {
  sendToMail.checkEmailValidationKey(obj.hash, ws.myConnectionData.userId).then(result => {
    return ws.send(JSON.stringify({
      status: 200,
      message: result,
    }))
  }).catch(e => {
    return ws.send(JSON.stringify({
      status: 500,
      message: 'Getting user to validation email was failed.' + e,
    }))
  })
}

