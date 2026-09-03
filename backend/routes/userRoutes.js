const express = require('express')
const { protect, adminOnly } = require('../middleware/auth')
const {
  listMembers,
  createMember,
  updateMember,
  resetPassword,
  deleteMember
} = require('../controllers/userController')

const router = express.Router()

router.use(protect, adminOnly)

router.get('/', listMembers)
router.post('/', createMember)
router.put('/:id', updateMember)
router.post('/:id/reset-password', resetPassword)
router.delete('/:id', deleteMember)

module.exports = router
