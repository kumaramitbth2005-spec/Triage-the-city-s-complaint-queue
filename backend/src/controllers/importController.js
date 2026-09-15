const Complaint = require('../models/Complaint');
const { generateComplaintId } = require('../services/complaintService');

const REQUIRED_FIELDS = ['originalText', 'department', 'category'];

// POST /api/import
exports.importData = async (req, res, next) => {
  try {
    const records = Array.isArray(req.body) ? req.body : req.body.data;
    if (!records || !Array.isArray(records)) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Body must be an array of complaint records' } });
    }

    const result = { received: records.length, valid: 0, invalid: 0, inserted: 0, skipped: 0, errors: [] };
    const toInsert = [];

    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const missing = REQUIRED_FIELDS.filter(f => !record[f]);
      if (missing.length > 0) {
        result.invalid++;
        result.errors.push({ index: i, reason: `Missing required fields: ${missing.join(', ')}` });
        continue;
      }

      result.valid++;

      // Check if already exists by complaintId
      if (record.complaintId) {
        const exists = await Complaint.findOne({ complaintId: record.complaintId });
        if (exists) { result.skipped++; continue; }
      }

      toInsert.push({
        complaintId: record.complaintId || generateComplaintId(),
        originalText: record.originalText,
        normalizedText: (record.originalText || '').trim(),
        inputMethod: record.inputMethod || 'text',
        originalLanguage: record.language || 'English',
        detectedLanguage: record.language || 'English',
        department: record.department,
        category: record.category,
        urgency: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(record.urgency) ? record.urgency : 'MEDIUM',
        status: record.status || 'RECEIVED',
        location: {
          locality: record.locality || record.normalizedLocality || null,
          ward: record.ward || null,
          city: 'Bhopal',
          source: 'import'
        },
        statusHistory: [{ status: record.status || 'RECEIVED', timestamp: record.timestamp ? new Date(record.timestamp) : new Date() }],
        createdAt: record.timestamp ? new Date(record.timestamp) : new Date()
      });
    }

    if (toInsert.length > 0) {
      await Complaint.insertMany(toInsert, { ordered: false });
      result.inserted = toInsert.length;
    }

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};
