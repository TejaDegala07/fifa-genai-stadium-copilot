import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import * as Icons from 'lucide-react';
import { cn, formatNumber } from '../../utils/helpers';
import { useCountUp } from '../../hooks/useCountUp';
import { useTranslation } from '../../hooks/useTranslation';
import type { OperationsKPI } from '../../types';

interface KPICardProps {
  kpi: OperationsKPI;
  index?: number;
  className?: string;
}

const STATUS_STYLES = {
  good: 'border-emerald-500/20 bg-emerald-500/5',
  warning: 'border-amber-500/20 bg-amber-500/5',
  critical: 'border-red-500/20 bg-red-500/5',
};

const STATUS_BADGE = {
  good: 'text-emerald-400 bg-emerald-500/10',
  warning: 'text-amber-400 bg-amber-500/10',
  critical: 'text-red-400 bg-red-500/10',
};

export const KPICard: React.FC<KPICardProps> = React.memo(({ kpi, index = 0, className }) => {
  const { t } = useTranslation();
  const isNumeric = typeof kpi.value === 'number';
  const animatedValue = useCountUp(isNumeric ? (kpi.value as number) : 0);

  const Icon = ((Icons as any)[kpi.icon] ?? Icons.Activity) as React.ElementType;

  const TrendIcon = kpi.trend === 'up' ? TrendingUp : kpi.trend === 'down' ? TrendingDown : Minus;
  const trendColor =
    kpi.trend === 'stable'
      ? 'text-muted-foreground'
      : (kpi.status === 'good' && kpi.trend === 'up') || (kpi.status === 'good' && kpi.trend === 'down')
      ? 'text-emerald-400'
      : kpi.trend === 'up'
      ? 'text-red-400'
      : 'text-emerald-400';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: 'easeOut' }}
      className={cn(
        'kpi-card border',
        STATUS_STYLES[kpi.status],
        'glass-card-hover',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className={cn('p-2 rounded-lg', STATUS_BADGE[kpi.status])}>
          <Icon className="w-4 h-4" aria-hidden="true" />
        </div>
        {kpi.change !== undefined && (
          <div className={cn('flex items-center gap-1 text-xs font-medium', trendColor)}>
            <TrendIcon className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{Math.abs(kpi.change)}%</span>
          </div>
        )}
      </div>

      {/* Value */}
      <div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold font-display text-foreground" aria-live="polite">
            {isNumeric ? formatNumber(animatedValue) : kpi.value}
          </span>
          {kpi.unit && (
            <span className="text-sm text-muted-foreground">{kpi.unit}</span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {kpi.labelKey ? t(kpi.labelKey) : kpi.label}
        </p>
      </div>
    </motion.div>
  );
});
