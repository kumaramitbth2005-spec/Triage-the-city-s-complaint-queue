const DuplicateCluster = require('../models/DuplicateCluster');
const Complaint = require('../models/Complaint');
const Activity = require('../models/Activity');

// GET /api/clusters
exports.getClusters = async (req, res, next) => {
  try {
    const clusters = await DuplicateCluster.find().sort({ complaintCount: -1 }).lean();
    res.json({ success: true, data: clusters });
  } catch (err) {
    next(err);
  }
};

// GET /api/clusters/:id
exports.getClusterById = async (req, res, next) => {
  try {
    const cluster = await DuplicateCluster.findOne({
      $or: [
        { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null },
        { clusterId: req.params.id }
      ]
    }).lean();

    if (!cluster) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Cluster not found' } });
    }

    if (req.user) {
      await Activity.create({ userId: req.user._id, action: 'CLUSTER_VIEWED', entityId: cluster._id });
    }

    // Query linked complaints safely (respecting citizen role scoping)
    const complaintFilter = {
      $or: [
        { _id: { $in: cluster.complaintIds || [] } },
        { clusterId: cluster._id }
      ]
    };

    if (req.user && req.user.role === 'citizen') {
      complaintFilter.createdBy = req.user._id;
    }

    // Fetch complaints with complete fields, excluding private citizen contact details
    const complaints = await Complaint.find(complaintFilter)
      .select('complaintId title originalText normalizedText inputMethod category department urgency urgencyScore location attachments duplicateCandidates duplicateOf status operatorDecision createdAt updatedAt')
      .sort({ createdAt: 1 })
      .lean();

    // Calculate cluster summary metrics from live data
    const firstReportedAt = complaints.length > 0 ? complaints[0].createdAt : (cluster.createdAt || null);
    const lastReportedAt = complaints.length > 0 ? complaints[complaints.length - 1].createdAt : (cluster.updatedAt || cluster.createdAt || null);

    // Compute highest priority across linked complaints
    const priorityWeight = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
    let highestPriority = cluster.isEmerging ? 'HIGH' : 'MEDIUM';
    let maxWeight = priorityWeight[highestPriority] || 2;

    for (const c of complaints) {
      const weight = priorityWeight[c.urgency] || 0;
      if (weight > maxWeight) {
        maxWeight = weight;
        highestPriority = c.urgency;
      }
    }

    // Determine cluster status
    let clusterStatus = 'ACTIVE';
    if (cluster.isEmerging) {
      clusterStatus = 'EMERGING';
    } else if (complaints.length > 0 && complaints.every(c => c.status === 'RESOLVED')) {
      clusterStatus = 'RESOLVED';
    }

    // Contextual recommended next action
    let recommendedAction = 'Review duplicate complaints and coordinate with field department for consolidated resolution.';
    if (cluster.isEmerging) {
      recommendedAction = `Urgent surge detected: Dispatch field task force to ${cluster.locality || (cluster.ward ? `Ward ${cluster.ward}` : 'affected area')} to inspect infrastructure failure.`;
    } else if (clusterStatus === 'RESOLVED') {
      recommendedAction = 'All complaints in cluster resolved. Run post-resolution audit and confirm citizen closure notifications.';
    } else if (cluster.department) {
      recommendedAction = `Assign lead supervisor from ${cluster.department} to handle consolidated work order.`;
    }

    // Determine primary/anchor complaint vs linked duplicates
    let primaryId = complaints[0]?._id?.toString();
    const referencedAnchor = complaints.find(c => complaints.some(other => other.duplicateOf && other.duplicateOf.toString() === c._id.toString()));
    if (referencedAnchor) {
      primaryId = referencedAnchor._id.toString();
    } else {
      const firstNonDuplicate = complaints.find(c => c.status !== 'DUPLICATE' && !c.duplicateOf);
      if (firstNonDuplicate) {
        primaryId = firstNonDuplicate._id.toString();
      }
    }

    const enrichedComplaints = complaints.map((c) => {
      const isPrimary = c._id.toString() === primaryId;

      // Human-readable source channel
      let sourceChannel = 'Citizen Portal (Web)';
      if (c.inputMethod === 'voice' || c.inputMethod === 'text_voice') sourceChannel = 'Voice Helpline / IVR';
      else if (c.inputMethod === 'photo' || c.inputMethod === 'text_photo') sourceChannel = 'Municipal Mobile App (Photo)';
      else if (c.inputMethod === 'text') sourceChannel = 'Citizen Mobile App';

      // Match confidence and reason
      let similarityScore = cluster.averageSimilarity || 85;
      let matchReason = isPrimary 
        ? 'Primary Anchor Complaint (First recorded incident in this duplicate group)' 
        : `Spatial & categorical match in ${c.location?.locality || cluster.locality || 'assigned ward'}`;

      if (c.duplicateCandidates && c.duplicateCandidates.length > 0) {
        const candidate = c.duplicateCandidates[0];
        if (candidate.similarity) {
          similarityScore = Math.round(candidate.similarity <= 1 ? candidate.similarity * 100 : candidate.similarity);
        }
        if (candidate.reason && candidate.reason.length > 0) {
          matchReason = candidate.reason.join(', ');
        }
      }

      return {
        ...c,
        isPrimary,
        sourceChannel,
        assignedDepartment: c.operatorDecision?.assignedDepartment || c.department || 'Not Assigned',
        assignedOfficer: c.operatorDecision?.assignedOfficer || c.operatorDecision?.assignedTo || null,
        similarityScore,
        matchReason
      };
    });

    res.json({
      success: true,
      data: {
        ...cluster,
        complaints: enrichedComplaints,
        complaintIds: enrichedComplaints, // backwards compatibility
        complaintCount: Math.max(cluster.complaintCount || 0, enrichedComplaints.length),
        firstReportedAt,
        lastReportedAt,
        highestPriority,
        clusterStatus,
        recommendedAction
      }
    });
  } catch (err) {
    next(err);
  }
};

