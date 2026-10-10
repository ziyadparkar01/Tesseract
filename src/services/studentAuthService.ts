import {
  StudentProfile,
  StudentAuthSession,
  MunicipalOfficerProfile,
  UserRole,
} from '../types';

const STORAGE_SESSION_KEY = 'tesseract_user_session_v2';
const STORAGE_STUDENTS_LIST_KEY = 'tesseract_registered_students_v2';
const STORAGE_OFFICERS_LIST_KEY = 'tesseract_registered_officers_v2';

// Seeded Citizen / Student surveyors
const INITIAL_STUDENT_SEED: StudentProfile[] = [
  {
    id: 'stu-tokyo-01',
    studentIdNumber: 'TSR-2026-8942',
    fullName: 'Kenji Takahashi',
    email: 'k.takahashi@titech.ac.jp',
    password: 'pass1234',
    university: 'Tokyo Institute of Technology',
    department: 'Urban Planning & Geospatial Informatics',
    cohortYear: 'Year 3 · Cohort 2026',
    roleTitle: 'Senior Field Safety Surveyor',
    civicCredits: 1420,
    hazardsReported: 9,
    verifiedFixesCount: 6,
    matrixCardTheme: 'tokyo_monochrome',
    registeredAt: '2026-03-14T08:00:00Z',
    avatarSeed: 'KT',
  },
  {
    id: 'stu-mit-02',
    studentIdNumber: 'TSR-2026-3104',
    fullName: 'Maya Lin',
    email: 'mlin@mit.edu',
    password: 'pass1234',
    university: 'Massachusetts Institute of Technology',
    department: 'Civil Systems & Resilient Infrastructure',
    cohortYear: 'Graduate Fellow · M.Eng',
    roleTitle: 'Infrastructure Audit Officer',
    civicCredits: 2150,
    hazardsReported: 14,
    verifiedFixesCount: 12,
    matrixCardTheme: 'architectural_slate',
    registeredAt: '2026-02-18T10:30:00Z',
    avatarSeed: 'ML',
  },
  {
    id: 'stu-eth-03',
    studentIdNumber: 'TSR-2026-5521',
    fullName: 'Liam O’Connor',
    email: 'l.oconnor@student.ethz.ch',
    password: 'pass1234',
    university: 'ETH Zürich',
    department: 'Geomatic Engineering & Environmental GIS',
    cohortYear: 'Year 2 · Cohort 2027',
    roleTitle: 'Campus Hazard Ambassador',
    civicCredits: 890,
    hazardsReported: 5,
    verifiedFixesCount: 4,
    matrixCardTheme: 'blueprint_cyan',
    registeredAt: '2026-04-02T14:15:00Z',
    avatarSeed: 'LO',
  },
];

// Seeded Municipality Officers & Ward Engineers
const INITIAL_OFFICER_SEED: MunicipalOfficerProfile[] = [
  {
    id: 'off-mun-01',
    badgeNumber: 'MUN-14-ENG-08',
    fullName: 'Officer Dave Miller',
    officialEmail: 'dave.miller@municipalworks.gov',
    password: 'dispatch2026',
    wardJurisdiction: 'Ward 12-16 Central Municipal District',
    department: 'Emergency Road Works & Drainage Squad',
    designation: 'Chief Dispatch Superintendent',
    assignedCrewUnit: 'Municipal Works Squad #04',
    clearanceLevel: 'LEVEL_3_CHIEF_ENGINEER',
    avatarSeed: 'DM',
    dispatchesCount: 42,
    verifiedFixesApproved: 38,
    registeredAt: '2025-11-01T09:00:00Z',
  },
  {
    id: 'off-mun-02',
    badgeNumber: 'MUN-INSPECT-204',
    fullName: 'Inspector Elena Ward',
    officialEmail: 'elena.ward@civicaudit.gov',
    password: 'dispatch2026',
    wardJurisdiction: 'Ward 14 Metro Corridor',
    department: 'Infrastructure Quality & AI Verification Audit',
    designation: 'Senior Field Safety Inspector',
    assignedCrewUnit: 'Rapid Pavement & Grid Audit Unit',
    clearanceLevel: 'LEVEL_2_DISPATCH_OFFICER',
    avatarSeed: 'EW',
    dispatchesCount: 29,
    verifiedFixesApproved: 54,
    registeredAt: '2026-01-15T11:20:00Z',
  },
  {
    id: 'off-mun-03',
    badgeNumber: 'MUN-CORP-101',
    fullName: 'Corporator Kenji Sato',
    officialEmail: 'k.sato@metrocorridor.gov',
    password: 'dispatch2026',
    wardJurisdiction: 'Ward 12-16 Municipal Corporation',
    department: 'Executive Civic Safety Board',
    designation: 'Ward Corporator & Public Works Head',
    assignedCrewUnit: 'Central Municipal Dispatch Command',
    clearanceLevel: 'LEVEL_3_CHIEF_ENGINEER',
    avatarSeed: 'KS',
    dispatchesCount: 65,
    verifiedFixesApproved: 91,
    registeredAt: '2025-08-20T14:00:00Z',
  },
];

