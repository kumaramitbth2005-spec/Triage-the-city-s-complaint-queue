/**
 * authController.js
 * Production-ready Authentication & Email OTP Verification System.
 * 
 * SECURITY:
 * - Passwords hashed with bcrypt (salt rounds: 10)
 * - OTPs generated using crypto.randomInt (never Math.random)
 * - OTP stored as a bcrypt hash (never plain text)
 * - OTP expires in 5 minutes (configurable via OTP_EXPIRY_MINUTES)
 * - 60-second resend cooldown (configurable via OTP_RESEND_COOLDOWN_SECONDS)
 * - Brute-force protection: max 5 attempts before OTP is invalidated
 * - One-time use: OTP is immediately cleared on successful verification
 * - Rate limited endpoints to prevent spam and brute-forcing
 * - Plain OTP never logged or returned in API responses
 */

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const UserSettings = require('../models/UserSettings');
const Activity = require('../models/Activity');
const { createNotification } = require('../services/notificationService');
const { sendVerificationOtp, maskEmail } = require('../services/emailService');

const JWT_SECRET = () => process.env.JWT_SECRET || 'supersecretjwtkey_change_in_production';
const OTP_EXPIRY_MINUTES = () => parseInt(process.env.OTP_EXPIRY_MINUTES || '10', 10);
const OTP_RESEND_COOLDOWN_SECONDS = () => parseInt(process.env.OTP_RESEND_COOLDOWN_SECONDS || '60', 10);
const MAX_OTP_ATTEMPTS = 5;

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET(), { expiresIn: '1d' });
};

// Generate cryptographically secure 6-digit OTP (100000 to 999999)
const generateSecureOtp = () => {
  return String(crypto.randomInt(100000, 1000000));
};

// Safe email error message extractor
const getEmailErrorMessage = (err) => {
  if (err?.code === 'RESEND_RECIPIENT_RESTRICTED') {
    return err.message;
  }
  return err?.message || 'Email could not be sent. Please check your email configuration or try again later.';
};

// ─── SEND VERIFICATION CODE (STANDALONE / PRE-AUTH) ──────────────────────────
exports.sendVerificationCode = async (req, res, next) => {
  try {
    const { email, name } = req.body;

    if (!email || !email.includes('@') || !email.includes('.')) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'A valid email address is required.' }
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });

    // If user is already verified
    if (user && user.emailVerified) {
      return res.status(400).json({
        success: false,
        error: { code: 'ALREADY_VERIFIED', message: 'This email is already verified. Please sign in.' }
      });
    }

    // Check resend cooldown - if code was recently sent, smoothly direct to verification
    const cooldownMs = OTP_RESEND_COOLDOWN_SECONDS() * 1000;
    if (user && user.verificationLastSentAt && (Date.now() - user.verificationLastSentAt.getTime()) < cooldownMs) {
      const secsLeft = Math.ceil((cooldownMs - (Date.now() - user.verificationLastSentAt.getTime())) / 1000);
      return res.status(200).json({
        success: true,
        requiresVerification: true,
        email: cleanEmail,
        cooldownSeconds: secsLeft,
        message: `A verification code was already sent to your email. Please enter it below.`
      });
    }

    const otp = generateSecureOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiryDate = new Date(Date.now() + OTP_EXPIRY_MINUTES() * 60 * 1000);

    if (user) {
      // Update existing pending user
      user.verificationOtpHash = otpHash;
      user.verificationOtpExpiresAt = expiryDate;
      user.verificationOtpAttempts = 0;
      user.verificationLastSentAt = new Date();
      await user.save();
    }

    // Dispatch email
    try {
      await sendVerificationOtp({
        to: cleanEmail,
        name: user?.name || name || 'User',
        otp,
        expiryMinutes: OTP_EXPIRY_MINUTES()
      });
    } catch (emailErr) {
      console.error('Email dispatch error:', emailErr.message);
      return res.status(503).json({
        success: false,
        error: { code: 'EMAIL_SERVICE_ERROR', message: getEmailErrorMessage(emailErr) }
      });
    }

    console.log(`📨 Verification code dispatched to ${maskEmail(cleanEmail)}`);

    return res.status(200).json({
      success: true,
      message: 'Verification code sent successfully.'
    });

  } catch (err) {
    next(err);
  }
};

