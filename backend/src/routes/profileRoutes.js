const express = require('express');
const { getProfile, updateProfile, updateLocation } = require('../controllers/profileController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getProfile);
router.put('/', protect, updateProfile);
router.patch('/', protect, updateProfile);
router.patch('/location', protect, updateLocation);

module.exports = router;
