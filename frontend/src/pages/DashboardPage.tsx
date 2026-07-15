// =============================================================================
// DASHBOARD PAGE — Role-aware main dashboard
// =============================================================================

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Activity, AlertTriangle, Users, Clock,
  TrendingUp, Zap, ArrowRight, MapPin, Thermometer,
  Wind, Eye, RefreshCw, Star
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { KPICard } from '../components/ui/KPICard';
import { AlertFeed } from '../components/ui/AlertBanner';
import { SectionHeader } from '../components/ui/SectionHeader';
import { AIResponseCard } from '../components/ai/AIResponseCard';
import { useUserStore, useAlertStore, useIncidentStore } from '../store/useAppStore';
import { MOCK_KPIs, CROWD_HISTORY, INCIDENT_HISTORY, MOCK_CROWD_DATA } from '../data/mockData';
import { STADIUM, ROLE_CONFIG, USER_ROLES } from '../data/constants';
import { getCrowdBgClass, getCrowdLabel, getCrowdColor, formatNumber, timeAgo } from '../utils/helpers';
import { useAI } from '../hooks/useAI';
import type { UserRole } from '../data/constants';

// ---- Role-specific hero content -------------------------------------------

const ROLE_HERO: Record<UserRole, { greeting: string; focus: string; quickActions: { label: string; path: string; icon: React.ElementType; color: string }[] }> = {
  fan: {
    greeting: 'Welcome to the stadium!',
    focus: "Here's everything you need for a great match day experience.",
    quickActions: [
      { label: 'Find My Seat', path: '/map', icon: MapPin, color: 'text-blue-400' },
      { label: 'Transport Info', path: '/transport', icon: Activity, color: 'text-cyan-400' },
      { label: 'Report Issue', path: '/emergency', icon: AlertTriangle, color: 'text-red-400' },
    ],
  },
  volunteer: {
    greeting: 'Volunteer Hub',
    focus: 'Your active assignments and crowd situation overview.',
    quickActions: [
      { label: 'My Tasks', path: '/volunteer', icon: Users, color: 'text-emerald-400' },
      { label: 'Crowd Intel', path: '/crowd', icon: Activity, color: 'text-orange-400' },
      { label: 'Emergency', path: '/emergency', icon: AlertTriangle, color: 'text-red-400' },
    ],
  },
  security: {
    greeting: 'Security Operations',
    focus: 'Real-time crowd intelligence and incident status.',
    quickActions: [
      { label: 'Crowd Intel', path: '/crowd', icon: Activity, color: 'text-orange-400' },
      { label: 'Incidents', path: '/emergency', icon: AlertTriangle, color: 'text-red-400' },
      { label: 'Stadium Map', path: '/map', icon: MapPin, color: 'text-blue-400' },
    ],
  },
  operations: {
    greeting: 'Operations Command',
    focus: 'Full stadium intelligence at a glance.',
    quickActions: [
      { label: 'Announcements', path: '/announcements', icon: Zap, color: 'text-purple-400' },
      { label: 'Crowd Intel', path: '/crowd', icon: Activity, color: 'text-orange-400' },
      { label: 'Operations', path: '/operations', icon: TrendingUp, color: 'text-blue-400' },
    ],
  },
  medical: {
    greeting: 'Medical Command',
    focus: 'Active cases and medical zone status.',
    quickActions: [
      { label: 'Active Cases', path: '/medical', icon: Activity, color: 'text-red-400' },
      { label: 'Stadium Map', path: '/map', icon: MapPin, color: 'text-blue-400' },
      { label: 'Report Incident', path: '/emergency', icon: AlertTriangle, color: 'text-amber-400' },
    ],
  },
  transport: {
    greeting: 'Transport Control',
    focus: "Live transport status and fan departure analytics.",
    quickActions: [
      { label: 'Transport Intel', path: '/transport', icon: Activity, color: 'text-cyan-400' },
      { label: 'Crowd Map', path: '/map', icon: MapPin, color: 'text-blue-400' },
      { label: 'Operations', path: '/operations', icon: TrendingUp, color: 'text-purple-400' },
    ],
  },
};

// ---- Weather Widget --------------------------------------------------------

