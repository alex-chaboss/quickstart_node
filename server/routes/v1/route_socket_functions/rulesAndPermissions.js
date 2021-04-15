const models = require('../../../models')
const modules = require('../../modules')
const logger = require('../../../logger')
const constants = require('../../../constants')
const sockets = require('../../sockets')
const _ = require('lodash')

module.exports = {
  createRole: createRole,
  createPermission: createPermission,
  addRolesToUser: addRolesToUser,
  addPermissionsToUser: addPermissionsToUser,
  addPermissionsToRole: addPermissionsToRole,
  getRoles: getRoles,
  getUsers: getUsers,
  getPermissions: getPermissions,
  getUserPermissionsById: getUserPermissionsById,
  getUserPermissionsByEmail: getUserPermissionsByEmail,
  getUserRolesByEmail: getUserRolesByEmail,
  getUserRolesById: getUserRolesById,
  getRolePermissions: getRolePermissions,
  removeRolesFromUser: removeRolesFromUser,
  removePermissionsFromUser: removePermissionsFromUser,
  removePermissionsFromRole: removePermissionsFromRole
}

// function to roles and permissions manipulation

function createRole (ws, obj, data) {
  if (!permissionsExistByCode(ws, constants.OTHER.PERMISSIONS.CREATE_ROLE)) return accessDenied(ws, obj, data)
  if (!obj.role) {
    logger.failed('# role data was not defined in the request')
    return ws.send(JSON.stringify({
      status: 400,
      message: 'Role data was not defined in the request.',
      token: data.token,
      location: data.location,
      ip: ws.myClientIp || null
    }))
  }

  models.roles.create({
    position: obj.role.position,
    description: obj.role.description
  })
    .then(role => {
      logger.print('# role was added to DB')
      ws.send(JSON.stringify({
        status: 201,
        message: 'Created role',
        token: data.token,
        role: role,
        location: data.location,
        ip: ws.myClientIp || null
      }))
    })
    .catch(e => {
      logger.failed('# role was not added to DB, error: ', e.message)
      ws.send(JSON.stringify({
        status: 500,
        message: 'Role was not added to DB.',
        token: data.token,
        location: data.location,
        ip: ws.myClientIp || null
      }))
    })
}

function createPermission (ws, obj, data) {
  if (!permissionsExistByCode(ws, constants.OTHER.PERMISSIONS.CREATE_PERMISSIONS)) return accessDenied(ws, obj, data)
  if (!obj.permission) {
    logger.failed('# permission data was not defined in the request')
    return ws.send(JSON.stringify({
      status: 400,
      message: 'Permission data was not defined in the request.',
      token: data.token,
      location: data.location,
      ip: ws.myClientIp || null
    }))
  }

  models.permissions.create({
    code: obj.permission.code,
    description: obj.permission.description
  })
    .then(permission => {
      logger.print('# permission was added to permission')
      ws.send(JSON.stringify({
        status: 201,
        message: 'Created permission',
        token: data.token,
        permission: permission,
        location: data.location,
        ip: ws.myClientIp || null
      }))
    })
    .catch(e => {
      logger.failed('# permission was not added to permission, error: ', e.message)
      ws.send(JSON.stringify({
        status: 500,
        message: 'Permission was not added to DB.',
        token: data.token,
        location: data.location,
        ip: ws.myClientIp || null
      }))
    })
}

function addRolesToUser (ws, obj, data) {
  if (!permissionsExistByCode(ws, constants.OTHER.PERMISSIONS.ADD_ROLES)) return accessDenied(ws, obj, data)
  if (!(obj.data && typeof obj.data === typeof [])) {
    logger.failed('# data object was not defined in the request')
    return ws.send(JSON.stringify({
      status: 400,
      message: 'Data object was not defined in the request.',
      token: data.token,
      location: data.location,
      ip: ws.myClientIp || null
    }))
  }

  models.users_roles.bulkCreate(obj.data)
    .then(connection => {
      logger.print('# role "' + obj.data.roleId + '" was added to user "' + obj.data.userId + '"')
      ws.send(JSON.stringify({
        status: 201,
        message: 'Role "' + obj.data.roleId + '" was added to user "' + obj.data.userId + '"',
        token: data.token,
        connection: connection,
        location: data.location,
        ip: ws.myClientIp || null
      }))
    })
    .catch(e => {
      logger.failed('# role was not added to user, error: ', e.message)
      ws.send(JSON.stringify({
        status: 500,
        message: 'Role was not added to user.',
        token: data.token,
        location: data.location,
        ip: ws.myClientIp || null
      }))
    })
}

