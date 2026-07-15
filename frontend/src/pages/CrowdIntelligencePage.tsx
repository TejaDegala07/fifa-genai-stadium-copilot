// =============================================================================
// CROWD INTELLIGENCE PAGE
// =============================================================================

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity, RefreshCw, Users, ArrowUp, ArrowDown,
  Minus, AlertTriangle, TrendingUp, Filter
} from 'lucide-react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Tooltip, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Cell
} from 'recharts';
import { SectionHeader } from '../components/ui/SectionHeader';
import { AIResponseCard } from '../components/ai/AIResponseCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { useAI } from '../hooks/useAI';
import { MOCK_CROWD_DATA } from '../data/mockData';
import {
  getCrowdColor, getCrowdLabel, getCrowdBgClass,
  formatNumber, formatPercentNum, timeAgo
} from '../utils/helpers';
import type { ZoneCrowdData } from '../types';
import type { CrowdLevel } from '../data/constants';
import { cn } from '../utils/helpers';

const TREND_ICONS = {
  increasing: ArrowUp,
  decreasing: ArrowDown,
  stable: Minus,
};

const TREND_COLORS = {
  increasing: 'text-red-400',
  decreasing: 'text-emerald-400',
  stable: 'text-muted-foreground',
};

// ---- Zone Card -------------------------------------------------------------

const ZoneCard: React.FC<{ zone: ZoneCrowdData; onAnalyze: (id: string) => void; index: number }> = ({
  zone, onAnalyze, index
}) => {
  const TrendIcon = TREND_ICONS[zone.trend];
  const densityPct = Math.round(zone.density * 100);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      className={cn(
        'glass-card-hover p-4 border cursor-pointer group',
        zone.level === 'critical' ? 'border-red-500/25' :
        zone.level === 'high' ? 'border-orange-500/20' :
        zone.level === 'moderate' ? 'border-amber-500/15' : 'border-white/8'
      )}
      onClick={() => onAnalyze(zone.zoneId)}
      role="button"
      tabIndex={0}
      aria-label={`Analyze ${zone.zoneLabel} - ${getCrowdLabel(zone.level)} density`}
      onKeyDown={(e) => e.key === 'Enter' && onAnalyze(zone.zoneId)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-foreground text-sm">{zone.zoneLabel}</h3>
          <p className="text-xs text-muted-foreground">Section {zone.section}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={cn('flex items-center gap-1 text-xs font-medium', TREND_COLORS[zone.trend])}>
            <TrendIcon className="w-3.5 h-3.5" />
            {zone.trend}
          </div>
          <StatusBadge
            type="crowd"
            value={getCrowdLabel(zone.level)}
            level={zone.level}
            showDot={true}
          />
        </div>
      </div>

      {/* Density bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-muted-foreground">
            {formatNumber(zone.currentOccupancy)} / {formatNumber(zone.capacity)}
          </span>
          <span className="font-bold" style={{ color: getCrowdColor(zone.level) }}>
            {densityPct}%
          </span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${densityPct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: index * 0.05 }}
            className="h-full rounded-full"
            style={{ backgroundColor: getCrowdColor(zone.level) }}
          />
        </div>
      </div>

      {/* AI analyze button */}
      <button
        className="w-full text-xs text-primary flex items-center justify-center gap-1.5 py-1.5 rounded-lg
                   bg-primary/8 hover:bg-primary/15 transition-colors opacity-0 group-hover:opacity-100
                   focus:opacity-100 duration-200"
        onClick={(e) => { e.stopPropagation(); onAnalyze(zone.zoneId); }}
        aria-label={`Get AI analysis for ${zone.zoneLabel}`}
      >
        <Activity className="w-3.5 h-3.5" />
        AI Analyze
      </button>
    </motion.div>
  );
};

// ---- Radar Chart Data -------------------------------------------------------

const radarData = MOCK_CROWD_DATA.slice(0, 8).map((z) => ({
  zone: z.section,
  density: Math.round(z.density * 100),
  fullMark: 100,
}));

// ---- Main Page -------------------------------------------------------------

