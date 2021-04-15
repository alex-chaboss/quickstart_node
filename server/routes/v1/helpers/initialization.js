const uuidv4 = require('uuid/v4')
const models = require('../../../models')
const logger = require('../../../logger')
const constants = require('../../../constants')

module.exports = {
  defaultPermissions,
  defaultRoles,
  defaultCategories,
}

function defaultPermissions () {
  return new Promise((resolve, reject) => {
    models.permissions.findAll({
      where: {
        $or: constants.defaultPermissionsList,
      },
    }).then(found => {
      if (found.length !== constants.defaultPermissionsList.length) {
        models.permissions.bulkCreate(constants.defaultPermissionsList).then(permissions => {
          logger.print('# permissions have added')
          resolve(permissions.map(p => {return p.dataValues}))
        }).catch(e => {
          logger.failed('# permission not added, error: ', e.message)
          reject(e)
        })
      } else {
        logger.print('# permissions have found all of needded')
        resolve(found.map(p => {return p.dataValues}))
      }
    }).catch(e => {
      logger.failed('# permission not found, error: ', e.message)
      reject(e)
    })
  })
}

function defaultRoles (permissions) {
  models.roles.create(constants.defaultAdminRole).then(admin => {
    logger.print('# ADMIN have added')
    models.roles_permissions.bulkCreate(
      permissions.map(p => {
        return { roleId: admin.id, permissionId: p.id }
      })
    ).then(associations => {
      logger.print('# ADMIN getted all permissions')
    }).catch(e => {
      logger.failed('# ADMIN does not get the permissions, error: ', e.message)
    })
  }).catch(e => {
    e.message === 'Validation error'
      ? logger.print('# ADMIN role already exist')
      : logger.failed('# ADMIN role not added, error: ', e.message)
  })
}

function defaultCategories () {
  models.categories.findAll({
    where: {
      $or: constants.defaultCategoriesList,
    },
  }).then(found => {
    if (found.length !== constants.defaultCategoriesList.length) {
      models.categories.bulkCreate(constants.defaultCategoriesList).then(categories => {
        logger.print('# categories have added : ', categories.map(p => {return p.dataValues}))
      }).catch(e => {
        logger.failed('# categories not added, error: ', e.message)
      })
    } else {
      logger.print('# categories have found all of needed')
    }
  }).catch(e => {
    logger.failed('# categories not found, error: ', e.message)
  })
}