function addPermissionsToUser (ws, obj, data) {
  if (!permissionsExistByCode(ws, constants.OTHER.PERMISSIONS.ADD_PERMISSIONS_TO_USER)) return accessDenied(ws, obj, data)
  if (!(obj.data && typeof obj.data === typeof [])) {
    logger.failed('# data object was not defined in the request')
    return ws.send(JSON.stringify({
      status: 400,
      message: 'Data object was not defined in the request.',
      token: data.token,
      location: data.location,
      ip: ws.myClientIp || null
    }))
  }

  models.users_permissions.bulkCreate(obj.data)
    .then(connection => {
      logger.print('# permission "' + obj.data.permissionId + '" was added to user "' + obj.data.userId + '"')
      ws.send(JSON.stringify({
        status: 201,
        message: 'Permission "' + obj.data.permissionId + '" was added to user "' + obj.data.userId + '"',
        token: data.token,
        connection: connection,
        location: data.location,
        ip: ws.myClientIp || null
      }))
    })
    .catch(e => {
      logger.failed('# permission was not added to user, error: ', e.message)
      ws.send(JSON.stringify({
        status: 500,
        message: 'Permission was not added to user.',
        token: data.token,
        location: data.location,
        ip: ws.myClientIp || null
      }))
    })
}

function addPermissionsToRole (ws, obj, data) {
  if (!permissionsExistByCode(ws, constants.OTHER.PERMISSIONS.ADD_PERMISSIONS_TO_ROLE)) return accessDenied(ws, obj, data)
  if (!(obj.data && typeof obj.data === typeof [])) {
    logger.failed('# data object was not defined in the request')
    return ws.send(JSON.stringify({
      status: 400,
      message: 'Data object was not defined in the request.',
      token: data.token,
      location: data.location,
      ip: ws.myClientIp || null
    }))
  }

  models.roles_permissions.bulkCreate(obj.data)
    .then(connection => {
      logger.print('# permissions was added to role by data: ', obj.data)
      ws.send(JSON.stringify({
        status: 201,
        message: 'Permissions was added to role by data',
        token: data.token,
        connection: connection,
        location: data.location,
        ip: ws.myClientIp || null
      }))
    })
    .catch(e => {
      logger.failed('# permission was not added to role, error: ', e.message)
      ws.send(JSON.stringify({
        status: 500,
        message: 'Permission was not added to role.',
        token: data.token,
        location: data.location,
        ip: ws.myClientIp || null
      }))
    })
}

function getRoles (ws, obj, data) {
  if (!permissionsExistByCode(ws, constants.OTHER.PERMISSIONS.GET_ROLES)) return accessDenied(ws, obj, data)
  models.roles.findAll()
    .then(roles => {
      logger.print('# getting roles was complete')
      ws.send(JSON.stringify({
        status: 200,
        message: 'Getting roles was complete.',
        token: data.token,
        roles: roles,
        location: data.location,
        ip: ws.myClientIp || null
      }))
    })
    .catch(e => {
      logger.failed('# getting roles was failed, error: ', e.message)
      ws.send(JSON.stringify({
        status: 500,
        message: 'Getting roles was failed.',
        token: data.token,
        location: data.location,
        ip: ws.myClientIp || null
      }))
    })
}

function getUsers (ws, obj, data) {
  // if (!permissionsExistByCode(ws, constants.OTHER.PERMISSIONS.GET_USERS)) return accessDenied(ws, obj, data)
  models.users.findAll()
    .then(users => {
      logger.print('# getting users was complete')
      for (let i = 0; i < users.length; i++) {
        users[i].password = null
      }
      ws.send(JSON.stringify({
        status: 200,
        message: 'Getting users was complete.',
        token: data.token,
        users: users,
        location: data.location,
        ip: ws.myClientIp || null
      }))
    })
    .catch(e => {
      logger.failed('# getting users was failed, error: ', e.message)
      ws.send(JSON.stringify({
        status: 500,
        message: 'Getting users was failed.',
        token: data.token,
        location: data.location,
        ip: ws.myClientIp || null
      }))
    })
}

function getPermissions (ws, obj, data) {
  if (!permissionsExistByCode(ws, constants.OTHER.PERMISSIONS.GET_PERMISSIONS)) return accessDenied(ws, obj, data)
  models.permissions.findAll()
    .then(permissions => {
      logger.print('# getting permissions was complete')
      ws.send(JSON.stringify({
        status: 200,
        message: 'Getting permissions was complete.',
        token: data.token,
        permissions: permissions,
        location: data.location,
        ip: ws.myClientIp || null
      }))
    })
    .catch(e => {
      logger.failed('# getting permissions was failed, error: ', e.message)
      ws.send(JSON.stringify({
        status: 500,
        message: 'Getting permissions was failed.',
        token: data.token,
        location: data.location,
        ip: ws.myClientIp || null
      }))
    })
}

