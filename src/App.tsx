import React, { useState, useEffect } from 'react';
import { StreetSafeNavbar } from './components/StreetSafeNavbar';
import { CivicHazardMap } from './components/CivicHazardMap';
import { MunicipalTriageQueue } from './components/MunicipalTriageQueue';
import { VerifiedFixesShowcase } from './components/VerifiedFixesShowcase';
import { WardAnalyticsScorecard } from './components/WardAnalyticsScorecard';
import { TesseractAuthGateway } from './components/TesseractAuthGateway';
import { PhotoHazardLoggerModal } from './components/PhotoHazardLoggerModal';
import { PhotoFixVerificationModal } from './components/PhotoFixVerificationModal';
import { WelcomeIntroOverlay } from './components/WelcomeIntroOverlay';
import { TesseractLogo } from './components/TesseractLogo';
import { AppViewMode, CivicHazard, WardStatistics, StudentAuthSession, UserRole } from './types';
import { hazardService } from './services/hazardService';
import { studentAuthService } from './services/studentAuthService';
import {
  movementTrackingService,
  MovementTelemetry,
} from './services/movementTrackingService';
import { hapticFeedback } from './utils/haptics';
import {
  MapPin,
  Shield,
  Building2,
} from 'lucide-react';

export default function App() {
  // Start the site on the main Live Map interface as requested by user
  const [currentView, setCurrentView] = useState<AppViewMode>('map_view');
  const [hazards, setHazards] = useState<CivicHazard[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Auth session
  const [session, setSession] = useState<StudentAuthSession>(
    studentAuthService.getSession()
  );

  useEffect(() => {
    const unsub = studentAuthService.subscribe((s) => {
      setSession(s);
    });
    return () => unsub();
  }, []);

  // System Loading Sequence State
  const [showWelcomeIntro, setShowWelcomeIntro] = useState<boolean>(false);

  // Real-time GPS movement telemetry
  const [telemetry, setTelemetry] = useState<MovementTelemetry>(
    movementTrackingService.getTelemetry()
  );

  // Google Maps quota reached state
  const [gmpQuotaExceeded, setGmpQuotaExceeded] = useState<boolean>(false);

  useEffect(() => {
    const handleQuotaExceeded = () => setGmpQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuotaExceeded);
  }, []);

  useEffect(() => {
    const unsub = movementTrackingService.subscribe((t) => {
      setTelemetry(t);
    });
    return () => unsub();
  }, []);

  // Selected Hazard for Inspection & Modals
  const [selectedHazard, setSelectedHazard] = useState<CivicHazard | null>(null);
  const [isQuickLogOpen, setIsQuickLogOpen] = useState<boolean>(false);
  const [fixModalHazard, setFixModalHazard] = useState<CivicHazard | null>(null);

  const [wardStats, setWardStats] = useState<WardStatistics>({
    wardName: 'Ward 12-16 Central Municipal District',
    totalActiveHazards: 4,
    criticalHazards: 2,
    averageResolutionHours: 1.8,
    photoVerifiedRate: 96,
    totalCommutersProtected: 21800,
    crewReadinessScore: 94,
  });

  // Load initial hazards and stats from server
  const loadHazards = async () => {
    setIsLoading(true);
    try {
      const [data, stats] = await Promise.all([
        hazardService.getHazards(),
        hazardService.getWardStats(),
      ]);
      setHazards(data);
      if (stats) setWardStats(stats);
    } catch (err) {
      console.error('Error loading initial hazards:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHazards();
  }, []);

  // Update a single hazard in state
  const handleHazardUpdated = (updated: CivicHazard) => {
    setHazards((prev) =>
      prev.map((h) => (h.id === updated.id ? updated : h))
    );
    if (selectedHazard?.id === updated.id) {
      setSelectedHazard(updated);
    }
  };

  // Add newly reported hazard
  const handleHazardCreated = (newHazard: CivicHazard) => {
    setHazards((prev) => [newHazard, ...prev]);
    setSelectedHazard(newHazard);
    setCurrentView('map_view');
    studentAuthService.awardCivicCredits(150, 'hazard_logged');
    hapticFeedback();
  };

  // Commuter confirms hazard (+1)
  const handleConfirmHazard = async (id: string) => {
    try {
      const res = await hazardService.confirmHazard(id);
      setHazards((prev) =>
        prev.map((h) =>
          h.id === id
            ? {
                ...h,
                confirmationsCount: res.confirmationsCount,
                severityScore: res.severityScore,
              }
            : h
        )
      );
    } catch (err) {
      console.warn('Confirm error:', err);
    }
  };

  const activeHazardsCount = hazards.filter((h) => h.status !== 'RESOLVED_VERIFIED').length;
  const criticalHazardsCount = hazards.filter(
    (h) => h.severity === 'CRITICAL' && h.status !== 'RESOLVED_VERIFIED'
  ).length;

  // Handle successful authentication from start-of-site Gateway
  const handleAuthenticated = (role: UserRole) => {
    hapticFeedback();
    if (role === 'MUNICIPALITY_OFFICER') {
      setCurrentView('municipal_queue');
    } else {
      setCurrentView('map_view');
    }
  };

  // Handle Sign Out back to start-of-site Gateway
  const handleSignOut = () => {
    studentAuthService.logout();
    setCurrentView('auth_portal');
    hapticFeedback();
  };

  // 1. SEPARATE LOGIN & SIGN UP PAGE ON START OF SITE
  if (currentView === 'auth_portal') {
    return (
      <TesseractAuthGateway
        onAuthenticated={handleAuthenticated}
        onContinueAsGuest={() => {
          setCurrentView('map_view');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 flex flex-col antialiased">
      {/* Google Maps Quota Exhaustion Banner */}
      {gmpQuotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* System Initialization Overlay if requested */}
      {showWelcomeIntro && (
        <WelcomeIntroOverlay
          onComplete={() => setShowWelcomeIntro(false)}
          appName="TESSERACT"
          tagline="CIVIC HAZARD INTELLIGENCE NETWORK"
          activeHazardsCount={activeHazardsCount}
          userCoords={{ lat: telemetry.latitude, lng: telemetry.longitude }}
        />
      )}

      {/* 1. TOP BAR NAVBAR WITH 3D TESSERACT LOGO */}
      <StreetSafeNavbar
        currentView={currentView}
        onSelectView={(v) => setCurrentView(v)}
        onOpenQuickLog={() => setIsQuickLogOpen(true)}
        onOpenAuthPage={() => setCurrentView('auth_portal')}
        onSignOut={handleSignOut}
        onReplayIntro={() => setShowWelcomeIntro(true)}
        activeHazardsCount={activeHazardsCount}
        criticalHazardsCount={criticalHazardsCount}
        currentStudent={session.student}
        currentOfficer={session.officer}
        currentRole={session.role}
      />

      {/* 2. SUB-HEADER / WORKSPACE KICKER (ZERO-PILL UNBOXED METADATA WITH 3D TESSERACT) */}
      <div className="bg-[#090b10] text-stone-300 text-xs px-4 sm:px-6 py-2 border-b border-cyan-950/60">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-stone-400">
            <TesseractLogo size={18} glow={false} />
            {session.role === 'MUNICIPALITY_OFFICER' && session.officer ? (
              <>
                <span className="text-amber-400 font-semibold font-mono">MUNICIPAL DISPATCH ACTIVE</span>
                <span aria-hidden="true">·</span>
                <span className="text-white font-medium">{session.officer.fullName} ({session.officer.badgeNumber})</span>
                <span aria-hidden="true">·</span>
                <span>{session.officer.wardJurisdiction}</span>
                <span aria-hidden="true">·</span>
                <span className="text-amber-400 text-[11px] font-mono">DISPATCH LEVEL 2</span>
              </>
            ) : (
              <>
                <span className="text-white font-semibold font-mono text-cyan-400">TESSERACT</span>
                <span aria-hidden="true">·</span>
                <span>Hyper-Local Hazard Intelligence</span>
                <span aria-hidden="true">·</span>
                <span>Ward 12-16 Municipal Corridor</span>
                <span aria-hidden="true">·</span>
                <span className="hidden sm:inline">Active Road Safety Surveillance</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3 text-stone-400 font-mono">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>
                {telemetry.latitude.toFixed(4)}°N, {Math.abs(telemetry.longitude).toFixed(4)}°W
              </span>
            </span>
            <span aria-hidden="true">·</span>
            <span className={session.role === 'MUNICIPALITY_OFFICER' ? 'text-amber-400' : 'text-cyan-400'}>
              {session.role === 'MUNICIPALITY_OFFICER' ? 'Officer Dispatch Armed' : 'Live GIS Armed'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. MAIN WORKSPACE VIEWPORT */}
      <main className="flex-1 flex flex-col">
        {(currentView === 'map_view' || currentView === 'map_radar') && (
          <CivicHazardMap
            hazards={hazards}
            telemetry={telemetry}
            selectedHazard={selectedHazard}
            onSelectHazard={(h) => setSelectedHazard(h)}
            onConfirmHazard={handleConfirmHazard}
            onOpenQuickLog={() => setIsQuickLogOpen(true)}
            onOpenFixModal={(h) => setFixModalHazard(h)}
          />
        )}

        {currentView === 'municipal_queue' && (
          <MunicipalTriageQueue
            hazards={hazards}
            onHazardUpdated={handleHazardUpdated}
            onOpenFixModal={(h) => setFixModalHazard(h)}
            onViewOnMap={(h) => {
              setSelectedHazard(h);
              setCurrentView('map_view');
            }}
          />
        )}

        {currentView === 'verified_fixes' && (
          <VerifiedFixesShowcase
            hazards={hazards}
            onOpenFixModal={(h) => setFixModalHazard(h)}
          />
        )}

        {currentView === 'ward_analytics' && (
          <WardAnalyticsScorecard
            hazards={hazards}
            wardStats={wardStats}
          />
        )}
      </main>

      {/* 4. MODALS */}
      {/* Quick Hazard Logger Modal */}
      <PhotoHazardLoggerModal
        isOpen={isQuickLogOpen}
        onClose={() => setIsQuickLogOpen(false)}
        onHazardCreated={handleHazardCreated}
        userCoords={{ lat: telemetry.latitude, lng: telemetry.longitude }}
      />

      {/* Photo Fix Verification Modal */}
      <PhotoFixVerificationModal
        hazard={fixModalHazard}
        isOpen={Boolean(fixModalHazard)}
        onClose={() => setFixModalHazard(null)}
        onFixVerified={(updated) => {
          handleHazardUpdated(updated);
          studentAuthService.awardCivicCredits(200, 'fix_verified');
          setFixModalHazard(null);
        }}
      />
    </div>
  );
}
