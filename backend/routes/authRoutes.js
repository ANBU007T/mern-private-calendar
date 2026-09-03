const express = require('express')
const { login } = require('../controllers/authController')

const router = express.Router()

router.post('/login', login)
// No /register route exists here, or anywhere in this app, by design.

module.exports = router
