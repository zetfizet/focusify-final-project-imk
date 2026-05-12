export const errorHandler = (error, req, res, next) => {
  console.error(`❌ Error: ${error.message}`)

  // Mongoose validation error
  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map(err => err.message)
    return res.status(400).json({ error: 'Validation error', details: messages })
  }

  // Mongoose duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0]
    return res.status(400).json({ error: `${field} already exists` })
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid token' })
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expired' })
  }

  // Default error
  const status = error.status || 500
  const message = error.message || 'Internal server error'

  res.status(status).json({
    error: message,
    status: status
  })
}

export default errorHandler
