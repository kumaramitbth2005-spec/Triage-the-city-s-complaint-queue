const User = require('../models/User');
const UserSettings = require('../models/UserSettings');
const Activity = require('../models/Activity');

// GET /api/profile or /api/user/profile
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash').lean();
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// PUT /api/profile or PATCH /api/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, username, phone, bio, avatar, zone, department } = req.body;

    // Validation
    if (name !== undefined && (!name || !name.trim())) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Full name cannot be empty' }
      });
    }

    if (phone && phone.trim().length > 20) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Phone number is too long' }
      });
    }

    if (bio && bio.length > 500) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Bio cannot exceed 500 characters' }
      });
    }

    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (username !== undefined) updates.username = username.trim();
    if (phone !== undefined) updates.phone = phone.trim();
    if (bio !== undefined) updates.bio = bio.trim();
    if (avatar !== undefined) updates.avatar = avatar;
    if (zone !== undefined) updates.zone = zone;
    if (department !== undefined) updates.department = department;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-passwordHash');

    // Check privacy settings before logging activity
    const settings = await UserSettings.findOne({ userId: req.user._id });
    if (settings?.privacy?.activityHistory !== false) {
      await Activity.create({
        userId: req.user._id,
        action: 'PROFILE_UPDATED',
        details: Object.keys(updates)
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/profile/location
exports.updateLocation = async (req, res, next) => {
  try {
    const { latitude, longitude, accuracy } = req.body;
    if (latitude == null || longitude == null) {
      return res.status(400).json({ success: false, message: 'Latitude and longitude are required' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        location: {
          latitude: Number(latitude),
          longitude: Number(longitude),
          accuracy: accuracy ? Number(accuracy) : null,
          updatedAt: new Date()
        }
      },
      { new: true }
    ).select('-passwordHash');

    res.json({ success: true, message: 'Location updated successfully', data: { location: user.location } });
  } catch (err) {
    next(err);
  }
};
