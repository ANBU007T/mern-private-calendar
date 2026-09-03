const mongoose = require('mongoose')
const toJSONPlugin = require('../utils/toJSON')

const REMINDER_OPTIONS = ['NONE', 'MIN_5', 'MIN_15', 'MIN_30', 'HOUR_1', 'DAY_1']

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, maxlength: 2000, default: '' },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    reminder: { type: String, enum: REMINDER_OPTIONS, default: 'NONE' },
    status: { type: String, default: 'CONFIRMED' },
    personal: { type: Boolean, default: false },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  { timestamps: true }
)

eventSchema.index({ startTime: 1 })

eventSchema.plugin(toJSONPlugin)

module.exports = mongoose.model('Event', eventSchema)
module.exports.REMINDER_OPTIONS = REMINDER_OPTIONS
