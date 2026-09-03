const express = require('express')
const { protect } = require('../middleware/auth')
const {
  getEvents,
  getUpcoming,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent
} = require('../controllers/eventController')

const router = express.Router()

router.use(protect)

router.get('/', getEvents)
router.get('/upcoming', getUpcoming)
router.get('/:id', getEvent)
router.post('/', createEvent)
router.put('/:id', updateEvent)
router.delete('/:id', deleteEvent)

module.exports = router
