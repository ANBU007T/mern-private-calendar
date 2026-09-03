const express = require('express')
const { protect } = require('../middleware/auth')
const { getTasks, createTask, updateTask, updateStatus, deleteTask } = require('../controllers/taskController')

const router = express.Router()

router.use(protect)

router.get('/', getTasks)
router.post('/', createTask)
router.put('/:id', updateTask)
router.put('/:id/status', updateStatus)
router.delete('/:id', deleteTask)

module.exports = router
