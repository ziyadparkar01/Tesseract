import React, { useState, useEffect } from 'react';
import {
  StudentProfile,
  StudentAuthSession,
} from '../types';
import { studentAuthService } from '../services/studentAuthService';
import { hapticFeedback } from '../utils/haptics';
import {
  GraduationCap,
  Shield,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  User,
  School,
  BookOpen,
  Mail,
  Key,
  LogOut,
  QrCode,
  Sparkles,
  MapPin,
  RefreshCw,
  Award,
  Layers,
  ArrowUpRight,
} from 'lucide-react';

interface StudentPortalViewProps {
  onBackToRadar?: () => void;
  onOpenQuickLog?: () => void;
}

export const StudentPortalView: React.FC<StudentPortalViewProps> = ({
  onBackToRadar,
  onOpenQuickLog,
}) => {
  const [session, setSession] = useState<StudentAuthSession>(
    studentAuthService.getSession()
  );
  const [activeTab, setActiveTab] = useState<'signin' | 'register'>('register');

  // Form states - Registration
  const [regFullName, setRegFullName] = useState('');
  const [regStudentId, setRegStudentId] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regUniversity, setRegUniversity] = useState('Tokyo Institute of Technology');
  const [regDepartment, setRegDepartment] = useState('Urban Planning & Geospatial Informatics');
  const [regCohort, setRegCohort] = useState('Year 3 · Cohort 2026');
  const [regRole, setRegRole] = useState('Field Safety Surveyor');
  const [regCardTheme, setRegCardTheme] = useState<'architectural_slate' | 'tokyo_monochrome' | 'blueprint_cyan'>('tokyo_monochrome');

  // Form states - Sign In
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('••••••••');
  const [rememberMe, setRememberMe] = useState(true);

  // Status & feedback
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live time ticker for TPLH architectural vibe
  const [timeString, setTimeString] = useState('');

  useEffect(() => {
    const unsub = studentAuthService.subscribe((s) => {
      setSession(s);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Pre-generate a student ID if empty
  const handleAutoGenerateId = () => {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    setRegStudentId(`TSR-2026-${randomDigits}`);
    hapticFeedback();
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setIsSubmitting(true);

    try {
      const idToUse = regStudentId.trim() || `TSR-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const res = studentAuthService.register({
        fullName: regFullName,
        studentIdNumber: idToUse,
        email: regEmail,
        university: regUniversity,
        department: regDepartment,
        cohortYear: regCohort,
        roleTitle: regRole,
        matrixCardTheme: regCardTheme,
      });

      if (!res.success) {
        setFormError(res.error || 'Registration failed.');
      } else {
        setFormSuccess('Student matriculation registered successfully. Active session established.');
        hapticFeedback();
      }
    } catch (err: any) {
      setFormError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setIsSubmitting(true);

    try {
      const res = studentAuthService.login(loginIdentifier);
      if (!res.success) {
        setFormError(res.error || 'Authentication failed. Please verify your Student ID or academic email.');
      } else {
        setFormSuccess('Student session verified.');
        hapticFeedback();
      }
    } catch (err: any) {
      setFormError(err.message || 'Authentication error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = (demoStudentId: string) => {
    setFormError(null);
    studentAuthService.loginAsDemo(demoStudentId);
    setFormSuccess('Logged in as verified academic student.');
    hapticFeedback();
  };

  const handleLogout = () => {
    studentAuthService.logout();
    setFormSuccess(null);
    setFormError(null);
    setActiveTab('signin');
    hapticFeedback();
  };

  const registeredStudents = studentAuthService.getAllRegisteredStudents();
  const currentStudent = session.student;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#0c0d12] text-stone-100 flex flex-col justify-between selection:bg-white selection:text-stone-900 font-sans">
      {/* TPLH ARCHITECTURAL FRAME HEADER */}
      <div className="border-b border-stone-800 bg-[#090a0e]/95 px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between text-xs font-mono text-stone-400">
        <div className="flex items-center gap-3">
          <span className="text-white font-bold tracking-widest uppercase">
            TESSERACT // ACADEMIC PORTAL
          </span>
          <span className="text-stone-600">/</span>
          <span>CAMPUS CIVIC REGISTRAR</span>
          <span className="text-stone-600">/</span>
          <span className="text-amber-400">SPEC_TPLH_V2.6</span>
        </div>

        <div className="flex items-center gap-4 text-stone-400 text-[11px]">
          <span className="hidden sm:inline">SYS_COORD: 35.6762°N, 139.6503°E</span>
          <span className="text-stone-600">/</span>
          <span className="text-stone-200 tabular-nums">{timeString || '2026-10-09 18:00:00 UTC'}</span>
          {currentStudent && (
            <button
              onClick={handleLogout}
              className="ml-2 flex items-center gap-1 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
            >
              <LogOut className="w-3 h-3" />
              <span>DISCONNECT</span>
            </button>
          )}
        </div>
      </div>

      {/* MAIN DUAL-COLUMN ARCHITECTURAL GRID */}
      <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-8 lg:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* LEFT COLUMN: TESSERACT STUDENT ID MATRIX CARD & SYSTEM STATUS */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Architectural Section Kicker */}
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-amber-400"></span>
                <span className="text-xs font-mono tracking-widest uppercase text-stone-300">
                  SECTION 01 / IDENTITY MATRIX
                </span>
              </div>
              <span className="text-[10px] font-mono text-stone-500">
                SECURE AUTH PROTOCOL
              </span>
            </div>

            {/* LIVE TPLH-INSPIRED DIGITAL STUDENT ID CARD */}
            <div className="relative group">
              {/* Corner crosshairs */}
              <div className="absolute -top-1.5 -left-1.5 text-stone-500 text-xs font-mono select-none">+</div>
              <div className="absolute -top-1.5 -right-1.5 text-stone-500 text-xs font-mono select-none">+</div>
              <div className="absolute -bottom-1.5 -left-1.5 text-stone-500 text-xs font-mono select-none">+</div>
              <div className="absolute -bottom-1.5 -right-1.5 text-stone-500 text-xs font-mono select-none">+</div>

              <div
                className={`w-full rounded-lg p-6 sm:p-7 border transition-all duration-300 shadow-2xl ${
                  (currentStudent?.matrixCardTheme || regCardTheme) === 'tokyo_monochrome'
                    ? 'bg-gradient-to-br from-stone-900 via-[#14151a] to-stone-950 border-stone-700 text-stone-100'
                    : (currentStudent?.matrixCardTheme || regCardTheme) === 'blueprint_cyan'
                    ? 'bg-gradient-to-br from-[#0c1a29] via-[#091522] to-[#050e18] border-cyan-800/60 text-cyan-50'
                    : 'bg-gradient-to-br from-stone-850 via-[#1b1d24] to-stone-950 border-stone-750 text-stone-100'
                }`}
              >
                {/* Card Top Strip */}
                <div className="flex items-center justify-between border-b border-stone-800/80 pb-4 mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded bg-amber-400 text-stone-950 flex items-center justify-center font-bold text-xs tracking-tighter shadow">
                      T
                    </div>
                    <div>
                      <div className="text-xs font-bold tracking-wider font-mono uppercase text-white">
                        TESSERACT MATRIX ID
                      </div>
                      <div className="text-[10px] font-mono text-stone-400">
                        OFFICIAL STUDENT CREDENTIAL
                      </div>
                    </div>
                  </div>

                  <div className="text-right font-mono text-[10px] text-amber-400">
                    <span className="px-1.5 py-0.5 rounded border border-amber-400/40 bg-amber-400/10">
                      ACCREDITED
                    </span>
                  </div>
                </div>

                {/* Card Body: Photo Avatar + Identification */}
                <div className="flex items-start gap-4 mb-6">
                  {/* Digital Chip / Monogram Avatar */}
                  <div className="w-16 h-16 rounded bg-stone-800 border border-stone-700 flex flex-col items-center justify-center shrink-0 shadow-inner overflow-hidden">
                    <span className="font-mono text-lg font-extrabold text-amber-400">
                      {currentStudent?.avatarSeed ||
                        (regFullName ? regFullName.slice(0, 2).toUpperCase() : 'ST')}
                    </span>
                    <span className="text-[8px] font-mono text-stone-400 uppercase tracking-tighter">
                      STUDENT
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-mono text-stone-400 uppercase">
                      STUDENT NAME
                    </div>
                    <div className="text-base font-bold text-white truncate tracking-tight">
                      {currentStudent?.fullName || regFullName || 'Kenji Takahashi'}
                    </div>

                    <div className="mt-1 text-[11px] font-mono text-amber-300 truncate">
                      {currentStudent?.studentIdNumber || regStudentId || 'TSR-2026-8942'}
                    </div>
                    <div className="text-[11px] text-stone-300 truncate">
                      {currentStudent?.department || regDepartment || 'Urban Planning & Geospatial Informatics'}
                    </div>
                  </div>
                </div>

                {/* University & Cohort details */}
                <div className="grid grid-cols-2 gap-3 text-[11px] font-mono border-t border-b border-stone-800/80 py-3 mb-5">
                  <div>
                    <span className="text-stone-500 block text-[9px] uppercase">INSTITUTION</span>
                    <span className="text-stone-200 truncate block">
                      {currentStudent?.university || regUniversity || 'Tokyo Institute of Tech'}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-500 block text-[9px] uppercase">ROLE & COHORT</span>
                    <span className="text-stone-200 truncate block">
                      {currentStudent?.cohortYear || regCohort || 'Year 3 · Cohort 2026'}
                    </span>
                  </div>
                </div>

                {/* Card Footer: Barcode + Security Hash */}
                <div className="flex items-center justify-between font-mono text-[9px] text-stone-400">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1 text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>GPS RADAR CITIZEN DISPATCH</span>
                    </div>
                    <span className="text-stone-500">HASH: 9F2A-88B1-7E03-TSR</span>
                  </div>

                  <div className="h-6 flex items-end gap-[2px] opacity-70">
                    {[3, 7, 4, 8, 2, 9, 5, 8, 3, 7, 4, 6, 8, 2, 5, 9, 3, 7, 4].map((h, idx) => (
                      <span
                        key={idx}
                        className="w-[2px] bg-stone-300"
                        style={{ height: `${h * 2.5}px` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Demo Student Switcher */}
            <div className="p-4 rounded-lg bg-stone-900/70 border border-stone-800">
              <div className="flex items-center justify-between mb-3 text-xs font-mono text-stone-400">
                <span className="uppercase tracking-wider">DEMO STUDENT PROFILES</span>
                <span className="text-[10px] text-stone-500">CLICK TO AUTHENTICATE</span>
              </div>
              <div className="flex flex-col gap-2">
                {registeredStudents.map((st) => (
                  <button
                    key={st.id}
                    onClick={() => handleDemoLogin(st.studentIdNumber)}
                    className={`flex items-center justify-between p-2.5 rounded border text-left text-xs transition-all cursor-pointer ${
                      currentStudent?.id === st.id
                        ? 'bg-amber-400/10 border-amber-400/60 text-amber-300'
                        : 'bg-stone-950/60 border-stone-800 hover:border-stone-700 text-stone-300'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="font-semibold text-white truncate">{st.fullName}</div>
                      <div className="text-[10px] text-stone-400 font-mono truncate">
                        {st.studentIdNumber} · {st.university}
                      </div>
                    </div>
                    <div className="shrink-0 text-[10px] font-mono text-amber-400">
                      {st.civicCredits} CR
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Action Navigation */}
            {onBackToRadar && (
              <button
                onClick={onBackToRadar}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 hover:text-white font-mono text-xs transition-colors cursor-pointer"
              >
                <span>OPEN LIVE SAFETY RADAR VIEW</span>
                <ArrowUpRight className="w-4 h-4 text-amber-400" />
              </button>
            )}
          </div>

          {/* RIGHT COLUMN: REGISTRATION / SIGN IN ARCHITECTURAL FORM OR ACTIVE DASHBOARD */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* If Student is currently authenticated, show Student Operations Deck */}
            {currentStudent ? (
              <div className="rounded-lg bg-stone-900/60 border border-stone-800 p-6 sm:p-8 flex flex-col gap-6">
                
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-800 pb-5">
                  <div>
                    <span className="text-xs font-mono text-amber-400 uppercase tracking-widest">
                      ACTIVE STUDENT WORKSPACE
                    </span>
                    <h2 className="text-2xl font-bold text-white mt-1">
                      Welcome, {currentStudent.fullName}
                    </h2>
                    <p className="text-xs font-mono text-stone-400 mt-0.5">
                      {currentStudent.department} · {currentStudent.university}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleLogout}
                      className="px-3 py-1.5 rounded border border-stone-700 bg-stone-950 hover:bg-stone-800 text-xs font-mono text-stone-300 hover:text-white transition-colors cursor-pointer"
                    >
                      SWITCH ACCOUNT
                    </button>
                  </div>
                </div>

                {/* Metric Strips */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded bg-[#111218] border border-stone-800">
                    <span className="text-[10px] font-mono text-stone-400 uppercase">
                      CIVIC CREDITS EARNED
                    </span>
                    <div className="text-2xl font-mono font-bold text-amber-400 mt-1">
                      {currentStudent.civicCredits}
                    </div>
                    <span className="text-[10px] text-stone-500 mt-1 block">
                      Recognized Academic Honors
                    </span>
                  </div>

                  <div className="p-4 rounded bg-[#111218] border border-stone-800">
                    <span className="text-[10px] font-mono text-stone-400 uppercase">
                      HAZARDS MAPPED
                    </span>
                    <div className="text-2xl font-mono font-bold text-white mt-1">
                      {currentStudent.hazardsReported}
                    </div>
                    <span className="text-[10px] text-stone-500 mt-1 block">
                      Manholes, Wires, Debris
                    </span>
                  </div>

                  <div className="p-4 rounded bg-[#111218] border border-stone-800">
                    <span className="text-[10px] font-mono text-stone-400 uppercase">
                      PHOTO VERIFICATIONS
                    </span>
                    <div className="text-2xl font-mono font-bold text-emerald-400 mt-1">
                      {currentStudent.verifiedFixesCount}
                    </div>
                    <span className="text-[10px] text-stone-500 mt-1 block">
                      Municipal Repairs Audited
                    </span>
                  </div>
                </div>

                {/* Primary Student Actions */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <button
                    onClick={onOpenQuickLog}
                    className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs tracking-wider uppercase transition-all shadow cursor-pointer"
                  >
                    <MapPin className="w-4 h-4 stroke-[2.5]" />
                    <span>LOG HAZARD AS {currentStudent.fullName.split(' ')[0]}</span>
                  </button>

                  <button
                    onClick={onBackToRadar}
                    className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded bg-stone-800 hover:bg-stone-750 text-white font-medium text-xs tracking-wider uppercase transition-all cursor-pointer"
                  >
                    <span>LAUNCH INTERACTIVE RADAR</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Field Notes and Academic Ethics */}
                <div className="border-t border-stone-800 pt-4 text-xs font-mono text-stone-400 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-stone-300">
                    <Shield className="w-3.5 h-3.5 text-amber-400" />
                    <span>INSTITUTIONAL FIELD DIRECTIVE:</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-stone-400">
                    All civic hazard submissions are geotagged with high-precision GPS sensors and submitted to the municipal emergency triage backlog. Ensure photographs are clear, well-lit, and prioritize personal pedestrian safety.
                  </p>
                </div>

              </div>
            ) : (
              /* REGISTRATION / SIGN IN TABS (TPLH STYLE) */
              <div className="rounded-lg bg-stone-900/60 border border-stone-800 p-6 sm:p-8 flex flex-col gap-6">
                
                {/* Segmented Architectural Switcher */}
                <div className="flex items-center border border-stone-800 rounded p-1 bg-stone-950/80">
                  <button
                    onClick={() => {
                      setActiveTab('register');
                      setFormError(null);
                      setFormSuccess(null);
                      hapticFeedback();
                    }}
                    className={`flex-1 py-2 text-xs font-mono tracking-wider uppercase transition-all rounded cursor-pointer ${
                      activeTab === 'register'
                        ? 'bg-stone-800 text-white font-bold shadow'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    01 / REGISTER STUDENT
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('signin');
                      setFormError(null);
                      setFormSuccess(null);
                      hapticFeedback();
                    }}
                    className={`flex-1 py-2 text-xs font-mono tracking-wider uppercase transition-all rounded cursor-pointer ${
                      activeTab === 'signin'
                        ? 'bg-stone-800 text-white font-bold shadow'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    02 / SIGN IN
                  </button>
                </div>

                {/* Feedback Alerts */}
                {formError && (
                  <div className="p-3.5 rounded bg-rose-950/40 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{formError}</span>
                  </div>
                )}
                {formSuccess && (
                  <div className="p-3.5 rounded bg-emerald-950/40 border border-emerald-800/80 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>{formSuccess}</span>
                  </div>
                )}

                {/* TAB 1: REGISTRATION FORM */}
                {activeTab === 'register' && (
                  <form onSubmit={handleRegister} className="flex flex-col gap-4 text-xs font-mono">
                    
                    {/* Full Name */}
                    <div>
                      <label className="block text-stone-400 text-[10px] uppercase mb-1.5">
                        FULL LEGAL / STUDENT NAME *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={regFullName}
                          onChange={(e) => setRegFullName(e.target.value)}
                          placeholder="e.g. Kenji Takahashi"
                          className="w-full bg-stone-950 border border-stone-800 rounded px-3.5 py-2.5 text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-400 text-xs"
                        />
                        <User className="absolute right-3 top-2.5 w-4 h-4 text-stone-600" />
                      </div>
                    </div>

                    {/* Student ID & Auto-Generate */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-stone-400 text-[10px] uppercase">
                          STUDENT MATRICULATION ID *
                        </label>
                        <button
                          type="button"
                          onClick={handleAutoGenerateId}
                          className="text-amber-400 hover:text-amber-300 text-[10px] flex items-center gap-1 cursor-pointer"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>AUTO-GENERATE ID</span>
                        </button>
                      </div>
                      <input
                        type="text"
                        required
                        value={regStudentId}
                        onChange={(e) => setRegStudentId(e.target.value)}
                        placeholder="e.g. TSR-2026-8942"
                        className="w-full bg-stone-950 border border-stone-800 rounded px-3.5 py-2.5 text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-400 text-xs font-mono"
                      />
                    </div>

                    {/* Academic Email */}
                    <div>
                      <label className="block text-stone-400 text-[10px] uppercase mb-1.5">
                        ACADEMIC / UNIVERSITY EMAIL *
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          required
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="e.g. k.takahashi@titech.ac.jp"
                          className="w-full bg-stone-950 border border-stone-800 rounded px-3.5 py-2.5 text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-400 text-xs"
                        />
                        <Mail className="absolute right-3 top-2.5 w-4 h-4 text-stone-600" />
                      </div>
                    </div>

                    {/* University & Department Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-stone-400 text-[10px] uppercase mb-1.5">
                          INSTITUTION / UNIVERSITY
                        </label>
                        <select
                          value={regUniversity}
                          onChange={(e) => setRegUniversity(e.target.value)}
                          className="w-full bg-stone-950 border border-stone-800 rounded px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-400 text-xs"
                        >
                          <option value="Tokyo Institute of Technology">Tokyo Institute of Technology</option>
                          <option value="Massachusetts Institute of Technology">MIT</option>
                          <option value="ETH Zürich">ETH Zürich</option>
                          <option value="Kyoto University">Kyoto University</option>
                          <option value="Stanford University">Stanford University</option>
                          <option value="National University of Singapore">National University of Singapore</option>
                          <option value="Politecnico di Milano">Politecnico di Milano</option>
                          <option value="University of Cambridge">University of Cambridge</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-stone-400 text-[10px] uppercase mb-1.5">
                          DEPARTMENT / MAJOR
                        </label>
                        <select
                          value={regDepartment}
                          onChange={(e) => setRegDepartment(e.target.value)}
                          className="w-full bg-stone-950 border border-stone-800 rounded px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-400 text-xs"
                        >
                          <option value="Urban Planning & Geospatial Informatics">Urban Planning & Geospatial</option>
                          <option value="Civil Systems & Resilient Infrastructure">Civil Systems & Infrastructure</option>
                          <option value="Geomatic Engineering & Environmental GIS">Geomatic Engineering & GIS</option>
                          <option value="Computer Science & Smart City Sensors">Computer Science & Sensors</option>
                          <option value="Environmental Architecture & Design">Environmental Architecture</option>
                        </select>
                      </div>
                    </div>

                    {/* Role & Matrix Card Theme */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-stone-400 text-[10px] uppercase mb-1.5">
                          CIVIC APPOINTMENT ROLE
                        </label>
                        <select
                          value={regRole}
                          onChange={(e) => setRegRole(e.target.value)}
                          className="w-full bg-stone-950 border border-stone-800 rounded px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-400 text-xs"
                        >
                          <option value="Field Safety Surveyor">Field Safety Surveyor</option>
                          <option value="Campus Hazard Ambassador">Campus Hazard Ambassador</option>
                          <option value="Infrastructure Audit Officer">Infrastructure Audit Officer</option>
                          <option value="Municipal Verification Fellow">Municipal Verification Fellow</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-stone-400 text-[10px] uppercase mb-1.5">
                          CARD VISUAL PALETTE
                        </label>
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setRegCardTheme('tokyo_monochrome')}
                            className={`flex-1 py-1.5 px-2 text-[10px] rounded border uppercase transition-colors cursor-pointer ${
                              regCardTheme === 'tokyo_monochrome'
                                ? 'bg-stone-800 text-white border-amber-400'
                                : 'bg-stone-950 text-stone-400 border-stone-800'
                            }`}
                          >
                            Tokyo
                          </button>
                          <button
                            type="button"
                            onClick={() => setRegCardTheme('architectural_slate')}
                            className={`flex-1 py-1.5 px-2 text-[10px] rounded border uppercase transition-colors cursor-pointer ${
                              regCardTheme === 'architectural_slate'
                                ? 'bg-stone-800 text-white border-amber-400'
                                : 'bg-stone-950 text-stone-400 border-stone-800'
                            }`}
                          >
                            Slate
                          </button>
                          <button
                            type="button"
                            onClick={() => setRegCardTheme('blueprint_cyan')}
                            className={`flex-1 py-1.5 px-2 text-[10px] rounded border uppercase transition-colors cursor-pointer ${
                              regCardTheme === 'blueprint_cyan'
                                ? 'bg-cyan-950 text-cyan-200 border-cyan-400'
                                : 'bg-stone-950 text-stone-400 border-stone-800'
                            }`}
                          >
                            Blueprint
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="mt-3 w-full py-3 rounded bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow"
                    >
                      {isSubmitting ? 'REGISTERING STUDENT...' : 'CREATE TESSERACT STUDENT PASSPORT'}
                    </button>
                  </form>
                )}

                {/* TAB 2: SIGN IN FORM */}
                {activeTab === 'signin' && (
                  <form onSubmit={handleLogin} className="flex flex-col gap-4 text-xs font-mono">
                    <div>
                      <label className="block text-stone-400 text-[10px] uppercase mb-1.5">
                        STUDENT MATRICULATION ID OR ACADEMIC EMAIL *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={loginIdentifier}
                          onChange={(e) => setLoginIdentifier(e.target.value)}
                          placeholder="e.g. TSR-2026-8942 or k.takahashi@titech.ac.jp"
                          className="w-full bg-stone-950 border border-stone-800 rounded px-3.5 py-2.5 text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-400 text-xs"
                        />
                        <School className="absolute right-3 top-2.5 w-4 h-4 text-stone-600" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-stone-400 text-[10px] uppercase mb-1.5">
                        SECURITY ACCESS KEY / PASSPHRASE
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="w-full bg-stone-950 border border-stone-800 rounded px-3.5 py-2.5 text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-400 text-xs"
                        />
                        <Key className="absolute right-3 top-2.5 w-4 h-4 text-stone-600" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-stone-400">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="rounded border-stone-700 bg-stone-900 text-amber-400 focus:ring-0"
                        />
                        <span>Remember Matrix session</span>
                      </label>
                      <span className="text-stone-500">SSO Active</span>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="mt-3 w-full py-3 rounded bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow"
                    >
                      {isSubmitting ? 'AUTHENTICATING...' : 'SIGN IN TO TESSERACT PORTAL'}
                    </button>
                  </form>
                )}

              </div>
            )}

          </div>
        </div>
      </div>

      {/* FOOTER ARCHITECTURAL BAR */}
      <div className="border-t border-stone-800 bg-[#090a0e] px-4 sm:px-8 py-3 text-stone-500 font-mono text-[10px] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span>TESSERACT CIVIC SAFETY SYSTEM</span>
          <span>·</span>
          <span>CAMPUS COHORT REGISTER 2026</span>
          <span>·</span>
          <span>DESIGN INSPIRED BY TPLH ARCHITECTURE</span>
        </div>
        <div>
          <span>ALL HAZARD REPORTS TIMESTAMPTED ON MUNICIPAL LEDGER</span>
        </div>
      </div>
    </div>
  );
};
