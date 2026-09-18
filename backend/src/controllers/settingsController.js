const UserSettings = require('../models/UserSettings');
const User = require('../models/User');
const Activity = require('../models/Activity');

// Helper to get or create UserSettings
async function getOrCreateSettings(userId) {
  let settings = await UserSettings.findOne({ userId });
  if (!settings) {
    settings = await UserSettings.create({ userId });
  }
  return settings;
}

// GET /api/settings
exports.getSettings = async (req, res, next) => {
  try {
    const settings = await getOrCreateSettings(req.user._id);
    res.json({
      success: true,
      data: settings
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/settings & PATCH /api/settings
exports.updateSettings = async (req, res, next) => {
  try {
    const allowed = ['theme', 'language', 'compactMode', 'general', 'notifications', 'privacy', 'accessibility'];
    const updates = {};
    allowed.forEach(key => {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    });

    let settings = await UserSettings.findOneAndUpdate(
      { userId: req.user._id },
      { $set: updates },
      { new: true, upsert: true }
    );

    // Sync theme and language to user model as well
    const userUpdates = {};
    if (updates.theme) userUpdates.theme = updates.theme;
    if (updates.language) userUpdates.language = updates.language;
    if (Object.keys(userUpdates).length > 0) {
      await User.findByIdAndUpdate(req.user._id, userUpdates);
    }

    // Check privacy setting before creating activity log
    if (settings.privacy?.activityHistory !== false) {
      await Activity.create({
        userId: req.user._id,
        action: 'SETTINGS_UPDATED',
        details: Object.keys(updates)
      });
    }

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: settings
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/settings/theme
exports.updateTheme = async (req, res, next) => {
  try {
    const { theme } = req.body;
    if (!['light', 'dark', 'system'].includes(theme)) {
      return res.status(400).json({ success: false, message: 'Invalid theme value' });
    }

    const settings = await UserSettings.findOneAndUpdate(
      { userId: req.user._id },
      { $set: { theme } },
      { new: true, upsert: true }
    );

    await User.findByIdAndUpdate(req.user._id, { theme });

    if (settings.privacy?.activityHistory !== false) {
      await Activity.create({ userId: req.user._id, action: 'THEME_CHANGED', details: { theme } });
    }

    res.json({ success: true, message: 'Theme updated successfully', data: { theme: settings.theme } });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/settings/language
exports.updateLanguage = async (req, res, next) => {
  try {
    const { language } = req.body;
    const settings = await UserSettings.findOneAndUpdate(
      { userId: req.user._id },
      { $set: { language } },
      { new: true, upsert: true }
    );

    await User.findByIdAndUpdate(req.user._id, { language });

    if (settings.privacy?.activityHistory !== false) {
      await Activity.create({ userId: req.user._id, action: 'LANGUAGE_CHANGED', details: { language } });
    }

    res.json({ success: true, message: 'Language updated successfully', data: { language: settings.language } });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/settings/notifications
exports.updateNotifications = async (req, res, next) => {
  try {
    const notifications = req.body;
    const settings = await UserSettings.findOneAndUpdate(
      { userId: req.user._id },
      { $set: { notifications } },
      { new: true, upsert: true }
    );

    res.json({ success: true, message: 'Notification preferences updated', data: settings.notifications });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/settings/privacy
exports.updatePrivacy = async (req, res, next) => {
  try {
    const privacy = req.body;
    const settings = await UserSettings.findOneAndUpdate(
      { userId: req.user._id },
      { $set: { privacy } },
      { new: true, upsert: true }
    );

    res.json({ success: true, message: 'Privacy preferences updated', data: settings.privacy });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/settings/accessibility
exports.updateAccessibility = async (req, res, next) => {
  try {
    const accessibility = req.body;
    const settings = await UserSettings.findOneAndUpdate(
      { userId: req.user._id },
      { $set: { accessibility } },
      { new: true, upsert: true }
    );

    res.json({ success: true, message: 'Accessibility preferences updated', data: settings.accessibility });
  } catch (err) {
    next(err);
  }
};

// GET /api/about
exports.getAboutInfo = (req, res) => {
  res.json({
    success: true,
    data: {
      name: 'City Complaint Triage & Resolution Platform',
      version: '1.2.0',
      description: 'An AI-powered civic governance and complaint intake system for municipal corporations.',
      copyright: '© 2026 Municipal Administration. All rights reserved.',
      supportEmail: 'support@municipal.gov',
      termsUrl: '/terms',
      privacyPolicyUrl: '/privacy'
    }
  });
};
