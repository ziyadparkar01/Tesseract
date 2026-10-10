import React, { useState, useEffect } from 'react';
import {
  Shield,
  MapPin,
  Check,
  ArrowRight,
  Radio,
  Camera,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';
import { hapticFeedback } from '../utils/haptics';

import { Tesseract3DCube } from './Tesseract3DCube';

interface WelcomeIntroOverlayProps {
  onComplete: () => void;
  appName?: string;
  tagline?: string;
  activeHazardsCount?: number;
  userCoords?: { lat: number; lng: number };
}

interface SubsystemStage {
  id: string;
  label: string;
  targetPercent: number;
  status: 'pending' | 'active' | 'ready';
  detail: string;
}

export const WelcomeIntroOverlay: React.FC<WelcomeIntroOverlayProps> = ({
  onComplete,
  appName = 'TESSERACT',
  tagline = 'CIVIC HAZARD INTELLIGENCE NETWORK',
  activeHazardsCount = 4,
  userCoords = { lat: 37.7749, lng: -122.4194 },
}) => {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<'calibrating' | 'ready' | 'revealing' | 'done'>('calibrating');
  const [currentTime, setCurrentTime] = useState('');

  // Genuine Subsystem Milestones
  const [subsystems, setSubsystems] = useState<SubsystemStage[]>([
    {
      id: 'gps',
      label: 'GIS SENSOR TRIANGULATION',
      targetPercent: 24,
      status: 'active',
      detail: `${userCoords.lat.toFixed(4)}°N · ${Math.abs(userCoords.lng).toFixed(4)}°W`,
    },
    {
      id: 'ledger',
      label: 'MUNICIPAL HAZARD LEDGER',
      targetPercent: 52,
      status: 'pending',
      detail: `${activeHazardsCount} ACTIVE STREET HAZARDS SYNCHRONIZED`,
    },
    {
      id: 'vision',
      label: 'AI PHOTO VERIFICATION PIPELINE',
      targetPercent: 78,
      status: 'pending',
      detail: 'GEMINI 3.8 FLASH VISION ENGINE STANDBY',
    },
    {
      id: 'registrar',
      label: 'ACADEMIC REGISTRAR & DISPATCH',
      targetPercent: 100,
      status: 'pending',
      detail: 'FIELD SURVEYOR PROTOCOL ARMED',
    },
  ]);

  // Live UTC Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcut: Space or Enter to skip immediately
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'Escape') {
        e.preventDefault();
        triggerImmediateReveal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Smooth, active 60fps calibration loop
  useEffect(() => {
    const totalDuration = 2000; // 2 seconds high-efficiency load
    const startTime = performance.now();

    const frameStep = (now: number) => {
      const elapsed = now - startTime;
      const progressFraction = Math.min(1, elapsed / totalDuration);
      
      // Architectural ease-out quint
      const eased = 1 - Math.pow(1 - progressFraction, 4);
      const currentVal = Math.min(100, Math.round(eased * 100));

      setProgress(currentVal);

      // Update subsystem stages reactively based on progress
      setSubsystems((prev) =>
        prev.map((sub) => {
          if (currentVal >= sub.targetPercent) {
            return { ...sub, status: 'ready' };
          } else if (currentVal >= sub.targetPercent - 25) {
            return { ...sub, status: 'active' };
          }
          return { ...sub, status: 'pending' };
        })
      );

      if (progressFraction < 1) {
        requestAnimationFrame(frameStep);
      } else {
        setProgress(100);
        setPhase('ready');
        try {
          hapticFeedback();
        } catch (_) {}

        // Graceful automatic transition into app
        const revealTimer = setTimeout(() => {
          setPhase('revealing');
        }, 400);

        const doneTimer = setTimeout(() => {
          setPhase('done');
          onComplete();
        }, 1100);

        return () => {
          clearTimeout(revealTimer);
          clearTimeout(doneTimer);
        };
      }
    };

    const animHandle = requestAnimationFrame(frameStep);
    return () => cancelAnimationFrame(animHandle);
  }, [onComplete]);

  const triggerImmediateReveal = () => {
    setPhase('revealing');
    try {
      hapticFeedback();
    } catch (_) {}
    setTimeout(() => {
      setPhase('done');
      onComplete();
    }, 350);
  };

  if (phase === 'done') return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Tesseract Initialization Interface"
      className={`fixed inset-0 z-[100] select-none transition-opacity duration-700 ${
        phase === 'revealing' ? 'pointer-events-none' : 'pointer-events-auto'
      }`}
    >
      {/* ARCHITECTURAL MONOLITH SHUTTERS */}
      <div
        className={`absolute inset-x-0 top-0 h-1/2 bg-[#090a0f] border-b border-stone-800 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform origin-top ${
          phase === 'revealing' ? '-translate-y-full' : 'translate-y-0'
        }`}
      />
      <div
        className={`absolute inset-x-0 bottom-0 h-1/2 bg-[#090a0f] border-t border-stone-800 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform origin-bottom ${
          phase === 'revealing' ? 'translate-y-full' : 'translate-y-0'
        }`}
      />

      {/* DELICATE ARCHITECTURAL CORNER CROSSHAIRS */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-500 p-8 flex flex-col justify-between ${
          phase === 'revealing' ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <div className="flex justify-between text-stone-600 font-mono text-xs">
          <span>+ 01_TOP_LEFT</span>
          <span>+ 02_TOP_RIGHT</span>
        </div>
        <div className="flex justify-between text-stone-600 font-mono text-xs">
          <span>+ 03_BOTTOM_LEFT</span>
          <span>+ 04_BOTTOM_RIGHT</span>
        </div>
      </div>

      {/* FOREGROUND LOADING ENGINE */}
      <div
        className={`relative z-10 w-full h-full flex flex-col justify-between p-6 sm:p-10 lg:p-14 text-stone-100 transition-all duration-500 ${
          phase === 'revealing' ? 'opacity-0 scale-98 blur-xs' : 'opacity-100 scale-100'
        }`}
      >
        {/* Top Architectural Header */}
        <div className="flex items-center justify-between border-b border-stone-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center p-1 rounded-xl bg-stone-900 border border-cyan-500/50 shadow-[0_0_20px_rgba(56,189,248,0.4)]">
              <Tesseract3DCube size={36} interactive burstOnHover />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold tracking-widest text-sm text-white">
                  {appName}
                </span>
                <span className="text-stone-600 text-xs font-mono">/</span>
                <span className="font-mono text-xs text-cyan-400">
                  4D CORE ENGINE
                </span>
              </div>
              <div className="text-[10px] font-mono text-stone-400 uppercase tracking-wider">
                {tagline}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="font-mono text-xs text-stone-400 hidden sm:inline tabular-nums">
              {currentTime}
            </span>
            <button
              onClick={triggerImmediateReveal}
              className="px-3 py-1.5 rounded-lg border border-cyan-500/40 bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 hover:text-white font-mono text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-[0_0_12px_rgba(56,189,248,0.2)]"
            >
              <span>ENTER NOW</span>
              <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
            </button>
          </div>
        </div>

        {/* Center Stage: High-Precision Progress Counter & Subsystem Matrix */}
        <div className="max-w-4xl mx-auto w-full my-auto py-4 flex flex-col gap-6">
          
          {/* Central 3D Tesseract Glowing Display */}
          <div className="flex items-center justify-center -mb-2">
            <div className="relative flex items-center justify-center p-3 rounded-2xl bg-gradient-to-b from-stone-900/60 to-transparent border border-cyan-500/20 shadow-[0_0_40px_rgba(56,189,248,0.3)]">
              <Tesseract3DCube size={90} interactive burstOnHover />
            </div>
          </div>
          
          {/* Kinetic Numerical Counter */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-800 pb-6">
            <div>
              <div className="text-xs font-mono tracking-widest text-stone-400 uppercase mb-1">
                SYSTEM CALIBRATION SEQUENCE
              </div>
              <div className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                {progress < 100 ? 'Initializing Matrix' : 'Network Synchronized'}
              </div>
            </div>

            <div className="flex items-baseline gap-1 font-mono">
              <span className="text-6xl sm:text-8xl font-black text-white tabular-nums tracking-tighter">
                {progress < 10 ? `0${progress}` : progress}
              </span>
              <span className="text-xl sm:text-2xl font-bold text-amber-400 font-mono">%</span>
            </div>
          </div>

          {/* Precision Millimeter Progress Bar */}
          <div className="flex flex-col gap-2">
            <div className="h-1.5 w-full bg-stone-900 rounded-none overflow-hidden border border-stone-800">
              <div
                className="h-full bg-stone-100 transition-all duration-100 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] font-mono text-stone-500">
              <span>LATENCY: ZERO-DRIFT SENSORS</span>
              <span className="uppercase">
                {progress < 100 ? 'STREAMING PACKETS...' : 'SYSTEM READY'}
              </span>
            </div>
          </div>

          {/* Genuine Subsystem Readiness Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {subsystems.map((sub, index) => (
              <div
                key={sub.id}
                className={`p-3 rounded border font-mono text-xs transition-all ${
                  sub.status === 'ready'
                    ? 'bg-stone-900/60 border-stone-700 text-stone-200'
                    : sub.status === 'active'
                    ? 'bg-stone-900/40 border-amber-500/50 text-white'
                    : 'bg-stone-950/30 border-stone-850 text-stone-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-stone-300">
                    0{index + 1}. {sub.label}
                  </span>
                  {sub.status === 'ready' ? (
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                      <Check className="w-3 h-3 stroke-[2.5]" />
                      READY
                    </span>
                  ) : sub.status === 'active' ? (
                    <span className="text-[10px] text-amber-400 font-mono animate-pulse">
                      LOADING...
                    </span>
                  ) : (
                    <span className="text-[10px] text-stone-600 font-mono">
                      WAIT
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-stone-400 mt-1 truncate">
                  {sub.detail}
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Bottom Architectural Metadata Dock */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-stone-800/80 pt-4 text-[11px] font-mono text-stone-500">
          <div className="flex items-center gap-3">
            <span className="text-stone-300">PRESS [SPACE] OR CLICK TO ADVANCE</span>
            <span>·</span>
            <span>WARD 12-16 GIS PROTOCOL</span>
          </div>

          <div className="flex items-center gap-2 text-stone-400">
            <span>HIGH-PRECISION CIVIC AUDIT</span>
            <span>·</span>
            <span className="text-stone-200">2026 ARCHITECTURAL SPEC</span>
          </div>
        </div>

      </div>
    </div>
  );
};
