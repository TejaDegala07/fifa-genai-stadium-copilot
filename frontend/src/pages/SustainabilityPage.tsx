// =============================================================================
// SUSTAINABILITY PAGE
// =============================================================================

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Leaf, Droplets, Recycle, Zap, Award, TrendingUp,
  RefreshCw, Star, TreePine, Wind
} from 'lucide-react';
import {
  RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis,
  PieChart, Pie, Cell, Tooltip
} from 'recharts';
import { SectionHeader } from '../components/ui/SectionHeader';
import { AIResponseCard } from '../components/ai/AIResponseCard';
import { useAI } from '../hooks/useAI';
import { cn, getEcoTier, getEcoTierColor } from '../utils/helpers';

const ECO_SCORE = 84;

const ECO_BREAKDOWN = [
  { label: 'Transport', value: 32, max: 40, color: '#10B981', icon: Wind },
  { label: 'Digital Ticket', value: 15, max: 20, color: '#3B82F6', icon: Zap },
  { label: 'Water Refills', value: 18, max: 20, color: '#22D3EE', icon: Droplets },
  { label: 'Waste Sort', value: 12, max: 15, color: '#8B5CF6', icon: Recycle },
  { label: 'Local Food', value: 7, max: 5, color: '#F59E0B', icon: Leaf },
];

const ECO_TIPS = [
  { icon: Droplets, text: 'Refill station S4 in Section G — no queue right now', action: 'Navigate', priority: 'high' },
  { icon: Recycle, text: 'Sort your waste at the green bins near Gate 3 for bonus eco points', action: 'Learn more', priority: 'medium' },
  { icon: Leaf, text: 'Try the local NJ produce bowl at Concession G3 — zero-transport food', action: 'Find', priority: 'low' },
  { icon: TreePine, text: 'You\'ve saved enough CO₂ to offset 2 trees today. Keep going!', action: null, priority: 'celebration' },
];

const LEADERBOARD = [
  { rank: 1, name: 'Section H Fans', score: 92, badge: '🏆' },
  { rank: 2, name: 'Section D Fans', score: 89, badge: '🥈' },
  { rank: 3, name: 'Section F Fans', score: 87, badge: '🥉' },
  { rank: 4, name: 'Your Section (E)', score: 84, badge: '🌿', isYou: true },
  { rank: 5, name: 'Section B Fans', score: 81, badge: '' },
];

export const SustainabilityPage: React.FC = () => {
  const { data: aiData, isLoading, getSustainability, isUsingMock } = useAI();
  const tier = getEcoTier(ECO_SCORE);
  const tierColor = getEcoTierColor(tier);

  useEffect(() => {
    getSustainability();
  }, []);

  const CHART_DATA = [{ name: 'Eco', value: ECO_SCORE, fill: tierColor }];

  const TOOLTIP_STYLE = {
    contentStyle: { backgroundColor: '#0D1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' },
  };

  return (
    <div className="p-6 space-y-6 max-w-screen-2xl mx-auto">
      <SectionHeader
        title="Sustainability Assistant"
        subtitle="Your eco impact at FIFA World Cup 2026 — every choice matters"
        icon={Leaf}
        actions={
          <button
            onClick={() => getSustainability()}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-sm hover:bg-emerald-500/25 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Update
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Circle */}
        <div className="glass-card p-6 flex flex-col items-center justify-center text-center border border-emerald-500/20 bg-emerald-500/5">
          <div className="relative w-40 h-40 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%" cy="50%"
                innerRadius="70%" outerRadius="100%"
                startAngle={90} endAngle={-270}
                data={CHART_DATA}
              >
                <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                <RadialBar dataKey="value" cornerRadius={10} background={{ fill: 'rgba(255,255,255,0.05)' }} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
              >
                <div className="text-4xl font-bold font-display" style={{ color: tierColor }}>
                  {ECO_SCORE}
                </div>
                <div className="text-xs text-muted-foreground">/100</div>
              </motion.div>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <Award className="w-5 h-5" style={{ color: tierColor }} />
            <span className="font-bold text-lg capitalize" style={{ color: tierColor }}>
              {tier === 'champion' ? '🌟 Eco Champion' : `${tier.charAt(0).toUpperCase() + tier.slice(1)} Tier`}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">Your eco score today</p>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mt-5 w-full">
            {[
              { label: 'CO₂ Saved', value: '21 kg', icon: '🌿' },
              { label: 'Plastic Avoided', value: '2 bottles', icon: '♻️' },
              { label: 'Refills Used', value: '2', icon: '💧' },
              { label: 'Digital Ticket', value: 'Yes ✓', icon: '📱' },
            ].map(({ label, value, icon }) => (
              <div key={label} className="p-3 rounded-xl bg-white/5 border border-white/8 text-center">
                <div className="text-lg">{icon}</div>
                <div className="font-semibold text-sm text-foreground">{value}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Middle: Breakdown + Tips */}
        <div className="space-y-5">
          {/* Score breakdown */}
          <div className="glass-card p-5">
            <h3 className="font-semibold text-foreground mb-4">Score Breakdown</h3>
            <div className="space-y-3">
              {ECO_BREAKDOWN.map(({ label, value, max, color, icon: Icon }) => (
                <div key={label}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center gap-1.5">
                      <Icon className="w-3.5 h-3.5" style={{ color }} />
                      <span className="text-muted-foreground">{label}</span>
                    </div>
                    <span className="font-medium text-foreground">{value}/{max}</span>
                  </div>
                  <div className="h-2 bg-white/8 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (value / max) * 100)}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Eco Tips */}
          <div className="glass-card p-5">
            <h3 className="font-semibold text-foreground mb-4">AI Eco Suggestions</h3>
            <div className="space-y-3">
              {ECO_TIPS.map(({ icon: Icon, text, action, priority }, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-xl border',
                    priority === 'celebration' ? 'border-emerald-500/25 bg-emerald-500/8' :
                    priority === 'high' ? 'border-blue-500/20 bg-blue-500/5' : 'border-white/8'
                  )}
                >
                  <Icon className={cn(
                    'w-4 h-4 mt-0.5 flex-shrink-0',
                    priority === 'celebration' ? 'text-emerald-400' : 'text-muted-foreground'
                  )} />
                  <p className="text-sm text-foreground/90 flex-1 leading-relaxed">{text}</p>
                  {action && (
                    <button className="text-xs text-primary hover:underline flex-shrink-0">{action}</button>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Leaderboard + AI */}
        <div className="space-y-5">
          {/* Section leaderboard */}
          <div className="glass-card p-5">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Eco Leaderboard
            </h3>
            <div className="space-y-2">
              {LEADERBOARD.map(({ rank, name, score, badge, isYou }) => (
                <div
                  key={rank}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-xl transition-colors',
                    isYou ? 'bg-emerald-500/10 border border-emerald-500/20' : 'hover:bg-white/5'
                  )}
                >
                  <span className="text-lg w-6 text-center">{badge || `#${rank}`}</span>
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-sm font-medium truncate', isYou ? 'text-emerald-400' : 'text-foreground')}>
                      {name} {isYou && '(You)'}
                    </p>
                  </div>
                  <span className="font-bold text-sm" style={{ color: getEcoTierColor(getEcoTier(score)) }}>
                    {score}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* AI insight */}
          <AIResponseCard
            response={aiData}
            isLoading={isLoading}
            isUsingMock={isUsingMock}
            title="AI Eco Analysis"
            compact={true}
          />
        </div>
      </div>
    </div>
  );
};
