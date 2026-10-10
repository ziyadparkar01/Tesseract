import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  StudentProfile,
  MunicipalOfficerProfile,
  UserRole,
} from '../types';
import { studentAuthService } from '../services/studentAuthService';
import { hapticFeedback } from '../utils/haptics';
import {
  User,
  School,
  Mail,
  Key,
  CheckCircle2,
  AlertCircle,
  Zap,
  ArrowRight,
  Shield,
  Building2,
  Compass,
  ArrowUpRight,
} from 'lucide-react';

interface AuthGatewayPageProps {
  onAuthenticated: () => void;
  onExploreGuest: () => void;
  initialMode?: 'signin' | 'signup';
}

export const AuthGatewayPage: React.FC<AuthGatewayPageProps> = ({
  onAuthenticated,
  onExploreGuest,
  initialMode = 'signin',
}) => {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const burstTriggerRef = useRef<(() => void) | null>(null);
  const setCubeColorRef = useRef<((colorHex: string) => void) | null>(null);

  // Active view: 'signin' vs 'signup'
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>(initialMode);

  // Active portal: 'citizen' vs 'municipality'
  const [roleTab, setRoleTab] = useState<'citizen' | 'municipality'>('citizen');

  // Sign In inputs
  const [loginId, setLoginId] = useState('TSR-2026-8942');
  const [loginPass, setLoginPass] = useState('••••••••');

  // Citizen Sign Up inputs
  const [regCitizenName, setRegCitizenName] = useState('');
  const [regCitizenId, setRegCitizenId] = useState('');
  const [regCitizenEmail, setRegCitizenEmail] = useState('');
  const [regCitizenUni, setRegCitizenUni] = useState('Tokyo Institute of Technology');
  const [regCitizenDept, setRegCitizenDept] = useState('Urban Planning & Geospatial Informatics');

  // Municipality Sign Up inputs
  const [regOfficerName, setRegOfficerName] = useState('');
  const [regOfficerBadge, setRegOfficerBadge] = useState('');
  const [regOfficerEmail, setRegOfficerEmail] = useState('');
  const [regOfficerWard, setRegOfficerWard] = useState('Ward 12-16 Central Municipal District');
  const [regOfficerDept, setRegOfficerDept] = useState('Emergency Road Works & Drainage Squad');
  const [regOfficerTitle, setRegOfficerTitle] = useState('Municipal Dispatch Officer');

  // Feedback states
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update 3D Cube Color on role switch
  useEffect(() => {
    if (setCubeColorRef.current) {
      if (roleTab === 'municipality') {
        setCubeColorRef.current('#f59e0b');
      } else {
        setCubeColorRef.current('#38bdf8');
      }
    }
  }, [roleTab]);

  // Set default values when switching role
  useEffect(() => {
    if (roleTab === 'municipality') {
      setLoginId('MUN-14-ENG-08');
    } else {
      setLoginId('TSR-2026-8942');
    }
    setErrorMsg(null);
    setSuccessMsg(null);
  }, [roleTab]);

  // Three.js 3D Bursting Tesseract Canvas
  useEffect(() => {
    if (!canvasContainerRef.current) return;

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

    const initialHex = roleTab === 'municipality' ? '#f59e0b' : '#38bdf8';
    const primaryColor = new THREE.Color(initialHex);

    // 1. Outer Translucent Crystalline Cube
    const outerGeo = new THREE.BoxGeometry(1.6, 1.6, 1.6);
    const outerMat = new THREE.MeshPhysicalMaterial({
      color: primaryColor,
      emissive: primaryColor,
      emissiveIntensity: 0.85,
      transparent: true,
      opacity: 0.4,
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

    // 3. 8 Hyper-dimensional vertex struts
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

    // 4. 800 Bursting Cosmic Energy Particles
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

    // Color updater
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

    // Burst trigger
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
        mouseY * 0.35 + Math.sin(time * 0.5) * 0.1,
        0.05
      );
      tesseractGroup.rotation.z = THREE.MathUtils.lerp(
        tesseractGroup.rotation.z,
        -mouseX * 0.35 + Math.cos(time * 0.4) * 0.1,
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
  }, []);

  // --- SUBMISSIONS ---

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);
    if (burstTriggerRef.current) burstTriggerRef.current();

    try {
      if (roleTab === 'municipality') {
        const res = studentAuthService.loginAsOfficer(loginId);
        if (!res.success) {
          setErrorMsg(res.error || 'Invalid Officer Badge ID or password.');
        } else {
          setSuccessMsg('Municipal Officer credentials verified. Access granted.');
          setTimeout(onAuthenticated, 600);
        }
      } else {
        const res = studentAuthService.login(loginId);
        if (!res.success) {
          setErrorMsg(res.error || 'Invalid Student ID or password.');
        } else {
          setSuccessMsg('Citizen session authenticated.');
          setTimeout(onAuthenticated, 600);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);
    if (burstTriggerRef.current) burstTriggerRef.current();

    try {
      if (roleTab === 'municipality') {
        const badge = regOfficerBadge.trim() || `MUN-14-ENG-${Math.floor(10 + Math.random() * 90)}`;
        const res = studentAuthService.registerOfficer({
          fullName: regOfficerName,
          badgeNumber: badge,
          officialEmail: regOfficerEmail,
          wardJurisdiction: regOfficerWard,
          department: regOfficerDept,
          designation: regOfficerTitle,
        });

        if (!res.success) {
          setErrorMsg(res.error || 'Officer enrollment failed.');
        } else {
          setSuccessMsg('Officer registered with Level 2 dispatch clearance.');
          setTimeout(onAuthenticated, 650);
        }
      } else {
        const id = regCitizenId.trim() || `TSR-2026-${Math.floor(1000 + Math.random() * 9000)}`;
        const res = studentAuthService.register({
          fullName: regCitizenName,
          studentIdNumber: id,
          email: regCitizenEmail,
          university: regCitizenUni,
          department: regCitizenDept,
        });

        if (!res.success) {
          setErrorMsg(res.error || 'Registration failed.');
        } else {
          setSuccessMsg('Citizen surveyor passport registered.');
          setTimeout(onAuthenticated, 650);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoSignIn = (id: string, isOfficerRole: boolean) => {
    if (burstTriggerRef.current) burstTriggerRef.current();
    if (isOfficerRole) {
      studentAuthService.loginOfficerDemo(id);
      setSuccessMsg('Signed in as Municipal Officer.');
    } else {
      studentAuthService.loginAsDemo(id);
      setSuccessMsg('Signed in as Citizen Surveyor.');
    }
    setTimeout(onAuthenticated, 550);
  };

  const studentDemoList = studentAuthService.getAllRegisteredStudents();
  const officerDemoList = studentAuthService.getAllOfficers();

  return (
    <div className="relative min-h-screen w-full bg-[#0a0c12] text-stone-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-stone-950 overflow-x-hidden">
      
      {/* 3D BURSTING THREE.JS CANVAS BACKGROUND */}
      <div
        ref={canvasContainerRef}
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      />

      {/* TOP ARCHITECTURAL STRIP */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 py-4 flex items-center justify-between border-b border-stone-800/80">
        <div className="flex items-center gap-3">
          <button
            onClick={() => burstTriggerRef.current && burstTriggerRef.current()}
            className="w-8 h-8 rounded-lg bg-stone-900 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(56,189,248,0.4)] cursor-pointer"
          >
            <Zap className="w-4 h-4 text-cyan-400" />
          </button>
          <div>
            <span className="font-mono font-bold tracking-wider text-base text-white">
              TESSERACT
            </span>
            <span className="ml-2 text-[10px] font-mono text-cyan-400 uppercase hidden sm:inline">
              CIVIC HAZARD NETWORK
            </span>
          </div>
        </div>

        <button
          onClick={onExploreGuest}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-stone-700 bg-stone-900/80 hover:bg-stone-800 text-stone-300 hover:text-white font-mono text-xs transition-colors cursor-pointer"
        >
          <span>EXPLORE MAP AS GUEST</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-cyan-400" />
        </button>
      </header>

      {/* CENTER AUTHENTICATION SUITE */}
      <main className="relative z-10 w-full max-w-xl mx-auto px-4 py-8 sm:py-12 my-auto">
        <div
          className={`w-full bg-[#0d0f17]/95 border rounded-2xl shadow-2xl p-6 sm:p-9 backdrop-blur-2xl transition-all ${
            roleTab === 'municipality'
              ? 'border-amber-500/40 shadow-[0_0_60px_rgba(245,158,11,0.25)]'
              : 'border-cyan-500/40 shadow-[0_0_60px_rgba(56,189,248,0.25)]'
          }`}
        >
          {/* Header & Mode Switcher */}
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">
              {authMode === 'signin' ? 'Sign In to Tesseract' : 'Create an Account'}
            </h1>
            <p className="text-xs font-mono text-stone-400 mt-1">
              Select your clearance role to access street safety radar & triage dispatch
            </p>
          </div>

          {/* DUAL ROLE TAB: CITIZEN VS MUNICIPALITY */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-stone-950 rounded-xl border border-stone-800 mb-5 font-mono text-xs">
            <button
              type="button"
              onClick={() => {
                setRoleTab('citizen');
                hapticFeedback();
              }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all cursor-pointer ${
                roleTab === 'citizen'
                  ? 'bg-cyan-950 text-cyan-200 border border-cyan-500/50 font-bold shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>CITIZEN</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setRoleTab('municipality');
                hapticFeedback();
              }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all cursor-pointer ${
                roleTab === 'municipality'
                  ? 'bg-amber-950 text-amber-200 border border-amber-500/50 font-bold shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>MUNICIPALITY DISPATCH</span>
            </button>
          </div>

          {/* DEDICATED SEPARATE SIGN IN VS SIGN UP MODE SWITCHER */}
          <div className="flex items-center border-b border-stone-800 pb-3 mb-5 font-mono text-xs">
            <button
              type="button"
              onClick={() => {
                setAuthMode('signin');
                setErrorMsg(null);
                setSuccessMsg(null);
                if (burstTriggerRef.current) burstTriggerRef.current();
              }}
              className={`pb-2 px-3 font-semibold transition-colors cursor-pointer border-b-2 ${
                authMode === 'signin'
                  ? roleTab === 'municipality'
                    ? 'border-amber-400 text-amber-300'
                    : 'border-cyan-400 text-cyan-300'
                  : 'border-transparent text-stone-500 hover:text-stone-300'
              }`}
            >
              01 / SIGN IN
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode('signup');
                setErrorMsg(null);
                setSuccessMsg(null);
                if (burstTriggerRef.current) burstTriggerRef.current();
              }}
              className={`pb-2 px-3 font-semibold transition-colors cursor-pointer border-b-2 ${
                authMode === 'signup'
                  ? roleTab === 'municipality'
                    ? 'border-amber-400 text-amber-300'
                    : 'border-cyan-400 text-cyan-300'
                  : 'border-transparent text-stone-500 hover:text-stone-300'
              }`}
            >
              02 / SIGN UP & REGISTER
            </button>
          </div>

          {/* Feedback alerts */}
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

          {/* ================= FORM: SIGN IN ================= */}
          {authMode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-stone-400 text-[10px] uppercase mb-1">
                  {roleTab === 'municipality' ? 'OFFICER BADGE ID OR GOV EMAIL *' : 'CITIZEN ID OR RESIDENT EMAIL *'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    placeholder={
                      roleTab === 'municipality'
                        ? 'e.g. MUN-14-ENG-08 or dave@municipalworks.gov'
                        : 'e.g. TSR-2026-8942 or citizen@example.com'
                    }
                    className="w-full bg-stone-950 border border-stone-800 focus:border-cyan-400 rounded-lg px-3.5 py-2.5 text-stone-100 placeholder-stone-600 focus:outline-none transition-colors"
                  />
                  {roleTab === 'municipality' ? (
                    <Building2 className="absolute right-3 top-2.5 w-4 h-4 text-stone-600" />
                  ) : (
                    <School className="absolute right-3 top-2.5 w-4 h-4 text-stone-600" />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-stone-400 text-[10px] uppercase mb-1">
                  PASSWORD / PASSPHRASE
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 focus:border-cyan-400 rounded-lg px-3.5 py-2.5 text-stone-100 placeholder-stone-600 focus:outline-none transition-colors"
                  />
                  <Key className="absolute right-3 top-2.5 w-4 h-4 text-stone-600" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 rounded-lg font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-lg ${
                  roleTab === 'municipality'
                    ? 'bg-amber-400 hover:bg-amber-300 text-stone-950 shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                    : 'bg-cyan-400 hover:bg-cyan-300 text-stone-950 shadow-[0_0_20px_rgba(56,189,248,0.4)]'
                }`}
              >
                {isSubmitting ? 'AUTHENTICATING...' : roleTab === 'municipality' ? 'SIGN IN AS MUNICIPAL OFFICER' : 'SIGN IN AS CITIZEN SURVEYOR'}
              </button>

              {/* 1-Click Demo Accounts */}
              <div className="pt-3 border-t border-stone-800">
                <div className="text-[10px] text-stone-500 uppercase mb-2 flex items-center justify-between">
                  <span>INSTANT 1-CLICK DEMO ACCOUNTS</span>
                  <span className={roleTab === 'municipality' ? 'text-amber-400 font-bold' : 'text-cyan-400 font-bold'}>
                    PRE-VERIFIED
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {roleTab === 'municipality'
                    ? officerDemoList.map((o) => (
                        <button
                          key={o.id}
                          type="button"
                          onClick={() => handleDemoSignIn(o.badgeNumber, true)}
                          className="p-2.5 rounded-lg bg-stone-900 hover:bg-stone-850 border border-stone-800 hover:border-amber-500/60 text-left transition-colors cursor-pointer"
                        >
                          <div className="font-bold text-white text-[11px] truncate">{o.fullName}</div>
                          <div className="text-[9px] text-amber-400 truncate">{o.badgeNumber}</div>
                        </button>
                      ))
                    : studentDemoList.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => handleDemoSignIn(s.studentIdNumber, false)}
                          className="p-2.5 rounded-lg bg-stone-900 hover:bg-stone-850 border border-stone-800 hover:border-cyan-500/60 text-left transition-colors cursor-pointer"
                        >
                          <div className="font-bold text-white text-[11px] truncate">{s.fullName.split(' ')[0]}</div>
                          <div className="text-[9px] text-cyan-400 truncate">{s.studentIdNumber}</div>
                        </button>
                      ))}
                </div>
              </div>
            </form>
          )}

          {/* ================= FORM: SIGN UP ================= */}
          {authMode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-3.5 text-xs font-mono">
              {roleTab === 'citizen' ? (
                <>
                  <div>
                    <label className="block text-stone-400 text-[10px] uppercase mb-1">
                      FULL NAME *
                    </label>
                    <input
                      type="text"
                      required
                      value={regCitizenName}
                      onChange={(e) => setRegCitizenName(e.target.value)}
                      placeholder="e.g. Kenji Takahashi"
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
                    {isSubmitting ? 'REGISTERING...' : 'REGISTER STUDENT PASSPORT'}
                  </button>
                </>
              ) : (
                <>
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
                </>
              )}
            </form>
          )}

          {/* Bottom Switch Link */}
          <div className="mt-5 text-center text-xs font-mono text-stone-400">
            {authMode === 'signin' ? (
              <span>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setAuthMode('signup')}
                  className={roleTab === 'municipality' ? 'text-amber-400 hover:underline font-semibold' : 'text-cyan-400 hover:underline font-semibold'}
                >
                  Create one now
                </button>
              </span>
            ) : (
              <span>
                Already enrolled?{' '}
                <button
                  type="button"
                  onClick={() => setAuthMode('signin')}
                  className={roleTab === 'municipality' ? 'text-amber-400 hover:underline font-semibold' : 'text-cyan-400 hover:underline font-semibold'}
                >
                  Sign in here
                </button>
              </span>
            )}
          </div>

        </div>
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 py-4 border-t border-stone-800/80 text-[11px] font-mono text-stone-500 flex flex-wrap items-center justify-between gap-2">
        <div>TESSERACT CIVIC RADAR · SECURE GATEWAY PROTOCOL</div>
        <div>WARD 12-16 GIS TRIAGE DISPATCH</div>
      </footer>

    </div>
  );
};
