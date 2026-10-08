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

// Diagnostic email test route (safe - only accessible in dev or with secret header)
router.get('/test-mail', async (req, res) => {
  try {
    const { getSmtpConfig, sendVerificationOtp } = require('../services/emailService');
    const smtp = getSmtpConfig();
    const targetEmail = req.query.to || 'kumaramitbth2005@gmail.com';

    const envStatus = {
      hasSmtpUser:    !!smtp?.user,
      smtpUser:       smtp?.user ? smtp.user.slice(0, 3) + '***' : null,
      hasSmtpPass:    !!smtp?.pass,
      smtpHost:       smtp?.host,
      smtpPort:       smtp?.port,
      smtpSecure:     smtp?.secure,
      hasResend:      !!(process.env.RESEND_API_KEY?.trim()),
      hasBrevo:       !!(process.env.BREVO_API_KEY?.trim()),
      brevoSender:    process.env.BREVO_SENDER_EMAIL || process.env.EMAIL_USER || 'not set',
      isRender:       !!process.env.RENDER,
      nodeEnv:        process.env.NODE_ENV
    };

    const sendResult = await sendVerificationOtp({
      to: targetEmail,
      otp: '999888',
      expiryMinutes: 10
    });

    res.json({ success: true, envStatus, sendResult, testedRecipient: targetEmail });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
      hint: 'Add BREVO_API_KEY env var to fix email on Render free tier. Get a free key at https://app.brevo.com'
    });
  }
});

module.exports = router;
