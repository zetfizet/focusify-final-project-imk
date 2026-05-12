import express from 'express'
import {
  getUserProfile,
  updateUserProfile,
  getUserSettings,
  updateUserSettings,
  deleteAccount
} from '../controllers/userController.js'
import authenticate from '../middleware/auth.js'

const router = express.Router()

// All routes require authentication
router.use(authenticate)

// GET routes
router.get('/profile', getUserProfile)
router.get('/settings', getUserSettings)

// PUT routes
router.put('/profile', updateUserProfile)
router.put('/settings', updateUserSettings)

// DELETE routes
router.delete('/account', deleteAccount)

export default router
