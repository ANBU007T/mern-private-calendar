const mongoose = require('mongoose')
const toJSONPlugin = require('../utils/toJSON')

const userSchema = new mongoose.Schema(
  {
    codeName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      match: [/^[A-Z0-9_-]{3,50}$/, 'Code name must be 3-50 characters: letters, numbers, - or _']
    },
    passwordHash: {
      type: String,
      required: true,
      select: false
    },
    role: {
      type: String,
      enum: ['ADMIN', 'MEMBER'],
      default: 'MEMBER'
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'DISABLED'],
      default: 'ACTIVE'
    },
    mustChangePassword: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
)

userSchema.plugin(toJSONPlugin)

module.exports = mongoose.model('User', userSchema)
