import React from 'react';
import { CheckCircle, Download, ArrowRight, LayoutDashboard } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge, UrgencyBadge } from '../../components/ui/Badge';
import { useNavigate } from 'react-router-dom';

export function ComplaintReceipt({ complaint, onClose }) {
  const navigate = useNavigate();
  const date = new Date(complaint.createdAt).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const handlePrint = () => window.print();

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-400">
      {/* Success header */}
      <div className="flex flex-col items-center text-center py-4 gap-3">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
          <CheckCircle size={36} className="text-emerald-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Complaint Received</h2>
          <p className="text-sm text-slate-500 mt-1">Your complaint has been successfully submitted.</p>
        </div>
      </div>

      {/* Receipt card */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        {/* ID Banner */}
        <div className="bg-blue-600 text-white px-6 py-4">
          <p className="text-xs text-blue-200 uppercase tracking-wider font-semibold mb-1">Complaint ID</p>
          <p className="text-2xl font-bold font-mono tracking-wide">{complaint.id}</p>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Issue</p>
              <p className="font-semibold text-slate-800 text-sm">{complaint.category}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Department</p>
              <p className="font-semibold text-slate-800 text-sm">{complaint.department}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Location</p>
              <p className="font-semibold text-slate-800 text-sm">
                {complaint.normalizedLocality || 'Not specified'}
                {complaint.ward ? `, Ward ${complaint.ward}` : ''}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Urgency</p>
              <UrgencyBadge level={complaint.urgency} />
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Submitted</p>
              <p className="font-medium text-slate-700 text-sm">{date}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Status</p>
              <Badge variant="success">{complaint.status}</Badge>
            </div>
          </div>

          {/* Original text */}
          <div className="pt-3 border-t border-gray-100">
            <p className="text-xs text-slate-500 mb-1.5">Your Complaint</p>
            <p className="text-sm text-slate-600 italic leading-relaxed bg-slate-50 rounded-lg p-3">
              "{complaint.originalText}"
            </p>
          </div>

          {/* Data note */}
          <p className="text-[11px] text-slate-400">
            Your complaint is logged locally (mock mode). In production, it would be transmitted to the Municipal server.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          className="flex-1 gap-2"
          onClick={() => navigate('/complaints')}
        >
          <LayoutDashboard size={15} /> View in Dashboard
        </Button>
        <Button variant="outline" className="gap-2" onClick={handlePrint}>
          <Download size={15} /> Print Receipt
        </Button>
        <Button variant="ghost" onClick={onClose}>
          Report Another
        </Button>
      </div>
    </div>
  );
}
