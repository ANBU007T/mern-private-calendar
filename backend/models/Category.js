const mongoose = require('mongoose')
const toJSONPlugin = require('../utils/toJSON')

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    icon: { type: String, default: '' }
  },
  { timestamps: true }
)

categorySchema.plugin(toJSONPlugin)

module.exports = mongoose.model('Category', categorySchema)
