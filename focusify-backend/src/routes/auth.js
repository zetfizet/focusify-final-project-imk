import express from 'express'
import { register, login, logout, verifyAuth, refreshAccessToken } from '../controllers/authController.js'
import authenticate from '../middleware/auth.js'
import { authLimiter } from '../middleware/rateLimiter.js'

const router = express.Router()

// Public routes (with rate limiting for brute force protection)
router.post('/register', authLimiter, register)
router.post('/login', authLimiter, login)
router.post('/refresh-token', refreshAccessToken)

// Protected routes
router.post('/logout', authenticate, logout)
router.post('/verify', authenticate, verifyAuth)

export default router
