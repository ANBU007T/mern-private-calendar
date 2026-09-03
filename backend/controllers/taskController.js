const asyncHandler = require('express-async-handler')
const Task = require('../models/Task')
const AppError = require('../utils/AppError')

async function populateTask(query) {
  return query.populate('assignedTo', 'codeName').populate('createdBy', 'codeName')
}

function serialize(task) {
  const json = task.toJSON()
  return {
    ...json,
    assignedToId: task.assignedTo?.id || task.assignedTo?._id?.toString(),
    assignedToCodeName: task.assignedTo?.codeName,
    createdByCodeName: task.createdBy?.codeName
  }
}

// GET /api/tasks            -> the caller's own tasks
// GET /api/tasks?all=true   -> every task (admin only)
const getTasks = asyncHandler(async (req, res) => {
  const showAll = req.query.all === 'true' && req.user.role === 'ADMIN'
  const filter = showAll ? {} : { assignedTo: req.user._id }

  const tasks = await populateTask(Task.find(filter).sort({ dueDate: 1 }))
  res.json(tasks.map(serialize))
})

// POST /api/tasks
const createTask = asyncHandler(async (req, res) => {
  const { title, assignedToId } = req.body
  if (!title || !assignedToId) {
    throw new AppError('Title and assignee are required', 400)
  }

  const task = await Task.create({
    title,
    description: req.body.description || '',
    assignedTo: assignedToId,
    createdBy: req.user._id,
    dueDate: req.body.dueDate || null,
    priority: req.body.priority || 'MEDIUM',
    status: 'PENDING'
  })

  const populated = await populateTask(Task.findById(task._id))
  res.status(201).json(serialize(populated))
})

// PUT /api/tasks/:id
const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id)
  if (!task) throw new AppError('Task not found', 404)
  assertIsAdminOrCreator(task, req.user)

  task.title = req.body.title ?? task.title
  task.description = req.body.description ?? task.description
  task.dueDate = req.body.dueDate ?? task.dueDate
  task.priority = req.body.priority ?? task.priority
  if (req.body.assignedToId) task.assignedTo = req.body.assignedToId
  await task.save()

  const populated = await populateTask(Task.findById(task._id))
  res.json(serialize(populated))
})

// PUT /api/tasks/:id/status
const updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body
  if (!['PENDING', 'IN_PROGRESS', 'COMPLETED'].includes(status)) {
    throw new AppError('Invalid task status', 400)
  }

  const task = await Task.findById(req.params.id)
  if (!task) throw new AppError('Task not found', 404)

  const isAdmin = req.user.role === 'ADMIN'
  const isAssignee = task.assignedTo.equals(req.user._id)
  if (!isAdmin && !isAssignee) {
    throw new AppError('You can only update the status of tasks assigned to you', 403)
  }

  task.status = status
  await task.save()

  const populated = await populateTask(Task.findById(task._id))
  res.json(serialize(populated))
})

// DELETE /api/tasks/:id
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id)
  if (!task) throw new AppError('Task not found', 404)
  assertIsAdminOrCreator(task, req.user)

  await task.deleteOne()
  res.status(204).send()
})

function assertIsAdminOrCreator(task, user) {
  const isAdmin = user.role === 'ADMIN'
  const isCreator = task.createdBy.equals(user._id)
  if (!isAdmin && !isCreator) {
    throw new AppError('You do not have permission to modify this task', 403)
  }
}

module.exports = { getTasks, createTask, updateTask, updateStatus, deleteTask }
