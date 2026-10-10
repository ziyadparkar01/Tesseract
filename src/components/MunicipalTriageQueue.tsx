import React, { useState, useMemo } from 'react';
import {
  CivicHazard,
  HazardStatus,
  HazardSeverity,
  DispatchedCrewInfo,
} from '../types';
import { hazardService } from '../services/hazardService';
import { studentAuthService } from '../services/studentAuthService';
import { hapticFeedback } from '../utils/haptics';
import {
  AlertTriangle,
  ShieldAlert,
  Clock,
  MapPin,
  Camera,
  CheckCircle2,
  Users,
  Search,
  Truck,
  Sparkles,
  ArrowUpDown,
  Filter,
  ExternalLink,
  Building2,
  Shield,
  HardHat,
} from 'lucide-react';

interface MunicipalTriageQueueProps {
  hazards: CivicHazard[];
  onHazardUpdated: (updated: CivicHazard) => void;
  onOpenFixModal: (hazard: CivicHazard) => void;
  onViewOnMap: (hazard: CivicHazard) => void;
}

export const MunicipalTriageQueue: React.FC<MunicipalTriageQueueProps> = ({
  hazards,
  onHazardUpdated,
  onOpenFixModal,
  onViewOnMap,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [dispatchModalHazard, setDispatchModalHazard] = useState<CivicHazard | null>(null);

  // Crew dispatch form state
  const [crewName, setCrewName] = useState('Municipal Works Squad #04');
  const [leadOfficer, setLeadOfficer] = useState('Officer Dave Miller');
  const [contactNumber, setContactNumber] = useState('+1 (555) 019-4822');
  const [etaMinutes, setEtaMinutes] = useState(15);
  const [isDispatching, setIsDispatching] = useState(false);

  // Filtered & ranked hazards
  const filteredRankedHazards = useMemo(() => {
    let result = [...hazards];

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((h) => h.status === statusFilter);
    }

    // Severity filter
    if (severityFilter !== 'all') {
      result = result.filter((h) => h.severity === severityFilter);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (h) =>
          h.title.toLowerCase().includes(q) ||
          h.location.address.toLowerCase().includes(q) ||
          h.location.ward.toLowerCase().includes(q) ||
          h.category.toLowerCase().includes(q)
      );
    }

    // Strict Municipal Priority Ranking:
    // 1. Unresolved critical incidents ranked by Severity Score descending
    // 2. Resolved incidents at the bottom
    result.sort((a, b) => {
      if (a.status === 'RESOLVED_VERIFIED' && b.status !== 'RESOLVED_VERIFIED') return 1;
      if (a.status !== 'RESOLVED_VERIFIED' && b.status === 'RESOLVED_VERIFIED') return -1;
      return b.severityScore - a.severityScore;
    });

    return result;
  }, [hazards, statusFilter, severityFilter, searchQuery]);

  const handleDispatchCrew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchModalHazard) return;

    setIsDispatching(true);
    hapticFeedback();

    try {
      const updated = await hazardService.updateStatus(dispatchModalHazard.id, {
        status: 'CREW_DISPATCHED',
        crewName,
        leadOfficer,
        contactNumber,
        etaMinutes,
      });
      onHazardUpdated(updated);
      setDispatchModalHazard(null);
    } catch (err: any) {
      console.warn('Failed to dispatch crew:', err);
    } finally {
      setIsDispatching(false);
    }
  };

  const handleMarkUnderRepair = async (hazard: CivicHazard) => {
    hapticFeedback();
    try {
      const updated = await hazardService.updateStatus(hazard.id, {
        status: 'UNDER_REPAIR',
      });
      onHazardUpdated(updated);
    } catch (err: any) {
      console.warn('Update failed:', err);
    }
  };

  const currentOfficer = studentAuthService.getCurrentOfficer();
  const isOfficer = studentAuthService.isOfficer();

  React.useEffect(() => {
    if (dispatchModalHazard && currentOfficer) {
      setLeadOfficer(currentOfficer.fullName);
      if (currentOfficer.assignedCrewUnit) {
        setCrewName(currentOfficer.assignedCrewUnit);
      }
    }
  }, [dispatchModalHazard, currentOfficer]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Officer Clearance Authority Banner */}
      {isOfficer && currentOfficer && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-gradient-to-r from-amber-950/40 via-[#18130a] to-stone-900 border border-amber-500/40 text-xs font-mono shadow-sm">
          <div className="flex items-center gap-2.5 text-amber-300">
            <div className="w-6 h-6 rounded bg-amber-500/20 border border-amber-400/40 flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div>
              <span className="font-bold text-white">{currentOfficer.fullName}</span>
              <span className="text-amber-400 ml-1.5 font-semibold">[{currentOfficer.badgeNumber}]</span>
              <span className="text-stone-500 mx-2">·</span>
              <span className="text-stone-300">{currentOfficer.wardJurisdiction}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-900/60 border border-amber-600/50 text-amber-200 font-bold">
              {currentOfficer.clearanceLevel.replace(/_/g, ' ')}
            </span>
          </div>
        </div>
      )}

      {/* Header & Metric Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded bg-rose-600" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900">
              Municipal Triage & Severity-Ranked Queue
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Real-time urban hazard triage for municipal engineers, ward corporators, and emergency crews
          </p>
        </div>

        {/* Quick summary strip */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 bg-rose-50 border border-rose-200 rounded-lg text-center">
            <div className="text-lg font-bold font-mono text-rose-700 leading-none">
              {hazards.filter((h) => h.severity === 'CRITICAL' && h.status !== 'RESOLVED_VERIFIED').length}
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-rose-600 mt-0.5">
              Critical Urgency
            </div>
          </div>
          <div className="px-3.5 py-2 bg-amber-50 border border-amber-200 rounded-lg text-center">
            <div className="text-lg font-bold font-mono text-amber-700 leading-none">
              {hazards.filter((h) => h.status === 'CREW_DISPATCHED').length}
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-amber-600 mt-0.5">
              Crews En Route
            </div>
          </div>
          <div className="px-3.5 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
            <div className="text-lg font-bold font-mono text-emerald-700 leading-none">
              {hazards.filter((h) => h.status === 'RESOLVED_VERIFIED').length}
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 mt-0.5">
              Photo Verified
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-stone-200 shadow-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search by street name, ward, or hazard type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium"
          />
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2 overflow-x-auto">
          {/* Status Tabs */}
          <div className="flex items-center p-0.5 bg-stone-100 rounded-lg text-xs font-medium">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-md transition-colors ${
                statusFilter === 'all' ? 'bg-white text-stone-900 shadow-xs font-bold' : 'text-stone-600'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('REPORTED')}
              className={`px-3 py-1 rounded-md transition-colors ${
                statusFilter === 'REPORTED' ? 'bg-white text-rose-700 shadow-xs font-bold' : 'text-stone-600'
              }`}
            >
              Open
            </button>
            <button
              onClick={() => setStatusFilter('CREW_DISPATCHED')}
              className={`px-3 py-1 rounded-md transition-colors ${
                statusFilter === 'CREW_DISPATCHED' ? 'bg-white text-amber-700 shadow-xs font-bold' : 'text-stone-600'
              }`}
            >
              Dispatched
            </button>
            <button
              onClick={() => setStatusFilter('UNDER_REPAIR')}
              className={`px-3 py-1 rounded-md transition-colors ${
                statusFilter === 'UNDER_REPAIR' ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-stone-600'
              }`}
            >
              Repairing
            </button>
            <button
              onClick={() => setStatusFilter('RESOLVED_VERIFIED')}
              className={`px-3 py-1 rounded-md transition-colors ${
                statusFilter === 'RESOLVED_VERIFIED' ? 'bg-white text-emerald-700 shadow-xs font-bold' : 'text-stone-600'
              }`}
            >
              Verified
            </button>
          </div>
        </div>
      </div>

      {/* Priority-Ranked List */}
      <div className="space-y-3">
        {filteredRankedHazards.map((hazard, index) => {
          const isCritical = hazard.severity === 'CRITICAL';
          const isResolved = hazard.status === 'RESOLVED_VERIFIED';

          return (
            <div
              key={hazard.id}
              className={`bg-white rounded-xl border transition-all p-4 sm:p-5 shadow-xs ${
                isResolved
                  ? 'border-emerald-200 bg-emerald-50/20'
                  : isCritical
                  ? 'border-rose-300 hover:border-rose-400'
                  : 'border-stone-200 hover:border-stone-300'
              }`}
            >
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                {/* Left: Thumbnail & Core Info */}
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  {/* Photo with severity stamp */}
                  <div className="relative w-28 h-20 sm:w-36 sm:h-24 rounded-lg overflow-hidden shrink-0 border border-stone-200 bg-stone-100">
                    <img
                      src={hazard.photoUrl}
                      alt={hazard.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div
                      className={`absolute top-1 left-1 px-1.5 py-0.2 rounded font-mono text-[10px] font-bold text-white shadow-xs ${
                        isResolved
                          ? 'bg-emerald-600'
                          : isCritical
                          ? 'bg-rose-700'
                          : 'bg-stone-800'
                      }`}
                    >
                      {isResolved ? 'RESOLVED' : `SEV ${hazard.severityScore}`}
                    </div>
                  </div>

                  {/* Incident Text Block */}
                  <div className="min-w-0 flex-1">
                    {/* Rank Number & Metadata (Zero-pill text separators) */}
                    <div className="flex items-center gap-2 text-xs text-stone-500 mb-1 flex-wrap">
                      <span className="font-mono font-bold text-stone-900">
                        #{index + 1}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-semibold text-stone-700">
                        {hazard.category.replace(/_/g, ' ')}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{hazard.location.ward}</span>
                      <span aria-hidden="true">·</span>
                      <span>{hazard.confirmationsCount} commuter confirmations</span>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-stone-950 leading-snug truncate">
                      {hazard.title}
                    </h3>

                    <p className="text-xs text-stone-600 line-clamp-1 mt-0.5">
                      {hazard.description}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-stone-500 mt-2 flex-wrap">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-stone-400" />
                        <span>{hazard.location.address}</span>
                      </span>

                      {hazard.dispatchedCrew && (
                        <span className="flex items-center gap-1 text-amber-700 font-medium">
                          <Truck className="w-3.5 h-3.5" />
                          <span>Crew: {hazard.dispatchedCrew.crewName} (ETA {hazard.dispatchedCrew.etaMinutes}m)</span>
                        </span>
                      )}

                      {hazard.resolution && (
                        <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>AI Photo Verified · {hazard.resolution.verificationConfidence}% confidence</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 shrink-0 w-full lg:w-auto justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-stone-100">
                  <button
                    onClick={() => onViewOnMap(hazard)}
                    className="px-3 py-1.5 text-xs font-semibold text-stone-700 hover:text-stone-950 bg-stone-100 hover:bg-stone-200 rounded transition-colors flex items-center gap-1"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>View Map</span>
                  </button>

                  {hazard.status === 'REPORTED' && (
                    <button
                      onClick={() => setDispatchModalHazard(hazard)}
                      className="px-3.5 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded transition-colors flex items-center gap-1 shadow-xs"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Dispatch Crew</span>
                    </button>
                  )}

                  {hazard.status === 'CREW_DISPATCHED' && (
                    <button
                      onClick={() => handleMarkUnderRepair(hazard)}
                      className="px-3.5 py-1.5 text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded transition-colors"
                    >
                      Mark Under Repair
                    </button>
                  )}

                  {!isResolved ? (
                    <button
                      onClick={() => onOpenFixModal(hazard)}
                      className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Verify Fix with Photo</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onOpenFixModal(hazard)}
                      className="px-3.5 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded transition-colors flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>View Audit Proof</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredRankedHazards.length === 0 && (
          <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
            <h3 className="text-base font-bold text-stone-900">Queue is Clear</h3>
            <p className="text-xs text-stone-500 mt-1">
              No civic road hazards match your current filter parameters.
            </p>
          </div>
        )}
      </div>

      {/* DISPATCH CREW MODAL */}
      {dispatchModalHazard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-stone-200">
            <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <Truck className="w-4 h-4 text-rose-600" />
              <span>Dispatch Rapid Response Squad</span>
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              Target: {dispatchModalHazard.title} ({dispatchModalHazard.location.address})
            </p>

            <form onSubmit={handleDispatchCrew} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Assigned Public Works Crew
                </label>
                <select
                  value={crewName}
                  onChange={(e) => setCrewName(e.target.value)}
                  className="w-full text-xs bg-stone-50 border border-stone-300 rounded px-3 py-2 text-stone-900 font-medium"
                >
                  <option value="Municipal Power & Grid Rapid Squad">Municipal Power & Grid Rapid Squad (Electric)</option>
                  <option value="Drainage & Stormwater Sewer Unit #3">Drainage & Stormwater Sewer Unit #3 (Manholes)</option>
                  <option value="Pavement & Concrete Repair Crew #07">Pavement & Concrete Repair Crew #07 (Sidewalks)</option>
                  <option value="Emergency Road Clearance Squad">Emergency Road Clearance Squad (Debris)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Lead Supervisor / Officer
                </label>
                <input
                  type="text"
                  value={leadOfficer}
                  onChange={(e) => setLeadOfficer(e.target.value)}
                  className="w-full text-xs bg-stone-50 border border-stone-300 rounded px-3 py-2 text-stone-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    className="w-full text-xs font-mono bg-stone-50 border border-stone-300 rounded px-3 py-2 text-stone-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                    ETA (Minutes)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="120"
                    value={etaMinutes}
                    onChange={(e) => setEtaMinutes(Number(e.target.value))}
                    className="w-full text-xs font-mono bg-stone-50 border border-stone-300 rounded px-3 py-2 text-stone-900"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-200 mt-4">
                <button
                  type="button"
                  onClick={() => setDispatchModalHazard(null)}
                  className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDispatching}
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded shadow-sm disabled:opacity-50"
                >
                  {isDispatching ? 'Dispatching...' : 'Confirm Squad Dispatch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
