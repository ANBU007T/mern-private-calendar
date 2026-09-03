require('dotenv').config()

const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')

const connectDB = require('./config/db')
const bootstrapAdmin = require('./scripts/bootstrapAdmin')
const { notFound, errorHandler } = require('./middleware/errorHandler')

const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')
const eventRoutes = require('./routes/eventRoutes')
const taskRoutes = require('./routes/taskRoutes')
const categoryRoutes = require('./routes/categoryRoutes')
const notificationRoutes = require('./routes/notificationRoutes')

const app = express()

const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173').split(',')
app.use(cors({ origin: allowedOrigins, credentials: true }))
app.use(helmet())
app.use(express.json())
app.use(morgan('dev'))

app.get('/api/health', (req, res) => res.json({ status: 'UP' }))

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/events', eventRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/notifications', notificationRoutes)

app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 8080

async function start() {
  await connectDB()
  await bootstrapAdmin()
  app.listen(PORT, () => console.log(`[server] Private Calendar API listening on port ${PORT}`))
}

start().catch((err) => {
  console.error('[server] Failed to start:', err.message)
  process.exit(1)
})
