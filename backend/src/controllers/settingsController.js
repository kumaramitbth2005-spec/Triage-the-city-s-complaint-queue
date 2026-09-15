const User = require('../models/User');
const Activity = require('../models/Activity');

// GET /api/settings
exports.getSettings = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash').lean();
    res.json({ success: true, data: {
      language: user.language || 'English',
      theme: user.theme || 'light',
      notificationPreferences: user.notificationPreferences || {},
      searchPreferences: user.searchPreferences || {},
      accessibilityPreferences: user.accessibilityPreferences || {}
    }});
  } catch (err) {
    next(err);
  }
};

// PATCH /api/settings
exports.updateSettings = async (req, res, next) => {
  try {
    const allowed = ['language', 'theme', 'notificationPreferences', 'searchPreferences', 'accessibilityPreferences'];
    const updates = {};
    allowed.forEach(key => { if (req.body[key] !== undefined) updates[key] = req.body[key]; });

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-passwordHash');
    await Activity.create({ userId: req.user._id, action: 'SETTINGS_UPDATED', details: updates });

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};
