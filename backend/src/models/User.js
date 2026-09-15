const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['operator', 'zone_head', 'department_lead', 'field_team', 'admin'],
    default: 'operator'
  },
  zone: { type: String },
  department: { type: String },
  avatar: { type: String },
  language: { type: String, default: 'English' },
  theme: { type: String, default: 'light' },
  notificationPreferences: { type: Object, default: {} },
  searchPreferences: { type: Object, default: {} },
  accessibilityPreferences: { type: Object, default: {} },
  lastLogin: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
