import React, { useState } from 'react';
import { CheckCircle, AlertTriangle, ChevronDown, ChevronUp, Edit3 } from 'lucide-react';
import { Badge, UrgencyBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

const DEPARTMENTS = [
  'Sanitation Department', 'Water Supply Department', 'Roads & Infrastructure',
  'Street Lighting', 'Parks & Horticulture', 'Drainage Department', 'General Administration',
];
const URGENCY_LEVELS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

function ConfidenceBar({ value, label }) {
  const color = value >= 80 ? 'bg-emerald-500' : value >= 60 ? 'bg-amber-500' : 'bg-red-400';
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-slate-500">
        <span>{label}</span>
        <span className="font-semibold">{value}%</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export function AIAnalysisPanel({ analysis, duplicates, onConfirm, onEdit, onBack }) {
  const [overrides, setOverrides] = useState({
    department: analysis.department,
    urgency: analysis.urgency,
    locality: analysis.locality || '',
    ward: analysis.ward || '',
  });
  const [showExplain, setShowExplain] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const hasLowConf = analysis.overallConfidence < 70;
  const hasDuplicates = duplicates && duplicates.length > 0;

  const handleConfirm = () => onConfirm(overrides);

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-blue-100">
          <CheckCircle size={20} className="text-blue-600" />
        </div>
        <div>
          <h2 className="font-bold text-slate-800 text-lg">AI Complaint Summary</h2>
          <p className="text-xs text-slate-500">Please review before submitting</p>
        </div>
      </div>

      {/* Low confidence warning */}
      {hasLowConf && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-amber-800">AI needs your review</p>
            <p className="text-amber-700 mt-0.5">Overall confidence is {analysis.overallConfidence}%. Please verify the details below.</p>
          </div>
        </div>
      )}

      {/* Summary Card */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Department */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Department</p>
              {isEditing ? (
                <select
                  value={overrides.department}
                  onChange={e => setOverrides(p => ({ ...p, department: e.target.value }))}
                  className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                </select>
              ) : (
                <p className="font-semibold text-slate-800 text-sm">{overrides.department}</p>
              )}
              <p className="text-[11px] text-blue-600 mt-0.5">Confidence: {analysis.departmentConfidence}%</p>
            </div>

            {/* Category */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Category</p>
              <p className="font-semibold text-slate-800 text-sm">{analysis.category}</p>
            </div>

            {/* Location */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Location</p>
              {isEditing ? (
                <div className="space-y-1.5">
                  <input
                    placeholder="Locality"
                    value={overrides.locality}
                    onChange={e => setOverrides(p => ({ ...p, locality: e.target.value }))}
                    className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-2 py-1.5"
                  />
                  <input
                    placeholder="Ward number"
                    value={overrides.ward}
                    onChange={e => setOverrides(p => ({ ...p, ward: e.target.value }))}
                    className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-2 py-1.5"
                  />
                </div>
              ) : (
                <div>
                  {overrides.locality ? (
                    <>
                      <p className="font-semibold text-slate-800 text-sm">{overrides.locality}</p>
                      {overrides.ward && <p className="text-xs text-slate-500">Ward {overrides.ward}</p>}
                      {analysis.locationSource && (
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Source: {analysis.locationSource === 'gps' ? '📍 GPS' : '📝 Complaint text'}
                          {analysis.locationConfidence ? ` · ${analysis.locationConfidence}% confidence` : ''}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-amber-600 font-medium">⚠ Location not detected</p>
                  )}
                </div>
              )}
            </div>

            {/* Urgency */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Urgency</p>
              {isEditing ? (
                <select
                  value={overrides.urgency}
                  onChange={e => setOverrides(p => ({ ...p, urgency: e.target.value }))}
                  className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  {URGENCY_LEVELS.map(u => <option key={u}>{u}</option>)}
                </select>
              ) : (
                <>
                  <UrgencyBadge level={overrides.urgency} />
                  <p className="text-[11px] text-slate-500 mt-1">{analysis.urgencyReason}</p>
                </>
              )}
            </div>

            {/* Language */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Language</p>
              <Badge variant="outline">{analysis.language}</Badge>
            </div>

            {/* Duplicates */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Duplicate Check</p>
              {hasDuplicates ? (
                <Badge variant="warning">⚠ {duplicates.length} possible match{duplicates.length > 1 ? 'es' : ''}</Badge>
              ) : (
                <Badge variant="success">✓ No strong duplicate</Badge>
              )}
            </div>
          </div>

          {/* Confidence scores */}
          <div className="pt-3 border-t border-gray-100 space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">AI Confidence</p>
            <ConfidenceBar value={analysis.departmentConfidence} label="Department" />
            {analysis.locationConfidence && <ConfidenceBar value={analysis.locationConfidence} label="Location" />}
            <ConfidenceBar value={Math.round(analysis.urgencyScore * 100)} label="Urgency" />
            <div className="pt-1 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">Overall</span>
              <span className={`text-sm font-bold ${analysis.overallConfidence >= 80 ? 'text-emerald-600' : analysis.overallConfidence >= 60 ? 'text-amber-600' : 'text-red-500'}`}>
                {analysis.overallConfidence}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Explainable AI */}
      <button
        onClick={() => setShowExplain(!showExplain)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-sm font-medium text-slate-700 transition-colors border border-slate-200"
      >
        <span>🔍 Why this routing?</span>
        {showExplain ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {showExplain && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 animate-in fade-in duration-200">
          {analysis.aiExplanation?.map((reason, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-slate-600">
              <span className="text-emerald-500 font-bold shrink-0">✓</span>
              <span>{reason}</span>
            </div>
          ))}
          <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-200 mt-2">
            [Mock AI] — This analysis is rule-based. Results may not reflect a real AI model.
          </p>
        </div>
      )}

      {/* Duplicate alerts */}
      {hasDuplicates && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-amber-700">⚠ Possible Duplicate Found</p>
          {duplicates.map(({ complaint, similarity, matchReasons }) => (
            <div key={complaint.id} className="border border-amber-200 bg-amber-50 rounded-xl p-4 space-y-2">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <span className="font-semibold text-slate-800 text-sm">{complaint.id}</span>
                <Badge variant="warning">{similarity}% similar</Badge>
              </div>
              <p className="text-sm text-slate-600 italic">"{complaint.originalText}"</p>
              <p className="text-xs text-slate-500">{matchReasons.join(' · ')}</p>
            </div>
          ))}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button className="flex-1" onClick={handleConfirm}>
          ✓ Confirm & Submit
        </Button>
        <Button variant="outline" className="gap-1.5" onClick={() => setIsEditing(!isEditing)}>
          <Edit3 size={14} /> {isEditing ? 'Done Editing' : 'Edit Details'}
        </Button>
        <Button variant="ghost" onClick={onBack}>← Go Back</Button>
      </div>
    </div>
  );
}
