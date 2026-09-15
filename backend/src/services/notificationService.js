const Notification = require('../models/Notification');

/**
 * Create a new notification for a user.
 */
async function createNotification({ userId, type, title, message, route, complaintId, clusterId }) {
  try {
    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      route,
      complaintId,
      clusterId
    });
    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error.message);
    return null;
  }
}

module.exports = { createNotification };
