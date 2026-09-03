const asyncHandler = require('express-async-handler')
const Event = require('../models/Event')
const AppError = require('../utils/AppError')

async function populateEvent(query) {
  return query
    .populate('createdBy', 'codeName')
    .populate('category', 'name icon')
    .populate('participants', 'codeName')
}

function serialize(event) {
  const json = event.toJSON()
  return {
    ...json,
    createdByCodeName: event.createdBy?.codeName,
    categoryId: event.category?.id || event.category?._id?.toString() || null,
    categoryName: event.category?.name || null,
    categoryIcon: event.category?.icon || null,
    participantCodeNames: (event.participants || []).map((p) => p.codeName),
    participantIds: (event.participants || []).map((p) => (p.id || p._id.toString()))
  }
}

// GET /api/events?from=&to=
// Visible events: every group-wide (non-personal) event, plus personal
// events the requester created or is a participant on.
const getEvents = asyncHandler(async (req, res) => {
  const from = req.query.from ? new Date(req.query.from) : new Date(Date.now() - 30 * 86400000)
  const to = req.query.to ? new Date(req.query.to) : new Date(Date.now() + 60 * 86400000)

  const events = await populateEvent(
    Event.find({
      startTime: { $gte: from, $lte: to },
      $or: [{ personal: false }, { createdBy: req.user._id }, { participants: req.user._id }]
    }).sort({ startTime: 1 })
  )

  res.json(events.map(serialize))
})

// GET /api/events/upcoming
const getUpcoming = asyncHandler(async (req, res) => {
  const events = await populateEvent(
    Event.find({
      startTime: { $gte: new Date() },
      $or: [{ personal: false }, { createdBy: req.user._id }, { participants: req.user._id }]
    }).sort({ startTime: 1 })
  )
  res.json(events.map(serialize))
})

// GET /api/events/:id
const getEvent = asyncHandler(async (req, res) => {
  const event = await populateEvent(Event.findById(req.params.id))
  if (!event) throw new AppError('Event not found', 404)
  res.json(serialize(event))
})

// POST /api/events
const createEvent = asyncHandler(async (req, res) => {
  const { title, startTime, endTime } = req.body
  if (!title || !startTime || !endTime) {
    throw new AppError('Title, start time, and end time are required', 400)
  }

  const isAdmin = req.user.role === 'ADMIN'
  const event = await Event.create({
    title,
    description: req.body.description || '',
    startTime,
    endTime,
    category: req.body.categoryId || null,
    reminder: req.body.reminder || 'NONE',
    // Non-admins can only ever create personal events.
    personal: isAdmin ? !!req.body.personal : true,
    participants: req.body.participantIds || [],
    createdBy: req.user._id
  })

  const populated = await populateEvent(Event.findById(event._id))
  res.status(201).json(serialize(populated))
})

// PUT /api/events/:id
const updateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id)
  if (!event) throw new AppError('Event not found', 404)
  assertCanModify(event, req.user)

  event.title = req.body.title ?? event.title
  event.description = req.body.description ?? event.description
  event.startTime = req.body.startTime ?? event.startTime
  event.endTime = req.body.endTime ?? event.endTime
  event.category = req.body.categoryId ?? event.category
  event.reminder = req.body.reminder ?? event.reminder
  if (req.user.role === 'ADMIN' && typeof req.body.personal === 'boolean') {
    event.personal = req.body.personal
  }
  if (req.body.participantIds) {
    event.participants = req.body.participantIds
  }
  await event.save()

  const populated = await populateEvent(Event.findById(event._id))
  res.json(serialize(populated))
})

// DELETE /api/events/:id
const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id)
  if (!event) throw new AppError('Event not found', 404)
  assertCanModify(event, req.user)

  await event.deleteOne()
  res.status(204).send()
})

function assertCanModify(event, user) {
  const isAdmin = user.role === 'ADMIN'
  const isOwner = event.createdBy.equals(user._id)
  if (!isAdmin && !isOwner) {
    throw new AppError('You can only modify your own events', 403)
  }
}

module.exports = { getEvents, getUpcoming, getEvent, createEvent, updateEvent, deleteEvent }
