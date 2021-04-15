'use strict'
const uuid = require('uuid/v4')

module.exports = (sequelize, DataTypes) => {
  const users_roles = sequelize.define('users_roles', {
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
    roleId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: 'roles',
      referencesKey: 'id'
    }
  }, {})
  users_roles.associate = (models) => {
    // associations can be defined here
  }
  return users_roles
}
