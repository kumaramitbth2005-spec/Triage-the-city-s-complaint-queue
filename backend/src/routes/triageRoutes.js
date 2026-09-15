const express = require('express');
const { getTriageQueue } = require('../controllers/complaintController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getTriageQueue);
router.get('/pending', protect, getTriageQueue);

module.exports = router;
