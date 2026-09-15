const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { 
    type: String, 
    enum: [
      'LOGIN', 'COMPLAINT_VIEWED', 'COMPLAINT_CREATED', 
      'TRIAGE_CONFIRMED', 'TRIAGE_EDITED', 'DUPLICATE_REVIEWED', 
      'CLUSTER_VIEWED', 'REPORT_VIEWED', 'SETTINGS_UPDATED', 'PROFILE_UPDATED'
    ],
    required: true
  },
  details: { type: mongoose.Schema.Types.Mixed },
  entityId: { type: mongoose.Schema.Types.ObjectId }
}, { timestamps: true });

activitySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema);
