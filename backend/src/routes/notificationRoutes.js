const express = require('express');
const { getNotifications, markRead, markAllRead, deleteNotification } = require('../controllers/notificationController');
const { protect, optionalProtect } = require('../middleware/auth');

const router = express.Router();

router.get('/', optionalProtect, getNotifications);
router.patch('/read-all', protect, markAllRead);
router.patch('/:id/read', protect, markRead);
router.delete('/:id', protect, deleteNotification);

module.exports = router;
