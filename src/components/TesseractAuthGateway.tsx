import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  StudentProfile,
  MunicipalOfficerProfile,
  UserRole,
} from '../types';
import { studentAuthService } from '../services/studentAuthService';
import { hapticFeedback } from '../utils/haptics';
import { TesseractLogo } from './TesseractLogo';
import {
  User,
  Shield,
  Building2,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  Zap,
  CheckCircle2,
  MapPin,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Cpu,
  Layers,
  Activity,
  Compass,
  ChevronRight,
  X,
  Info,
  Quote,
  Radio,
  ShieldCheck,
  Award,
  HardHat,
  AlertTriangle,
} from 'lucide-react';

interface TesseractAuthGatewayProps {
  onAuthenticated: (role: UserRole) => void;
  onContinueAsGuest: () => void;
}

type SceneMode = 'hypercube' | 'particles' | 'quantum' | 'burst';

// =========================================================================
// CIVIL & MUNICIPAL STICKERS & ROAD SIGN COMPONENTS (CIVIL WEBSITE IDENTITY)
// =========================================================================

/**
 * 1. Yellow Diamond Road Work Caution Sign Sticker (Die-cut vinyl finish)
 */
const RoadWorkSignSticker: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    className={`inline-block select-none filter drop-shadow-[0_8px_14px_rgba(0,0,0,0.55)] transition-transform hover:scale-105 duration-200 ${className}`}
    title="Road Work Ahead — Official Civil Works Caution Sign"
  >
    {/* White vinyl die-cut border */}
    <div className="p-[3px] sm:p-1 bg-white rounded-xl sm:rounded-2xl shadow-xl">
      {/* Yellow Warning Diamond */}
      <div className="w-[72px] h-[72px] sm:w-[84px] sm:h-[84px] bg-gradient-to-br from-amber-300 via-amber-400 to-yellow-400 rounded-lg sm:rounded-xl border-[2.5px] border-stone-950 flex flex-col items-center justify-center p-1 relative overflow-hidden">
        {/* Subtle glossy vinyl reflection sheen */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/35 to-transparent pointer-events-none" />
        
        {/* Inner black border */}
        <div className="w-full h-full border border-stone-950/70 rounded-md sm:rounded-lg flex flex-col items-center justify-center relative z-10 px-0.5">
          {/* Worker Digging Silhouette */}
          <svg viewBox="0 0 48 48" className="w-8 h-8 sm:w-9 sm:h-9 fill-stone-950 shrink-0" aria-label="Worker digging road sign">
            {/* Safety Helmet */}
            <path d="M22 10 C22 8 25 7 28 7 C31 7 34 8 34 10 L22 10 Z" />
            <circle cx="28" cy="11.5" r="3.8" />
            {/* Torso & arms bending with shovel */}
            <path d="M25 15 L32 15 L28 26 L24 25 Z" />
            <path d="M26 16 L19 23 L21 25 L28 18 Z" />
            <path d="M28 19 L22 30 L24 31 L30 20 Z" />
            {/* Legs */}
            <path d="M24 25 L19 37 L23 38 L27 28 Z" />
            <path d="M27 26 L34 37 L38 36 L30 25 Z" />
            {/* Shovel handle & spade digging into ground pile */}
            <line x1="17" y1="21" x2="11" y2="39" stroke="#0c0a09" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M9 37 L14 35 L12 42 L8 41 Z" />
            {/* Asphalt/soil mound */}
            <path d="M4 42 Q10 39 16 42 Q20 38 26 42 Z" />
          </svg>
          <span className="text-[6.5px] sm:text-[7.5px] font-black tracking-tight text-stone-950 font-mono uppercase mt-0.5 leading-none">
            ROAD WORK
          </span>
        </div>
      </div>
    </div>
  </div>
);

/**
 * 2. Municipal Worker Sticker (High-vis vest & hard hat round vinyl sticker)
 */
const MunicipalWorkerSticker: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    className={`inline-block select-none filter drop-shadow-[0_8px_14px_rgba(0,0,0,0.55)] transition-transform hover:scale-105 duration-200 ${className}`}
    title="Municipal Public Works Crew"
  >
    {/* White vinyl sticker border */}
    <div className="p-[3px] sm:p-1 bg-white rounded-full shadow-xl">
      <div className="w-[72px] h-[72px] sm:w-[84px] sm:h-[84px] rounded-full bg-gradient-to-br from-stone-900 via-stone-850 to-stone-950 border-2 border-amber-400 flex flex-col items-center justify-center p-1 relative overflow-hidden text-center">
        {/* Subtle vinyl gloss */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/25 via-transparent to-black/30 pointer-events-none" />
        
        {/* Municipal worker graphic */}
        <div className="relative z-10 flex flex-col items-center">
          {/* Hard Hat */}
          <div className="relative">
            <div className="w-8 h-3.5 bg-amber-400 rounded-t-full border border-stone-950 shadow-xs" />
            <div className="w-10 h-1 bg-amber-500 rounded-full -mt-0.5 border border-stone-950" />
            <div className="w-5 h-2.5 bg-amber-100 rounded-b-md mx-auto -mt-0.5 border-x border-b border-stone-900" />
          </div>
          {/* High-Vis Safety Vest */}
          <div className="w-9 h-4.5 bg-lime-400 rounded-t-md border border-stone-950 relative overflow-hidden flex items-center justify-center -mt-0.5">
            {/* Reflective silver chest tape & orange central zipper */}
            <div className="absolute inset-x-0 top-1 h-1 bg-white/95" />
            <div className="w-1.5 h-full bg-orange-500" />
          </div>
          {/* Sticker text */}
          <span className="text-[6px] sm:text-[7px] font-black text-amber-300 font-mono tracking-tighter uppercase mt-0.5 leading-none">
            CIVIL CREW
          </span>
        </div>
      </div>
    </div>
  </div>
);

/**
 * 3. Yellow Road Sign Board (Civil infrastructure caution sign board with corner rivets)
 */
const YellowSignBoard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    className={`relative select-none rounded-xl bg-gradient-to-b from-amber-300 via-amber-400 to-yellow-400 text-stone-950 p-2.5 sm:p-3 border-2 border-stone-950 shadow-xl overflow-hidden font-mono ${className}`}
  >
    {/* Corner rivet bolts */}
    <span className="absolute top-1 left-1.5 w-1.5 h-1.5 rounded-full bg-stone-850 border border-stone-600 shadow-xs" />
    <span className="absolute top-1 right-1.5 w-1.5 h-1.5 rounded-full bg-stone-850 border border-stone-600 shadow-xs" />
    <span className="absolute bottom-1 left-1.5 w-1.5 h-1.5 rounded-full bg-stone-850 border border-stone-600 shadow-xs" />
    <span className="absolute bottom-1 right-1.5 w-1.5 h-1.5 rounded-full bg-stone-850 border border-stone-600 shadow-xs" />

    {/* Top Caution Hazard Stripe Tape (Yellow & Black diagonal chevrons) */}
    <div
      className="h-2 w-full rounded-sm mb-2 border-y border-stone-950/70"
      style={{
        background: 'repeating-linear-gradient(45deg, #0c0a09 0px, #0c0a09 8px, #facc15 8px, #facc15 16px)',
      }}
    />

    {/* Sign Header & Message */}
    <div className="flex items-center gap-2.5 px-0.5">
      <div className="p-1.5 rounded-lg bg-stone-950 text-amber-400 shrink-0 shadow-sm">
        <HardHat className="w-4 h-4 sm:w-5 sm:h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] sm:text-xs font-black tracking-wide uppercase leading-tight text-stone-950">
          PUBLIC WORKS & ROAD SAFETY ZONE
        </div>
        <div className="text-[8.5px] sm:text-[9.5px] font-bold text-stone-850 uppercase leading-snug">
          CITIZEN REPORTING · MUNICIPAL DISPATCH
        </div>
      </div>
      <div className="hidden sm:flex flex-col items-end text-[8px] font-bold text-stone-900 border-l border-stone-950/25 pl-2 shrink-0">
        <span className="bg-stone-950 text-amber-300 px-1 rounded text-[7.5px] font-mono">24/7 ACTIVE</span>
        <span className="text-[8px] text-stone-950">WARDS 12–16</span>
      </div>
    </div>
  </div>
);

