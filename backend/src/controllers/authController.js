const User = require('../models/User');
const Activity = require('../models/Activity');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretjwtkey_change_in_production', { expiresIn: '1d' });
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Email already exists' } });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name, email, passwordHash, role
    });

    const token = generateToken(user._id);
    
    // Log Activity
    await Activity.create({ userId: user._id, action: 'LOGIN', details: { method: 'register' } });

    res.status(201).json({
      success: true,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Please provide an email and password' } });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid credentials' } });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid credentials' } });
    }

    user.lastLogin = Date.now();
    await user.save();

    const token = generateToken(user._id);
    
    await Activity.create({ userId: user._id, action: 'LOGIN', details: { method: 'login' } });

    res.json({
      success: true,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
      token
    });
  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res, next) => {
  res.json({ success: true, message: 'Logged out successfully' });
};

exports.refresh = async (req, res, next) => {
  // In a real app, verify refresh token and issue new JWT
  res.json({ success: true, message: 'Token refreshed (mocked)' });
};

exports.getMe = async (req, res, next) => {
  try {
    res.json({
      success: true,
      user: req.user
    });
  } catch (err) {
    next(err);
  }
};
