import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, Building2, Send, Tag, Flame } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge, UrgencyBadge } from '../ui/Badge';
import { useAppContext } from '../../context/AppContext';
import { useTranslation } from '../../context/LanguageContext';

const DEPARTMENTS = [
  'Sanitation Department',
  'Water Supply Department',
  'Roads & Infrastructure',
  'Street Lighting',
  'Drainage Department',
  'Parks & Horticulture',
  'Health & Solid Waste',
  'General Administration'
];

const URGENCIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export function RouteComplaintModal({ isOpen, complaint, onClose, onSuccess }) {
  const { updateComplaintStatus } = useAppContext();
  const { t } = useTranslation();

  const [department, setDepartment] = useState('');
  const [category, setCategory] = useState('');
  const [urgency, setUrgency] = useState('MEDIUM');
  const [operatorNotes, setOperatorNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (complaint) {
      setDepartment(complaint.department || 'Sanitation Department');
      setCategory(complaint.category || 'General Civic Grievance');
      setUrgency(complaint.urgency || 'MEDIUM');
      setOperatorNotes(complaint.operatorNotes || '');
      setError(null);
    }
  }, [complaint, isOpen]);

  // Handle escape key and body scroll lock
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !submitting) onClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, submitting, onClose]);

  if (!isOpen || !complaint) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!department) {
      setError('Please select an assigned department for routing.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const complaintId = complaint._id || complaint.id || complaint.complaintId;

    try {
      const updated = await updateComplaintStatus(
        complaintId,
        'ASSIGNED',
        urgency,
        category,
        department,
        operatorNotes
      );

      if (onSuccess) {
        onSuccess(updated || { ...complaint, status: 'ASSIGNED', department, category, urgency, operatorNotes });
      }
      onClose();
    } catch (err) {
      console.error('Confirm & Route failed:', err);
      const msg = err.response?.data?.error?.message || err.message || 'Routing request failed on server. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const displayId = complaint.complaintId || complaint.id || complaint._id;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose();
      }}
    >
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden text-slate-800 dark:text-slate-100 transition-all max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300">
              <CheckCircle size={18} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {t('confirmAndRoute', 'Confirm & Route Complaint')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                Ticket #{displayId}
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
              <AlertTriangle size={15} className="shrink-0 mt-0.5 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Complaint Snippet Card */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-xs space-y-1.5">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="font-medium">Current Status: <strong className="text-slate-700 dark:text-slate-300">{complaint.status}</strong></span>
              <span>Ward: <strong className="text-slate-700 dark:text-slate-300">{complaint.ward || complaint.location?.ward || 'Unassigned'}</strong></span>
            </div>
            <p className="text-slate-700 dark:text-slate-300 italic line-clamp-2">
              "{complaint.originalText || complaint.description || 'No description'}"
            </p>
          </div>

          {/* Department Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Assigned Department <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                disabled={submitting}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Department...</option>
                {DEPARTMENTS.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Category & Urgency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={submitting}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                placeholder="Category name"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Priority / Urgency
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
                disabled={submitting}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-semibold"
              >
                {URGENCIES.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Operator Instructions / Routing Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Operator Routing Notes (Optional)
            </label>
            <textarea
              rows={3}
              value={operatorNotes}
              onChange={(e) => setOperatorNotes(e.target.value)}
              disabled={submitting}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
              placeholder="Instructions for field team or dispatch unit..."
            />
          </div>

          {/* Routing Outcome Notice */}
          <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900 text-[11px] text-blue-800 dark:text-blue-300 leading-relaxed">
            Routing this complaint will set its status to <strong>ASSIGNED</strong> and record your operator decision in the audit log.
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting}
              className="text-xs sm:text-sm h-9"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="text-xs sm:text-sm h-9 bg-blue-600 hover:bg-blue-700 text-white shadow-xs font-semibold"
            >
              {submitting ? (
                <>
                  <span className="animate-spin mr-1.5 inline-block h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full"></span>
                  Routing...
                </>
              ) : (
                <>
                  <Send size={14} className="mr-1.5" />
                  Confirm & Route
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
