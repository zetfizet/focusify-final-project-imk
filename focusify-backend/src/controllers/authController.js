import { User } from '../models/User.js'
import { UserSettings } from '../models/UserSettings.js'
import { generateTokens } from '../utils/jwt.js'

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
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    })

    if (existingUser) {
      return res.status(400).json({
        error: existingUser.email === email ? 'Email already registered' : 'Username already taken'
      })
    }

    // Create user
    const user = new User({
      email,
      username,
      password
    })

    await user.save()

    // Create default settings for user
    const settings = new UserSettings({
      user_id: user._id
    })

    await settings.save()

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id.toString())

    // Update last login
    user.last_login = new Date()
    await user.save()

    res.status(201).json({
      success: true,
      token: accessToken,
      refreshToken: refreshToken,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        created_at: user.created_at
      }
    })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({ error: error.message })
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    // Find user and get password field
    const user = await User.findOne({ email }).select('+password')

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // Compare passwords
    const isPasswordValid = await user.comparePassword(password)

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id.toString())

    // Update last login
    user.last_login = new Date()
    await user.save()

    res.json({
      success: true,
      token: accessToken,
      refreshToken: refreshToken,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        created_at: user.created_at
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: error.message })
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
    const user = await User.findById(req.userId)

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({
      valid: true,
      user: {
        id: user._id,
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
