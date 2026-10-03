const Complaint = require('../models/Complaint');
const DuplicateCluster = require('../models/DuplicateCluster');

const NAVIGATION_ITEMS = [
  // Core Features
  { type: 'navigation', id: 'NAV-dashboard', title: 'Dashboard', description: 'Central command dashboard with real-time complaint metrics', route: '/dashboard', keywords: 'dashboard home overview stats metrics' },
  { type: 'navigation', id: 'NAV-complaints', title: 'Complaints Queue', description: 'Browse and manage all logged civic complaints', route: '/dashboard/complaints', keywords: 'complaints queue list all grievances filter' },
  { type: 'navigation', id: 'NAV-triage', title: 'AI Triage & Review', description: 'AI-assisted classification and automated routing', route: '/dashboard/triage', keywords: 'ai triage classification priority urgency' },
  { type: 'navigation', id: 'NAV-clusters', title: 'Duplicate Clusters', description: 'Grouped duplicate complaints and merged incidents', route: '/dashboard/clusters', keywords: 'clusters duplicate detection similarity' },
  { type: 'navigation', id: 'NAV-map', title: 'Map View', description: 'Interactive geospatial map across city wards', route: '/dashboard/map', keywords: 'map geospatial geographic ward location heatmap' },
  { type: 'navigation', id: 'NAV-analytics', title: 'Analytics & Insights', description: 'Performance trends and department efficiency metrics', route: '/dashboard/analytics', keywords: 'analytics trends charts metrics response time' },
  { type: 'navigation', id: 'NAV-reports', title: 'Reports & Export', description: 'Generate and export complaint summary reports', route: '/dashboard/reports', keywords: 'reports export pdf excel csv summary' },
  { type: 'navigation', id: 'NAV-import', title: 'Data Import', description: 'Bulk import complaint datasets and records', route: '/dashboard/import', keywords: 'import upload csv excel bulk data' },
  { type: 'navigation', id: 'NAV-departments', title: 'Department Management', description: 'Manage municipal departments and SLA thresholds', route: '/dashboard/departments', keywords: 'departments administration staff public works' },
  { type: 'navigation', id: 'NAV-users', title: 'User Management', description: 'Administer operator accounts and permissions', route: '/dashboard/users', keywords: 'users operators admins roles permissions' },

  // All 10 Settings Sections
  { type: 'setting', id: 'SET-general', title: 'General Settings', description: 'Application preferences, default view, and compact mode', route: '/dashboard/settings/general', keywords: 'general settings default view compact mode auto refresh' },
  { type: 'setting', id: 'SET-theme', title: 'Theme & Appearance', description: 'Dark mode, light mode, and system auto theme', route: '/dashboard/settings/theme', keywords: 'theme dark mode light system appearance visual colors night' },
  { type: 'setting', id: 'SET-language', title: 'Language & Region', description: 'Select display and transcription language (10 languages)', route: '/dashboard/settings/language', keywords: 'language region hindi english bengali tamil telugu marathi gujarati kannada malayalam punjabi i18n' },
  { type: 'setting', id: 'SET-notifications', title: 'Notifications & Alerts Inbox', description: 'Review system messages, delete alerts, and alert channels', route: '/dashboard/settings/notifications', keywords: 'notifications alerts messages email push security inbox' },
  { type: 'setting', id: 'SET-profile', title: 'User Profile', description: 'Account identity, display name, photo, and ward credentials', route: '/dashboard/settings/profile', keywords: 'profile user name email avatar photo upload bio zone phone' },
  { type: 'setting', id: 'SET-privacy', title: 'Privacy & Data', description: 'Data controls, JSON export, and clear activity logs', route: '/dashboard/settings/privacy', keywords: 'privacy data export download clear history logs' },
  { type: 'setting', id: 'SET-security', title: 'Security & Password', description: 'Change password and view active JWT sessions', route: '/dashboard/settings/security', keywords: 'security password change session authentication jwt' },
  { type: 'setting', id: 'SET-accessibility', title: 'Accessibility', description: 'Text size scaling, reduce motion, and high contrast', route: '/dashboard/settings/accessibility', keywords: 'accessibility text size reduce motion high contrast focus font' },
  { type: 'setting', id: 'SET-activity', title: 'Activity History', description: 'Chronological audit logs and authenticated user actions', route: '/dashboard/settings/activity', keywords: 'activity history audit logs recent logins updates actions' },
  { type: 'setting', id: 'SET-about', title: 'About Nexus AI', description: 'Technical architecture, version info, and developer profile', route: '/dashboard/settings/about', keywords: 'about developer creator amit kumar project tech stack version' },
];

// GET /api/search?q=&page=1&limit=10
exports.globalSearch = async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (q.length < 2) {
      return res.json({ success: true, data: { complaints: [], clusters: [], setting: [], feature: [], navigation: [] } });
    }

    // Escape regex special characters to prevent ReDoS / NoSQL injection
    const escapedQ = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedQ, 'i');

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

    // Navigation & Settings matches
    const lowerQ = q.toLowerCase();
    const navigationMatches = NAVIGATION_ITEMS.filter(item =>
      item.title.toLowerCase().includes(lowerQ) ||
      item.description.toLowerCase().includes(lowerQ) ||
      (item.keywords && item.keywords.toLowerCase().includes(lowerQ))
    );

    const settings = navigationMatches.filter(i => i.type === 'setting');
    const features = navigationMatches.filter(i => i.type === 'navigation');

    res.json({
      success: true,
      data: {
        complaints: complaints.map(c => ({ ...c, type: 'complaint', title: c.originalText ? (c.originalText.length > 50 ? c.originalText.slice(0, 50) + '...' : c.originalText) : c.complaintId, id: c.complaintId, route: `/dashboard/complaints/${c.complaintId}` })),
        clusters: clusters.map(c => ({ ...c, type: 'cluster', id: c.clusterId, route: `/dashboard/clusters/${c.clusterId}` })),
        setting: settings,
        feature: features,
        navigation: navigationMatches
      }
    });
  } catch (err) {
    next(err);
  }
};
