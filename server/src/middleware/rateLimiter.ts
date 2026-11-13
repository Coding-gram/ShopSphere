import rateLimit from 'express-rate-limit';

const isTest = process.env.NODE_ENV === 'test';

/** 20 requests per 15-minute window — for auth endpoints (login / register). */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: isTest ? 10000 : 20,
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
  limit: isTest ? 10000 : 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many requests. Please try again after 15 minutes.',
  },
});

/** Limits customer checkout and payment mutations without weakening test isolation. */
export const transactionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: isTest ? 10000 : 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many checkout or payment attempts. Please try again later.',
  },
});