type AuthListener = (session: StudentAuthSession) => void;

class StudentAuthService {
  private session: StudentAuthSession = {
    role: 'CITIZEN',
    student: null,
    officer: null,
    isAuthenticated: false,
  };
  private listeners: Set<AuthListener> = new Set();

  constructor() {
    this.init();
  }

  private init() {
    try {
      // Initialize citizen seeds
      const existingStudents = localStorage.getItem(STORAGE_STUDENTS_LIST_KEY);
      if (!existingStudents) {
        localStorage.setItem(STORAGE_STUDENTS_LIST_KEY, JSON.stringify(INITIAL_STUDENT_SEED));
      }

      // Initialize officer seeds
      const existingOfficers = localStorage.getItem(STORAGE_OFFICERS_LIST_KEY);
      if (!existingOfficers) {
        localStorage.setItem(STORAGE_OFFICERS_LIST_KEY, JSON.stringify(INITIAL_OFFICER_SEED));
      }

      // Load session
      const savedSession = localStorage.getItem(STORAGE_SESSION_KEY);
      if (savedSession) {
        const parsed = JSON.parse(savedSession);
        if (parsed?.isAuthenticated) {
          this.session = {
            role: parsed.role || 'CITIZEN',
            student: parsed.student || null,
            officer: parsed.officer || null,
            isAuthenticated: true,
          };
          return;
        }
      }

      // Default to unauthenticated session so users must login or register
      this.session = {
        role: 'CITIZEN',
        student: null,
        officer: null,
        isAuthenticated: false,
      };
      this.saveSession(this.session);
    } catch (e) {
      console.warn('LocalStorage error in StudentAuthService:', e);
      this.session = {
        role: 'CITIZEN',
        student: INITIAL_STUDENT_SEED[0],
        officer: null,
        isAuthenticated: true,
      };
    }
  }

  public getSession(): StudentAuthSession {
    return this.session;
  }

  public getCurrentRole(): UserRole {
    return this.session.role || 'CITIZEN';
  }

  public isOfficer(): boolean {
    return this.session.role === 'MUNICIPALITY_OFFICER' && Boolean(this.session.officer);
  }

  public getCurrentStudent(): StudentProfile | null {
    return this.session.student;
  }

  public getCurrentOfficer(): MunicipalOfficerProfile | null {
    return this.session.officer || null;
  }

