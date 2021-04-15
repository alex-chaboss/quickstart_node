'use strict'
const uuid = require('uuid/v4')

module.exports = (sequelize, DataTypes) => {
  const permissions = sequelize.define('permissions', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: uuid,
      unique: true
    },
    code: {
      type: DataTypes.INTEGER,
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
  permissions.associate = (models) => {
    // associations can be defined here
  }
  return permissions
}
