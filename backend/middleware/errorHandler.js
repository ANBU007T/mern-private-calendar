const AppError = require('../utils/AppError')

function notFound(req, res, next) {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404))
}

function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500
  let message = err.message || 'Something went wrong. Please try again.'

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400
    message = Object.values(err.errors).map((e) => e.message).join('; ')
  }

  // Mongoose duplicate key (e.g. code name already taken)
  if (err.code === 11000) {
    statusCode = 409
    const field = Object.keys(err.keyPattern || {})[0] || 'value'
    message = `${field === 'codeName' ? 'Member' : field} already exists`
  }

  // Malformed ObjectId
  if (err.name === 'CastError') {
    statusCode = 404
    message = 'Resource not found'
  }

  if (statusCode >= 500) {
    console.error(err)
    message = 'Something went wrong. Please try again.'
  }

  res.status(statusCode).json({
    timestamp: new Date().toISOString(),
    status: statusCode,
    message,
    path: req.originalUrl
  })
}

module.exports = { notFound, errorHandler }
