const express = require('express');
const { 
  getSettings, 
  updateSettings, 
  updateTheme, 
  updateLanguage, 
  updateNotifications, 
  updatePrivacy, 
  updateAccessibility,
  getAboutInfo 
} = require('../controllers/settingsController');
const { protect, optionalProtect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getSettings);
router.put('/', protect, updateSettings);
router.patch('/', protect, updateSettings);
router.patch('/theme', protect, updateTheme);
router.patch('/language', protect, updateLanguage);
router.patch('/notifications', protect, updateNotifications);
router.patch('/privacy', protect, updatePrivacy);
router.patch('/accessibility', protect, updateAccessibility);
router.get('/about', optionalProtect, getAboutInfo);

module.exports = router;
