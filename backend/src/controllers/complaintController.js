const Complaint = require('../models/Complaint');
const Activity = require('../models/Activity');
const { createComplaint: createComplaintService } = require('../services/complaintService');

// POST /api/complaints
exports.createComplaint = async (req, res, next) => {
  try {
    const complaint = await createComplaintService(req.body, req.user?._id);
    res.status(201).json({ success: true, data: complaint });
  } catch (err) {
    next(err);
  }
};

// GET /api/complaints
exports.getComplaints = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.department) filter.department = new RegExp(req.query.department, 'i');
    if (req.query.urgency) filter.urgency = req.query.urgency;
    if (req.query.ward) filter['location.ward'] = req.query.ward;
    if (req.query.locality) filter['location.locality'] = new RegExp(req.query.locality, 'i');

    const [data, total] = await Promise.all([
      Complaint.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Complaint.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/complaints/:id
exports.getComplaintById = async (req, res, next) => {
  try {
    const complaint = await Complaint.findOne({
      $or: [{ _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }, { complaintId: req.params.id }]
    }).lean();

    if (!complaint) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Complaint not found' } });
    }

    if (req.user) {
      await Activity.create({ userId: req.user._id, action: 'COMPLAINT_VIEWED', entityId: complaint._id });
    }

    res.json({ success: true, data: complaint });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/complaints/:id/triage
exports.triageComplaint = async (req, res, next) => {
  try {
    const { department, category, urgency, status, operatorNotes } = req.body;

    const complaint = await Complaint.findOne({
      $or: [
        { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null },
        { complaintId: req.params.id }
      ]
    });

    if (!complaint) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Complaint not found' } });
    }

    if (department) complaint.department = department;
    if (category) complaint.category = category;
    if (urgency) complaint.urgency = urgency;
    if (operatorNotes) complaint.operatorNotes = operatorNotes;

    if (status) {
      complaint.status = status;
      complaint.statusHistory.push({ status, changedBy: req.user._id, timestamp: new Date() });
      if (status === 'RESOLVED') complaint.resolvedAt = new Date();
    }

    complaint.operatorDecision = {
      department: complaint.department,
      category: complaint.category,
      urgency: complaint.urgency,
      reviewedBy: req.user._id,
      reviewedAt: new Date()
    };

    await complaint.save();

    await Activity.create({ userId: req.user._id, action: 'TRIAGE_CONFIRMED', entityId: complaint._id });

    res.json({ success: true, data: complaint });
  } catch (err) {
    next(err);
  }
};

// GET /api/triage
exports.getTriageQueue = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = { status: { $in: ['RECEIVED', 'AWAITING_REVIEW', 'AI_TRIAGED'] } };
    if (req.query.urgency) filter.urgency = req.query.urgency;

    const [data, total] = await Promise.all([
      Complaint.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Complaint.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) {
    next(err);
  }
};
