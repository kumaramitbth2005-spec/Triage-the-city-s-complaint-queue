require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const connectDB = require('../config/db');
const User = require('../models/User');
const Complaint = require('../models/Complaint');
const DuplicateCluster = require('../models/DuplicateCluster');
const Notification = require('../models/Notification');
const Gazetteer = require('../models/Gazetteer');

async function seedDatabase(options = { disconnect: true }) {
  if (mongoose.connection.readyState !== 1) {
    await connectDB();
  }
  console.log('🌱 Seeding database...');

  // Clear all collections
  await Promise.all([
    User.deleteMany({}),
    Complaint.deleteMany({}),
    DuplicateCluster.deleteMany({}),
    Notification.deleteMany({}),
    Gazetteer.deleteMany({})
  ]);
  console.log('Cleared all collections');

  // ─── Users ───────────────────────────────────────────────
  const salt = await bcrypt.genSalt(10);
  const adminHash = await bcrypt.hash('admin123', salt);
  const operatorHash = await bcrypt.hash('operator123', salt);

  const [admin, operator] = await User.insertMany([
    { name: 'Admin User', email: 'admin@city.gov', passwordHash: adminHash, role: 'admin', zone: 'Zone 1', department: 'General' },
    { name: 'Operator One', email: 'operator@city.gov', passwordHash: operatorHash, role: 'operator', zone: 'Zone 2', department: 'Sanitation' }
  ]);
  console.log('Users seeded');

  // ─── Gazetteer ───────────────────────────────────────────
  await Gazetteer.insertMany([
    { type: 'locality', name: 'Arera Colony', wardNumber: '42', aliases: ['Arera', 'Arera col', 'Arera Colony Bhopal'] },
    { type: 'locality', name: 'MP Nagar', wardNumber: '55', aliases: ['M P Nagar', 'MP Nagar Zone 1', 'MP Nagar Zone 2'] },
    { type: 'locality', name: 'Bairagarh', wardNumber: '1', aliases: ['Bairagadh', 'Bairagarh Chichli'] },
    { type: 'locality', name: 'Kolar', wardNumber: '31', aliases: ['Kolar Road', 'Kolar Colony'] },
    { type: 'locality', name: 'Saket Nagar', wardNumber: '21', aliases: ['Saket', 'Saket Colony'] },
    { type: 'locality', name: 'TT Nagar', wardNumber: '14', aliases: ['T T Nagar', 'Tatya Tope Nagar'] },
    { type: 'locality', name: 'Habibganj', wardNumber: '48', aliases: ['Habib Ganj', 'Habibganj Railway Station'] },
    { type: 'locality', name: 'Shyamla Hills', wardNumber: '19', aliases: ['Shyamala Hills', 'Shyamla'] },
    { type: 'ward', name: 'Ward 42', wardNumber: '42', aliases: [] },
    { type: 'ward', name: 'Ward 55', wardNumber: '55', aliases: [] },
    { type: 'ward', name: 'Ward 1', wardNumber: '1', aliases: [] }
  ]);
  console.log('Gazetteer seeded');

  // ─── Complaints ──────────────────────────────────────────
  const now = new Date();
  const hoursAgo = (h) => new Date(now - h * 3600000);
  const daysAgo = (d) => new Date(now - d * 86400000);

  const complaints = await Complaint.insertMany([
    {
      complaintId: 'CMP-2026-100001',
      originalText: 'Garbage has not been collected for three days near the main market.',
      normalizedText: 'Garbage has not been collected for three days near the main market.',
      inputMethod: 'text', originalLanguage: 'English', detectedLanguage: 'English',
      department: 'Sanitation Department', category: 'Garbage Collection',
      urgency: 'HIGH', urgencyScore: 0.78,
      location: { locality: 'Arera Colony', ward: '42', city: 'Bhopal', source: 'gazetteer', confidence: 0.92 },
      entities: { keywords: ['garbage', '3 days'] },
      aiAnalysis: { departmentConfidence: 94, categoryConfidence: 91, urgencyConfidence: 78, locationConfidence: 92, overallConfidence: 91, explanation: ['garbage keyword found', 'Arera Colony matched'], analyzedAt: hoursAgo(2) },
      status: 'AI_TRIAGED',
      statusHistory: [{ status: 'RECEIVED', timestamp: hoursAgo(3) }, { status: 'AI_TRIAGED', timestamp: hoursAgo(2) }],
      createdBy: operator._id, createdAt: hoursAgo(3)
    },
    {
      complaintId: 'CMP-2026-100002',
      originalText: '3 din se kachra nahi utha hai MP Nagar ke paas.',
      normalizedText: '3 din se kachra nahi utha hai MP Nagar ke paas.',
      inputMethod: 'voice', originalLanguage: 'Hindi', detectedLanguage: 'Hindi',
      voiceTranscript: '3 din se kachra nahi utha hai MP Nagar ke paas.',
      department: 'Sanitation Department', category: 'Garbage Collection',
      urgency: 'HIGH', urgencyScore: 0.75,
      location: { locality: 'MP Nagar', ward: '55', city: 'Bhopal', source: 'gazetteer', confidence: 0.88 },
      entities: { keywords: ['kachra', '3 din'] },
      aiAnalysis: { departmentConfidence: 91, categoryConfidence: 88, urgencyConfidence: 75, locationConfidence: 88, overallConfidence: 88, explanation: ['kachra keyword found in Hindi text'], analyzedAt: hoursAgo(5) },
      status: 'AI_TRIAGED',
      statusHistory: [{ status: 'RECEIVED', timestamp: hoursAgo(6) }, { status: 'AI_TRIAGED', timestamp: hoursAgo(5) }],
      createdBy: operator._id, createdAt: hoursAgo(6)
    },
    {
      complaintId: 'CMP-2026-100003',
      originalText: 'Massive pothole on the main road causing accidents near Kolar.',
      normalizedText: 'Massive pothole on the main road causing accidents near Kolar.',
      inputMethod: 'text', originalLanguage: 'English', detectedLanguage: 'English',
      department: 'Roads & Infrastructure', category: 'Pothole',
      urgency: 'CRITICAL', urgencyScore: 0.95,
      location: { locality: 'Kolar', ward: '31', city: 'Bhopal', source: 'gazetteer', confidence: 0.95 },
      entities: { keywords: ['pothole', 'accident'] },
      aiAnalysis: { departmentConfidence: 98, categoryConfidence: 97, urgencyConfidence: 95, locationConfidence: 95, overallConfidence: 96, explanation: ['pothole and accident keywords → CRITICAL urgency'], analyzedAt: hoursAgo(1) },
      status: 'AWAITING_REVIEW',
      statusHistory: [{ status: 'RECEIVED', timestamp: hoursAgo(2) }, { status: 'AI_TRIAGED', timestamp: hoursAgo(1) }, { status: 'AWAITING_REVIEW', timestamp: hoursAgo(0.5) }],
      createdBy: operator._id, createdAt: hoursAgo(2)
    },
    {
      complaintId: 'CMP-2026-100004',
      originalText: 'Street light is not working since last week in Saket Nagar.',
      normalizedText: 'Street light is not working since last week in Saket Nagar.',
      inputMethod: 'text', originalLanguage: 'English', detectedLanguage: 'English',
      department: 'Street Lighting', category: 'Light Failure',
      urgency: 'LOW', urgencyScore: 0.30,
      location: { locality: 'Saket Nagar', ward: '21', city: 'Bhopal', source: 'gazetteer', confidence: 0.90 },
      entities: { keywords: ['street light', 'last week'] },
      aiAnalysis: { departmentConfidence: 88, categoryConfidence: 85, urgencyConfidence: 30, locationConfidence: 90, overallConfidence: 80, explanation: ['light and street light keywords found'], analyzedAt: daysAgo(1) },
      status: 'RESOLVED', resolvedAt: hoursAgo(4),
      statusHistory: [{ status: 'RECEIVED', timestamp: daysAgo(2) }, { status: 'AI_TRIAGED', timestamp: daysAgo(2) }, { status: 'RESOLVED', timestamp: hoursAgo(4) }],
      createdBy: operator._id, createdAt: daysAgo(2)
    },
    {
      complaintId: 'CMP-2026-100005',
      originalText: 'Paani ki line toot gayi hai, poora rasta paani se bhar gaya hai Bairagarh mein.',
      normalizedText: 'Paani ki line toot gayi hai, poora rasta paani se bhar gaya hai Bairagarh mein.',
      inputMethod: 'voice', originalLanguage: 'Hindi', detectedLanguage: 'Hindi',
      voiceTranscript: 'Paani ki line toot gayi hai, poora rasta paani se bhar gaya hai Bairagarh mein.',
      department: 'Water Supply Department', category: 'Water Leakage',
      urgency: 'HIGH', urgencyScore: 0.80,
      location: { locality: 'Bairagarh', ward: '1', city: 'Bhopal', source: 'gazetteer', confidence: 0.91 },
      entities: { keywords: ['paani', 'toot gayi'] },
      aiAnalysis: { departmentConfidence: 95, categoryConfidence: 93, urgencyConfidence: 80, locationConfidence: 91, overallConfidence: 91, explanation: ['water leakage keywords in Hindi', 'Bairagarh locality matched'], analyzedAt: hoursAgo(8) },
      status: 'ASSIGNED',
      statusHistory: [{ status: 'RECEIVED', timestamp: daysAgo(1) }, { status: 'AI_TRIAGED', timestamp: daysAgo(1) }, { status: 'ASSIGNED', timestamp: hoursAgo(8) }],
      createdBy: operator._id, createdAt: daysAgo(1)
    },
    {
      complaintId: 'CMP-2026-100006',
      originalText: 'Garbage piling up near Arera Colony park entrance for 2 days.',
      normalizedText: 'Garbage piling up near Arera Colony park entrance for 2 days.',
      inputMethod: 'text', originalLanguage: 'English', detectedLanguage: 'English',
      department: 'Sanitation Department', category: 'Garbage Collection',
      urgency: 'MEDIUM', urgencyScore: 0.60,
      location: { locality: 'Arera Colony', ward: '42', city: 'Bhopal', source: 'gazetteer', confidence: 0.92 },
      entities: { keywords: ['garbage', '2 days'] },
      aiAnalysis: { departmentConfidence: 90, categoryConfidence: 88, urgencyConfidence: 60, locationConfidence: 92, overallConfidence: 85, explanation: ['garbage keyword found'], analyzedAt: daysAgo(2) },
      status: 'AI_TRIAGED',
      statusHistory: [{ status: 'RECEIVED', timestamp: daysAgo(3) }, { status: 'AI_TRIAGED', timestamp: daysAgo(2) }],
      createdBy: admin._id, createdAt: daysAgo(3)
    },
    {
      complaintId: 'CMP-2026-100007',
      originalText: 'Drain is blocked and overflowing into the road near Shyamla Hills.',
      normalizedText: 'Drain is blocked and overflowing into the road near Shyamla Hills.',
      inputMethod: 'text', originalLanguage: 'English', detectedLanguage: 'English',
      department: 'Drainage Department', category: 'Drain Blockage',
      urgency: 'HIGH', urgencyScore: 0.78,
      location: { locality: 'Shyamla Hills', ward: '19', city: 'Bhopal', source: 'gazetteer', confidence: 0.88 },
      entities: { keywords: ['drain', 'blocked', 'overflow'] },
      aiAnalysis: { departmentConfidence: 92, categoryConfidence: 90, urgencyConfidence: 78, locationConfidence: 88, overallConfidence: 88, explanation: ['drain blocked keywords found'], analyzedAt: daysAgo(1) },
      status: 'IN_PROGRESS',
      statusHistory: [{ status: 'RECEIVED', timestamp: daysAgo(2) }, { status: 'AI_TRIAGED', timestamp: daysAgo(1) }, { status: 'IN_PROGRESS', timestamp: hoursAgo(12) }],
      createdBy: operator._id, createdAt: daysAgo(2)
    },
    {
      complaintId: 'CMP-2026-100008',
      originalText: 'No water supply for past 2 days in Habibganj area.',
      normalizedText: 'No water supply for past 2 days in Habibganj area.',
      inputMethod: 'text', originalLanguage: 'English', detectedLanguage: 'English',
      department: 'Water Supply Department', category: 'Water Leakage',
      urgency: 'HIGH', urgencyScore: 0.80,
      location: { locality: 'Habibganj', ward: '48', city: 'Bhopal', source: 'gazetteer', confidence: 0.90 },
      entities: { keywords: ['water', 'no water', '2 days'] },
      aiAnalysis: { departmentConfidence: 93, categoryConfidence: 91, urgencyConfidence: 80, locationConfidence: 90, overallConfidence: 89, explanation: ['no water supply keywords found'], analyzedAt: hoursAgo(10) },
      status: 'RECEIVED',
      statusHistory: [{ status: 'RECEIVED', timestamp: hoursAgo(11) }],
      createdBy: operator._id, createdAt: hoursAgo(11)
    },
    {
      complaintId: 'CMP-2026-100009',
      originalText: 'Park benches and swings are broken in TT Nagar park, dangerous for children.',
      normalizedText: 'Park benches and swings are broken in TT Nagar park, dangerous for children.',
      inputMethod: 'text', originalLanguage: 'English', detectedLanguage: 'English',
      department: 'Parks & Horticulture', category: 'Park Maintenance',
      urgency: 'MEDIUM', urgencyScore: 0.55,
      location: { locality: 'TT Nagar', ward: '14', city: 'Bhopal', source: 'gazetteer', confidence: 0.88 },
      entities: { keywords: ['park', 'broken', 'dangerous'] },
      aiAnalysis: { departmentConfidence: 86, categoryConfidence: 84, urgencyConfidence: 55, locationConfidence: 88, overallConfidence: 82, explanation: ['park maintenance keywords found'], analyzedAt: daysAgo(3) },
      status: 'RESOLVED', resolvedAt: daysAgo(1),
      statusHistory: [{ status: 'RECEIVED', timestamp: daysAgo(4) }, { status: 'RESOLVED', timestamp: daysAgo(1) }],
      createdBy: admin._id, createdAt: daysAgo(4)
    },
    {
      complaintId: 'CMP-2026-100010',
      originalText: 'Electricity pole is leaning dangerously near school in Arera Colony.',
      normalizedText: 'Electricity pole is leaning dangerously near school in Arera Colony.',
      inputMethod: 'text', originalLanguage: 'English', detectedLanguage: 'English',
      department: 'Street Lighting', category: 'Light Failure',
      urgency: 'CRITICAL', urgencyScore: 0.92,
      location: { locality: 'Arera Colony', ward: '42', city: 'Bhopal', source: 'gazetteer', confidence: 0.92 },
      entities: { keywords: ['electricity', 'pole', 'school'] },
      aiAnalysis: { departmentConfidence: 89, categoryConfidence: 85, urgencyConfidence: 92, locationConfidence: 92, overallConfidence: 90, explanation: ['school near pole → CRITICAL urgency'], analyzedAt: hoursAgo(4) },
      status: 'AWAITING_REVIEW',
      statusHistory: [{ status: 'RECEIVED', timestamp: hoursAgo(5) }, { status: 'AWAITING_REVIEW', timestamp: hoursAgo(4) }],
      createdBy: operator._id, createdAt: hoursAgo(5)
    }
  ]);
  console.log(`${complaints.length} complaints seeded`);

  // ─── Clusters ─────────────────────────────────────────────
  const arera_complaints = complaints.filter(c => c.location?.ward === '42' && c.department === 'Sanitation Department');
  const water_complaints = complaints.filter(c => c.department === 'Water Supply Department');

  const [cluster1, cluster2] = await DuplicateCluster.insertMany([
    {
      clusterId: 'CL-024',
      title: 'Garbage Collection - Arera Colony',
      department: 'Sanitation Department',
      category: 'Garbage Collection',
      locality: 'Arera Colony',
      ward: '42',
      complaintIds: arera_complaints.map(c => c._id),
      complaintCount: 17, // Simulating a larger cluster
      averageSimilarity: 92,
      timeWindow: 'Last 48 hours',
      isEmerging: true
    },
    {
      clusterId: 'CL-025',
      title: 'Water Supply Issues - Bairagarh & Habibganj',
      department: 'Water Supply Department',
      category: 'Water Leakage',
      locality: 'Bairagarh',
      ward: '1',
      complaintIds: water_complaints.map(c => c._id),
      complaintCount: 8,
      averageSimilarity: 88,
      timeWindow: 'Last 24 hours',
      isEmerging: false
    }
  ]);

  // Update complaints with cluster references
  for (const c of arera_complaints) {
    await Complaint.findByIdAndUpdate(c._id, { clusterId: cluster1._id });
  }
  for (const c of water_complaints) {
    await Complaint.findByIdAndUpdate(c._id, { clusterId: cluster2._id });
  }
  console.log('Clusters seeded');

  // ─── Notifications ────────────────────────────────────────
  for (const user of [admin, operator]) {
    await Notification.insertMany([
      { userId: user._id, type: 'NEW_COMPLAINT', title: 'New Complaint Received', message: `CMP-2026-100001 — Garbage Collection in Arera Colony`, read: false, route: '/complaints', complaintId: complaints[0]._id },
      { userId: user._id, type: 'HIGH_URGENCY', title: 'HIGH Urgency Alert', message: 'Complaint CMP-2026-100001 requires immediate attention.', read: false, route: '/triage', complaintId: complaints[0]._id },
      { userId: user._id, type: 'EMERGING_CLUSTER', title: 'Emerging Cluster Alert', message: 'Cluster CL-024 now has 17 complaints in Arera Colony.', read: false, route: '/clusters', clusterId: cluster1._id },
      { userId: user._id, type: 'DUPLICATE_FOUND', title: 'Possible Duplicate Detected', message: 'CMP-2026-100002 may be a duplicate of existing complaints.', read: true, route: '/clusters', complaintId: complaints[1]._id },
      { userId: user._id, type: 'SYSTEM', title: 'System Ready', message: 'City Complaint Triage system is fully operational.', read: true, route: '/' }
    ]);
  }
  console.log('Notifications seeded');

  console.log('\n✅ Seed complete!');
  console.log('Login credentials:');
  console.log('  Admin: admin@city.gov / admin123');
  console.log('  Operator: operator@city.gov / operator123');

  if (options.disconnect) {
    await mongoose.disconnect();
  }
}

if (require.main === module) {
  seedDatabase({ disconnect: true }).catch(err => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
}

module.exports = seedDatabase;

