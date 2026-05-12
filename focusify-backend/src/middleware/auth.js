import { verifyToken } from '../utils/jwt.js'

export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const token = authHeader.substring(7) // Remove "Bearer " prefix

    const decoded = verifyToken(token, 'access')
    req.userId = decoded.userId
    req.user = decoded

    next()
  } catch (error) {
    return res.status(401).json({ error: error.message })
  }
}

export default authenticate
