import { generateTokens } from '../utils/jwt.js'
import { db } from '../utils/dbFacade.js'

export const register = async (req, res) => {
  try {
    const { email, username, password } = req.body

    // Validation
    if (!email || !username || !password) {
      return res.status(400).json({ error: 'Email, username, and password are required' })
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' })
    }

    // Check if user exists
    const existingEmailUser = await db.findUserByEmail(email)
    const existingUsernameUser = await db.findUserByUsername(username)

    if (existingEmailUser) {
      return res.status(400).json({ error: 'Email already registered' })
    }

    if (existingUsernameUser) {
      return res.status(400).json({ error: 'Username already taken' })
    }

    // Create user
    const user = await db.createUser(email, username, password)

    // Create default settings for user
    await db.createUserSettings(user._id || user.id)

    // Generate tokens
    const userId = user._id || user.id
    const { accessToken, refreshToken } = generateTokens(userId.toString())

    res.status(201).json({
      success: true,
      token: accessToken,
      refreshToken: refreshToken,
      user: {
        id: userId,
        email: user.email,
        username: user.username,
        created_at: user.created_at
      }
    })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({ error: error.message || 'Registration failed' })
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    console.log(`[LOGIN ATTEMPT] Email: ${email}`)

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    // Find user
    const user = await db.findUserByEmail(email, true)
    console.log(`[LOGIN ATTEMPT] Found user in DB:`, user ? { id: user._id || user.id, email: user.email } : null)

    if (!user) {
      console.log(`[LOGIN FAIL] User not found for email: ${email}`)
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // Compare passwords
    const isPasswordValid = await db.comparePassword(user.password, password)
    console.log(`[LOGIN ATTEMPT] Password valid:`, isPasswordValid)

    if (!isPasswordValid) {
      console.log(`[LOGIN FAIL] Invalid password for email: ${email}`)
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // Generate tokens
    const userId = user._id || user.id
    const { accessToken, refreshToken } = generateTokens(userId.toString())

    // Update last login
    await db.updateLastLogin(userId)

    res.json({
      success: true,
      token: accessToken,
      refreshToken: refreshToken,
      user: {
        id: userId,
        email: user.email,
        username: user.username,
        created_at: user.created_at
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: error.message || 'Login failed' })
  }
}

export const logout = async (req, res) => {
  try {
    // Token is already verified by middleware
    // In a stateless JWT system, logout is just clearing client-side token
    res.json({
      success: true,
      message: 'Logged out successfully'
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const verifyAuth = async (req, res) => {
  try {
    const user = await db.findUserById(req.userId)

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const userId = user._id || user.id
    res.json({
      valid: true,
      user: {
        id: userId,
        email: user.email,
        username: user.username
      }
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' })
    }

    const { verifyToken } = await import('../utils/jwt.js')
    const decoded = verifyToken(refreshToken, 'refresh')

    const newAccessToken = generateTokens(decoded.userId).accessToken

    res.json({
      success: true,
      token: newAccessToken
    })
  } catch (error) {
    res.status(401).json({ error: error.message })
  }
}
