import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { complaintApi } from '../api/complaintApi';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge, UrgencyBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import {
  ArrowLeft, MapPin, Clock, User, Mic, Image as ImageIcon, FileText,
  MessageSquare, Send, CheckCircle, AlertCircle, Sparkles, Activity,
  ChevronDown, ChevronUp, Copy, Check, ExternalLink, Trash2, Flame, ShieldAlert
} from 'lucide-react';
import { EvidenceChip } from '../components/ui/EvidenceChip';
import { copyToClipboard } from '../utils/clipboard';
import { RouteComplaintModal } from '../components/complaints/RouteComplaintModal';
import { EscalateComplaintModal } from '../components/complaints/EscalateComplaintModal';

const MOCK_TIMELINE = [
  { time: '2 hours ago', event: 'Complaint submitted via App', icon: FileText, color: 'blue' },
  { time: '1h 45m ago', event: 'AI triage completed — Dept: Water Supply, Urgency: HIGH', icon: Sparkles, color: 'violet' },
  { time: '1h 30m ago', event: 'Assigned to operator Priya S.', icon: User, color: 'emerald' },
  { time: '45 min ago', event: 'Forwarded to Water Supply Department', icon: Send, color: 'orange' },
];

const MOCK_MESSAGES = [
  { id: 1, sender: 'Priya S. (Operator)', time: '1h ago', text: 'This complaint has been escalated due to health risk. Water Supply team has been notified.', role: 'operator' },
  { id: 2, sender: 'Water Supply Dept.', time: '30m ago', text: 'Team dispatched to site. ETA 2 hours. Will update once resolved.', role: 'department' },
];

