import express from 'express'
import {
  getAllSessions,
  getSessionById,
  createSession,
  updateSession,
  deleteSession,
  getSessionStats,
  bulkCreateSessions
} from '../controllers/sessionController.js'
import authenticate from '../middleware/auth.js'

const router = express.Router()

// All routes require authentication
router.use(authenticate)

// GET routes
router.get('/', getAllSessions)
router.get('/stats', getSessionStats)
router.get('/:id', getSessionById)

// POST routes
router.post('/', createSession)
router.post('/bulk/create', bulkCreateSessions)

// PUT routes
router.put('/:id', updateSession)

// DELETE routes
router.delete('/:id', deleteSession)

export default router
