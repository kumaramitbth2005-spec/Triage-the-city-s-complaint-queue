const express = require('express');
const rateLimit = require('express-rate-limit');
const { 
  register, 
  login, 
  logout, 
  refresh, 
  getMe, 
  changePassword, 
  verifyEmail, 
  resendVerification,
  sendVerificationCode 
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Strict rate limiter for auth-sensitive endpoints (max 15 requests per 15 minutes per IP)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: { 
    success: false, 
    error: { code: 'RATE_LIMIT', message: 'Too many authentication requests. Please try again later.' } 
  }
});

// Resend limiter (max 6 requests per 15 minutes per IP)
const resendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 6,
  message: { 
    success: false, 
    error: { code: 'RATE_LIMIT', message: 'Too many verification requests. Please wait a few minutes before trying again.' } 
  }
});

// Verification limiter for brute-force defense (max 15 attempts per 15 minutes per IP)
const verifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: { 
    success: false, 
    error: { code: 'RATE_LIMIT', message: 'Too many verification attempts. Please wait 15 minutes.' } 
  }
});

// Auth Routes
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/send-verification-code', resendLimiter, sendVerificationCode);
router.post('/verify-email', verifyLimiter, verifyEmail);
router.post('/resend-verification-code', resendLimiter, resendVerification);
router.post('/resend-verification', resendLimiter, resendVerification);
router.post('/logout', logout);
router.post('/refresh', refresh);
router.get('/me', protect, getMe);
router.post('/change-password', protect, changePassword);

module.exports = router;
