// Tactical Voice Assistant Service: Powered by ElevenLabs TTS & Google Gemini Flash
// Hands-free voice assistant that listens for the wake-word "EcoQuest" and runs quietly in the background
// Keeps the UI focused on the 3D Character and Tactical Google Map!

import { MovementTelemetry } from './movementTrackingService';
import { GeneratedMission } from './geminiMissionService';
import { LocalityWaypoint } from '../types';
import { hapticFeedback } from '../utils/haptics';
import { ambientAudioService } from './ambientAudioService';

export type VoiceAssistantStatus = 'idle' | 'listening' | 'thinking' | 'speaking' | 'error';

export interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  thought?: string;
  action?: string;
  timestamp: number;
}

export interface VoiceAssistantState {
  status: VoiceAssistantStatus;
  activeVoiceId: string;
  activeVoiceName: string;
  isMuted: boolean;
  isWakeWordEnabled: boolean;
  isAutoLeadEnabled: boolean;
  silenceSecondsRemaining: number; // 0 to 5 countdown
  inputAudioLevel: number; // 0 to 100 for glowing orb
  outputAudioLevel: number; // 0 to 100 for speaking pulse
  audioSourceUsed: string; // 'elevenlabs' | 'gemini-neural-speech' | 'browser-speech'
  lastThought: string;
  lastSpokenText: string;
  lastUserQuery?: string;
  latestHeardSpeech?: string; // Live speech words as explorer is actively speaking!
  errorMessage: string | null;
}

export type VoiceAssistantActionCallback = (action: string, payload?: any) => void;

// -----------------------------------------------------------------------------
// ASSISTANT SOUND EFFECTS (Live Mic Active Chimes, Sleep Tone, Processing)
// Built with Web Audio API for 0 latency, pleasant Apple Siri / Google Assistant fidelity
// -----------------------------------------------------------------------------
class AssistantAudioEffects {
  private ctx: AudioContext | null = null;

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      if (!this.ctx || this.ctx.state === 'closed') {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    } catch (_) {
      return null;
    }
  }

  // The Live Mic Active Sound: High-tech, musical dual-tone chime (D5 -> A5)
  public playWakeChime() {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;

      // Tone 1: 587.33 Hz (D5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now);
      gain1.gain.setValueAtTime(0.22, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.12);

      // Tone 2: 880.00 Hz (A5)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880.0, now + 0.09);
      gain2.gain.setValueAtTime(0.28, now + 0.09);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.09);
      osc2.stop(now + 0.35);
    } catch (_) {}
  }

  // Sleep / Deactivation chime: Soft descending tone (659Hz -> 440Hz)
  public playSleepChime() {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, now);
      osc.frequency.exponentialRampToValueAtTime(440.0, now + 0.18);
      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.22);
    } catch (_) {}
  }

  // Thinking / Processing chime
  public playProcessingChime() {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(784.0, now);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);
    } catch (_) {}
  }
}

const soundEffects = new AssistantAudioEffects();

// -----------------------------------------------------------------------------
// VOICE ASSISTANT CORE SERVICE
// -----------------------------------------------------------------------------
class VoiceAssistantService {
  private state: VoiceAssistantState = {
    status: 'idle',
    activeVoiceId: 'IKne3meq5aSn9XLyUdCD', // Charlie - Deep, Confident, Energetic (ElevenLabs)
    activeVoiceName: 'Charlie',
    isMuted: false,
    isWakeWordEnabled: true,
    isAutoLeadEnabled: true,
    silenceSecondsRemaining: 5,
    inputAudioLevel: 0,
    outputAudioLevel: 0,
    audioSourceUsed: 'elevenlabs',
    lastThought: 'Ready. Say "EcoQuest" or tap the mic.',
    lastSpokenText: '',
    errorMessage: null,
  };

  private listeners: Set<(state: VoiceAssistantState) => void> = new Set();
  private actionCallbacks: Set<VoiceAssistantActionCallback> = new Set();

