// src/middleware/rateLimiter.ts
import rateLimit from 'express-rate-limit';

/**
 * Rate limiter for general requests
 * Limits to 100 requests per hour
 */

export const generalLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100,
  message: {
    status: 429,
    error: 'For mange forespørgsler – prøv igen senere.'
  }
});

/**
 * Rate limiter for login requests
 * Limits to 5 requests per 15 minutes
 */

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    status: 429,
    error: 'For mange loginforsøg – prøv igen om lidt.'
  }
});
