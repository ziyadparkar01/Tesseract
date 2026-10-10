import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Radio,
  Compass,
  Footprints,
  Shield,
  Zap,
  Sparkles,
  Smartphone,
  ChevronRight,
  Headphones,
  Music,
  Mic,
  MicOff,
  RotateCcw,
  Send,
  Camera,
  ArrowLeft,
  X,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import { ambientAudioService } from '../services/ambientAudioService';
import { movementTrackingService, MovementTelemetry } from '../services/movementTrackingService';
import { voiceAssistantService, VoiceAssistantState } from '../services/voiceAssistantService';
import { GeneratedMission } from '../services/geminiMissionService';
import { LocalityWaypoint } from '../types';
import { hapticFeedback } from '../utils/haptics';

interface PocketModeHUDProps {
  onClose?: () => void;
  isFullScreen?: boolean;
  mission?: GeneratedMission;
  explorerName?: string;
  activeWaypoint?: LocalityWaypoint | null;
  onOpenPhotoScavenger?: () => void;
}

export const PocketModeHUD: React.FC<PocketModeHUDProps> = ({
  onClose,
  isFullScreen = false,
  mission,
  explorerName = 'Explorer',
  activeWaypoint,
  onOpenPhotoScavenger,
}) => {
  const [isRadarPinging, setIsRadarPinging] = useState(false);
  const [currentDistance, setCurrentDistance] = useState(
    activeWaypoint?.distanceMeters || mission?.targetDistanceMeters || 120
  );
  const [customTextQuery, setCustomTextQuery] = useState('');
  const [isSubmittingQuery, setIsSubmittingQuery] = useState(false);

  const [telemetry, setTelemetry] = useState<MovementTelemetry>(
    movementTrackingService.getTelemetry()
  );
  const [audioState, setAudioState] = useState(ambientAudioService.getState());
  const [voiceState, setVoiceState] = useState<VoiceAssistantState>(
    voiceAssistantService.getState()
  );

  useEffect(() => {
    const unsubMotion = movementTrackingService.subscribe((t) => setTelemetry(t));
    const unsubAudio = ambientAudioService.subscribe((a) => setAudioState(a));
    const unsubVoice = voiceAssistantService.subscribe((v) => setVoiceState(v));
    return () => {
      unsubMotion();
      unsubAudio();
      unsubVoice();
    };
  }, []);

  // Sync latest context with voice assistant service
  useEffect(() => {
    voiceAssistantService.updateContext({
      telemetry,
      mission,
      activeWaypoint,
      explorerName,
    });
  }, [telemetry, mission, activeWaypoint, explorerName]);

  // Trigger simulated tactile radar ping
  const triggerPing = () => {
    hapticFeedback.radarPulse();
    setIsRadarPinging(true);
    setCurrentDistance((prev) => Math.max(12, prev - 10));
    setTimeout(() => {
      setIsRadarPinging(false);
    }, 1200);
  };

  const toggleAmbientSound = () => {
    hapticFeedback.tactileClick();
    ambientAudioService.togglePlay();
  };

  const handleMicToggle = () => {
    hapticFeedback.tactileClick();
    voiceAssistantService.unlockAudio();
    voiceAssistantService.toggleListening({
      telemetry,
      mission,
      activeWaypoint,
      explorerName,
    });
  };

  const handleSendPrompt = async (promptText: string) => {
    if (!promptText.trim()) return;
    hapticFeedback.buttonPress();
    voiceAssistantService.unlockAudio();
    setIsSubmittingQuery(true);
    try {
      await voiceAssistantService.interact(promptText.trim(), {
        telemetry,
        mission,
        activeWaypoint,
        explorerName,
      });
      setCustomTextQuery('');
    } finally {
      setIsSubmittingQuery(false);
    }
  };

  const isListening = voiceState.status === 'listening';
  const isThinking = voiceState.status === 'thinking';
  const isSpeaking = voiceState.status === 'speaking';

  // Quick tactile prompt suggestions
  const quickVoicePrompts = [
    { label: '🎯 What should I do next?', query: 'What should I do right now to proceed?' },
    { label: '📍 Where am I?', query: 'Where am I and how far is the next landmark?' },
    { label: '🍃 Found an item!', query: 'I found one of the craft items on the ground!' },
    { label: '🧭 Which direction?', query: 'Which compass direction should I walk toward?' },
    { label: '⏩ Next objective', query: 'Advance to the next exploration objective.' },
  ];

  return (
    <div
      className={`relative w-full rounded-2xl sm:rounded-3xl bg-[#08080a] text-white p-4 sm:p-7 flex flex-col justify-between overflow-y-auto max-h-[90vh] border border-neutral-800 shadow-2xl select-none font-['Plus_Jakarta_Sans',sans-serif] ${
        isFullScreen ? 'min-h-[620px]' : 'min-h-[500px]'
      }`}
    >
      {/* =========================================================================
          1. HEADER: OLED ENERGY SAVER & TELEMETRY INDICATOR
          ========================================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800">
            <span
              className={`w-2 h-2 rounded-full ${
                telemetry.state === 'MOVING' ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'
              }`}
            />
            <span className="text-[11px] font-bold text-neutral-300">
              {telemetry.state === 'MOVING'
                ? `GPS: MOVING (${telemetry.speedMps || 1.2} M/S · ${telemetry.distanceCoveredMeters}M)`
                : `GPS: AT REST (${telemetry.timeAtRestSeconds}s)`}
            </span>
          </div>

          <span className="hidden sm:inline text-neutral-600 font-mono">·</span>

          <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
            AMOLED PHONE MODE
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Ambient sound toggle */}
          <button
            onClick={toggleAmbientSound}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors flex items-center gap-1.5 cursor-pointer ${
              audioState.isPlaying
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-600/40'
                : 'bg-neutral-900 text-neutral-400 border-neutral-800'
            }`}
          >
            {audioState.isPlaying ? <Volume2 className="w-3 h-3 text-emerald-400" /> : <VolumeX className="w-3 h-3 text-neutral-500" />}
            <span className="hidden xs:inline">{audioState.isPlaying ? 'SOUND ACTIVE' : 'SOUND PAUSED'}</span>
          </button>

          {/* Close / Return to Map Button */}
          {onClose && (
            <button
              onClick={() => {
                hapticFeedback.tactileClick();
                onClose();
              }}
              className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-emerald-400" />
              <span>EXIT PHONE MODE</span>
            </button>
          )}
        </div>
      </div>

      {/* =========================================================================
          2. ACTIVE MISSION BRIEFING CARD
          ========================================================================= */}
      {mission && (
        <div className="mt-3 p-3.5 sm:p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-inner space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xl shrink-0">{mission.stickerReward?.badgeEmoji || '🎯'}</span>
              <div className="min-w-0">
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                  CURRENT FIELD MISSION
                </span>
                <h3 className="font-display font-extrabold text-sm sm:text-base text-white truncate">
                  {mission.title}
                </h3>
              </div>
            </div>

            <div className="px-2 py-0.5 rounded-lg bg-neutral-800 border border-neutral-700 text-amber-400 font-mono text-[11px] font-bold shrink-0">
              +{mission.rewardXp} XP
            </div>
          </div>

          <p className="text-xs font-mono text-neutral-300 leading-relaxed bg-black/40 p-2.5 rounded-xl border border-neutral-800/80">
            {mission.objective}
          </p>

          {mission.scavengerItems && mission.scavengerItems.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {mission.scavengerItems.map((item, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-neutral-950 text-neutral-400 border border-neutral-800 text-[10px] font-mono"
                >
                  {item}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          3. VOICE ASSISTANT INTERACTION CENTER (CHARLIE)
          Interactive voice control with live audio visualizer and instant answers!
          ========================================================================= */}
      <div className="my-3 p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-neutral-900/95 to-neutral-950 border border-neutral-800 space-y-3.5">
        {/* Charlie Guide Status Bar */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                isListening
                  ? 'bg-rose-500 animate-ping'
                  : isSpeaking
                  ? 'bg-emerald-400 animate-pulse'
                  : isThinking
                  ? 'bg-amber-400 animate-spin'
                  : 'bg-emerald-500'
              }`}
            />
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-sm text-white tracking-tight">
                Charlie · AI Field Guide
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                GROQ 120B
              </span>
            </div>
          </div>

          {/* Dynamic Voice Status Badge */}
          <span
            className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase tracking-wider ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse'
                : isSpeaking
                ? 'bg-emerald-500 text-black'
                : isThinking
                ? 'bg-amber-500 text-black'
                : 'bg-neutral-800 text-emerald-400 border border-neutral-700'
            }`}
          >
            {isListening
              ? `LISTENING (${voiceState.silenceSecondsRemaining}s)`
              : isSpeaking
              ? 'SPEAKING TO EARPHONES'
              : isThinking
              ? 'THINKING...'
              : 'READY · TAP MIC'}
          </span>
        </div>

        {/* Primary Tactile Microphone Interaction Button */}
        <div className="flex flex-col items-center justify-center py-2 space-y-2">
          <button
            onClick={handleMicToggle}
            className={`w-full py-4 px-4 rounded-2xl font-mono font-bold text-sm transition-all flex items-center justify-center gap-3 cursor-pointer shadow-xl active:scale-[0.98] ${
              isListening
                ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse ring-4 ring-rose-500/30'
                : isSpeaking
                ? 'bg-emerald-600 hover:bg-emerald-500 text-black ring-4 ring-emerald-500/30'
                : isThinking
                ? 'bg-amber-500 text-black opacity-80 cursor-wait'
                : 'bg-emerald-600 hover:bg-emerald-500 text-black shadow-emerald-950/50'
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="w-5 h-5 shrink-0 animate-bounce" />
                <span className="truncate">
                  {voiceState.latestHeardSpeech
                    ? `HEARD: "${voiceState.latestHeardSpeech}" · TAP TO SEND`
                    : `LISTENING (SPEAK NOW) · ${voiceState.silenceSecondsRemaining}s`}
                </span>
              </>
            ) : isSpeaking ? (
              <>
                <Radio className="w-5 h-5 shrink-0 animate-pulse" />
                <span>CHARLIE IS SPEAKING · TAP TO PAUSE</span>
              </>
            ) : isThinking ? (
              <>
                <Sparkles className="w-5 h-5 shrink-0 animate-spin" />
                <span>PROCESSING YOUR QUESTION...</span>
              </>
            ) : (
              <>
                <Mic className="w-5 h-5 shrink-0" />
                <span>🎙️ TAP TO TALK TO CHARLIE (OR SAY "ECOQUEST")</span>
              </>
            )}
          </button>

          {/* Audio Wave Visualizer Simulation Bar */}
          <div className="w-full flex items-center justify-center gap-1 h-3 pt-1">
            {[40, 70, 90, 50, 80, 100, 60, 45, 95, 65, 30].map((h, i) => (
              <span
                key={i}
                className={`w-1.5 rounded-full transition-all duration-150 ${
                  isSpeaking || isListening ? 'bg-emerald-400' : 'bg-neutral-800'
                }`}
                style={{
                  height:
                    isSpeaking || isListening
                      ? `${Math.max(4, Math.round((h * (voiceState.outputAudioLevel || voiceState.inputAudioLevel || 40)) / 100))}px`
                      : '4px',
                }}
              />
            ))}
          </div>
        </div>

        {/* Optional Mic Error Alert Banner with Troubleshooting */}
        {voiceState.errorMessage && (
          <div className="p-3 rounded-xl bg-amber-950/70 border border-amber-800/80 text-[11px] font-mono text-amber-200 flex items-start gap-2.5">
            <span className="text-base shrink-0">🎙️</span>
            <div className="space-y-0.5">
              <span className="font-bold text-amber-300 block">Microphone Notice:</span>
              <p className="text-amber-200/90 leading-tight">{voiceState.errorMessage}</p>
              <p className="text-[10px] text-amber-400/80">Tip: You can also tap any quick prompt below or type your question!</p>
            </div>
          </div>
        )}

        {/* Spoken Dialogue & Conversation Bubble */}
        <div className="p-3.5 rounded-xl bg-black/60 border border-neutral-800/80 space-y-2">
          {/* Live speech being spoken right now */}
          {isListening && voiceState.latestHeardSpeech && (
            <div className="flex items-start gap-2 text-xs font-mono text-emerald-300 pb-1.5 border-b border-emerald-900/60 animate-pulse">
              <span className="text-emerald-400 font-bold shrink-0">Hearing:</span>
              <span className="italic font-bold text-white">"{voiceState.latestHeardSpeech}"</span>
            </div>
          )}

          {voiceState.lastUserQuery && !isListening && (
            <div className="flex items-start gap-2 text-xs font-mono text-neutral-400 pb-1 border-b border-neutral-800/60">
              <span className="text-emerald-400 font-bold shrink-0">You:</span>
              <span className="italic">"{voiceState.lastUserQuery}"</span>
            </div>
          )}

          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 font-bold uppercase">
                <Volume2 className="w-3 h-3" />
                <span>Charlie's Spoken Guidance:</span>
              </div>
              <p className="text-xs sm:text-sm font-mono text-neutral-100 leading-relaxed font-medium">
                {voiceState.lastSpokenText ||
                  `Expedition started! Today we're tracking items for ${mission?.title || 'your nature craft'}. Keep walking, and say "EcoQuest" or tap the mic whenever you need direction!`}
              </p>
            </div>

            <button
              onClick={() => {
                hapticFeedback.tactileClick();
                voiceAssistantService.replayLastMessage();
              }}
              title="Replay Voice"
              className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-700 shrink-0 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
            </button>
          </div>
        </div>

        {/* Quick Voice Command Chips (1-Tap Reliable Interaction) */}
        <div className="space-y-1.5">
          <div className="text-[10px] font-mono text-neutral-500 uppercase font-semibold flex items-center justify-between">
            <span>Quick Hands-Free Prompts (Tap to ask):</span>
            <span className="text-emerald-400 text-[9px]">100% Reliable Voice AI</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {quickVoicePrompts.map((p, idx) => (
              <button
                key={idx}
                disabled={isThinking}
                onClick={() => handleSendPrompt(p.query)}
                className="px-2.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700 border border-neutral-800 hover:border-emerald-500/40 text-neutral-200 font-mono text-xs transition-colors cursor-pointer flex items-center gap-1 disabled:opacity-50"
              >
                <span>{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Text-based prompt input fallback */}
        <div className="flex items-center gap-1.5 pt-1">
          <input
            type="text"
            value={customTextQuery}
            onChange={(e) => setCustomTextQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendPrompt(customTextQuery);
            }}
            placeholder="Or type a question for Charlie..."
            className="flex-1 bg-black/60 border border-neutral-800 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-neutral-600 outline-none focus:border-emerald-500/60"
          />
          <button
            onClick={() => handleSendPrompt(customTextQuery)}
            disabled={!customTextQuery.trim() || isSubmittingQuery}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-black font-mono font-bold text-xs rounded-xl cursor-pointer transition-colors flex items-center gap-1 shrink-0"
          >
            <Send className="w-3 h-3" />
            <span>ASK</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          4. TACTICAL RADAR BEARING & DISTANCE DISPLAY
          ========================================================================= */}
      <div className="my-2 p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex flex-wrap items-center justify-between gap-4">
        {/* Radar Bearing */}
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-full border border-emerald-500/30 flex items-center justify-center bg-black/40 shrink-0">
            <Compass className="w-6 h-6 text-emerald-400 animate-pulse" />
            {isRadarPinging && (
              <div className="absolute inset-0 rounded-full border-2 border-emerald-400 animate-ping opacity-75" />
            )}
          </div>
          <div>
            <div className="text-[10px] font-mono text-neutral-500 uppercase">TARGET LANDMARK DISTANCE</div>
            <div className="text-xl font-mono font-bold text-white tracking-tight">
              {currentDistance}m <span className="text-xs font-normal text-emerald-400">· 335° NW</span>
            </div>
            <div className="text-[11px] font-mono text-neutral-400 truncate max-w-xs">
              {activeWaypoint?.name || mission?.targetLandmark || 'Ancient Canopy Clearing'}
            </div>
          </div>
        </div>

        {/* Radar Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={triggerPing}
            className="px-3 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-emerald-400 font-mono font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>PING RADAR</span>
          </button>

          {onOpenPhotoScavenger && (
            <button
              onClick={() => {
                hapticFeedback.buttonPress();
                onOpenPhotoScavenger();
              }}
              className="px-3 py-2 bg-stone-100 hover:bg-white text-stone-900 font-mono font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Camera className="w-3.5 h-3.5 text-emerald-600" />
              <span>SNAP CRAFT</span>
            </button>
          )}
        </div>
      </div>

      {/* Tactile notification */}
      {isRadarPinging && (
        <div className="mt-2 text-center text-[11px] font-mono font-bold text-emerald-400 animate-pulse">
          ⚡ TACTILE HAPTIC PULSE SENT (120ms) · RADAR RE-ACQUIRED
        </div>
      )}
    </div>
  );
};