  public subscribe(listener: AuthListener): () => void {
    this.listeners.add(listener);
    listener(this.session);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => {
      try {
        listener(this.session);
      } catch (e) {
        console.error(e);
      }
    });
  }

  private saveSession(session: StudentAuthSession) {
    try {
      localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(session));
    } catch (e) {
      console.warn(e);
    }
  }

  // --- CITIZEN / STUDENT METHODS ---

  public getAllRegisteredStudents(): StudentProfile[] {
    try {
      const data = localStorage.getItem(STORAGE_STUDENTS_LIST_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (_) {}
    return INITIAL_STUDENT_SEED;
  }

  public register(payload: {
    fullName: string;
    studentIdNumber?: string;
    email: string;
    password?: string;
    university?: string;
    department?: string;
    cohortYear?: string;
    roleTitle?: string;
    matrixCardTheme?: 'architectural_slate' | 'tokyo_monochrome' | 'blueprint_cyan';
  }): { success: boolean; student?: StudentProfile; error?: string } {
    if (!payload.fullName.trim()) {
      return { success: false, error: 'Full name is required.' };
    }
    if (!payload.email.trim() || !payload.email.includes('@')) {
      return { success: false, error: 'A valid email address is required.' };
    }
    if (payload.password && payload.password.trim().length < 4) {
      return { success: false, error: 'Password must be at least 4 characters long.' };
    }

    const cleanEmail = payload.email.trim().toLowerCase();
    const cleanId = (payload.studentIdNumber || '').trim().toUpperCase();

    const students = this.getAllRegisteredStudents();
    const existing = students.find(
      (s) =>
        s.email.toLowerCase() === cleanEmail ||
        (cleanId && s.studentIdNumber.toUpperCase() === cleanId)
    );

    if (existing) {
      return {
        success: false,
        error: `An account with this email (${cleanEmail}) already exists. Please sign in instead.`,
      };
    }

    const initials = payload.fullName
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0].toUpperCase())
      .slice(0, 2)
      .join('');

    const assignedId = cleanId || `CTZ-${Math.floor(1000 + Math.random() * 9000)}`;

    const newStudent: StudentProfile = {
      id: `stu-${Date.now().toString(36)}`,
      studentIdNumber: assignedId,
      fullName: payload.fullName.trim(),
      email: cleanEmail,
      password: payload.password?.trim() || 'pass1234',
      university: payload.university?.trim() || 'Ward 14 Civic District',
      department: payload.department?.trim() || 'Civic Infrastructure & Public Works',
      cohortYear: payload.cohortYear || 'Active Citizen',
      roleTitle: payload.roleTitle || 'Community Safety Surveyor',
      civicCredits: 250,
      hazardsReported: 0,
      verifiedFixesCount: 0,
      matrixCardTheme: payload.matrixCardTheme || 'tokyo_monochrome',
      registeredAt: new Date().toISOString(),
      avatarSeed: initials || 'CZ',
    };

    const updatedList = [newStudent, ...students];
    try {
      localStorage.setItem(STORAGE_STUDENTS_LIST_KEY, JSON.stringify(updatedList));
    } catch (_) {}

    this.session = {
      role: 'CITIZEN',
      student: newStudent,
      officer: null,
      isAuthenticated: true,
    };
    this.saveSession(this.session);
    this.notify();

    return { success: true, student: newStudent };
  }

  public login(identifier: string, password?: string): {
    success: boolean;
    student?: StudentProfile;
    error?: string;
  } {
    const cleanId = identifier.trim().toLowerCase();
    if (!cleanId) {
      return { success: false, error: 'Please enter your email, Citizen ID, or name.' };
    }

    const students = this.getAllRegisteredStudents();
    const found = students.find((s) => {
      const email = s.email.toLowerCase();
      const citizenId = s.studentIdNumber.toLowerCase();
      const id = s.id.toLowerCase();
      const name = s.fullName.toLowerCase();
      const username = email.split('@')[0];

      return (
        email === cleanId ||
        citizenId === cleanId ||
        id === cleanId ||
        name === cleanId ||
        (cleanId.length >= 3 && name.includes(cleanId)) ||
        username === cleanId
      );
    });

    if (!found) {
      return {
        success: false,
        error: `No registered citizen record found for "${identifier.trim()}". Please verify your email, name, or Citizen ID, or click "Create New Account".`,
      };
    }

    // Verify password if account has a password
    if (found.password) {
      if (password !== undefined && password !== '') {
        if (found.password !== password.trim()) {
          return {
            success: false,
            error: 'Incorrect password. Please verify and try again.',
          };
        }
      } else {
        return {
          success: false,
          error: 'Please enter your password to sign in.',
        };
      }
    }

    this.session = {
      role: 'CITIZEN',
      student: found,
      officer: null,
      isAuthenticated: true,
    };
    this.saveSession(this.session);
    this.notify();

    return { success: true, student: found };
  }

  public loginAsDemo(studentIdNumber: string) {
    const students = this.getAllRegisteredStudents();
    const student = students.find((s) => s.studentIdNumber === studentIdNumber) || students[0];
    if (student) {
      this.session = {
        role: 'CITIZEN',
        student,
        officer: null,
        isAuthenticated: true,
      };
      this.saveSession(this.session);
      this.notify();
    }
  }

  // --- MUNICIPALITY / WARD OFFICER METHODS ---

  public getAllOfficers(): MunicipalOfficerProfile[] {
    try {
      const data = localStorage.getItem(STORAGE_OFFICERS_LIST_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (_) {}
    return INITIAL_OFFICER_SEED;
  }

  public loginAsOfficer(identifier: string, password?: string): {
    success: boolean;
    officer?: MunicipalOfficerProfile;
    error?: string;
  } {
    const cleanId = identifier.trim().toLowerCase();
    if (!cleanId) {
      return { success: false, error: 'Please enter your Officer Badge ID or official email.' };
    }

    const officers = this.getAllOfficers();
    const found = officers.find((o) => {
      const badge = o.badgeNumber.toLowerCase();
      const email = o.officialEmail.toLowerCase();
      const id = o.id.toLowerCase();
      const name = o.fullName.toLowerCase();

      return (
        badge === cleanId ||
        email === cleanId ||
        id === cleanId ||
        name === cleanId ||
        (cleanId.length >= 3 && name.includes(cleanId))
      );
    });

    if (!found) {
      return {
        success: false,
        error: `Official municipal credentials not recognized for "${identifier.trim()}". Please check your badge ID or email.`,
      };
    }

    // Verify password if account has a password
    if (found.password) {
      if (password !== undefined && password !== '') {
        if (found.password !== password.trim()) {
          return {
            success: false,
            error: 'Incorrect officer dispatch password. Please verify and try again.',
          };
        }
      } else {
        return {
          success: false,
          error: 'Please enter your dispatch password to access command.',
        };
      }
    }

    this.session = {
      role: 'MUNICIPALITY_OFFICER',
      officer: found,
      student: null,
      isAuthenticated: true,
    };
    this.saveSession(this.session);
    this.notify();

    return { success: true, officer: found };
  }

  public loginOfficerDemo(badgeNumber: string) {
    const officers = this.getAllOfficers();
    const officer = officers.find((o) => o.badgeNumber === badgeNumber) || officers[0];
    if (officer) {
      this.session = {
        role: 'MUNICIPALITY_OFFICER',
        officer,
        student: null,
        isAuthenticated: true,
      };
      this.saveSession(this.session);
      this.notify();
    }
  }

  public registerOfficer(payload: {
    fullName: string;
    badgeNumber: string;
    officialEmail: string;
    password?: string;
    wardJurisdiction: string;
    department: string;
    designation: string;
    assignedCrewUnit?: string;
  }): { success: boolean; officer?: MunicipalOfficerProfile; error?: string } {
    if (!payload.fullName.trim()) {
      return { success: false, error: 'Officer full name is required.' };
    }
    if (!payload.badgeNumber.trim()) {
      return { success: false, error: 'Official Badge Number is required.' };
    }
    if (!payload.officialEmail.trim() || !payload.officialEmail.includes('@')) {
      return { success: false, error: 'Valid municipal email is required.' };
    }
    if (payload.password && payload.password.trim().length < 4) {
      return { success: false, error: 'Password must be at least 4 characters long.' };
    }

    const cleanEmail = payload.officialEmail.trim().toLowerCase();
    const cleanBadge = payload.badgeNumber.trim().toUpperCase();

    const officers = this.getAllOfficers();
    const existing = officers.find(
      (o) =>
        o.badgeNumber.toUpperCase() === cleanBadge ||
        o.officialEmail.toLowerCase() === cleanEmail
    );

    if (existing) {
      return {
        success: false,
        error: `An officer record with badge "${cleanBadge}" or email "${cleanEmail}" already exists.`,
      };
    }

    const initials = payload.fullName
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0].toUpperCase())
      .slice(0, 2)
      .join('');

    const newOfficer: MunicipalOfficerProfile = {
      id: `off-${Date.now().toString(36)}`,
      badgeNumber: cleanBadge,
      fullName: payload.fullName.trim(),
      officialEmail: cleanEmail,
      password: payload.password?.trim() || 'dispatch2026',
      wardJurisdiction: payload.wardJurisdiction || 'Ward 12-16 Central Municipal District',
      department: payload.department || 'Emergency Road Works Squad',
      designation: payload.designation || 'Municipal Dispatch Officer',
      assignedCrewUnit: payload.assignedCrewUnit || 'Works Squad #01',
      clearanceLevel: 'LEVEL_2_DISPATCH_OFFICER',
      avatarSeed: initials || 'OF',
      dispatchesCount: 0,
      verifiedFixesApproved: 0,
      registeredAt: new Date().toISOString(),
    };

    const updated = [newOfficer, ...officers];
    try {
      localStorage.setItem(STORAGE_OFFICERS_LIST_KEY, JSON.stringify(updated));
    } catch (_) {}

    this.session = {
      role: 'MUNICIPALITY_OFFICER',
      officer: newOfficer,
      student: null,
      isAuthenticated: true,
    };
    this.saveSession(this.session);
    this.notify();

    return { success: true, officer: newOfficer };
  }

  public logout() {
    this.session = {
      role: 'CITIZEN',
      student: null,
      officer: null,
      isAuthenticated: false,
    };
    try {
      localStorage.removeItem(STORAGE_SESSION_KEY);
    } catch (_) {}
    this.notify();
  }

  public awardCivicCredits(amount: number, reason: 'hazard_logged' | 'fix_verified') {
    if (this.session.student) {
      const current = this.session.student;
      const updated: StudentProfile = {
        ...current,
        civicCredits: current.civicCredits + amount,
        hazardsReported:
          reason === 'hazard_logged' ? current.hazardsReported + 1 : current.hazardsReported,
        verifiedFixesCount:
          reason === 'fix_verified' ? current.verifiedFixesCount + 1 : current.verifiedFixesCount,
      };

      this.session = { ...this.session, student: updated };
      this.saveSession(this.session);

      const all = this.getAllRegisteredStudents().map((s) => (s.id === updated.id ? updated : s));
      try {
        localStorage.setItem(STORAGE_STUDENTS_LIST_KEY, JSON.stringify(all));
      } catch (_) {}

      this.notify();
    } else if (this.session.officer) {
      // Track officer dispatch / approval actions
      const off = this.session.officer;
      const updated: MunicipalOfficerProfile = {
        ...off,
        dispatchesCount:
          reason === 'hazard_logged' ? off.dispatchesCount + 1 : off.dispatchesCount,
        verifiedFixesApproved:
          reason === 'fix_verified' ? off.verifiedFixesApproved + 1 : off.verifiedFixesApproved,
      };

      this.session = { ...this.session, officer: updated };
      this.saveSession(this.session);

      const all = this.getAllOfficers().map((o) => (o.id === updated.id ? updated : o));
      try {
        localStorage.setItem(STORAGE_OFFICERS_LIST_KEY, JSON.stringify(all));
      } catch (_) {}

      this.notify();
    }
  }
}

export const studentAuthService = new StudentAuthService();
export const authService = studentAuthService;
