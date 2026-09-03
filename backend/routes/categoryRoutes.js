const express = require('express')
const { protect, adminOnly } = require('../middleware/auth')
const { getCategories, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController')

const router = express.Router()

router.use(protect)

router.get('/', getCategories)
router.post('/', adminOnly, createCategory)
router.put('/:id', adminOnly, updateCategory)
router.delete('/:id', adminOnly, deleteCategory)

module.exports = router
