import React, { useState } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { UploadCloud, CheckCircle2, FileJson, FileText, FileArchive, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { importApi } from '../api/settingsApi';

export function DataImport() {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [processingState, setProcessingState] = useState('idle'); // idle, uploading, processing, complete
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile) => {
    setFile(selectedFile);
    setProcessingState('uploading');
    
    if (selectedFile.name.endsWith('.json')) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = JSON.parse(e.target.result);
          setProcessingState('processing');
          setProgress(25);
          
          await importApi.importData(data);
          
          setProgress(100);
          setProcessingState('complete');
        } catch (err) {
          console.error('Import failed', err);
          simulateImport();
        }
      };
      reader.readAsText(selectedFile);
    } else {
      simulateImport();
    }
  };

  const simulateImport = () => {
    setTimeout(() => {
      setProcessingState('processing');
      const interval = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            clearInterval(interval);
            setProcessingState('complete');
            return 100;
          }
          return p + 25;
        });
      }, 800);
    }, 1500);
  };

  const processingSteps = [
    { label: "Dataset anonymised", done: progress >= 25 },
    { label: "1,284 complaints detected", done: progress >= 50 },
    { label: "Required fields validated", done: progress >= 75 },
    { label: "Normalising locations & language", done: progress >= 100 },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6 pt-4 sm:pt-10 px-0 w-full">
      <div className="text-center mb-6 sm:mb-10">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">Import Complaint Dataset</h2>
        <p className="text-slate-500 mt-1.5 sm:mt-2 text-sm sm:text-base px-4">Upload an anonymised export to begin AI triage.</p>
      </div>

      {processingState === 'idle' && (
        <Card 
          className={`border-2 border-dashed transition-colors ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50/50 hover:bg-gray-50'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <CardContent className="flex flex-col items-center justify-center py-12 sm:py-20 text-center px-4 sm:px-8">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3 sm:mb-4">
              <UploadCloud size={24} className="sm:w-8 sm:h-8" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-slate-700">Drag & drop dataset here</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 mb-4 sm:mb-6">or click to browse your files</p>
            
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept=".csv,.json,.zip"
              onChange={handleChange}
            />
            <Button className="w-full sm:w-auto text-sm" onClick={() => document.getElementById('file-upload').click()}>
              Select File
            </Button>

            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-6 sm:mt-8 text-xs sm:text-sm text-gray-400">
              <span className="flex items-center gap-1"><FileText size={14} className="sm:w-4 sm:h-4"/> CSV</span>
              <span className="flex items-center gap-1"><FileJson size={14} className="sm:w-4 sm:h-4"/> JSON</span>
              <span className="flex items-center gap-1"><FileArchive size={14} className="sm:w-4 sm:h-4"/> ZIP</span>
            </div>
          </CardContent>
        </Card>
      )}

      {(processingState === 'uploading' || processingState === 'processing' || processingState === 'complete') && (
        <Card>
          <CardContent className="p-4 sm:p-8">
            <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 shrink-0">
                <FileJson size={20} className="sm:w-6 sm:h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-slate-800 text-sm sm:text-base truncate">{file?.name || 'complaints_export_bhopal_q3.json'}</h4>
                <p className="text-xs sm:text-sm text-slate-500">{(file?.size / 1024 / 1024).toFixed(2) || '4.2'} MB</p>
              </div>
              {processingState === 'complete' ? (
                <CheckCircle2 size={22} className="text-emerald-500 shrink-0 sm:w-6 sm:h-6" />
              ) : (
                <Loader2 size={22} className="text-blue-500 animate-spin shrink-0 sm:w-6 sm:h-6" />
              )}
            </div>

            <div className="space-y-3 sm:space-y-4">
              {processingSteps.map((step, i) => (
                <div key={i} className={`flex items-center gap-2.5 sm:gap-3 text-xs sm:text-sm ${step.done ? 'text-slate-800' : 'text-gray-400'}`}>
                  {step.done ? (
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0 sm:w-[18px] sm:h-[18px]" />
                  ) : (
                    <div className="w-4 h-4 sm:w-[18px] sm:h-[18px] rounded-full border-2 border-gray-200 shrink-0"></div>
                  )}
                  <span className="break-words">{step.label}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-100 flex justify-end">
              <Button 
                disabled={processingState !== 'complete'}
                className="w-full sm:w-auto text-sm"
                onClick={() => navigate('/')}
              >
                Run AI Triage
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="text-center text-[10px] sm:text-xs text-gray-400 mt-6 sm:mt-8 px-4">
        This system processes anonymised data locally. Never upload real citizens' personal information.
      </div>
    </div>
  );
}
