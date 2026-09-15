const Complaint = require('../models/Complaint');
const Activity = require('../models/Activity');
const { analyzeComplaint } = require('./aiClient');
const { findDuplicates, getOrCreateCluster } = require('./duplicateService');
const { createNotification } = require('./notificationService');
const User = require('../models/User');

/**
 * Generate a unique Complaint ID: CMP-YYYY-XXXXXX
 */
function generateComplaintId() {
  const year = new Date().getFullYear();
  const random = String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
  return `CMP-${year}-${random}`;
}

/**
 * Full pipeline: Create complaint → AI Triage → Duplicates → Cluster → Notifications
 */
async function createComplaint(data, userId) {
  // 1. Generate complaint ID
  const complaintId = generateComplaintId();

  // 2. Build initial complaint
  const complaintData = {
    complaintId,
    originalText: data.originalText || data.text,
    normalizedText: (data.originalText || data.text || '').trim(),
    inputMethod: data.inputMethod || 'text',
    originalLanguage: data.language || 'English',
    detectedLanguage: data.language || 'English',
    voiceTranscript: data.voiceTranscript || null,
    attachments: data.attachments || [],
    location: data.location || {},
    status: 'RECEIVED',
    statusHistory: [{ status: 'RECEIVED', changedBy: userId, timestamp: new Date() }],
    createdBy: userId
  };

  const complaint = await Complaint.create(complaintData);

  // 3. Run AI Triage
  let aiResult = null;
  try {
    aiResult = await analyzeComplaint(
      complaint.originalText,
      complaint.originalLanguage,
      complaint.location
    );
  } catch (err) {
    console.warn('AI analysis failed:', err.message);
  }

  if (aiResult) {
    // Apply AI results
    complaint.department = aiResult.department;
    complaint.category = aiResult.category;
    complaint.urgency = aiResult.urgency;
    complaint.urgencyScore = aiResult.confidence?.urgency || 0.5;
    complaint.detectedLanguage = aiResult.detectedLanguage || complaint.originalLanguage;
    complaint.entities = { keywords: aiResult.keywords || [] };
    complaint.aiAnalysis = {
      departmentConfidence: Math.round((aiResult.confidence?.department || 0) * 100),
      categoryConfidence: Math.round((aiResult.confidence?.category || 0) * 100),
      urgencyConfidence: Math.round((aiResult.confidence?.urgency || 0) * 100),
      locationConfidence: Math.round((aiResult.confidence?.location || 0) * 100),
      overallConfidence: Math.round((aiResult.confidence?.overall || 0) * 100),
      explanation: aiResult.explanation || [],
      analyzedAt: new Date()
    };

    // Apply location from AI if not already set
    if (!complaint.location?.locality && aiResult.locality) {
      complaint.location = {
        ...complaint.location,
        locality: aiResult.locality,
        ward: aiResult.ward
      };
    }

    complaint.status = 'AI_TRIAGED';
    complaint.statusHistory.push({ status: 'AI_TRIAGED', changedBy: userId, timestamp: new Date() });
  } else {
    // AI unavailable — send to manual review
    complaint.status = 'AWAITING_REVIEW';
    complaint.statusHistory.push({ status: 'AWAITING_REVIEW', changedBy: userId, timestamp: new Date() });
  }

  await complaint.save();

  // 4. Find duplicates
  const duplicates = await findDuplicates(complaint);
  if (duplicates.length > 0) {
    complaint.duplicateCandidates = duplicates;
    await complaint.save();
  }

  // 5. Update / Create cluster
  const cluster = await getOrCreateCluster(complaint, duplicates);
  if (cluster) {
    complaint.clusterId = cluster._id;
    await complaint.save();
  }

  // 6. Notifications (for all operators — simplified: notify all admins/operators)
  const operators = await User.find({ role: { $in: ['operator', 'admin', 'zone_head'] } }).select('_id');
  for (const op of operators) {
    await createNotification({
      userId: op._id,
      type: 'NEW_COMPLAINT',
      title: 'New Complaint Received',
      message: `${complaintId} — ${complaint.category || 'General'} in ${complaint.location?.locality || 'Unknown'}`,
      route: '/complaints',
      complaintId: complaint._id
    });

    if (complaint.urgency === 'HIGH' || complaint.urgency === 'CRITICAL') {
      await createNotification({
        userId: op._id,
        type: 'HIGH_URGENCY',
        title: `${complaint.urgency} Urgency Alert`,
        message: `Complaint ${complaintId} requires immediate attention.`,
        route: '/triage',
        complaintId: complaint._id
      });
    }

    if (duplicates.length > 0) {
      await createNotification({
        userId: op._id,
        type: 'DUPLICATE_FOUND',
        title: 'Possible Duplicate Detected',
        message: `${complaintId} may be a duplicate of ${duplicates.length} existing complaints.`,
        route: '/clusters',
        complaintId: complaint._id
      });
    }

    if (cluster?.isEmerging) {
      await createNotification({
        userId: op._id,
        type: 'EMERGING_CLUSTER',
        title: 'Emerging Cluster Alert',
        message: `Cluster ${cluster.clusterId} now has ${cluster.complaintCount} complaints in ${cluster.locality || cluster.ward}.`,
        route: '/clusters',
        clusterId: cluster._id
      });
    }

    if (aiResult && complaint.aiAnalysis?.overallConfidence < 60) {
      await createNotification({
        userId: op._id,
        type: 'LOW_AI_CONFIDENCE',
        title: 'Low AI Confidence',
        message: `${complaintId} has low AI confidence (${complaint.aiAnalysis.overallConfidence}%). Manual review recommended.`,
        route: '/triage',
        complaintId: complaint._id
      });
    }
  }

  // 7. Log activity
  if (userId) {
    await Activity.create({ userId, action: 'COMPLAINT_CREATED', entityId: complaint._id, details: { complaintId } });
  }

  return complaint;
}

module.exports = { createComplaint, generateComplaintId };
