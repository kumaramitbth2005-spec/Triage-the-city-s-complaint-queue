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
  ChevronDown, ChevronUp, Copy, ExternalLink, Trash2
} from 'lucide-react';
import { EvidenceChip } from '../components/ui/EvidenceChip';

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
  const { complaints, loading: contextLoading, updateComplaintStatus, deleteComplaint } = useAppContext();
  const [showFullText, setShowFullText] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [activeTab, setActiveTab] = useState('overview');
  const [deleting, setDeleting] = useState(false);
  const [apiComplaint, setApiComplaint] = useState(null);
  const [apiLoading, setApiLoading] = useState(false);

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

  const statusColors = {
    'Confirmed': 'emerald', 'Resolved': 'emerald',
    'Needs Review': 'amber', 'New': 'blue',
    'RECEIVED': 'blue', 'Pending': 'amber',
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'ai', label: 'AI Analysis' },
    { id: 'timeline', label: 'Timeline' },
    { id: 'messages', label: `Messages (${messages.length})` },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-4 w-full">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard/complaints')}
          className="p-2 rounded-lg hover:bg-gray-100 text-slate-500 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold text-slate-800 font-mono">{complaint.id}</h1>
            <Badge>{complaint.status}</Badge>
            <UrgencyBadge level={complaint.urgency} />
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            {complaint.department} · {complaint.category} · Ward {complaint.ward}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigator.clipboard?.writeText(complaint.id)}
            className="hidden sm:flex"
          >
            <Copy size={14} className="mr-1.5" /> Copy ID
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleDelete}
            disabled={deleting}
          >
            <Trash2 size={14} className="mr-1.5" /> {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
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
                    <span className="flex items-center gap-1.5 text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-md border border-purple-100">
                      <Mic size={12} /> Voice Input
                    </span>
                  ) : complaint.inputType === 'Image' ? (
                    <span className="flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-md border border-blue-100">
                      <ImageIcon size={12} /> Photo Input
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-md border border-gray-200">
                      <FileText size={12} /> Text Input
                    </span>
                  )}
                  <span className="text-xs text-gray-400">·</span>
                  <span className="text-xs text-gray-500">{complaint.language || 'English'}</span>
                </div>
                <p className={`text-slate-700 text-sm leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100 ${!showFullText ? 'line-clamp-4' : ''}`}>
                  "{complaint.originalText}"
                </p>
                {complaint.originalText?.length > 200 && (
                  <button
                    onClick={() => setShowFullText(!showFullText)}
                    className="mt-2 text-xs text-blue-600 hover:underline flex items-center gap-1"
                  >
                    {showFullText ? <><ChevronUp size={12} /> Show less</> : <><ChevronDown size={12} /> Read more</>}
                  </button>
                )}
              </CardContent>
            </Card>

            {/* Location card */}
            <Card>
              <CardContent className="p-4 flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                  <MapPin size={18} className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Location</p>
                  <p className="text-base font-semibold text-slate-800">{complaint.normalizedLocality || complaint.locality}</p>
                  <p className="text-sm text-slate-500">Ward {complaint.ward} · {complaint.city || 'Bhopal'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="p-4 flex flex-wrap gap-3">
                <Button
                  className="flex-1"
                  onClick={() => updateComplaintStatus(complaint.id, 'Confirmed', complaint.urgency, complaint.category, complaint.department)}
                >
                  <CheckCircle size={16} className="mr-2" /> Confirm & Route
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => navigate('/dashboard/triage')}>
                  <Sparkles size={16} className="mr-2" /> Full AI Triage
                </Button>
                <Button variant="outline" className="flex-1">
                  <ExternalLink size={16} className="mr-2" /> Escalate
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar info */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4 space-y-3">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Department</p>
                  <p className="text-sm font-semibold text-slate-800">{complaint.department}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Category</p>
                  <p className="text-sm font-medium text-slate-700">{complaint.category}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">AI Confidence</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${complaint.confidence}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-blue-600">{complaint.confidence}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Submitted</p>
                  <div className="flex items-center gap-1.5 text-sm text-slate-700">
                    <Clock size={14} className="text-gray-400" />
                    {new Date(complaint.timestamp || complaint.createdAt).toLocaleString()}
                  </div>
                </div>
                {complaint.duplicateStatus === 'Possible' && (
                  <div className="p-2 bg-amber-50 rounded-lg border border-amber-100 text-xs text-amber-700">
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
    </div>
  );
}
