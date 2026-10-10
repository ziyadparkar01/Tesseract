import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  StudentProfile,
  MunicipalOfficerProfile,
  StudentAuthSession,
  UserRole,
} from '../types';
import { studentAuthService } from '../services/studentAuthService';
import { hapticFeedback } from '../utils/haptics';
import {
  X,
  User,
  School,
  Mail,
  Key,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Zap,
  ArrowRight,
  LogOut,
  Shield,
  Building2,
  BadgeAlert,
  HardHat,
  Award,
  Layers,
} from 'lucide-react';

interface Tesseract3DLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: () => void;
  onNavigateToQueue?: () => void;
}

export const Tesseract3DLoginModal: React.FC<Tesseract3DLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onNavigateToQueue,
}) => {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const burstTriggerRef = useRef<(() => void) | null>(null);
  const setCubeColorRef = useRef<((colorHex: string) => void) | null>(null);

  const [session, setSession] = useState<StudentAuthSession>(
    studentAuthService.getSession()
  );

  // Role selector tab: 'citizen' vs 'municipality'
  const [roleTab, setRoleTab] = useState<'citizen' | 'municipality'>(
    session.role === 'MUNICIPALITY_OFFICER' ? 'municipality' : 'citizen'
  );

  // Auth mode: 'signin' vs 'register'
  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin');

  // --- CITIZEN FORM STATES ---
  const [citizenId, setCitizenId] = useState('TSR-2026-8942');
  const [citizenPass, setCitizenPass] = useState('pass1234');
  const [regCitizenName, setRegCitizenName] = useState('');
  const [regCitizenId, setRegCitizenId] = useState('');
  const [regCitizenEmail, setRegCitizenEmail] = useState('');
  const [regCitizenPass, setRegCitizenPass] = useState('');
  const [regCitizenUni, setRegCitizenUni] = useState('Tokyo Institute of Technology');
  const [regCitizenDept, setRegCitizenDept] = useState('Urban Planning & Geospatial Informatics');

  // --- MUNICIPALITY OFFICER FORM STATES ---
  const [officerBadgeId, setOfficerBadgeId] = useState('MUN-14-ENG-08');
  const [officerPass, setOfficerPass] = useState('dispatch2026');
  const [regOfficerName, setRegOfficerName] = useState('');
  const [regOfficerBadge, setRegOfficerBadge] = useState('');
  const [regOfficerEmail, setRegOfficerEmail] = useState('');
  const [regOfficerPass, setRegOfficerPass] = useState('');
  const [regOfficerWard, setRegOfficerWard] = useState('Ward 12-16 Central Municipal District');
  const [regOfficerDept, setRegOfficerDept] = useState('Emergency Road Works & Drainage Squad');
  const [regOfficerTitle, setRegOfficerTitle] = useState('Municipal Dispatch Officer');

  // Feedback states
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsub = studentAuthService.subscribe((s) => {
      setSession(s);
      if (s.role === 'MUNICIPALITY_OFFICER') {
        setRoleTab('municipality');
      }
    });
    return () => unsub();
  }, []);

  // Update 3D cube color on role tab change
  useEffect(() => {
    if (setCubeColorRef.current) {
      if (roleTab === 'municipality') {
        setCubeColorRef.current('#f59e0b'); // Radiant amber for Municipal Emergency Works
      } else {
        setCubeColorRef.current('#38bdf8'); // Cosmic cyan for Citizens
      }
    }
  }, [roleTab]);

  // 3D Three.js Tesseract Bursting Canvas
  useEffect(() => {
    if (!isOpen || !canvasContainerRef.current) return;

    const container = canvasContainerRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.z = 4.2;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    const tesseractGroup = new THREE.Group();
    scene.add(tesseractGroup);

    // Dynamic initial color based on active role
    const initialHex = roleTab === 'municipality' ? '#f59e0b' : '#38bdf8';
    const primaryColor = new THREE.Color(initialHex);

    // 1. Outer Translucent Crystalline Cube
    const outerGeo = new THREE.BoxGeometry(1.6, 1.6, 1.6);
    const outerMat = new THREE.MeshPhysicalMaterial({
      color: primaryColor,
      emissive: primaryColor,
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.38,
      roughness: 0.08,
      transmission: 0.75,
      ior: 1.5,
    });
    const outerMesh = new THREE.Mesh(outerGeo, outerMat);
    tesseractGroup.add(outerMesh);

    // Outer Edge Lines
    const outerEdges = new THREE.EdgesGeometry(outerGeo);
    const outerLineMat = new THREE.LineBasicMaterial({
      color: new THREE.Color(roleTab === 'municipality' ? '#fde68a' : '#7dd3fc'),
      transparent: true,
      opacity: 0.95,
      linewidth: 2,
    });
    const outerLine = new THREE.LineSegments(outerEdges, outerLineMat);
    tesseractGroup.add(outerLine);

    // 2. Inner Hypercube
    const innerGeo = new THREE.BoxGeometry(0.85, 0.85, 0.85);
    const innerMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#ffffff'),
      transparent: true,
      opacity: 0.75,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    tesseractGroup.add(innerMesh);

    const innerEdges = new THREE.EdgesGeometry(innerGeo);
    const innerLineMat = new THREE.LineBasicMaterial({
      color: new THREE.Color('#ffffff'),
      transparent: true,
      opacity: 1,
    });
    const innerLine = new THREE.LineSegments(innerEdges, innerLineMat);
    tesseractGroup.add(innerLine);

    // 3. Hyper-dimensional vertex struts
    const strutPoints: THREE.Vector3[] = [];
    const corners = [
      [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
      [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]
    ];
    corners.forEach(([x, y, z]) => {
      strutPoints.push(new THREE.Vector3(x * 0.8, y * 0.8, z * 0.8));
      strutPoints.push(new THREE.Vector3(x * 0.425, y * 0.425, z * 0.425));
    });
    const strutGeo = new THREE.BufferGeometry().setFromPoints(strutPoints);
    const strutMat = new THREE.LineBasicMaterial({
      color: primaryColor,
      transparent: true,
      opacity: 0.85,
    });
    const struts = new THREE.LineSegments(strutGeo, strutMat);
    tesseractGroup.add(struts);

    // 4. Bursting Cosmic Energy Particles (800 particles)
    const particleCount = 800;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities = new Float32Array(particleCount * 3);
    const particleOriginals = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const rad = 0.2 + Math.random() * 0.9;

      const px = rad * Math.sin(phi) * Math.cos(theta);
      const py = rad * Math.sin(phi) * Math.sin(theta);
      const pz = rad * Math.cos(phi);

      particlePositions[i * 3] = px;
      particlePositions[i * 3 + 1] = py;
      particlePositions[i * 3 + 2] = pz;

      particleOriginals[i * 3] = px;
      particleOriginals[i * 3 + 1] = py;
      particleOriginals[i * 3 + 2] = pz;

      particleVelocities[i * 3] = (px / (rad || 1)) * (0.02 + Math.random() * 0.05);
      particleVelocities[i * 3 + 1] = (py / (rad || 1)) * (0.02 + Math.random() * 0.05);
      particleVelocities[i * 3 + 2] = (pz / (rad || 1)) * (0.02 + Math.random() * 0.05);
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: primaryColor,
      size: 0.045,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    tesseractGroup.add(particles);

    // 5. Bursting Shockwave Rings
    const ringCount = 3;
    const rings: THREE.Mesh[] = [];
    for (let i = 0; i < ringCount; i++) {
      const ringGeo = new THREE.RingGeometry(0.1, 0.16, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: primaryColor,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      tesseractGroup.add(ring);
      rings.push(ring);
    }

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);

    const coreLight = new THREE.PointLight(primaryColor, 4, 15);
    coreLight.position.set(0, 0, 0);
    scene.add(coreLight);

    // Dynamic color changer
    setCubeColorRef.current = (colorHex: string) => {
      const col = new THREE.Color(colorHex);
      outerMat.color = col;
      outerMat.emissive = col;
      outerLineMat.color = col;
      strutMat.color = col;
      particleMat.color = col;
      coreLight.color = col;
      rings.forEach((r) => {
        (r.material as THREE.MeshBasicMaterial).color = col;
      });
      if (burstTriggerRef.current) burstTriggerRef.current();
    };

    // Burst logic
    let isBursting = false;
    let burstProgress = 0;

    const triggerBurst = () => {
      isBursting = true;
      burstProgress = 0;
      try {
        hapticFeedback();
      } catch (_) {}
    };
    burstTriggerRef.current = triggerBurst;
    setTimeout(triggerBurst, 250);

    // Mouse movement
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let time = 0;
    const animate = () => {
      time += 0.02;

      tesseractGroup.rotation.y += 0.012;
      tesseractGroup.rotation.x = THREE.MathUtils.lerp(
        tesseractGroup.rotation.x,
        mouseY * 0.4 + Math.sin(time * 0.5) * 0.1,
        0.05
      );
      tesseractGroup.rotation.z = THREE.MathUtils.lerp(
        tesseractGroup.rotation.z,
        -mouseX * 0.4 + Math.cos(time * 0.4) * 0.1,
        0.05
      );

      innerMesh.rotation.y -= 0.025;
      innerMesh.rotation.x += 0.018;
      innerLine.rotation.y -= 0.025;
      innerLine.rotation.x += 0.018;

      if (isBursting) {
        burstProgress += 0.025;
        const burstScale = 1 + Math.sin(burstProgress * Math.PI) * 0.35;
        tesseractGroup.scale.set(burstScale, burstScale, burstScale);

        rings.forEach((ring, index) => {
          const ringOffset = burstProgress - index * 0.15;
          if (ringOffset > 0 && ringOffset < 1) {
            const scale = 1 + ringOffset * 8;
            ring.scale.set(scale, scale, 1);
            (ring.material as THREE.MeshBasicMaterial).opacity = Math.sin(ringOffset * Math.PI) * 0.8;
          } else {
            (ring.material as THREE.MeshBasicMaterial).opacity = 0;
          }
        });

        const positions = particleGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < particleCount; i++) {
          positions[i * 3] += particleVelocities[i * 3] * 3;
          positions[i * 3 + 1] += particleVelocities[i * 3 + 1] * 3;
          positions[i * 3 + 2] += particleVelocities[i * 3 + 2] * 3;
        }
        particleGeo.attributes.position.needsUpdate = true;

        if (burstProgress >= 1) isBursting = false;
      } else {
        const positions = particleGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < particleCount; i++) {
          positions[i * 3] = THREE.MathUtils.lerp(positions[i * 3], particleOriginals[i * 3], 0.04);
          positions[i * 3 + 1] = THREE.MathUtils.lerp(positions[i * 3 + 1], particleOriginals[i * 3 + 1], 0.04);
          positions[i * 3 + 2] = THREE.MathUtils.lerp(positions[i * 3 + 2], particleOriginals[i * 3 + 2], 0.04);
        }
        particleGeo.attributes.position.needsUpdate = true;
        tesseractGroup.scale.lerp(new THREE.Vector3(1, 1, 1), 0.08);

        rings.forEach((ring) => {
          (ring.material as THREE.MeshBasicMaterial).opacity = 0;
        });
      }

      renderer.render(scene, camera);
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      outerGeo.dispose();
      outerMat.dispose();
      outerEdges.dispose();
      outerLineMat.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      innerEdges.dispose();
      innerLineMat.dispose();
      strutGeo.dispose();
      strutMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isOpen, roleTab]);

  if (!isOpen) return null;

  // --- SUBMISSION HANDLERS ---

  const handleCitizenLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);
    if (burstTriggerRef.current) burstTriggerRef.current();

    try {
      const res = studentAuthService.login(citizenId, citizenPass);
      if (!res.success) {
        setErrorMsg(res.error || 'Invalid credentials.');
      } else {
        setSuccessMsg('Citizen session authenticated.');
        onLoginSuccess?.();
        setTimeout(onClose, 600);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOfficerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);
    if (burstTriggerRef.current) burstTriggerRef.current();

    try {
      const res = studentAuthService.loginAsOfficer(officerBadgeId, officerPass);
      if (!res.success) {
        setErrorMsg(res.error || 'Invalid Municipal Officer credentials.');
      } else {
        setSuccessMsg('Municipal Officer credentials verified. Dispatch clearance active.');
        onLoginSuccess?.();
        setTimeout(() => {
          onClose();
          onNavigateToQueue?.();
        }, 650);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Officer verification error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCitizenRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);
    if (burstTriggerRef.current) burstTriggerRef.current();

    try {
      const id = regCitizenId.trim() || `CTZ-${Math.floor(1000 + Math.random() * 9000)}`;
      const res = studentAuthService.register({
        fullName: regCitizenName,
        studentIdNumber: id,
        email: regCitizenEmail,
        password: regCitizenPass || 'pass1234',
        university: regCitizenUni,
        department: regCitizenDept,
      });

      if (!res.success) {
        setErrorMsg(res.error || 'Registration failed.');
      } else {
        setSuccessMsg('Citizen account created and verified.');
        onLoginSuccess?.();
        setTimeout(onClose, 650);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOfficerRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);
    if (burstTriggerRef.current) burstTriggerRef.current();

    try {
      const badge = regOfficerBadge.trim() || `MUN-14-ENG-${Math.floor(10 + Math.random() * 90)}`;
      const res = studentAuthService.registerOfficer({
        fullName: regOfficerName,
        badgeNumber: badge,
        officialEmail: regOfficerEmail,
        password: regOfficerPass || 'dispatch2026',
        wardJurisdiction: regOfficerWard,
        department: regOfficerDept,
        designation: regOfficerTitle,
      });

      if (!res.success) {
        setErrorMsg(res.error || 'Officer enrollment failed.');
      } else {
        setSuccessMsg('Municipal officer enrolled with Level 2 dispatch clearance.');
        onLoginSuccess?.();
        setTimeout(() => {
          onClose();
          onNavigateToQueue?.();
        }, 650);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Enrollment error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCitizenDemo = (demoId: string) => {
    if (burstTriggerRef.current) burstTriggerRef.current();
    studentAuthService.loginAsDemo(demoId);
    setSuccessMsg('Signed in as demo citizen surveyor.');
    onLoginSuccess?.();
    setTimeout(onClose, 550);
  };

  const handleOfficerDemo = (badge: string) => {
    if (burstTriggerRef.current) burstTriggerRef.current();
    studentAuthService.loginOfficerDemo(badge);
    setSuccessMsg('Signed in as verified municipal officer.');
    onLoginSuccess?.();
    setTimeout(() => {
      onClose();
      onNavigateToQueue?.();
    }, 600);
  };

  const handleLogout = () => {
    if (burstTriggerRef.current) burstTriggerRef.current();
    studentAuthService.logout();
    setSuccessMsg(null);
    setErrorMsg(null);
  };

  const currentStudent = session.student;
  const currentOfficer = session.officer;
  const isOfficerLogged = session.role === 'MUNICIPALITY_OFFICER' && Boolean(currentOfficer);

  const studentDemoList = studentAuthService.getAllRegisteredStudents();
  const officerDemoList = studentAuthService.getAllOfficers();

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-stone-950/85 backdrop-blur-md animate-[fadeIn_0.25s_ease-out]"
    >
      {/* 3D TESSERACT BURSTING THREE.JS CANVAS BACKGROUND */}
      <div
        ref={canvasContainerRef}
        className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
      />

      {/* FLOATING ARCHITECTURAL DUAL-PORTAL AUTH CARD */}
      <div
        className={`relative z-10 w-full max-w-xl bg-[#0c0e15]/95 border rounded-2xl shadow-2xl p-6 sm:p-8 backdrop-blur-2xl transition-all ${
          roleTab === 'municipality'
            ? 'border-amber-500/40 shadow-[0_0_55px_rgba(245,158,11,0.25)]'
            : 'border-cyan-500/35 shadow-[0_0_55px_rgba(56,189,248,0.25)]'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => burstTriggerRef.current && burstTriggerRef.current()}
              title="Click to trigger Tesseract Energy Burst"
              className={`w-10 h-10 rounded-xl border flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all ${
                roleTab === 'municipality'
                  ? 'bg-amber-950/50 border-amber-400/60 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                  : 'bg-cyan-950/50 border-cyan-400/60 text-cyan-300 shadow-[0_0_15px_rgba(56,189,248,0.4)]'
              }`}
            >
              <Zap className="w-5 h-5 stroke-[2.5] animate-pulse" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold tracking-wider text-sm text-white">
                  TESSERACT
                </span>
                <span className="text-stone-600">/</span>
                <span
                  className={`font-mono text-xs font-semibold ${
                    roleTab === 'municipality' ? 'text-amber-400' : 'text-cyan-400'
                  }`}
                >
                  {roleTab === 'municipality' ? 'MUNICIPALITY DISPATCH' : 'CITIZEN RADAR'}
                </span>
              </div>
              <div className="text-[10px] font-mono text-stone-400 uppercase">
                CIVIC DUAL-ROLE AUTHENTICATION GATEWAY
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center border border-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* PRIMARY ROLE SWITCHER: CITIZEN VS MUNICIPALITY */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-stone-950 rounded-xl border border-stone-800 mb-5 font-mono text-xs">
          <button
            type="button"
            onClick={() => {
              setRoleTab('citizen');
              setErrorMsg(null);
              setSuccessMsg(null);
              hapticFeedback();
            }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all cursor-pointer ${
              roleTab === 'citizen'
                ? 'bg-cyan-950 text-cyan-200 border border-cyan-500/50 font-bold shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>01 / CITIZEN</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setRoleTab('municipality');
              setErrorMsg(null);
              setSuccessMsg(null);
              hapticFeedback();
            }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all cursor-pointer ${
              roleTab === 'municipality'
                ? 'bg-amber-950 text-amber-200 border border-amber-500/50 font-bold shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>02 / MUNICIPALITY DISPATCH</span>
          </button>
        </div>

        {/* Feedback messages */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2 font-mono">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2 font-mono">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ==================== ACTIVE SESSION VIEW ==================== */}
        {(isOfficerLogged && roleTab === 'municipality') || (currentStudent && roleTab === 'citizen' && !isOfficerLogged) ? (
          <div className="space-y-5">
            {/* Active Municipality Officer Card */}
            {isOfficerLogged && currentOfficer && (
              <div className="p-5 rounded-xl bg-gradient-to-br from-[#1a140a] via-stone-900 to-[#0e1017] border border-amber-500/40 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest flex items-center gap-1.5 font-bold">
                    <Shield className="w-3.5 h-3.5 text-amber-400" />
                    <span>MUNICIPAL OFFICER CLEARANCE ACTIVE</span>
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 border border-amber-500/50 text-amber-300">
                    {currentOfficer.clearanceLevel.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-amber-900 to-stone-800 border border-amber-400/60 flex items-center justify-center font-mono font-bold text-xl text-amber-300 shadow">
                    {currentOfficer.avatarSeed}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-lg font-bold text-white truncate">
                      {currentOfficer.fullName}
                    </div>
                    <div className="text-xs font-mono text-amber-300 truncate">
                      {currentOfficer.badgeNumber} · {currentOfficer.designation}
                    </div>
                    <div className="text-xs text-stone-300 truncate mt-0.5">
                      {currentOfficer.wardJurisdiction}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-amber-950/60 font-mono text-xs">
                  <div>
                    <span className="text-stone-500 block text-[10px]">CREW SQUAD</span>
                    <span className="text-stone-200 font-semibold truncate block">
                      {currentOfficer.assignedCrewUnit || 'Works Squad #04'}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-500 block text-[10px]">EMERGENCY DISPATCHES</span>
                    <span className="text-amber-400 font-bold">{currentOfficer.dispatchesCount} DISPATCHED</span>
                  </div>
                </div>
              </div>
            )}

            {/* Active Citizen / Student Card */}
            {!isOfficerLogged && currentStudent && (
              <div className="p-5 rounded-xl bg-gradient-to-br from-[#0c1824] via-stone-900 to-[#0c0d12] border border-cyan-500/40 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold">
                    CITIZEN SURVEYOR CREDENTIAL
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 border border-cyan-500/50 text-cyan-300">
                    {currentStudent.civicCredits} CIVIC CR
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-cyan-900 to-stone-800 border border-cyan-400/60 flex items-center justify-center font-mono font-bold text-xl text-cyan-300 shadow">
                    {currentStudent.avatarSeed}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-lg font-bold text-white truncate">
                      {currentStudent.fullName}
                    </div>
                    <div className="text-xs font-mono text-cyan-400 truncate">
                      {currentStudent.studentIdNumber}
                    </div>
                    <div className="text-xs text-stone-300 truncate">
                      {currentStudent.department} · {currentStudent.university}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              {isOfficerLogged && onNavigateToQueue && (
                <button
                  onClick={() => {
                    onClose();
                    onNavigateToQueue();
                  }}
                  className="flex-1 py-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-[0_0_20px_rgba(245,158,11,0.4)]"
                >
                  OPEN MUNICIPAL DISPATCH QUEUE
                </button>
              )}
              {!isOfficerLogged && (
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-stone-950 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow"
                >
                  RETURN TO HAZARD RADAR
                </button>
              )}
              <button
                onClick={handleLogout}
                className="px-4 py-2.5 rounded-lg bg-stone-900 hover:bg-rose-950 border border-stone-700 hover:border-rose-700 text-stone-300 hover:text-rose-300 font-mono text-xs transition-colors cursor-pointer"
              >
                DISCONNECT
              </button>
            </div>
          </div>
        ) : (
          /* ==================== LOGIN / REGISTRATION FORMS ==================== */
          <div className="space-y-4">
            {/* Sub-mode: Sign In vs Register */}
            <div className="flex items-center bg-stone-950/80 p-1 rounded-xl border border-stone-800 font-mono text-xs">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  setErrorMsg(null);
                  if (burstTriggerRef.current) burstTriggerRef.current();
                }}
                className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                  authMode === 'signin'
                    ? roleTab === 'municipality'
                      ? 'bg-amber-950 text-amber-200 font-bold border border-amber-500/40 shadow-sm'
                      : 'bg-cyan-950 text-cyan-200 font-bold border border-cyan-500/40 shadow-sm'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                SIGN IN
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setErrorMsg(null);
                  if (burstTriggerRef.current) burstTriggerRef.current();
                }}
                className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                  authMode === 'register'
                    ? roleTab === 'municipality'
                      ? 'bg-amber-950 text-amber-200 font-bold border border-amber-500/40 shadow-sm'
                      : 'bg-cyan-950 text-cyan-200 font-bold border border-cyan-500/40 shadow-sm'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                {roleTab === 'municipality' ? 'ENROLL OFFICER' : 'REGISTER CITIZEN'}
              </button>
            </div>

            {/* 1. MUNICIPALITY SIGN IN */}
            {roleTab === 'municipality' && authMode === 'signin' && (
              <form onSubmit={handleOfficerLogin} className="space-y-4 text-xs font-mono">
                <div>
                  <label className="block text-stone-400 text-[10px] uppercase mb-1">
                    OFFICER BADGE ID OR MUNICIPAL EMAIL *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={officerBadgeId}
                      onChange={(e) => setOfficerBadgeId(e.target.value)}
                      placeholder="e.g. MUN-14-ENG-08 or dave.miller@municipalworks.gov"
                      className="w-full bg-stone-950 border border-stone-800 focus:border-amber-400 rounded-lg px-3.5 py-2.5 text-stone-100 placeholder-stone-600 focus:outline-none transition-colors"
                    />
                    <Building2 className="absolute right-3 top-2.5 w-4 h-4 text-stone-600" />
                  </div>
                </div>

                <div>
                  <label className="block text-stone-400 text-[10px] uppercase mb-1">
                    OFFICIAL DISPATCH PASSPHRASE
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={officerPass}
                      onChange={(e) => setOfficerPass(e.target.value)}
                      className="w-full bg-stone-950 border border-stone-800 focus:border-amber-400 rounded-lg px-3.5 py-2.5 text-stone-100 placeholder-stone-600 focus:outline-none transition-colors"
                    />
                    <Key className="absolute right-3 top-2.5 w-4 h-4 text-stone-600" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-lg bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-[0_0_20px_rgba(245,158,11,0.4)]"
                >
                  {isSubmitting ? 'VERIFYING CREDENTIALS...' : 'ACCESS MUNICIPAL DISPATCH'}
                </button>

                {/* Instant Officer Demo Credentials */}
                <div className="pt-2 border-t border-stone-800">
                  <div className="text-[10px] text-stone-500 uppercase mb-2 flex items-center justify-between">
                    <span>1-CLICK DEMO MUNICIPAL OFFICERS</span>
                    <span className="text-amber-400 font-bold">INSTANT</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {officerDemoList.map((off) => (
                      <button
                        key={off.id}
                        type="button"
                        onClick={() => handleOfficerDemo(off.badgeNumber)}
                        className="p-2.5 rounded-lg bg-stone-900 hover:bg-stone-850 border border-stone-800 hover:border-amber-500/60 text-left transition-colors cursor-pointer"
                      >
                        <div className="font-bold text-white text-[11px] truncate">{off.fullName}</div>
                        <div className="text-[9px] text-amber-400 truncate">{off.badgeNumber}</div>
                        <div className="text-[8px] text-stone-400 truncate mt-0.5">{off.department.split('&')[0]}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </form>
            )}

            {/* 2. MUNICIPALITY REGISTER / ENROLL */}
            {roleTab === 'municipality' && authMode === 'register' && (
              <form onSubmit={handleOfficerRegister} className="space-y-3.5 text-xs font-mono">
                <div>
                  <label className="block text-stone-400 text-[10px] uppercase mb-1">
                    OFFICER FULL NAME *
                  </label>
                  <input
                    type="text"
                    required
                    value={regOfficerName}
                    onChange={(e) => setRegOfficerName(e.target.value)}
                    placeholder="e.g. Officer Dave Miller"
                    className="w-full bg-stone-950 border border-stone-800 focus:border-amber-400 rounded-lg px-3 py-2 text-stone-100 placeholder-stone-600 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-400 text-[10px] uppercase mb-1">
                      BADGE NUMBER *
                    </label>
                    <input
                      type="text"
                      required
                      value={regOfficerBadge}
                      onChange={(e) => setRegOfficerBadge(e.target.value)}
                      placeholder="e.g. MUN-14-ENG-08"
                      className="w-full bg-stone-950 border border-stone-800 focus:border-amber-400 rounded-lg px-3 py-2 text-stone-100 placeholder-stone-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-400 text-[10px] uppercase mb-1">
                      GOVERNMENT EMAIL *
                    </label>
                    <input
                      type="email"
                      required
                      value={regOfficerEmail}
                      onChange={(e) => setRegOfficerEmail(e.target.value)}
                      placeholder="e.g. dave@municipal.gov"
                      className="w-full bg-stone-950 border border-stone-800 focus:border-amber-400 rounded-lg px-3 py-2 text-stone-100 placeholder-stone-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-stone-400 text-[10px] uppercase mb-1">
                    CREATE DISPATCH PASSPHRASE *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={4}
                    value={regOfficerPass}
                    onChange={(e) => setRegOfficerPass(e.target.value)}
                    placeholder="Create dispatch password (min 4 chars)"
                    className="w-full bg-stone-950 border border-stone-800 focus:border-amber-400 rounded-lg px-3 py-2 text-stone-100 placeholder-stone-600 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-400 text-[10px] uppercase mb-1">
                      WARD JURISDICTION
                    </label>
                    <input
                      type="text"
                      value={regOfficerWard}
                      onChange={(e) => setRegOfficerWard(e.target.value)}
                      className="w-full bg-stone-950 border border-stone-800 focus:border-amber-400 rounded-lg px-3 py-2 text-stone-200 text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-400 text-[10px] uppercase mb-1">
                      DESIGNATION TITLE
                    </label>
                    <input
                      type="text"
                      value={regOfficerTitle}
                      onChange={(e) => setRegOfficerTitle(e.target.value)}
                      className="w-full bg-stone-950 border border-stone-800 focus:border-amber-400 rounded-lg px-3 py-2 text-stone-200 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-lg bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-[0_0_20px_rgba(245,158,11,0.4)]"
                >
                  {isSubmitting ? 'ENROLLING OFFICER...' : 'ENROLL WITH LEVEL 2 CLEARANCE'}
                </button>
              </form>
            )}

            {/* 3. CITIZEN SIGN IN */}
            {roleTab === 'citizen' && authMode === 'signin' && (
              <form onSubmit={handleCitizenLogin} className="space-y-4 text-xs font-mono">
                <div>
                  <label className="block text-stone-400 text-[10px] uppercase mb-1">
                    CITIZEN ID OR RESIDENT EMAIL *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={citizenId}
                      onChange={(e) => setCitizenId(e.target.value)}
                      placeholder="e.g. TSR-2026-8942 or citizen@example.com"
                      className="w-full bg-stone-950 border border-stone-800 focus:border-cyan-400 rounded-lg px-3.5 py-2.5 text-stone-100 placeholder-stone-600 focus:outline-none transition-colors"
                    />
                    <User className="absolute right-3 top-2.5 w-4 h-4 text-stone-600" />
                  </div>
                </div>

                <div>
                  <label className="block text-stone-400 text-[10px] uppercase mb-1">
                    PASSWORD / KEY
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={citizenPass}
                      onChange={(e) => setCitizenPass(e.target.value)}
                      className="w-full bg-stone-950 border border-stone-800 focus:border-cyan-400 rounded-lg px-3.5 py-2.5 text-stone-100 placeholder-stone-600 focus:outline-none transition-colors"
                    />
                    <Key className="absolute right-3 top-2.5 w-4 h-4 text-stone-600" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-[0_0_20px_rgba(56,189,248,0.4)]"
                >
                  {isSubmitting ? 'AUTHENTICATING...' : 'ACCESS CITIZEN PORTAL'}
                </button>

                {/* Instant Citizen Demo Logins */}
                <div className="pt-2 border-t border-stone-800">
                  <div className="text-[10px] text-stone-500 uppercase mb-2 flex items-center justify-between">
                    <span>1-CLICK DEMO CITIZENS</span>
                    <span className="text-cyan-400 font-bold">INSTANT</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {studentDemoList.map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => handleCitizenDemo(st.studentIdNumber)}
                        className="p-2 rounded-lg bg-stone-900 hover:bg-stone-850 border border-stone-800 hover:border-cyan-500/50 text-left transition-colors cursor-pointer"
                      >
                        <div className="font-bold text-white text-[11px] truncate">{st.fullName.split(' ')[0]}</div>
                        <div className="text-[9px] text-cyan-400 truncate">{st.studentIdNumber}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </form>
            )}

            {/* 4. CITIZEN REGISTER */}
            {roleTab === 'citizen' && authMode === 'register' && (
              <form onSubmit={handleCitizenRegister} className="space-y-3.5 text-xs font-mono">
                <div>
                  <label className="block text-stone-400 text-[10px] uppercase mb-1">
                    FULL CITIZEN NAME *
                  </label>
                  <input
                    type="text"
                    required
                    value={regCitizenName}
                    onChange={(e) => setRegCitizenName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="w-full bg-stone-950 border border-stone-800 focus:border-cyan-400 rounded-lg px-3 py-2 text-stone-100 placeholder-stone-600 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-400 text-[10px] uppercase mb-1">
                      CITIZEN ID / RESIDENT ID *
                    </label>
                    <input
                      type="text"
                      required
                      value={regCitizenId}
                      onChange={(e) => setRegCitizenId(e.target.value)}
                      placeholder="e.g. CTZ-2026-8942"
                      className="w-full bg-stone-950 border border-stone-800 focus:border-cyan-400 rounded-lg px-3 py-2 text-stone-100 placeholder-stone-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-400 text-[10px] uppercase mb-1">
                      CITIZEN EMAIL *
                    </label>
                    <input
                      type="email"
                      required
                      value={regCitizenEmail}
                      onChange={(e) => setRegCitizenEmail(e.target.value)}
                      placeholder="e.g. alex.morgan@example.com"
                      className="w-full bg-stone-950 border border-stone-800 focus:border-cyan-400 rounded-lg px-3 py-2 text-stone-100 placeholder-stone-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-stone-400 text-[10px] uppercase mb-1">
                    CREATE PASSWORD *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={4}
                    value={regCitizenPass}
                    onChange={(e) => setRegCitizenPass(e.target.value)}
                    placeholder="Create secure password (min 4 chars)"
                    className="w-full bg-stone-950 border border-stone-800 focus:border-cyan-400 rounded-lg px-3 py-2 text-stone-100 placeholder-stone-600 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-400 text-[10px] uppercase mb-1">
                      RESIDENTIAL WARD
                    </label>
                    <input
                      type="text"
                      value={regCitizenUni}
                      onChange={(e) => setRegCitizenUni(e.target.value)}
                      placeholder="e.g. Ward 14 Metro District"
                      className="w-full bg-stone-950 border border-stone-800 focus:border-cyan-400 rounded-lg px-2.5 py-2 text-stone-200 text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-400 text-[10px] uppercase mb-1">
                      COMMUNITY ROLE
                    </label>
                    <input
                      type="text"
                      value={regCitizenDept}
                      onChange={(e) => setRegCitizenDept(e.target.value)}
                      placeholder="e.g. Resident, Cyclist"
                      className="w-full bg-stone-950 border border-stone-800 focus:border-cyan-400 rounded-lg px-2.5 py-2 text-stone-200 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-[0_0_20px_rgba(56,189,248,0.4)]"
                >
                  {isSubmitting ? 'REGISTERING...' : 'REGISTER & GET TESSERACT PASS'}
                </button>
              </form>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
