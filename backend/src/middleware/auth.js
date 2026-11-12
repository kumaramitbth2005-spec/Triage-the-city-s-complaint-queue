const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const resilientStore = require('../services/resilientStore');

const findUserById = async (id) => {
  if (mongoose.connection.readyState === 1) {
    try {
      const u = await User.findById(id).select('-passwordHash -verificationOtpHash');
      if (u) return u;
    } catch (e) {}
  }
  return resilientStore.findUser({ _id: id });
};

/**
 * Strict protect: requires a valid JWT token.
 * Returns 401 if no token or invalid token.
 */
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authorized to access this route' } });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey_change_in_production');
    const user = await findUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'User account not found' } });
    }
    req.user = user;
    next();
  } catch (_error) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Token is invalid or expired' } });
  }
};

/**
 * Optional protect: attaches user if valid JWT present, but allows anonymous access.
 * Use for read endpoints that should work without login.
 */
const optionalProtect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey_change_in_production');
      req.user = await findUserById(decoded.id);
    } catch (_error) {
      // Invalid token — continue as anonymous
    }
  }
  next();
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'User role is not authorized' } });
    }
    next();
  };
};

module.exports = { protect, optionalProtect, authorize };
