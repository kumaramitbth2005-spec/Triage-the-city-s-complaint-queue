const DuplicateCluster = require('../models/DuplicateCluster');
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
    }).populate('complaintIds', 'complaintId originalText department category urgency location status createdAt').lean();

    if (!cluster) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Cluster not found' } });
    }

    if (req.user) {
      await Activity.create({ userId: req.user._id, action: 'CLUSTER_VIEWED', entityId: cluster._id });
    }

    res.json({ success: true, data: cluster });
  } catch (err) {
    next(err);
  }
};
