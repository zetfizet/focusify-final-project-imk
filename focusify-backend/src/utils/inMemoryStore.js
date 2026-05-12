// In-memory data store for development/testing when MongoDB is unavailable
const store = {
  users: [],
  sessions: [],
  settings: []
}

// Helper to generate ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export const inMemoryStore = {
  // User operations
  findUserByEmail: (email) => {
    return store.users.find(u => u.email === email)
  },

  findUserByUsername: (username) => {
    return store.users.find(u => u.username === username)
  },

  findUserById: (id) => {
    return store.users.find(u => u._id === id)
  },

  createUser: (userData) => {
    const newUser = {
      _id: generateId(),
      ...userData,
      created_at: new Date(),
      updated_at: new Date()
    }
    store.users.push(newUser)
    return newUser
  },

  updateUser: (id, updates) => {
    const user = store.users.find(u => u._id === id)
    if (user) {
      Object.assign(user, updates, { updated_at: new Date() })
    }
    return user
  },

  // Session operations
  findSessionById: (id) => {
    return store.sessions.find(s => s._id === id)
  },

  findSessionsByUserId: (userId) => {
    return store.sessions.filter(s => s.user_id === userId)
  },

  createSession: (sessionData) => {
    const newSession = {
      _id: generateId(),
      ...sessionData,
      created_at: new Date(),
      updated_at: new Date()
    }
    store.sessions.push(newSession)
    return newSession
  },

  updateSession: (id, updates) => {
    const session = store.sessions.find(s => s._id === id)
    if (session) {
      Object.assign(session, updates, { updated_at: new Date() })
    }
    return session
  },

  deleteSession: (id) => {
    const index = store.sessions.findIndex(s => s._id === id)
    if (index > -1) {
      store.sessions.splice(index, 1)
      return true
    }
    return false
  },

  // Settings operations
  findSettingsByUserId: (userId) => {
    return store.settings.find(s => s.user_id === userId)
  },

  createSettings: (settingsData) => {
    const newSettings = {
      _id: generateId(),
      ...settingsData,
      created_at: new Date(),
      updated_at: new Date()
    }
    store.settings.push(newSettings)
    return newSettings
  },

  updateSettings: (userId, updates) => {
    const settings = store.settings.find(s => s.user_id === userId)
    if (settings) {
      Object.assign(settings, updates, { updated_at: new Date() })
    }
    return settings
  }
}

export default inMemoryStore
