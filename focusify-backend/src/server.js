import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { connectDB } from './config/database.js'
import authRoutes from './routes/auth.js'
import sessionRoutes from './routes/sessions.js'
import userRoutes from './routes/user.js'
import { errorHandler } from './middleware/errorHandler.js'

dotenv.config()

const app = express()

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5174',
  credentials: true
}))

// Connect to Database
await connectDB()

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/sessions', sessionRoutes)
app.use('/api/user', userRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend is running! 🚀' })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Error handling middleware
app.use(errorHandler)

// Start server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`\n✅ Focusify Backend running on http://localhost:${PORT}`)
  console.log(`📍 Frontend: ${process.env.FRONTEND_URL}`)
  console.log(`🔒 Environment: ${process.env.NODE_ENV}\n`)
})

export default app
