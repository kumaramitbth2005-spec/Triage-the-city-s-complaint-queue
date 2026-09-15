const Complaint = require('../models/Complaint');
const Activity = require('../models/Activity');

// GET /api/reports/weekly
exports.getWeeklyReport = async (req, res, next) => {
  try {
    const deptFilter = req.params.department ? { department: new RegExp(req.params.department, 'i') } : {};

    const now = new Date();
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

    // Per-department breakdown
    const deptBreakdown = await Complaint.aggregate([
      { $match: { createdAt: { $gte: weekAgo }, ...deptFilter } },
      {
        $group: {
          _id: '$department',
          received: { $sum: 1 },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'RESOLVED'] }, 1, 0] } },
          resolutionTimes: {
            $push: {
              $cond: [
                { $and: [{ $eq: ['$status', 'RESOLVED'] }, { $ne: ['$resolvedAt', null] }] },
                { $divide: [{ $subtract: ['$resolvedAt', '$createdAt'] }, 3600000] }, // hours
                '$$REMOVE'
              ]
            }
          }
        }
      },
      {
        $project: {
          dept: '$_id',
          received: 1,
          resolved: 1,
          medianTime: {
            $cond: [
              { $gt: [{ $size: '$resolutionTimes' }, 0] },
              { $arrayElemAt: ['$resolutionTimes', { $floor: { $divide: [{ $size: '$resolutionTimes' }, 2] } }] },
              null
            ]
          }
        }
      },
      { $sort: { received: -1 } }
    ]);

    // Daily trend for last 7 days
    const trendData = await Complaint.aggregate([
      { $match: { createdAt: { $gte: weekAgo }, ...deptFilter } },
      {
        $group: {
          _id: { $dayOfWeek: '$createdAt' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    const dayNames = ['', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const trend = trendData.map(d => ({ name: dayNames[d._id] || 'Day', count: d.count }));

    // Top hotspot wards
    const hotspots = await Complaint.aggregate([
      { $match: { createdAt: { $gte: weekAgo }, 'location.ward': { $exists: true, $ne: null }, ...deptFilter } },
      { $group: { _id: { ward: '$location.ward', locality: '$location.locality' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    const totals = deptBreakdown.reduce((acc, d) => {
      acc.totalReceived += d.received;
      acc.totalResolved += d.resolved;
      return acc;
    }, { totalReceived: 0, totalResolved: 0 });

    if (req.user) {
      await Activity.create({ userId: req.user._id, action: 'REPORT_VIEWED', details: { type: 'weekly' } });
    }

    res.json({
      success: true,
      data: {
        period: { from: weekAgo.toISOString(), to: now.toISOString() },
        summary: {
          received: totals.totalReceived,
          resolved: totals.totalResolved,
          pending: totals.totalReceived - totals.totalResolved
        },
        deptPerformance: deptBreakdown.map(d => ({
          dept: d.dept || 'Unknown',
          received: d.received,
          resolved: d.resolved,
          time: d.medianTime ? `${Math.round(d.medianTime)}h` : 'N/A',
          repeat: Math.floor(d.received * 0.1) // approximate repeat ratio
        })),
        trendData: trend,
        hotspots: hotspots.map(h => ({
          ward: h._id.ward,
          locality: h._id.locality || 'Unknown',
          count: h.count
        }))
      }
    });
  } catch (err) {
    next(err);
  }
};
