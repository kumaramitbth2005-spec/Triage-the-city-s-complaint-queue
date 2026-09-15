const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { 
    type: String, 
    enum: ['NEW_COMPLAINT', 'HIGH_URGENCY', 'DUPLICATE_FOUND', 'EMERGING_CLUSTER', 'LOW_AI_CONFIDENCE', 'WEEKLY_REPORT', 'SYSTEM'] 
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  
  // Optional References
  complaintId: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint' },
  clusterId: { type: mongoose.Schema.Types.ObjectId, ref: 'DuplicateCluster' },
  reportId: { type: String }, // If report generation exists
  route: { type: String } // Frontend route link
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
