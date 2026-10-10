import React from 'react';
import { CivicHazard, WardStatistics } from '../types';
import {
  BarChart3,
  ShieldCheck,
  Clock,
  Printer,
  Download,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  MapPin,
} from 'lucide-react';

interface WardAnalyticsScorecardProps {
  hazards: CivicHazard[];
  wardStats: WardStatistics;
}

export const WardAnalyticsScorecard: React.FC<WardAnalyticsScorecardProps> = ({
  hazards,
  wardStats,
}) => {
  const criticalCount = hazards.filter((h) => h.severity === 'CRITICAL').length;
  const resolvedCount = hazards.filter((h) => h.status === 'RESOLVED_VERIFIED').length;
  const inProgressCount = hazards.filter(
    (h) => h.status === 'CREW_DISPATCHED' || h.status === 'UNDER_REPAIR'
  ).length;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-stone-900" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900">
              Ward Municipal Safety Scorecard
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Auditing hazard response velocity, photographic proof compliance, and civic risk mitigation
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-lg border border-stone-200 transition-colors print:hidden"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Ward Audit Report</span>
        </button>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <div className="text-xs font-medium text-stone-500">Active Incidents</div>
          <div className="text-2xl font-bold font-mono text-stone-900 mt-1 tabular-nums">
            {hazards.filter((h) => h.status !== 'RESOLVED_VERIFIED').length}
          </div>
          <div className="text-[11px] text-rose-600 mt-1 font-medium">
            {criticalCount} critical danger points
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <div className="text-xs font-medium text-stone-500">Photo-Verified Rate</div>
          <div className="text-2xl font-bold font-mono text-emerald-600 mt-1 tabular-nums">
            {wardStats.photoVerifiedRate}%
          </div>
          <div className="text-[11px] text-emerald-700 mt-1 font-medium">
            100% verified before closing
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <div className="text-xs font-medium text-stone-500">Avg Resolution Speed</div>
          <div className="text-2xl font-bold font-mono text-stone-900 mt-1 tabular-nums">
            {wardStats.averageResolutionHours} hrs
          </div>
          <div className="text-[11px] text-stone-500 mt-1 font-medium">
            From log to photo verify
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <div className="text-xs font-medium text-stone-500">Commuters Protected</div>
          <div className="text-2xl font-bold font-mono text-blue-600 mt-1 tabular-nums">
            {wardStats.totalCommutersProtected.toLocaleString()}
          </div>
          <div className="text-[11px] text-blue-700 mt-1 font-medium">
            Daily footfall secured
          </div>
        </div>
      </div>

      {/* Category Breakdown & Hotspot Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Breakdown by Category */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider text-xs">
            Hazard Category Distribution
          </h3>

          <div className="space-y-3">
            {[
              { label: 'Open Manholes', key: 'OPEN_MANHOLE', color: 'bg-rose-600' },
              { label: 'Dangling Live Wires', key: 'DANGLING_LIVE_WIRE', color: 'bg-amber-500' },
              { label: 'Severe Waterlogging', key: 'WATERLOGGING', color: 'bg-blue-600' },
              { label: 'Broken Footpaths', key: 'BROKEN_FOOTPATH', color: 'bg-orange-600' },
            ].map((cat) => {
              const count = hazards.filter((h) => h.category === cat.key).length;
              const pct = hazards.length > 0 ? Math.round((count / hazards.length) * 100) : 0;

              return (
                <div key={cat.key} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-stone-700">{cat.label}</span>
                    <span className="font-mono text-stone-500 tabular-nums">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${cat.color} rounded-full`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ward Action Center Table */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider text-xs">
            Municipal Ward Sector Audit Status
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Ward Sector</th>
                  <th className="py-2.5 px-3">Active Risks</th>
                  <th className="py-2.5 px-3">Crews On Road</th>
                  <th className="py-2.5 px-3">Photo Fix Rate</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                <tr>
                  <td className="py-2.5 px-3 font-medium text-stone-900">Ward 12 - Downtown Sector</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-rose-700">1 Critical (Open Manhole)</td>
                  <td className="py-2.5 px-3">Sewer Squad #03</td>
                  <td className="py-2.5 px-3 font-mono">98%</td>
                  <td className="py-2.5 px-3 text-right text-rose-600 font-semibold">Priority Triage</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-medium text-stone-900">Ward 14 - Metro Junction</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-amber-700">1 Critical (Live Wire)</td>
                  <td className="py-2.5 px-3">Grid Unit #07 (En Route)</td>
                  <td className="py-2.5 px-3 font-mono">94%</td>
                  <td className="py-2.5 px-3 text-right text-amber-600 font-semibold">Crew Dispatched</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-medium text-stone-900">Ward 16 - Residential East</td>
                  <td className="py-2.5 px-3 font-mono">1 High (Broken Sidewalk)</td>
                  <td className="py-2.5 px-3">Pavement Van #12</td>
                  <td className="py-2.5 px-3 font-mono">92%</td>
                  <td className="py-2.5 px-3 text-right text-blue-600 font-semibold">Under Repair</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-medium text-stone-900">Ward 11 - South Hub</td>
                  <td className="py-2.5 px-3 font-mono text-emerald-600">0 Open Risks</td>
                  <td className="py-2.5 px-3">Inspection Standby</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-emerald-600">100%</td>
                  <td className="py-2.5 px-3 text-right text-emerald-600 font-semibold">Verified Safe</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
