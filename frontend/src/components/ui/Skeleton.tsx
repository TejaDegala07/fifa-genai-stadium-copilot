import React from 'react';
import { cn } from '../../utils/helpers';

interface SkeletonProps {
  className?: string;
  'aria-label'?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, 'aria-label': label }) => (
  <div
    className={cn('skeleton', className)}
    role="status"
    aria-label={label ?? 'Loading...'}
    aria-busy="true"
  />
);

export const SkeletonCard: React.FC<{ lines?: number }> = ({ lines = 3 }) => (
  <div className="glass-card p-5 space-y-3" role="status" aria-label="Loading content">
    <Skeleton className="h-5 w-1/3" />
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton key={i} className={`h-4 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} />
    ))}
  </div>
);
