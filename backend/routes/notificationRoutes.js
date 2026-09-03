const express = require('express')
const { protect } = require('../middleware/auth')
const { getAll, getDue, markRead } = require('../controllers/notificationController')

const router = express.Router()

router.use(protect)

router.get('/', getAll)
router.get('/due', getDue)
router.put('/:id/read', markRead)

module.exports = router