/**
 * 4. Road Traffic Safety Cone Sticker
 */
const TrafficConeSticker: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    className={`inline-block select-none filter drop-shadow-md transition-transform hover:rotate-6 duration-200 ${className}`}
    title="Road Safety Cone"
  >
    <div className="p-[3px] bg-white rounded-lg shadow-sm">
      <svg viewBox="0 0 32 36" className="w-5 h-6 sm:w-6 sm:h-7" aria-label="Traffic safety cone">
        <rect x="2" y="30" width="28" height="4" rx="1" fill="#ea580c" stroke="#1c1917" strokeWidth="1" />
        <polygon points="16,3 10,30 22,30" fill="#f97316" />
        <polygon points="14,12 18,12 19,17 13,17" fill="#ffffff" />
        <polygon points="12,21 20,21 21,26 11,26" fill="#ffffff" />
        <polygon points="16,3 10,30 22,30" fill="none" stroke="#1c1917" strokeWidth="1" />
      </svg>
    </div>
  </div>
);

export const TesseractAuthGateway: React.FC<TesseractAuthGatewayProps> = ({
  onAuthenticated,
  onContinueAsGuest,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const sceneModeRef = useRef<SceneMode>('hypercube');
  const triggerBurstFnRef = useRef<(() => void) | null>(null);

  // Active Role tab: 'STUDENT' vs 'MUNICIPALITY_OFFICER'
  const [activeRole, setActiveRole] = useState<'STUDENT' | 'MUNICIPALITY_OFFICER'>('STUDENT');

  // Form mode: Sign In vs Sign Up
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  // Scene visual mode from tplh.net creative coding presets
  const [sceneMode, setSceneMode] = useState<SceneMode>('hypercube');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // AI specs overlay panel
  const [showAiSpecs, setShowAiSpecs] = useState<boolean>(false);

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);

  // --- CITIZEN FIELDS (START EMPTY - NO PREFILLED VALUES) ---
  const [studentIdentifier, setStudentIdentifier] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [regStudentName, setRegStudentName] = useState('');
  const [regStudentEmail, setRegStudentEmail] = useState('');
  const [regStudentPassword, setRegStudentPassword] = useState('');
  const [regStudentConfirmPassword, setRegStudentConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regStudentId, setRegStudentId] = useState('');
  const [regStudentUni, setRegStudentUni] = useState('');
  const [regStudentDept, setRegStudentDept] = useState('');
  const [regStudentCohort, setRegStudentCohort] = useState('2026');
  const [regStudentTheme, setRegStudentTheme] = useState<'tokyo_monochrome' | 'blueprint_cyan' | 'architectural_slate'>('blueprint_cyan');

  // --- MUNICIPALITY OFFICER FIELDS (START EMPTY) ---
  const [officerBadge, setOfficerBadge] = useState('');
  const [officerPassword, setOfficerPassword] = useState('');
  const [regOfficerName, setRegOfficerName] = useState('');
  const [regOfficerBadge, setRegOfficerBadge] = useState('');
  const [regOfficerEmail, setRegOfficerEmail] = useState('');
  const [regOfficerPassword, setRegOfficerPassword] = useState('');
  const [regOfficerConfirmPassword, setRegOfficerConfirmPassword] = useState('');
  const [showRegOfficerPassword, setShowRegOfficerPassword] = useState(false);
  const [regOfficerWard, setRegOfficerWard] = useState('');
  const [regOfficerDept, setRegOfficerDept] = useState('');
  const [regOfficerDesignation, setRegOfficerDesignation] = useState('');

  // Live telemetry clock
  const [timeString, setTimeString] = useState<string>('');
  const [fps, setFps] = useState<number>(60);

  // Status feedback
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Keep scene mode ref in sync
  useEffect(() => {
    sceneModeRef.current = sceneMode;
  }, [sceneMode]);

  // Live clock tick
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const utc = now.toISOString().substring(11, 19);
      const jstHours = (now.getUTCHours() + 9) % 24;
      const jst = `${String(jstHours).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}:${String(now.getUTCSeconds()).padStart(2, '0')}`;
      setTimeString(`JST ${jst} / UTC ${utc}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Web Audio ambient micro-synthesizer for tplh.net creative coding soundscapes
  const playSynthesizedChime = (freq = 440, type: OscillatorType = 'sine', duration = 0.3) => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (_) {}
  };

  // Toggle sound
  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    if (next) {
      setTimeout(() => {
        playSynthesizedChime(587.33, 'sine', 0.4); // D5
        setTimeout(() => playSynthesizedChime(880, 'sine', 0.5), 120); // A5
      }, 50);
    }
  };

  // -------------------------------------------------------------
  // THREE.JS CANVAS: 4D TESSERACT & GENERATIVE PARTICLE CONSTELLATION
  // -------------------------------------------------------------
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x06070a, 0.08);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 0, 4.5);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Root interactive group
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // 1. MATHEMATICAL 4D TESSERACT (HYPERCUBE)
    // 16 4D Vertices: (±1, ±1, ±1, ±1)
    const tesseractVertices4D: number[][] = [];
    for (let x = -1; x <= 1; x += 2) {
      for (let y = -1; y <= 1; y += 2) {
        for (let z = -1; z <= 1; z += 2) {
          for (let w = -1; w <= 1; w += 2) {
            tesseractVertices4D.push([x, y, z, w]);
          }
        }
      }
    }

    // 32 4D Edges connecting vertices differing in exactly 1 dimension
    const tesseractEdges: [number, number][] = [];
    for (let i = 0; i < 16; i++) {
      for (let j = i + 1; j < 16; j++) {
        let diffCount = 0;
        for (let d = 0; d < 4; d++) {
          if (tesseractVertices4D[i][d] !== tesseractVertices4D[j][d]) diffCount++;
        }
        if (diffCount === 1) {
          tesseractEdges.push([i, j]);
        }
      }
    }

    // Tesseract 3D projected geometry & lines
    const tesseractLinePositions = new Float32Array(tesseractEdges.length * 2 * 3);
    const tesseractGeo = new THREE.BufferGeometry();
    tesseractGeo.setAttribute('position', new THREE.BufferAttribute(tesseractLinePositions, 3));

    const tesseractMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.85,
      linewidth: 1.5,
    });
    const tesseractLines = new THREE.LineSegments(tesseractGeo, tesseractMat);
    rootGroup.add(tesseractLines);

    // Vertex points (16 glowing crystals)
    const vertexPositions = new Float32Array(16 * 3);
    const vertexGeo = new THREE.BufferGeometry();
    vertexGeo.setAttribute('position', new THREE.BufferAttribute(vertexPositions, 3));
    const vertexMat = new THREE.PointsMaterial({
      color: 0xbae6fd,
      size: 0.1,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
    });
    const vertexPoints = new THREE.Points(vertexGeo, vertexMat);
    rootGroup.add(vertexPoints);

    // Inner Glowing Core
    const coreGeo = new THREE.SphereGeometry(0.35, 16, 16);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x0284c7,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    rootGroup.add(coreMesh);

    // 2. AMBIENT GENERATIVE PARTICLE CONSTELLATION (tplh.net signature)
    const particleCount = 450;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities: { x: number; y: number; z: number }[] = [];
    const particleOriginals: { x: number; y: number; z: number }[] = [];

    for (let i = 0; i < particleCount; i++) {
      const radius = 1.2 + Math.random() * 4.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const px = radius * Math.sin(phi) * Math.cos(theta);
      const py = radius * Math.sin(phi) * Math.sin(theta);
      const pz = radius * Math.cos(phi);

      particlePositions[i * 3] = px;
      particlePositions[i * 3 + 1] = py;
      particlePositions[i * 3 + 2] = pz;

      particleOriginals.push({ x: px, y: py, z: pz });
      particleVelocities.push({
        x: (Math.random() - 0.5) * 0.003,
        y: (Math.random() - 0.5) * 0.003,
        z: (Math.random() - 0.5) * 0.003,
      });
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0x7dd3fc,
      size: 0.035,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });
    const particleCloud = new THREE.Points(particleGeo, particleMat);
    scene.add(particleCloud);

    // 3. BURST PARTICLES (On-demand high-energy explosion)
    const burstCount = 180;
    const burstPositions = new Float32Array(burstCount * 3);
    const burstVelocities: THREE.Vector3[] = [];
    for (let i = 0; i < burstCount; i++) {
      burstPositions[i * 3] = 0;
      burstPositions[i * 3 + 1] = 0;
      burstPositions[i * 3 + 2] = 0;
      const dir = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2
      ).normalize().multiplyScalar(0.04 + Math.random() * 0.12);
      burstVelocities.push(dir);
    }
    const burstGeo = new THREE.BufferGeometry();
    burstGeo.setAttribute('position', new THREE.BufferAttribute(burstPositions, 3));
    const burstMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.07,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    const burstCloud = new THREE.Points(burstGeo, burstMat);
    rootGroup.add(burstCloud);

    let isBurstActive = false;
    let burstProgress = 0;

    triggerBurstFnRef.current = () => {
      isBurstActive = true;
      burstProgress = 0;
      burstMat.opacity = 1;
      playSynthesizedChime(987.77, 'sawtooth', 0.4); // B5
      for (let i = 0; i < burstCount; i++) {
        burstPositions[i * 3] = 0;
        burstPositions[i * 3 + 1] = 0;
        burstPositions[i * 3 + 2] = 0;
      }
      burstGeo.attributes.position.needsUpdate = true;
    };

    // MOUSE TRACKING & INTERACTIVE GYRO
    let mouseX = 0;
    let mouseY = 0;
    let targetRotX = 0;
    let targetRotY = 0;

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      let clientX = 0;
      let clientY = 0;
      if ('touches' in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ('clientX' in e) {
        clientX = (e as MouseEvent).clientX;
        clientY = (e as MouseEvent).clientY;
      }
      mouseX = (clientX / window.innerWidth) * 2 - 1;
      mouseY = -(clientY / window.innerHeight) * 2 + 1;
      targetRotX = mouseY * 0.45;
      targetRotY = mouseX * 0.65;
    };

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('touchmove', handlePointerMove, { passive: true });

    // Handle Window Resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth || window.innerWidth;
      const h = containerRef.current.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 4D ROTATION ANGLES
    let angleXW = 0;
    let angleYZ = 0;
    let angleZW = 0;
    let lastTime = performance.now();
    let frameCount = 0;
    let fpsTimer = 0;

    // PROJECT 4D TO 3D USING STEREOGRAPHIC PROJECTION
    function project4D(v: number[], distance4D = 2.4): [number, number, number] {
      // Stereographic scaling factor based on 4th dimension (w)
      const w = v[3];
      const factor = 1 / (distance4D - w);
      return [v[0] * factor * 1.8, v[1] * factor * 1.8, v[2] * factor * 1.8];
    }

    // ROTATE IN 4D SPACE
    function rotate4D(
      v: number[],
      thetaXW: number,
      thetaYZ: number,
      thetaZW: number
    ): number[] {
      let [x, y, z, w] = v;

      // XW Plane Rotation
      const cosXW = Math.cos(thetaXW);
      const sinXW = Math.sin(thetaXW);
      const rx = x * cosXW - w * sinXW;
      const rw = x * sinXW + w * cosXW;
      x = rx;
      w = rw;

      // YZ Plane Rotation
      const cosYZ = Math.cos(thetaYZ);
      const sinYZ = Math.sin(thetaYZ);
      const ry = y * cosYZ - z * sinYZ;
      const rz = y * sinYZ + z * cosYZ;
      y = ry;
      z = rz;

      // ZW Plane Rotation
      const cosZW = Math.cos(thetaZW);
      const sinZW = Math.sin(thetaZW);
      const rz2 = z * cosZW - w * sinZW;
      const rw2 = z * sinZW + w * cosZW;
      z = rz2;
      w = rw2;

      return [x, y, z, w];
    }

    // MAIN ANIMATION RENDER LOOP
    const animate = (currentTime: number) => {
      animFrameRef.current = requestAnimationFrame(animate);

      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      // FPS Counter
      frameCount++;
      fpsTimer += delta;
      if (fpsTimer >= 1) {
        setFps(Math.round(frameCount / fpsTimer));
        frameCount = 0;
        fpsTimer = 0;
      }

      const mode = sceneModeRef.current;

      // Rotation speeds tuned per scene mode
      const speedMult = mode === 'burst' ? 2.5 : mode === 'particles' ? 0.6 : 1.0;
      angleXW += 0.012 * speedMult;
      angleYZ += 0.009 * speedMult;
      angleZW += 0.006 * speedMult;

      // Smooth camera interpolation towards mouse target
      rootGroup.rotation.x += (targetRotX - rootGroup.rotation.x) * 0.06;
      rootGroup.rotation.y += (targetRotY - rootGroup.rotation.y) * 0.06;

      // Calculate transformed 4D vertices
      const transformed3D: [number, number, number][] = [];
      for (let i = 0; i < 16; i++) {
        const rotated = rotate4D(tesseractVertices4D[i], angleXW, angleYZ, angleZW);
        const projected = project4D(rotated, 2.5);
        transformed3D.push(projected);

        vertexPositions[i * 3] = projected[0];
        vertexPositions[i * 3 + 1] = projected[1];
        vertexPositions[i * 3 + 2] = projected[2];
      }
      vertexGeo.attributes.position.needsUpdate = true;

      // Update Tesseract Lines
      let lineIdx = 0;
      for (let i = 0; i < tesseractEdges.length; i++) {
        const [p1Idx, p2Idx] = tesseractEdges[i];
        const p1 = transformed3D[p1Idx];
        const p2 = transformed3D[p2Idx];

        tesseractLinePositions[lineIdx++] = p1[0];
        tesseractLinePositions[lineIdx++] = p1[1];
        tesseractLinePositions[lineIdx++] = p1[2];

        tesseractLinePositions[lineIdx++] = p2[0];
        tesseractLinePositions[lineIdx++] = p2[1];
        tesseractLinePositions[lineIdx++] = p2[2];
      }
      tesseractGeo.attributes.position.needsUpdate = true;

      // Pulsing Core Mesh
      const scale = 0.9 + Math.sin(currentTime * 0.003) * 0.15;
      coreMesh.scale.set(scale, scale, scale);
      coreMesh.rotation.y += 0.01;
      coreMesh.rotation.z += 0.005;

      // Ambient Particle Constellation Motion
      const positions = particleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const idx = i * 3;
        positions[idx] += particleVelocities[i].x;
        positions[idx + 1] += particleVelocities[i].y;
        positions[idx + 2] += particleVelocities[i].z;

        // Interactive mouse force on nearby particles
        const dx = positions[idx] - mouseX * 2.5;
        const dy = positions[idx + 1] - mouseY * 2.5;
        const distSq = dx * dx + dy * dy;
        if (distSq < 1.5) {
          positions[idx] += dx * 0.008;
          positions[idx + 1] += dy * 0.008;
        }

        // Boundary wrap
        if (Math.abs(positions[idx]) > 5) positions[idx] = -positions[idx] * 0.8;
        if (Math.abs(positions[idx + 1]) > 5) positions[idx + 1] = -positions[idx + 1] * 0.8;
        if (Math.abs(positions[idx + 2]) > 5) positions[idx + 2] = -positions[idx + 2] * 0.8;
      }
      particleGeo.attributes.position.needsUpdate = true;
      particleCloud.rotation.y += 0.0008;

      // Handle Burst effect
      if (isBurstActive) {
        burstProgress += delta * 1.5;
        const bPos = burstGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < burstCount; i++) {
          const idx = i * 3;
          bPos[idx] += burstVelocities[i].x;
          bPos[idx + 1] += burstVelocities[i].y;
          bPos[idx + 2] += burstVelocities[i].z;
        }
        burstGeo.attributes.position.needsUpdate = true;
        burstMat.opacity = Math.max(0, 1 - burstProgress);

        if (burstProgress >= 1) {
          isBurstActive = false;
          burstMat.opacity = 0;
        }
      }

      // Visual Mode Adjustments
      if (mode === 'hypercube') {
        tesseractMat.opacity = 0.9;
        particleMat.opacity = 0.45;
        coreMesh.visible = true;
      } else if (mode === 'particles') {
        tesseractMat.opacity = 0.25;
        particleMat.opacity = 0.95;
        particleMat.size = 0.055;
        coreMesh.visible = false;
      } else if (mode === 'quantum') {
        tesseractMat.opacity = 0.8;
        particleMat.opacity = 0.8;
        particleMat.size = 0.04;
        coreMesh.visible = true;
      } else if (mode === 'burst') {
        tesseractMat.opacity = 1.0;
        particleMat.opacity = 0.9;
      }

      renderer.render(scene, camera);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      tesseractGeo.dispose();
      tesseractMat.dispose();
      vertexGeo.dispose();
      vertexMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      burstGeo.dispose();
      burstMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
    };
  }, []);

  // -------------------------------------------------------------
  // AUTH SUBMISSION HANDLERS
  // -------------------------------------------------------------

  // 1. CITIZEN SIGN IN
  const handleCitizenSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);
    hapticFeedback();

    if (!studentIdentifier.trim()) {
      setErrorMsg('Please enter your email, Citizen ID, or name.');
      setIsSubmitting(false);
      return;
    }

    if (triggerBurstFnRef.current) triggerBurstFnRef.current();

    try {
      const res = studentAuthService.login(studentIdentifier, studentPassword);
      if (res.success && res.student) {
        setSuccessMsg(`Welcome, ${res.student.fullName}! Citizen clearance verified.`);
        playSynthesizedChime(659.25, 'triangle', 0.5); // E5
        setTimeout(() => {
          onAuthenticated('CITIZEN');
        }, 800);
      } else {
        setErrorMsg(res.error || 'Citizen credentials unrecognized. Please check your email, name, or Citizen ID, or create a new account.');
        playSynthesizedChime(220, 'sawtooth', 0.3); // A3
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Authentication service timeout.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. CITIZEN REGISTRATION (NEW ACCOUNT)
  const handleCitizenRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);
    hapticFeedback();

    if (!regStudentName.trim()) {
      setErrorMsg('Full Name is required.');
      setIsSubmitting(false);
      return;
    }
    if (!regStudentEmail.trim() || !regStudentEmail.includes('@')) {
      setErrorMsg('A valid email address is required.');
      setIsSubmitting(false);
      return;
    }
    if (!regStudentPassword || regStudentPassword.length < 4) {
      setErrorMsg('Please create a password with at least 4 characters.');
      setIsSubmitting(false);
      return;
    }
    if (regStudentPassword !== regStudentConfirmPassword) {
      setErrorMsg('Passwords do not match. Please verify your confirm password.');
      setIsSubmitting(false);
      return;
    }

    if (triggerBurstFnRef.current) triggerBurstFnRef.current();

    try {
      const generatedId = regStudentId.trim() || `CTZ-${Math.floor(1000 + Math.random() * 9000)}`;
      const res = studentAuthService.register({
        fullName: regStudentName,
        email: regStudentEmail,
        password: regStudentPassword,
        studentIdNumber: generatedId,
        university: regStudentUni.trim() || 'Ward 14 Civic District',
        department: regStudentDept.trim() || 'Neighborhood Resident & Commuter',
        cohortYear: 'Active Citizen',
        matrixCardTheme: regStudentTheme,
        roleTitle: 'Citizen Safety Surveyor',
      });

      if (res.success && res.student) {
        // Prepopulate login credentials in case user ever signs in again
        setStudentIdentifier(res.student.email);
        setStudentPassword(regStudentPassword);

        setSuccessMsg(
          `Citizen account created for ${res.student.fullName}! Your Citizen ID is ${res.student.studentIdNumber}. +250 Civic Credits awarded. Entering system...`
        );
        playSynthesizedChime(783.99, 'sine', 0.6); // G5
        setTimeout(() => {
          onAuthenticated('CITIZEN');
        }, 1100);
      } else {
        setErrorMsg(res.error || 'Registration failed. This email or Citizen ID may already exist.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to complete registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. MUNICIPALITY OFFICER SIGN IN
  const handleOfficerSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);
    hapticFeedback();

    if (!officerBadge.trim()) {
      setErrorMsg('Please enter your Officer Badge ID or email.');
      setIsSubmitting(false);
      return;
    }

    if (triggerBurstFnRef.current) triggerBurstFnRef.current();

    try {
      const res = studentAuthService.loginAsOfficer(officerBadge, officerPassword);
      if (res.success && res.officer) {
        setSuccessMsg(`Dispatch Clearance Granted: ${res.officer.fullName} (${res.officer.wardJurisdiction}).`);
        playSynthesizedChime(523.25, 'triangle', 0.5); // C5
        setTimeout(() => {
          onAuthenticated('MUNICIPALITY_OFFICER');
        }, 800);
      } else {
        setErrorMsg(res.error || 'Municipal badge number or password unrecognized.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Municipal registry communication error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. MUNICIPALITY OFFICER REGISTRATION
  const handleOfficerRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);
    hapticFeedback();

    if (!regOfficerName.trim() || !regOfficerBadge.trim() || !regOfficerEmail.trim()) {
      setErrorMsg('Full Officer Name, Badge ID, and Municipal Email are required.');
      setIsSubmitting(false);
      return;
    }
    if (!regOfficerPassword || regOfficerPassword.length < 4) {
      setErrorMsg('Please create an officer password of at least 4 characters.');
      setIsSubmitting(false);
      return;
    }
    if (regOfficerPassword !== regOfficerConfirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter confirm password.');
      setIsSubmitting(false);
      return;
    }

    if (triggerBurstFnRef.current) triggerBurstFnRef.current();

    try {
      const res = studentAuthService.registerOfficer({
        fullName: regOfficerName,
        badgeNumber: regOfficerBadge,
        officialEmail: regOfficerEmail,
        password: regOfficerPassword,
        wardJurisdiction: regOfficerWard || 'Ward 12-16 Central Municipal District',
        department: regOfficerDept || 'Emergency Road Works Squad',
        designation: regOfficerDesignation || 'Municipal Dispatch Officer',
        assignedCrewUnit: 'Central Municipal Dispatch Command',
      });

      if (res.success && res.officer) {
        setOfficerBadge(res.officer.badgeNumber);
        setOfficerPassword(regOfficerPassword);
        setSuccessMsg(`Officer ${res.officer.fullName} enrolled into ${res.officer.wardJurisdiction}. Accessing Command.`);
        setTimeout(() => {
          onAuthenticated('MUNICIPALITY_OFFICER');
        }, 900);
      } else {
        setErrorMsg(res.error || 'Officer registration failed.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to enroll officer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 1-Click Fast Fill for Demo Citizens
  const handleSelectDemoCitizen = (identifier: string) => {
    hapticFeedback();
    playSynthesizedChime(523.25, 'sine', 0.2);
    setStudentIdentifier(identifier);
    setStudentPassword('pass1234');
    setErrorMsg(null);
  };

  // 1-Click Fast Fill for Demo Officers
  const handleSelectDemoOfficer = (badge: string) => {
    hapticFeedback();
    playSynthesizedChime(440, 'sine', 0.2);
    setOfficerBadge(badge);
    setOfficerPassword('dispatch2026');
    setErrorMsg(null);
  };

  return (
    <div className="relative w-full min-h-screen bg-[#07080c] text-stone-100 flex flex-col font-sans select-none overflow-x-hidden">
      
      {/* ========================================================= */}
      {/* BACKGROUND: 3D THREE.JS TESSERACT & PARTICLE CANVAS      */}
      {/* ========================================================= */}
      <div
        ref={containerRef}
        className="fixed inset-0 pointer-events-none z-0"
        aria-hidden="true"
      />

      {/* Subtle architectural grid lines inspired by tplh.net */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(56,189,248,0.12),rgba(255,255,255,0))] pointer-events-none z-0" />
      <div className="fixed inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none z-0" />

      {/* ========================================================= */}
      {/* 1. CLEAN USER-FRIENDLY HEADER */}
      {/* ========================================================= */}
      <header className="relative z-20 w-full px-4 sm:px-8 py-3 sm:py-4 flex items-center justify-between border-b border-white/5 backdrop-blur-md">
        {/* Left: Brand & Civil Department Tag */}
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-stone-900/80 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.25)]">
            <TesseractLogo size={24} glow={true} />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-bold tracking-tight text-white font-sans">
                Tesseract
              </span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-500/40 hidden sm:inline flex items-center gap-1">
                <HardHat className="w-2.5 h-2.5" />
                <span>CIVIL WORKS</span>
              </span>
            </div>
            <span className="text-[11px] text-stone-300 font-sans">
              Citizen Safety & Municipal Public Works Portal
            </span>
          </div>
        </div>

        {/* Right: Sound & AI Information */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs text-stone-300">
          <button
            onClick={handleToggleSound}
            title={soundEnabled ? 'Sound is on' : 'Sound is off'}
            className={`p-2 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 text-xs ${
              soundEnabled
                ? 'bg-amber-950/80 border-amber-500/60 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                : 'bg-stone-900/60 border-white/10 text-stone-400 hover:text-white'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">
              {soundEnabled ? 'Sound On' : 'Sound Off'}
            </span>
          </button>

          <button
            onClick={() => {
              setShowAiSpecs(true);
              hapticFeedback();
            }}
            className="p-2 px-3 rounded-lg border border-amber-500/30 bg-amber-950/40 text-amber-300 hover:bg-amber-900/50 transition-colors flex items-center gap-1.5 cursor-pointer text-xs font-mono"
          >
            <Info className="w-3.5 h-3.5" />
            <span>Civil Specs</span>
          </button>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 2. MAIN USER-FRIENDLY LOGIN & REGISTER INTERFACE           */}
      {/* ========================================================= */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-12 py-8 sm:py-12">
        
        {/* Responsive Grid: Left Civil Road Sign Board & Vision + Right Friendly Auth Form */}
        <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* LEFT COLUMN: Civil Works Sign Board, Worker Stickers & Community Street Safety */}
          <aside className="lg:col-span-5 flex flex-col gap-5 text-left order-2 lg:order-1">
            
            {/* 1. Yellow Road Sign Board (Civil infrastructure caution sign board) */}
            <YellowSignBoard className="w-full" />

            {/* 2. Physical Worker & Road Work Sticker Badge Cluster */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-stone-900/70 border border-white/10 backdrop-blur-md">
              <RoadWorkSignSticker className="-rotate-3 shrink-0" />
              <MunicipalWorkerSticker className="rotate-2 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-bold text-amber-400 font-mono flex items-center gap-1">
                  <HardHat className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">CIVIL WORKS DIVISION</span>
                </div>
                <p className="text-[10px] text-stone-300 leading-snug mt-0.5">
                  Real-time street hazards verified by citizens & repaired by municipal road crews.
                </p>
              </div>
            </div>

            {/* Primary Quote */}
            <div className="relative p-5 rounded-2xl bg-stone-900/70 backdrop-blur-xl border border-white/10 shadow-xl">
              <Quote className="w-5 h-5 text-amber-400/70 mb-2.5" />
              <blockquote className="text-sm sm:text-base text-stone-100 font-sans font-normal leading-relaxed">
                “Every street hazard reported by a resident is dispatched to municipal repair teams within minutes. When citizens and city crews work together, roads stay safe for everyone.”
              </blockquote>
              <div className="mt-3.5 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-stone-400">
                <span className="text-stone-300 font-medium">Public Works & Citizen Safety</span>
                <span className="text-amber-400 font-mono text-[11px]">ACTIVE 2026</span>
              </div>
            </div>

            {/* Secondary Quote: Citizen & Municipal Collaboration */}
            <div className="p-4 rounded-2xl bg-stone-900/50 border border-white/10 backdrop-blur-md">
              <p className="text-xs text-stone-300 leading-relaxed">
                “Residents and commuters spot broken footpaths, open manholes, or street waterlogging on their daily travel, letting municipal road crews fix them before anyone gets hurt.”
              </p>
              <div className="mt-2 text-xs text-amber-300 font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>Citizen Reporting & Municipal Dispatch Network</span>
              </div>
            </div>

            {/* Simple highlights */}
            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="p-2.5 rounded-xl bg-stone-900/60 border border-white/5">
                <div className="text-sm font-bold text-white">Instant</div>
                <div className="text-[10px] text-stone-400">Road Reports</div>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-900/60 border border-white/5">
                <div className="text-sm font-bold text-amber-400">City Crews</div>
                <div className="text-[10px] text-stone-400">Field Dispatch</div>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-900/60 border border-white/5">
                <div className="text-sm font-bold text-emerald-400">Verified</div>
                <div className="text-[10px] text-stone-400">Photo Proof</div>
              </div>
            </div>
          </aside>

          {/* RIGHT COLUMN: Clean, Intuitive Login Card with Stickers & Civil Design */}
          <div className="lg:col-span-7 w-full order-1 lg:order-2">
            <div className="w-full max-w-lg mx-auto rounded-3xl bg-stone-900/90 backdrop-blur-2xl border border-white/10 shadow-2xl p-6 sm:p-8 animate-[fadeIn_0.3s_ease-out] relative">
          
          {/* STICKER 1: Yellow Diamond Road Work Sign Sticker (Top Right Corner with -rotate-6 tilt) */}
          <div className="absolute -top-7 -right-3 sm:-top-8 sm:-right-5 z-20 pointer-events-none transform -rotate-6">
            <RoadWorkSignSticker />
          </div>

          {/* STICKER 2: Municipal Worker Sticker (Top Left Corner with rotate-3 tilt) */}
          <div className="absolute -top-6 -left-3 sm:-top-7 sm:-left-4 z-20 pointer-events-none transform rotate-3">
            <MunicipalWorkerSticker />
          </div>

          {/* Top Safety Hazard Tape Stripe Accent */}
          <div
            className="h-2 w-full rounded-t-3xl -mt-6 -mx-6 sm:-mt-8 sm:-mx-8 mb-5 overflow-hidden border-b border-stone-950/80"
            style={{
              background: 'repeating-linear-gradient(45deg, #0c0a09 0px, #0c0a09 10px, #facc15 10px, #facc15 20px)',
            }}
          />

          {/* Card Header */}
          <div className="pb-4 border-b border-white/10 mb-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono font-bold text-amber-400 tracking-wider uppercase">
                CIVIL INFRASTRUCTURE PORTAL
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Sign In to Tesseract
            </h1>
            <p className="text-xs sm:text-sm text-stone-400 mt-1">
              Access the civic network for Citizens & Municipal Public Works Officers
            </p>
          </div>

          {/* Role Selection Tabs: Citizen vs Municipal Officer */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-stone-950/80 rounded-2xl border border-white/10 mb-6">
            <button
              type="button"
              onClick={() => {
                setActiveRole('STUDENT');
                setErrorMsg(null);
                setSuccessMsg(null);
                hapticFeedback();
              }}
              className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeRole === 'STUDENT'
                  ? 'bg-cyan-500 text-stone-950 shadow-md font-bold'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <User className="w-4 h-4 shrink-0" />
              <span>Citizen</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveRole('MUNICIPALITY_OFFICER');
                setErrorMsg(null);
                setSuccessMsg(null);
                hapticFeedback();
              }}
              className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeRole === 'MUNICIPALITY_OFFICER'
                  ? 'bg-amber-500 text-stone-950 shadow-md font-bold'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <HardHat className="w-4 h-4 shrink-0 text-stone-950" />
              <span>Municipal Officer</span>
            </button>
          </div>

          {/* Mode Switcher: Sign In vs Create Account */}
          <div className="flex items-center justify-between mb-6 pb-2 border-b border-white/5">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  setErrorMsg(null);
                  hapticFeedback();
                }}
                className={`text-sm font-semibold transition-colors cursor-pointer pb-1.5 border-b-2 ${
                  authMode === 'signin'
                    ? activeRole === 'STUDENT'
                      ? 'text-cyan-400 border-cyan-400'
                      : 'text-amber-400 border-amber-400'
                    : 'text-stone-400 border-transparent hover:text-white'
                }`}
              >
                Sign In
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setErrorMsg(null);
                  hapticFeedback();
                }}
                className={`text-sm font-semibold transition-colors cursor-pointer pb-1.5 border-b-2 ${
                  authMode === 'signup'
                    ? activeRole === 'STUDENT'
                      ? 'text-cyan-400 border-cyan-400'
                      : 'text-amber-400 border-amber-400'
                    : 'text-stone-400 border-transparent hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>

            <span className="text-xs font-mono text-stone-400 hidden sm:inline flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${activeRole === 'STUDENT' ? 'bg-cyan-400' : 'bg-amber-400'}`} />
              {activeRole === 'STUDENT' ? 'Citizen Portal' : 'Municipal Officer Portal'}
            </span>
          </div>

          {/* Error & Success Alerts */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-rose-950/70 border border-rose-500/60 text-rose-200 text-xs flex items-start gap-2">
              <X className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-950/70 border border-emerald-500/60 text-emerald-200 text-xs flex items-start gap-2 animate-[fadeIn_0.2s_ease-out]">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* -------------------------------------------------------- */}
          {/* A. CITIZEN AUTHENTICATION FLOW                           */}
          {/* -------------------------------------------------------- */}
          {activeRole === 'STUDENT' && (
            <div>
              {/* CITIZEN SIGN IN */}
              {authMode === 'signin' && (
                <form onSubmit={handleCitizenSignIn} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-stone-200 mb-1.5 flex items-center justify-between">
                      <span>Citizen Email, Full Name, or Resident ID</span>
                      <span className="text-[10px] text-cyan-400 font-mono">Email / ID / Name</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={studentIdentifier}
                        onChange={(e) => setStudentIdentifier(e.target.value)}
                        placeholder="e.g. your.email@example.com, Alex Morgan, or CTZ-2026-8942"
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950/70 border border-white/15 text-white text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors placeholder:text-stone-500"
                      />
                      <User className="absolute right-3.5 top-3 w-4 h-4 text-stone-500" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-200 mb-1.5 flex items-center justify-between">
                      <span>Password</span>
                      <span className="text-[11px] text-stone-400">Keep it secure</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={studentPassword}
                        onChange={(e) => setStudentPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950/70 border border-white/15 text-white text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors placeholder:text-stone-500 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3 text-stone-400 hover:text-white cursor-pointer"
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* 1-Click Fast Fill for Demo Citizens */}
                  <div className="pt-1">
                    <div className="text-[11px] font-mono text-stone-400 mb-2 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-cyan-400">
                        <User className="w-3 h-3" />
                        <span>Quick Demo Citizens:</span>
                      </span>
                      <span className="text-[10px] text-stone-500">1-Click Test</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => handleSelectDemoCitizen('TSR-2026-8942')}
                        className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                          studentIdentifier === 'TSR-2026-8942'
                            ? 'bg-cyan-950/60 border-cyan-400 text-cyan-200'
                            : 'bg-stone-950/60 border-white/10 text-stone-300 hover:border-cyan-500/40'
                        }`}
                      >
                        <div className="text-[11px] font-bold text-white truncate">Kenji Takahashi</div>
                        <div className="text-[9px] text-cyan-400 truncate">Ward 14 Resident</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSelectDemoCitizen('TSR-2026-3104')}
                        className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                          studentIdentifier === 'TSR-2026-3104'
                            ? 'bg-cyan-950/60 border-cyan-400 text-cyan-200'
                            : 'bg-stone-950/60 border-white/10 text-stone-300 hover:border-cyan-500/40'
                        }`}
                      >
                        <div className="text-[11px] font-bold text-white truncate">Maya Lin</div>
                        <div className="text-[9px] text-cyan-400 truncate">Civil Volunteer</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSelectDemoCitizen('TSR-2026-5521')}
                        className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                          studentIdentifier === 'TSR-2026-5521'
                            ? 'bg-cyan-950/60 border-cyan-400 text-cyan-200'
                            : 'bg-stone-950/60 border-white/10 text-stone-300 hover:border-cyan-500/40'
                        }`}
                      >
                        <div className="text-[11px] font-bold text-white truncate">Liam O’Connor</div>
                        <div className="text-[9px] text-cyan-400 truncate">Daily Commuter</div>
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-2 py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 active:scale-[0.99] text-stone-950 font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
                  >
                    <span>{isSubmitting ? 'Signing In...' : 'Sign In as Citizen'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* CITIZEN SIGN UP (REGISTRATION) */}
              {authMode === 'signup' && (
                <form onSubmit={handleCitizenRegister} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-medium text-stone-200 mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={regStudentName}
                      onChange={(e) => setRegStudentName(e.target.value)}
                      placeholder="e.g. Alex Morgan"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950/70 border border-white/15 text-white text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors placeholder:text-stone-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-medium text-stone-200 mb-1.5">
                        Citizen Email
                      </label>
                      <input
                        type="email"
                        value={regStudentEmail}
                        onChange={(e) => setRegStudentEmail(e.target.value)}
                        placeholder="e.g. alex.morgan@example.com"
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950/70 border border-white/15 text-white text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors placeholder:text-stone-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-stone-200 mb-1.5 flex items-center justify-between">
                        <span>Resident ID (Optional)</span>
                        <span className="text-[10px] text-stone-400">Auto-generated</span>
                      </label>
                      <input
                        type="text"
                        value={regStudentId}
                        onChange={(e) => setRegStudentId(e.target.value)}
                        placeholder="Auto-generated if left blank"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950/70 border border-white/15 text-white text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors placeholder:text-stone-500"
                      />
                    </div>
                  </div>

                  {/* Create Password & Confirm Password */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-medium text-stone-200 mb-1.5 flex items-center justify-between">
                        <span>Create Password</span>
                        <span className="text-[10px] text-cyan-400 font-mono">Min 4 chars</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showRegPassword ? 'text' : 'password'}
                          value={regStudentPassword}
                          onChange={(e) => setRegStudentPassword(e.target.value)}
                          placeholder="Create secure password"
                          required
                          minLength={4}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950/70 border border-white/15 text-white text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors placeholder:text-stone-500 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          className="absolute right-3.5 top-3 text-stone-400 hover:text-white cursor-pointer"
                          aria-label="Toggle password visibility"
                        >
                          {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-stone-200 mb-1.5 flex items-center justify-between">
                        <span>Confirm Password</span>
                        {regStudentConfirmPassword && regStudentPassword === regStudentConfirmPassword && (
                          <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3" /> Matched
                          </span>
                        )}
                        {regStudentConfirmPassword && regStudentPassword !== regStudentConfirmPassword && (
                          <span className="text-[10px] text-rose-400 font-mono">
                            Mismatch
                          </span>
                        )}
                      </label>
                      <div className="relative">
                        <input
                          type={showRegPassword ? 'text' : 'password'}
                          value={regStudentConfirmPassword}
                          onChange={(e) => setRegStudentConfirmPassword(e.target.value)}
                          placeholder="Re-type your password"
                          required
                          minLength={4}
                          className={`w-full px-3.5 py-2.5 rounded-xl bg-stone-950/70 border text-white text-sm focus:outline-none focus:ring-1 transition-colors placeholder:text-stone-500 pr-10 ${
                            regStudentConfirmPassword && regStudentPassword !== regStudentConfirmPassword
                              ? 'border-rose-500/70 focus:border-rose-400 focus:ring-rose-400'
                              : 'border-white/15 focus:border-cyan-400 focus:ring-cyan-400'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-medium text-stone-200 mb-1.5">
                        Residential Ward / Area
                      </label>
                      <input
                        type="text"
                        value={regStudentUni}
                        onChange={(e) => setRegStudentUni(e.target.value)}
                        placeholder="e.g. Ward 14 Metro District"
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950/70 border border-white/15 text-white text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors placeholder:text-stone-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-stone-200 mb-1.5">
                        Community Role (Optional)
                      </label>
                      <input
                        type="text"
                        value={regStudentDept}
                        onChange={(e) => setRegStudentDept(e.target.value)}
                        placeholder="e.g. Resident, Cyclist, Volunteer"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950/70 border border-white/15 text-white text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors placeholder:text-stone-500"
                      />
                    </div>
                  </div>

                  {/* Friendly community welcome bonus */}
                  <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-800/30 text-xs text-stone-300 flex items-center justify-between">
                    <span>Welcome Bonus for New Citizens:</span>
                    <span className="font-semibold text-cyan-300 font-mono">+250 Civic Safety Credits</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-2 py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 active:scale-[0.99] text-stone-950 font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
                  >
                    <span>{isSubmitting ? 'Creating Account...' : 'Create Citizen Account & Sign In'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          )}

          {/* -------------------------------------------------------- */}
          {/* B. MUNICIPALITY OFFICER AUTHENTICATION FLOW              */}
          {/* -------------------------------------------------------- */}
          {activeRole === 'MUNICIPALITY_OFFICER' && (
            <div>
              {authMode === 'signin' && (
                <form onSubmit={handleOfficerSignIn} className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono text-stone-300 mb-1.5 flex items-center justify-between">
                      <span>OFFICER BADGE ID OR MUNICIPAL EMAIL</span>
                      <span className="text-[10px] text-amber-400">Badge ID</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={officerBadge}
                        onChange={(e) => setOfficerBadge(e.target.value)}
                        placeholder="e.g. MUN-14-ENG-08 or dave.miller@municipalworks.gov"
                        required
                        className="w-full px-3.5 py-2.5 rounded-lg bg-stone-900/90 border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
                      />
                      <Building2 className="absolute right-3 top-2.5 w-4 h-4 text-stone-500" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-stone-300 mb-1.5 flex items-center justify-between">
                      <span>DISPATCH CLEARANCE KEY</span>
                      <span className="text-[10px] text-stone-500">Security PIN</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={officerPassword}
                        onChange={(e) => setOfficerPassword(e.target.value)}
                        placeholder="Enter dispatch password"
                        required
                        className="w-full px-3.5 py-2.5 rounded-lg bg-stone-900/90 border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-stone-500 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* 1-Click Fast Officer Selector */}
                  <div className="pt-2">
                    <div className="text-[11px] font-mono text-stone-400 mb-2 flex items-center gap-1.5">
                      <Shield className="w-3 h-3 text-amber-400" />
                      <span>Municipal Command Officers:</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => handleSelectDemoOfficer('MUN-14-ENG-08')}
                        className={`p-2 rounded-lg border text-left font-mono transition-all cursor-pointer ${
                          officerBadge === 'MUN-14-ENG-08'
                            ? 'bg-amber-950/60 border-amber-400 text-amber-200'
                            : 'bg-stone-900/60 border-white/10 text-stone-300 hover:border-amber-500/40'
                        }`}
                      >
                        <div className="text-[11px] font-bold text-white truncate">Dave Miller</div>
                        <div className="text-[9px] text-amber-400 truncate">Chief Supt · Ward 12-16</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSelectDemoOfficer('MUN-INSPECT-204')}
                        className={`p-2 rounded-lg border text-left font-mono transition-all cursor-pointer ${
                          officerBadge === 'MUN-INSPECT-204'
                            ? 'bg-amber-950/60 border-amber-400 text-amber-200'
                            : 'bg-stone-900/60 border-white/10 text-stone-300 hover:border-amber-500/40'
                        }`}
                      >
                        <div className="text-[11px] font-bold text-white truncate">Elena Ward</div>
                        <div className="text-[9px] text-amber-400 truncate">Safety Inspector</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSelectDemoOfficer('MUN-CORP-101')}
                        className={`p-2 rounded-lg border text-left font-mono transition-all cursor-pointer ${
                          officerBadge === 'MUN-CORP-101'
                            ? 'bg-amber-950/60 border-amber-400 text-amber-200'
                            : 'bg-stone-900/60 border-white/10 text-stone-300 hover:border-amber-500/40'
                        }`}
                      >
                        <div className="text-[11px] font-bold text-white truncate">Kenji Sato</div>
                        <div className="text-[9px] text-amber-400 truncate">Ward Corporator</div>
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-4 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-stone-950 font-mono font-bold text-xs tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all cursor-pointer"
                  >
                    <span>ACCESS MUNICIPAL COMMAND</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </form>
              )}

              {/* MUNICIPAL OFFICER REGISTRATION */}
              {authMode === 'signup' && (
                <form onSubmit={handleOfficerRegister} className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono text-stone-300 mb-1">
                        OFFICER FULL NAME
                      </label>
                      <input
                        type="text"
                        value={regOfficerName}
                        onChange={(e) => setRegOfficerName(e.target.value)}
                        placeholder="e.g. Officer Rachel Zane"
                        required
                        className="w-full px-3 py-2 rounded-lg bg-stone-900/90 border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-stone-300 mb-1">
                        OFFICIAL BADGE ID
                      </label>
                      <input
                        type="text"
                        value={regOfficerBadge}
                        onChange={(e) => setRegOfficerBadge(e.target.value)}
                        placeholder="e.g. MUN-44-ROAD-19"
                        required
                        className="w-full px-3 py-2 rounded-lg bg-stone-900/90 border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-stone-300 mb-1">
                      MUNICIPAL GOVERNMENT EMAIL
                    </label>
                    <input
                      type="email"
                      value={regOfficerEmail}
                      onChange={(e) => setRegOfficerEmail(e.target.value)}
                      placeholder="e.g. r.zane@municipalworks.gov"
                      required
                      className="w-full px-3 py-2 rounded-lg bg-stone-900/90 border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* Officer Dispatch Password Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono text-stone-300 mb-1 flex items-center justify-between">
                        <span>CREATE DISPATCH KEY</span>
                        <span className="text-[10px] text-amber-400 font-mono">Min 4 chars</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showRegOfficerPassword ? 'text' : 'password'}
                          value={regOfficerPassword}
                          onChange={(e) => setRegOfficerPassword(e.target.value)}
                          placeholder="Create secure PIN/pass"
                          required
                          minLength={4}
                          className="w-full px-3 py-2 rounded-lg bg-stone-900/90 border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-amber-400 pr-9"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegOfficerPassword(!showRegOfficerPassword)}
                          className="absolute right-2.5 top-2 text-stone-400 hover:text-white cursor-pointer"
                          aria-label="Toggle password visibility"
                        >
                          {showRegOfficerPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-stone-300 mb-1 flex items-center justify-between">
                        <span>CONFIRM KEY</span>
                        {regOfficerConfirmPassword && regOfficerPassword === regOfficerConfirmPassword && (
                          <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3" /> Matched
                          </span>
                        )}
                        {regOfficerConfirmPassword && regOfficerPassword !== regOfficerConfirmPassword && (
                          <span className="text-[10px] text-rose-400 font-mono">Mismatch</span>
                        )}
                      </label>
                      <input
                        type={showRegOfficerPassword ? 'text' : 'password'}
                        value={regOfficerConfirmPassword}
                        onChange={(e) => setRegOfficerConfirmPassword(e.target.value)}
                        placeholder="Re-type password"
                        required
                        minLength={4}
                        className={`w-full px-3 py-2 rounded-lg bg-stone-900/90 border font-mono text-xs focus:outline-none ${
                          regOfficerConfirmPassword && regOfficerPassword !== regOfficerConfirmPassword
                            ? 'border-rose-500/70 text-white'
                            : 'border-white/15 text-white focus:border-amber-400'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono text-stone-300 mb-1">
                        WARD JURISDICTION
                      </label>
                      <input
                        type="text"
                        value={regOfficerWard}
                        onChange={(e) => setRegOfficerWard(e.target.value)}
                        placeholder="e.g. Ward 12-16 Central District"
                        required
                        className="w-full px-3 py-2 rounded-lg bg-stone-900/90 border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-stone-300 mb-1">
                        CIVIC DEPARTMENT
                      </label>
                      <input
                        type="text"
                        value={regOfficerDept}
                        onChange={(e) => setRegOfficerDept(e.target.value)}
                        placeholder="e.g. Pavement & Drainage Unit"
                        required
                        className="w-full px-3 py-2 rounded-lg bg-stone-900/90 border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-3 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-stone-950 font-mono font-bold text-xs tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all cursor-pointer"
                  >
                    <span>ENROLL MUNICIPAL OFFICER & SIGN IN</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Guest Explore Bypass Button with Traffic Cone Sticker */}
          <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <TrafficConeSticker className="shrink-0 -rotate-6" />
              <span className="text-[11px] font-mono text-stone-400">
                Explore without signing in?
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                hapticFeedback();
                onContinueAsGuest();
              }}
              className="text-xs font-mono font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Explore Public Map as Guest</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </main>

      {/* ========================================================= */}
      {/* 3. RICH FOOTER: WHAT WE PROVIDE & WHAT IS HAPPENING */}
      {/* ========================================================= */}
      <footer className="relative z-20 w-full border-t border-white/10 bg-[#06070b]/95 backdrop-blur-2xl text-stone-400 font-sans px-4 sm:px-8 py-8 sm:py-12 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col gap-8">
          
          {/* Main 4-Column Showcase: About, Capabilities, What is Happening, and Civic Mission */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-xs">
            
            {/* Col 1: About Tesseract */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2 text-white font-mono font-bold tracking-wider">
                <TesseractLogo size={20} glow={false} />
                <span>TESSERACT CIVIC GIS</span>
              </div>
              <p className="text-stone-400 leading-relaxed font-light">
                An autonomous spatial hazard intelligence platform bridging citizens and municipal public works departments for zero-delay urban street remediation.
              </p>
              <div className="flex items-center gap-2 font-mono text-[11px] text-amber-400 pt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span>Continuous Street Diagnostics</span>
              </div>
            </div>

            {/* Col 2: What We Are Providing */}
            <div className="flex flex-col gap-2.5">
              <h4 className="text-white font-mono font-bold uppercase tracking-wider text-[11px] text-cyan-300">
                What We Provide
              </h4>
              <ul className="space-y-1.5 text-stone-400 leading-relaxed">
                <li className="flex items-start gap-1.5">
                  <span className="text-cyan-400 shrink-0">▸</span>
                  <span><strong>Instant 5-Second Logging:</strong> One-tap camera hazard reporting with automated GPS tagging.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-cyan-400 shrink-0">▸</span>
                  <span><strong>Neural Hazard Vision:</strong> Automatic defect classification and severity scoring (1–100).</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-cyan-400 shrink-0">▸</span>
                  <span><strong>Citizen Civic Credits:</strong> Earn verified civic recognition for every hazard logged and confirmed.</span>
                </li>
              </ul>
            </div>

            {/* Col 3: What Is Happening Right Now */}
            <div className="flex flex-col gap-2.5">
              <h4 className="text-white font-mono font-bold uppercase tracking-wider text-[11px] text-emerald-400">
                What Is Happening Live
              </h4>
              <div className="space-y-2 font-mono text-[11px]">
                <div className="p-2.5 rounded-lg bg-stone-900/80 border border-white/5">
                  <div className="flex items-center justify-between text-stone-300 mb-0.5">
                    <span>SECTOR 14 WARD CORRIDOR</span>
                    <span className="text-emerald-400">ONLINE</span>
                  </div>
                  <p className="text-stone-500 text-[10px]">Active road safety surveillance across municipal corridors and pedestrian routes.</p>
                </div>
                <div className="p-2.5 rounded-lg bg-stone-900/80 border border-white/5">
                  <div className="flex items-center justify-between text-stone-300 mb-0.5">
                    <span>MUNICIPAL QUEUE DISPATCH</span>
                    <span className="text-amber-400">ROUTING</span>
                  </div>
                  <p className="text-stone-500 text-[10px]">Auto-generating municipal work orders for emergency road repair crews.</p>
                </div>
              </div>
            </div>

            {/* Col 4: Philosophical Quote & Telemetry */}
            <div className="flex flex-col gap-2.5">
              <h4 className="text-white font-mono font-bold uppercase tracking-wider text-[11px] text-cyan-300">
                Civic Principle
              </h4>
              <div className="p-3 rounded-xl bg-stone-900/70 border border-white/5 italic font-sans text-stone-300 text-[11px] leading-relaxed">
                “Safe roads aren’t merely concrete and asphalt; they are peace of mind for every citizen returning home after dark.”
              </div>
              <div className="flex items-center gap-2 pt-1 font-mono text-[10px] text-stone-500">
                <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                <span>35.6762° N, 139.6503° E · WARDS 12–16</span>
              </div>
            </div>

          </div>

          {/* Sub-Footer Bar */}
          <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 font-mono text-[11px] text-stone-500">
            <div className="flex items-center gap-3">
              <span>© 2026 TESSERACT CIVIC HAZARD INTELLIGENCE NETWORK</span>
              <span className="text-stone-700 hidden sm:inline">·</span>
              <span className="text-emerald-400 hidden sm:inline">ALL SYSTEMS NOMINAL</span>
            </div>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => {
                  setShowAiSpecs(true);
                  hapticFeedback();
                }}
                className="text-stone-400 hover:text-amber-300 transition-colors cursor-pointer"
              >
                [ EXPLORE CIVIL SYSTEM ARCHITECTURE ]
              </button>
              <span className="text-stone-700">|</span>
              <span className="text-stone-400">PUBLIC WORKS INFRASTRUCTURE</span>
            </div>
          </div>

        </div>
      </footer>

      {/* ========================================================= */}
      {/* 4. MODAL: AI SPECIFICATIONS & ARCHITECTURE BREAKDOWN      */}
      {/* ========================================================= */}
      {showAiSpecs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]">
          <div className="w-full max-w-2xl bg-[#090b14] border border-amber-500/40 rounded-2xl p-6 sm:p-8 shadow-[0_0_60px_rgba(245,158,11,0.25)] relative max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setShowAiSpecs(false)}
              className="absolute top-5 right-5 p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-2">
              <HardHat className="w-5 h-5 text-amber-400" />
              <h3 className="text-base sm:text-lg font-bold font-mono text-white">
                TESSERACT CIVIL AI SPECIFICATIONS & ARCHITECTURE
              </h3>
            </div>
            <p className="text-xs text-stone-400 font-mono mb-6">
              CIVIC SYSTEM ARCHITECTURE // MULTI-AGENT ROAD SAFETY ENGINE
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              
              {/* Feature 1 */}
              <div className="p-4 rounded-xl bg-stone-900/80 border border-white/10">
                <div className="flex items-center gap-2 text-amber-400 font-bold mb-1.5">
                  <span className="px-1.5 py-0.2 bg-amber-950 rounded border border-amber-800 text-[10px]">01</span>
                  <span>Computer Vision Diagnostics</span>
                </div>
                <p className="text-stone-300 leading-relaxed text-[11px]">
                  Real-time photo inference identifying potholes, open manholes, dangling live wires, and waterlogging. Extracts defect bounding boxes and assigns safety hazard severity scores (1-100).
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-4 rounded-xl bg-stone-900/80 border border-white/10">
                <div className="flex items-center gap-2 text-cyan-400 font-bold mb-1.5">
                  <span className="px-1.5 py-0.2 bg-cyan-950 rounded border border-cyan-800 text-[10px]">02</span>
                  <span>4D Geospatial Risk Matrix</span>
                </div>
                <p className="text-stone-300 leading-relaxed text-[11px]">
                  Projects high-risk clusters onto citizen and pedestrian transit pathways. Correlates street lighting, weather precipitation, and foot traffic to calculate dynamic commuter safety ratings.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-4 rounded-xl bg-stone-900/80 border border-white/10">
                <div className="flex items-center gap-2 text-amber-400 font-bold mb-1.5">
                  <span className="px-1.5 py-0.2 bg-amber-950 rounded border border-amber-800 text-[10px]">03</span>
                  <span>Autonomous Municipal Triage</span>
                </div>
                <p className="text-stone-300 leading-relaxed text-[11px]">
                  Translates citizen hazard reports directly into municipal work orders. Assigns priority clearance levels and dispatches emergency road crews to targeted GPS coordinates.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="p-4 rounded-xl bg-stone-900/80 border border-white/10">
                <div className="flex items-center gap-2 text-emerald-400 font-bold mb-1.5">
                  <span className="px-1.5 py-0.2 bg-emerald-950 rounded border border-emerald-800 text-[10px]">04</span>
                  <span>Proof-of-Repair Verifier</span>
                </div>
                <p className="text-stone-300 leading-relaxed text-[11px]">
                  Differential visual verification comparing Before-and-After remediation photos. Once confirmed by AI and ward officers, cases close and citizen reporters earn civic credits.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-[11px] font-mono text-stone-500">
                Engine: Gemini Vision Pro + Three.js 4D Projection
              </span>
              <button
                onClick={() => setShowAiSpecs(false)}
                className="px-4 py-1.5 rounded-lg bg-amber-400 text-stone-950 font-mono font-bold text-xs hover:bg-amber-300 transition-colors cursor-pointer"
              >
                Close Specs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
