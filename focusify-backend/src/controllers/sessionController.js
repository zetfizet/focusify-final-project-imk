import { db } from '../utils/dbFacade.js'

export const getAllSessions = async (req, res) => {
  try {
    const sessions = await db.findSessionsByUserId(req.userId)
    res.json(sessions)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const getSessionById = async (req, res) => {
  try {
    const { id } = req.params

    const session = await db.findSessionByIdAndUserId(id, req.userId)

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

    const sessionData = {
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
    }

    const session = await db.createSession(sessionData)

    res.status(201).json({
      success: true,
      session
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
    const session = await db.findSessionByIdAndUserId(id, req.userId)

    if (!session) {
      return res.status(404).json({ error: 'Session not found' })
    }

    const updatedSession = await db.updateSession(id, updates)

    res.json({
      success: true,
      session: updatedSession
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const deleteSession = async (req, res) => {
  try {
    const { id } = req.params

    const deleted = await db.deleteSession(id)

    if (!deleted) {
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
    const sessions = await db.findSessionsByUserId(req.userId)
    const now = new Date()

    const filtered = sessions.filter(s => {
      const createdAt = new Date(s.created_at || s.endTime)
      if (period === 'day') {
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        return createdAt >= startOfDay
      } else if (period === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        return createdAt >= weekAgo
      } else if (period === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        return createdAt >= monthAgo
      }
      return true
    })

    const totalSessions = filtered.length
    const totalDuration = filtered.reduce((acc, s) => acc + s.duration, 0)
    const avgScore = filtered.length > 0 
      ? Math.round(filtered.reduce((acc, s) => acc + s.score, 0) / filtered.length)
      : 0
    const completedSessions = filtered.filter(s => s.status === 'done').length
    const totalDistractions = filtered.reduce((acc, s) => acc + s.distractions, 0)

    res.json({
      period,
      totalSessions,
      completedSessions,
      totalDuration,
      avgScore,
      totalDistractions,
      sessions: filtered
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

    const created = await db.bulkCreateSessions(sessionsToCreate)

    res.status(201).json({
      success: true,
      count: created.length,
      sessions: created
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}
