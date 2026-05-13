import jwt from 'jsonwebtoken'

export const generateToken = (userId, type = 'access') => {
  const secret = process.env.JWT_SECRET
  
  // Use hardcoded defaults if env vars not set (for reliability on Vercel)
  const expiryMap = {
    access: process.env.JWT_EXPIRY || '15m',      // 15 minutes
    refresh: process.env.REFRESH_TOKEN_EXPIRY || '7d'  // 7 days
  }
  
  const expiry = expiryMap[type] || expiryMap.access

  if (!secret) {
    throw new Error('JWT_SECRET not configured in environment variables')
  }

  return jwt.sign(
    { userId, type },
    secret,
    { expiresIn: expiry }
  )
}

export const verifyToken = (token, type = 'access') => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    if (decoded.type !== type) {
      throw new Error('Invalid token type')
    }
    return decoded
  } catch (error) {
    throw new Error(`Token verification failed: ${error.message}`)
  }
}

export const generateTokens = (userId) => {
  const accessToken = generateToken(userId, 'access')
  const refreshToken = generateToken(userId, 'refresh')
  return { accessToken, refreshToken }
}
