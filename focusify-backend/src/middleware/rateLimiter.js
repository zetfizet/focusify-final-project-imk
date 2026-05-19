import rateLimit from 'express-rate-limit'

// Rate limiter untuk auth endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Maximum 100 attempts
  message: 'Too many login/register attempts. Please try again after 15 minutes.',
  standardHeaders: true, // Return info in `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting in development
    return process.env.NODE_ENV === 'development'
  }
})

// General rate limiter for all API requests
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, // 1000 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false
})

export default {
  authLimiter,
  generalLimiter
}
