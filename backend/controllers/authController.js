const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const asyncHandler = require('express-async-handler')
const User = require('../models/User')
const AppError = require('../utils/AppError')

function signToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '8h'
  })
}

// POST /api/auth/login
// This is the ONLY authentication entry point in the whole application.
// There is deliberately no /register route anywhere — accounts are created
// exclusively by an admin via POST /api/users, or the one-time bootstrap
// admin created on first server start (see scripts/bootstrapAdmin.js).
const login = asyncHandler(async (req, res) => {
  const { codeName, password } = req.body

  if (!codeName || !password) {
    throw new AppError('Invalid code name or password', 401)
  }

  const user = await User.findOne({ codeName: codeName.toUpperCase() }).select('+passwordHash')

  // Deliberately generic error for missing user, wrong password, AND
  // disabled account — never confirm which one it was.
  if (!user) {
    throw new AppError('Invalid code name or password', 401)
  }

  const matches = await bcrypt.compare(password, user.passwordHash)
  if (!matches) {
    throw new AppError('Invalid code name or password', 401)
  }

  if (user.status === 'DISABLED') {
    throw new AppError('Invalid code name or password', 401)
  }

  const token = signToken(user)
  res.json({
    token,
    codeName: user.codeName,
    role: user.role,
    mustChangePassword: user.mustChangePassword
  })
})

module.exports = { login }
