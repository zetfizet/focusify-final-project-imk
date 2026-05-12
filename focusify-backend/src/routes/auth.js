import express from 'express'
import { register, login, logout, verifyAuth, refreshAccessToken } from '../controllers/authController.js'
import authenticate from '../middleware/auth.js'

const router = express.Router()

// Public routes
router.post('/register', register)
router.post('/login', login)
router.post('/refresh-token', refreshAccessToken)

// Protected routes
router.post('/logout', authenticate, logout)
router.post('/verify', authenticate, verifyAuth)

export default router
