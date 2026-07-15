// =============================================================================
// STADIUM MAP PAGE — AI-powered navigation
// =============================================================================

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Map, Navigation, Accessibility, Heart, Utensils,
  Droplets, Car, Train, Info, DoorOpen, Search,
  ArrowRight, Clock, CheckCircle2, Loader2
} from 'lucide-react';
import { SectionHeader } from '../components/ui/SectionHeader';
import { AIResponseCard } from '../components/ai/AIResponseCard';
import { useAI } from '../hooks/useAI';
import { useUserStore } from '../store/useAppStore';
import { MOCK_POIS } from '../data/mockData';
import { getCrowdBgClass } from '../utils/helpers';
import { cn } from '../utils/helpers';
import type { StadiumPOI } from '../types';

// ---- POI Type Config -------------------------------------------------------

const POI_CONFIG: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  medical: { icon: Heart, label: 'Medical', color: 'text-red-400' },
  food: { icon: Utensils, label: 'Food & Drink', color: 'text-amber-400' },
  washroom: { icon: Droplets, label: 'Restrooms', color: 'text-blue-400' },
  exit: { icon: DoorOpen, label: 'Exits', color: 'text-emerald-400' },
  entrance: { icon: DoorOpen, label: 'Entrances', color: 'text-emerald-400' },
  parking: { icon: Car, label: 'Parking', color: 'text-purple-400' },
  metro: { icon: Train, label: 'Metro/Rail', color: 'text-cyan-400' },
  info: { icon: Info, label: 'Info Desk', color: 'text-sky-400' },
  atm: { icon: Info, label: 'ATM', color: 'text-yellow-400' },
  accessibility: { icon: Accessibility, label: 'Accessibility', color: 'text-indigo-400' },
};

// ---- SVG Stadium Map -------------------------------------------------------

const StadiumMapSVG: React.FC<{
  pois: StadiumPOI[];
  selectedPOI: StadiumPOI | null;
  onSelectPOI: (poi: StadiumPOI) => void;
  visibleTypes: string[];
}> = ({ pois, selectedPOI, onSelectPOI, visibleTypes }) => {
  const zones = [
    { id: 'north', x: 30, y: 10, w: 40, h: 20, label: 'North', color: '#1E3A5F' },
    { id: 'south', x: 30, y: 70, w: 40, h: 20, label: 'South', color: '#1E3A5F' },
    { id: 'east', x: 72, y: 25, w: 20, h: 50, label: 'East', color: '#1E3A5F' },
    { id: 'west', x: 8, y: 25, w: 20, h: 50, label: 'West', color: '#1E3A5F' },
    { id: 'field', x: 25, y: 28, w: 50, h: 44, label: 'Field', color: '#166534', rx: 8 },
    { id: 'inner-field', x: 30, y: 33, w: 40, h: 34, label: '', color: '#15803D', rx: 6 },
  ];

  const filteredPOIs = visibleTypes.length > 0
    ? pois.filter((p) => visibleTypes.includes(p.type))
    : pois;

  return (
    <svg
      viewBox="0 0 100 100"
      className="w-full h-full"
      role="img"
      aria-label="Stadium map with points of interest"
    >
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background */}
      <rect width="100" height="100" fill="#0A0E1A" />

      {/* Stadium zones */}
      {zones.map((zone) => (
        <rect
          key={zone.id}
          x={zone.x} y={zone.y} width={zone.w} height={zone.h}
          rx={(zone as any).rx ?? 2}
          fill={zone.color}
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="0.5"
        />
      ))}

      {/* Running track */}
      <ellipse cx="50" cy="50" rx="23" ry="18" fill="none" stroke="#92400E" strokeWidth="0.8" />

      {/* Center circle */}
      <circle cx="50" cy="50" r="5" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.5" />
      <circle cx="50" cy="50" r="0.8" fill="rgba(255,255,255,0.4)" />

      {/* North/South labels */}
      <text x="50" y="22" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="3" fontFamily="Inter">NORTH</text>
      <text x="50" y="85" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="3" fontFamily="Inter">SOUTH</text>
      <text x="13" y="52" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="3" fontFamily="Inter">WEST</text>
      <text x="87" y="52" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="3" fontFamily="Inter">EAST</text>

      {/* POIs */}
      {filteredPOIs.map((poi) => {
        const cfg = POI_CONFIG[poi.type] ?? POI_CONFIG.info;
        const isSelected = selectedPOI?.id === poi.id;
        const colorMap: Record<string, string> = {
          'text-red-400': '#F87171',
          'text-amber-400': '#FBBF24',
          'text-blue-400': '#60A5FA',
          'text-emerald-400': '#34D399',
          'text-purple-400': '#A78BFA',
          'text-cyan-400': '#22D3EE',
          'text-sky-400': '#38BDF8',
          'text-yellow-400': '#FACC15',
          'text-indigo-400': '#818CF8',
        };
        const color = colorMap[cfg.color] ?? '#9CA3AF';

        return (
          <g
            key={poi.id}
            transform={`translate(${poi.coordinates.x}, ${poi.coordinates.y})`}
            onClick={() => onSelectPOI(poi)}
            style={{ cursor: 'pointer' }}
            role="button"
            aria-label={`${poi.label} — ${poi.currentStatus}`}
          >
            {isSelected && (
              <circle r="4" fill={color} opacity="0.2" filter="url(#glow)">
                <animate attributeName="r" from="3" to="6" dur="1s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.3" to="0" dur="1s" repeatCount="indefinite" />
              </circle>
            )}
            <circle r="2.5" fill={isSelected ? color : `${color}CC`} stroke="rgba(255,255,255,0.3)" strokeWidth="0.4" />
            {poi.isAccessible && (
              <text x="0" y="-3.5" textAnchor="middle" fontSize="2" fill="rgba(255,255,255,0.8)">♿</text>
            )}
          </g>
        );
      })}
    </svg>
  );
};

