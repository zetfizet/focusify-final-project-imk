import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { connectDB } from './config/database.js'
import { generalLimiter } from './middleware/rateLimiter.js'
import authRoutes from './routes/auth.js'
import sessionRoutes from './routes/sessions.js'
import userRoutes from './routes/user.js'
import { errorHandler } from './middleware/errorHandler.js'

// Get directory path for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../.env') })

const app = express()

// Trust proxy (for Vercel and production environments behind proxy)
app.set('trust proxy', 1)

// Security Middleware
app.use(helmet()) // Set security HTTP headers
app.use(generalLimiter) // General rate limiting

// Middleware
app.use(express.json({ limit: '10kb' })) // Limit request size
app.use(express.urlencoded({ extended: true, limit: '10kb' }))
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5174',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

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

  // Connect to Database after server starts
  connectDB().catch((err) => {
    console.error('Failed to connect to database:', err.message)
  })
})

export default app

