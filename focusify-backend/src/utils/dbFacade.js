import { User } from '../models/User.js'
import { UserSettings } from '../models/UserSettings.js'
import { Session } from '../models/Session.js'
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

  async findAllUsers() {
    try {
      if (mongoConnected) {
        return await User.find({})
      }
    } catch (err) {
      mongoConnected = false
    }
    return inMemoryStore.findAllUsers()
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
  },

  async updateUser(id, updates) {
    try {
      if (mongoConnected) {
        return await User.findByIdAndUpdate(id, updates, { new: true })
      }
    } catch (err) {
      mongoConnected = false
    }
    return inMemoryStore.updateUser(id, updates)
  },

  async findSettingsByUserId(userId) {
    try {
      if (mongoConnected) {
        return await UserSettings.findOne({ user_id: userId })
      }
    } catch (err) {
      mongoConnected = false
    }
    let settings = inMemoryStore.findSettingsByUserId(userId)
    if (!settings) {
      settings = inMemoryStore.createSettings({ user_id: userId })
    }
    return settings
  },

  async updateSettingsByUserId(userId, updates) {
    try {
      if (mongoConnected) {
        let settings = await UserSettings.findOne({ user_id: userId })
        if (!settings) {
          settings = new UserSettings({ user_id: userId })
        }
        Object.assign(settings, updates, { updated_at: new Date() })
        return await settings.save()
      }
    } catch (err) {
      mongoConnected = false
    }
    let settings = inMemoryStore.findSettingsByUserId(userId)
    if (!settings) {
      settings = inMemoryStore.createSettings({ user_id: userId })
    }
    return inMemoryStore.updateSettings(userId, updates)
  },

  // Session operations
  async findSessionsByUserId(userId) {
    try {
      if (mongoConnected) {
        return await Session.find({ user_id: userId }).sort({ created_at: -1 }).exec()
      }
    } catch (err) {
      mongoConnected = false
    }
    return inMemoryStore.findSessionsByUserId(userId)
  },

  async findSessionByIdAndUserId(id, userId) {
    try {
      if (mongoConnected) {
        return await Session.findOne({ _id: id, user_id: userId })
      }
    } catch (err) {
      mongoConnected = false
    }
    const session = inMemoryStore.findSessionById(id)
    if (session && session.user_id === userId) {
      return session
    }
    return null
  },

  async createSession(sessionData) {
    try {
      if (mongoConnected) {
        const session = new Session(sessionData)
        return await session.save()
      }
    } catch (err) {
      mongoConnected = false
    }
    return inMemoryStore.createSession(sessionData)
  },

  async updateSession(id, updates) {
    try {
      if (mongoConnected) {
        return await Session.findByIdAndUpdate(id, updates, { new: true })
      }
    } catch (err) {
      mongoConnected = false
    }
    return inMemoryStore.updateSession(id, updates)
  },

  async deleteSession(id) {
    try {
      if (mongoConnected) {
        const res = await Session.findByIdAndDelete(id)
        return !!res
      }
    } catch (err) {
      mongoConnected = false
    }
    return inMemoryStore.deleteSession(id)
  },

  async bulkCreateSessions(sessionsList) {
    try {
      if (mongoConnected) {
        return await Session.insertMany(sessionsList)
      }
    } catch (err) {
      mongoConnected = false
    }
    return sessionsList.map(s => inMemoryStore.createSession(s))
  },

  async countSessionsByUserId(userId) {
    try {
      if (mongoConnected) {
        return await Session.countDocuments({ user_id: userId })
      }
    } catch (err) {
      mongoConnected = false
    }
    return inMemoryStore.findSessionsByUserId(userId).length
  },

  async aggregateSessionDuration(userId) {
    try {
      if (mongoConnected) {
        const res = await Session.aggregate([
          { $match: { user_id: userId } },
          { $group: { _id: null, total: { $sum: '$duration' } } }
        ])
        return res[0]?.total || 0
      }
    } catch (err) {
      mongoConnected = false
    }
    return inMemoryStore.findSessionsByUserId(userId).reduce((a, s) => a + s.duration, 0)
  },

  async deleteUserData(userId) {
    try {
      if (mongoConnected) {
        await Session.deleteMany({ user_id: userId })
        await UserSettings.deleteOne({ user_id: userId })
        await User.findByIdAndDelete(userId)
        return true
      }
    } catch (err) {
      mongoConnected = false
    }
    // In-memory fallback
    if (inMemoryStore.sessions) {
      inMemoryStore.sessions = inMemoryStore.sessions.filter(s => s.user_id !== userId)
    }
    if (inMemoryStore.settings) {
      inMemoryStore.settings = inMemoryStore.settings.filter(s => s.user_id !== userId)
    }
    if (inMemoryStore.users) {
      inMemoryStore.users = inMemoryStore.users.filter(u => u._id !== userId && u.id !== userId)
    }
    return true
  }
}

export default db
