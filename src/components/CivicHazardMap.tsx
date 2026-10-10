import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  APIProvider,
  Map,
  useMap,
} from '@vis.gl/react-google-maps';
import {
  AlertTriangle,
  Zap,
  Droplets,
  Footprints,
  Compass,
  Navigation,
  ShieldCheck,
  CheckCircle2,
  Crosshair,
  Layers,
  ZoomIn,
  ZoomOut,
  Radio,
  Plus,
  Map as MapIcon,
  RefreshCw,
} from 'lucide-react';
import { CivicHazard, HazardCategory, HazardSeverity } from '../types';
import { MovementTelemetry, movementTrackingService } from '../services/movementTrackingService';
import { hapticFeedback } from '../utils/haptics';

interface CivicHazardMapProps {
  hazards: CivicHazard[];
  telemetry: MovementTelemetry;
  selectedHazard: CivicHazard | null;
  onSelectHazard: (hazard: CivicHazard | null) => void;
  onConfirmHazard: (hazardId: string) => void;
  onOpenQuickLog: () => void;
  onOpenFixModal?: (hazard: CivicHazard) => void;
}

// Haversine distance formula in meters
function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

// Inner camera controller with pan, zoom and recenter
const MapCameraController: React.FC<{
  latitude: number;
  longitude: number;
  followUser: boolean;
  zoom: number;
  onUserPanned: () => void;
}> = ({ latitude, longitude, followUser, zoom, onUserPanned }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    const dragListener = map.addListener('dragstart', () => {
      onUserPanned();
    });
    return () => {
      const gMaps = (window as any).google?.maps;
      if (gMaps?.event) {
        gMaps.event.removeListener(dragListener);
      }
    };
  }, [map, onUserPanned]);

  useEffect(() => {
    if (!map || !followUser) return;
    map.panTo({ lat: latitude, lng: longitude });
  }, [map, latitude, longitude, followUser]);

  useEffect(() => {
    if (!map) return;
    map.setZoom(zoom);
  }, [map, zoom]);

  return null;
};

