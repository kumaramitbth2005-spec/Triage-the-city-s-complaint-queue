import React, { useState, useEffect } from 'react';
import { X, ShieldAlert, AlertTriangle, Flame, ArrowUpRight, CheckCircle, Tag, Clock } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge, UrgencyBadge } from '../ui/Badge';
import { useAppContext } from '../../context/AppContext';
import { useTranslation } from '../../context/LanguageContext';

const QUICK_REASONS = [
  'SLA Deadline Breached',
  'Severe Public Safety Hazard',
  'Repeated Citizen Grievances',
  'Field Team Unresponsive / Delayed',
  'Hazard Near School / Hospital / Transit'
];

const TIER_NAMES = {
  1: 'Tier 1: Senior Field Supervisor',
  2: 'Tier 2: Department Head & Zonal Officer',
  3: 'Tier 3: Municipal Commissioner Emergency Directive'
};

export function EscalateComplaintModal({ isOpen, complaint, onClose, onSuccess }) {
  const { escalateComplaint } = useAppContext();
  const { t } = useTranslation();

  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const currentLevel = complaint?.escalation?.level || 0;
  const nextLevel = currentLevel + 1;
  const isMaxLevel = currentLevel >= 3;
  const isClosed = complaint?.status === 'RESOLVED' || complaint?.status === 'REJECTED';

  useEffect(() => {
    if (isOpen) {
      setReason('');
      setNotes('');
      setError(null);
    }
  }, [isOpen]);

  // Lock body scroll and handle Escape key
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

  const displayId = complaint.complaintId || complaint.id || complaint._id;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isClosed) {
      setError(`Cannot escalate a closed complaint (${complaint.status}).`);
      return;
    }
    if (isMaxLevel) {
      setError('This complaint has already reached the maximum escalation tier (Level 3).');
      return;
    }
    if (!reason.trim()) {
      setError('Please provide an escalation reason.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const complaintId = complaint._id || complaint.id || complaint.complaintId;

    try {
      const updated = await escalateComplaint(complaintId, {
        reason: reason.trim(),
        notes: notes.trim()
      });

      if (onSuccess) {
        onSuccess(updated || {
          ...complaint,
          urgency: nextLevel >= 2 ? 'CRITICAL' : 'HIGH',
          escalation: {
            level: nextLevel,
            isEscalated: true,
            reason: reason.trim()
          }
        });
      }
      onClose();
    } catch (err) {
      console.error('Escalation failed:', err);
      const msg = err.response?.data?.error?.message || err.message || 'Escalation failed on server. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

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
            <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
              <ShieldAlert size={18} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {t('escalateComplaint', 'Escalate Complaint')}
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

          {/* Warning banner if closed or max level */}
          {isClosed ? (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 text-xs">
              <strong>Notice:</strong> This complaint is currently marked as <strong>{complaint.status}</strong>. Resolved or rejected complaints cannot be escalated.
            </div>
          ) : isMaxLevel ? (
            <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 text-purple-800 dark:text-purple-300 text-xs">
              <strong>Maximum Escalation:</strong> This ticket has already reached the highest SLA authority level (Level 3).
            </div>
          ) : null}

          {/* Escalation Tier Comparison */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Current Level:</span>
              <Badge variant="outline" className="font-semibold text-xs">
                {currentLevel === 0 ? 'Standard Queue (Level 0)' : `Level ${currentLevel}`}
              </Badge>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200/60 dark:border-slate-800 pt-2">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Next Escalation Authority:</span>
              <span className="font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                <ArrowUpRight size={14} />
                {TIER_NAMES[nextLevel] || `Level ${nextLevel}`}
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200/60 dark:border-slate-800 pt-2">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Priority Elevation:</span>
              <div className="flex items-center gap-1.5">
                <UrgencyBadge level={complaint.urgency || 'MEDIUM'} />
                <span className="text-slate-400">&rarr;</span>
                <UrgencyBadge level={nextLevel >= 2 ? 'CRITICAL' : 'HIGH'} />
              </div>
            </div>
          </div>

          {/* Quick Reason Suggestions */}
          {!isClosed && !isMaxLevel && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Quick Reason Select
              </label>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_REASONS.map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setReason(r)}
                    className={`px-2.5 py-1 rounded-lg text-xs transition-colors border ${
                      reason === r 
                        ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-medium'
                        : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Required Escalation Reason */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Escalation Reason <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={submitting || isClosed || isMaxLevel}
              required
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-rose-500 placeholder:text-slate-400"
              placeholder="State the justification for escalating this complaint to senior municipal leadership..."
            />
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Additional Directives (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={submitting || isClosed || isMaxLevel}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-rose-500 placeholder:text-slate-400"
              placeholder="E.g. Expedited 4-hour SLA window required"
            />
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
              disabled={submitting || isClosed || isMaxLevel}
              className="text-xs sm:text-sm h-9 bg-rose-600 hover:bg-rose-700 text-white shadow-xs font-semibold disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <span className="animate-spin mr-1.5 inline-block h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full"></span>
                  Escalating...
                </>
              ) : (
                <>
                  <Flame size={14} className="mr-1.5" />
                  Confirm Escalation
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