  // Internal Audio Playback
  private currentAudio: HTMLAudioElement | null = null;
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private animFrameId: number | null = null;

  // Speech Recognition (Wake Word + Active Listening)
  private recognition: any = null;
  private isRecognitionActive = false;
  private isAwakeListening = false; // true = listening for command, false = standby for wake word
  private silenceTimer: any = null;
  private countdownInterval: any = null;

  // Microphone Audio Level & MediaRecorder fallback
  private micStream: MediaStream | null = null;
  private micAudioCtx: AudioContext | null = null;
  private micAnalyser: AnalyserNode | null = null;
  private micAnimFrameId: number | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private capturedByRecognition = false;
  private latestHeardSpeech = '';
  private speechSilenceTimer: any = null;
  private hasDetectedVoiceEnergy = false;

  // Context Cache for ongoing session
  private latestContext: {
    telemetry?: MovementTelemetry;
    mission?: GeneratedMission;
    activeWaypoint?: LocalityWaypoint | null;
    explorerName?: string;
  } = {};

  // Milestone triggers for auto-coaching
  private lastMilestoneDistance = 0;
  private lastSpokenTimestamp = 0;

  // Multi-turn conversational memory for smooth, contextual outdoor dialogue
  private conversationHistory: Array<{ role: 'user' | 'assistant'; text: string }> = [];

  constructor() {
    this.initSpeechRecognition();
  }

