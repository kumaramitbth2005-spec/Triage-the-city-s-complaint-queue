const mongoose = require('mongoose');

const gazetteerSchema = new mongoose.Schema({
  type: { type: String, enum: ['ward', 'locality'], required: true },
  name: { type: String, required: true },
  wardNumber: { type: String }, // For locality mapping to ward
  aliases: [{ type: String }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

gazetteerSchema.index({ type: 1, name: 1 });
gazetteerSchema.index({ aliases: 1 });

module.exports = mongoose.model('Gazetteer', gazetteerSchema);
