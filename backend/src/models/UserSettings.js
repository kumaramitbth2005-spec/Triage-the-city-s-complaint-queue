const mongoose = require('mongoose');

const userSettingsSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    unique: true 
  },
  theme: { 
    type: String, 
    enum: ['light', 'dark', 'system'], 
    default: 'light' 
  },
  language: { 
    type: String, 
    enum: ['en', 'hi', 'hinglish'], 
    default: 'en' 
  },
  compactMode: { 
    type: Boolean, 
    default: false 
  },
  general: {
    defaultView: { type: String, default: 'Dashboard' },
    itemsPerPage: { type: Number, default: 25 },
    autoRefresh: { type: Boolean, default: true },
    autoSave: { type: Boolean, default: true }
  },
  notifications: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    security: { type: Boolean, default: true },
    productUpdates: { type: Boolean, default: false },
    activity: { type: Boolean, default: true },
    complaint: { type: Boolean, default: true },
    system: { type: Boolean, default: true }
  },
  privacy: {
    profileVisibility: { type: String, default: 'Internal Only' },
    activityHistory: { type: Boolean, default: true },
    dataCollection: { type: Boolean, default: true },
    personalization: { type: Boolean, default: true }
  },
  accessibility: {
    textSize: { type: String, default: 'md' },
    reduceMotion: { type: Boolean, default: false },
    highContrast: { type: Boolean, default: false },
    focusIndicators: { type: Boolean, default: true }
  }
}, { timestamps: true });

module.exports = mongoose.model('UserSettings', userSettingsSchema);
