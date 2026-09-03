const bcrypt = require('bcryptjs')
const User = require('../models/User')
const Category = require('../models/Category')

const DEFAULT_CATEGORIES = [
  { name: 'PERSONAL', icon: '📅' },
  { name: 'COLLEGE', icon: '📚' },
  { name: 'PROJECT', icon: '💻' },
  { name: 'TEAM', icon: '👥' },
  { name: 'EVENTS', icon: '🎯' }
]

// Runs once at server startup. Creates the first administrator account
// if (and only if) the users collection is completely empty — this is
// the sole path by which an account can exist without an already
// logged-in admin creating it.
async function bootstrap() {
  const userCount = await User.countDocuments()
  if (userCount === 0) {
    const codeName = process.env.ADMIN_CODENAME || 'ADMIN'
    const password = process.env.ADMIN_PASSWORD || 'ChangeMe123!'
    const passwordHash = await bcrypt.hash(password, 12)

    await User.create({
      codeName,
      passwordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
      mustChangePassword: true
    })

    console.warn('==========================================================')
    console.warn('No users found. Created initial administrator account.')
    console.warn(`Code Name: ${codeName.toUpperCase()}`)
    console.warn('Change this password immediately after first login.')
    console.warn('==========================================================')
  }

  const categoryCount = await Category.countDocuments()
  if (categoryCount === 0) {
    await Category.insertMany(DEFAULT_CATEGORIES)
  }
}

module.exports = bootstrap
