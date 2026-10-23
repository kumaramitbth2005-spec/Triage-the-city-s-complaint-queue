const Complaint = require('../models/Complaint');
const Activity = require('../models/Activity');
const User = require('../models/User');
const { createNotification } = require('../services/notificationService');
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
    if (req.user && req.user.role === 'citizen') {
      filter.createdBy = req.user._id;
    }
    if (req.query.status) filter.status = req.query.status;
    if (req.query.department) filter.department = new RegExp(req.query.department.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    if (req.query.urgency) filter.urgency = req.query.urgency;
    if (req.query.ward) filter['location.ward'] = req.query.ward;
    if (req.query.locality) filter['location.locality'] = new RegExp(req.query.locality.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

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

    if (req.user && req.user.role === 'citizen' && complaint.createdBy) {
      if (complaint.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Not authorized to view this complaint' } });
      }
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
    if (!req.user) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required to triage complaints' } });
    }

    if (req.user.role === 'citizen') {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Citizens are not authorized to triage complaints' } });
    }

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

    // Normalize status (e.g. 'Confirmed' -> 'ASSIGNED')
    let targetStatus = status;
    if (targetStatus === 'Confirmed' || targetStatus === 'CONFIRMED') {
      targetStatus = 'ASSIGNED';
    }

    if (department) complaint.department = department;
    if (category) complaint.category = category;
    if (urgency) complaint.urgency = urgency;
    if (operatorNotes !== undefined) complaint.operatorNotes = operatorNotes;

    // Validate that a department exists if routing
    if (!complaint.department && targetStatus === 'ASSIGNED') {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Assigned department is required to route complaint' } });
    }

    if (targetStatus) {
      complaint.status = targetStatus;
      complaint.statusHistory.push({ status: targetStatus, changedBy: req.user._id, timestamp: new Date() });
      if (targetStatus === 'RESOLVED') complaint.resolvedAt = new Date();
    }

    complaint.operatorDecision = {
      department: complaint.department,
      category: complaint.category,
      urgency: complaint.urgency,
      operatorNotes: complaint.operatorNotes || '',
      reviewedBy: req.user._id,
      reviewedAt: new Date()
    };

    await complaint.save();

    await Activity.create({ 
      userId: req.user._id, 
      action: 'TRIAGE_CONFIRMED', 
      entityId: complaint._id,
      details: {
        complaintId: complaint.complaintId,
        department: complaint.department,
        status: complaint.status,
        urgency: complaint.urgency
      }
    });

    res.json({ success: true, data: complaint, message: `Complaint #${complaint.complaintId} successfully routed to ${complaint.department}` });
  } catch (err) {
    next(err);
  }
};

// POST /api/complaints/:id/escalate
exports.escalateComplaint = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required to escalate complaints' } });
    }

    if (req.user.role === 'citizen') {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Citizens are not authorized to escalate complaints' } });
    }

    const { reason, notes, targetDepartment } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Escalation reason is required' } });
    }

    const complaint = await Complaint.findOne({
      $or: [
        { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null },
        { complaintId: req.params.id }
      ]
    });

    if (!complaint) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Complaint not found' } });
    }

    // Eligibility check
    if (complaint.status === 'RESOLVED' || complaint.status === 'REJECTED') {
      return res.status(400).json({
        success: false,
        error: { code: 'INELIGIBLE_STATUS', message: `Cannot escalate a complaint with status ${complaint.status}` }
      });
    }

    const currentLevel = complaint.escalation?.level || 0;
    const MAX_LEVEL = 3;

    if (currentLevel >= MAX_LEVEL) {
      return res.status(400).json({
        success: false,
        error: { code: 'MAX_ESCALATION_REACHED', message: `Complaint has already reached the maximum escalation tier (Level ${MAX_LEVEL})` }
      });
    }

    const nextLevel = currentLevel + 1;
    const previousUrgency = complaint.urgency || 'MEDIUM';

    // Urgency promotion policy:
    // Level 1: at least HIGH
    // Level 2 & 3: CRITICAL
    let newUrgency = previousUrgency;
    if (nextLevel === 1) {
      if (previousUrgency === 'LOW' || previousUrgency === 'MEDIUM') {
        newUrgency = 'HIGH';
      }
    } else if (nextLevel >= 2) {
      newUrgency = 'CRITICAL';
    }

    complaint.urgency = newUrgency;
    if (targetDepartment) {
      complaint.department = targetDepartment;
    }

    if (!complaint.escalation) {
      complaint.escalation = { level: 0, history: [] };
    }

    complaint.escalation.level = nextLevel;
    complaint.escalation.isEscalated = true;
    complaint.escalation.reason = reason.trim();
    complaint.escalation.notes = notes ? notes.trim() : '';
    complaint.escalation.escalatedBy = req.user._id;
    complaint.escalation.escalatedAt = new Date();

    if (!Array.isArray(complaint.escalation.history)) {
      complaint.escalation.history = [];
    }

    complaint.escalation.history.push({
      level: nextLevel,
      reason: reason.trim(),
      notes: notes ? notes.trim() : '',
      escalatedBy: req.user._id,
      escalatorName: req.user.name || 'Officer',
      escalatorRole: req.user.role || 'operator',
      timestamp: new Date(),
      previousUrgency,
      newUrgency
    });

    complaint.statusHistory.push({
      status: complaint.status,
      changedBy: req.user._id,
      timestamp: new Date()
    });

    await complaint.save();

    // Log activity
    await Activity.create({
      userId: req.user._id,
      action: 'COMPLAINT_ESCALATED',
      entityId: complaint._id,
      details: {
        complaintId: complaint.complaintId,
        level: nextLevel,
        reason: reason.trim(),
        previousUrgency,
        newUrgency
      }
    });

    // Notify senior supervisors and admins
    const supervisors = await User.find({ role: { $in: ['admin', 'zone_head', 'operator'] } }).select('_id');
    for (const sup of supervisors) {
      await createNotification({
        userId: sup._id,
        type: 'HIGH_URGENCY',
        title: `Tier ${nextLevel} SLA Escalation Alert`,
        message: `${complaint.complaintId} escalated to Level ${nextLevel} (${newUrgency}). Reason: ${reason.trim().slice(0, 80)}`,
        route: `/complaints`,
        complaintId: complaint._id
      });
    }

    res.json({
      success: true,
      data: complaint,
      message: `Complaint #${complaint.complaintId} successfully escalated to Level ${nextLevel}`
    });
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

// DELETE /api/complaints/:id
exports.deleteComplaint = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required to delete complaints' } });
    }

    const query = {
      $or: [
        { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null },
        { complaintId: req.params.id }
      ]
    };

    if (req.user.role === 'citizen') {
      query.createdBy = req.user._id;
    }

    const complaint = await Complaint.findOneAndDelete(query);

    if (!complaint) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Complaint not found or unauthorized' } });
    }

    await Activity.create({ userId: req.user._id, action: 'COMPLAINT_DELETED', entityId: complaint._id });

    res.json({ success: true, message: 'Complaint deleted successfully', complaintId: complaint.complaintId });
  } catch (err) {
    next(err);
  }
};

