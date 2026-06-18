import rateLimit from 'express-rate-limit';

/**
 * General rate limiter — applies to all routes.
 * 100 requests per 15-minute window per IP.
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,  // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false,    // Disable `X-RateLimit-*` headers
  message: {
    timestamp: new Date().toISOString(),
    status: 429,
    error: 'Too Many Requests',
    message: 'You have exceeded the rate limit. Please try again later.',
  },
});

/**
 * Auth-specific rate limiter — applies to authentication endpoints.
 * 20 requests per 15-minute window per IP.
 * More restrictive to mitigate brute-force attacks.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    timestamp: new Date().toISOString(),
    status: 429,
    error: 'Too Many Requests',
    message: 'Too many authentication attempts. Please try again later.',
  },
});
