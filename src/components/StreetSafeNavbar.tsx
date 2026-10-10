import React, { useState } from 'react';
import { AppViewMode, StudentProfile, MunicipalOfficerProfile, UserRole } from '../types';
import { TesseractLogo } from './TesseractLogo';
import {
  Plus,
  ShieldAlert,
  CheckCircle2,
  Map,
  Sparkles,
  User,
  Zap,
  Building2,
  Shield,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';

interface StreetSafeNavbarProps {
  currentView: AppViewMode;
  onSelectView: (view: AppViewMode) => void;
  onOpenQuickLog: () => void;
  onOpenAuthPage: () => void;
  onSignOut: () => void;
  onReplayIntro: () => void;
  activeHazardsCount: number;
  criticalHazardsCount: number;
  currentStudent?: StudentProfile | null;
  currentOfficer?: MunicipalOfficerProfile | null;
  currentRole?: UserRole;
}

export const StreetSafeNavbar: React.FC<StreetSafeNavbarProps> = ({
  currentView,
  onSelectView,
  onOpenQuickLog,
  onOpenAuthPage,
  onSignOut,
  onReplayIntro,
  activeHazardsCount,
  criticalHazardsCount,
  currentStudent,
  currentOfficer,
  currentRole,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const isAuthenticated = Boolean(currentStudent || currentOfficer);

  return (
    <>
      {/* MAIN TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-[#090b10]/95 backdrop-blur-md text-stone-100 border-b border-cyan-950/60 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 px-3 sm:px-6 py-2.5 sm:py-3">
          
          {/* Zone 1: Brand Wordmark with 3D Tesseract Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onSelectView('map_view')}
              className="flex items-center gap-2.5 text-left group focus:outline-none rounded-md cursor-pointer shrink-0"
              title="Tesseract Home"
            >
              <div className="relative flex items-center justify-center p-1 rounded-xl bg-stone-900 border border-cyan-500/40 shadow-[0_0_15px_rgba(56,189,248,0.35)] group-hover:border-cyan-400 group-hover:shadow-[0_0_20px_rgba(56,189,248,0.55)] transition-all">
                <TesseractLogo size={28} />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-base sm:text-lg font-bold tracking-tight text-white font-mono group-hover:text-cyan-300 transition-colors">
                    Tesseract
                  </span>
                  <span className="text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/50">
                    GIS
                  </span>
                </div>
                <span className="text-[10px] text-stone-400 font-mono hidden md:block leading-none">
                  Civic Hazard Intelligence
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-300">
            <button
              onClick={() => onSelectView('map_view')}
              className={`whitespace-nowrap transition-colors py-1 hover:text-white cursor-pointer ${
                currentView === 'map_view' ? 'text-cyan-400 font-semibold' : 'text-stone-300'
              }`}
            >
              Live Hazard Map
            </button>

            <button
              onClick={() => onSelectView('municipal_queue')}
              className={`whitespace-nowrap transition-colors py-1 hover:text-white flex items-center gap-1.5 cursor-pointer ${
                currentView === 'municipal_queue' ? 'text-cyan-400 font-semibold' : 'text-stone-300'
              }`}
            >
              <span>Municipal Queue</span>
              {criticalHazardsCount > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] font-mono font-bold bg-rose-600 text-white rounded">
                  {criticalHazardsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onSelectView('verified_fixes')}
              className={`whitespace-nowrap transition-colors py-1 hover:text-white cursor-pointer ${
                currentView === 'verified_fixes' ? 'text-cyan-400 font-semibold' : 'text-stone-300'
              }`}
            >
              Verified Fixes
            </button>
          </nav>

          {/* Zone 3: Actions & Account */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Quick Log Hazard Button */}
            <button
              onClick={onOpenQuickLog}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-semibold text-stone-950 bg-cyan-400 hover:bg-cyan-300 active:scale-95 transition-all rounded-lg shadow-[0_0_15px_rgba(56,189,248,0.35)] whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Report Hazard</span>
              <span className="sm:hidden font-bold">Report</span>
            </button>

            {/* User / Officer Account Trigger */}
            <div className="relative">
              <button
                onClick={() => {
                  if (isAuthenticated) {
                    setIsUserMenuOpen(!isUserMenuOpen);
                  } else {
                    onOpenAuthPage();
                  }
                }}
                className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg border font-mono text-xs transition-all cursor-pointer ${
                  currentRole === 'MUNICIPALITY_OFFICER' && currentOfficer
                    ? 'bg-amber-950/80 border-amber-500/60 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                    : currentStudent
                    ? 'bg-cyan-950/70 border-cyan-500/60 text-cyan-300 shadow-[0_0_12px_rgba(56,189,248,0.2)]'
                    : 'bg-stone-900 border-stone-750 text-stone-200 hover:border-cyan-500/50'
                }`}
              >
                {currentRole === 'MUNICIPALITY_OFFICER' && currentOfficer ? (
                  <>
                    <Building2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="max-w-[85px] sm:max-w-none truncate font-semibold">
                      {currentOfficer.fullName.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3 h-3 text-amber-400 hidden sm:inline" />
                  </>
                ) : currentStudent ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0" />
                    <span className="max-w-[75px] sm:max-w-none truncate font-semibold">
                      {currentStudent.fullName.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3 h-3 text-cyan-400 hidden sm:inline" />
                  </>
                ) : (
                  <>
                    <User className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="hidden sm:inline">Login / Sign Up</span>
                    <span className="sm:hidden">Login</span>
                  </>
                )}
              </button>

              {/* Account Dropdown */}
              {isUserMenuOpen && isAuthenticated && (
                <div className="absolute right-0 top-full mt-2 w-60 rounded-xl bg-[#0e1017] border border-stone-750 shadow-2xl p-2 z-50 text-xs font-mono animate-[fadeIn_0.15s_ease-out]">
                  <div className="p-2.5 border-b border-stone-800">
                    <div className="text-white font-bold truncate">
                      {currentOfficer ? currentOfficer.fullName : currentStudent?.fullName}
                    </div>
                    <div className="text-[10px] text-stone-400 truncate mt-0.5">
                      {currentOfficer
                        ? `${currentOfficer.badgeNumber} · Ward Officer`
                        : `${currentStudent?.studentIdNumber || 'Citizen'} · Active`}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onOpenAuthPage();
                    }}
                    className="w-full text-left px-2.5 py-2 rounded text-stone-300 hover:text-white hover:bg-stone-850 transition-colors flex items-center justify-between"
                  >
                    <span>Switch Role / Terminal</span>
                    <Zap className="w-3.5 h-3.5 text-cyan-400" />
                  </button>

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onSignOut();
                    }}
                    className="w-full text-left px-2.5 py-2 rounded text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors flex items-center justify-between mt-1"
                  >
                    <span>Sign Out</span>
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-900 border border-stone-800"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>
        </div>

        {/* MOBILE SLIDE-DOWN DRAWER MENU */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-stone-800 bg-[#07090e] px-4 py-3 space-y-2 font-mono text-xs">
            <button
              onClick={() => {
                onSelectView('map_view');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full text-left py-2 px-3 rounded-lg flex items-center justify-between ${
                currentView === 'map_view' ? 'bg-cyan-950/80 text-cyan-300 font-bold' : 'text-stone-300'
              }`}
            >
              <span>Live Hazard Map</span>
              <Map className="w-4 h-4 text-cyan-400" />
            </button>

            <button
              onClick={() => {
                onSelectView('municipal_queue');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full text-left py-2 px-3 rounded-lg flex items-center justify-between ${
                currentView === 'municipal_queue' ? 'bg-cyan-950/80 text-cyan-300 font-bold' : 'text-stone-300'
              }`}
            >
              <span>Municipal Queue</span>
              {criticalHazardsCount > 0 ? (
                <span className="px-1.5 py-0.2 text-[10px] bg-rose-600 text-white rounded font-bold">
                  {criticalHazardsCount} CRITICAL
                </span>
              ) : (
                <ShieldAlert className="w-4 h-4 text-amber-400" />
              )}
            </button>

            <button
              onClick={() => {
                onSelectView('verified_fixes');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full text-left py-2 px-3 rounded-lg flex items-center justify-between ${
                currentView === 'verified_fixes' ? 'bg-cyan-950/80 text-cyan-300 font-bold' : 'text-stone-300'
              }`}
            >
              <span>Verified Fixes Showcase</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </button>

            <button
              onClick={() => {
                onOpenAuthPage();
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 px-3 rounded-lg flex items-center justify-between text-cyan-400 border border-cyan-800/40 bg-cyan-950/30"
            >
              <span>{isAuthenticated ? 'Switch Account / Role' : 'Login / Register Portal'}</span>
              <User className="w-4 h-4" />
            </button>
          </div>
        )}
      </header>

      {/* MOBILE BOTTOM APP BAR (Docked for high thumb comfort on phones) */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#090b10]/95 backdrop-blur-lg border-t border-stone-800 flex items-center justify-around px-2 py-1.5 shadow-2xl"
        style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
      >
        <button
          onClick={() => onSelectView('map_view')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] rounded-lg transition-colors cursor-pointer ${
            currentView === 'map_view' ? 'text-cyan-400 font-semibold' : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Map className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-mono">Map</span>
        </button>

        <button
          onClick={() => onSelectView('municipal_queue')}
          className={`relative flex flex-col items-center justify-center min-w-[56px] min-h-[44px] rounded-lg transition-colors cursor-pointer ${
            currentView === 'municipal_queue' ? 'text-cyan-400 font-semibold' : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <ShieldAlert className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-mono">Queue</span>
          {criticalHazardsCount > 0 && (
            <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#090b10]" />
          )}
        </button>

        <button
          onClick={() => onSelectView('verified_fixes')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] rounded-lg transition-colors cursor-pointer ${
            currentView === 'verified_fixes' ? 'text-cyan-400 font-semibold' : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <CheckCircle2 className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-mono">Fixes</span>
        </button>

        <button
          onClick={onOpenAuthPage}
          className="flex flex-col items-center justify-center min-w-[56px] min-h-[44px] rounded-lg text-stone-400 hover:text-stone-200 cursor-pointer"
        >
          <User className="w-5 h-5 mb-0.5 text-cyan-400" />
          <span className="text-[10px] font-mono">{isAuthenticated ? 'Account' : 'Login'}</span>
        </button>
      </nav>
    </>
  );
};
