const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')
const User = require('../models/User')
const AppError = require('../utils/AppError')

// Verifies the JWT and re-fetches the user from the DB on every request so
// that a disabled account or role change takes effect immediately, rather
// than waiting for the token to expire.
const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    throw new AppError('Not authenticated', 401)
  }

  const token = header.slice(7)
  let payload
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET)
  } catch {
    throw new AppError('Session expired or invalid. Please log in again.', 401)
  }

  const user = await User.findById(payload.sub)
  if (!user) {
    throw new AppError('Not authenticated', 401)
  }
  if (user.status === 'DISABLED') {
    throw new AppError('This account has been disabled', 401)
  }

  req.user = user
  next()
})

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    throw new AppError('You do not have permission to access this resource', 403)
  }
  next()
}

module.exports = { protect, adminOnly }
