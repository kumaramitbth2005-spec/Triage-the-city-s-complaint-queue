const express = require('express');
const { getProfile, updateProfile } = require('../controllers/profileController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getProfile);
router.patch('/', protect, updateProfile);

module.exports = router;
