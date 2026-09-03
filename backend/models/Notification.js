const mongoose = require('mongoose')
const toJSONPlugin = require('../utils/toJSON')

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', default: null },
    message: { type: String, required: true },
    triggerAt: { type: Date, required: true },
    read: { type: Boolean, default: false },
    // Reserved for future EMAIL / PUSH senders; only IN_APP is delivered today.
    deliveryChannel: { type: String, enum: ['IN_APP', 'EMAIL', 'PUSH'], default: 'IN_APP' }
  },
  { timestamps: true }
)

notificationSchema.plugin(toJSONPlugin)

module.exports = mongoose.model('Notification', notificationSchema)
