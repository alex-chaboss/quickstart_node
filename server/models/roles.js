'use strict'
const uuid = require('uuid/v4')

module.exports = (sequelize, DataTypes) => {
  const roles = sequelize.define('roles', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: uuid,
      unique: true
    },
    position: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false
    },
    data: {
      type: DataTypes.JSONB
    }
  }, {})
  roles.associate = (models) => {
    // associations can be defined here
  }
  return roles
}