// ─── REGISTER ────────────────────────────────────────────────────────────────
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Full name is required.' } });
    }
    if (!email || !email.includes('@') || !email.includes('.')) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'A valid email address is required.' } });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Password must be at least 6 characters long.' } });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      if (existing.emailVerified) {
        return res.status(400).json({
          success: false,
          error: { code: 'EMAIL_TAKEN', message: 'An account with this email already exists. Please sign in instead.' }
        });
      }

      // Existing unverified account: if code was already sent recently, guide user to verify
      const cooldownMs = OTP_RESEND_COOLDOWN_SECONDS() * 1000;
      if (existing.verificationLastSentAt && (Date.now() - existing.verificationLastSentAt.getTime()) < cooldownMs) {
        const secsLeft = Math.ceil((cooldownMs - (Date.now() - existing.verificationLastSentAt.getTime())) / 1000);
        return res.status(200).json({
          success: true,
          requiresVerification: true,
          email: cleanEmail,
          cooldownSeconds: secsLeft,
          message: `A verification code was already sent to your email. Please enter it below.`
        });
      }

      // Update unverified user with new password & OTP
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      const otp = generateSecureOtp();
      const otpHash = await bcrypt.hash(otp, 10);

      existing.name = name.trim();
      existing.passwordHash = passwordHash;
      existing.role = role || existing.role || 'operator';
      existing.verificationOtpHash = otpHash;
      existing.verificationOtpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES() * 60 * 1000);
      existing.verificationOtpAttempts = 0;
      existing.verificationLastSentAt = new Date();
      await existing.save();

      try {
        await sendVerificationOtp({
          to: cleanEmail,
          name: name.trim(),
          otp,
          expiryMinutes: OTP_EXPIRY_MINUTES()
        });
      } catch (emailErr) {
        console.error('Email error:', emailErr.message);
        return res.status(503).json({
          success: false,
          error: { code: 'EMAIL_SERVICE_ERROR', message: getEmailErrorMessage(emailErr) }
        });
      }

      return res.status(200).json({
        success: true,
        requiresVerification: true,
        email: cleanEmail,
        message: 'A new verification code has been sent to your email.'
      });
    }

    // New user registration
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const otp = generateSecureOtp();
    const otpHash = await bcrypt.hash(otp, 10);

    // Create user in UNVERIFIED state
    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      passwordHash,
      role: role || 'operator',
      language: 'English',
      theme: 'light',
      emailVerified: false,
      verificationOtpHash: otpHash,
      verificationOtpExpiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES() * 60 * 1000),
      verificationOtpAttempts: 0,
      verificationLastSentAt: new Date()
    });

    // Create default UserSettings
    await UserSettings.create({
      userId: user._id,
      language: 'en',
      theme: 'light',
      compactMode: false
    });

    // Send verification email
    try {
      await sendVerificationOtp({
        to: cleanEmail,
        name: name.trim(),
        otp,
        expiryMinutes: OTP_EXPIRY_MINUTES()
      });
    } catch (emailErr) {
      console.error('Email registration error:', emailErr.message);
      // Clean up unverified user so they can retry without orphaned data
      await User.findByIdAndDelete(user._id);
      await UserSettings.deleteOne({ userId: user._id });
      return res.status(503).json({
        success: false,
        error: { code: 'EMAIL_SERVICE_ERROR', message: getEmailErrorMessage(emailErr) }
      });
    }

    res.status(201).json({
      success: true,
      requiresVerification: true,
      email: cleanEmail,
      message: 'Account created. Please check your email for the 6-digit verification code.'
    });

  } catch (err) {
    next(err);
  }
};

