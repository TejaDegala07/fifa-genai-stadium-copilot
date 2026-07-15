import React from 'react';
import { cn, getCrowdBgClass, getSeverityBgClass, getCrowdLabel } from '../../utils/helpers';
import type { CrowdLevel, SeverityLevel } from '../../data/constants';

interface StatusBadgeProps {
  type: 'crowd' | 'severity' | 'custom';
  value: string;
  level?: CrowdLevel | SeverityLevel;
  className?: string;
  showDot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  type, value, level, className, showDot = true
}) => {
  const baseClass =
    type === 'crowd' && level
      ? getCrowdBgClass(level as CrowdLevel)
      : type === 'severity' && level
      ? getSeverityBgClass(level as SeverityLevel)
      : 'bg-muted/40 text-muted-foreground border-muted/30';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border',
        baseClass,
        className
      )}
      role="status"
    >
      {showDot && (
        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" aria-hidden="true" />
      )}
      {value}
    </span>
  );
};
