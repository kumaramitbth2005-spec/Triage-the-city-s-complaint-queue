const Complaint = require('../models/Complaint');
const DuplicateCluster = require('../models/DuplicateCluster');

/**
 * Find potential duplicate complaints submitted in the last 7 days
 * that share the same department and ward/locality.
 */
async function findDuplicates(complaint) {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  
  const query = {
    _id: { $ne: complaint._id },
    createdAt: { $gte: sevenDaysAgo },
    department: complaint.department
  };

  if (complaint.location && complaint.location.ward) {
    query['location.ward'] = complaint.location.ward;
  }

  const candidates = await Complaint.find(query).select('complaintId location category department originalText').limit(10);

  return candidates.map(c => ({
    complaintId: c._id,
    complaintDisplayId: c.complaintId,
    similarity: 0.80,
    reason: [
      'Same department: ' + complaint.department,
      complaint.location?.ward ? 'Same ward: ' + complaint.location.ward : 'Same locality',
      'Reported within 7 days'
    ]
  }));
}

/**
 * Find or create a DuplicateCluster for this complaint.
 * Marks isEmerging if >10 complaints in the same cluster in last 48 hours.
 */
async function getOrCreateCluster(complaint, duplicates) {
  try {
    const { department, category, location } = complaint;
    const locality = location?.locality;
    const ward = location?.ward;

    let cluster = await DuplicateCluster.findOne({
      department,
      category,
      ...(ward ? { ward } : {}),
      ...(locality ? { locality } : {})
    });

    if (!cluster) {
      const clusterCount = await DuplicateCluster.countDocuments();
      cluster = await DuplicateCluster.create({
        clusterId: `CL-${String(clusterCount + 1).padStart(3, '0')}`,
        title: `${category} in ${locality || ward || department}`,
        department,
        category,
        locality: locality || null,
        ward: ward || null,
        complaintIds: [complaint._id],
        complaintCount: 1,
        averageSimilarity: 0,
        timeWindow: 'Ongoing'
      });
    } else {
      // Add complaint to existing cluster
      if (!cluster.complaintIds.includes(complaint._id)) {
        cluster.complaintIds.push(complaint._id);
        cluster.complaintCount = cluster.complaintIds.length;
      }

      // Check if emerging: >10 complaints in last 48 hours
      const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
      const recentCount = await Complaint.countDocuments({
        clusterId: cluster._id,
        createdAt: { $gte: twoDaysAgo }
      });
      cluster.isEmerging = recentCount >= 10;
      cluster.timeWindow = cluster.isEmerging ? 'Last 48 hours' : cluster.timeWindow;
      await cluster.save();
    }

    return cluster;
  } catch (error) {
    console.error('Cluster error:', error.message);
    return null;
  }
}

module.exports = { findDuplicates, getOrCreateCluster };
