import rateLimit from 'express-rate-limit';

/** 20 requests per 15-minute window — for auth endpoints (login / register). */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many requests. Please try again after 15 minutes.',
  },
});

/** 100 requests per 15-minute window — general API usage. */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many requests. Please try again after 15 minutes.',
  },
});