export function ComplaintDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { complaints, loading: contextLoading, deleteComplaint } = useAppContext();
  const [showFullText, setShowFullText] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [activeTab, setActiveTab] = useState('overview');
  const [deleting, setDeleting] = useState(false);
  const [apiComplaint, setApiComplaint] = useState(null);
  const [apiLoading, setApiLoading] = useState(false);

  // Modals & Feedback state
  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
  const [isEscalateModalOpen, setIsEscalateModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState(null);

  // Look for complaint in context complaints
  const contextComplaint = complaints.find(
    c => c.id === id || c.complaintId === id || c._id === id
  );

  useEffect(() => {
    // If not in context and not currently loading context, attempt fetch by ID
    if (!contextComplaint && id) {
      setApiLoading(true);
      complaintApi.getById(id)
        .then(res => {
          if (res.data?.data) {
            const raw = res.data.data;
            setApiComplaint({
              ...raw,
              id: raw.complaintId || raw._id,
              ward: raw.location?.ward || raw.ward || '1',
              normalizedLocality: raw.location?.locality || raw.normalizedLocality || 'Bhopal',
              urgencyReason: raw.aiAnalysis?.explanation?.[1] || '',
              sourceChannel: raw.inputMethod === 'voice' ? 'Voice' : 'App'
            });
          }
        })
        .catch(() => {})
        .finally(() => setApiLoading(false));
    }
  }, [id, contextComplaint]);

  const complaint = contextComplaint || apiComplaint;

  const handleCopyId = async (e) => {
    if (e) e.stopPropagation();
    const idToCopy = complaint?.complaintId || complaint?.id || complaint?._id;
    if (!idToCopy) {
      setFeedbackToast({ type: 'error', message: 'No valid complaint ID to copy.' });
      setTimeout(() => setFeedbackToast(null), 3000);
      return;
    }
    const ok = await copyToClipboard(idToCopy);
    if (ok) {
      setCopied(true);
      setFeedbackToast({ type: 'success', message: `Copied ticket ID #${idToCopy} to clipboard!` });
      setTimeout(() => setCopied(false), 2500);
      setTimeout(() => setFeedbackToast(null), 3500);
    } else {
      setFeedbackToast({ type: 'error', message: 'Unable to access clipboard. Please copy manually.' });
      setTimeout(() => setFeedbackToast(null), 3500);
    }
  };

  const handleRouteSuccess = (updated) => {
    setApiComplaint(prev => ({ ...(prev || {}), ...updated }));
    setFeedbackToast({
      type: 'success',
      message: `Complaint #${updated.complaintId || displayId} confirmed and routed to ${updated.department}!`
    });
    setTimeout(() => setFeedbackToast(null), 4000);
  };

  const handleEscalateSuccess = (updated) => {
    setApiComplaint(prev => ({ ...(prev || {}), ...updated }));
    setFeedbackToast({
      type: 'success',
      message: `Complaint #${updated.complaintId || displayId} successfully escalated to Level ${updated.escalation?.level || 1}!`
    });
    setTimeout(() => setFeedbackToast(null), 4000);
  };

  if (contextLoading || apiLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        <p className="text-xs text-slate-500 font-medium">Loading complaint details...</p>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
        <AlertCircle size={40} className="text-red-400" />
        <h2 className="text-xl font-bold text-slate-700">Complaint Not Found</h2>
        <p className="text-slate-500 text-sm">The complaint ID "{id}" does not exist or has been deleted.</p>
        <Button onClick={() => navigate('/dashboard/complaints')}>
          <ArrowLeft size={16} className="mr-2" /> Back to Complaints
        </Button>
      </div>
    );
  }

  const displayId = complaint.complaintId || complaint.id || complaint._id;

  const handleSendMessage = () => {
    if (!message.trim()) return;
    setMessages(prev => [...prev, {
      id: Date.now(), sender: 'You (Operator)', time: 'Just now',
      text: message.trim(), role: 'operator'
    }]);
    setMessage('');
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this complaint?')) return;
    setDeleting(true);
    try {
      await deleteComplaint(complaint.id);
      navigate('/dashboard/complaints');
    } catch {
      setDeleting(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'ai', label: 'AI Analysis' },
    { id: 'timeline', label: 'Timeline' },
    { id: 'messages', label: `Messages (${messages.length})` },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-4 w-full relative">
      {/* Toast Feedback Notification */}
      {feedbackToast && (
        <div 
          className={`p-3.5 rounded-xl border text-xs sm:text-sm font-semibold flex items-center justify-between shadow-lg transition-all animate-in fade-in slide-in-from-top-2 ${
            feedbackToast.type === 'success' 
              ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200' 
              : 'bg-rose-50 dark:bg-rose-950/80 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackToast.type === 'success' ? (
              <CheckCircle size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle size={16} className="text-rose-600 dark:text-rose-400 shrink-0" />
            )}
            <span>{feedbackToast.message}</span>
          </div>
          <button 
            onClick={() => setFeedbackToast(null)}
            className="text-xs opacity-70 hover:opacity-100 ml-4 px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate('/dashboard/complaints')}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-slate-500 transition-colors shrink-0"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white font-mono truncate">
                #{displayId}
              </h1>
              <Badge>{complaint.status}</Badge>
              <UrgencyBadge level={complaint.urgency} />
              {complaint.escalation?.isEscalated && (
                <Badge variant="danger" className="text-xs font-bold animate-pulse">
                  <Flame size={12} className="mr-1 inline-block" />
                  Level {complaint.escalation.level} Escalated
                </Badge>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 truncate">
              {complaint.department || 'Unassigned'} · {complaint.category || 'General'} · Ward {complaint.ward || '1'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          {/* Functional Copy ID Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyId}
            className="text-xs transition-all font-semibold"
            title={`Copy ticket ID ${displayId}`}
          >
            {copied ? (
              <>
                <Check size={13} className="mr-1.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy size={13} className="mr-1.5" />
                Copy ID
              </>
            )}
          </Button>

          <Button
            variant="danger"
            size="sm"
            onClick={handleDelete}
            disabled={deleting}
            className="text-xs"
          >
            <Trash2 size={13} className="mr-1.5" /> {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-slate-800 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main details */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader className="p-4 pb-3">
                <CardTitle className="text-base">Complaint Description</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex items-center gap-2 mb-3">
                  {complaint.inputType === 'Voice' ? (
                    <span className="flex items-center gap-1.5 text-xs text-purple-600 bg-purple-50 dark:bg-purple-950/50 px-2 py-1 rounded-md border border-purple-100 dark:border-purple-900">
                      <Mic size={12} /> Voice Input
                    </span>
                  ) : complaint.inputType === 'Image' ? (
                    <span className="flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 dark:bg-blue-950/50 px-2 py-1 rounded-md border border-blue-100 dark:border-blue-900">
                      <ImageIcon size={12} /> Photo Input
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-slate-800 px-2 py-1 rounded-md border border-gray-200 dark:border-slate-700">
                      <FileText size={12} /> Text Input
                    </span>
                  )}
                  <span className="text-xs text-gray-400">·</span>
                  <span className="text-xs text-gray-500 dark:text-slate-400">{complaint.language || 'English'}</span>
                </div>
                <p className={`text-slate-700 dark:text-slate-200 text-sm leading-relaxed bg-gray-50 dark:bg-slate-800/60 p-4 rounded-xl border border-gray-100 dark:border-slate-800 ${!showFullText ? 'line-clamp-4' : ''}`}>
                  "{complaint.originalText}"
                </p>
                {complaint.originalText?.length > 200 && (
                  <button
                    onClick={() => setShowFullText(!showFullText)}
                    className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    {showFullText ? <><ChevronUp size={12} /> Show less</> : <><ChevronDown size={12} /> Read more</>}
                  </button>
                )}
              </CardContent>
            </Card>

            {/* Escalation Alert Banner if Escalated */}
            {complaint.escalation?.isEscalated && (
              <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/30 flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 shrink-0 mt-0.5">
                  <Flame size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs sm:text-sm font-bold text-rose-900 dark:text-rose-200">
                      SLA Tier {complaint.escalation.level} Escalation Active
                    </h4>
                    <span className="text-[11px] text-rose-700 dark:text-rose-400">
                      {new Date(complaint.escalation.escalatedAt || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-rose-800 dark:text-rose-300/90 leading-relaxed mt-1">
                    <strong>Reason:</strong> {complaint.escalation.reason}
                  </p>
                  {complaint.escalation.notes && (
                    <p className="text-[11px] text-rose-700 dark:text-rose-400 mt-1">
                      <strong>Directive:</strong> {complaint.escalation.notes}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Location card */}
            <Card>
              <CardContent className="p-4 flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center shrink-0">
                  <MapPin size={18} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Location</p>
                  <p className="text-base font-semibold text-slate-800 dark:text-white">{complaint.normalizedLocality || complaint.locality || 'Bhopal'}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Ward {complaint.ward || '1'} · {complaint.city || 'Bhopal'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Actions Panel */}
            <Card>
              <CardContent className="p-4 flex flex-wrap gap-3">
                {/* Confirm & Route Button */}
                <Button
                  className="flex-1 font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                  onClick={() => setIsRouteModalOpen(true)}
                >
                  <CheckCircle size={16} className="mr-2" /> Confirm & Route
                </Button>

                {/* Full AI Triage Navigation Button */}
                <Button variant="outline" className="flex-1 font-semibold" onClick={() => navigate('/dashboard/triage')}>
                  <Sparkles size={16} className="mr-2" /> Full AI Triage
                </Button>

                {/* Escalate Button */}
                <Button 
                  variant="outline" 
                  className="flex-1 font-semibold border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  onClick={() => setIsEscalateModalOpen(true)}
                >
                  <Flame size={16} className="mr-2 text-rose-500" /> Escalate
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar info */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4 space-y-3">
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Department</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-white">{complaint.department || 'Not Assigned'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Category</p>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{complaint.category || 'General Civic Grievance'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">AI Confidence</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${complaint.confidence || 85}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{complaint.confidence || 85}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Submitted</p>
                  <div className="flex items-center gap-1.5 text-sm text-slate-700 dark:text-slate-300">
                    <Clock size={14} className="text-gray-400" />
                    {new Date(complaint.timestamp || complaint.createdAt || Date.now()).toLocaleString()}
                  </div>
                </div>
                {complaint.duplicateStatus === 'Possible' && (
                  <div className="p-2 bg-amber-50 dark:bg-amber-950/40 rounded-lg border border-amber-100 dark:border-amber-900 text-xs text-amber-700 dark:text-amber-300">
                    <AlertCircle size={12} className="inline mr-1" />
                    Possible duplicate detected
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* AI Analysis Tab */}
      {activeTab === 'ai' && (
        <Card>
          <CardHeader className="p-4 bg-blue-50/50 border-b border-blue-100">
            <CardTitle className="text-blue-900 flex items-center gap-2">
              <Sparkles size={18} className="text-blue-500" /> AI Triage Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Department', value: complaint.department },
                { label: 'Category', value: complaint.category },
                { label: 'Urgency', value: complaint.urgency },
                { label: 'Confidence', value: `${complaint.confidence}%` },
              ].map((item, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{item.label}</p>
                  <p className="text-sm font-bold text-slate-800">{item.value}</p>
                </div>
              ))}
            </div>

            {complaint.urgencyReason && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Urgency Reason</p>
                <p className="text-sm text-slate-700 bg-amber-50 p-3 rounded-lg border border-amber-100">{complaint.urgencyReason}</p>
              </div>
            )}

            {complaint.evidence?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Evidence Keywords</p>
                <div className="flex flex-wrap gap-2">
                  {complaint.evidence.map((ev, i) => (
                    <EvidenceChip key={i} evidence={ev} />
                  ))}
                </div>
              </div>
            )}

            {complaint.duplicateStatus === 'Possible' && (
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                <div className="flex items-center gap-2 font-semibold text-amber-800 mb-1">
                  <AlertCircle size={16} /> Possible Duplicate
                </div>
                <p className="text-sm text-amber-700">
                  This complaint may match existing records. Review duplicates in the
                  <button className="underline ml-1" onClick={() => navigate('/dashboard/clusters')}>Duplicate Clusters</button> view.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Timeline Tab */}
      {activeTab === 'timeline' && (
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="flex items-center gap-2">
              <Activity size={18} className="text-slate-500" /> Event Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="relative space-y-4">
              <div className="absolute left-5 top-0 bottom-0 w-px bg-gray-200" />
              {MOCK_TIMELINE.map((event, i) => (
                <div key={i} className="relative flex gap-4 items-start">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 ${
                    event.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                    event.color === 'violet' ? 'bg-violet-100 text-violet-600' :
                    event.color === 'emerald' ? 'bg-emerald-100 text-emerald-600' :
                    'bg-orange-100 text-orange-600'
                  }`}>
                    <event.icon size={18} />
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="text-sm font-medium text-slate-700">{event.event}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{event.time}</p>
                  </div>
                </div>
              ))}
              {/* Current state */}
              <div className="relative flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shrink-0 z-10">
                  <Activity size={18} className="text-white" />
                </div>
                <div className="flex-1 pb-4">
                  <p className="text-sm font-medium text-blue-600">Current Status: {complaint.status}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Now</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Messages Tab */}
      {activeTab === 'messages' && (
        <Card className="flex flex-col">
          <CardHeader className="p-4 border-b border-gray-100">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare size={18} className="text-slate-500" /> Department Communication
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 flex-1">
            <div className="space-y-3 mb-4 min-h-[200px]">
              {messages.map(msg => (
                <div key={msg.id} className={`flex gap-3 ${msg.role === 'department' ? 'justify-start' : 'justify-end flex-row-reverse'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    msg.role === 'department' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {msg.sender[0]}
                  </div>
                  <div className={`max-w-xs sm:max-w-md ${msg.role === 'department' ? 'items-start' : 'items-end'} flex flex-col gap-1`}>
                    <div className={`px-4 py-2.5 rounded-2xl text-sm text-slate-700 ${
                      msg.role === 'department' ? 'bg-gray-100 rounded-tl-sm' : 'bg-blue-50 border border-blue-100 rounded-tr-sm'
                    }`}>
                      {msg.text}
                    </div>
                    <p className="text-[10px] text-slate-400">{msg.sender} · {msg.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-3 border-t border-gray-100">
              <input
                type="text"
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                placeholder="Send a message to the department..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
              />
              <Button onClick={handleSendMessage} disabled={!message.trim()}>
                <Send size={16} />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Route & Confirm Modal */}
      <RouteComplaintModal
        isOpen={isRouteModalOpen}
        complaint={complaint}
        onClose={() => setIsRouteModalOpen(false)}
        onSuccess={handleRouteSuccess}
      />

      {/* Escalation Modal */}
      <EscalateComplaintModal
        isOpen={isEscalateModalOpen}
        complaint={complaint}
        onClose={() => setIsEscalateModalOpen(false)}
        onSuccess={handleEscalateSuccess}
      />
    </div>
  );
}
