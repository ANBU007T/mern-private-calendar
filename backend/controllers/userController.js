const bcrypt = require('bcryptjs')
const asyncHandler = require('express-async-handler')
const User = require('../models/User')
const AppError = require('../utils/AppError')

// All routes in this controller require ROLE_ADMIN (enforced in routes/userRoutes.js).

// GET /api/users
const listMembers = asyncHandler(async (req, res) => {
  const users = await User.find().sort({ createdAt: 1 })
  res.json(users)
})

// POST /api/users
const createMember = asyncHandler(async (req, res) => {
  const { codeName, password, role } = req.body

  if (!codeName || !password) {
    throw new AppError('Code name and password are required', 400)
  }
  if (password.length < 8) {
    throw new AppError('Password must be at least 8 characters', 400)
  }
  if (!/^[A-Za-z0-9_-]{3,50}$/.test(codeName)) {
    throw new AppError('Code name must be 3-50 characters: letters, numbers, - or _', 400)
  }

  const existing = await User.findOne({ codeName: codeName.toUpperCase() })
  if (existing) {
    throw new AppError('Member already exists', 409)
  }

  const passwordHash = await bcrypt.hash(password, 12)
  const user = await User.create({
    codeName,
    passwordHash,
    role: role === 'ADMIN' ? 'ADMIN' : 'MEMBER',
    mustChangePassword: true
  })

  res.status(201).json(user)
})

// PUT /api/users/:id
const updateMember = asyncHandler(async (req, res) => {
  const { role, status } = req.body
  const user = await User.findById(req.params.id)
  if (!user) throw new AppError('Member not found', 404)

  if (user._id.equals(req.user._id) && status === 'DISABLED') {
    throw new AppError('You cannot disable your own account', 403)
  }

  if (role) user.role = role
  if (status) user.status = status
  await user.save()

  res.json(user)
})

// POST /api/users/:id/reset-password
const resetPassword = asyncHandler(async (req, res) => {
  const { newPassword } = req.body
  if (!newPassword || newPassword.length < 8) {
    throw new AppError('Password must be at least 8 characters', 400)
  }

  const user = await User.findById(req.params.id)
  if (!user) throw new AppError('Member not found', 404)

  user.passwordHash = await bcrypt.hash(newPassword, 12)
  user.mustChangePassword = true
  await user.save()

  res.json({ message: 'Password reset' })
})

// DELETE /api/users/:id
const deleteMember = asyncHandler(async (req, res) => {
  if (req.params.id === req.user._id.toString()) {
    throw new AppError('You cannot delete your own account', 403)
  }
  const user = await User.findById(req.params.id)
  if (!user) throw new AppError('Member not found', 404)

  await user.deleteOne()
  res.status(204).send()
})

module.exports = { listMembers, createMember, updateMember, resetPassword, deleteMember }
