'use strict'

const fs = require('fs')
const path = require('path')
const Sequelize = require('sequelize')
const logger = require('../logger')
const basename = path.basename(__filename)
const env = process.env.NODE_ENV || 'development'
const db = {}

let sequelize

logger.print("DATABASE_URL : ", process.env.DATABASE_URL)
logger.print("PORT : ", process.env.PORT)
logger.print("USERNAME : ", process.env.USERNAME)
logger.print("PASSWORD : ", process.env.PASSWORD)
logger.print("DATABASE_SEQUELIZE_DIALECT : ", process.env.DATABASE_SEQUELIZE_DIALECT)
logger.print("DATABASE_SEQUELIZE_PORT : ", process.env.DATABASE_SEQUELIZE_PORT)
logger.print("DATABASE_SEQUELIZE_SEEDER_STORAGE : ", process.env.DATABASE_SEQUELIZE_SEEDER_STORAGE)

sequelize = new Sequelize(
  process.env.DATABASE_URL,
  process.env.USERNAME,
  process.env.PASSWORD,
  {
    port: process.env.DATABASE_SEQUELIZE_PORT,
    dialect: process.env.DATABASE_SEQUELIZE_DIALECT,
    seederStorage: process.env.DATABASE_SEQUELIZE_SEEDER_STORAGE,
    logging: (msg) => logger.print('DB: ', msg)
  })

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js')
  })
  .forEach(file => {
    const model = sequelize['import'](path.join(__dirname, file))
    db[model.name] = model
  })

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db)
  }
})

// add associations
// many to many users <-> permissions
db['users_permissions'].belongsTo(db['users'])
db['users'].belongsToMany(db['permissions'], {through: db['users_permissions']}, {onDelete: 'CASCADE'})
db['users_permissions'].belongsTo(db['permissions'])
db['permissions'].belongsToMany(db['users'], {through: db['users_permissions']}, {onDelete: 'CASCADE'})
// many to many roles <-> permissions
db['roles_permissions'].belongsTo(db['roles'])
db['roles'].belongsToMany(db['permissions'], {through: db['roles_permissions']}, {onDelete: 'CASCADE'})
db['roles_permissions'].belongsTo(db['permissions'])
db['permissions'].belongsToMany(db['roles'], {through: db['roles_permissions']}, {onDelete: 'CASCADE'})
// many to many users <-> roles
db['users_roles'].belongsTo(db['users'])
db['users'].belongsToMany(db['roles'], {through: db['users_roles'], onDelete: 'CASCADE'})
db['users_roles'].belongsTo(db['roles'])
db['roles'].belongsToMany(db['users'], {through: db['users_roles'], onDelete: 'CASCADE'})


db.sequelize = sequelize
db.Sequelize = Sequelize

module.exports = db
