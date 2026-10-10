import React, { useState, useRef } from 'react';
import { CivicHazard, AIVerifyFixResult } from '../types';
import { hazardService } from '../services/hazardService';
import {
  Camera,
  CheckCircle2,
  AlertTriangle,
  X,
  Sparkles,
  Upload,
  RefreshCw,
  ShieldCheck,
  FileCheck,
} from 'lucide-react';
import { hapticFeedback } from '../utils/haptics';

interface PhotoFixVerificationModalProps {
  hazard: CivicHazard | null;
  isOpen: boolean;
  onClose: () => void;
  onFixVerified: (updatedHazard: CivicHazard) => void;
}

const SAMPLE_FIX_PHOTO = '/src/assets/images/hazard_fixed_verified_1791570158592.jpg';

export const PhotoFixVerificationModal: React.FC<PhotoFixVerificationModalProps> = ({
  hazard,
  isOpen,
  onClose,
  onFixVerified,
}) => {
  const [repairPhotoPreview, setRepairPhotoPreview] = useState<string>(SAMPLE_FIX_PHOTO);
  const [repairPhotoBase64, setRepairPhotoBase64] = useState<string>('');
  const [contractorNotes, setContractorNotes] = useState<string>(
    'Installed 600mm heavy-duty ductile iron frame with reinforced asphalt surround.'
  );
  const [inspectorName, setInspectorName] = useState<string>('Inspector Sarah Lin (Ward 14 Civil Works)');

  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationResult, setVerificationResult] = useState<AIVerifyFixResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !hazard) return null;

  const isAlreadyResolved = hazard.status === 'RESOLVED_VERIFIED';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setRepairPhotoPreview(result);
      setRepairPhotoBase64(result);
      hapticFeedback();
    };
    reader.readAsDataURL(file);
  };

  const runVerificationAudit = async () => {
    setIsVerifying(true);
    setErrorMessage(null);
    hapticFeedback();

    try {
      // Run AI inspection
      const audit = await hazardService.verifyFix(
        hazard.id,
        repairPhotoBase64 || repairPhotoPreview,
        contractorNotes
      );
      setVerificationResult(audit);

      if (audit.isFixed) {
        // Submit verified repair to backend to close ticket
        const updated = await hazardService.submitVerifiedRepair(hazard.id, {
          repairPhotoUrl: repairPhotoPreview,
          repairPhotoBase64: repairPhotoBase64 || undefined,
          contractorNotes: `${contractorNotes} · Materials: Grade 500-7 Ductile Iron + Hot-Mix Asphalt`,
          inspectorName,
        });
        onFixVerified(updated);
      }
    } catch (err: any) {
      console.warn('Fix verification audit error:', err);
      setErrorMessage(err?.message || 'Verification audit could not be completed.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white text-stone-900 rounded-xl shadow-2xl border border-stone-200 overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base sm:text-lg font-bold text-stone-950">
                {isAlreadyResolved ? 'Verified Repair Audit Record' : 'Photo-Verified Repair Protocol'}
              </h2>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Incident #{hazard.id} · {hazard.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Side-by-side Before & After Photo Comparison */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
              Visual Before & After Forensic Comparison
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* BEFORE: Original Hazard Photo */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-rose-700 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>BEFORE (Original Report)</span>
                  </span>
                  <span className="font-mono text-stone-400">
                    {new Date(hazard.reportedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="relative h-52 rounded-lg overflow-hidden border-2 border-rose-300 bg-stone-100">
                  <img
                    src={hazard.photoUrl}
                    alt="Original reported hazard"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-stone-950/80 text-white font-mono text-[10px] rounded font-bold">
                    Severity: {hazard.severityScore}/100
                  </div>
                </div>
                <p className="text-[11px] text-stone-500 line-clamp-2">
                  {hazard.description}
                </p>
              </div>

              {/* AFTER: Repaired Site Photo */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>AFTER (Fixed Verification Photo)</span>
                  </span>
                  <span className="font-mono text-emerald-600 font-semibold">
                    {hazard.resolution ? 'Verified' : 'Ready for Audit'}
                  </span>
                </div>
                <div className="relative h-52 rounded-lg overflow-hidden border-2 border-emerald-400 bg-stone-100 group">
                  <img
                    src={hazard.resolution?.repairPhotoUrl || repairPhotoPreview}
                    alt="Repaired road section"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />

                  {!isAlreadyResolved && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute top-2 right-2 px-2.5 py-1 text-xs font-semibold bg-stone-900/80 hover:bg-stone-900 text-white rounded shadow-sm backdrop-blur-sm"
                    >
                      Upload Other Photo
                    </button>
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
                <p className="text-[11px] text-stone-500">
                  Must clearly show permanent iron cover, asphalt patch, or insulated wire bundle.
                </p>
              </div>
            </div>
          </div>

          {/* Form fields for inspector & notes if not yet resolved */}
          {!isAlreadyResolved ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-stone-50 p-4 rounded-xl border border-stone-200">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Civil Works Inspector Name
                </label>
                <input
                  type="text"
                  value={inspectorName}
                  onChange={(e) => setInspectorName(e.target.value)}
                  className="w-full text-xs bg-white border border-stone-300 rounded px-3 py-2 text-stone-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Repairs Completed & Materials Used
                </label>
                <input
                  type="text"
                  value={contractorNotes}
                  onChange={(e) => setContractorNotes(e.target.value)}
                  className="w-full text-xs bg-white border border-stone-300 rounded px-3 py-2 text-stone-900"
                />
              </div>
            </div>
          ) : (
            /* Resolved Verified Certificate Details */
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
              <div className="flex items-center gap-2 mb-2">
                <FileCheck className="w-5 h-5 text-emerald-700" />
                <h4 className="text-sm font-bold text-emerald-950">
                  Official Municipal Verification Certificate
                </h4>
              </div>
              <div className="text-xs text-emerald-900 space-y-1 font-medium">
                <p>
                  <strong>AI Inspection Assessment:</strong> {hazard.resolution?.verificationNotes}
                </p>
                <p>
                  <strong>Confidence Rating:</strong> {hazard.resolution?.verificationConfidence}% Verified
                </p>
                <p>
                  <strong>Materials:</strong> {hazard.resolution?.materialUsed}
                </p>
                <p>
                  <strong>Verified By:</strong> {hazard.resolution?.inspectorName || 'Chief Engineer Sandra Ortiz'}
                </p>
              </div>
            </div>
          )}

          {/* AI Inspection Preview Result if just ran */}
          {verificationResult && (
            <div className="p-4 bg-stone-900 text-stone-100 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>AI Computer Vision Inspection Result</span>
                </span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 bg-emerald-900/60 text-emerald-300 rounded">
                  {verificationResult.confidenceScore}% Confidence
                </span>
              </div>
              <p className="text-xs text-stone-300">
                {verificationResult.verificationAssessment}
              </p>
              {verificationResult.detectedRepairs.length > 0 && (
                <div className="text-[11px] text-stone-400">
                  <strong>Visible Repairs:</strong> {verificationResult.detectedRepairs.join(' · ')}
                </div>
              )}
            </div>
          )}

          {/* Error alert banner */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Action Button */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900"
            >
              Close
            </button>

            {!isAlreadyResolved && (
              <button
                type="button"
                onClick={runVerificationAudit}
                disabled={isVerifying}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded shadow-md transition-all disabled:opacity-50"
              >
                {isVerifying ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <ShieldCheck className="w-4 h-4" />
                )}
                <span>Run AI Photo Verification & Close Ticket</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
