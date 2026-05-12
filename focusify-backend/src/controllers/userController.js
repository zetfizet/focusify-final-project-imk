import { User } from '../models/User.js'
import { UserSettings } from '../models/UserSettings.js'
import { Session } from '../models/Session.js'

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId)

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Get user stats
    const totalSessions = await Session.countDocuments({ user_id: req.userId })
    const totalDuration = await Session.aggregate([
      { $match: { user_id: user._id } },
      { $group: { _id: null, total: { $sum: '$duration' } } }
    ])

    res.json({
      id: user._id,
      email: user.email,
      username: user.username,
      avatar: user.avatar,
      bio: user.bio,
      plan: user.plan,
      created_at: user.created_at,
      last_login: user.last_login,
      stats: {
        totalSessions,
        totalDuration: totalDuration[0]?.total || 0
      }
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const updateUserProfile = async (req, res) => {
  try {
    const { username, avatar, bio } = req.body

    const user = await User.findById(req.userId)

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Update allowed fields
    if (username) user.username = username
    if (avatar) user.avatar = avatar
    if (bio !== undefined) user.bio = bio

    user.updated_at = new Date()
    await user.save()

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        bio: user.bio
      }
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const getUserSettings = async (req, res) => {
  try {
    const settings = await UserSettings.findOne({ user_id: req.userId })

    if (!settings) {
      return res.status(404).json({ error: 'Settings not found' })
    }

    res.json(settings)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const updateUserSettings = async (req, res) => {
  try {
    const { theme, notifications_enabled, sound_enabled, break_reminder, distraction_warning, daily_target, language } = req.body

    let settings = await UserSettings.findOne({ user_id: req.userId })

    if (!settings) {
      settings = new UserSettings({ user_id: req.userId })
    }

    // Update allowed fields
    if (theme) settings.theme = theme
    if (notifications_enabled !== undefined) settings.notifications_enabled = notifications_enabled
    if (sound_enabled !== undefined) settings.sound_enabled = sound_enabled
    if (break_reminder !== undefined) settings.break_reminder = break_reminder
    if (distraction_warning !== undefined) settings.distraction_warning = distraction_warning
    if (daily_target) settings.daily_target = daily_target
    if (language) settings.language = language

    settings.updated_at = new Date()
    await settings.save()

    res.json({
      success: true,
      settings
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body

    if (!password) {
      return res.status(400).json({ error: 'Password is required to delete account' })
    }

    const user = await User.findById(req.userId).select('+password')

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const isPasswordValid = await user.comparePassword(password)

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Password is incorrect' })
    }

    // Delete all user data
    await Session.deleteMany({ user_id: req.userId })
    await UserSettings.deleteOne({ user_id: req.userId })
    await User.findByIdAndDelete(req.userId)

    res.json({
      success: true,
      message: 'Account deleted successfully'
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
