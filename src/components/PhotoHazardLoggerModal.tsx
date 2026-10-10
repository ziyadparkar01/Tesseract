import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  MapPin,
  X,
  Upload,
  Sparkles,
  AlertTriangle,
  Check,
  RefreshCw,
  Zap,
  Droplets,
  Activity,
  Layers,
  Mic,
  MicOff,
} from 'lucide-react';
import { HazardCategory, HazardSeverity, CivicHazard } from '../types';
import { hazardService, ReportHazardPayload } from '../services/hazardService';
import { hapticFeedback } from '../utils/haptics';

interface PhotoHazardLoggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onHazardCreated: (newHazard: CivicHazard) => void;
  userCoords: { lat: number; lng: number };
}

export const PhotoHazardLoggerModal: React.FC<PhotoHazardLoggerModalProps> = ({
  isOpen,
  onClose,
  onHazardCreated,
  userCoords,
}) => {
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [photoBase64, setPhotoBase64] = useState<string>('');
  const [category, setCategory] = useState<HazardCategory>('OPEN_MANHOLE');
  const [severity, setSeverity] = useState<HazardSeverity>('CRITICAL');
  const [severityScore, setSeverityScore] = useState<number>(95);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [landmark, setLandmark] = useState<string>('');
  const [dangerFactors, setDangerFactors] = useState<string[]>([]);
  const [recommendedAction, setRecommendedAction] = useState<string>('');

  // AI Analysis state
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false);
  const [aiAnalysisCompleted, setAiAnalysisCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Set default address from user coordinates on open
  useEffect(() => {
    if (isOpen) {
      const latStr = userCoords.lat.toFixed(4);
      const lngStr = Math.abs(userCoords.lng).toFixed(4);
      setAddress(`${latStr}°N, ${lngStr}°W · Main Commuter Corridor`);
    }
  }, [isOpen, userCoords]);

  // Handle Photo selection from camera / file input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPhotoPreview(result);
      setPhotoBase64(result);
      hapticFeedback();
      // Auto-trigger AI Vision Analysis
      runAIVisionAnalysis(result);
    };
    reader.readAsDataURL(file);
  };

  // AI Vision Analysis using Gemini 3.8 Flash
  const runAIVisionAnalysis = async (base64Img: string) => {
    setIsAnalyzingPhoto(true);
    setAiAnalysisCompleted(false);

    try {
      const analysis = await hazardService.analyzePhoto(base64Img);
      setCategory(analysis.category);
      setSeverity(analysis.severity);
      setSeverityScore(analysis.severityScore);
      setTitle(analysis.detectedTitle);
      setDescription(analysis.description);
      setDangerFactors(analysis.dangerFactors);
      setRecommendedAction(analysis.recommendedAction);
      setAiAnalysisCompleted(true);
      hapticFeedback();
    } catch (err) {
      console.warn('AI analysis fallback:', err);
      // Graceful fallback
      if (!title) setTitle('Open Street Hazard Detected');
      if (!description) setDescription('Urgent civic road hazard requiring immediate municipal containment.');
      setDangerFactors(['Pedestrian tripping risk', 'Vehicle wheel damage risk']);
      setRecommendedAction('Dispatch municipal repair crew and set safety perimeter');
    } finally {
      setIsAnalyzingPhoto(false);
    }
  };

  const [isListening, setIsListening] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);

  const processSpokenText = async (text: string) => {
    setIsProcessingVoice(true);
    hapticFeedback();
    try {
      const res = await hazardService.transcribeVoiceNote(text);
      if (res?.hazardData) {
        if (res.hazardData.title) setTitle(res.hazardData.title);
        if (res.hazardData.description) setDescription(res.hazardData.description);
        if (res.hazardData.category) setCategory(res.hazardData.category as HazardCategory);
        if (res.hazardData.severity) setSeverity(res.hazardData.severity as HazardSeverity);
        if (res.hazardData.severityScore) setSeverityScore(res.hazardData.severityScore);
        if ((res.hazardData as any).landmarkClue) setLandmark((res.hazardData as any).landmarkClue);
      }
    } catch (err) {
      console.warn('Voice transcribe fallback:', err);
      setDescription((prev) => (prev ? `${prev}. ${text}` : text));
    } finally {
      setIsProcessingVoice(false);
    }
  };

  const handleToggleVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      const promptInput = window.prompt(
        'Dictate your hazard report (e.g., "Dangerous uncovered sewer manhole with broken edges near transit stop"):',
        'Dangerous uncovered sewer manhole on vehicular lane near crossing'
      );
      if (promptInput) processSpokenText(promptInput);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        hapticFeedback();
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        processSpokenText(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!photoPreview) {
      setFormError('Please upload or take a photo of the hazard first.');
      return;
    }

    setFormError(null);
    setIsSubmitting(true);
    hapticFeedback();

    try {
      const payload: ReportHazardPayload = {
        title: title || `${category.replace(/_/g, ' ')} Hazard`,
        category,
        severity,
        severityScore,
        description: description || 'Hazard reported via Tesseract Citizen Field Report.',
        location: {
          lat: userCoords.lat,
          lng: userCoords.lng,
          address: address || 'Ward 14 Metro Corridor',
          ward: 'Ward 12-16 Central Municipal District',
          landmark: landmark || undefined,
        },
        photoUrl: photoPreview,
        dangerFactors: dangerFactors.length > 0 ? dangerFactors : ['Public commuter safety risk'],
        recommendedAction:
          recommendedAction || 'Immediate municipal inspection & dispatch of repair crew',
      };

      const newHazard = await hazardService.reportHazard(payload);
      onHazardCreated(newHazard);
      onClose();
    } catch (err: any) {
      console.error('Submit error:', err);
      setFormError(`Submission failed: ${err.message || 'Unknown network error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-stone-950/80 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden text-stone-900 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 bg-stone-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-stone-950 flex items-center justify-center font-bold text-sm">
              <Camera className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base font-bold font-mono tracking-tight text-white">
                Log Civic Hazard
              </h2>
              <p className="text-[11px] text-stone-400 font-mono">
                Real-Time GPS Tag & AI Photo Verification
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 max-h-[78vh] overflow-y-auto">
          {formError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-300 text-rose-850 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{formError}</span>
            </div>
          )}
          
          {/* PHOTO UPLOAD DROPZONE */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-cyan-600" />
                <span>1. Hazard Photograph *</span>
              </label>
              <span className="text-xs text-stone-500">Camera / File Upload</span>
            </div>

            <div className="relative border-2 border-dashed border-stone-300 hover:border-cyan-500 rounded-xl p-4 text-center transition-colors bg-stone-50/70">
              {photoPreview ? (
                <div className="relative inline-block w-full">
                  <img
                    src={photoPreview}
                    alt="Uploaded road hazard"
                    className="max-h-56 w-full object-cover rounded-lg shadow-sm"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 text-xs font-medium bg-stone-900/85 hover:bg-stone-900 text-white rounded-lg shadow-sm backdrop-blur-sm transition-colors cursor-pointer"
                    >
                      Change Photo
                    </button>
                    <button
                      type="button"
                      onClick={() => photoBase64 && runAIVisionAnalysis(photoBase64)}
                      disabled={isAnalyzingPhoto}
                      className="px-3 py-1.5 text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-stone-950 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isAnalyzingPhoto ? 'Scanning...' : 'AI Re-Scan'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="py-10 cursor-pointer flex flex-col items-center justify-center hover:opacity-90 transition-opacity"
                >
                  <div className="w-14 h-14 rounded-2xl bg-cyan-50 text-cyan-700 flex items-center justify-center mb-3 border border-cyan-200 shadow-xs">
                    <Camera className="w-7 h-7" />
                  </div>
                  <p className="text-sm font-semibold text-stone-800">
                    Snap or Select Photo of Road Hazard
                  </p>
                  <p className="text-xs text-stone-500 mt-1">
                    Open Manhole, Dangling Wire, Broken Sidewalk, or Waterlogging
                  </p>
                  <span className="mt-3 px-4 py-1.5 rounded-lg bg-stone-900 text-white text-xs font-medium shadow-xs">
                    Choose Photo File
                  </span>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          {/* AI SCAN STATUS PILL */}
          {isAnalyzingPhoto && (
            <div className="p-3.5 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-900 text-xs flex items-center gap-2.5 animate-pulse">
              <Sparkles className="w-4 h-4 text-cyan-600 animate-spin" />
              <span className="font-medium">
                Gemini 3.8 Flash Vision analyzing photographic pixels for hazard severity...
              </span>
            </div>
          )}

          {aiAnalysisCompleted && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold">AI Vision Audit Complete: Categorized as {category.replace(/_/g, ' ')}</span>
              </div>
              <span className="font-mono font-bold text-rose-700">Severity: {severityScore}/100</span>
            </div>
          )}

          {/* 2. HAZARD DETAILS */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Hazard Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Broken Pedestrian Slab on Crosswalk"
                className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3.5 py-2.5 text-stone-900 text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as HazardCategory)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2.5 text-stone-900 text-xs focus:outline-none focus:border-cyan-500 font-medium"
                >
                  <option value="OPEN_MANHOLE">Open Manhole</option>
                  <option value="DANGLING_LIVE_WIRE">Dangling Live Wire</option>
                  <option value="WATERLOGGING">Severe Waterlogging</option>
                  <option value="BROKEN_FOOTPATH">Broken Footpath / Sidewalk</option>
                  <option value="DEEP_POTHOLE">Deep Crater Pothole</option>
                  <option value="MISSING_DRAIN_GRATE">Missing Drain Grate</option>
                  <option value="FALLEN_DEBRIS">Fallen Debris / Obstruction</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Severity Level
                </label>
                <select
                  value={severity}
                  onChange={(e) => {
                    const sev = e.target.value as HazardSeverity;
                    setSeverity(sev);
                    if (sev === 'CRITICAL') setSeverityScore(95);
                    else if (sev === 'HIGH') setSeverityScore(80);
                    else if (sev === 'MEDIUM') setSeverityScore(55);
                    else setSeverityScore(30);
                  }}
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2.5 text-stone-900 text-xs focus:outline-none focus:border-cyan-500 font-medium"
                >
                  <option value="CRITICAL">Critical (Immediate Fatal Risk)</option>
                  <option value="HIGH">High (Urgent Disruption)</option>
                  <option value="MEDIUM">Medium (Pedestrian Hazard)</option>
                  <option value="LOW">Low (Minor Repair)</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                  Description & Impact
                </label>
                <button
                  type="button"
                  onClick={handleToggleVoiceInput}
                  disabled={isProcessingVoice}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-md border transition-all cursor-pointer ${
                    isListening
                      ? 'bg-rose-600 text-white border-rose-700 animate-pulse'
                      : isProcessingVoice
                      ? 'bg-cyan-50 text-cyan-800 border-cyan-300'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-300'
                  }`}
                  title="Speak your report using voice dictation"
                >
                  {isListening ? (
                    <>
                      <Mic className="w-3.5 h-3.5 text-white animate-bounce" />
                      <span>Listening... Speak Now</span>
                    </>
                  ) : isProcessingVoice ? (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-cyan-600 animate-spin" />
                      <span>AI Parsing Speech...</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-3.5 h-3.5 text-stone-600" />
                      <span>Voice Dictation</span>
                    </>
                  )}
                </button>
              </div>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe danger to pedestrians, elderly, school children, or traffic..."
                className="w-full bg-stone-50 border border-stone-300 rounded-lg p-3 text-stone-900 text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-cyan-600" />
                  <span>GPS Street Address</span>
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-stone-800 text-xs focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Nearby Landmark
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="e.g. Opposite Metro Pillar 42"
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-stone-900 text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !photoPreview}
              className="px-6 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-stone-950 text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-md"
            >
              {isSubmitting ? 'Logging Hazard...' : 'Submit to Municipal Queue'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
