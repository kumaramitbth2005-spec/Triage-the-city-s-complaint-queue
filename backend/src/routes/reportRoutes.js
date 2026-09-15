const express = require('express');
const { getWeeklyReport } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/weekly', protect, getWeeklyReport);
router.get('/weekly/:department', protect, getWeeklyReport);

module.exports = router;
