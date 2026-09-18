const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  bio: { type: String },
  passwordHash: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['citizen', 'operator', 'zone_head', 'department_lead', 'field_team', 'admin'],
    default: 'citizen'
  },
  zone: { type: String },
  department: { type: String },
  avatar: { type: String },
  language: { type: String, default: 'English' },
  theme: { type: String, default: 'light' },
  notificationPreferences: { type: Object, default: {} },
  searchPreferences: { type: Object, default: {} },
  accessibilityPreferences: { type: Object, default: {} },
  location: {
    latitude: { type: Number },
    longitude: { type: Number },
    accuracy: { type: Number },
    updatedAt: { type: Date }
  },
  lastLogin: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