export const CrowdIntelligencePage: React.FC = () => {
  const [filterLevel, setFilterLevel] = useState<CrowdLevel | 'all'>('all');
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const { data: aiData, isLoading, analyzeCrowd, isUsingMock } = useAI();

  const handleAnalyze = (zoneId: string) => {
    setSelectedZone(zoneId);
    analyzeCrowd(zoneId);
  };

  const filtered = filterLevel === 'all'
    ? MOCK_CROWD_DATA
    : MOCK_CROWD_DATA.filter((z) => z.level === filterLevel);

  const criticalZones = MOCK_CROWD_DATA.filter((z) => z.level === 'critical');

  const CHART_TOOLTIP_STYLE = {
    contentStyle: {
      backgroundColor: '#0D1117',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '12px',
    },
    labelStyle: { color: '#9CA3AF', fontSize: 11 },
  };

  return (
    <div className="p-6 space-y-6 max-w-screen-2xl mx-auto">
      <SectionHeader
        title="Crowd Intelligence"
        subtitle="Real-time crowd density analysis powered by AI"
        icon={Activity}
        actions={
          <button
            onClick={() => analyzeCrowd()}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/15 text-primary border border-primary/30 text-sm hover:bg-primary/25 transition-colors"
            aria-label="Refresh all zones analysis"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh All
          </button>
        }
      />

      {/* Critical Alert Banner */}
      {criticalZones.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/25"
          role="alert"
          aria-live="assertive"
        >
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 animate-pulse" />
          <div>
            <p className="font-semibold text-red-400 text-sm">
              ⚠ {criticalZones.length} Zone{criticalZones.length > 1 ? 's' : ''} at Critical Density
            </p>
            <p className="text-xs text-red-400/70 mt-0.5">
              {criticalZones.map(z => z.zoneLabel).join(' • ')} — Immediate crowd management recommended
            </p>
          </div>
        </motion.div>
      )}

      {/* Top Row: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar chart */}
        <div className="lg:col-span-2 glass-card p-5">
          <h3 className="font-semibold text-foreground mb-4">Zone Density Comparison</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={MOCK_CROWD_DATA} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="section" tick={{ fontSize: 11, fill: '#6B7280' }} />
              <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fill: '#6B7280' }} domain={[0, 100]} />
              <Tooltip
                {...CHART_TOOLTIP_STYLE}
                formatter={(val) => [`${val}%`, 'Density']}
              />
              <Bar dataKey="density" radius={[6, 6, 0, 0]} maxBarSize={48}>
                {MOCK_CROWD_DATA.map((zone) => (
                  <Cell key={zone.zoneId} fill={getCrowdColor(zone.level)} opacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          {/* Legend */}
          <div className="flex items-center gap-4 justify-center mt-2 flex-wrap">
            {(['safe','moderate','high','critical'] as CrowdLevel[]).map((l) => (
              <div key={l} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getCrowdColor(l) }} />
                {getCrowdLabel(l)}
              </div>
            ))}
          </div>
        </div>

        {/* Radar chart */}
        <div className="glass-card p-5">
          <h3 className="font-semibold text-foreground mb-4">Zone Radar</h3>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.08)" />
              <PolarAngleAxis dataKey="zone" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
              <Radar
                dataKey="density"
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.2}
                strokeWidth={2}
              />
              <Tooltip {...CHART_TOOLTIP_STYLE} formatter={(v) => [`${v}%`, 'Density']} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-muted-foreground" />
        {(['all', 'safe', 'moderate', 'high', 'critical'] as const).map((level) => (
          <button
            key={level}
            onClick={() => setFilterLevel(level)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150',
              filterLevel === level
                ? level === 'all' ? 'bg-primary/20 text-primary border-primary/30'
                  : `${getCrowdBgClass(level as CrowdLevel)} border-current`
                : 'text-muted-foreground border-white/10 hover:border-white/20'
            )}
            aria-pressed={filterLevel === level}
          >
            {level === 'all' ? 'All Zones' : getCrowdLabel(level as CrowdLevel)}
            {level !== 'all' && (
              <span className="ml-1.5 opacity-60">
                ({MOCK_CROWD_DATA.filter(z => z.level === level).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Zone Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {filtered.map((zone, i) => (
          <ZoneCard key={zone.zoneId} zone={zone} onAnalyze={handleAnalyze} index={i} />
        ))}
      </div>

      {/* AI Analysis */}
      {(aiData || isLoading) && (
        <AIResponseCard
          response={aiData}
          isLoading={isLoading}
          isUsingMock={isUsingMock}
          title={selectedZone
            ? `AI Analysis — ${MOCK_CROWD_DATA.find(z => z.zoneId === selectedZone)?.zoneLabel}`
            : 'AI Crowd Intelligence'
          }
        />
      )}
    </div>
  );
};
