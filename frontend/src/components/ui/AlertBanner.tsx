import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { cn, getSeverityBgClass } from '../../utils/helpers';
import { timeAgo } from '../../utils/helpers';
import type { Alert } from '../../types';
import { useAlertStore, useUserStore } from '../../store/useAppStore';
import { useTranslation } from '../../hooks/useTranslation';

interface AlertBannerProps {
  alert: Alert;
  onDismiss?: () => void;
}

const ICONS = {
  low: Info,
  medium: AlertCircle,
  high: AlertTriangle,
  critical: AlertTriangle,
};

export const AlertBanner: React.FC<AlertBannerProps> = ({ alert, onDismiss }) => {
  const { acknowledgeAlert } = useAlertStore();
  const { user } = useUserStore();
  const { t } = useTranslation();
  const Icon = ICONS[alert.severity];

  const handleDismiss = () => {
    acknowledgeAlert(alert.id, user.name);
    onDismiss?.();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      className={cn(
        'flex items-start gap-3 p-3 rounded-xl border text-sm',
        getSeverityBgClass(alert.severity)
      )}
      role="alert"
      aria-live={alert.severity === 'critical' ? 'assertive' : 'polite'}
    >
      <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <div className="font-semibold">{alert.titleKey ? t(alert.titleKey) : alert.title}</div>
        <div className="text-xs opacity-80 mt-0.5 leading-relaxed">{alert.messageKey ? t(alert.messageKey) : alert.message}</div>
        <div className="text-xs opacity-60 mt-1">{timeAgo(alert.createdAt)}</div>
      </div>
      <button
        onClick={handleDismiss}
        className="p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors flex-shrink-0"
        aria-label={t('alert.dismiss')}
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
};

// Alert feed — shows all unacknowledged alerts
export const AlertFeed: React.FC<{ maxVisible?: number }> = ({ maxVisible = 3 }) => {
  const { alerts } = useAlertStore();
  const visible = alerts.filter((a) => !a.acknowledged).slice(0, maxVisible);

  return (
    <AnimatePresence>
      {visible.map((alert) => (
        <AlertBanner key={alert.id} alert={alert} />
      ))}
    </AnimatePresence>
  );
};
