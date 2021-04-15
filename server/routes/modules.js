const cryptoJs = require('crypto-js')
const dJSON = require('dirty-json')
const validator = require('validator')
const moment = require('moment')
const logger = require('../logger')
const models = require('../models/index')
const constants = require('../constants')
const TOKEN_EXPIRATION = require('../constants').TOKEN_EXPIRATION
const _ = require('lodash')

module.exports = {
  checkApplicationToken: function () {
    return function (req, res, next) {
      if (!req.customerSocketIdentifier) {
        const tokenHeader = req.header('Application-Token')
        if (!tokenHeader) {
          logger.failed(
            'Invalid application token - application token missing')
          return res.status(400).send({
            message: 'Invalid application token - application token missing',
            code: '400-000'
          })
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
    return async function (req, res, next) {
      if (!req.customerSocketIdentifier) {
        const tokenHeader = req.header('Authorization')
        if (!global.mySecretSalt) logger.failed(
          '#[H] server error: mySecretSalt is invalid !!!')
        if (!tokenHeader) {
          logger.failed(
            '#[H] Invalid authorization token - authorization token missing'
          )
          return res.status(400).send({
            message: 'Invalid authorization token - authorization token missing',
            code: '400-000'
          })
        } else {
          const tokenContent = getToken(tokenHeader)
          if (!(tokenContent && tokenContent.data && tokenContent.expiration)) {
            logger.failed(
              '#[H] Invalid authorization token - authorization data is incorrect or does not exist'
            )
            return res.status(400).send({
              message: 'Invalid authorization token - authorization data is incorrect or does not exist.',
              code: '400-001'
            })
          }
          const expiration = tokenHasNotExpired(tokenContent.expiration)
          if (!expiration) {
            logger.failed(
              '#[H] Invalid authorization token - authorization token have expired'
            )
            return res.status(400).send({
              message: 'Invalid authorization token - authorization token have expired.',
              code: '400-002'
            })
          }
          const data = tokenContent.data
          if (!(data && dataTokenIsValid(data))) {
            logger.failed(
              '#[H] Invalid authorization token - authorization token have incorrect content'
            )
            return res.status(400).send({
              message: 'Invalid authorization token - authorization token have incorrect content.',
              code: '400-003'
            })
          }
          const userExist = await isExistUserId(data.id)
          if (!userExist) {
            logger.failed(
              '#[H] Invalid authorization token - user which has this token does not exist (most likely it\'s a server error)'
            )
            return res.status(400).send({
              message: 'Invalid authorization token - user which has this token does not exist (most likely it\'s a server error).',
              code: '400-004'
            })
          }
          return next()
        }
      } else {
        return next()
      }
    }
  },
  // authorization function
  signPassword: function (pass) {
    return global.mySecretSalt ? synthesizePrivateKey(pass) : false
  },
  checkPassword: function (pass, hash) {
    const result = global.mySecretSalt ? synthesizePrivateKey(pass) ===
      hash : false
    return result
  },
  signToken: function (data) {
    const expiration = moment().add(TOKEN_EXPIRATION, 'seconds')
    return global.mySecretSalt ? dataEncrypt({
      data, expiration
    }, global.mySecretSalt) : false
  },
  getToken: getToken,
  passwordIsValid: function (pass) {
    return pass ? true : false
  },
  nameIsValid: function (name) {
    return name ? true : false
  },
  dataTokenIsValid: dataTokenIsValid,
  tokenHasNotExpired: tokenHasNotExpired,
  parsableData: parsableData,
  isExistUserId: isExistUserId,
  getAccess: getAccess
}

function dataEncrypt (data, key) {
  if (data && key) {
    return typeof data === 'object' ? cryptoJs.AES.encrypt(JSON.stringify(data),
      key).toString() : cryptoJs.AES.encrypt(String(data), key).toString()
  } else {
    return false
  }
}

function hashDecrypt (hash, key) {
  if (key && hash) {
    try {
      const bytes = cryptoJs.AES.decrypt(hash, key)
      const decryptedData = bytes.toString(cryptoJs.enc.Utf8)
      return decryptedData
    } catch (e) {
      return false
    }
  } else {
    return false
  }
}

function synthesizePrivateKey (key) {
  if (key) {
    return cryptoJs.HmacSHA512(global.mySecretSalt, key).toString()
  } else {
    return false
  }
}

function parsableData (data) {
  try {
    const jsonObj = JSON.parse(data)
    return jsonObj
  } catch (e) {
    return false
  }
}

function getToken (hash) {
  return global.mySecretSalt ? parsableData(hashDecrypt(hash, global.mySecretSalt)) :
    false
}

function tokenHasNotExpired (expiration) {
  const expirationTime = moment(expiration)
  return expirationTime.isAfter()
}

function dataTokenIsValid (data) {
  if (typeof data === 'object' && validator.isUUID(data.id, 4)) {
    return true
  }
  return false
}

function isExistUserId (id) {
  return new Promise(function (resolve, reject) {
    models.users.findOne({
      where: {
        id: id,
        type: constants.OTHER.ENTITY_TYPES.USER_TYPE
      }
    })
      .then(person => person ? resolve(true) : resolve(false))
      .catch(err => resolve(false))
  })
}

function getAccess (id) {
  return new Promise(function (resolve, reject) {
    models.users.findOne({
      include: [
        {
          model: models.roles,
          attributes: ['id', 'position', 'description', 'data'],
          include: [
            {
              model: models.permissions,
              attributes: ['id', 'code', 'description', 'data']
            }
          ]
        },
        {
          model: models.permissions,
          attributes: ['id', 'code', 'description', 'data']
        }
      ],
      where: {id: id}
    }).then(user => {
      logger.print('# get all permissions')
      let arrays = [_.map(user.roles, (item) => {return item.permissions}), user.permissions]
      return resolve(_.flattenDeep(arrays))
    }).catch(e => {
      logger.failed('# error: ', e)
      return reject(e)
    })
  })
}