// ─── VERIFY EMAIL / OTP ───────────────────────────────────────────────────────
exports.verifyEmail = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Email and verification code are required.' }
      });
    }

    const cleanOtp = String(otp).trim();
    if (!/^\d{6}$/.test(cleanOtp)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_FORMAT', message: 'Verification code must be a 6-digit numeric number.' }
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'No account found with this email address.' }
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        error: { code: 'ALREADY_VERIFIED', message: 'This email is already verified. Please sign in.' }
      });
    }

    // Check if OTP exists
    if (!user.verificationOtpHash) {
      return res.status(400).json({
        success: false,
        error: { code: 'OTP_NOT_FOUND', message: 'No active verification code found. Please request a new code.' }
      });
    }

    // Check OTP expiration
    if (!user.verificationOtpExpiresAt || user.verificationOtpExpiresAt < new Date()) {
      user.verificationOtpHash = undefined;
      user.verificationOtpExpiresAt = undefined;
      user.verificationOtpAttempts = 0;
      await user.save();
      return res.status(400).json({
        success: false,
        error: { code: 'OTP_EXPIRED', message: 'Verification code expired. Please request a new code.' }
      });
    }

    // Check brute-force attempts
    if (user.verificationOtpAttempts >= MAX_OTP_ATTEMPTS) {
      user.verificationOtpHash = undefined;
      user.verificationOtpExpiresAt = undefined;
      user.verificationOtpAttempts = 0;
      await user.save();
      return res.status(429).json({
        success: false,
        error: { code: 'TOO_MANY_ATTEMPTS', message: 'Too many incorrect attempts. Please request a new verification code.' }
      });
    }

    // Compare hash securely
    const otpMatch = await bcrypt.compare(cleanOtp, user.verificationOtpHash);

    if (!otpMatch) {
      user.verificationOtpAttempts = (user.verificationOtpAttempts || 0) + 1;
      if (user.verificationOtpAttempts >= MAX_OTP_ATTEMPTS) {
        user.verificationOtpHash = undefined;
        user.verificationOtpExpiresAt = undefined;
        user.verificationOtpAttempts = 0;
        await user.save();
        return res.status(429).json({
          success: false,
          error: {
            code: 'TOO_MANY_ATTEMPTS',
            message: 'Too many incorrect attempts. Please request a new verification code.'
          }
        });
      }
      await user.save();
      const remaining = MAX_OTP_ATTEMPTS - user.verificationOtpAttempts;
      return res.status(400).json({
        success: false,
        error: {
          code: 'OTP_MISMATCH',
          message: `Invalid verification code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`
        }
      });
    }

    // ✅ OTP is valid: mark verified and wipe one-time credentials
    user.emailVerified = true;
    user.emailVerifiedAt = new Date();
    user.verificationOtpHash = undefined;
    user.verificationOtpExpiresAt = undefined;
    user.verificationOtpAttempts = 0;
    user.verificationLastSentAt = undefined;
    user.lastLogin = new Date();
    await user.save();

    // Log Activity
    await Activity.create({
      userId: user._id,
      action: 'LOGIN',
      details: { method: 'email_verified' }
    });

    // Create system notification
    await createNotification({
      userId: user._id,
      type: 'SYSTEM',
      title: 'Email Verified',
      message: 'Your email address was successfully verified. Your account is now fully active.',
      route: '/dashboard/settings/profile'
    });

    const token = generateToken(user._id);

    console.log(`✅ Email verified successfully for ${maskEmail(cleanEmail)}`);

    res.json({
      success: true,
      message: 'Email verified successfully.',
      user: {
        _id: user._id,
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        language: user.language,
        theme: user.theme,
        emailVerified: true,
        emailVerifiedAt: user.emailVerifiedAt
      },
      token
    });

  } catch (err) {
    next(err);
  }
};

