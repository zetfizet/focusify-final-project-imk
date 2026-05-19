import { User } from '../models/User.js'
import { UserSettings } from '../models/UserSettings.js'
import inMemoryStore from './inMemoryStore.js'
import bcryptjs from 'bcryptjs'

// Check if MongoDB is connected
let mongoConnected = true

export const setMongoConnected = (status) => {
  mongoConnected = status
}

// Database abstraction layer
export const db = {
  // User operations
  async findUserByEmail(email, includePassword = false) {
    try {
      if (mongoConnected) {
        let query = User.findOne({ email })
        if (includePassword) {
          query = query.select('+password')
        }
        return await query
      }
    } catch (err) {
      mongoConnected = false
    }
    return inMemoryStore.findUserByEmail(email)
  },

  async findUserByUsername(username) {
    try {
      if (mongoConnected) {
        return await User.findOne({ username })
      }
    } catch (err) {
      mongoConnected = false
    }
    return inMemoryStore.findUserByUsername(username)
  },

  async findUserById(id) {
    try {
      if (mongoConnected) {
        return await User.findById(id)
      }
    } catch (err) {
      mongoConnected = false
    }
    return inMemoryStore.findUserById(id)
  },

  async createUser(email, username, password) {
    try {
      if (mongoConnected) {
        const user = new User({ email, username, password })
        await user.save()
        return user.toObject()
      }
    } catch (err) {
      mongoConnected = false
      console.warn('MongoDB error, using in-memory store:', err.message)
    }

    // In-memory fallback
    const hashedPassword = await bcryptjs.hash(password, 10)
    return inMemoryStore.createUser({
      email,
      username,
      password: hashedPassword
    })
  },

  async createUserSettings(userId) {
    try {
      if (mongoConnected) {
        const settings = new UserSettings({ user_id: userId })
        await settings.save()
        return settings.toObject()
      }
    } catch (err) {
      mongoConnected = false
    }

    return inMemoryStore.createSettings({ user_id: userId })
  },

  async comparePassword(storedHash, enteredPassword) {
    try {
      return await bcryptjs.compare(enteredPassword, storedHash)
    } catch (err) {
      return false
    }
  },

  async updateLastLogin(userId) {
    try {
      if (mongoConnected) {
        await User.findByIdAndUpdate(userId, { last_login: new Date() })
      }
    } catch (err) {
      mongoConnected = false
    }
  }
}

export default db
