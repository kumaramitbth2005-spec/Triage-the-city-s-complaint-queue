const express = require('express');
const { getActivities, clearActivities } = require('../controllers/activityController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getActivities);
router.delete('/', protect, clearActivities);

module.exports = router;
