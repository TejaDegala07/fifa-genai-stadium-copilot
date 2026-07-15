// =============================================================================
// UTILITY FUNCTIONS — Pure helper functions
// =============================================================================

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { CROWD_THRESHOLDS, CROWD_LEVELS } from '../data/constants';
import type { CrowdLevel, SeverityLevel } from '../data/constants';

// ---- Tailwind class merging ------------------------------------------------

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ---- Crowd density utilities -----------------------------------------------

export function getCrowdLevel(density: number): CrowdLevel {
  if (density >= CROWD_THRESHOLDS.HIGH) return CROWD_LEVELS.CRITICAL;
  if (density >= CROWD_THRESHOLDS.MODERATE) return CROWD_LEVELS.HIGH;
  if (density >= CROWD_THRESHOLDS.SAFE) return CROWD_LEVELS.MODERATE;
  return CROWD_LEVELS.SAFE;
}

export function getCrowdColor(level: CrowdLevel): string {
  const map: Record<CrowdLevel, string> = {
    safe: '#10B981',
    moderate: '#F59E0B',
    high: '#F97316',
    critical: '#EF4444',
  };
  return map[level];
}

export function getCrowdBgClass(level: CrowdLevel): string {
  const map: Record<CrowdLevel, string> = {
    safe: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
    moderate: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
    high: 'bg-orange-500/15 text-orange-400 border-orange-500/25',
    critical: 'bg-red-500/15 text-red-400 border-red-500/25',
  };
  return map[level];
}

export function getCrowdLabel(level: CrowdLevel): string {
  const map: Record<CrowdLevel, string> = {
    safe: 'Safe',
    moderate: 'Moderate',
    high: 'High',
    critical: 'Critical',
  };
  return map[level];
}

// ---- Severity utilities ----------------------------------------------------

export function getSeverityColor(severity: SeverityLevel): string {
  const map: Record<SeverityLevel, string> = {
    low: '#10B981',
    medium: '#F59E0B',
    high: '#F97316',
    critical: '#EF4444',
  };
  return map[severity];
}

export function getSeverityBgClass(severity: SeverityLevel): string {
  const map: Record<SeverityLevel, string> = {
    low: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
    medium: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
    high: 'bg-orange-500/15 text-orange-400 border-orange-500/25',
    critical: 'bg-red-500/15 text-red-400 border-red-500/25',
  };
  return map[severity];
}

// ---- Date/Time utilities ---------------------------------------------------

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

// ---- Number utilities ------------------------------------------------------

export function formatNumber(n: number): string {
  return n.toLocaleString('en-US');
}

export function formatPercent(value: number, total: number): string {
  return `${Math.round((value / total) * 100)}%`;
}

export function formatPercentNum(ratio: number): string {
  return `${Math.round(ratio * 100)}%`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// ---- String utilities ------------------------------------------------------

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

export function truncate(s: string, maxLength: number): string {
  if (s.length <= maxLength) return s;
  return `${s.slice(0, maxLength - 3)}...`;
}

export function slugify(s: string): string {
  return s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

// ---- Eco score utilities ---------------------------------------------------

export function getEcoTier(score: number): 'bronze' | 'silver' | 'gold' | 'champion' {
  if (score >= 90) return 'champion';
  if (score >= 75) return 'gold';
  if (score >= 50) return 'silver';
  return 'bronze';
}

export function getEcoTierColor(tier: string): string {
  const map: Record<string, string> = {
    champion: '#10B981',
    gold: '#F59E0B',
    silver: '#9CA3AF',
    bronze: '#B45309',
  };
  return map[tier] ?? '#9CA3AF';
}

// ---- Security: Input sanitization -----------------------------------------

export function sanitizeText(input: string): string {
  return input
    .slice(0, 2000)
    .replace(/[<>{}[\]\\]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/prompt\s*:|system\s*:|ignore\s+previous/gi, '')
    .trim();
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ---- AI confidence display ------------------------------------------------

export function getConfidenceLabel(confidence: number): string {
  if (confidence >= 90) return 'Very High';
  if (confidence >= 75) return 'High';
  if (confidence >= 60) return 'Moderate';
  if (confidence >= 40) return 'Low';
  return 'Very Low';
}

export function getConfidenceColor(confidence: number): string {
  if (confidence >= 90) return '#10B981';
  if (confidence >= 75) return '#3B82F6';
  if (confidence >= 60) return '#F59E0B';
  return '#EF4444';
}

// ---- Random utilities (for simulating live updates) -----------------------

export function addNoise(value: number, maxNoise: number): number {
  return value + (Math.random() - 0.5) * 2 * maxNoise;
}

export function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ---- Incident type labels --------------------------------------------------

export function getIncidentTypeLabel(type: string): string {
  const map: Record<string, string> = {
    medical: 'Medical Emergency',
    fight: 'Altercation',
    fire: 'Fire Hazard',
    lost_child: 'Lost Child',
    suspicious_object: 'Suspicious Object',
    stampede: 'Crowd Surge',
    infrastructure: 'Infrastructure Issue',
    weather: 'Weather Event',
    other: 'Other Incident',
  };
  return map[type] ?? type;
}

export function getIncidentTypeIcon(type: string): string {
  const map: Record<string, string> = {
    medical: 'Heart',
    fight: 'Fist',
    fire: 'Flame',
    lost_child: 'Baby',
    suspicious_object: 'Package',
    stampede: 'AlertTriangle',
    infrastructure: 'Wrench',
    weather: 'CloudRain',
    other: 'AlertCircle',
  };
  return map[type] ?? 'AlertCircle';
}
