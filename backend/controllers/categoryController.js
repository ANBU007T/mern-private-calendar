const asyncHandler = require('express-async-handler')
const Category = require('../models/Category')
const AppError = require('../utils/AppError')

const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ name: 1 })
  res.json(categories)
})

// POST/PUT/DELETE below require ROLE_ADMIN (enforced in routes/categoryRoutes.js)

const createCategory = asyncHandler(async (req, res) => {
  const { name, icon } = req.body
  if (!name) throw new AppError('Category name is required', 400)

  const existing = await Category.findOne({ name: new RegExp(`^${name}$`, 'i') })
  if (existing) throw new AppError('Category already exists', 409)

  const category = await Category.create({ name, icon })
  res.status(201).json(category)
})

const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id)
  if (!category) throw new AppError('Category not found', 404)

  category.name = req.body.name ?? category.name
  category.icon = req.body.icon ?? category.icon
  await category.save()

  res.json(category)
})

const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id)
  if (!category) throw new AppError('Category not found', 404)

  await category.deleteOne()
  res.status(204).send()
})

module.exports = { getCategories, createCategory, updateCategory, deleteCategory }
