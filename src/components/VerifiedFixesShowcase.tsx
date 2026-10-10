import React, { useState } from 'react';
import { CivicHazard } from '../types';
import { CheckCircle2, ShieldCheck, ArrowRight, Calendar, User, FileText, ExternalLink } from 'lucide-react';

interface VerifiedFixesShowcaseProps {
  hazards: CivicHazard[];
  onOpenFixModal: (hazard: CivicHazard) => void;
}

export const VerifiedFixesShowcase: React.FC<VerifiedFixesShowcaseProps> = ({
  hazards,
  onOpenFixModal,
}) => {
  const verifiedHazards = hazards.filter((h) => h.status === 'RESOLVED_VERIFIED');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Title */}
      <div className="pb-4 border-b border-stone-200">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-emerald-600" />
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900">
            Public Proof of Fix Ledger
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Every completed municipal road repair is backed by photographic verification and AI forensic audit
        </p>
      </div>

      {/* Grid of Verified Fixes */}
      {verifiedHazards.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 p-8 text-center max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-stone-900">No Verified Fixes Yet</h3>
          <p className="text-xs text-stone-500">
            Once repair crews submit completion photos and pass the AI vision audit, verified before-and-after certificates appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {verifiedHazards.map((hazard) => (
          <div
            key={hazard.id}
            className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden flex flex-col"
          >
            {/* Header info */}
            <div className="p-4 border-b border-stone-100 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  VERIFIED FIXED · {hazard.resolution?.verificationConfidence || 98}% MATCH
                </span>
                <h3 className="text-sm font-bold text-stone-900 mt-1.5 line-clamp-1">
                  {hazard.title}
                </h3>
              </div>
              <span className="text-xs text-stone-400 font-mono">
                #{hazard.id}
              </span>
            </div>

            {/* Split Before & After Visual */}
            <div className="grid grid-cols-2 gap-0.5 bg-stone-100 h-48 sm:h-56 relative">
              {/* Left Before */}
              <div className="relative h-full overflow-hidden">
                <img
                  src={hazard.photoUrl}
                  alt="Hazard Before"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-rose-700/90 text-white font-mono text-[9px] font-bold rounded">
                  BEFORE: HAZARD
                </div>
              </div>

              {/* Right After */}
              <div className="relative h-full overflow-hidden">
                <img
                  src={hazard.resolution?.repairPhotoUrl || '/src/assets/images/hazard_fixed_verified_1791570158592.jpg'}
                  alt="Repaired After"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-emerald-600/90 text-white font-mono text-[9px] font-bold rounded">
                  AFTER: SEALED
                </div>
              </div>
            </div>

            {/* Verification Metadata */}
            <div className="p-4 flex-1 flex flex-col justify-between text-xs space-y-3">
              <div className="text-stone-600 space-y-1">
                <p className="line-clamp-2">
                  <strong className="text-stone-800">Audit Finding:</strong>{' '}
                  {hazard.resolution?.verificationNotes || 'Heavy-duty iron lid sealed flush with roadway.'}
                </p>
                <div className="flex items-center gap-2 text-stone-500 pt-1">
                  <span>📍 {hazard.location.address}</span>
                  <span>·</span>
                  <span>{hazard.location.ward}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                <div className="text-stone-500 font-mono text-[11px]">
                  Verified: {hazard.resolution?.verifiedAt ? new Date(hazard.resolution.verifiedAt).toLocaleDateString() : 'Today'}
                </div>
                <button
                  onClick={() => onOpenFixModal(hazard)}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                >
                  <span>View Certificate</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
};