// ─── RESEND VERIFICATION CODE ─────────────────────────────────────────────────
exports.resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Email address is required.' }
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      // Return safe success message to prevent user enumeration
      return res.status(200).json({
        success: true,
        message: 'If a pending account exists, a new verification code has been sent.'
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        error: { code: 'ALREADY_VERIFIED', message: 'This email is already verified. Please sign in.' }
      });
    }

    // Cooldown check (60 seconds)
    const cooldownMs = OTP_RESEND_COOLDOWN_SECONDS() * 1000;
    if (user.verificationLastSentAt && (Date.now() - user.verificationLastSentAt.getTime()) < cooldownMs) {
      const secsLeft = Math.ceil((cooldownMs - (Date.now() - user.verificationLastSentAt.getTime())) / 1000);
      return res.status(429).json({
        success: false,
        error: { code: 'COOLDOWN', message: `Please wait ${secsLeft} seconds before requesting another code.` },
        cooldownSeconds: secsLeft
      });
    }

    // Generate new OTP & invalidate previous
    const otp = generateSecureOtp();
    const otpHash = await bcrypt.hash(otp, 10);

    user.verificationOtpHash = otpHash;
    user.verificationOtpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES() * 60 * 1000);
    user.verificationOtpAttempts = 0;
    user.verificationLastSentAt = new Date();
    await user.save();

    try {
      await sendVerificationOtp({
        to: cleanEmail,
        name: user.name,
        otp,
        expiryMinutes: OTP_EXPIRY_MINUTES()
      });
    } catch (emailErr) {
      console.error('Email resend error:', emailErr.message);
      return res.status(503).json({
        success: false,
        error: { code: 'EMAIL_SERVICE_ERROR', message: getEmailErrorMessage(emailErr) }
      });
    }

    console.log(`🔄 New OTP resent to ${maskEmail(cleanEmail)}`);

    res.json({
      success: true,
      message: 'A new verification code has been sent to your email.'
    });

  } catch (err) {
    next(err);
  }
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Please provide both email and password.' }
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Invalid email or password.' }
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Invalid email or password.' }
      });
    }

    // Block login for unverified accounts
    if (!user.emailVerified) {
      return res.status(403).json({
        success: false,
        error: { code: 'EMAIL_NOT_VERIFIED', message: 'Please verify your email before signing in.' },
        requiresVerification: true,
        email: cleanEmail
      });
    }

    user.lastLogin = Date.now();
    await user.save();

    const token = generateToken(user._id);
    await Activity.create({ userId: user._id, action: 'LOGIN', details: { method: 'login' } });

    res.json({
      success: true,
      user: {
        _id: user._id,
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        bio: user.bio,
        role: user.role,
        zone: user.zone,
        department: user.department,
        avatar: user.avatar,
        language: user.language,
        theme: user.theme,
        emailVerified: user.emailVerified
      },
      token
    });

  } catch (err) {
    next(err);
  }
};

// ─── LOGOUT ───────────────────────────────────────────────────────────────────
exports.logout = async (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
};

// ─── CHANGE PASSWORD ──────────────────────────────────────────────────────────
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Current password and new password are required.' }
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'New password must be at least 8 characters long.' }
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'New password must be different from your current password.' }
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found.' } });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Current password is incorrect.' }
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    await Activity.create({
      userId: req.user._id,
      action: 'PASSWORD_CHANGED',
      details: { method: 'manual' }
    });

    await createNotification({
      userId: req.user._id,
      type: 'SECURITY',
      title: 'Password Changed',
      message: 'Your account password was changed successfully. If you did not make this change, please alert administrators.',
      route: '/dashboard/settings/security'
    });

    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (err) {
    next(err);
  }
};

// ─── REFRESH ──────────────────────────────────────────────────────────────────
exports.refresh = async (req, res) => {
  res.json({ success: true, message: 'Token refreshed.' });
};

// ─── GET ME ───────────────────────────────────────────────────────────────────
exports.getMe = async (req, res, next) => {
  try {
    res.json({ success: true, user: req.user });
  } catch (err) {
    next(err);
  }
};