// ---- POI Card --------------------------------------------------------------

const POICard: React.FC<{ poi: StadiumPOI; onNavigate: (poi: StadiumPOI) => void }> = ({
  poi, onNavigate
}) => {
  const cfg = POI_CONFIG[poi.type] ?? POI_CONFIG.info;
  const Icon = cfg.icon;

  const statusStyle = {
    open: 'text-emerald-400',
    busy: 'text-amber-400',
    limited: 'text-orange-400',
    closed: 'text-red-400',
    operational: 'text-emerald-400',
  }[poi.currentStatus] ?? 'text-muted-foreground';

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group">
      <div className={cn('w-8 h-8 rounded-lg bg-white/8 flex items-center justify-center flex-shrink-0', cfg.color)}>
        <Icon className="w-4 h-4" aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-foreground truncate">{poi.label}</div>
        <div className="text-xs text-muted-foreground flex items-center gap-2">
          <span className={statusStyle}>● {poi.currentStatus}</span>
          {poi.waitTimeMinutes !== undefined && <span>{poi.waitTimeMinutes}min wait</span>}
          {poi.isAccessible && <span title="Wheelchair accessible">♿</span>}
        </div>
      </div>
      <button
        onClick={() => onNavigate(poi)}
        className="opacity-0 group-hover:opacity-100 focus:opacity-100 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary/15 text-primary text-xs font-medium transition-all duration-200 hover:bg-primary/25"
        aria-label={`Navigate to ${poi.label}`}
      >
        <Navigation className="w-3.5 h-3.5" />
        Route
      </button>
    </div>
  );
};

// ---- Main Page -------------------------------------------------------------

type FilterType = 'all' | 'medical' | 'food' | 'washroom' | 'exit' | 'parking' | 'metro';

const FILTER_OPTIONS: { type: FilterType; label: string }[] = [
  { type: 'all', label: 'All' },
  { type: 'medical', label: 'Medical' },
  { type: 'food', label: 'Food' },
  { type: 'washroom', label: 'Restrooms' },
  { type: 'exit', label: 'Exits' },
  { type: 'parking', label: 'Parking' },
  { type: 'metro', label: 'Metro' },
];