function getUserPermissionsById (ws, obj, data) {
  if (!permissionsExistByCode(ws, constants.OTHER.PERMISSIONS.GET_PERMISSIONS_OF_USER)) return accessDenied(ws, obj, data)
  if (!(obj.data && obj.data.userId)) {
    logger.failed('# user id was not set')
    return ws.send(JSON.stringify({
      status: 400,
      message: 'User id was not set.',
      token: data.token,
      location: data.location,
      ip: ws.myClientIp || null
    }))
  }

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
    where: {id: obj.data.userId}
  }).then(user => {
    let arrays = [_.map(user.roles, (item) => {return item.permissions}), user.permissions]
    let userPermissions = _.flattenDeep(arrays)
    logger.print('# getting permissions for user was complete')
    ws.send(JSON.stringify({
      status: 200,
      message: 'Getting permissions for user was complete.',
      token: data.token,
      permissions: userPermissions,
      location: data.location,
      ip: ws.myClientIp || null
    }))
  }).catch(e => {
    logger.failed('# getting permissions for user was failed, error: ', e.message)
    ws.send(JSON.stringify({
      status: 500,
      message: 'Getting permissions for user was failed.',
      token: data.token,
      location: data.location,
      ip: ws.myClientIp || null
    }))
  })
}

function getUserPermissionsByEmail (ws, obj, data) {
  if (!permissionsExistByCode(ws, constants.OTHER.PERMISSIONS.GET_PERMISSIONS_OF_USER)) return accessDenied(ws, obj, data)
  if (!(obj.data && obj.data.email)) {
    logger.failed('# user email was not set')
    return ws.send(JSON.stringify({
      status: 400,
      message: 'User email was not set.',
      token: data.token,
      location: data.location,
      ip: ws.myClientIp || null
    }))
  }

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
    where: {email: obj.data.email}
  }).then(user => {
    let arrays = [_.map(user.roles, (item) => {return item.permissions}), user.permissions]
    let userPermissions = _.flattenDeep(arrays)
    logger.print('# getting permissions for user was complete')
    ws.send(JSON.stringify({
      status: 200,
      message: 'Getting permissions for user was complete.',
      token: data.token,
      permissions: userPermissions,
      location: data.location,
      ip: ws.myClientIp || null
    }))
  }).catch(e => {
    logger.failed('# getting permissions for user was failed, error: ', e.message)
    ws.send(JSON.stringify({
      status: 500,
      message: 'Getting permissions for user was failed.',
      token: data.token,
      location: data.location,
      ip: ws.myClientIp || null
    }))
  })
}

function getUserRolesByEmail (ws, obj, data) {
  if (!permissionsExistByCode(ws, constants.OTHER.PERMISSIONS.GET_PERMISSIONS_OF_USER)) return accessDenied(ws, obj, data)
  if (!(obj.data && obj.data.email)) {
    logger.failed('# user email was not set')
    return ws.send(JSON.stringify({
      status: 400,
      message: 'User email was not set.',
      token: data.token,
      location: data.location,
      ip: ws.myClientIp || null
    }))
  }

  models.users.findOne({
    include: [
      {
        model: models.roles,
        attributes: ['id', 'position', 'description', 'data']
      }
    ],
    where: {email: obj.data.email}
  }).then(user => {
    logger.print('# getting roles for user was complete')
    ws.send(JSON.stringify({
      status: 200,
      message: 'Getting roles for user was complete.',
      token: data.token,
      permissions: user.roles,
      location: data.location,
      ip: ws.myClientIp || null
    }))
  }).catch(e => {
    logger.failed('# getting roles for user was failed, error: ', e.message)
    ws.send(JSON.stringify({
      status: 500,
      message: 'Getting roles for user was failed.',
      token: data.token,
      location: data.location,
      ip: ws.myClientIp || null
    }))
  })
}

function getUserRolesById (ws, obj, data) {
  if (!permissionsExistByCode(ws, constants.OTHER.PERMISSIONS.GET_PERMISSIONS_OF_USER)) return accessDenied(ws, obj, data)
  if (!(obj.data && obj.data.userId)) {
    logger.failed('# user id was not set')
    return ws.send(JSON.stringify({
      status: 400,
      message: 'User id was not set.',
      token: data.token,
      location: data.location,
      ip: ws.myClientIp || null
    }))
  }

  models.users.findOne({
    include: [
      {
        model: models.roles,
        attributes: ['id', 'position', 'description', 'data']
      }
    ],
    where: {id: obj.data.userId}
  }).then(user => {
    logger.print('# getting roles for user was complete')
    ws.send(JSON.stringify({
      status: 200,
      message: 'Getting roles for user was complete.',
      token: data.token,
      roles: user.roles,
      location: data.location,
      ip: ws.myClientIp || null
    }))
  }).catch(e => {
    logger.failed('# getting roles for user was failed, error: ', e)
    ws.send(JSON.stringify({
      status: 500,
      message: 'Getting roles for user was failed.',
      token: data.token,
      location: data.location,
      ip: ws.myClientIp || null
    }))
  })
}

