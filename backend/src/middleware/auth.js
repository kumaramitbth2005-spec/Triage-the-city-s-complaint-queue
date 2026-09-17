const jwt = require('jsonwebtoken');
const User = require('../models/User');

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
    req.user = await User.findById(decoded.id).select('-passwordHash');
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
      req.user = await User.findById(decoded.id).select('-passwordHash');
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
