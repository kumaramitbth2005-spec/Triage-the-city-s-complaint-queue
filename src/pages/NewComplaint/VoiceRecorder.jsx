import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, X, RotateCcw, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { speechToTextService } from '../../services/intake/speechToTextService';
import { cn } from '../../lib/utils';

const STATES = { IDLE: 'idle', RECORDING: 'recording', TRANSCRIBING: 'transcribing', DONE: 'done', ERROR: 'error' };

export function VoiceRecorder({ onTranscript, onClose }) {
  const [state, setState] = useState(STATES.IDLE);
  const [interimText, setInterimText] = useState('');
  const [finalText, setFinalText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);
  const isSupported = speechToTextService.isSupported();

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      speechToTextService.cancelRecording();
    };
  }, []);

  const startTimer = () => {
    setElapsed(0);
    timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000);
  };

  const stopTimer = () => clearInterval(timerRef.current);

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const handleStart = async () => {
    setErrorMsg('');
    setFinalText('');
    setInterimText('');
    setState(STATES.RECORDING);
    startTimer();
    try {
      await speechToTextService.startRecording(
        'en-IN',
        (interim) => setInterimText(interim),
        (final) => {
          setFinalText(prev => prev + ' ' + final);
          setInterimText('');
        }
      );
    } catch (e) {
      stopTimer();
      const msgMap = {
        'PERMISSION_DENIED': 'Microphone permission was denied. Please allow microphone access in your browser settings.',
        'MICROPHONE_UNAVAILABLE': 'No microphone detected on this device.',
        'SPEECH_API_UNAVAILABLE': 'Voice input is not supported in this browser. Please use Chrome.',
        'NO_SPEECH_DETECTED': 'No speech was detected. Please try again.',
      };
      setErrorMsg(msgMap[e.message] || 'Voice recording failed. Please try again.');
      setState(STATES.ERROR);
    }
  };

  const handleStop = () => {
    stopTimer();
    speechToTextService.stopRecording();
    setState(STATES.TRANSCRIBING);
    // Brief delay to let Web Speech API finalise
    setTimeout(() => {
      setState(STATES.DONE);
    }, 600);
  };

  const handleCancel = () => {
    stopTimer();
    speechToTextService.cancelRecording();
    setState(STATES.IDLE);
    setFinalText('');
    setInterimText('');
  };

  const handleUseTranscript = () => {
    const text = (finalText + ' ' + interimText).trim();
    if (text) onTranscript(text);
  };

  const handleReRecord = () => {
    setFinalText('');
    setInterimText('');
    setState(STATES.IDLE);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" role="dialog" aria-label="Voice complaint recorder">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h3 className="font-semibold text-slate-800 text-base">🎤 Voice Complaint</h3>
          <button onClick={onClose} className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="px-5 pb-6 space-y-5">
          {/* Not supported */}
          {!isSupported && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
              <p className="font-semibold mb-1">Voice input is unavailable</p>
              <p>Your browser does not support speech recognition. Please use Google Chrome, or type your complaint instead.</p>
            </div>
          )}

          {isSupported && (
            <>
              {/* Mic animation */}
              <div className="flex flex-col items-center py-4 gap-3">
                <div className={cn(
                  "w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300",
                  state === STATES.RECORDING
                    ? "bg-red-100 ring-4 ring-red-200 animate-pulse"
                    : state === STATES.DONE
                    ? "bg-emerald-100"
                    : "bg-blue-50"
                )}>
                  {state === STATES.TRANSCRIBING ? (
                    <Loader2 size={32} className="text-blue-500 animate-spin" />
                  ) : (
                    <Mic size={32} className={cn(
                      state === STATES.RECORDING ? "text-red-500" :
                      state === STATES.DONE ? "text-emerald-500" : "text-blue-400"
                    )} />
                  )}
                </div>

                <div className="text-center">
                  {state === STATES.IDLE && <p className="text-sm text-gray-500">Press the button below to start speaking</p>}
                  {state === STATES.RECORDING && (
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-red-600 animate-pulse">● Recording…</p>
                      <p className="text-2xl font-mono text-slate-700">{formatTime(elapsed)}</p>
                    </div>
                  )}
                  {state === STATES.TRANSCRIBING && <p className="text-sm text-blue-600">Converting speech to text…</p>}
                  {state === STATES.DONE && <p className="text-sm font-semibold text-emerald-600">✓ Recording complete</p>}
                  {state === STATES.ERROR && <p className="text-sm font-semibold text-red-600">Recording failed</p>}
                </div>
              </div>

              {/* Live transcript */}
              {(finalText || interimText) && (
                <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-700 leading-relaxed min-h-[60px] border border-slate-200">
                  <span>{finalText}</span>
                  {interimText && <span className="text-slate-400 italic"> {interimText}</span>}
                </div>
              )}

              {/* Error */}
              {state === STATES.ERROR && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
                  {errorMsg}
                </div>
              )}

              {/* Controls */}
              <div className="flex gap-2">
                {state === STATES.IDLE && (
                  <Button className="flex-1 gap-2" onClick={handleStart} aria-label="Start voice recording">
                    <Mic size={16} /> Start Speaking
                  </Button>
                )}
                {state === STATES.RECORDING && (
                  <>
                    <Button variant="danger" className="flex-1 gap-2" onClick={handleStop} aria-label="Stop recording">
                      <Square size={14} /> Stop
                    </Button>
                    <Button variant="outline" onClick={handleCancel} aria-label="Cancel recording">
                      <X size={16} />
                    </Button>
                  </>
                )}
                {state === STATES.DONE && (
                  <>
                    <Button className="flex-1" onClick={handleUseTranscript} disabled={!finalText.trim() && !interimText.trim()}>
                      Use This Transcript
                    </Button>
                    <Button variant="outline" className="gap-1.5" onClick={handleReRecord} aria-label="Re-record">
                      <RotateCcw size={14} /> Re-record
                    </Button>
                  </>
                )}
                {state === STATES.ERROR && (
                  <Button className="flex-1 gap-2" onClick={handleStart}>
                    <RotateCcw size={14} /> Try Again
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
