const User = require('../models/User');
const Activity = require('../models/Activity');

// GET /api/profile
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash').lean();
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const allowed = ['name', 'avatar', 'zone', 'department'];
    const updates = {};
    allowed.forEach(key => { if (req.body[key] !== undefined) updates[key] = req.body[key]; });

    // Email update with uniqueness check
    if (req.body.email && req.body.email !== req.user.email) {
      const existing = await User.findOne({ email: req.body.email });
      if (existing) {
        return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Email already in use' } });
      }
      updates.email = req.body.email;
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-passwordHash');
    await Activity.create({ userId: req.user._id, action: 'PROFILE_UPDATED', details: Object.keys(updates) });

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};
