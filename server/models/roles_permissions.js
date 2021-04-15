'use strict'
const uuid = require('uuid/v4')

module.exports = (sequelize, DataTypes) => {
  const roles_permissions = sequelize.define('roles_permissions', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: uuid,
      unique: true
    },
    roleId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: 'roles',
      referencesKey: 'id'
    },
    permissionId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: 'permissions',
      referencesKey: 'id'
    }
  }, {})
  roles_permissions.associate = (models) => {
    // associations can be defined here
  }
  return roles_permissions
}
