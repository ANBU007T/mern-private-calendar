const asyncHandler = require('express-async-handler')
const Notification = require('../models/Notification')

const getAll = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id }).sort({ triggerAt: -1 })
  res.json(notifications)
})

const getDue = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({
    user: req.user._id,
    triggerAt: { $lte: new Date() },
    read: false
  }).sort({ triggerAt: -1 })
  res.json(notifications)
})

const markRead = asyncHandler(async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { read: true })
  res.status(204).send()
})

module.exports = { getAll, getDue, markRead }