// Safe native Google Maps marker manager (bypasses React 19 createPortal getRootNode bugs)
const NativeGoogleMapMarkers: React.FC<{
  telemetry: MovementTelemetry;
  hazards: CivicHazard[];
  selectedHazard: CivicHazard | null;
  onSelectHazard: (h: CivicHazard) => void;
}> = ({ telemetry, hazards, selectedHazard, onSelectHazard }) => {
  const map = useMap();
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    if (!map) return;
    const gMaps = (window as any).google?.maps;
    if (!gMaps) return;

    // Clean up existing markers
    markersRef.current.forEach((m) => {
      try {
        if (m) {
          if (typeof m.map !== 'undefined') m.map = null;
          if (typeof m.setMap === 'function') m.setMap(null);
        }
      } catch (_) {}
    });
    markersRef.current = [];

    const AdvancedMarkerClass = gMaps.marker?.AdvancedMarkerElement || gMaps.Marker;

    // 1. Commuter Live Location Marker
    try {
      const userEl = document.createElement('div');
      userEl.style.cssText = 'position:relative;display:flex;align-items:center;justify-content:center;cursor:pointer;';
      userEl.innerHTML = `
        <div style="position:relative;z-index:10;width:32px;height:32px;border-radius:50%;background:#06b6d4;border:2px solid #ffffff;box-shadow:0 0 16px rgba(6,182,212,0.6);display:flex;align-items:center;justify-content:center;">
          <svg style="width:16px;height:16px;stroke:#090b10;fill:none;stroke-width:2.5;transform:rotate(${telemetry.headingDegrees || 0}deg)" viewBox="0 0 24 24">
            <polygon points="3 11 22 2 13 21 11 13 3 11"/>
          </svg>
        </div>
        <div style="position:absolute;bottom:-20px;padding:2px 6px;background:#090b10;color:#67e8f9;font-family:monospace;font-size:9px;font-weight:bold;border-radius:4px;white-space:nowrap;border:1px solid #164e63;box-shadow:0 2px 4px rgba(0,0,0,0.5);">
          Your Location
        </div>
      `;

      if (gMaps.marker?.AdvancedMarkerElement) {
        const userMarker = new gMaps.marker.AdvancedMarkerElement({
          map,
          position: { lat: telemetry.latitude, lng: telemetry.longitude },
          title: 'Your Location',
          content: userEl,
        });
        markersRef.current.push(userMarker);
      } else {
        const userMarker = new gMaps.Marker({
          map,
          position: { lat: telemetry.latitude, lng: telemetry.longitude },
          title: 'Your Location',
        });
        markersRef.current.push(userMarker);
      }
    } catch (e) {
      console.warn('User marker error:', e);
    }

    // 2. Civic Hazard Markers
    hazards.forEach((hazard) => {
      try {
        let emoji = '⚠️';
        let bg = '#e11d48';
        if (hazard.status === 'RESOLVED_VERIFIED') {
          emoji = '✓';
          bg = '#059669';
        } else if (hazard.category === 'OPEN_MANHOLE') {
          emoji = '🕳️';
          bg = '#be123c';
        } else if (hazard.category === 'DANGLING_LIVE_WIRE') {
          emoji = '⚡';
          bg = '#f59e0b';
        } else if (hazard.category === 'WATERLOGGING') {
          emoji = '💧';
          bg = '#2563eb';
        } else if (hazard.category === 'BROKEN_FOOTPATH') {
          emoji = '🚶';
          bg = '#ea580c';
        }

        const isSelected = selectedHazard?.id === hazard.id;

        const hazardEl = document.createElement('div');
        hazardEl.style.cssText = `position:relative;cursor:pointer;transition:transform 0.15s ease;transform:scale(${isSelected ? 1.25 : 1});`;
        hazardEl.innerHTML = `
          <div style="width:36px;height:36px;border-radius:50%;background:${bg};color:white;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(0,0,0,0.45);border:2px solid white;font-size:16px;">
            ${emoji}
          </div>
          <div style="position:absolute;bottom:-4px;right:-4px;padding:1px 4px;background:#1c1917;color:white;font-family:monospace;font-size:8px;font-weight:bold;border-radius:3px;box-shadow:0 1px 2px rgba(0,0,0,0.5);">
            ${hazard.severityScore}
          </div>
        `;

        hazardEl.onclick = (e) => {
          e.stopPropagation();
          onSelectHazard(hazard);
        };

        if (gMaps.marker?.AdvancedMarkerElement) {
          const hMarker = new gMaps.marker.AdvancedMarkerElement({
            map,
            position: { lat: hazard.location.lat, lng: hazard.location.lng },
            title: `${hazard.title} (${hazard.severity})`,
            content: hazardEl,
          });
          if (typeof hMarker.addListener === 'function') {
            hMarker.addListener('click', () => onSelectHazard(hazard));
          }
          markersRef.current.push(hMarker);
        } else {
          const hMarker = new gMaps.Marker({
            map,
            position: { lat: hazard.location.lat, lng: hazard.location.lng },
            title: `${hazard.title} (${hazard.severity})`,
          });
          if (typeof hMarker.addListener === 'function') {
            hMarker.addListener('click', () => onSelectHazard(hazard));
          }
          markersRef.current.push(hMarker);
        }
      } catch (err) {
        console.warn('Hazard marker error:', err);
      }
    });

    return () => {
      markersRef.current.forEach((m) => {
        try {
          if (m) {
            if (typeof m.map !== 'undefined') m.map = null;
            if (typeof m.setMap === 'function') m.setMap(null);
          }
        } catch (_) {}
      });
      markersRef.current = [];
    };
  }, [map, telemetry.latitude, telemetry.longitude, telemetry.headingDegrees, hazards, selectedHazard?.id, onSelectHazard]);

  return null;
};

