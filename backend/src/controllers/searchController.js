const Complaint = require('../models/Complaint');
const DuplicateCluster = require('../models/DuplicateCluster');

const NAVIGATION_ITEMS = [
  { type: 'navigation', id: 'NAV-dashboard', title: 'Dashboard', description: 'Main overview', route: '/dashboard' },
  { type: 'navigation', id: 'NAV-complaints', title: 'Complaints', description: 'Complaint queue', route: '/dashboard/complaints' },
  { type: 'navigation', id: 'NAV-triage', title: 'AI Triage', description: 'AI-assisted triage', route: '/dashboard/triage' },
  { type: 'navigation', id: 'NAV-clusters', title: 'Duplicate Clusters', description: 'Grouped duplicate complaints', route: '/dashboard/clusters' },
  { type: 'navigation', id: 'NAV-reports', title: 'Reports', description: 'Weekly department digest', route: '/dashboard/reports' },
  { type: 'navigation', id: 'NAV-import', title: 'Data Import', description: 'Import complaint datasets', route: '/dashboard/import' },
  { type: 'navigation', id: 'NAV-settings', title: 'Settings', description: 'Application settings', route: '/dashboard/settings' },
];

// GET /api/search?q=&page=1&limit=10
exports.globalSearch = async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (q.length < 2) {
      return res.json({ success: true, data: { complaints: [], clusters: [], navigation: [] } });
    }

    const regex = new RegExp(q, 'i');

    // Search complaints
    const complaints = await Complaint.find({
      $or: [
        { complaintId: regex },
        { originalText: regex },
        { 'location.locality': regex },
        { 'location.ward': regex },
        { department: regex },
        { category: regex }
      ]
    }).select('complaintId originalText department category urgency location status createdAt').limit(limit).lean();

    // Search clusters
    const clusters = await DuplicateCluster.find({
      $or: [
        { clusterId: regex },
        { title: regex },
        { department: regex },
        { locality: regex },
        { category: regex }
      ]
    }).limit(limit).lean();

    // Navigation suggestions
    const navigation = NAVIGATION_ITEMS.filter(item =>
      item.title.toLowerCase().includes(q.toLowerCase()) ||
      item.description.toLowerCase().includes(q.toLowerCase())
    );

    res.json({
      success: true,
      data: {
        complaints: complaints.map(c => ({ ...c, type: 'complaint', route: `/dashboard/complaints/${c.complaintId}` })),
        clusters: clusters.map(c => ({ ...c, type: 'cluster', route: `/dashboard/clusters/${c.clusterId}` })),
        navigation
      }
    });
  } catch (err) {
    next(err);
  }
};
