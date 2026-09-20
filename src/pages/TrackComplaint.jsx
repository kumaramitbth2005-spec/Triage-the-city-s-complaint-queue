import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Layers, Search, ArrowRight, CheckCircle2, Clock,
  AlertCircle, Sparkles, MapPin, Building2, ChevronRight
} from 'lucide-react';
import { complaintApi } from '../api/complaintApi';
import { useAppContext } from '../context/AppContext';

const MOCK_STATUSES = {
  'CMP-A1B2C3': {
    id: 'CMP-A1B2C3', category: 'Water Supply', dept: 'Water Supply Department',
    locality: 'Arera Colony', ward: '42', urgency: 'HIGH', status: 'In Progress',
    submittedAt: '2 days ago',
    timeline: [
      { event: 'Complaint Submitted', time: '2 days ago', done: true },
      { event: 'AI Triaged — Water Supply Dept.', time: '2 days ago', done: true },
      { event: 'Forwarded to Department', time: '1 day ago', done: true },
      { event: 'Under Investigation', time: '6 hours ago', done: true },
      { event: 'Resolution in Progress', time: 'Now', done: false },
      { event: 'Resolved & Closed', time: 'Estimated: Tomorrow', done: false },
    ]
  }
};

const formatComplaintForTracking = (c) => {
  const statusMap = {
    'RECEIVED': 'Submitted',
    'AI_TRIAGED': 'In Progress',
    'AWAITING_REVIEW': 'In Progress',
    'ASSIGNED': 'In Progress',
    'IN_PROGRESS': 'In Progress',
    'RESOLVED': 'Resolved',
    'REJECTED': 'Escalated',
    'DUPLICATE': 'Resolved',
    'NEEDS_INFORMATION': 'In Progress',
    'Needs Review': 'In Progress',
    'New': 'Submitted'
  };

  const isResolved = c.status === 'RESOLVED' || c.status === 'Resolved';
  const isAssigned = isResolved || c.status === 'ASSIGNED' || c.status === 'IN_PROGRESS';
  const isTriaged = isAssigned || c.status === 'AI_TRIAGED' || c.status === 'AWAITING_REVIEW';

  const timeStr = c.timestamp || c.createdAt;
  const formattedDate = timeStr ? new Date(timeStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently';

  return {
    id: c.complaintId || c.id || c._id,
    category: c.category || 'Civic Issue',
    dept: c.department || 'Municipal Administration',
    locality: c.location?.locality || c.normalizedLocality || 'Bhopal',
    ward: c.location?.ward || c.ward || '1',
    urgency: c.urgency || 'MEDIUM',
    status: statusMap[c.status] || c.status || 'In Progress',
    submittedAt: formattedDate,
    originalText: c.originalText || c.description,
    timeline: [
      { event: 'Complaint Submitted & Logged', time: formattedDate, done: true },
      { event: `AI Triaged — ${c.department || 'Assigned Department'}`, time: 'Verified', done: isTriaged },
      { event: `Forwarded to ${c.department || 'Department'} Field Team`, time: isAssigned ? 'Active' : 'Pending', done: isAssigned },
      { event: 'Field Inspection & Remediation', time: isAssigned ? 'In Progress' : 'Pending', done: isAssigned },
      { event: 'Resolution Verified & Closed', time: isResolved ? 'Completed' : 'Estimated: 24-48h', done: isResolved }
    ]
  };
};

export function TrackComplaint() {
  const [searchParams] = useSearchParams();
  const { complaints } = useAppContext();
  const [query, setQuery] = useState(searchParams.get('id') || '');
  const [result, setResult] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = useCallback(async (searchTarget) => {
    const rawId = (searchTarget || query || '').trim();
    if (!rawId) return;

    setLoading(true);
    setNotFound(false);

    const cleanId = rawId.toUpperCase();

    // 1. Check in AppContext complaints first
    const localMatch = complaints.find(
      c => (c.id && c.id.toUpperCase() === cleanId) ||
           (c.complaintId && c.complaintId.toUpperCase() === cleanId) ||
           (c._id && c._id.toUpperCase() === cleanId)
    );

    if (localMatch) {
      setResult(formatComplaintForTracking(localMatch));
      setNotFound(false);
      setLoading(false);
      return;
    }

    // 2. Try fetching from backend API
    try {
      const res = await complaintApi.getById(cleanId);
      if (res.data?.data) {
        setResult(formatComplaintForTracking(res.data.data));
        setNotFound(false);
        setLoading(false);
        return;
      }
    } catch {
      // Backend not found or offline, proceed to fallback
    }

    // 3. Check mock demo statuses
    const mockMatch = MOCK_STATUSES[cleanId];
    if (mockMatch) {
      setResult(mockMatch);
      setNotFound(false);
    } else {
      setResult(null);
      setNotFound(true);
    }
    setLoading(false);
  }, [query, complaints]);

  useEffect(() => {
    const paramId = searchParams.get('id');
    if (paramId) {
      setQuery(paramId);
      handleSearch(paramId);
    }
  }, [searchParams, handleSearch]);

  const statusColors = {
    'Submitted': 'bg-blue-100 text-blue-700',
    'In Progress': 'bg-amber-100 text-amber-700',
    'Resolved': 'bg-emerald-100 text-emerald-700',
    'Escalated': 'bg-red-100 text-red-700',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between bg-white/80 backdrop-blur-xl rounded-2xl px-5 py-3 shadow-sm border border-white/80">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-lg flex items-center justify-center shadow-sm">
              <Layers className="text-white" size={16} strokeWidth={2.5} />
            </div>
            <span className="font-bold text-slate-900 text-sm">Nexus AI</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/report" className="text-sm text-slate-500 hover:text-indigo-600 transition-colors hidden sm:block">
              Report Issue
            </Link>
            <Link to="/dashboard" className="text-xs bg-indigo-600 text-white px-4 py-2 rounded-full font-medium hover:bg-indigo-700 transition-colors">
              Admin
            </Link>
          </div>
        </div>
      </nav>

      <div className="pt-28 pb-12 px-4 sm:px-6 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-2">Track Your Complaint</h1>
          <p className="text-slate-500">Enter your complaint tracking ID to see real-time status.</p>
        </motion.div>

        {/* Search box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6"
        >
          <label className="block text-sm font-bold text-slate-700 mb-3">Enter Tracking ID</label>
          <div className="flex gap-3">
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="e.g. CMP-2026-100001"
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-sm font-mono"
            />
            <button
              onClick={() => handleSearch()}
              disabled={loading || !query.trim()}
              className="px-5 py-3 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2 shrink-0"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Search size={16} />
              )}
              Track
            </button>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400">Quick test IDs:</span>
            {['CMP-2026-100001', 'CMP-2026-100003', 'CMP-2026-100004', 'CMP-A1B2C3'].map(id => (
              <button
                key={id}
                type="button"
                onClick={() => { setQuery(id); handleSearch(id); }}
                className="text-xs bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 px-2.5 py-1 rounded-md font-mono transition-colors"
              >
                {id}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Not found */}
        {notFound && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 rounded-2xl border border-red-100 p-5 flex items-start gap-3 mb-6"
          >
            <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-800">Complaint Not Found</p>
              <p className="text-sm text-red-600 mt-0.5">No complaint found with ID "{query}". Please check and try again.</p>
            </div>
          </motion.div>
        )}

        {/* Result */}
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Status card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-50">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">{result.category}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin size={13} className="text-slate-400" />
                      <span className="text-sm text-slate-500">{result.locality}, Ward {result.ward}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Building2 size={13} className="text-slate-400" />
                      <span className="text-sm text-slate-500">{result.dept}</span>
                    </div>
                  </div>
                  <div>
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${statusColors[result.status] || 'bg-gray-100 text-gray-700'}`}>
                      {result.status}
                    </span>
                    <div className="text-xs text-slate-400 mt-1.5 text-right">Submitted {result.submittedAt}</div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="p-5">
                <h4 className="text-sm font-bold text-slate-700 mb-4">Progress Timeline</h4>
                <div className="space-y-3">
                  {result.timeline.map((t, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        t.done ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {t.done ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${t.done ? 'text-slate-800' : 'text-slate-400'}`}>{t.event}</p>
                        <p className="text-xs text-slate-400">{t.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Link
                to="/report"
                className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 text-slate-600 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Report Another
              </Link>
              <button
                onClick={() => { setResult(null); setQuery(''); }}
                className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                Track Different ID
              </button>
            </div>
          </motion.div>
        )}

        {/* Promo */}
        {!result && !notFound && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-3 gap-3 text-center"
          >
            {[
              { icon: Sparkles, label: 'AI-Powered', desc: 'Smart routing' },
              { icon: Clock, label: 'Real-time', desc: 'Live updates' },
              { icon: CheckCircle2, label: '24h Target', desc: 'SLA guarantee' },
            ].map((f, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-4">
                <f.icon size={20} className="text-indigo-500 mx-auto mb-1.5" />
                <p className="text-xs font-bold text-slate-700">{f.label}</p>
                <p className="text-xs text-slate-400">{f.desc}</p>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