export const CivicHazardMap: React.FC<CivicHazardMapProps> = ({
  hazards,
  telemetry,
  selectedHazard,
  onSelectHazard,
  onConfirmHazard,
  onOpenQuickLog,
  onOpenFixModal,
}) => {
  const apiKey =
    (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) ||
    'AIzaSyB7T9N4-Q0HK43gKFz-DDVBwCs3yxuNcrk';

  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [activeSeverityFilter, setActiveSeverityFilter] = useState<string>('all');
  const [followCommuter, setFollowCommuter] = useState<boolean>(true);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid' | 'terrain'>('roadmap');
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(15);

  const lastAlertedHazardIdRef = useRef<string | null>(null);

  // Filter hazards
  const filteredHazards = useMemo(() => {
    return hazards.filter((h) => {
      if (activeCategoryFilter !== 'all' && h.category !== activeCategoryFilter) return false;
      if (activeSeverityFilter !== 'all' && h.severity !== activeSeverityFilter) return false;
      return true;
    });
  }, [hazards, activeCategoryFilter, activeSeverityFilter]);

  // Compute distance to commuter
  const hazardsWithDistance = useMemo(() => {
    return filteredHazards.map((h) => {
      const dist = calculateDistanceMeters(
        telemetry.latitude,
        telemetry.longitude,
        h.location.lat,
        h.location.lng
      );
      return { ...h, distanceMeters: dist };
    }).sort((a, b) => a.distanceMeters - b.distanceMeters);
  }, [filteredHazards, telemetry.latitude, telemetry.longitude]);

  const nearestHazard = hazardsWithDistance.find((h) => h.status !== 'RESOLVED_VERIFIED') || null;

  // Nearest hazard for visual proximity safety indicator
  useEffect(() => {
    if (
      nearestHazard &&
      nearestHazard.distanceMeters <= 75 &&
      nearestHazard.id !== lastAlertedHazardIdRef.current &&
      (nearestHazard.severity === 'CRITICAL' || nearestHazard.severity === 'HIGH')
    ) {
      lastAlertedHazardIdRef.current = nearestHazard.id;
      hapticFeedback();
    }
  }, [nearestHazard?.distanceMeters, nearestHazard?.id]);

  // Keyboard navigation for desktop testing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') return;

      const key = e.key.toLowerCase();
      if (key === 'w' || key === 'arrowup') {
        movementTrackingService.moveInHeading(2.5);
      } else if (key === 's' || key === 'arrowdown') {
        movementTrackingService.moveInHeading(-2.5);
      } else if (key === 'a' || key === 'arrowleft') {
        movementTrackingService.rotateHeading(-15);
      } else if (key === 'd' || key === 'arrowright') {
        movementTrackingService.rotateHeading(15);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleMapClick = (e: any) => {
    const latLng = e.detail?.latLng;
    if (latLng) {
      hapticFeedback();
      movementTrackingService.walkTowards(latLng.lat, latLng.lng, 2.0);
    }
  };

  const handleRecenter = () => {
    hapticFeedback();
    setFollowCommuter(true);
    movementTrackingService.requestCurrentLocation();
  };

  const getMarkerIcon = (category: HazardCategory, status: string, severityScore: number) => {
    if (status === 'RESOLVED_VERIFIED') {
      return (
        <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg border-2 border-white ring-2 ring-emerald-300 transition-transform hover:scale-110">
          <CheckCircle2 className="w-4 h-4 stroke-[3]" />
        </div>
      );
    }
    switch (category) {
      case 'OPEN_MANHOLE':
        return (
          <div className="relative group cursor-pointer transition-transform hover:scale-110">
            <div className="w-10 h-10 rounded-full bg-rose-700 text-white flex items-center justify-center shadow-xl border-2 border-white ring-4 ring-rose-400/50 animate-pulse">
              <span className="text-base">🕳️</span>
            </div>
            <div className="absolute -bottom-1 -right-1 px-1 py-0.2 bg-stone-900 text-white font-mono text-[9px] font-bold rounded shadow-xs">
              {severityScore}
            </div>
          </div>
        );
      case 'DANGLING_LIVE_WIRE':
        return (
          <div className="relative group cursor-pointer transition-transform hover:scale-110">
            <div className="w-10 h-10 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center shadow-xl border-2 border-white ring-4 ring-amber-300/60 animate-bounce">
              <Zap className="w-5 h-5 stroke-[3]" />
            </div>
            <div className="absolute -bottom-1 -right-1 px-1 py-0.2 bg-stone-900 text-white font-mono text-[9px] font-bold rounded shadow-xs">
              {severityScore}
            </div>
          </div>
        );
      case 'WATERLOGGING':
        return (
          <div className="relative group cursor-pointer transition-transform hover:scale-110">
            <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg border-2 border-white ring-2 ring-blue-300">
              <Droplets className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
        );
      case 'BROKEN_FOOTPATH':
        return (
          <div className="relative group cursor-pointer transition-transform hover:scale-110">
            <div className="w-9 h-9 rounded-full bg-orange-600 text-white flex items-center justify-center shadow-lg border-2 border-white ring-2 ring-orange-300">
              <AlertTriangle className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-stone-800 text-amber-400 flex items-center justify-center shadow-lg border-2 border-white">
            <AlertTriangle className="w-4 h-4" />
          </div>
        );
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-105px)] min-h-[500px] flex flex-col bg-stone-900 overflow-hidden select-none">
      {/* 1. TOP TACTICAL FILTER & CONTROLS TOOLBAR */}
      <div className="z-10 bg-white/95 backdrop-blur-md border-b border-stone-200 px-3 sm:px-6 py-2.5 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
          {/* Category Filter Controls */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 no-scrollbar">
            <button
              onClick={() => setActiveCategoryFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-colors ${
                activeCategoryFilter === 'all'
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-600 hover:text-stone-900'
              }`}
            >
              All Hazards ({hazards.length})
            </button>
            <button
              onClick={() => setActiveCategoryFilter('OPEN_MANHOLE')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap flex items-center gap-1 transition-colors ${
                activeCategoryFilter === 'OPEN_MANHOLE'
                  ? 'bg-rose-700 text-white shadow-sm font-bold'
                  : 'bg-stone-100 text-stone-600 hover:text-stone-900'
              }`}
            >
              <span>🕳️ Open Manholes</span>
            </button>
            <button
              onClick={() => setActiveCategoryFilter('DANGLING_LIVE_WIRE')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap flex items-center gap-1 transition-colors ${
                activeCategoryFilter === 'DANGLING_LIVE_WIRE'
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                  : 'bg-stone-100 text-stone-600 hover:text-stone-900'
              }`}
            >
              <Zap className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Live Wires</span>
            </button>
            <button
              onClick={() => setActiveCategoryFilter('WATERLOGGING')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap flex items-center gap-1 transition-colors ${
                activeCategoryFilter === 'WATERLOGGING'
                  ? 'bg-blue-600 text-white shadow-sm font-bold'
                  : 'bg-stone-100 text-stone-600 hover:text-stone-900'
              }`}
            >
              <Droplets className="w-3.5 h-3.5" />
              <span>Waterlogging</span>
            </button>
            <button
              onClick={() => setActiveCategoryFilter('BROKEN_FOOTPATH')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap flex items-center gap-1 transition-colors ${
                activeCategoryFilter === 'BROKEN_FOOTPATH'
                  ? 'bg-orange-600 text-white shadow-sm font-bold'
                  : 'bg-stone-100 text-stone-600 hover:text-stone-900'
              }`}
            >
              <span>Broken Footpath</span>
            </button>
          </div>

          {/* Map View Controls */}
          <div className="flex items-center gap-2">
            {/* Side Areas Overview & Zoom Controls */}
            <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-lg border border-stone-200">
              <button
                type="button"
                onClick={() => {
                  setFollowCommuter(false);
                  setZoomLevel((prev) => Math.max(12, prev - 1));
                  hapticFeedback();
                }}
                title="Zoom Out to view side areas"
                className="p-1.5 rounded text-stone-600 hover:text-stone-900 hover:bg-white transition-colors cursor-pointer"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setFollowCommuter(false);
                  setZoomLevel(14);
                  hapticFeedback();
                }}
                title="Wider area view of surrounding neighborhoods"
                className={`px-2 py-1 text-[11px] font-mono rounded transition-colors cursor-pointer ${
                  zoomLevel <= 14
                    ? 'bg-stone-900 text-white font-bold'
                    : 'text-stone-700 hover:bg-white'
                }`}
              >
                Side Areas (Overview)
              </button>

              <button
                type="button"
                onClick={() => {
                  setFollowCommuter(false);
                  setZoomLevel((prev) => Math.min(20, prev + 1));
                  hapticFeedback();
                }}
                title="Zoom In"
                className="p-1.5 rounded text-stone-600 hover:text-stone-900 hover:bg-white transition-colors cursor-pointer"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={handleRecenter}
              className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors flex items-center gap-1 cursor-pointer ${
                followCommuter
                  ? 'bg-stone-900 border-stone-900 text-white font-semibold'
                  : 'bg-white border-stone-300 text-stone-700'
              }`}
            >
              <Crosshair className="w-3.5 h-3.5 text-amber-400" />
              <span>{followCommuter ? 'Tracking Me' : 'Recenter'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. PROXIMITY SAFETY BANNER IF NEAR HAZARD */}
      {nearestHazard && nearestHazard.distanceMeters <= 120 && (
        <div
          className={`z-10 px-4 py-2 border-b flex items-center justify-between shadow-sm transition-all ${
            nearestHazard.distanceMeters <= 50
              ? 'bg-rose-600 text-white border-rose-700 animate-pulse'
              : 'bg-amber-500 text-stone-950 border-amber-600 font-medium'
          }`}
        >
          <div className="flex items-center gap-2 max-w-3xl truncate">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span className="text-xs font-bold tracking-wide uppercase">
              Proximity Alert ({nearestHazard.distanceMeters}m):
            </span>
            <span className="text-xs truncate font-medium">
              {nearestHazard.title} · {nearestHazard.location.address}
            </span>
          </div>
          <button
            onClick={() => onSelectHazard(nearestHazard)}
            className="px-2.5 py-1 text-[11px] font-bold bg-white text-stone-950 rounded hover:bg-stone-100 shadow-xs whitespace-nowrap ml-2"
          >
            Inspect
          </button>
        </div>
      )}

      {/* 3. MAP CANVAS (GOOGLE MAPS OR TACTICAL SONAR RADAR) */}
      <div className="relative flex-1 w-full h-full bg-stone-950">
        {/* Floating small rounded Map & Satellite switch pill + Small Checkbox underneath */}
        <div className="absolute top-4 left-4 z-10 flex flex-col items-start gap-1.5">
          <div className="flex items-center bg-stone-900/90 backdrop-blur-md p-0.5 rounded-full border border-white/20 shadow-xl">
            <button
              type="button"
              onClick={() => {
                setMapType(showLabels ? 'roadmap' : 'terrain');
                hapticFeedback();
              }}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium transition-all cursor-pointer ${
                mapType === 'roadmap' || mapType === 'terrain'
                  ? 'bg-white text-stone-950 font-bold shadow-sm'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              Map
            </button>
            <button
              type="button"
              onClick={() => {
                setMapType(showLabels ? 'hybrid' : 'satellite');
                hapticFeedback();
              }}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium transition-all cursor-pointer ${
                mapType === 'satellite' || mapType === 'hybrid'
                  ? 'bg-cyan-400 text-stone-950 font-bold shadow-sm'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              Satellite
            </button>
          </div>

          {/* Small checkbox down the button */}
          <label className="flex items-center gap-1.5 bg-stone-900/85 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/15 text-[10px] font-mono text-stone-300 hover:text-white cursor-pointer select-none shadow-md">
            <input
              type="checkbox"
              checked={showLabels}
              onChange={(e) => {
                const next = e.target.checked;
                setShowLabels(next);
                if (mapType === 'satellite' || mapType === 'hybrid') {
                  setMapType(next ? 'hybrid' : 'satellite');
                } else {
                  setMapType(next ? 'roadmap' : 'terrain');
                }
                hapticFeedback();
              }}
              className="w-3 h-3 rounded border-stone-600 text-cyan-400 focus:ring-0 focus:ring-offset-0 bg-stone-800 accent-cyan-400 cursor-pointer"
            />
            <span className="leading-tight">Labels</span>
          </label>
        </div>

        <APIProvider apiKey={apiKey} libraries={['marker']}>
          <Map
            mapId="DEMO_MAP_ID"
            defaultCenter={{ lat: telemetry.latitude || 37.7749, lng: telemetry.longitude || -122.4194 }}
            defaultZoom={zoomLevel}
            mapTypeId={mapType}
            gestureHandling="greedy"
            disableDefaultUI={false}
            mapTypeControl={false}
            streetViewControl={false}
            fullscreenControl={false}
            onClick={handleMapClick}
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            className="w-full h-full"
          >
            <MapCameraController
              latitude={telemetry.latitude}
              longitude={telemetry.longitude}
              followUser={followCommuter}
              zoom={zoomLevel}
              onUserPanned={() => setFollowCommuter(false)}
            />

            <NativeGoogleMapMarkers
              telemetry={telemetry}
              hazards={filteredHazards}
              selectedHazard={selectedHazard}
              onSelectHazard={onSelectHazard}
            />
          </Map>
        </APIProvider>



        {/* FLOATING ACTION BUTTON: LOG HAZARD (BOTTOM RIGHT) */}
        <div className="absolute bottom-20 sm:bottom-5 right-4 z-10 flex flex-col items-end gap-2">
          <button
            onClick={onOpenQuickLog}
            className="flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-amber-400 hover:bg-amber-300 active:scale-95 text-stone-950 font-bold text-xs sm:text-sm rounded-full shadow-2xl transition-all border-2 border-stone-950 group cursor-pointer"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3] group-hover:rotate-90 transition-transform" />
            <span>Log Hazard (5s)</span>
          </button>
        </div>
      </div>

      {/* 4. SELECTED HAZARD DETAIL DRAWER / POPUP */}
      {selectedHazard && (
        <div className="z-20 bg-white border-t border-stone-200 shadow-2xl p-4 sm:p-5 max-w-4xl mx-auto w-full transition-transform">
          <div className="flex flex-col sm:flex-row gap-4 items-start justify-between">
            {/* Thumbnail */}
            <div className="relative w-full sm:w-44 h-32 shrink-0 rounded-lg overflow-hidden border border-stone-200 bg-stone-100">
              <img
                src={selectedHazard.photoUrl}
                alt={selectedHazard.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-stone-950/80 text-white font-mono text-[10px] font-bold rounded">
                Score: {selectedHazard.severityScore}/100
              </div>
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span
                  className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded text-white ${
                    selectedHazard.severity === 'CRITICAL'
                      ? 'bg-rose-600'
                      : selectedHazard.severity === 'HIGH'
                      ? 'bg-amber-600'
                      : 'bg-stone-700'
                  }`}
                >
                  {selectedHazard.severity} RISK
                </span>
                <span className="text-xs text-stone-500 font-medium">
                  {selectedHazard.category.replace(/_/g, ' ')}
                </span>
                <span className="text-stone-300">·</span>
                <span className="text-xs text-stone-500">
                  Status: <strong className="text-stone-800">{selectedHazard.status.replace(/_/g, ' ')}</strong>
                </span>
              </div>

              <h3 className="text-base font-bold text-stone-950 leading-tight mb-1">
                {selectedHazard.title}
              </h3>
              <p className="text-xs text-stone-600 line-clamp-2 mb-2">
                {selectedHazard.description}
              </p>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500">
                <span>📍 {selectedHazard.location.address}</span>
                {selectedHazard.location.landmark && (
                  <span>🏛️ {selectedHazard.location.landmark}</span>
                )}
                <span>👥 {selectedHazard.confirmationsCount} commuters verified</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex sm:flex-col gap-2 shrink-0 w-full sm:w-auto">
              <button
                onClick={() => {
                  onConfirmHazard(selectedHazard.id);
                  hapticFeedback();
                }}
                className="flex-1 sm:flex-none px-3.5 py-2 text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 rounded border border-stone-200 transition-colors"
              >
                +1 Still Active ({selectedHazard.confirmationsCount})
              </button>

              {onOpenFixModal && selectedHazard.status !== 'RESOLVED_VERIFIED' && (
                <button
                  onClick={() => onOpenFixModal(selectedHazard)}
                  className="flex-1 sm:flex-none px-3.5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded transition-colors flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verify Fix</span>
                </button>
              )}

              <button
                onClick={() => onSelectHazard(null)}
                className="px-2.5 py-2 text-xs text-stone-500 hover:text-stone-800 self-center"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
