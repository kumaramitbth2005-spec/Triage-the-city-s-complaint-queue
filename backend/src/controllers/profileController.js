const User = require('../models/User');
const UserSettings = require('../models/UserSettings');
const Activity = require('../models/Activity');
const { createNotification } = require('../services/notificationService');

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
        error: { code: 'VALIDATION_ERROR', message: 'Phone number cannot exceed 20 characters' }
      });
    }

    if (bio && bio.length > 500) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Bio cannot exceed 500 characters' }
      });
    }

    // Avatar validation if provided
    if (avatar !== undefined && avatar !== null && avatar !== '') {
      if (typeof avatar === 'string') {
        const isDataUri = avatar.startsWith('data:image/');
        const isHttpUrl = avatar.startsWith('http://') || avatar.startsWith('https://');

        if (isDataUri) {
          // Check allowed formats
          const allowedPrefixes = [
            'data:image/jpeg;base64,',
            'data:image/jpg;base64,',
            'data:image/png;base64,',
            'data:image/webp;base64,'
          ];
          const isValidPrefix = allowedPrefixes.some(prefix => avatar.startsWith(prefix));
          if (!isValidPrefix) {
            return res.status(400).json({
              success: false,
              error: { code: 'INVALID_IMAGE_FORMAT', message: 'Profile picture must be a JPG, PNG, or WEBP image' }
            });
          }
          // Check size (approx 5MB base64 limit)
          if (avatar.length > 7 * 1024 * 1024) {
            return res.status(400).json({
              success: false,
              error: { code: 'FILE_TOO_LARGE', message: 'Profile picture size must not exceed 5MB' }
            });
          }
        } else if (!isHttpUrl) {
          return res.status(400).json({
            success: false,
            error: { code: 'INVALID_IMAGE_URL', message: 'Invalid profile image format or URL' }
          });
        }
      } else {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_AVATAR', message: 'Invalid avatar data type' }
        });
      }
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
      const isAvatarUpdate = avatar !== undefined && Object.keys(updates).length === 1;
      await Activity.create({
        userId: req.user._id,
        action: isAvatarUpdate ? 'AVATAR_UPDATED' : 'PROFILE_UPDATED',
        details: Object.keys(updates)
      });
    }

    // In-app notification for profile update
    await createNotification({
      userId: req.user._id,
      type: 'SYSTEM',
      title: 'Profile Updated',
      message: 'Your profile information has been updated successfully.',
      route: '/dashboard/settings/profile'
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/profile/avatar
exports.deleteAvatar = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: null },
      { new: true }
    ).select('-passwordHash');

    await Activity.create({
      userId: req.user._id,
      action: 'AVATAR_UPDATED',
      details: { action: 'removed' }
    });

    res.json({
      success: true,
      message: 'Profile picture removed successfully',
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
