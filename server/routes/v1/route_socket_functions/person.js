const models = require('../../../models')
const modules = require('../../modules')
const logger = require('../../../logger')
const constants = require('../../../constants')
const sockets = require('../../sockets')
const _ = require('lodash')
const uuidv4 = require('uuid/v4')

module.exports = {
  checkNickname: checkNickname,
  setNickname: setNickname,
  setSocialNetworks: setSocialNetworks,
  getSocialNetworks: getSocialNetworks,
  getAllUserData: getAllUserData,
  getUserDataById: getUserDataById,
  getUserDataByEmail: getUserDataByEmail,
}

function checkNickname (ws, obj, data) {
  models.users.findOne({
    where: {nickname: obj.data.nickname}
  })
    .then(user => {
      if (!user)
        return ws.send(JSON.stringify({
          status: 200,
          result: true,
          message: 'This nickname can be used'
        }))
      return ws.send(JSON.stringify({
        status: 200,
        result: false,
        message: 'This nickname already exist'
      }))
    })
    .catch(sockets.sequelizeErrorHandlerWS(ws))
}

function setNickname (ws, obj, data) {
  models.users.update({
      nickname: obj.data.nickname
    },
    {
      where: {id: ws.myConnectionData.userId}
    })
    .then(user => {
      if (!user[0])
        return ws.send(JSON.stringify({
          status: 404,
          message: 'Token contain the user id that does not exist in database'
        }))
      return ws.send(JSON.stringify({
        status: 200,
        message: 'Updated'
      }))
    })
    .catch(sockets.sequelizeErrorHandlerWS(ws))
}

function setSocialNetworks (ws, obj, data) {
  models.users.update({
      data: obj.data.data
    },
    {
      where: {id: ws.myConnectionData.userId}
    })
    .then(user => {
      if (!user[0])
        return ws.send(JSON.stringify({
          status: 404,
          message: 'Token contain the user id that does not exist in database'
        }))
      return ws.send(JSON.stringify({
        status: 200,
        message: 'Updated'
      }))
    })
    .catch(sockets.sequelizeErrorHandlerWS(ws))
}

function getSocialNetworks (ws, obj, data) {
  models.users.findOne({
    where: {id: ws.myConnectionData.userId}
  })
    .then(user => {
      if (!user)
        return ws.send(JSON.stringify({
          status: 404,
          message: 'Token contain the user id that does not exist in database'
        }))
      return ws.send(JSON.stringify({
        status: 200,
        result: user.data,
        message: 'Got social networks'
      }))
    })
    .catch(sockets.sequelizeErrorHandlerWS(ws))
}

function getAllUserData (ws, obj, data) {
  models.users.findOne({
    attributes: ['id', 'email', 'nickname', 'active', 'avatar', 'data'],
    where: {id: ws.myConnectionData.userId}
  })
    .then(user => {
      if (!user)
        return ws.send(JSON.stringify({
          status: 404,
          message: 'Token contain the user id that does not exist in database'
        }))
      return ws.send(JSON.stringify({
        status: 200,
        result: user,
        message: 'Got all user data'
      }))
    })
    .catch(sockets.sequelizeErrorHandlerWS(ws))
}

function getUserDataById (ws, obj, data) {
  models.users.findOne({
    where: {id: obj.data.userId},
    attributes: ['id', 'email', 'nickname', 'active', 'avatar', 'data']
  })
    .then(user => {
      if (!user)
        return ws.send(JSON.stringify({
          status: 404,
          message: 'Token contain the user id that does not exist in database'
        }))
      return ws.send(JSON.stringify({
        status: 200,
        result: user,
        message: 'Got all user data'
      }))
    })
    .catch(sockets.sequelizeErrorHandlerWS(ws))
}

function getUserDataByEmail (ws, obj, data) {
  models.users.findOne({
    where: {email: obj.data.email},
    attributes: ['id', 'email', 'nickname', 'active', 'avatar', 'data']
  })
    .then(user => {
      if (!user)
        return ws.send(JSON.stringify({
          status: 404,
          message: 'This user don\'t found'
        }))
      return ws.send(JSON.stringify({
        status: 200,
        result: user,
        message: 'Got all user data'
      }))
    })
    .catch(sockets.sequelizeErrorHandlerWS(ws))
}