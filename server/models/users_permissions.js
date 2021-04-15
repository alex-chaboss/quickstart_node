'use strict'
const uuid = require('uuid/v4')

module.exports = (sequelize, DataTypes) => {
  const users_permissions = sequelize.define('users_permissions', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: uuid,
      unique: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: 'users',
      referencesKey: 'id'
    },
    permissionId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: 'permissions',
      referencesKey: 'id'
    }
  }, {})
  users_permissions.associate = (models) => {
    // associations can be defined here
  }
  return users_permissions
}
