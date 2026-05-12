import jwt from 'jsonwebtoken'

export const generateToken = (userId, type = 'access') => {
  const secret = process.env.JWT_SECRET
  const expiry = type === 'access' ? process.env.JWT_EXPIRY : process.env.REFRESH_TOKEN_EXPIRY

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