function getRolePermissions (ws, obj, data) {
  if (!permissionsExistByCode(ws, constants.OTHER.PERMISSIONS.GET_PERMISSIONS_OF_USER)) return accessDenied(ws, obj, data)
  if (!(obj.data && obj.data.roleId)) {
    logger.failed('# role id was not set')
    return ws.send(JSON.stringify({
      status: 400,
      message: 'Role id was not set.',
      token: data.token,
      location: data.location,
      ip: ws.myClientIp || null
    }))
  }

  models.roles.findOne({
    include: [
      {
        model: models.permissions,
        attributes: ['id', 'code', 'description', 'data']
      }
    ],
    where: {id: obj.data.roleId}
  }).then(user => {
    logger.print('# getting permissions for role was complete')
    ws.send(JSON.stringify({
      status: 200,
      message: 'Getting permissions for role was complete.',
      token: data.token,
      permissions: user.permissions,
      location: data.location,
      ip: ws.myClientIp || null
    }))
  }).catch(e => {
    logger.failed('# getting permissions for role was failed, error: ', e.message)
    ws.send(JSON.stringify({
      status: 500,
      message: 'Getting permissions for role was failed.',
      token: data.token,
      location: data.location,
      ip: ws.myClientIp || null
    }))
  })
}

function removeRolesFromUser (ws, obj, data) {
  if (!permissionsExistByCode(ws, constants.OTHER.PERMISSIONS.ADD_ROLES)) return accessDenied(ws, obj, data)
  models.users_roles.destroy({
    where: {
      userId: obj.data.userId,
      roleId: obj.data.roleIds
    }
  }).then(status => {
    logger.print('# removed roles from user was complete')
    ws.send(JSON.stringify({
      status: 200,
      message: 'Removed roles from user was complete.',
      token: data.token,
      location: data.location,
      ip: ws.myClientIp || null
    }))
  }).catch(e => {
    logger.failed('# removed roles from user was failed, error: ', e.message)
    ws.send(JSON.stringify({
      status: 500,
      message: 'Removed roles from user was failed.',
      token: data.token,
      location: data.location,
      ip: ws.myClientIp || null
    }))
  })
}

function removePermissionsFromUser (ws, obj, data) {
  if (!permissionsExistByCode(ws, constants.OTHER.PERMISSIONS.ADD_PERMISSIONS_TO_USER)) return accessDenied(ws, obj, data)
  models.users_permissions.destroy({
    where: {
      userId: obj.data.userId,
      permissionId: obj.data.permissionsIds
    }
  }).then(status => {
    logger.print('# removed permissions from user was complete')
    ws.send(JSON.stringify({
      status: 200,
      message: 'Removed permissions from user was complete.',
      token: data.token,
      location: data.location,
      ip: ws.myClientIp || null
    }))
  }).catch(e => {
    logger.failed('# removed permissions from user was failed, error: ', e.message)
    ws.send(JSON.stringify({
      status: 500,
      message: 'Removed permissions from user was failed.',
      token: data.token,
      location: data.location,
      ip: ws.myClientIp || null
    }))
  })
}

function removePermissionsFromRole (ws, obj, data) {
  if (!permissionsExistByCode(ws, constants.OTHER.PERMISSIONS.ADD_PERMISSIONS_TO_ROLE)) return accessDenied(ws, obj, data)
  models.roles_permissions.destroy({
    where: {
      roleId: obj.data.roleId,
      permissionId: obj.data.permissionsIds
    }
  }).then(status => {
    logger.print('# removed permissions from role was complete')
    ws.send(JSON.stringify({
      status: 200,
      message: 'Removed permissions from role was complete.',
      token: data.token,
      location: data.location,
      ip: ws.myClientIp || null
    }))
  }).catch(e => {
    logger.failed('# removed permissions from role was failed, error: ', e.message)
    ws.send(JSON.stringify({
      status: 500,
      message: 'Removed permissions from role was failed.',
      token: data.token,
      location: data.location,
      ip: ws.myClientIp || null
    }))
  })
}

// other function

function permissionsExistByCode (ws, code) {
  if (ws.myConnectionData.permissions) {
    for (p of ws.myConnectionData.permissions)
      if (p.code === code) return true
    return false
  } else return false
}

function accessDenied (ws, data) {
  logger.failed('# access denied')
  return ws.send(JSON.stringify({
    status: 403,
    message: 'Access denied',
    token: data.token,
    location: data.location,
    ip: ws.myClientIp || null
  }))
}
