// =============================================================================
// TRANSPORTATION PAGE
// =============================================================================

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bus, Train, Car, Footprints, Clock, Leaf, AlertTriangle, TrendingUp, RefreshCw, CheckCircle } from 'lucide-react';
import { SectionHeader } from '../components/ui/SectionHeader';
import { AIResponseCard } from '../components/ai/AIResponseCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { useAI } from '../hooks/useAI';
import { MOCK_TRANSPORT_OPTIONS } from '../data/mockData';
import { cn, formatDuration, getCrowdColor, getCrowdLabel } from '../utils/helpers';
import type { TransportOption } from '../types';

const TRANSPORT_ICONS: Record<string, React.ElementType> = {
  metro: Train, bus: Bus, rideshare: Car, walk: Footprints, cycle: Footprints, car: Car,
};

const STATUS_STYLES: Record<string, string> = {
  operational: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  delayed: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  disrupted: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  cancelled: 'text-red-400 bg-red-500/10 border-red-500/20',
};

// ---- Transport Card --------------------------------------------------------

const TransportCard: React.FC<{
  option: TransportOption;
  isRecommended?: boolean;
  index: number;
}> = ({ option, isRecommended, index }) => {
  const Icon = TRANSPORT_ICONS[option.type] ?? Car;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className={cn(
        'glass-card-hover p-5 border relative overflow-hidden',
        isRecommended ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-black/10 dark:border-white/8'
      )}
    >
      <div className="flex items-start gap-4">
        <div className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
          isRecommended ? 'bg-emerald-500/20' : 'bg-black/10 dark:bg-white/8'
        )}>
          <Icon className={cn('w-6 h-6', isRecommended ? 'text-emerald-400' : 'text-muted-foreground')} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h3 className="font-semibold text-foreground">{option.label}</h3>
              {option.provider && (
                <p className="text-xs text-muted-foreground">{option.provider}</p>
              )}
            </div>
            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
              {isRecommended && (
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-[10px] font-semibold text-emerald-400">
                  <CheckCircle className="w-3 h-3" />
                  AI Recommended
                </div>
              )}
              <span className={cn('text-[10px] uppercase px-2 py-0.5 rounded-full border font-bold', STATUS_STYLES[option.currentStatus])}>
                {option.currentStatus}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Travel Time</p>
              <p className="text-sm font-semibold text-foreground flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                {formatDuration(option.estimatedTravelMinutes)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Crowd</p>
              <p className="text-sm font-semibold" style={{ color: getCrowdColor(option.crowdLevel) }}>
                {getCrowdLabel(option.crowdLevel)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Eco Score</p>
              <div className="flex items-center gap-1">
                <Leaf className={cn('w-3.5 h-3.5', option.ecoScore >= 80 ? 'text-emerald-400' : option.ecoScore >= 50 ? 'text-amber-400' : 'text-red-400')} />
                <span className="text-sm font-semibold text-foreground">{option.ecoScore}/100</span>
              </div>
            </div>
            {option.cost && (
              <div>
                <p className="text-xs text-muted-foreground">Cost</p>
                <p className="text-sm font-semibold text-foreground">
                  {option.cost.amount === 0 ? 'Free' : `${option.cost.currency} ${option.cost.amount}`}
                </p>
              </div>
            )}
          </div>

          {option.nextDeparture && (
            <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              Next departure: <span className="text-foreground font-medium">{option.nextDeparture}</span>
              {option.frequency && <span>• every {option.frequency} min</span>}
            </div>
          )}

          {/* Eco bar */}
          <div className="mt-3">
            <div className="h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${option.ecoScore}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{
                  backgroundColor: option.ecoScore >= 80 ? '#10B981' :
                    option.ecoScore >= 50 ? '#F59E0B' : '#EF4444'
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ---- Main Page -------------------------------------------------------------

export const TransportPage: React.FC = () => {
  const { data: aiData, isLoading, analyzeTransport } = useAI();

  useEffect(() => {
    analyzeTransport();
  }, []);

  const recommended = MOCK_TRANSPORT_OPTIONS.find((o) => o.id === 'bus-1') ?? MOCK_TRANSPORT_OPTIONS[0];

  return (
    <div className="p-6 space-y-6 max-w-screen-2xl mx-auto">
      <SectionHeader
        title="Transportation Intelligence"
        subtitle="AI-optimized departure times and route recommendations"
        icon={Bus}
        actions={
          <button
            onClick={() => analyzeTransport()}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/15 text-primary border border-primary/30 text-sm hover:bg-primary/25 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        }
      />

      {/* AI Recommendation Banner */}
      <div className="glass-card p-5 border border-amber-500/20 bg-amber-500/5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-amber-400 mb-1">AI Transport Alert</h3>
            <p className="text-sm text-foreground/90">
              NJ Transit running 15-min delay. Post-match road congestion expected from 22:15.{' '}
              <strong>AI recommends leaving now via FIFA Shuttle</strong> — saves ~55 minutes vs peak-time rideshare.
            </p>
          </div>
          <div className="ml-auto flex-shrink-0 text-right">
            <div className="text-xs text-muted-foreground">Best Depart</div>
            <div className="text-lg font-bold text-amber-400">Now</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transport options */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-semibold text-foreground text-sm uppercase tracking-wide text-muted-foreground">
            Available Options — Sorted by AI Recommendation
          </h3>
          {MOCK_TRANSPORT_OPTIONS.map((option, i) => (
            <TransportCard
              key={option.id}
              option={option}
              isRecommended={option.id === recommended.id}
              index={i}
            />
          ))}
        </div>

        {/* Right: AI + stats */}
        <div className="space-y-5">
          {/* Key stats */}
          <div className="glass-card p-5 space-y-4">
            <h3 className="font-semibold text-foreground">Live Status</h3>
            {[
              { label: 'NJ Transit', status: 'Delayed 15 min', color: 'text-amber-400' },
              { label: 'FIFA Shuttles', status: '8 routes active', color: 'text-emerald-400' },
              { label: 'Road Traffic', status: 'Heavy — 45 min delay', color: 'text-red-400' },
              { label: 'Parking Lots', status: 'Lots B & C Full', color: 'text-orange-400' },
              { label: 'Rideshare', status: 'Surge 3.2x', color: 'text-orange-400' },
            ].map(({ label, status, color }) => (
              <div key={label} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{label}</span>
                <span className={cn('font-medium', color)}>{status}</span>
              </div>
            ))}
          </div>

          {/* Eco Impact */}
          <div className="glass-card p-5 border border-emerald-500/15 bg-emerald-500/5">
            <div className="flex items-center gap-2 mb-3">
              <Leaf className="w-4 h-4 text-emerald-400" />
              <h3 className="font-semibold text-foreground">Your Eco Impact</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shuttle vs Car saves</span>
                <span className="text-emerald-400 font-semibold">~18 kg CO₂</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Metro vs Rideshare saves</span>
                <span className="text-emerald-400 font-semibold">~16 kg CO₂</span>
              </div>
              <div className="h-px bg-black/10 dark:bg-white/10 my-2" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Choosing eco-transport today = planting ~2 trees worth of carbon absorption 🌱
              </p>
            </div>
          </div>

          {/* AI Analysis */}
          <AIResponseCard
            response={aiData}
            isLoading={isLoading}
            title="AI Transport Advisor"
            compact={true}
          />
        </div>
      </div>
    </div>
  );
};
