export type HazardCategory =
  | 'OPEN_MANHOLE'
  | 'DANGLING_LIVE_WIRE'
  | 'BROKEN_FOOTPATH'
  | 'WATERLOGGING'
  | 'DEEP_POTHOLE'
  | 'MISSING_DRAIN_GRATE'
  | 'FALLEN_DEBRIS';

export type HazardSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type HazardStatus =
  | 'REPORTED'
  | 'CREW_DISPATCHED'
  | 'UNDER_REPAIR'
  | 'FIXED_PENDING_VERIFICATION'
  | 'RESOLVED_VERIFIED';

export interface HazardLocation {
  lat: number;
  lng: number;
  address: string;
  ward: string;
  landmark?: string;
  distanceMeters?: number;
  bearingDegrees?: number;
}

export interface DispatchedCrewInfo {
  crewId: string;
  crewName: string;
  leadOfficer: string;
  contactNumber: string;
  dispatchedAt: string;
  etaMinutes: number;
  vehicleUnit: string;
}

export interface FixVerificationRecord {
  repairedAt: string;
  repairPhotoUrl: string;
  verifiedAt: string;
  verifiedBy: 'AI_VISION_AUDIT' | 'MUNICIPAL_INSPECTOR';
  verificationConfidence: number; // 0-100
  verificationNotes: string;
  inspectorName?: string;
  materialUsed?: string;
}

export interface CivicHazard {
  id: string;
  title: string;
  category: HazardCategory;
  severity: HazardSeverity;
  severityScore: number; // 0 to 100
  status: HazardStatus;
  description: string;
  location: HazardLocation;
  reportedAt: string;
  reportedBy: string;
  photoUrl: string;
  thumbnailUrl?: string;
  voiceNoteUrl?: string;
  voiceTranscript?: string;
  confirmationsCount: number;
  userHasConfirmed?: boolean;
  impactedCommutersDaily: number;
  dangerFactors: string[];
  recommendedAction: string;
  weatherCondition?: string;
  dispatchedCrew?: DispatchedCrewInfo;
  resolution?: FixVerificationRecord;
}

export interface AIVisualAnalysisResult {
  category: HazardCategory;
  severity: HazardSeverity;
  severityScore: number;
  detectedTitle: string;
  description: string;
  dangerFactors: string[];
  recommendedAction: string;
  confidenceScore: number;
  riskExplanation: string;
}

export interface AIVerifyFixResult {
  isFixed: boolean;
  confidenceScore: number;
  verificationAssessment: string;
  safetyNotes: string;
  detectedRepairs: string[];
  remainingConcerns?: string[];
}

export type AppViewMode =
  | 'auth_portal'
  | 'map_view'
  | 'map_radar'
  | 'quick_log'
  | 'municipal_queue'
  | 'verified_fixes'
  | 'ward_analytics';

export interface StudentProfile {
  id: string;
  studentIdNumber: string; // e.g. TSR-2026-8942
  fullName: string;
  email: string;
  password?: string;
  university: string;
  department: string;
  cohortYear: string;
  roleTitle: string; // e.g. GIS Field Surveyor, Urban Safety Fellow
  civicCredits: number;
  hazardsReported: number;
  verifiedFixesCount: number;
  matrixCardTheme: 'architectural_slate' | 'tokyo_monochrome' | 'blueprint_cyan';
  registeredAt: string;
  avatarSeed: string;
}

export type UserRole = 'CITIZEN' | 'MUNICIPALITY_OFFICER';

export interface MunicipalOfficerProfile {
  id: string;
  badgeNumber: string; // e.g. MUN-14-ENG-08
  fullName: string;
  officialEmail: string;
  password?: string;
  wardJurisdiction: string;
  department: string;
  designation: string;
  assignedCrewUnit?: string;
  clearanceLevel: 'LEVEL_1_INSPECTOR' | 'LEVEL_2_DISPATCH_OFFICER' | 'LEVEL_3_CHIEF_ENGINEER';
  avatarSeed: string;
  dispatchesCount: number;
  verifiedFixesApproved: number;
  registeredAt: string;
}

export interface StudentAuthSession {
  role?: UserRole;
  student: StudentProfile | null;
  officer?: MunicipalOfficerProfile | null;
  isAuthenticated: boolean;
  token?: string;
}

export interface UnifiedAuthSession {
  role: UserRole;
  citizen: StudentProfile | null;
  officer: MunicipalOfficerProfile | null;
  student: StudentProfile | null;
  isAuthenticated: boolean;
  token?: string;
}

export interface WardStatistics {
  wardName: string;
  totalActiveHazards: number;
  criticalHazards: number;
  averageResolutionHours: number;
  photoVerifiedRate: number;
  totalCommutersProtected: number;
  crewReadinessScore: number;
}

// Retain compatibility with existing GPS telemetry
export interface LocalityWaypoint {
  id: string;
  name: string;
  category: string;
  description: string;
  audioPrompt: string;
  lat: number;
  lng: number;
  icon: string;
  completed: boolean;
  distanceMeters: number;
  bearingDegrees?: number;
  hazardRef?: CivicHazard;
}

export type GamePage = AppViewMode;