  public unlockAudio() {
    if (typeof window === 'undefined') return;
    try {
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }
      if ('speechSynthesis' in window) {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      }
      soundEffects.playProcessingChime();
    } catch (_) {}
  }

  public getState(): VoiceAssistantState {
    return { ...this.state };
  }

  public subscribe(listener: (state: VoiceAssistantState) => void): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  public onAction(callback: VoiceAssistantActionCallback): () => void {
    this.actionCallbacks.add(callback);
    return () => this.actionCallbacks.delete(callback);
  }

  private notify() {
    const s = this.getState();
    this.listeners.forEach((l) => l(s));
  }

  private triggerAction(action: string, payload?: any) {
    if (!action || action === 'NONE') return;
    this.actionCallbacks.forEach((cb) => cb(action, payload));
  }

  public updateContext(context: {
    telemetry?: MovementTelemetry;
    mission?: GeneratedMission;
    activeWaypoint?: LocalityWaypoint | null;
    explorerName?: string;
  }) {
    this.latestContext = { ...this.latestContext, ...context };
  }

  public toggleMute() {
    this.state.isMuted = !this.state.isMuted;
    if (this.state.isMuted) {
      this.stopSpeaking();
    }
    this.notify();
  }

  public toggleWakeWord() {
    this.state.isWakeWordEnabled = !this.state.isWakeWordEnabled;
    if (this.state.isWakeWordEnabled) {
      this.startWakeWordStandby();
    } else {
      this.stopListening();
    }
    this.notify();
  }

  public setVoiceId(voiceId: string, voiceName: string = 'Charlie') {
    this.state.activeVoiceId = voiceId;
    this.state.activeVoiceName = voiceName;
    this.notify();
  }

  // ---------------------------------------------------------------------------
  // SPEECH RECOGNITION WITH WAKE-WORD DETECTION & 5-SECOND AUTO TIMEOUT
  // ---------------------------------------------------------------------------
  private initSpeechRecognition() {
    if (typeof window === 'undefined') return;

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      console.warn('[Voice Assistant] Web Speech API not supported in this browser.');
      return;
    }

    try {
      const rec = new SpeechRec();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onstart = () => {
        this.isRecognitionActive = true;
      };

      rec.onresult = (event: any) => {
        const lastResult = event.results[event.results.length - 1];
        if (!lastResult) return;
        const transcript = (lastResult[0]?.transcript || '').trim();
        const isFinal = lastResult.isFinal;

        if (!transcript) return;

        // Check for wake word in speech: "ecoquest", "eco quest", "hey ecoquest"
        const wakeWordRegex = /(?:hey\s+)?(?:eco\s*quest|echo\s*quest|equal\s*quest|aqua\s*quest)\b/i;
        const hasWakeWord = wakeWordRegex.test(transcript);

        if (hasWakeWord && !this.isAwakeListening) {
          // WAKE WORD DETECTED!
          console.log('[Voice Assistant] Wake word "EcoQuest" detected:', transcript);
          this.handleWakeWordTriggered(transcript);
          return;
        }

        // If in active listening mode
        if (this.isAwakeListening) {
          this.latestHeardSpeech = transcript;
          this.state.latestHeardSpeech = transcript;
          this.state.lastUserQuery = transcript;
          this.notify();

          if (this.speechSilenceTimer) clearTimeout(this.speechSilenceTimer);

          if (isFinal) {
            this.commitSpokenSpeech(transcript);
          } else {
            // Debounce pause: commit speech after 800ms of quiet
            this.speechSilenceTimer = setTimeout(() => {
              if (this.isAwakeListening && this.latestHeardSpeech) {
                this.commitSpokenSpeech(this.latestHeardSpeech);
              }
            }, 800);
          }
        }
      };

      rec.onerror = (event: any) => {
        console.warn('[Voice Assistant] Speech recognition error event:', event.error);
        if (event.error === 'no-speech') {
          // Benign error in continuous mode
          return;
        }
        if (event.error === 'not-allowed') {
          this.state.errorMessage = 'Microphone permission blocked. Please enable mic access in your browser bar.';
          this.notify();
        } else if (event.error === 'service-not-allowed' || event.error === 'network') {
          this.state.errorMessage = 'Browser speech recognition unavailable. Use quick voice commands below!';
          this.notify();
        }
      };

      rec.onend = () => {
        this.isRecognitionActive = false;
        // Automatically restart standby listening if wake word is enabled and not speaking
        if (this.state.isWakeWordEnabled && this.state.status !== 'speaking' && !this.isAwakeListening) {
          setTimeout(() => {
            this.restartStandbySafely();
          }, 350);
        }
      };

      this.recognition = rec;

      // Start wake word standby automatically
      if (this.state.isWakeWordEnabled) {
        setTimeout(() => this.startWakeWordStandby(), 600);
      }
    } catch (e) {
      console.warn('[Voice Assistant] Speech recognition init failed:', e);
    }
  }

  private restartStandbySafely() {
    if (!this.recognition || this.isRecognitionActive || this.state.status === 'speaking') return;
    try {
      this.recognition.start();
    } catch (_) {}
  }

  public startWakeWordStandby() {
    if (!this.recognition) return;
    this.isAwakeListening = false;
    this.latestHeardSpeech = '';
    this.state.latestHeardSpeech = '';
    this.state.status = 'idle';
    this.state.silenceSecondsRemaining = 5;
    this.notify();
    this.restartStandbySafely();
  }

  // Called when user says "EcoQuest"
  private handleWakeWordTriggered(rawTranscript: string) {
    // 1. Play the crisp live mic active chime immediately!
    soundEffects.playWakeChime();
    hapticFeedback.radarPulse();

    // 2. Check if a command was already spoken in the same breath
    const wakeWordRegex = /(?:hey\s+)?(?:eco\s*quest|echo\s*quest|equal\s*quest|aqua\s*quest)\b/i;
    const commandPart = rawTranscript.replace(wakeWordRegex, '').trim();

    if (commandPart.length >= 3) {
      // User said: "EcoQuest what should I do?"
      console.log('[Voice Assistant] Direct command in wake breath:', commandPart);
      this.clearSilenceTimer();
      soundEffects.playProcessingChime();
      this.isAwakeListening = false;
      this.interact(commandPart);
      return;
    }

    // 3. User just said "EcoQuest". Turn on active mic listening with 5-second countdown!
    this.activateListeningWithTimeout();
  }

  // Activate active listening (either via "EcoQuest" or mic button tap)
  public activateListeningWithTimeout() {
    this.stopSpeaking();
    this.unlockAudio();
    this.isAwakeListening = true;
    this.latestHeardSpeech = '';
    this.state.latestHeardSpeech = '';
    this.state.status = 'listening';
    this.state.silenceSecondsRemaining = 5;
    this.state.errorMessage = null;
    this.notify();

    // Duck background music immediately so explorer's voice and live mic chime are crystal clear
    ambientAudioService.duckAudioForSpeech(0.12);

    // Play active wake chime & start mic visualizer
    soundEffects.playWakeChime();
    this.startMicAudioCapture();
    this.restartStandbySafely();

    // Start 5-second silence countdown timer
    this.startSilenceCountdown();
  }

  private startSilenceCountdown() {
    this.clearSilenceTimer();
    let secondsLeft = 5;
    this.state.silenceSecondsRemaining = secondsLeft;
    this.notify();

    this.countdownInterval = setInterval(() => {
      secondsLeft -= 1;
      this.state.silenceSecondsRemaining = Math.max(0, secondsLeft);
      this.notify();

      if (secondsLeft <= 0) {
        this.handleSilenceTimeout();
      }
    }, 1000);
  }

  // Commit recognized speech and query the AI Guide Charlie
  private commitSpokenSpeech(rawTranscript: string) {
    if (!rawTranscript || !rawTranscript.trim()) return;
    this.capturedByRecognition = true;
    const textToProcess = rawTranscript.trim();
    this.latestHeardSpeech = '';
    this.state.latestHeardSpeech = '';

    if (this.speechSilenceTimer) {
      clearTimeout(this.speechSilenceTimer);
      this.speechSilenceTimer = null;
    }
    this.clearSilenceTimer();

    // Clean any wake-word repetition from the start
    const wakeWordRegex = /^(?:hey\s+)?(?:eco\s*quest|echo\s*quest|equal\s*quest|aqua\s*quest)[,\s]*/i;
    const cleanedText = textToProcess.replace(wakeWordRegex, '').trim() || textToProcess;

    console.log('[Voice Assistant] Committing recognized speech:', cleanedText);
    soundEffects.playProcessingChime();
    this.isAwakeListening = false;
    this.stopMicAudioCapture();

    // Send query to guide Charlie
    this.interact(cleanedText);
  }

  private handleSilenceTimeout() {
    // If the user already spoke words while listening, commit them rather than discarding!
    if (this.latestHeardSpeech && this.latestHeardSpeech.trim().length > 1) {
      console.log('[Voice Assistant] Silence timeout elapsed with recognized speech. Committing:', this.latestHeardSpeech);
      this.commitSpokenSpeech(this.latestHeardSpeech);
      return;
    }

    console.log('[Voice Assistant] 5s timeout elapsed with no command. Deactivating mic.');
    this.clearSilenceTimer();
    this.isAwakeListening = false;
    this.stopMicAudioCapture();

    // Play gentle sleep chime
    soundEffects.playSleepChime();

    // Restore background music since active listening concluded without speech
    ambientAudioService.restoreAudioAfterSpeech();

    this.state.status = 'idle';
    this.state.silenceSecondsRemaining = 5;
    this.notify();

    // Return to standby wake-word listening
    this.restartStandbySafely();
  }

  private clearSilenceTimer() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
  }

  public toggleListening(context?: any) {
    if (context) this.updateContext(context);
    this.unlockAudio();

    if (this.state.status === 'listening') {
      // User tapped button while listening:
      // If user has spoken words, commit them immediately!
      if (this.latestHeardSpeech && this.latestHeardSpeech.trim().length > 1) {
        this.commitSpokenSpeech(this.latestHeardSpeech);
      } else {
        // User tapped to cancel / silence
        this.handleSilenceTimeout();
      }
    } else {
      // User tapped to speak
      this.activateListeningWithTimeout();
    }
  }

  public stopListening() {
    this.clearSilenceTimer();
    this.isAwakeListening = false;
    this.stopMicAudioCapture();
    if (this.recognition && this.isRecognitionActive) {
      try {
        this.recognition.stop();
      } catch (_) {}
    }
    this.state.status = 'idle';
    this.notify();
  }

  // ---------------------------------------------------------------------------
  // AI INTERACTION (ChatGPT / Gemini Brain + Action Hooks)
  // Background processing: No giant transcript or thought boxes needed!
  // ---------------------------------------------------------------------------
  public async interact(
    query: string,
    contextOverride?: {
      telemetry?: MovementTelemetry;
      mission?: GeneratedMission;
      activeWaypoint?: LocalityWaypoint | null;
      explorerName?: string;
    }
  ): Promise<string> {
    if (!query.trim()) return '';

    const ctx = { ...this.latestContext, ...contextOverride };
    this.stopSpeaking();
    this.clearSilenceTimer();

    this.state.status = 'thinking';
    this.state.lastUserQuery = query.trim();
    this.state.errorMessage = null;
    this.notify();

    try {
      const response = await fetch('/api/voice-guide/interact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query.trim(),
          guideVoiceId: this.state.activeVoiceId,
          guideName: this.state.activeVoiceName,
          guideRole: 'Lead Tactical Scout & AI Companion',
          telemetry: ctx.telemetry || {},
          mission: ctx.mission || {},
          activeWaypoint: ctx.activeWaypoint || null,
          history: this.conversationHistory.slice(-6),
        }),
      });

      const data = await response.json();
      const thought = data.thought || 'Guiding explorer with clear outdoor direction.';
      const spokenText = data.spokenText || data.response || "Copy that! Check your map and let's keep moving!";
      const action = data.action || 'NONE';

      this.state.lastThought = thought;
      this.state.lastSpokenText = spokenText;

      // Append to conversational memory for smooth continuous dialogue
      this.conversationHistory.push({ role: 'user', text: query.trim() });
      this.conversationHistory.push({ role: 'assistant', text: spokenText });
      if (this.conversationHistory.length > 12) {
        this.conversationHistory = this.conversationHistory.slice(-12);
      }

      // Trigger map/game actions in background
      if (action && action !== 'NONE') {
        this.triggerAction(action, { query, context: ctx });
      }

      // Speak answer through earphones/audio
      if (!this.state.isMuted) {
        await this.speak(spokenText);
      } else {
        this.state.status = 'idle';
        this.notify();
        this.startWakeWordStandby();
      }

      return spokenText;
    } catch (err: any) {
      console.warn('[Voice Assistant] Interaction error:', err);
      const fallbackText = "I'm with you! Keep an eye on your trail and let's find the next craft item.";
      this.state.lastThought = 'Graceful conversational fallback.';
      this.state.lastSpokenText = fallbackText;
      if (!this.state.isMuted) {
        await this.speak(fallbackText);
      } else {
        this.state.status = 'idle';
        this.notify();
        this.startWakeWordStandby();
      }
      return fallbackText;
    }
  }

  // ---------------------------------------------------------------------------
  // SPEECH SYNTHESIS (ELEVENLABS TTS -> ULTRA-NATURAL BROWSER SYNTHESIS)
  // Ensures natural human cadence, zero robotic drone!
  // ---------------------------------------------------------------------------
  public async speak(text: string): Promise<void> {
    if (!text.trim() || this.state.isMuted) return;

    this.stopSpeaking();
    this.state.status = 'speaking';
    this.state.lastSpokenText = text.trim();
    this.lastSpokenTimestamp = Date.now();
    this.notify();

    // Duck background music immediately for speech playback
    ambientAudioService.duckAudioForSpeech(0.1);

    try {
      const response = await fetch('/api/voice-guide/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.trim(),
          voiceId: this.state.activeVoiceId,
          voiceName: this.state.activeVoiceName,
        }),
      });

      const contentType = response.headers.get('content-type') || '';
      const sourceHeader = response.headers.get('x-voice-source') || 'elevenlabs';
      this.state.audioSourceUsed = sourceHeader;

      if (response.ok && (contentType.includes('audio') || contentType.includes('application/octet-stream'))) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        await this.playAudioUrl(audioUrl);
        return;
      }

      // Fallback to high-definition human browser speech
      await this.speakWithNaturalBrowserSynth(text);
    } catch (err: any) {
      console.warn('[Voice Assistant] Speech fetch error, falling back to natural speech:', err);
      await this.speakWithNaturalBrowserSynth(text);
    }
  }

  private playAudioUrl(url: string): Promise<void> {
    return new Promise((resolve) => {
      try {
        const audio = new Audio(url);
        this.currentAudio = audio;

        // Visualizer wave loop
        this.startOutputVisualizerLoop();

        const handleAudioDone = () => {
          this.stopOutputVisualizerLoop();
          URL.revokeObjectURL(url);
          this.currentAudio = null;
          this.state.status = 'idle';
          this.state.outputAudioLevel = 0;
          this.notify();

          // Restore background music smoothly after speech finishes
          ambientAudioService.restoreAudioAfterSpeech();

          this.startWakeWordStandby();
          resolve();
        };

        audio.onended = handleAudioDone;
        audio.onerror = handleAudioDone;

        audio.play().catch(() => {
          this.stopOutputVisualizerLoop();
          URL.revokeObjectURL(url);
          this.currentAudio = null;
          this.speakWithNaturalBrowserSynth(this.state.lastSpokenText).then(resolve);
        });
      } catch (_) {
        this.speakWithNaturalBrowserSynth(this.state.lastSpokenText).then(resolve);
      }
    });
  }

  // Ultra-natural human speech synthesis engine
  // Carefully picks top-grade Natural/Neural voices to avoid robotic tones
  private speakWithNaturalBrowserSynth(text: string): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        this.state.status = 'idle';
        this.notify();
        this.startWakeWordStandby();
        resolve();
        return;
      }

      try {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
        window.speechSynthesis.cancel();

        // Clean text of symbols/markdown for warm human delivery
        const cleanSpoken = text
          .replace(/[*_#`~[\]()]/g, '')
          .replace(/\s+/g, ' ')
          .trim();

        const utterance = new SpeechSynthesisUtterance(cleanSpoken);
        utterance.rate = 1.0; // Natural conversational tempo
        utterance.pitch = 1.0; // Natural pitch
        utterance.volume = 1.0;

        const voices = window.speechSynthesis.getVoices();

        // 1. Natural / Neural online voices (Edge & Chrome Natural voices)
        const naturalVoice = voices.find(
          (v) =>
            v.lang.startsWith('en') &&
            (v.name.includes('Natural') || v.name.includes('Online'))
        );

        // 2. Google High Quality US/UK voices
        const googleVoice = voices.find(
          (v) =>
            (v.name.includes('Google US English') ||
              v.name.includes('Google UK English') ||
              v.name.includes('Google')) &&
            v.lang.startsWith('en')
        );

        // 3. Apple Siri / Samantha / Daniel / Karen voices
        const appleVoice = voices.find(
          (v) =>
            (v.name.includes('Siri') ||
              v.name.includes('Samantha') ||
              v.name.includes('Daniel') ||
              v.name.includes('Karen') ||
              v.name.includes('Oliver')) &&
            v.lang.startsWith('en')
        );

        const chosenVoice = naturalVoice || googleVoice || appleVoice || voices.find((v) => v.lang.startsWith('en'));
        if (chosenVoice) {
          utterance.voice = chosenVoice;
        }

        this.state.audioSourceUsed = 'browser-speech';

        // Pulse for waveform while browser speaking
        let synthPulseInterval: any = setInterval(() => {
          this.state.outputAudioLevel = Math.floor(35 + Math.random() * 55);
          this.notify();
        }, 120);

        let finished = false;
        const cleanup = () => {
          if (finished) return;
          finished = true;
          clearInterval(synthPulseInterval);
          clearTimeout(safetyTimeout);
          this.state.outputAudioLevel = 0;
          this.state.status = 'idle';
          this.notify();
          ambientAudioService.restoreAudioAfterSpeech();
          this.startWakeWordStandby();
          resolve();
        };

        const safetyTimeout = setTimeout(cleanup, Math.max(3500, cleanSpoken.length * 85));

        utterance.onstart = () => {
          this.state.status = 'speaking';
          this.notify();
        };

        utterance.onend = cleanup;
        utterance.onerror = cleanup;

        window.speechSynthesis.speak(utterance);
      } catch (_) {
        this.state.status = 'idle';
        this.notify();
        ambientAudioService.restoreAudioAfterSpeech();
        this.startWakeWordStandby();
        resolve();
      }
    });
  }

  public stopSpeaking() {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch (_) {}
      this.currentAudio = null;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (_) {}
    }

    this.stopOutputVisualizerLoop();
    this.state.outputAudioLevel = 0;
    if (this.state.status === 'speaking') {
      this.state.status = 'idle';
    }
    ambientAudioService.restoreAudioAfterSpeech();
    this.notify();
  }

  public replayLastMessage() {
    if (this.state.lastSpokenText) {
      this.speak(this.state.lastSpokenText);
    }
  }

  // ---------------------------------------------------------------------------
  // VISUALIZERS (MIC & VOICE WAVEFORMS) & MEDIA RECORDER AUDIO CAPTURE
  // ---------------------------------------------------------------------------
  private async startMicAudioCapture() {
    this.capturedByRecognition = false;
    this.audioChunks = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      this.micStream = stream;

      // Start MediaRecorder in parallel for 100% reliable cross-browser audio capture
      if (typeof MediaRecorder !== 'undefined') {
        try {
          const mime = MediaRecorder.isTypeSupported('audio/webm')
            ? 'audio/webm'
            : MediaRecorder.isTypeSupported('audio/mp4')
            ? 'audio/mp4'
            : '';
          const recorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
          this.audioChunks = [];
          recorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) {
              this.audioChunks.push(e.data);
            }
          };
          recorder.start(150);
          this.mediaRecorder = recorder;
        } catch (mErr) {
          console.warn('[Voice Assistant] MediaRecorder initialization:', mErr);
        }
      }

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        this.micAudioCtx = ctx;
        const src = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        src.connect(analyser);
        this.micAnalyser = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const loop = () => {
          if (!this.micAnalyser) return;
          this.micAnalyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
          const avg = sum / dataArray.length;
          this.state.inputAudioLevel = Math.min(100, Math.round(avg * 1.8));
          this.notify();
          this.micAnimFrameId = requestAnimationFrame(loop);
        };
        loop();
      }
    } catch (err: any) {
      console.warn('[Voice Assistant] Microphone access error:', err);
      this.state.errorMessage = 'Mic permission needed for live voice.';
      this.notify();
    }
  }

  private stopMicAudioCapture() {
    if (this.micAnimFrameId) {
      cancelAnimationFrame(this.micAnimFrameId);
      this.micAnimFrameId = null;
    }

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        const recorder = this.mediaRecorder;
        const recorderMime = recorder.mimeType || 'audio/webm';
        recorder.onstop = () => {
          if (!this.capturedByRecognition && this.audioChunks.length > 0) {
            const audioBlobToTranscribe = new Blob(this.audioChunks, { type: recorderMime });
            if (audioBlobToTranscribe.size > 1200) {
              console.log('[Voice Assistant] Dispatching audio to Groq Whisper STT (size:', audioBlobToTranscribe.size, 'bytes)');
              this.transcribeRecordedAudio(audioBlobToTranscribe);
            }
          }
        };
        recorder.stop();
      } catch (_) {}
      this.mediaRecorder = null;
    }

    if (this.micStream) {
      this.micStream.getTracks().forEach((t) => t.stop());
      this.micStream = null;
    }
    if (this.micAudioCtx && this.micAudioCtx.state !== 'closed') {
      try {
        this.micAudioCtx.close();
      } catch (_) {}
      this.micAudioCtx = null;
    }
    this.micAnalyser = null;
    this.state.inputAudioLevel = 0;
  }

  private async transcribeRecordedAudio(blob: Blob) {
    try {
      this.state.status = 'thinking';
      this.state.lastThought = 'Transcribing recorded voice command...';
      this.notify();
      soundEffects.playProcessingChime();

      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        try {
          const res = await fetch('/api/voice-guide/transcribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              audioBase64: base64Audio,
              mimeType: blob.type || 'audio/webm',
            }),
          });
          const data = await res.json();
          const transcript = (data.transcript || '').trim();
          if (transcript.length >= 2) {
            console.log('[Voice Assistant] MediaRecorder transcribed:', transcript);
            this.interact(transcript);
          } else {
            console.log('[Voice Assistant] No speech detected in recorded audio.');
            this.state.status = 'idle';
            this.notify();
            this.startWakeWordStandby();
          }
        } catch (err) {
          console.warn('[Voice Assistant] Transcribe error:', err);
          this.state.status = 'idle';
          this.notify();
          this.startWakeWordStandby();
        }
      };
      reader.readAsDataURL(blob);
    } catch (e) {
      console.warn('[Voice Assistant] Error reading audio blob:', e);
      this.state.status = 'idle';
      this.notify();
    }
  }

  private startOutputVisualizerLoop() {
    // Generate pulse loop
    const loop = () => {
      if (this.state.status !== 'speaking') return;
      this.state.outputAudioLevel = Math.floor(40 + Math.random() * 55);
      this.notify();
      this.animFrameId = requestAnimationFrame(loop);
    };
    loop();
  }

  private stopOutputVisualizerLoop() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    this.state.outputAudioLevel = 0;
  }

  // ---------------------------------------------------------------------------
  // PROACTIVE COACHING
  // ---------------------------------------------------------------------------
  public announceExpeditionStart(mission: GeneratedMission, explorerName: string = 'Explorer') {
    const text = `Hey ${explorerName}! I'm Charlie, your field guide. Today we're tracking items for ${mission.title}. Start walking along your path, and say "EcoQuest" whenever you need guidance!`;
    this.state.lastThought = `Expedition briefing for ${mission.title}.`;
    this.state.lastSpokenText = text;
    this.notify();
    this.speak(text);
  }

  public announceCraftVerified(craftName: string, xp: number) {
    const text = `Outstanding work! The ${craftName} has been verified and added to your Codex. You earned ${xp} XP!`;
    this.state.lastThought = 'Celebrating verified craft.';
    this.state.lastSpokenText = text;
    this.notify();
    this.speak(text);
  }

  public onMovementTelemetry(telemetry: MovementTelemetry, mission: GeneratedMission) {
    this.updateContext({ telemetry, mission });
    if (!this.state.isAutoLeadEnabled || this.state.isMuted) return;
    const now = Date.now();
    if (now - this.lastSpokenTimestamp < 50000) return;

    const distance = telemetry.distanceCoveredMeters || 0;
    if (distance >= 60 && this.lastMilestoneDistance < 60) {
      this.lastMilestoneDistance = 60;
      this.interact('I have walked 60 meters forward');
    }
  }
}

export const voiceAssistantService = new VoiceAssistantService();
