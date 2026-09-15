const jwt = require('jsonwebtoken');
const User = require('../models/User');

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
  } catch (error) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Token is invalid or expired' } });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'User role is not authorized' } });
    }
    next();
  };
};

module.exports = { protect, authorize };
