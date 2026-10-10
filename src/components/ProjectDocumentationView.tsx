import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Download,
  Copy,
  Check,
  Cpu,
  Layers,
  Sparkles,
  Server,
  Radio,
  Compass,
  ArrowRight,
  Shield,
  Smartphone,
  ExternalLink,
} from 'lucide-react';
import { hapticFeedback } from '../utils/haptics';

export const ProjectDocumentationView: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handlePrintPdf = () => {
    hapticFeedback.tactileClick();
    window.print();
  };

  const handleDownloadDoc = () => {
    hapticFeedback.buttonPress();
    const docTitle = 'EchoQuest_AI_Complete_Project_Documentation.doc';

    const docContent = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>EchoQuest AI - Full Project Documentation</title>
  <style>
    body { font-family: 'Segoe UI', Calibri, Arial, sans-serif; font-size: 11pt; line-height: 1.6; color: #1e293b; margin: 40pt; }
    h1 { font-size: 24pt; color: #047857; border-bottom: 2pt solid #047857; padding-bottom: 8pt; margin-bottom: 14pt; }
    h2 { font-size: 16pt; color: #0f172a; border-bottom: 1pt solid #cbd5e1; padding-bottom: 4pt; margin-top: 24pt; }
    h3 { font-size: 13pt; color: #334155; margin-top: 16pt; }
    p, li { font-size: 11pt; }
    table { border-collapse: collapse; width: 100%; margin: 14pt 0; font-size: 10pt; }
    th, td { border: 1pt solid #cbd5e1; padding: 6pt 10pt; text-align: left; }
    th { background-color: #f1f5f9; font-weight: bold; color: #0f172a; }
    tr:nth-child(even) { background-color: #f8fafc; }
    code { font-family: Consolas, 'Courier New', monospace; font-size: 9.5pt; background-color: #f1f5f9; padding: 2pt 4pt; border-radius: 3pt; color: #047857; }
    pre { background-color: #0f172a; color: #f8fafc; padding: 12pt; border-radius: 6pt; font-family: Consolas, monospace; font-size: 9.5pt; line-height: 1.4; overflow-x: auto; }
    .badge { display: inline-block; background-color: #ecfdf5; color: #047857; border: 1pt solid #a7f3d0; padding: 2pt 6pt; border-radius: 4pt; font-weight: bold; font-size: 9pt; }
    .box { background-color: #f8fafc; border-left: 4pt solid #047857; padding: 10pt; margin: 12pt 0; }
  </style>
</head>
<body>
  <h1>EchoQuest AI: Complete Project Documentation</h1>
  <p><strong>System Classification:</strong> Bio-Acoustic Expedition Engine & Multimodal AI Field Companion<br>
  <strong>Runtime:</strong> React 19 + TypeScript + Express + Three.js + Google Maps Platform + Google Gemini API<br>
  <strong>Date:</strong> October 2026 | Production Build v3.4.0</p>

  <div class="box">
    <strong>Executive Summary:</strong> EchoQuest AI is a voice-first outdoor exploration and nature gamification platform that gets explorers outside to touch grass. It integrates authentic 3D WebGL human locomotion, tactical Google Maps GPS radar, AMOLED hands-free Phone Mode, physical earth craft generation, and multimodal AI companion guidance powered by Google Gemini (gemini-3.8-flash, gemini-3.5-transcribe, gemini-3.8-live).
  </div>

  <h2>1. Artificial Intelligence & LLM Model Architecture</h2>
  <table>
    <thead>
      <tr>
        <th>Subsystem</th>
        <th>Model Name</th>
        <th>API / Transport</th>
        <th>Functional Role</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>AI Voice Guide (Charlie)</strong></td>
        <td><code>gemini-3.8-flash</code></td>
        <td>POST /api/voice-guide/interact</td>
        <td>Evaluates spoken voice, movement telemetry, and biome to generate real-time thoughts, natural spoken instructions, and dispatch game actions.</td>
      </tr>
      <tr>
        <td><strong>Mission Generator</strong></td>
        <td><code>gemini-3.8-flash</code></td>
        <td>POST /api/missions/generate</td>
        <td>Procedural generation of tactile nature scavenger quests, soil craft instructions, and landmark targets.</td>
      </tr>
      <tr>
        <td><strong>Speech-to-Text Transcriber</strong></td>
        <td><code>gemini-3.5-transcribe</code> / <code>gemini-3.8-flash</code></td>
        <td>POST /api/voice-guide/transcribe</td>
        <td>Converts MediaRecorder microphone audio blobs into text with cross-browser and iframe compatibility.</td>
      </tr>
      <tr>
        <td><strong>Craft Vision Verification</strong></td>
        <td><code>gemini-3.8-flash</code> (Multimodal)</td>
        <td>POST /api/missions/verify-craft</td>
        <td>Inspects camera photos of physical ground crafts (leaves, twigs, pebbles) and validates organic materials.</td>
      </tr>
      <tr>
        <td><strong>Daily Sensory Challenges</strong></td>
        <td><code>gemini-3.8-flash</code></td>
        <td>POST /api/missions/daily-challenges</td>
        <td>Generates randomized sensory challenges for flora, fauna, and tactile outdoor interactions.</td>
      </tr>
      <tr>
        <td><strong>Google Maps Nature Grounding</strong></td>
        <td><code>gemini-3.5-flash</code> + Maps Tool</td>
        <td>POST /api/nature/maps-grounding</td>
        <td>Discovers real nearby outdoor parks and botanical reserves grounded in Google Maps data.</td>
      </tr>
      <tr>
        <td><strong>Low-Latency Audio Streaming</strong></td>
        <td><code>gemini-3.8-live</code></td>
        <td>WebSocket /api/live</td>
        <td>Bidirectional 16kHz PCM audio streaming session.</td>
      </tr>
    </tbody>
  </table>

  <h2>2. Core Technical Architecture</h2>
  <h3>2.1 Frontend Architecture</h3>
  <ul>
    <li><strong>React 19 & TypeScript:</strong> Modular component structure with functional state hooks and strict typing.</li>
    <li><strong>Tailwind CSS v4:</strong> Editorial utility-first styling with high-contrast tactile OLED palette.</li>
    <li><strong>Three.js (r186):</strong> Procedural WebGL renderer hosting authentic 3D human avatar and procedural terrain canvas.</li>
    <li><strong>Google Maps Platform:</strong> High-accuracy GPS location tracking, waypoint bearings, and satellite radar sweep.</li>
    <li><strong>Web Audio API Engine:</strong> Dynamic soundscape mixer, Web Audio wake chimes, and automatic music ducking (85% reduction during speech).</li>
  </ul>

  <h3>2.2 Backend & Gateway Architecture</h3>
  <ul>
    <li><strong>Express 4.21 Server:</strong> Hosts API proxy routes, security boundaries, and the Vite dev middleware.</li>
    <li><strong>Unified Voice Engine:</strong> ElevenLabs Turbo v2.5 voice synthesis with Gemini Neural Speech and Web Speech fallback.</li>
    <li><strong>WebSocket Gateway:</strong> Manages real-time audio sessions for low-latency live voice exploration.</li>
  </ul>

  <h2>3. Key Modules & User Flows</h2>
  <h3>3.1 Hands-Free Phone Mode (Pocket Mode)</h3>
  <p>Enables safe outdoor trekking with phones placed in pockets. Explorers hear spoken audio prompts through earphones, with full blind-touch target buttons, tactile haptics, and battery-saving OLED black presentation.</p>

  <h3>3.2 2nd Page Mission Deck & Locomotion</h3>
  <p>Features 3D human explorer avatar locomotion synchronized with real GPS movement telemetry, a full Google Maps tactical radar, and the primary "START MISSION · OPEN PHONE MODE" actuator.</p>

  <h3>3.3 Scavenger Crafting & Field Codex</h3>
  <p>Explorers gather natural loose items (fallen leaves, twigs, river pebbles) to assemble temporary artistic earth crafts on the soil, logging discoveries into an illustrated Field Sticker Codex.</p>

  <h2>4. Production Deployment & Configuration</h2>
  <pre>
# Required Environment Variables
GEMINI_API_KEY="your-google-gemini-key"
VITE_GOOGLE_MAPS_API_KEY="your-google-maps-key"
ELEVENLABS_API_KEY="optional-elevenlabs-key"
PORT=3000

# Install & Build Commands
npm install
npm run build
npm run dev
  </pre>

  <p><em>Documentation certified for EchoQuest AI — Version 3.4.0</em></p>
</body>
</html>`;

    const blob = new Blob(['\ufeff' + docContent], {
      type: 'application/msword;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = docTitle;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadMarkdown = () => {
    hapticFeedback.buttonPress();
    const docTitle = 'EchoQuest_AI_Documentation.md';
    const link = document.createElement('a');
    link.href = '/DOCUMENTATION.md';
    link.download = docTitle;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyMarkdown = () => {
    hapticFeedback.tactileClick();
    const rawMarkdown = `# EchoQuest AI: Comprehensive Project Documentation
Bio-Acoustic Outdoor Expedition Engine & Multimodal AI Field Companion
... Download full markdown file or click Print to PDF for complete document.`;
    navigator.clipboard.writeText(rawMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* =========================================================================
          PRINT & EXPORT ACTION DOCK (Hidden during PDF print)
          ========================================================================= */}
      <div className="print:hidden p-4 sm:p-5 rounded-3xl bg-stone-100/95 border border-stone-300 shadow-[0_4px_0_0_#d6d3d1] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-stone-900 text-emerald-400 flex items-center justify-center font-bold text-lg shadow-sm">
            <FileText className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase text-emerald-800 tracking-wider">
              PROJECT SPECIFICATION & ARCHITECTURE
            </span>
            <h2 className="text-lg sm:text-xl font-display font-extrabold text-stone-900">
              EchoQuest AI Documentation (PDF & DOC)
            </h2>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Print / Save to PDF Button */}
          <button
            onClick={handlePrintPdf}
            className="py-2.5 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-700 active:bg-emerald-900 text-stone-50 font-mono text-xs font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer border border-emerald-600"
            title="Open browser print preview to save as PDF"
          >
            <Printer className="w-4 h-4 text-emerald-300" />
            <span>EXPORT / PRINT PDF</span>
          </button>

          {/* Download DOC (.doc) Button */}
          <button
            onClick={handleDownloadDoc}
            className="py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-50 font-mono text-xs font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer border border-stone-700"
            title="Download Word Document (.doc format)"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>DOWNLOAD DOC (.DOC)</span>
          </button>

          {/* Download Raw Markdown Button */}
          <button
            onClick={handleDownloadMarkdown}
            className="py-2.5 px-3 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-mono text-xs font-bold border border-stone-300 shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Download raw Markdown documentation"
          >
            <FileText className="w-3.5 h-3.5 text-stone-600" />
            <span className="hidden sm:inline">.MD</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          PRINTABLE DOCUMENT SHEET (Formatted for clean multi-page PDF output)
          ========================================================================= */}
      <article
        id="printable-documentation"
        className="p-6 sm:p-10 lg:p-12 rounded-3xl bg-white border border-stone-300/80 shadow-md print:shadow-none print:border-none print:p-0 space-y-8 text-stone-900"
      >
        {/* Document Header */}
        <header className="border-b-2 border-emerald-800 pb-6 space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-800 uppercase tracking-widest">
            <span>SPECIFICATION DOCUMENT</span>
            <span>·</span>
            <span>VERSION 3.4.0</span>
            <span>·</span>
            <span>OCTOBER 2026</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-display font-extrabold tracking-tight text-stone-950">
            EchoQuest AI: Complete Project Documentation
          </h1>

          <p className="text-sm sm:text-base font-mono text-stone-600">
            Bio-Acoustic Expedition Engine & Multimodal AI Field Companion
          </p>

          <div className="pt-2 flex flex-wrap gap-2 text-xs font-mono">
            <span className="px-2.5 py-1 rounded-md bg-stone-100 text-stone-800 border border-stone-200 font-bold">
              Framework: React 19 + TypeScript
            </span>
            <span className="px-2.5 py-1 rounded-md bg-stone-100 text-stone-800 border border-stone-200 font-bold">
              Backend: Express + Node.js
            </span>
            <span className="px-2.5 py-1 rounded-md bg-stone-100 text-stone-800 border border-stone-200 font-bold">
              3D Engine: Three.js WebGL
            </span>
            <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
              LLMs: Google Gemini API (@google/genai)
            </span>
          </div>
        </header>

        {/* Section 1: Executive Summary */}
        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-display font-extrabold text-stone-900 border-b border-stone-200 pb-2 flex items-center gap-2">
            <span>1. Executive Summary</span>
          </h2>
          <p className="text-sm font-mono text-stone-700 leading-relaxed">
            <strong>EchoQuest AI</strong> is an innovative, voice-first outdoor nature gamification platform engineered
            to get people outdoors and actively interact with real environments ("touching grass"). By combining real-time
            GPS telemetry tracking, authentic 3D WebGL human locomotion, tactical Google Maps radar navigation, hands-free
            Phone Mode, and multimodal generative AI, EchoQuest transforms physical nature walks into tactile storytelling quests.
          </p>
          <div className="p-4 rounded-2xl bg-stone-100 border border-stone-200 text-xs font-mono text-stone-800 space-y-1.5">
            <div className="font-bold text-emerald-800">Core Gameplay Loop:</div>
            <div>1. Explorer selects an outdoor quest or generates a tailored expedition via Gemini.</div>
            <div>2. Explorer taps <strong>"START MISSION (PHONE MODE)"</strong>, keeps phone in pocket, and wears earphones.</div>
            <div>3. Lead AI Naturalist Charlie guides walking pace, landmark bearing, and sensory observations in real time.</div>
            <div>4. Explorer gathers natural items (leaves, twigs, pebbles), crafts an earth sculpture on the soil, and takes a photo for AI vision verification and Field Codex stickers.</div>
          </div>
        </section>

        {/* Section 2: AI & LLM Model Integration Table */}
        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-display font-extrabold text-stone-900 border-b border-stone-200 pb-2">
            2. Artificial Intelligence & LLM Model Specifications
          </h2>
          <p className="text-xs font-mono text-stone-600">
            The application interfaces with the Google GenAI SDK (<code>@google/genai</code>) using specialized models tailored for distinct tasks:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="bg-stone-100 border-b border-stone-300 text-stone-900">
                  <th className="p-2.5 font-bold">Subsystem</th>
                  <th className="p-2.5 font-bold">Model Name</th>
                  <th className="p-2.5 font-bold">API Route</th>
                  <th className="p-2.5 font-bold">Function & Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                <tr>
                  <td className="p-2.5 font-bold text-stone-900">Lead AI Guide (Charlie)</td>
                  <td className="p-2.5 text-emerald-800 font-bold"><code>gemini-3.8-flash</code></td>
                  <td className="p-2.5 text-stone-600">POST /api/voice-guide/interact</td>
                  <td className="p-2.5 text-stone-700">Autonomous reasoning on GPS telemetry, movement state, and voice commands. Speaks concise natural replies and dispatches game actions.</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-stone-900">Mission Generator</td>
                  <td className="p-2.5 text-emerald-800 font-bold"><code>gemini-3.8-flash</code></td>
                  <td className="p-2.5 text-stone-600">POST /api/missions/generate</td>
                  <td className="p-2.5 text-stone-700">Procedural scavenger mission generation with soil craft recipes, landmark bearings, and mythic lore stickers.</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-stone-900">Speech-to-Text Transcriber</td>
                  <td className="p-2.5 text-emerald-800 font-bold"><code>gemini-3.5-transcribe</code></td>
                  <td className="p-2.5 text-stone-600">POST /api/voice-guide/transcribe</td>
                  <td className="p-2.5 text-stone-700">Converts client MediaRecorder microphone audio blobs to text with cross-platform and iframe reliability.</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-stone-900">Craft Vision Judge</td>
                  <td className="p-2.5 text-emerald-800 font-bold"><code>gemini-3.8-flash</code> (Vision)</td>
                  <td className="p-2.5 text-stone-600">POST /api/missions/verify-craft</td>
                  <td className="p-2.5 text-stone-700">Multimodal image analysis of physical ground crafts (leaves, twigs, pebbles) for codex verification and XP awards.</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-stone-900">Daily Sensory Challenges</td>
                  <td className="p-2.5 text-emerald-800 font-bold"><code>gemini-3.8-flash</code></td>
                  <td className="p-2.5 text-stone-600">POST /api/missions/daily-challenges</td>
                  <td className="p-2.5 text-stone-700">Generates randomized sensory challenges for flora, fauna, and tactile outdoor interactions.</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-stone-900">Maps Nature Grounding</td>
                  <td className="p-2.5 text-emerald-800 font-bold"><code>gemini-3.5-flash</code></td>
                  <td className="p-2.5 text-stone-600">POST /api/nature/maps-grounding</td>
                  <td className="p-2.5 text-stone-700">Finds real nearby parks and nature trails grounded with Google Maps Platform place data.</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-stone-900">Live Audio Stream</td>
                  <td className="p-2.5 text-emerald-800 font-bold"><code>gemini-3.8-live</code></td>
                  <td className="p-2.5 text-stone-600">WebSocket /api/live</td>
                  <td className="p-2.5 text-stone-700">Low-latency streaming bidirectional 16kHz audio session.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 3: Key Features & Architecture Breakdown */}
        <section className="space-y-4">
          <h2 className="text-lg sm:text-xl font-display font-extrabold text-stone-900 border-b border-stone-200 pb-2">
            3. Core Functional Modules
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-4 rounded-2xl bg-stone-100 border border-stone-200 space-y-1.5">
              <div className="font-bold text-stone-950 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-emerald-700" />
                <span>Hands-Free Phone Mode (Pocket Mode)</span>
              </div>
              <p className="text-stone-600 leading-relaxed">
                AMOLED pitch-black energy conservation HUD (`#08080a`) for hands-free trail walks. Includes blind touch targets,
                audio visualizer wavebars, one-tap voice command chips, and automatic background music ducking (85% gain reduction during voice prompts).
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-100 border border-stone-200 space-y-1.5">
              <div className="font-bold text-stone-950 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-emerald-700" />
                <span>Tactical Google Maps & 3D Locomotion</span>
              </div>
              <p className="text-stone-600 leading-relaxed">
                Dual deck combining real-time Three.js 3D human locomotion synced with GPS movement telemetry and a tactical
                Google Maps radar showing Great-Circle azimuth bearings to the target landmark.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-100 border border-stone-200 space-y-1.5">
              <div className="font-bold text-stone-950 flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-emerald-700" />
                <span>Speech Synthesis & Recognition Engine</span>
              </div>
              <p className="text-stone-600 leading-relaxed">
                Dual-path speech input: Web Speech API paired with automatic MediaRecorder fallback to Gemini audio transcription.
                Voice output negotiates ElevenLabs Turbo v2.5, Gemini Neural TTS (`gemini-3.8-flash-lite-tts`), and Neural browser synthesis.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-100 border border-stone-200 space-y-1.5">
              <div className="font-bold text-stone-950 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-700" />
                <span>Field Sticker Codex & Scavenger Crafts</span>
              </div>
              <p className="text-stone-600 leading-relaxed">
                Catalog of mythic nature guardians crafted from physical organic loose parts. Camera snapshots are evaluated
                by Gemini Multimodal Vision, awarding Stage XP and permanent encyclopedia entries.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: Backend API Endpoints */}
        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-display font-extrabold text-stone-900 border-b border-stone-200 pb-2">
            4. REST API Endpoint Reference
          </h2>

          <div className="space-y-3 text-xs font-mono">
            <div className="p-3.5 rounded-xl bg-stone-900 text-stone-100 space-y-2">
              <div className="flex items-center justify-between text-emerald-400 font-bold">
                <span>POST /api/voice-guide/interact</span>
                <span className="text-stone-400">Gemini 3.8 Flash Brain</span>
              </div>
              <p className="text-stone-300">
                Accepts user spoken query, movement telemetry, mission context, and history. Returns reasoning thought, clean spokenText, and game action trigger.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-900 text-stone-100 space-y-2">
              <div className="flex items-center justify-between text-emerald-400 font-bold">
                <span>POST /api/voice-guide/transcribe</span>
                <span className="text-stone-400">Gemini 3.5 Transcribe</span>
              </div>
              <p className="text-stone-300">
                Receives base64-encoded audio/webm or audio/mp4 chunk from client MediaRecorder and returns verbatim English transcript.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-900 text-stone-100 space-y-2">
              <div className="flex items-center justify-between text-emerald-400 font-bold">
                <span>POST /api/missions/generate</span>
                <span className="text-stone-400">Gemini 3.8 Flash Quest Master</span>
              </div>
              <p className="text-stone-300">
                Generates a creative outdoor mission with scavenger items, ground craft instructions, landmark distance, and sticker reward.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-900 text-stone-100 space-y-2">
              <div className="flex items-center justify-between text-emerald-400 font-bold">
                <span>POST /api/missions/verify-craft</span>
                <span className="text-stone-400">Gemini Multimodal Vision</span>
              </div>
              <p className="text-stone-300">
                Evaluates camera photo of physical nature craft (leaves, twigs, pebbles) and validates completion with bonus XP.
              </p>
            </div>
          </div>
        </section>

        {/* Section 5: Setup & Configuration */}
        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-display font-extrabold text-stone-900 border-b border-stone-200 pb-2">
            5. Environment Configuration & Deployment
          </h2>
          <div className="p-4 rounded-2xl bg-stone-100 border border-stone-200 text-xs font-mono space-y-2">
            <div className="font-bold text-stone-900">Environment Variables (.env):</div>
            <pre className="bg-stone-900 text-stone-100 p-3 rounded-xl overflow-x-auto">
{`GEMINI_API_KEY="your-google-gemini-key"
VITE_GOOGLE_MAPS_API_KEY="your-google-maps-api-key"
ELEVENLABS_API_KEY="optional-elevenlabs-api-key"
PORT=3000`}
            </pre>
            <div className="pt-2 font-bold text-stone-900">Build & Start Instructions:</div>
            <div><code>npm install</code> — Installs React 19, Three.js, Express, @google/genai, Tailwind CSS v4</div>
            <div><code>npm run dev</code> — Starts full-stack dev server on port 3000 with tsx server.ts</div>
            <div><code>npm run build</code> — Compiles production bundle with Vite and TypeScript checking</div>
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-6 border-t border-stone-200 text-center text-xs font-mono text-stone-500">
          <div>EchoQuest AI · Outdoor Gamification & Multimodal Intelligence Engine</div>
          <div className="text-[11px] text-stone-400 mt-1">Generated and verified for project documentation in PDF / DOC form.</div>
        </footer>
      </article>
    </div>
  );
};
