// =============================================================================
// OPERATIONS DASHBOARD PAGE
// =============================================================================

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings, AlertTriangle, Users, Clock, TrendingUp,
  Activity, Radio, Bell, BellOff, RefreshCw, ChevronRight
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { Link } from 'react-router-dom';
import { SectionHeader } from '../components/ui/SectionHeader';
import { AIResponseCard } from '../components/ai/AIResponseCard';
import { KPICard } from '../components/ui/KPICard';
import { AlertFeed } from '../components/ui/AlertBanner';
import { useAI } from '../hooks/useAI';
import { useAlertStore, useIncidentStore } from '../store/useAppStore';
import { MOCK_KPIs, CROWD_HISTORY, INCIDENT_HISTORY, MOCK_CROWD_DATA } from '../data/mockData';
import { getCrowdColor, getCrowdLabel, timeAgo, formatNumber } from '../utils/helpers';
import { cn } from '../utils/helpers';

const CHART_TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: '#0D1117',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
  },
  labelStyle: { color: '#9CA3AF', fontSize: 11 },
};

export const OperationsPage: React.FC = () => {
  const { data: aiData, isLoading, analyzeCrowd } = useAI();
  const { alerts, unreadCount, acknowledgeAll } = useAlertStore();
  const { incidents } = useIncidentStore();

  useEffect(() => {
    analyzeCrowd();
  }, []);

  const activeIncidents = incidents.filter(i => i.status !== 'resolved' && i.status !== 'closed');

  return (
    <div className="p-6 space-y-6 max-w-screen-2xl mx-auto">
      <SectionHeader
        title="Operations Command"
        subtitle="Full stadium intelligence and incident management dashboard"
        icon={Settings}
        actions={
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={acknowledgeAll}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30 text-sm hover:bg-amber-500/25 transition-colors"
                aria-label={`Acknowledge all ${unreadCount} alerts`}
              >
                <BellOff className="w-4 h-4" />
                Clear {unreadCount} Alerts
              </button>
            )}
            <button
              onClick={() => analyzeCrowd()}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/15 text-primary border border-primary/30 text-sm hover:bg-primary/25 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Intel
            </button>
          </div>
        }
      />

      {/* Alerts */}
      <div className="space-y-2">
        <AlertFeed maxVisible={3} />
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {MOCK_KPIs.map((kpi, i) => (
          <KPICard key={kpi.label} kpi={kpi} index={i} />
        ))}
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Crowd area chart */}
        <div className="xl:col-span-2 glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Live Crowd Flow</h3>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Updating every 30s
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={CROWD_HISTORY.slice(-12)} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                {[['east', '#3B82F6'], ['west', '#F97316'], ['north', '#10B981'], ['south', '#8B5CF6']].map(([zone, color]) => (
                  <linearGradient key={zone} id={`grad-ops-${zone}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#6B7280' }} />
              <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} />
              <Tooltip {...CHART_TOOLTIP_STYLE} />
              <Area type="monotone" dataKey="east" stroke="#3B82F6" fill="url(#grad-ops-east)" strokeWidth={2} />
              <Area type="monotone" dataKey="west" stroke="#F97316" fill="url(#grad-ops-west)" strokeWidth={2} />
              <Area type="monotone" dataKey="north" stroke="#10B981" fill="url(#grad-ops-north)" strokeWidth={2} />
              <Area type="monotone" dataKey="south" stroke="#8B5CF6" fill="url(#grad-ops-south)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Incident bar chart */}
        <div className="glass-card p-5">
          <h3 className="font-semibold text-foreground mb-4">Incidents by Hour</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={INCIDENT_HISTORY} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="hour" tick={{ fontSize: 9, fill: '#6B7280' }} />
              <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} />
              <Tooltip {...CHART_TOOLTIP_STYLE} />
              <Bar dataKey="medical" fill="#EF4444" radius={[3, 3, 0, 0]} opacity={0.8} stackId="a" />
              <Bar dataKey="security" fill="#F97316" radius={[3, 3, 0, 0]} opacity={0.8} stackId="a" />
              <Bar dataKey="infrastructure" fill="#3B82F6" radius={[3, 3, 0, 0]} opacity={0.8} stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Zone Status table */}
        <div className="xl:col-span-2 glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Zone Status Overview</h3>
            <Link to="/crowd" className="text-xs text-primary flex items-center gap-1 hover:underline">
              Full Intel <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm" role="table" aria-label="Zone crowd status">
              <thead>
                <tr className="text-xs text-muted-foreground uppercase tracking-wide border-b border-black/10 dark:border-white/8">
                  <th className="text-left pb-3 font-medium">Zone</th>
                  <th className="text-center pb-3 font-medium">Occupancy</th>
                  <th className="text-center pb-3 font-medium">Density</th>
                  <th className="text-center pb-3 font-medium">Status</th>
                  <th className="text-center pb-3 font-medium">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {MOCK_CROWD_DATA.map((zone) => (
                  <tr key={zone.zoneId} className="hover:bg-black/5 dark:bg-white/3 transition-colors">
                    <td className="py-3">
                      <div className="font-medium text-foreground">{zone.zoneLabel}</div>
                      <div className="text-xs text-muted-foreground">Sec. {zone.section}</div>
                    </td>
                    <td className="py-3 text-center text-foreground">
                      {formatNumber(zone.currentOccupancy)} / {formatNumber(zone.capacity)}
                    </td>
                    <td className="py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.round(zone.density * 100)}%`,
                              backgroundColor: getCrowdColor(zone.level)
                            }}
                          />
                        </div>
                        <span className="text-xs font-medium" style={{ color: getCrowdColor(zone.level) }}>
                          {Math.round(zone.density * 100)}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 text-center">
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${getCrowdColor(zone.level)}20`,
                          color: getCrowdColor(zone.level)
                        }}
                      >
                        {getCrowdLabel(zone.level)}
                      </span>
                    </td>
                    <td className="py-3 text-center text-xs">
                      <span className={cn(
                        zone.trend === 'increasing' ? 'text-red-400' :
                        zone.trend === 'decreasing' ? 'text-emerald-400' : 'text-muted-foreground'
                      )}>
                        {zone.trend === 'increasing' ? '↑' : zone.trend === 'decreasing' ? '↓' : '→'} {zone.trend}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Insights column */}
        <div className="space-y-4">
          {/* Active incidents */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Radio className="w-4 h-4 text-red-400 animate-pulse" />
                Active ({activeIncidents.length})
              </h3>
              <Link to="/emergency" className="text-xs text-primary hover:underline">View all</Link>
            </div>
            <div className="space-y-2">
              {activeIncidents.slice(0, 3).map((inc) => (
                <div key={inc.id} className="flex items-center gap-2 text-sm">
                  <div className={cn(
                    'w-2 h-2 rounded-full flex-shrink-0',
                    inc.severity === 'critical' ? 'bg-red-400 animate-pulse' :
                    inc.severity === 'high' ? 'bg-orange-400' : 'bg-amber-400'
                  )} />
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-foreground">{inc.id}</div>
                    <div className="text-xs text-muted-foreground truncate">{inc.location.zoneLabel}</div>
                  </div>
                  <span className="text-xs text-muted-foreground flex-shrink-0">{timeAgo(inc.reportedAt)}</span>
                </div>
              ))}
            </div>
          </div>

          <AIResponseCard
            response={aiData}
            isLoading={isLoading}
            title="AI Operations Insight"
            compact={true}
          />
        </div>
      </div>
    </div>
  );
};
