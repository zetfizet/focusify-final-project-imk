import { Session } from '../models/Session.js'

export const getAllSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ user_id: req.userId })
      .sort({ created_at: -1 })
      .exec()

    res.json(sessions)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const getSessionById = async (req, res) => {
  try {
    const { id } = req.params

    const session = await Session.findOne({
      _id: id,
      user_id: req.userId
    })

    if (!session) {
      return res.status(404).json({ error: 'Session not found' })
    }

    res.json(session)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const createSession = async (req, res) => {
  try {
    const { name, duration, totalDuration, type, ambience, focusMode, startTime, endTime, timeLabel, distractions, status, score } = req.body

    // Validation
    if (!name || !duration || !type || !ambience || !startTime || !endTime) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const session = new Session({
      user_id: req.userId,
      name,
      duration,
      totalDuration: totalDuration || duration,
      type,
      ambience,
      focusMode: focusMode !== undefined ? focusMode : true,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      timeLabel,
      distractions: distractions || 0,
      status: status || 'done',
      score: score || 100
    })

    await session.save()

    res.status(201).json({
      success: true,
      session: session
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const updateSession = async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body

    // Find and verify ownership
    const session = await Session.findOne({
      _id: id,
      user_id: req.userId
    })

    if (!session) {
      return res.status(404).json({ error: 'Session not found' })
    }

    // Update fields
    Object.keys(updates).forEach(key => {
      if (key in session) {
        session[key] = updates[key]
      }
    })

    session.updated_at = new Date()
    await session.save()

    res.json({
      success: true,
      session: session
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const deleteSession = async (req, res) => {
  try {
    const { id } = req.params

    const session = await Session.findOneAndDelete({
      _id: id,
      user_id: req.userId
    })

    if (!session) {
      return res.status(404).json({ error: 'Session not found' })
    }

    res.json({
      success: true,
      message: 'Session deleted successfully'
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const getSessionStats = async (req, res) => {
  try {
    const { period = 'week' } = req.query // 'day', 'week', 'month', 'all'

    let dateFilter = {}
    const now = new Date()

    if (period === 'day') {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      dateFilter = { created_at: { $gte: startOfDay } }
    } else if (period === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      dateFilter = { created_at: { $gte: weekAgo } }
    } else if (period === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      dateFilter = { created_at: { $gte: monthAgo } }
    }

    const sessions = await Session.find({
      user_id: req.userId,
      ...dateFilter
    })

    const totalSessions = sessions.length
    const totalDuration = sessions.reduce((acc, s) => acc + s.duration, 0)
    const avgScore = sessions.length > 0 
      ? Math.round(sessions.reduce((acc, s) => acc + s.score, 0) / sessions.length)
      : 0
    const completedSessions = sessions.filter(s => s.status === 'done').length
    const totalDistractions = sessions.reduce((acc, s) => acc + s.distractions, 0)

    res.json({
      period,
      totalSessions,
      completedSessions,
      totalDuration,
      avgScore,
      totalDistractions,
      sessions
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const bulkCreateSessions = async (req, res) => {
  try {
    const { sessions } = req.body

    if (!Array.isArray(sessions)) {
      return res.status(400).json({ error: 'Sessions must be an array' })
    }

    const sessionsToCreate = sessions.map(s => ({
      ...s,
      user_id: req.userId
    }))

    const created = await Session.insertMany(sessionsToCreate)

    res.status(201).json({
      success: true,
      count: created.length,
      sessions: created
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}
