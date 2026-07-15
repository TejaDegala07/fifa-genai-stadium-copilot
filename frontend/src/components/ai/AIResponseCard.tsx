// =============================================================================
// AI RESPONSE CARD — Structured display of AI reasoning
// =============================================================================

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, AlertTriangle, CheckCircle2, Target,
  TrendingUp, Zap, Shield, Loader2, Info,
  ChevronDown, ChevronUp
} from 'lucide-react';
import { useState } from 'react';
import type { AIResponse } from '../../types';
import { cn, getConfidenceColor, getConfidenceLabel } from '../../utils/helpers';

interface AIResponseCardProps {
  response: AIResponse | null;
  isLoading?: boolean;
  error?: string | null;
  title?: string;
  compact?: boolean;
  className?: string;
  isUsingMock?: boolean;
}

const PRIORITY_STYLES: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  'Routine': { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  'Attention Required': { icon: Info, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  'Urgent': { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  'Critical — Immediate Action': { icon: Zap, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
};

function LoadingSkeleton() {
  return (
    <div className="space-y-3 animate-pulse" role="status" aria-label="Loading AI analysis">
      <div className="flex items-center gap-2">
        <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
        <span className="text-sm text-blue-400 font-medium">AI is reasoning...</span>
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-2">
          <div className="h-3 bg-white/5 rounded-full w-24" />
          <div className="h-4 bg-white/5 rounded w-full" />
          <div className="h-4 bg-white/5 rounded w-3/4" />
        </div>
      ))}
    </div>
  );
}

export const AIResponseCard = React.memo(({
  response,
  isLoading = false,
  error = null,
  title = 'AI Analysis',
  compact = false,
  className,
  isUsingMock = false,
}: AIResponseCardProps) => {
  const [expanded, setExpanded] = useState(!compact);

  if (isLoading) {
    return (
      <div className={cn('ai-response p-4', className)}>
        <LoadingSkeleton />
      </div>
    );
  }

  if (error && !response) {
    return (
      <div className={cn('ai-response p-4 border-amber-500/20', className)}>
        <div className="flex items-center gap-2 text-amber-400">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-sm font-medium">Using cached intelligence</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">{error}</p>
      </div>
    );
  }

  if (!response) return null;

  const priorityStyle = PRIORITY_STYLES[response.priority] ??
    PRIORITY_STYLES['Attention Required'];
  const PriorityIcon = priorityStyle.icon;

  const sections = [
    { icon: Target, label: 'Situation', content: response.situation, color: 'text-blue-400' },
    { icon: Brain, label: 'Reasoning', content: response.reasoning, color: 'text-purple-400' },
    { icon: CheckCircle2, label: 'Recommendation', content: response.recommendation, color: 'text-emerald-400' },
    { icon: TrendingUp, label: 'Estimated Impact', content: response.estimatedImpact, color: 'text-amber-400' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('ai-response', className)}
      role="region"
      aria-label={`AI Analysis: ${title}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
            <Brain className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            {isUsingMock && (
              <span className="text-xs text-amber-400/80">Demo mode — offline intelligence</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Priority badge */}
          <div className={cn(
            'flex items-center gap-1.5 px-2 py-1 rounded-full border text-xs font-medium',
            priorityStyle.bg, priorityStyle.color
          )}>
            <PriorityIcon className="w-3 h-3" />
            <span className="hidden sm:inline">{response.priority}</span>
          </div>

          {compact && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded"
              aria-expanded={expanded}
              aria-label={expanded ? 'Collapse AI analysis' : 'Expand AI analysis'}
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {/* AI Sections */}
            <div className="space-y-3">
              {sections.map(({ icon: Icon, label, content, color }) => (
                <div key={label} className="flex gap-3">
                  <div className="mt-0.5 flex-shrink-0">
                    <Icon className={cn('w-4 h-4', color)} />
                  </div>
                  <div>
                    <p className={cn('text-xs font-semibold uppercase tracking-wide mb-0.5', color)}>
                      {label}
                    </p>
                    <p className="text-sm text-foreground/90 leading-relaxed">{content}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            {response.actions && response.actions.length > 0 && (
              <div className="mt-4 pt-3 border-t border-white/10">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  Recommended Actions
                </p>
                <div className="flex flex-wrap gap-2">
                  {response.actions.map((action) => (
                    <button
                      key={action.id}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200',
                        action.urgency === 'critical'
                          ? 'bg-red-500/15 text-red-400 border-red-500/30 hover:bg-red-500/25'
                          : action.urgency === 'high'
                          ? 'bg-orange-500/15 text-orange-400 border-orange-500/30 hover:bg-orange-500/25'
                          : 'bg-blue-500/15 text-blue-400 border-blue-500/30 hover:bg-blue-500/25'
                      )}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Confidence */}
            <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-3">
              <Shield className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">AI Confidence:</span>
              <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${response.confidence}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: getConfidenceColor(response.confidence) }}
                />
              </div>
              <span
                className="text-xs font-medium"
                style={{ color: getConfidenceColor(response.confidence) }}
              >
                {response.confidence}% — {getConfidenceLabel(response.confidence)}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});
