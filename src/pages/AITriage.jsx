import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../components/ui/Card';
import { Badge, UrgencyBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { EvidenceChip } from '../components/ui/EvidenceChip';
import { useAppContext } from '../context/AppContext';
import { Image as ImageIcon, Mic, MapPin, CheckCircle, AlertCircle, Sparkles, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function AITriage() {
  const { complaints, updateComplaintStatus } = useAppContext();
  const navigate = useNavigate();
  const [activeComplaintIndex, setActiveComplaintIndex] = useState(0);

  const triageQueue = complaints.filter(
    c => c.status === 'AWAITING_REVIEW' ||
         c.status === 'AI_TRIAGED' ||
         c.status === 'RECEIVED' ||
         c.status === 'Needs Review' ||
         c.status === 'New'
  );

  const [confirmedDept, setConfirmedDept] = useState('');
  const [confirmedCategory, setConfirmedCategory] = useState('');
  const [confirmedUrgency, setConfirmedUrgency] = useState('');

  const c = triageQueue[activeComplaintIndex] || triageQueue[0];

  useEffect(() => {
    if (c) {
      setConfirmedDept(c.department || 'Water Supply');
      setConfirmedCategory(c.category || 'Civic Issue');
      setConfirmedUrgency(c.urgency || 'MEDIUM');
    }
  }, [c?.id, c?.department, c?.category, c?.urgency]);

  if (triageQueue.length === 0 || !c) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-20 px-4">
        <CheckCircle size={48} className="text-emerald-500 mb-4" />
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Queue Cleared!</h2>
        <p className="text-sm sm:text-base text-slate-500 mt-2">All complaints have been triaged.</p>
        <Button className="mt-6 w-full sm:w-auto" onClick={() => navigate('/dashboard/complaints')}>Back to All Complaints</Button>
      </div>
    );
  }

  const handleConfirm = () => {
    updateComplaintStatus(c.id, 'ASSIGNED', confirmedUrgency || c.urgency, confirmedCategory || c.category, confirmedDept || c.department);
    if (activeComplaintIndex < triageQueue.length - 1) {
      setActiveComplaintIndex(prev => prev + 1);
    } else {
      setActiveComplaintIndex(0);
    }
  };

  const handleSkip = () => {
    if (activeComplaintIndex < triageQueue.length - 1) {
      setActiveComplaintIndex(prev => prev + 1);
    } else {
      setActiveComplaintIndex(0);
    }
  };

  const handleMarkDuplicate = () => {
    updateComplaintStatus(c.id, 'DUPLICATE', c.urgency, c.category, c.department);
    if (activeComplaintIndex < triageQueue.length - 1) {
      setActiveComplaintIndex(prev => prev + 1);
    } else {
      setActiveComplaintIndex(0);
    }
  };

  return (
    <div className="max-w-7xl mx-auto h-auto lg:h-[calc(100vh-8rem)] flex flex-col w-full relative">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 flex-shrink-0 gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">AI Triage</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Review and confirm AI routing decisions.</p>
        </div>
        <div className="text-xs sm:text-sm font-medium text-slate-600 bg-slate-200 px-3 py-1 rounded-full self-start sm:self-auto">
          {Math.min(activeComplaintIndex + 1, triageQueue.length)} of {triageQueue.length} in Queue
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 flex-1 min-h-0">
        
        {/* COLUMN 1 — ORIGINAL COMPLAINT */}
        <Card className="flex flex-col overflow-hidden h-[500px] lg:h-full min-w-0">
          <CardHeader className="bg-slate-50 p-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <CardTitle className="text-sm sm:text-base">Original Input</CardTitle>
                <div className="text-[10px] sm:text-xs text-slate-500 mt-1">{c.id} • {new Date(c.timestamp).toLocaleString()}</div>
              </div>
              <Badge variant="outline" className="text-[10px] sm:text-xs py-0 sm:py-0.5">{c.sourceChannel}</Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-5">
            
            {c.inputType === 'Image' && (
              <div className="space-y-2">
                <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 border border-gray-200 relative">
                  <img src={c.imageUrl} alt="Complaint" className="w-full h-full object-cover" />
                </div>
                <div className="flex gap-2 p-2.5 bg-blue-50 rounded-lg text-xs sm:text-sm text-blue-900 border border-blue-100">
                  <ImageIcon size={16} className="shrink-0 text-blue-500 mt-0.5" />
                  <p className="leading-relaxed"><span className="font-semibold block sm:inline">AI Vision Caption: </span>{c.imageCaption}</p>
                </div>
              </div>
            )}

            {c.inputType === 'Voice' && (
              <div className="space-y-3">
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-100 flex items-center gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-200 flex items-center justify-center shrink-0">
                    <Mic size={16} className="text-purple-700 sm:w-5 sm:h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="h-1.5 sm:h-2 bg-purple-200 rounded-full w-full overflow-hidden">
                      <div className="h-full bg-purple-500 w-2/3"></div>
                    </div>
                    <div className="text-[10px] sm:text-xs text-purple-700 mt-1 flex justify-between">
                      <span>0:00</span><span>0:14</span>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg text-xs sm:text-sm text-gray-700 border border-gray-200 break-words">
                  <span className="font-semibold block mb-1 text-xs">Transcribed Text:</span>
                  {c.transcribedText}
                </div>
              </div>
            )}

            <div>
              <div className="flex justify-between items-end mb-2">
                <h4 className="text-xs sm:text-sm font-semibold text-slate-700">Original Text</h4>
                <Badge variant="outline" className="text-[10px] py-0">{c.language}</Badge>
              </div>
              <p className="text-slate-800 text-sm sm:text-base leading-relaxed bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-sm break-words">
                "{c.originalText}"
              </p>
            </div>

            <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs sm:text-sm">
              <MapPin size={16} className="text-gray-500 shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <span className="font-semibold text-slate-700 block text-xs">Reported Location:</span>
                <span className="text-slate-600 block truncate">{c.locality}</span>
              </div>
            </div>

          </CardContent>
        </Card>

        {/* COLUMN 2 — AI TRIAGE RESULT */}
        <Card className="flex flex-col h-[500px] lg:h-full border-blue-200 shadow-sm relative overflow-hidden min-w-0">
          <div className="absolute top-0 right-0 p-3 sm:p-4">
            <div className="flex flex-col items-end">
              <span className="text-[9px] sm:text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-0.5 sm:mb-1 flex items-center"><Sparkles size={10} className="mr-1 hidden sm:block"/> AI Confidence</span>
              <span className="text-2xl sm:text-3xl font-bold text-blue-600 leading-none">{c.confidence}%</span>
            </div>
          </div>
          <CardHeader className="bg-blue-50/50 p-4 pb-2">
            <CardTitle className="text-sm sm:text-base text-blue-900 pr-16">AI Triage Result</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-5">
            
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="min-w-0">
                <label className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider block truncate">Department</label>
                <div className="text-sm sm:text-base font-medium text-slate-900 mt-1 truncate">{c.department}</div>
              </div>
              <div className="min-w-0">
                <label className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider block truncate">Category</label>
                <div className="text-sm sm:text-base font-medium text-slate-900 mt-1 truncate">{c.category}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
               <div className="min-w-0">
                <label className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block truncate">Urgency</label>
                <UrgencyBadge level={c.urgency} />
                <div className="text-[10px] sm:text-xs text-slate-500 mt-1 leading-snug">{c.urgencyReason}</div>
              </div>
               <div className="min-w-0">
                <label className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider block truncate">Location</label>
                <div className="text-xs sm:text-sm font-medium text-slate-900 mt-1 truncate">{c.normalizedLocality}</div>
                <div className="text-[10px] sm:text-xs text-slate-500">Ward {c.ward}</div>
              </div>
            </div>

            {c.duplicateStatus === 'Possible' && (
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-center gap-1.5 sm:gap-2 text-amber-800 font-semibold mb-1 text-xs sm:text-sm">
                  <AlertCircle size={14} className="sm:w-4 sm:h-4" />
                  Possible Duplicate
                </div>
                <div className="text-[10px] sm:text-sm text-amber-700 leading-relaxed">
                  Matches existing complaint <button type="button" onClick={() => navigate('/dashboard/clusters')} className="underline font-medium break-all text-amber-900 hover:text-amber-950">#{c.linkedComplaint}</button> with 92% similarity.
                </div>
              </div>
            )}

            <div>
              <label className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Explainable Evidence</label>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {c.evidence.map((ev, i) => (
                  <EvidenceChip key={i} evidence={ev} className="text-[10px] sm:text-xs px-2 py-1 sm:px-3 sm:py-1.5" />
                ))}
              </div>
            </div>

          </CardContent>
        </Card>

        {/* COLUMN 3 — OPERATOR ACTION */}
        <Card className="flex flex-col h-[500px] lg:h-full bg-slate-50 min-w-0">
          <CardHeader className="p-4">
            <CardTitle className="text-sm sm:text-base">Operator Action</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4 pt-0 space-y-5">
            
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Confirm Department</label>
                <select
                  value={confirmedDept}
                  onChange={e => setConfirmedDept(e.target.value)}
                  className="w-full h-9 sm:h-10 px-2 sm:px-3 rounded-lg border border-gray-300 bg-white text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="Water Supply">Water Supply</option>
                  <option value="Sanitation">Sanitation</option>
                  <option value="Roads">Roads & Infrastructure</option>
                  <option value="Electrical">Electrical / Street Lighting</option>
                  <option value="Parks">Parks & Gardens</option>
                  <option value="Public Works">Public Works</option>
                  <option value="General">General Administration</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Confirm Category</label>
                <select
                  value={confirmedCategory}
                  onChange={e => setConfirmedCategory(e.target.value)}
                  className="w-full h-9 sm:h-10 px-2 sm:px-3 rounded-lg border border-gray-300 bg-white text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value={c.category}>{c.category}</option>
                  <option value="Water Pipeline Leakage">Water Pipeline Leakage</option>
                  <option value="Contaminated Water">Contaminated Water</option>
                  <option value="Low Pressure">Low Pressure</option>
                  <option value="Garbage Overflow">Garbage Overflow</option>
                  <option value="Potholes">Potholes</option>
                  <option value="Streetlight Outage">Streetlight Outage</option>
                  <option value="Other">Other Civic Issue</option>
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Confirm Urgency</label>
                <select
                  value={confirmedUrgency}
                  onChange={e => setConfirmedUrgency(e.target.value)}
                  className="w-full h-9 sm:h-10 px-2 sm:px-3 rounded-lg border border-gray-300 bg-white text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
            </div>

            {c.duplicateStatus === 'Possible' && (
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={handleMarkDuplicate}
                  variant="outline"
                  className="flex-1 text-[11px] sm:text-sm border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:text-amber-800 py-1.5 sm:py-2"
                >
                  Mark Duplicate
                </Button>
                <Button
                  onClick={handleSkip}
                  variant="outline"
                  className="flex-1 text-[11px] sm:text-sm py-1.5 sm:py-2"
                >
                  Not Duplicate
                </Button>
              </div>
            )}

            <div className="pt-4 border-t border-gray-200">
              <label className="text-xs sm:text-sm font-semibold text-slate-700 mb-2 flex justify-between items-center">
                Acknowledgement Draft
                <Sparkles size={14} className="text-blue-500" />
              </label>
              <textarea 
                className="w-full p-2.5 sm:p-3 rounded-lg border border-gray-300 bg-white text-xs sm:text-sm h-20 sm:h-24 focus:ring-2 focus:ring-blue-500 outline-none resize-none leading-relaxed"
                defaultValue={`Your complaint regarding ${(c.category || 'civic issue').toLowerCase()} in ${c.normalizedLocality || 'Bhopal'} has been registered and forwarded to the ${confirmedDept || c.department} Department for review.`}
              />
            </div>

          </CardContent>
          <CardFooter className="bg-white p-3 sm:p-4 border-t border-gray-200 gap-2 sm:gap-3 flex-col sm:flex-row justify-end rounded-b-xl shrink-0">
             <Button
               variant="ghost"
               onClick={handleSkip}
               className="w-full sm:w-auto order-2 sm:order-1 h-9 sm:h-10 text-xs sm:text-sm"
             >
               Skip
             </Button>
             <Button
               onClick={handleConfirm}
               className="w-full sm:w-auto order-1 sm:order-2 h-9 sm:h-10 text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
             >
               <Send size={14} className="mr-1.5 sm:mr-2 sm:w-4 sm:h-4" />
               Confirm & Route
             </Button>
          </CardFooter>
        </Card>

      </div>
    </div>
  );
}
