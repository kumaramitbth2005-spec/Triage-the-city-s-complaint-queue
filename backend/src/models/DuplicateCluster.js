const mongoose = require('mongoose');

const duplicateClusterSchema = new mongoose.Schema({
  clusterId: { type: String, required: true, unique: true },
  title: { type: String },
  department: { type: String },
  category: { type: String },
  locality: { type: String },
  ward: { type: String },
  complaintIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Complaint' }],
  complaintCount: { type: Number, default: 0 },
  averageSimilarity: { type: Number },
  timeWindow: { type: String },
  isEmerging: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('DuplicateCluster', duplicateClusterSchema);
