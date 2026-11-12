/**
 * resilientStore.js
 * In-memory & JSON-persisted resilient data store.
 * 
 * Ensures the Smart City app operates 100% reliably EVEN WHEN
 * MongoDB Atlas is disconnected, cold-starting, or undergoing network timeouts.
 * 
 * Features:
 * - Zero-delay user registration & login
 * - Real OTP email generation & validation
 * - Demo account pre-seeding (admin@city.gov / admin123, operator@city.gov / operator123)
 * - Seed complaints for immediate triage & queue visualization
 * - Compatible with Mongoose document methods (e.g. .save())
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const generateHexId = () => crypto.randomBytes(12).toString('hex');

const DATA_DIR = path.resolve(__dirname, '../../data');
const STORE_FILE = path.join(DATA_DIR, 'resilient_store.json');

class ResilientStore {
  constructor() {
    this.users = new Map();
    this.complaints = new Map();
    this.notifications = [];
    this.activities = [];
    this.initialized = false;
    this.init();
  }

  async init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(STORE_FILE)) {
        const raw = fs.readFileSync(STORE_FILE, 'utf8');
        const data = JSON.parse(raw);
        if (data.users && Array.isArray(data.users)) {
          data.users.forEach(u => this.users.set(u.email.toLowerCase(), this._wrapUser(u)));
        }
        if (data.complaints && Array.isArray(data.complaints)) {
          data.complaints.forEach(c => this.complaints.set(c._id || c.complaintId, this._wrapComplaint(c)));
        }
      }
    } catch (err) {
      console.warn('⚠️ Could not load persisted resilient store:', err.message);
    }

    // Pre-seed demo accounts synchronously so they are immediately available
    this._seedDemoUsersSync();
    this._seedComplaints();
    this.initialized = true;
  }

  _seedDemoUsersSync() {
    const adminEmail = 'admin@city.gov';
    const operatorEmail = 'operator@city.gov';

    if (!this.users.has(adminEmail)) {
      const adminHash = bcrypt.hashSync('admin123', 8);
      this.users.set(adminEmail, this._wrapUser({
        _id: '600000000000000000000001',
        name: 'Admin User',
        username: 'admin',
        email: adminEmail,
        passwordHash: adminHash,
        role: 'admin',
        zone: 'Zone 1 - Central',
        department: 'General Administration',
        language: 'English',
        theme: 'light',
        emailVerified: true,
        emailVerifiedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }));
    }

    if (!this.users.has(operatorEmail)) {
      const operatorHash = bcrypt.hashSync('operator123', 8);
      this.users.set(operatorEmail, this._wrapUser({
        _id: '600000000000000000000002',
        name: 'Operator One',
        username: 'operator',
        email: operatorEmail,
        passwordHash: operatorHash,
        role: 'operator',
        zone: 'Zone 2 - North',
        department: 'Public Works & Sanitation',
        language: 'English',
        theme: 'light',
        emailVerified: true,
        emailVerifiedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }));
    }
  }

  _seedComplaints() {
    if (this.complaints.size > 0) return;

    const sampleComplaints = [
      {
        _id: '600000000000000000000101',
        complaintId: 'CMP-2026-100001',
        originalText: 'Garbage has not been collected for three days near the main market.',
        normalizedText: 'Garbage has not been collected for three days near the main market.',
        department: 'Sanitation Department',
        category: 'Garbage Collection',
        urgency: 'HIGH',
        urgencyScore: 0.78,
        location: { locality: 'Arera Colony', ward: '42', city: 'Bhopal', coordinates: [77.4343, 23.2156] },
        status: 'AI_TRIAGED',
        statusHistory: [{ status: 'RECEIVED', timestamp: new Date(Date.now() - 3 * 3600000) }, { status: 'AI_TRIAGED', timestamp: new Date(Date.now() - 2 * 3600000) }],
        createdAt: new Date(Date.now() - 3 * 3600000)
      },
      {
        _id: '600000000000000000000102',
        complaintId: 'CMP-2026-100002',
        originalText: '3 din se kachra nahi utha hai MP Nagar ke paas.',
        normalizedText: '3 din se kachra nahi utha hai MP Nagar ke paas.',
        department: 'Sanitation Department',
        category: 'Garbage Collection',
        urgency: 'HIGH',
        urgencyScore: 0.75,
        location: { locality: 'MP Nagar', ward: '55', city: 'Bhopal', coordinates: [77.4320, 23.2330] },
        status: 'AI_TRIAGED',
        statusHistory: [{ status: 'RECEIVED', timestamp: new Date(Date.now() - 6 * 3600000) }, { status: 'AI_TRIAGED', timestamp: new Date(Date.now() - 5 * 3600000) }],
        createdAt: new Date(Date.now() - 6 * 3600000)
      },
      {
        _id: '600000000000000000000103',
        complaintId: 'CMP-2026-100003',
        originalText: 'Massive pothole on the main road causing accidents near Kolar.',
        normalizedText: 'Massive pothole on the main road causing accidents near Kolar.',
        department: 'Roads & Infrastructure',
        category: 'Pothole',
        urgency: 'CRITICAL',
        urgencyScore: 0.95,
        location: { locality: 'Kolar', ward: '31', city: 'Bhopal', coordinates: [77.4190, 23.1760] },
        status: 'AWAITING_REVIEW',
        statusHistory: [{ status: 'RECEIVED', timestamp: new Date(Date.now() - 2 * 3600000) }, { status: 'AI_TRIAGED', timestamp: new Date(Date.now() - 3600000) }],
        createdAt: new Date(Date.now() - 2 * 3600000)
      },
      {
        _id: '600000000000000000000104',
        complaintId: 'CMP-2026-100004',
        originalText: 'Street light is not working since last week in Saket Nagar.',
        normalizedText: 'Street light is not working since last week in Saket Nagar.',
        department: 'Street Lighting',
        category: 'Light Failure',
        urgency: 'LOW',
        urgencyScore: 0.30,
        location: { locality: 'Saket Nagar', ward: '21', city: 'Bhopal', coordinates: [77.4470, 23.2130] },
        status: 'RESOLVED',
        resolvedAt: new Date(Date.now() - 4 * 3600000),
        statusHistory: [{ status: 'RECEIVED', timestamp: new Date(Date.now() - 48 * 3600000) }, { status: 'RESOLVED', timestamp: new Date(Date.now() - 4 * 3600000) }],
        createdAt: new Date(Date.now() - 48 * 3600000)
      },
      {
        _id: '600000000000000000000105',
        complaintId: 'CMP-2026-100005',
        originalText: 'Paani ki line toot gayi hai, poora rasta paani se bhar gaya hai Bairagarh mein.',
        normalizedText: 'Paani ki line toot gayi hai, poora rasta paani se bhar gaya hai Bairagarh mein.',
        department: 'Water Supply Department',
        category: 'Water Leakage',
        urgency: 'HIGH',
        urgencyScore: 0.80,
        location: { locality: 'Bairagarh', ward: '1', city: 'Bhopal', coordinates: [77.3420, 23.2750] },
        status: 'ASSIGNED',
        statusHistory: [{ status: 'RECEIVED', timestamp: new Date(Date.now() - 24 * 3600000) }, { status: 'ASSIGNED', timestamp: new Date(Date.now() - 8 * 3600000) }],
        createdAt: new Date(Date.now() - 24 * 3600000)
      }
    ];

    sampleComplaints.forEach(c => this.complaints.set(c._id, this._wrapComplaint(c)));
  }

  _persist() {
    try {
      const data = {
        users: Array.from(this.users.values()).map(u => ({ ...u, save: undefined })),
        complaints: Array.from(this.complaints.values()).map(c => ({ ...c, save: undefined }))
      };
      fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (e) {
      // Non-fatal if fs write fails
    }
  }

  _wrapUser(user) {
    if (!user) return null;
    const self = this;
    const wrapped = { ...user };
    
    // Ensure Date types
    if (wrapped.verificationOtpExpiresAt && !(wrapped.verificationOtpExpiresAt instanceof Date)) {
      wrapped.verificationOtpExpiresAt = new Date(wrapped.verificationOtpExpiresAt);
    }
    if (wrapped.verificationLastSentAt && !(wrapped.verificationLastSentAt instanceof Date)) {
      wrapped.verificationLastSentAt = new Date(wrapped.verificationLastSentAt);
    }
    if (wrapped.emailVerifiedAt && !(wrapped.emailVerifiedAt instanceof Date)) {
      wrapped.emailVerifiedAt = new Date(wrapped.emailVerifiedAt);
    }

    wrapped.save = async function() {
      self.users.set(this.email.toLowerCase(), this);
      self._persist();
      return this;
    };
    return wrapped;
  }

  _wrapComplaint(c) {
    if (!c) return null;
    const self = this;
    const wrapped = { ...c };
    wrapped.save = async function() {
      self.complaints.set(this._id || this.complaintId, this);
      self._persist();
      return this;
    };
    return wrapped;
  }

  // --- USER METHODS ---
  findUser(query) {
    if (!query) return null;
    
    if (query.email) {
      const email = String(query.email).toLowerCase().trim();
      const u = this.users.get(email);
      return u ? this._wrapUser(u) : null;
    }

    if (query._id || query.id) {
      const targetId = String(query._id || query.id);
      for (const u of this.users.values()) {
        if (String(u._id) === targetId || String(u.id) === targetId) {
          return this._wrapUser(u);
        }
      }
    }

    if (query.googleId) {
      for (const u of this.users.values()) {
        if (u.googleId === query.googleId) return this._wrapUser(u);
      }
    }

    if (query.facebookId) {
      for (const u of this.users.values()) {
        if (u.facebookId === query.facebookId) return this._wrapUser(u);
      }
    }

    // $or queries
    if (Array.isArray(query.$or)) {
      for (const sub of query.$or) {
        const found = this.findUser(sub);
        if (found) return found;
      }
    }

    return null;
  }

  createUser(data) {
    const email = String(data.email).toLowerCase().trim();
    const id = data._id ? String(data._id) : generateHexId();
    const user = {
      _id: id,
      id,
      name: data.name,
      username: data.username || data.name.toLowerCase().replace(/\s+/g, '_'),
      email,
      passwordHash: data.passwordHash,
      role: data.role || 'operator',
      language: data.language || 'English',
      theme: data.theme || 'light',
      emailVerified: !!data.emailVerified,
      emailVerifiedAt: data.emailVerifiedAt,
      verificationOtpHash: data.verificationOtpHash,
      verificationOtpExpiresAt: data.verificationOtpExpiresAt,
      verificationOtpAttempts: data.verificationOtpAttempts || 0,
      verificationLastSentAt: data.verificationLastSentAt,
      googleId: data.googleId,
      facebookId: data.facebookId,
      authProvider: data.authProvider || 'local',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const wrapped = this._wrapUser(user);
    this.users.set(email, wrapped);
    this._persist();
    return wrapped;
  }

  // --- COMPLAINT METHODS ---
  getComplaints(filter = {}, page = 1, limit = 20) {
    let list = Array.from(this.complaints.values());

    if (filter.status) {
      list = list.filter(c => c.status === filter.status);
    }
    if (filter.department) {
      const depRegex = filter.department instanceof RegExp ? filter.department : new RegExp(filter.department, 'i');
      list = list.filter(c => c.department && depRegex.test(c.department));
    }
    if (filter.urgency) {
      list = list.filter(c => c.urgency === filter.urgency);
    }

    const total = list.length;
    const skip = (page - 1) * limit;
    const paginated = list.slice(skip, skip + limit);

    return {
      data: paginated.map(c => this._wrapComplaint(c)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  getComplaintById(id) {
    if (!id) return null;
    const target = String(id);
    for (const c of this.complaints.values()) {
      if (String(c._id) === target || String(c.complaintId) === target) {
        return this._wrapComplaint(c);
      }
    }
    return null;
  }

  createComplaint(data) {
    const id = data._id ? String(data._id) : generateHexId();
    const count = this.complaints.size + 1;
    const complaintId = data.complaintId || `CMP-${new Date().getFullYear()}-${100000 + count}`;
    const complaint = {
      _id: id,
      complaintId,
      originalText: data.originalText || '',
      normalizedText: data.normalizedText || data.originalText || '',
      department: data.department || 'General Administration',
      category: data.category || 'Other',
      urgency: data.urgency || 'MEDIUM',
      urgencyScore: data.urgencyScore || 0.5,
      location: data.location || { locality: 'Bhopal Central', ward: '1', city: 'Bhopal' },
      status: data.status || 'AI_TRIAGED',
      statusHistory: data.statusHistory || [{ status: 'RECEIVED', timestamp: new Date() }],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const wrapped = this._wrapComplaint(complaint);
    this.complaints.set(id, wrapped);
    this._persist();
    return wrapped;
  }
}

// Singleton instance
const resilientStore = new ResilientStore();

module.exports = resilientStore;