export const StadiumMapPage: React.FC = () => {
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPOI, setSelectedPOI] = useState<StadiumPOI | null>(null);
  const [isWheelchair, setIsWheelchair] = useState(false);
  const { user } = useUserStore();
  const { data: aiData, isLoading, getNavigation, isUsingMock, reset } = useAI();

  const handleNavigate = async (poi: StadiumPOI) => {
    setSelectedPOI(poi);
    await getNavigation(poi.label, isWheelchair || user.accessibilityNeeds?.wheelchairAccess);
  };

  const visibleTypes = filterType === 'all' ? [] : [filterType];

  const filteredPOIs = MOCK_POIS.filter((poi) => {
    const matchesType = filterType === 'all' || poi.type === filterType;
    const matchesSearch = searchQuery === '' ||
      poi.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      poi.section.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const accessibleOnly = filteredPOIs.filter((p) => p.isAccessible);
  const showPOIs = isWheelchair ? accessibleOnly : filteredPOIs;

  return (
    <div className="p-6 space-y-6 max-w-screen-2xl mx-auto">
      <SectionHeader
        title="Smart Stadium Map"
        subtitle="AI-powered navigation with crowd-aware routing"
        icon={Map}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2 glass-card p-4 space-y-4">
          {/* Controls */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search locations..."
                className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-primary/40 transition-all"
                aria-label="Search stadium locations"
              />
            </div>
            <button
              onClick={() => setIsWheelchair(!isWheelchair)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-all',
                isWheelchair
                  ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
                  : 'bg-white/5 text-muted-foreground border-white/10 hover:border-white/20'
              )}
              aria-pressed={isWheelchair}
              aria-label="Toggle wheelchair-accessible routes only"
            >
              <Accessibility className="w-4 h-4" />
              Accessible
            </button>
          </div>

          {/* Filter pills */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
            {FILTER_OPTIONS.map(({ type, label }) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={cn(
                  'flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                  filterType === type
                    ? 'bg-primary/20 text-primary border-primary/30'
                    : 'bg-white/5 text-muted-foreground border-white/10 hover:border-white/20'
                )}
                aria-pressed={filterType === type}
              >
                {label}
              </button>
            ))}
          </div>

          {/* SVG Map */}
          <div className="relative h-80 rounded-xl overflow-hidden bg-[#0A0E1A] border border-white/8">
            <StadiumMapSVG
              pois={showPOIs}
              selectedPOI={selectedPOI}
              onSelectPOI={setSelectedPOI}
              visibleTypes={visibleTypes}
            />
            {/* Map watermark */}
            <div className="absolute bottom-3 right-3 text-xs text-white/20 font-mono">
              MetLife Stadium • FIFA WC 2026
            </div>
          </div>

          {/* AI Navigation result */}
          <AnimatePresence>
            {(aiData || isLoading) && selectedPOI && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <AIResponseCard
                  response={aiData}
                  isLoading={isLoading}
                  isUsingMock={isUsingMock}
                  title={`Route to ${selectedPOI.label}`}
                  compact={true}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* POI List */}
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">
              {filterType === 'all' ? 'All Locations' : `${FILTER_OPTIONS.find(f => f.type === filterType)?.label}`}
            </h3>
            <span className="text-xs text-muted-foreground">{showPOIs.length} found</span>
          </div>

          <div className="space-y-1 max-h-[560px] overflow-y-auto scrollbar-hide">
            {showPOIs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No locations found</p>
            ) : (
              showPOIs.map((poi) => (
                <POICard key={poi.id} poi={poi} onNavigate={handleNavigate} />
              ))
            )}
          </div>

          {isWheelchair && (
            <div className="mt-4 p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-400">
              ♿ Showing accessible routes only — elevator and ramp paths prioritized
            </div>
          )}
        </div>
      </div>

      {/* Quick Find Buttons */}
      <div className="glass-card p-4">
        <h3 className="font-semibold text-foreground mb-3 text-sm">Quick Find</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {Object.entries(POI_CONFIG).map(([type, { icon: Icon, label, color }]) => {
            const nearest = MOCK_POIS.find((p) => p.type === type && p.currentStatus !== 'closed');
            return (
              <button
                key={type}
                onClick={() => nearest && handleNavigate(nearest)}
                className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/3 hover:bg-white/8 border border-white/8 hover:border-white/15 transition-all duration-200 group"
                aria-label={`Find nearest ${label}`}
              >
                <Icon className={cn('w-5 h-5', color)} aria-hidden="true" />
                <span className="text-xs text-muted-foreground group-hover:text-foreground text-center leading-tight">
                  Nearest {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
