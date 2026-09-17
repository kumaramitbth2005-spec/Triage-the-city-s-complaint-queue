const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  complaintId: { type: String, required: true, unique: true },
  originalText: { type: String },
  normalizedText: { type: String },
  
  inputMethod: { 
    type: String, 
    enum: ['text', 'voice', 'photo', 'text_voice', 'text_photo', 'voice_photo'],
    default: 'text'
  },
  
  originalLanguage: { type: String },
  detectedLanguage: { type: String },
  
  voiceTranscript: { type: String },
  audioUrl: { type: String },
  attachments: [{ type: String }],
  
  issue: { type: String },
  category: { type: String },
  department: { type: String },
  
  urgency: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
  urgencyScore: { type: Number },
  
  location: {
    addressText: String,
    locality: String,
    ward: String,
    city: String,
    latitude: Number,
    longitude: Number,
    source: String,
    confidence: Number
  },
  
  entities: {
    duration: String,
    issueType: String,
    landmarks: [String],
    keywords: [String]
  },
  
  aiAnalysis: {
    departmentConfidence: Number,
    categoryConfidence: Number,
    urgencyConfidence: Number,
    locationConfidence: Number,
    overallConfidence: Number,
    explanation: [String],
    analyzedAt: Date
  },
  
  duplicateCandidates: [{
    complaintId: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint' },
    similarity: Number,
    reason: [String]
  }],
  duplicateOf: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint' },
  
  clusterId: { type: mongoose.Schema.Types.ObjectId, ref: 'DuplicateCluster' },
  
  status: { 
    type: String,
    enum: ['RECEIVED', 'AI_TRIAGED', 'AWAITING_REVIEW', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED', 'DUPLICATE', 'NEEDS_INFORMATION'],
    default: 'RECEIVED'
  },
  statusHistory: [{
    status: String,
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now }
  }],
  
  operatorDecision: { type: Object },
  operatorNotes: { type: String },
  
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolvedAt: { type: Date }
}, { timestamps: true });

// Note: complaintId unique index is defined inline above; no need to repeat here
complaintSchema.index({ status: 1 });
complaintSchema.index({ department: 1 });
complaintSchema.index({ category: 1 });
complaintSchema.index({ 'location.ward': 1 });
complaintSchema.index({ 'location.locality': 1 });
complaintSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Complaint', complaintSchema);
