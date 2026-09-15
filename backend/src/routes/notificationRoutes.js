const express = require('express');
const { getNotifications, markRead, markAllRead, deleteNotification } = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getNotifications);
router.patch('/read-all', protect, markAllRead);
router.patch('/:id/read', protect, markRead);
router.delete('/:id', protect, deleteNotification);

module.exports = router;
