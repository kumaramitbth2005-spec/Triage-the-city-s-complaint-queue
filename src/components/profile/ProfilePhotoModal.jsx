import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Camera, 
  Image as ImageIcon, 
  Trash2, 
  X, 
  RotateCcw, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Check, 
  AlertCircle, 
  Loader2,
  RefreshCw
} from 'lucide-react';
import { Button } from '../ui/Button';

export function ProfilePhotoModal({ 
  isOpen, 
  onClose, 
  currentAvatar, 
  onSave, 
  onRemove,
  userName = 'User'
}) {
  const [step, setStep] = useState('select'); // 'select' | 'camera' | 'edit'
  const [imageSrc, setImageSrc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Edit / Crop States
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Camera States
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const previewCanvasRef = useRef(null);

  // Stop camera stream safely
  const stopCamera = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  }, [cameraStream]);

  // Reset state when opening or closing
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setStep('select');
      setImageSrc(null);
      setErrorMsg('');
      setCameraError('');
      setZoom(1);
      setRotation(0);
      setOffset({ x: 0, y: 0 });
    }
  }, [isOpen, stopCamera]);

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Handle Starting Camera
  const startCamera = async () => {
    setCameraError('');
    setErrorMsg('');
    setStep('camera');

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported on this browser or device.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'user', 
          width: { ideal: 640 }, 
          height: { ideal: 640 } 
        },
        audio: false
      });

      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.warn('Camera access denied or failed:', err);
      setCameraError(
        err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
          ? 'Camera permission was denied. Please allow camera permissions in your browser or choose a photo from your gallery.'
          : 'Unable to access camera. Please select a photo from your device gallery instead.'
      );
    }
  };

  // Handle Capturing Photo from Camera
  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    const canvas = document.createElement('canvas');
    const size = Math.min(video.videoWidth, video.videoHeight) || 480;
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext('2d');
    // Crop center square
    const startX = (video.videoWidth - size) / 2;
    const startY = (video.videoHeight - size) / 2;
    ctx.drawImage(video, startX, startY, size, size, 0, 0, size, size);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    stopCamera();
    setImageSrc(dataUrl);
    setZoom(1);
    setRotation(0);
    setOffset({ x: 0, y: 0 });
    setStep('edit');
  };

  // Handle File Selection
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image size exceeds the 5MB limit. Please select a smaller photo.');
      return;
    }

    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      setErrorMsg('Invalid file format. Please choose a JPG, PNG, or WEBP image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setImageSrc(event.target?.result);
      setZoom(1);
      setRotation(0);
      setOffset({ x: 0, y: 0 });
      setErrorMsg('');
      setStep('edit');
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read selected image file.');
    };
    reader.readAsDataURL(file);

    // Reset file input value so same file can be re-chosen if needed
    e.target.value = '';
  };

  // Mouse & Touch Pan Handlers
  const handlePointerDown = (e) => {
    setIsDragging(true);
    const clientX = e.clientX || e.touches?.[0]?.clientX || 0;
    const clientY = e.clientY || e.touches?.[0]?.clientY || 0;
    setDragStart({ x: clientX - offset.x, y: clientY - offset.y });
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const clientX = e.clientX || e.touches?.[0]?.clientX || 0;
    const clientY = e.clientY || e.touches?.[0]?.clientY || 0;
    setOffset({
      x: clientX - dragStart.x,
      y: clientY - dragStart.y
    });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // Wheel Zoom
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    setZoom(prev => Math.min(Math.max(0.5, prev + delta), 3.0));
  };

  // Rotate 90 deg
  const handleRotate = (direction) => {
    setRotation(prev => {
      const next = direction === 'cw' ? prev + 90 : prev - 90;
      return (next + 360) % 360;
    });
  };

  // Generate Cropped Output Canvas and Save
  const handleSaveCrop = async () => {
    if (!imageSrc) return;
    setLoading(true);
    setErrorMsg('');

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = imageSrc;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const outputSize = 400; // Crisp output dimensions
      const canvas = document.createElement('canvas');
      canvas.width = outputSize;
      canvas.height = outputSize;
      const ctx = canvas.getContext('2d');

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Fill white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, outputSize, outputSize);

      // Coordinate transformation around canvas center
      ctx.save();
      ctx.translate(outputSize / 2, outputSize / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(zoom, zoom);

      // Scale base image to fit canvas container
      const baseScale = Math.max(outputSize / img.width, outputSize / img.height);
      const drawWidth = img.width * baseScale;
      const drawHeight = img.height * baseScale;

      // Adjust offset according to rotation
      const rad = (-rotation * Math.PI) / 180;
      const rotatedOffsetX = offset.x * Math.cos(rad) - offset.y * Math.sin(rad);
      const rotatedOffsetY = offset.x * Math.sin(rad) + offset.y * Math.cos(rad);

      ctx.drawImage(
        img,
        -drawWidth / 2 + rotatedOffsetX * (outputSize / 260),
        -drawHeight / 2 + rotatedOffsetY * (outputSize / 260),
        drawWidth,
        drawHeight
      );
      ctx.restore();

      const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.92);
      await onSave(croppedDataUrl);
      onClose();
    } catch (err) {
      console.error('Error generating cropped avatar:', err);
      setErrorMsg('Failed to process and save avatar. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Render Preview Mini Canvas
  useEffect(() => {
    if (step !== 'edit' || !imageSrc || !previewCanvasRef.current) return;

    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const size = canvas.width;

    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      ctx.clearRect(0, 0, size, size);
      ctx.save();

      // Circular clip
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(0, 0, size, size);

      ctx.translate(size / 2, size / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(zoom, zoom);

      const baseScale = Math.max(size / img.width, size / img.height);
      const drawWidth = img.width * baseScale;
      const drawHeight = img.height * baseScale;

      const rad = (-rotation * Math.PI) / 180;
      const rX = offset.x * Math.cos(rad) - offset.y * Math.sin(rad);
      const rY = offset.x * Math.sin(rad) + offset.y * Math.cos(rad);

      ctx.drawImage(
        img,
        -drawWidth / 2 + rX * (size / 260),
        -drawHeight / 2 + rY * (size / 260),
        drawWidth,
        drawHeight
      );
      ctx.restore();
    };
  }, [step, imageSrc, zoom, rotation, offset]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in" 
      role="dialog" 
      aria-modal="true"
      aria-labelledby="photo-modal-title"
    >
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden space-y-0 relative animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <h2 id="photo-modal-title" className="text-base font-bold text-slate-900">
              {step === 'select' && 'Change Profile Picture'}
              {step === 'camera' && 'Take Profile Photo'}
              {step === 'edit' && 'Adjust & Crop Photo'}
            </h2>
            <p className="text-xs text-slate-500">
              {step === 'select' && 'Select an option to update your municipal account photo.'}
              {step === 'camera' && 'Position your face inside the circle and capture.'}
              {step === 'edit' && 'Drag to position, zoom, and rotate your avatar.'}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="mx-5 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Hidden File Input */}
        <input 
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileSelect}
        />

        {/* STEP 1: SELECT SOURCE */}
        {step === 'select' && (
          <div className="p-6 space-y-5">
            <div className="flex justify-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center text-3xl font-bold shadow-md ring-4 ring-slate-100 overflow-hidden">
                {currentAvatar ? (
                  <img src={currentAvatar} alt="Current Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span>{userName ? userName.charAt(0).toUpperCase() : 'U'}</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs border border-blue-200 transition-colors cursor-pointer"
              >
                <ImageIcon size={18} />
                <span>Choose from Gallery</span>
              </button>

              <button
                type="button"
                onClick={startCamera}
                className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs border border-slate-200 transition-colors cursor-pointer"
              >
                <Camera size={18} />
                <span>Take Photo with Camera</span>
              </button>

              {currentAvatar && (
                <button
                  type="button"
                  onClick={async () => {
                    setLoading(true);
                    try {
                      await onRemove();
                      onClose();
                    } catch (err) {
                      setErrorMsg('Failed to remove photo.');
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs border border-rose-200 transition-colors cursor-pointer"
                >
                  <Trash2 size={16} />
                  <span>Remove Current Photo</span>
                </button>
              )}
            </div>

            <p className="text-[11px] text-center text-slate-400">
              Supported formats: JPEG, PNG, WEBP (Max 5MB)
            </p>
          </div>
        )}

        {/* STEP 2: CAMERA CAPTURE */}
        {step === 'camera' && (
          <div className="p-5 space-y-4">
            {cameraError ? (
              <div className="space-y-4 text-center py-4">
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
                  {cameraError}
                </div>
                <div className="flex justify-center gap-3">
                  <Button variant="outline" onClick={() => setStep('select')}>
                    Back
                  </Button>
                  <Button onClick={() => fileInputRef.current?.click()} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                    <ImageIcon size={16} /> Choose from Gallery
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="relative w-full aspect-square max-w-[280px] mx-auto rounded-2xl overflow-hidden bg-slate-900 shadow-inner flex items-center justify-center">
                  <video 
                    ref={videoRef}
                    autoPlay 
                    playsInline 
                    muted
                    className="w-full h-full object-cover transform -scale-x-100"
                  />
                  {/* Circular Overlay Mask */}
                  <div className="absolute inset-0 pointer-events-none border-4 border-white/80 rounded-full shadow-[0_0_0_9999px_rgba(15,23,42,0.65)] m-4" />
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <Button variant="outline" onClick={() => { stopCamera(); setStep('select'); }}>
                    Cancel
                  </Button>
                  <Button onClick={capturePhoto} className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-sm">
                    <Camera size={16} /> Capture Photo
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {/* STEP 3: IMAGE EDITOR & CROPPER */}
        {step === 'edit' && (
          <div className="p-5 space-y-4">
            {/* Interactive Crop Viewport */}
            <div 
              className="relative w-full aspect-square max-w-[260px] mx-auto rounded-2xl overflow-hidden bg-slate-950 shadow-md cursor-move touch-none select-none flex items-center justify-center"
              onMouseDown={handlePointerDown}
              onMouseMove={handlePointerMove}
              onMouseUp={handlePointerUp}
              onMouseLeave={handlePointerUp}
              onTouchStart={handlePointerDown}
              onTouchMove={handlePointerMove}
              onTouchEnd={handlePointerUp}
              onWheel={handleWheel}
            >
              {/* Scaled & Rotated Target Image */}
              <div 
                className="w-full h-full flex items-center justify-center"
                style={{
                  transform: `translate(${offset.x}px, ${offset.y}px) rotate(${rotation}deg) scale(${zoom})`,
                  transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                }}
              >
                <img 
                  src={imageSrc} 
                  alt="Crop preview" 
                  className="max-w-full max-h-full object-contain pointer-events-none"
                  draggable={false}
                />
              </div>

              {/* Circular Cutout Mask */}
              <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-white/90 rounded-full shadow-[0_0_0_9999px_rgba(15,23,42,0.7)] m-3" />
            </div>

            {/* Controls */}
            <div className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
              {/* Zoom Slider */}
              <div className="flex items-center gap-3">
                <button 
                  type="button"
                  onClick={() => setZoom(prev => Math.max(0.5, prev - 0.1))}
                  className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut size={16} />
                </button>
                <input 
                  type="range"
                  min="0.5"
                  max="3.0"
                  step="0.05"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="flex-1 accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  aria-label="Zoom photo"
                />
                <button 
                  type="button"
                  onClick={() => setZoom(prev => Math.min(3.0, prev + 0.1))}
                  className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn size={16} />
                </button>
                <span className="text-[11px] font-mono font-medium text-slate-600 w-10 text-right">
                  {Math.round(zoom * 100)}%
                </span>
              </div>

              {/* Rotation & Reset Row */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-xs">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleRotate('ccw')}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-medium transition-colors cursor-pointer"
                  >
                    <RotateCcw size={14} /> 90° Left
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRotate('cw')}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-medium transition-colors cursor-pointer"
                  >
                    <RotateCw size={14} /> 90° Right
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setZoom(1);
                    setRotation(0);
                    setOffset({ x: 0, y: 0 });
                  }}
                  className="text-slate-500 hover:text-slate-800 flex items-center gap-1 px-2 py-1 font-medium transition-colors cursor-pointer"
                >
                  <RefreshCw size={12} /> Reset
                </button>
              </div>
            </div>

            {/* Live Result Preview and Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2.5">
                <canvas 
                  ref={previewCanvasRef} 
                  width={48} 
                  height={48} 
                  className="w-10 h-10 rounded-full border border-slate-300 shadow-xs shrink-0" 
                />
                <div className="text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-700 block">Live Avatar</span>
                  Final appearance
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setStep('select')}
                  disabled={loading}
                >
                  Back
                </Button>
                <Button 
                  onClick={handleSaveCrop}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-sm"
                >
                  {loading ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                  Save Photo
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
