import React, { useState, useRef } from 'react';
import { Mic, Camera, MapPin, Loader2, ArrowRight, X, Navigation } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { VoiceRecorder } from './VoiceRecorder';
import { AIGuidancePanel } from './AIGuidancePanel';
import { AIAnalysisPanel } from './AIAnalysisPanel';
import { ComplaintReceipt } from './ComplaintReceipt';
import { analyzeComplaint, detectMissingInfo } from '../../services/intake/aiTriageService';
import { findDuplicates } from '../../services/intake/duplicateDetectionService';
import { requestGPSLocation, reverseGeocode } from '../../services/intake/locationService';
import { useAppContext } from '../../context/AppContext';

const STEP = { INPUT: 'input', ANALYSING: 'analysing', REVIEW: 'review', DONE: 'done' };

const LOADING_MSGS = [
  'Detecting language…',
  'Extracting key information…',
  'Detecting location…',
  'Classifying department…',
  'Calculating urgency…',
  'Checking for similar complaints…',
  'Preparing summary…',
];

export function NewComplaint() {
  const { complaints, addComplaint } = useAppContext();
  const [step, setStep] = useState(STEP.INPUT);
  const [complaintText, setComplaintText] = useState('');
  const [voiceTranscript, setVoiceTranscript] = useState(null);
  const [inputMethod, setInputMethod] = useState('text');
  const [photo, setPhoto] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [showVoice, setShowVoice] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [duplicates, setDuplicates] = useState([]);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [analyseError, setAnalyseError] = useState('');
  const [submittedComplaint, setSubmittedComplaint] = useState(null);
  const photoRef = useRef(null);
  const textareaRef = useRef(null);

  // Live guidance: detect missing fields as user types
  const missingFields = complaintText.trim().length > 10
    ? detectMissingInfo(complaintText, location)
    : [];

  const handleVoiceTranscript = (text) => {
    setVoiceTranscript(text);
    setComplaintText(text);
    setInputMethod('voice');
    setShowVoice(false);
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  const handleDetectLocation = async () => {
    setLocationLoading(true);
    setLocationError('');
    try {
      const coords = await requestGPSLocation();
      const geo = await reverseGeocode(coords);
      setLocation(geo);
    } catch (e) {
      const msgMap = {
        'PERMISSION_DENIED': 'Location access was denied. You can enter the locality manually in your complaint text.',
        'GEOLOCATION_UNAVAILABLE': 'Location is not available on this device.',
        'POSITION_UNAVAILABLE': 'Could not determine your location.',
        'TIMEOUT': 'Location request timed out.',
      };
      setLocationError(msgMap[e.message] || 'Could not get location. Please include your locality in the complaint text.');
    } finally {
      setLocationLoading(false);
    }
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPhoto({ name: file.name, url, size: file.size });
  };

  const handleAnalyse = async () => {
    if (!complaintText.trim() || complaintText.trim().length < 5) {
      setAnalyseError('Please write your complaint before analysing.');
      return;
    }
    setAnalyseError('');
    setStep(STEP.ANALYSING);

    // Cycle loading messages
    let idx = 0;
    setLoadingMsg(LOADING_MSGS[0]);
    const msgInterval = setInterval(() => {
      idx = (idx + 1) % LOADING_MSGS.length;
      setLoadingMsg(LOADING_MSGS[idx]);
    }, 500);

    try {
      const result = await analyzeComplaint(complaintText, location);
      const dups = findDuplicates(result, complaints);
      clearInterval(msgInterval);
      setAnalysis(result);
      setDuplicates(dups);
      setStep(STEP.REVIEW);
    } catch (e) {
      clearInterval(msgInterval);
      setAnalyseError(
        e.message === 'COMPLAINT_TOO_SHORT'
          ? 'Your complaint is too short. Please provide more details.'
          : 'AI analysis is temporarily unavailable. Your complaint can still be submitted for manual review.'
      );
      setStep(STEP.INPUT);
    }
  };

  const handleConfirmSubmit = async (overrides) => {
    try {
      const payload = {
        originalText: complaintText,
        voiceTranscript: voiceTranscript || null,
        inputMethod,
        language: analysis?.language || 'English',
        location: analysis?.locality
          ? {
              locality: analysis.locality,
              ward: overrides?.ward || analysis.ward || '',
              addressText: complaintText,
              source: analysis.locationSource || 'complaint_text',
              confidence: (analysis.locationConfidence || 70) / 100,
            }
          : {},
        attachments: photo ? [photo.name] : [],
        // Pass AI pre-analysis hints to the backend
        _aiHints: {
          department: overrides?.department || analysis?.department,
          category: overrides?.category || analysis?.category,
          urgency: overrides?.urgency || analysis?.urgency,
        },
      };
      const result = await addComplaint(payload);
      setSubmittedComplaint(result || payload);
      setStep(STEP.DONE);
    } catch (err) {
      setAnalyseError('Failed to submit complaint. Please try again.');
      setStep(STEP.INPUT);
    }
  };

  const handleReset = () => {
    setStep(STEP.INPUT);
    setComplaintText('');
    setVoiceTranscript(null);
    setInputMethod('text');
    setPhoto(null);
    setLocation(null);
    setAnalysis(null);
    setDuplicates([]);
    setAnalyseError('');
    setLocationError('');
  };

  return (
    <div className="max-w-2xl mx-auto w-full space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Report a Civic Issue</h1>
        <p className="text-sm text-slate-500 mt-1">Describe the problem and our AI will help route it to the right department.</p>
      </div>

      {/* ── STEP 1: INPUT ──────────────────────────────────────── */}
      {step === STEP.INPUT && (
        <div className="space-y-4">
          {/* Voice transcript notice */}
          {voiceTranscript && (
            <div className="flex items-start gap-3 bg-purple-50 border border-purple-200 rounded-xl px-4 py-3">
              <Mic size={16} className="text-purple-500 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-purple-700">Voice transcript (editable)</p>
                <p className="text-xs text-purple-600 mt-0.5 truncate">{voiceTranscript}</p>
              </div>
              <button onClick={() => { setVoiceTranscript(null); setInputMethod('text'); }} className="text-purple-400 hover:text-purple-600">
                <X size={14} />
              </button>
            </div>
          )}

          {/* Main textarea */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <label htmlFor="complaintText" className="block text-sm font-semibold text-slate-700">
                What happened?
              </label>
              <textarea
                id="complaintText"
                ref={textareaRef}
                value={complaintText}
                onChange={(e) => setComplaintText(e.target.value)}
                placeholder={'Type your complaint here, or use voice input below.\n\nExample: "Garbage has not been collected near Arera Colony for 3 days."'}
                rows={5}
                className="w-full resize-none rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none p-4 text-sm text-slate-700 leading-relaxed transition-all placeholder:text-gray-400"
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">{complaintText.length} characters</span>
                {complaintText.length > 0 && (
                  <button onClick={() => setComplaintText('')} className="text-xs text-gray-400 hover:text-gray-600">Clear</button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action buttons row */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowVoice(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-slate-600 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 transition-all shadow-sm"
              aria-label="Start voice complaint"
            >
              <Mic size={16} className="text-purple-500" /> 🎤 Speak Complaint
            </button>

            <button
              onClick={() => photoRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-slate-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all shadow-sm"
              aria-label="Add photo evidence"
            >
              <Camera size={16} className="text-blue-500" /> 📷 Add Photo
            </button>
            <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoSelect} />

            <button
              onClick={handleDetectLocation}
              disabled={locationLoading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-slate-600 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 transition-all shadow-sm disabled:opacity-60"
              aria-label="Detect current location"
            >
              {locationLoading ? <Loader2 size={16} className="animate-spin" /> : <MapPin size={16} className="text-emerald-500" />}
              📍 Detect Location
            </button>
          </div>

          {/* Photo preview */}
          {photo && (
            <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
              <img src={photo.url} alt="Evidence" className="w-12 h-12 rounded-lg object-cover border border-blue-200" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-blue-700">Photo attached</p>
                <p className="text-xs text-blue-500 truncate">{photo.name}</p>
              </div>
              <button onClick={() => setPhoto(null)} className="text-blue-400 hover:text-blue-600">
                <X size={16} />
              </button>
            </div>
          )}

          {/* Location display */}
          {location && (
            <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
              <Navigation size={16} className="text-emerald-500 shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-emerald-700">
                  📍 Location detected {location.note ? '(Mock)' : ''}
                </p>
                <p className="text-sm font-medium text-slate-800">{location.locality}</p>
                <p className="text-xs text-slate-500">Ward {location.ward} · {location.city} · Source: {location.source === 'gps' ? 'GPS' : 'Text'} · {Math.round(location.confidence * 100)}% confidence</p>
              </div>
              <button onClick={() => setLocation(null)} className="text-emerald-400 hover:text-emerald-600">
                <X size={16} />
              </button>
            </div>
          )}

          {/* Location error */}
          {locationError && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700">
              {locationError}
            </div>
          )}

          {/* AI Guidance panel — only shown once user has typed something */}
          {complaintText.trim().length > 10 && (
            <AIGuidancePanel
              missingFields={missingFields.map(f => f.field)}
              onAddLocation={() => textareaRef.current?.focus()}
            />
          )}

          {/* Analyse error */}
          {analyseError && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
              {analyseError}
            </div>
          )}

          <Button
            className="w-full gap-2 h-12 text-base"
            onClick={handleAnalyse}
            disabled={complaintText.trim().length < 5}
          >
            Analyse Complaint <ArrowRight size={16} />
          </Button>
        </div>
      )}

      {/* ── STEP 2: ANALYSING ─────────────────────────────────── */}
      {step === STEP.ANALYSING && (
        <Card>
          <CardContent className="p-10 flex flex-col items-center gap-5">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                <Loader2 size={28} className="text-blue-500 animate-spin" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <p className="font-semibold text-slate-700 text-lg">Analysing your complaint…</p>
              <p className="text-sm text-blue-600 font-medium animate-pulse">{loadingMsg}</p>
              <p className="text-xs text-slate-400">This usually takes a few seconds</p>
            </div>
            <div className="flex gap-1.5">
              {['Detecting language', 'Classifying', 'Locating', 'Checking duplicates'].map((label, i) => (
                <div key={i} className="px-2 py-1 bg-blue-50 rounded-full text-[10px] text-blue-600 border border-blue-100">
                  {label}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── STEP 3: REVIEW ───────────────────────────────────── */}
      {step === STEP.REVIEW && analysis && (
        <AIAnalysisPanel
          analysis={analysis}
          duplicates={duplicates}
          onConfirm={handleConfirmSubmit}
          onEdit={() => {}}
          onBack={() => setStep(STEP.INPUT)}
        />
      )}

      {/* ── STEP 4: DONE ─────────────────────────────────────── */}
      {step === STEP.DONE && submittedComplaint && (
        <ComplaintReceipt complaint={submittedComplaint} onClose={handleReset} />
      )}

      {/* Voice Modal */}
      {showVoice && (
        <VoiceRecorder
          onTranscript={handleVoiceTranscript}
          onClose={() => setShowVoice(false)}
        />
      )}
    </div>
  );
}
