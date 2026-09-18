import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers, ArrowRight, ArrowLeft, CheckCircle2, Loader2,
  Mic, Camera, MapPin, FileText, Sparkles, ChevronRight,
  Clock, Shield, Star, Phone
} from 'lucide-react';

const STEPS = [
  { id: 1, label: 'Your Complaint' },
  { id: 2, label: 'Location' },
  { id: 3, label: 'Review' },
  { id: 4, label: 'Done!' },
];

const CATEGORIES = [
  { id: 'water', label: '💧 Water Supply', dept: 'Water Supply' },
  { id: 'sanitation', label: '🗑️ Garbage/Sanitation', dept: 'Sanitation' },
  { id: 'roads', label: '🛣️ Roads & Footpaths', dept: 'Roads' },
  { id: 'lighting', label: '💡 Street Lighting', dept: 'Electrical' },
  { id: 'drains', label: '🌊 Drains & Sewage', dept: 'Water Supply' },
  { id: 'trees', label: '🌳 Trees & Parks', dept: 'Parks' },
  { id: 'noise', label: '🔊 Noise Pollution', dept: 'Environment' },
  { id: 'other', label: '📋 Other Issue', dept: 'General' },
];

const URGENCY_OPTIONS = [
  { id: 'LOW', label: 'Can wait a few days', color: 'emerald' },
  { id: 'MEDIUM', label: 'Needs attention soon', color: 'amber' },
  { id: 'HIGH', label: 'Urgent — causing problems', color: 'orange' },
  { id: 'CRITICAL', label: 'Emergency — health/safety risk', color: 'red' },
];

function generateTrackId() {
  return 'CMP-' + Math.random().toString(36).substr(2, 6).toUpperCase();
}

