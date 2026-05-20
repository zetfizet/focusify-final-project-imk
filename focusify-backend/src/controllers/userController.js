import { db } from '../utils/dbFacade.js'

export const getUserProfile = async (req, res) => {
  try {
    const user = await db.findUserById(req.userId)

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Get user stats via facade
    const totalSessions = await db.countSessionsByUserId(req.userId)
    const totalDuration = await db.aggregateSessionDuration(req.userId)

    res.json({
      id: user._id || user.id,
      email: user.email,
      username: user.username,
      avatar: user.avatar,
      bio: user.bio,
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      university: user.university || '',
      major: user.major || '',
      plan: user.plan || 'Free',
      created_at: user.created_at,
      last_login: user.last_login,
      stats: {
        totalSessions,
        totalDuration
      }
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const updateUserProfile = async (req, res) => {
  try {
    const { username, avatar, bio, firstName, lastName, university, major } = req.body

    const user = await db.findUserById(req.userId)

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Prepare updates mapping to schema fields
    const updates = {}
    if (username) updates.username = username
    if (avatar) updates.avatar = avatar
    if (bio !== undefined) updates.bio = bio
    if (firstName !== undefined) updates.first_name = firstName
    if (lastName !== undefined) updates.last_name = lastName
    if (university !== undefined) updates.university = university
    if (major !== undefined) updates.major = major

    const updatedUser = await db.updateUser(req.userId, updates)

    res.json({
      success: true,
      user: {
        id: updatedUser._id || updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        avatar: updatedUser.avatar,
        bio: updatedUser.bio,
        first_name: updatedUser.first_name,
        last_name: updatedUser.last_name,
        university: updatedUser.university,
        major: updatedUser.major
      }
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const getUserSettings = async (req, res) => {
  try {
    const settings = await db.findSettingsByUserId(req.userId)

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
    const { theme, notifications_enabled, sound_enabled, break_reminder, distraction_warning, daily_target, weekly_hours_target, language, streak_achievement_notifications, weekly_summary_notifications, reminder_time } = req.body

    const updates = {}
    if (theme) updates.theme = theme
    if (notifications_enabled !== undefined) updates.notifications_enabled = notifications_enabled
    if (sound_enabled !== undefined) updates.sound_enabled = sound_enabled
    if (break_reminder !== undefined) updates.break_reminder = break_reminder
    if (distraction_warning !== undefined) updates.distraction_warning = distraction_warning
    if (daily_target !== undefined) updates.daily_target = daily_target
    if (weekly_hours_target !== undefined) updates.weekly_hours_target = weekly_hours_target
    if (language) updates.language = language
    if (streak_achievement_notifications !== undefined) updates.streak_achievement_notifications = streak_achievement_notifications
    if (weekly_summary_notifications !== undefined) updates.weekly_summary_notifications = weekly_summary_notifications
    if (reminder_time !== undefined) updates.reminder_time = reminder_time

    const settings = await db.updateSettingsByUserId(req.userId, updates)

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

    const user = await db.findUserById(req.userId)

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const isPasswordValid = await db.comparePassword(user.password, password)

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Password is incorrect' })
    }

    // Delete user settings and sessions via facade
    await db.deleteUserData(req.userId)

    res.json({
      success: true,
      message: 'Account deleted successfully'
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