const WeatherWidget: React.FC = () => (
  <div className="glass-card p-4 flex items-center gap-4">
    <div className="text-3xl">⛅</div>
    <div>
      <div className="text-lg font-bold text-foreground">28°C</div>
      <div className="text-xs text-muted-foreground">Partly Cloudy</div>
    </div>
    <div className="ml-auto space-y-1">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Wind className="w-3 h-3" /> 12 km/h W
      </div>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Eye className="w-3 h-3" /> 10 km visibility
      </div>
    </div>
  </div>
);

// ---- Crowd Summary --------------------------------------------------------

const CrowdSummary: React.FC = () => {
  const total = MOCK_CROWD_DATA.reduce((a, z) => a + z.currentOccupancy, 0);
  const capacity = MOCK_CROWD_DATA.reduce((a, z) => a + z.capacity, 0);
  const pct = Math.round((total / capacity) * 100);

  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Stadium Occupancy</h3>
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live
        </span>
      </div>

      <div>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-3xl font-bold font-display text-foreground">{formatNumber(total)}</span>
          <span className="text-muted-foreground">/ {formatNumber(capacity)}</span>
          <span className={`ml-auto text-lg font-bold ${pct >= 88 ? 'text-red-400' : pct >= 75 ? 'text-orange-400' : 'text-emerald-400'}`}>
            {pct}%
          </span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ backgroundColor: pct >= 88 ? '#EF4444' : pct >= 75 ? '#F97316' : '#10B981' }}
          />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Safe', count: MOCK_CROWD_DATA.filter(z => z.level === 'safe').length, color: 'text-emerald-400 bg-emerald-500/15' },
          { label: 'Moderate', count: MOCK_CROWD_DATA.filter(z => z.level === 'moderate').length, color: 'text-amber-400 bg-amber-500/15' },
          { label: 'High', count: MOCK_CROWD_DATA.filter(z => z.level === 'high').length, color: 'text-orange-400 bg-orange-500/15' },
          { label: 'Critical', count: MOCK_CROWD_DATA.filter(z => z.level === 'critical').length, color: 'text-red-400 bg-red-500/15' },
        ].map(({ label, count, color }) => (
          <div key={label} className={`${color} rounded-lg p-2 text-center`}>
            <div className="text-lg font-bold">{count}</div>
            <div className="text-xs opacity-80">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ---- Incident List ---------------------------------------------------------

const RecentIncidents: React.FC = () => {
  const { incidents } = useIncidentStore();
  const active = incidents.filter((i) => i.status !== 'resolved' && i.status !== 'closed');

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Active Incidents</h3>
        <Link to="/emergency" className="text-xs text-primary hover:underline flex items-center gap-1">
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="space-y-3">
        {active.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No active incidents 🎉</p>
        ) : (
          active.map((incident) => (
            <div key={incident.id} className="flex items-start gap-3 p-3 rounded-lg bg-white/3 hover:bg-white/5 transition-colors">
              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                incident.severity === 'critical' ? 'bg-red-400 animate-pulse' :
                incident.severity === 'high' ? 'bg-orange-400' :
                incident.severity === 'medium' ? 'bg-amber-400' : 'bg-emerald-400'
              }`} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground truncate">
                  {incident.id} — {incident.type.replace('_', ' ').toUpperCase()}
                </div>
                <div className="text-xs text-muted-foreground truncate">{incident.location.zoneLabel}</div>
                <div className="text-xs text-muted-foreground">{timeAgo(incident.reportedAt)}</div>
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full flex-shrink-0 ${
                incident.status === 'in_progress' ? 'bg-blue-500/15 text-blue-400' : 'bg-amber-500/15 text-amber-400'
              }`}>
                {incident.status.replace('_', ' ')}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// ---- Main Dashboard -------------------------------------------------------

const CHART_TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: '#0D1117',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
  },
  labelStyle: { color: '#9CA3AF', fontSize: 12 },
};

export const DashboardPage: React.FC = () => {
  const { user } = useUserStore();
  const roleConfig = ROLE_CONFIG[user.role];
  const hero = ROLE_HERO[user.role];
  const { data: aiData, isLoading: aiLoading, analyzeCrowd } = useAI();

  React.useEffect(() => {
    analyzeCrowd();
  }, []);

  const kpis = user.role === 'fan'
    ? MOCK_KPIs.slice(0, 4)
    : user.role === 'medical'
    ? MOCK_KPIs.filter(k => ['Active Incidents', 'Medical Cases', 'Avg Response Time', 'Volunteers Active'].includes(k.label))
    : MOCK_KPIs;

  return (
    <div className="p-6 space-y-6 max-w-screen-2xl mx-auto">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden glass-card p-6 border-primary/20"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge-blue text-xs">
                <span className="pulse-dot green" aria-hidden="true" />
                Live — {STADIUM.match.stage}
              </span>
              <span className="text-xs text-muted-foreground">
                {STADIUM.match.home} vs {STADIUM.match.away} • {STADIUM.name}
              </span>
            </div>
            <h1 className="text-2xl font-display font-bold text-foreground">{hero.greeting}</h1>
            <p className="text-muted-foreground text-sm mt-1">{hero.focus}</p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {hero.quickActions.map(({ label, path, icon: Icon, color }) => (
              <Link
                key={path}
                to={path}
                className="flex items-center gap-2 px-3 py-2 rounded-lg glass-card-hover text-sm font-medium hover:scale-105 transition-transform"
              >
                <Icon className={cn('w-4 h-4', color)} aria-hidden="true" />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Alerts Feed */}
      <div className="space-y-2">
        <AlertFeed maxVisible={2} />
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <KPICard key={kpi.label} kpi={kpi} index={i} />
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Crowd Chart */}
        <div className="lg:col-span-2 glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Crowd Flow — Today</h3>
            <button
              onClick={() => analyzeCrowd()}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Refresh crowd analysis"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh AI Analysis
            </button>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={CROWD_HISTORY} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
              <defs>
                {['east', 'west', 'north', 'south'].map((zone, i) => (
                  <linearGradient key={zone} id={`grad-${zone}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={['#3B82F6','#F97316','#10B981','#8B5CF6'][i]} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={['#3B82F6','#F97316','#10B981','#8B5CF6'][i]} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#6B7280' }} interval={3} />
              <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} />
              <Tooltip {...CHART_TOOLTIP_STYLE} />
              <Area type="monotone" dataKey="east" stroke="#3B82F6" fill="url(#grad-east)" strokeWidth={2} />
              <Area type="monotone" dataKey="west" stroke="#F97316" fill="url(#grad-west)" strokeWidth={2} />
              <Area type="monotone" dataKey="north" stroke="#10B981" fill="url(#grad-north)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-2 justify-center flex-wrap">
            {[['East', '#3B82F6'], ['West', '#F97316'], ['North', '#10B981']].map(([label, color]) => (
              <div key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <WeatherWidget />
          <CrowdSummary />
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentIncidents />

        {/* AI Insight */}
        <div>
          <AIResponseCard
            response={aiData}
            isLoading={aiLoading}
            title="AI Situation Analysis"
            compact={true}
          />
        </div>
      </div>

      {/* Incident Chart (ops/security only) */}
      {(user.role === USER_ROLES.OPERATIONS || user.role === USER_ROLES.SECURITY) && (
        <div className="glass-card p-5">
          <h3 className="font-semibold text-foreground mb-4">Incident Timeline — Today</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={INCIDENT_HISTORY} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#6B7280' }} />
              <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} />
              <Tooltip {...CHART_TOOLTIP_STYLE} />
              <Bar dataKey="medical" fill="#EF4444" radius={[4, 4, 0, 0]} opacity={0.8} />
              <Bar dataKey="security" fill="#F97316" radius={[4, 4, 0, 0]} opacity={0.8} />
              <Bar dataKey="infrastructure" fill="#3B82F6" radius={[4, 4, 0, 0]} opacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-2 justify-center">
            {[['Medical', '#EF4444'], ['Security', '#F97316'], ['Infrastructure', '#3B82F6']].map(([label, color]) => (
              <div key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                {label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper (needs to be imported)
function cn(...classes: (string | undefined | boolean)[]): string {
  return classes.filter(Boolean).join(' ');
}