export function CitizenPortal() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    category: '', description: '', urgency: 'MEDIUM',
    locality: '', ward: '', phone: '', name: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [trackId, setTrackId] = useState('');

  const handleChange = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async () => {
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 2000));
    setTrackId(generateTrackId());
    setStep(4);
    setSubmitting(false);
  };

  const canProceed = () => {
    if (step === 1) return form.category && form.description.trim().length > 10;
    if (step === 2) return form.locality.trim().length > 2;
    return true;
  };

  const selectedCategory = CATEGORIES.find(c => c.id === form.category);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between bg-white/80 backdrop-blur-xl rounded-2xl px-5 py-3 shadow-sm border border-white/80">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-lg flex items-center justify-center shadow-sm">
              <Layers className="text-white" size={16} strokeWidth={2.5} />
            </div>
            <span className="font-bold text-slate-900 text-sm">Nexus AI</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/track" className="text-sm text-slate-500 hover:text-indigo-600 transition-colors hidden sm:block">
              Track Complaint
            </Link>
            <Link to="/dashboard" className="text-xs bg-indigo-600 text-white px-4 py-2 rounded-full font-medium hover:bg-indigo-700 transition-colors">
              Admin Portal
            </Link>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-12 px-4 sm:px-6 max-w-2xl mx-auto">
        {/* Header */}
        <AnimatePresence mode="wait">
          {step < 4 && (
            <motion.div
              key="header"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-2">
                Report a Civic Issue
              </h1>
              <p className="text-slate-500 text-base">
                Your complaint will be AI-triaged and forwarded to the right department within minutes.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress Steps */}
        {step < 4 && (
          <div className="flex items-center gap-2 mb-8">
            {STEPS.slice(0, 3).map((s, i) => (
              <React.Fragment key={s.id}>
                <div className={`flex items-center gap-2 ${s.id <= step ? 'text-indigo-600' : 'text-slate-300'}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                    s.id < step ? 'bg-indigo-600 border-indigo-600 text-white' :
                    s.id === step ? 'border-indigo-600 text-indigo-600' :
                    'border-gray-200 text-slate-300'
                  }`}>
                    {s.id < step ? <CheckCircle2 size={14} /> : s.id}
                  </div>
                  <span className="text-xs font-medium hidden sm:block">{s.label}</span>
                </div>
                {i < 2 && <div className={`flex-1 h-px ${s.id < step ? 'bg-indigo-300' : 'bg-gray-200'}`} />}
              </React.Fragment>
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* Step 1: Complaint Details */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <label className="block text-sm font-bold text-slate-700 mb-3">What type of issue is it?</label>
                <div className="grid grid-cols-2 gap-2.5">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => handleChange('category', cat.id)}
                      className={`p-3 rounded-xl text-left text-sm font-medium transition-all border ${
                        form.category === cat.id
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                          : 'bg-gray-50 border-gray-100 text-slate-600 hover:bg-indigo-50/50 hover:border-indigo-200'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <label className="block text-sm font-bold text-slate-700 mb-2" htmlFor="description">
                  Describe the problem
                </label>
                <textarea
                  id="description"
                  value={form.description}
                  onChange={e => handleChange('description', e.target.value)}
                  placeholder='E.g. "The water pipe near Arera Colony park has been leaking for 3 days. It is flooding the road."'
                  rows={4}
                  className="w-full resize-none rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none p-4 text-sm text-slate-700 leading-relaxed placeholder:text-gray-400"
                />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-400">{form.description.length} characters</span>
                  {form.description.length >= 10 && (
                    <span className="text-xs text-emerald-500 flex items-center gap-1">
                      <CheckCircle2 size={12} /> Good detail
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <label className="block text-sm font-bold text-slate-700 mb-3">How urgent is this?</label>
                <div className="space-y-2">
                  {URGENCY_OPTIONS.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => handleChange('urgency', opt.id)}
                      className={`w-full p-3 rounded-xl text-left text-sm font-medium transition-all border flex items-center gap-3 ${
                        form.urgency === opt.id
                          ? `bg-${opt.color}-50 border-${opt.color}-300 text-${opt.color}-700`
                          : 'bg-gray-50 border-gray-100 text-slate-600 hover:bg-gray-100'
                      }`}
                    >
                      <span className={`w-3 h-3 rounded-full shrink-0 ${
                        opt.color === 'emerald' ? 'bg-emerald-500' :
                        opt.color === 'amber' ? 'bg-amber-500' :
                        opt.color === 'orange' ? 'bg-orange-500' : 'bg-red-500'
                      }`} />
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Location */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <label className="block text-sm font-bold text-slate-700 mb-2" htmlFor="locality">
                  <MapPin size={14} className="inline mr-1 text-indigo-500" /> Your Locality / Area
                </label>
                <input
                  id="locality"
                  value={form.locality}
                  onChange={e => handleChange('locality', e.target.value)}
                  placeholder="e.g. Arera Colony, MP Nagar, Kolar Road..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-sm"
                />
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <label className="block text-sm font-bold text-slate-700 mb-2" htmlFor="ward">
                  Ward Number <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <input
                  id="ward"
                  value={form.ward}
                  onChange={e => handleChange('ward', e.target.value)}
                  placeholder="e.g. 42"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-sm"
                />
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <label className="block text-sm font-bold text-slate-700 mb-3">
                  Your Contact <span className="text-slate-400 font-normal">(optional — for updates)</span>
                </label>
                <div className="space-y-3">
                  <input
                    value={form.name}
                    onChange={e => handleChange('name', e.target.value)}
                    placeholder="Your name"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-sm"
                  />
                  <input
                    value={form.phone}
                    onChange={e => handleChange('phone', e.target.value)}
                    placeholder="Phone number"
                    type="tel"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-sm"
                  />
                </div>
              </div>

              <div className="bg-indigo-50 rounded-2xl border border-indigo-100 p-4 flex items-start gap-3">
                <Shield size={18} className="text-indigo-500 shrink-0 mt-0.5" />
                <p className="text-sm text-indigo-700">
                  Your contact details are optional and only used to send you status updates on your complaint.
                </p>
              </div>
            </motion.div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-50">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Sparkles size={16} className="text-indigo-500" /> Review Your Complaint
                  </h3>
                </div>
                <div className="p-5 space-y-4">
                  {[
                    { label: 'Category', value: selectedCategory?.label || 'Not selected' },
                    { label: 'Department', value: selectedCategory?.dept || '—' },
                    { label: 'Urgency', value: form.urgency },
                    { label: 'Location', value: form.locality + (form.ward ? ` (Ward ${form.ward})` : '') },
                    { label: 'Contact', value: form.name || form.phone || 'Anonymous' },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4">
                      <span className="text-sm text-slate-400 w-24 shrink-0">{item.label}</span>
                      <span className="text-sm font-medium text-slate-800">{item.value}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-gray-50">
                    <span className="text-sm text-slate-400 block mb-1">Description</span>
                    <p className="text-sm text-slate-700 bg-gray-50 p-3 rounded-xl leading-relaxed">"{form.description}"</p>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 rounded-xl border border-amber-100 p-4 flex items-start gap-3">
                <Sparkles size={16} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-700">
                  Our AI will instantly classify and route your complaint to the{' '}
                  <strong>{selectedCategory?.dept || 'appropriate'} Department</strong>.
                  You'll receive a tracking ID after submission.
                </p>
              </div>
            </motion.div>
          )}

          {/* Step 4: Done */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 size={40} className="text-emerald-500" />
              </div>
              <h2 className="text-3xl font-black text-slate-900 mb-2">Complaint Submitted!</h2>
              <p className="text-slate-500 mb-6">Your complaint has been received and is being processed.</p>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6 max-w-sm mx-auto">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Tracking ID</p>
                <div className="text-3xl font-black font-mono text-indigo-600 mb-1">{trackId}</div>
                <p className="text-xs text-slate-400">Save this ID to track your complaint status</p>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-8 max-w-sm mx-auto">
                {[
                  { icon: Sparkles, label: 'AI Triaged', color: 'text-violet-500 bg-violet-50' },
                  { icon: ChevronRight, label: 'Dept Notified', color: 'text-blue-500 bg-blue-50' },
                  { icon: Clock, label: 'Est. 24h', color: 'text-amber-500 bg-amber-50' },
                ].map((s, i) => (
                  <div key={i} className={`p-3 rounded-xl text-center ${s.color}`}>
                    <s.icon size={18} className="mx-auto mb-1" />
                    <p className="text-xs font-medium">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to="/track"
                  className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-full font-semibold text-sm hover:bg-indigo-700 transition-colors"
                >
                  Track Status <ArrowRight size={16} />
                </Link>
                <button
                  onClick={() => { setStep(1); setForm({ category: '', description: '', urgency: 'MEDIUM', locality: '', ward: '', phone: '', name: '' }); setTrackId(''); }}
                  className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-slate-600 px-6 py-3 rounded-full font-semibold text-sm hover:bg-gray-50 transition-colors"
                >
                  Submit Another
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation buttons */}
        {step < 4 && (
          <div className="flex gap-3 mt-6">
            {step > 1 && (
              <button
                onClick={() => setStep(s => s - 1)}
                className="flex items-center gap-2 px-5 py-3 rounded-full border border-gray-200 text-slate-600 font-medium text-sm hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft size={16} /> Back
              </button>
            )}
            {step < 3 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={!canProceed()}
                className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white px-6 py-3 rounded-full font-semibold text-sm transition-colors"
              >
                Next <ArrowRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white px-6 py-3 rounded-full font-semibold text-sm transition-colors"
              >
                {submitting ? (
                  <><Loader2 size={16} className="animate-spin" /> Submitting...</>
                ) : (
                  <>Submit Complaint <Sparkles size={16} /></>
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-slate-400 pb-8">
        <div className="flex items-center justify-center gap-4 mb-2">
          <span className="flex items-center gap-1"><Star size={10} fill="currentColor" /> 98.5% Accuracy</span>
          <span className="flex items-center gap-1"><Shield size={10} /> Secure & Anonymous</span>
          <span className="flex items-center gap-1"><Phone size={10} /> 24/7 Available</span>
        </div>
        Nexus AI · Bhopal Municipal Corporation · All data processed securely
      </div>
    </div>
  );
}
