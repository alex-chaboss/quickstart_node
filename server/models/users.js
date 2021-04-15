'use strict'
const uuid = require('uuid/v4')
const constants = require('../constants')

module.exports = (sequelize, DataTypes) => {
  const users = sequelize.define('users', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: uuid
    },
    email: {
      type: DataTypes.STRING,
      set: function (val) {
        val = val.trim().toLowerCase()
        this.setDataValue('email', val)
      },
      validate: {
        is: constants.loginRegexp
      },
      allowNull: false,
      unique: true
    },
    nickname: {
      type: DataTypes.STRING,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      validate: {
        is: constants.passwordRegexp
      },
      allowNull: false
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    data: {
      type: DataTypes.JSONB
    }
  }, {})
  users.associate = (models) => {
    // associations can be defined here
  }
  return users
}
