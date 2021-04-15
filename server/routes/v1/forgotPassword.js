const express = require('express')
const router = express.Router()
const uuidv4 = require('uuid/v4')
const models = require('../../models')
const modules = require('../modules')
const sockets = require('../sockets')
const logger = require('../../logger')
const constants = require('../../constants')
const sendToMail = require("../sendToMail")


router.post('/forgot_password',
  function (req, res, next) {
    const data = req.body
    logger.print("# start endpoint forgot_password...")
    if(!data.email) return res.status(400).send({message: "Some body params is invalid"})

    sendToMail.forgotPassword(data.email)
      .then(result => {
        return res.status(200).send({message: result})
      })
      .catch(e => {
        return res.status(500).send({message: e})
      })
  })

router.post('/change_pass_as_forgot',
  function (req, res, next) {
    const data = req.body

    if(!data.newPass || !data.hash) return res.status(400).send({message: "Some body params is invalid"})
    const hashContent = sendToMail.chackHashOfForgotPass(data.hash)
    if(!hashContent.id) return res.status(400).send({message: hashContent})

    models.users.update(
      { // which have updated
        password: modules.signPassword(data.newPass)
      },
      { // find by this criterias to updating
        where: {id: hashContent.id}
      })
      .then(updated => {
        if(!updated[0]) return res.status(500).send({message: "Nothing was updated"})
        return res.status(200).send({message: "Password has been updated"})
      })
      .catch(err => {
        logger.failed("# Error on update password by forgot: ", err.message)
        return res.status(500).send({message:'User updating for set the email validation key was failed'})
      })
  })

module.exports = router
