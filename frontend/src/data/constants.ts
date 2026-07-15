// =============================================================================
// CONSTANTS — FIFA Stadium Intelligence Platform
// =============================================================================

export const APP_NAME = 'StadiumIQ';
export const APP_SUBTITLE = 'FIFA World Cup 2026 Intelligence Platform';
export const APP_VERSION = '1.0.0';

// Stadium configuration
export const STADIUM = {
  name: 'MetLife Stadium',
  city: 'East Rutherford, NJ',
  country: 'USA',
  capacity: 82_500,
  sections: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
  gates: ['Gate 1', 'Gate 2', 'Gate 3', 'Gate 4', 'Gate 5', 'Gate 6', 'Gate 7', 'Gate 8'],
  match: {
    home: 'Brazil',
    away: 'Argentina',
    kickoff: '2026-07-15T19:00:00',
    stage: 'Semi-Final',
  },
} as const;

// User roles
export const USER_ROLES = {
  FAN: 'fan',
  VOLUNTEER: 'volunteer',
  SECURITY: 'security',
  OPERATIONS: 'operations',
  MEDICAL: 'medical',
  TRANSPORT: 'transport',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

// Role metadata
export const ROLE_CONFIG = {
  [USER_ROLES.FAN]: {
    label: 'Fan',
    description: 'Match attendee',
    color: 'blue',
    icon: 'Users',
    primaryRoute: '/dashboard',
  },
  [USER_ROLES.VOLUNTEER]: {
    label: 'Volunteer',
    description: 'Event assistant',
    color: 'green',
    icon: 'HandHelping',
    primaryRoute: '/volunteer',
  },
  [USER_ROLES.SECURITY]: {
    label: 'Security Officer',
    description: 'Stadium security',
    color: 'orange',
    icon: 'Shield',
    primaryRoute: '/security',
  },
  [USER_ROLES.OPERATIONS]: {
    label: 'Operations Manager',
    description: 'Event operations',
    color: 'purple',
    icon: 'Settings',
    primaryRoute: '/operations',
  },
  [USER_ROLES.MEDICAL]: {
    label: 'Medical Staff',
    description: 'Healthcare team',
    color: 'red',
    icon: 'Stethoscope',
    primaryRoute: '/medical',
  },
  [USER_ROLES.TRANSPORT]: {
    label: 'Transport Coordinator',
    description: 'Mobility management',
    color: 'cyan',
    icon: 'Bus',
    primaryRoute: '/transport',
  },
} as const;

// Supported languages
export const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸', nativeLabel: 'English' },
  { code: 'es', label: 'Spanish', flag: '🇪🇸', nativeLabel: 'Español' },
  { code: 'fr', label: 'French', flag: '🇫🇷', nativeLabel: 'Français' },
  { code: 'ar', label: 'Arabic', flag: '🇸🇦', nativeLabel: 'العربية' },
  { code: 'pt', label: 'Portuguese', flag: '🇧🇷', nativeLabel: 'Português' },
  { code: 'hi', label: 'Hindi', flag: '🇮🇳', nativeLabel: 'हिन्दी' },
  { code: 'ja', label: 'Japanese', flag: '🇯🇵', nativeLabel: '日本語' },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]['code'];

// Crowd density thresholds (percentage of capacity)
export const CROWD_THRESHOLDS = {
  SAFE: 0.6,       // < 60%
  MODERATE: 0.75,  // 60-75%
  HIGH: 0.88,      // 75-88%
  CRITICAL: 1.0,   // > 88%
} as const;

export const CROWD_LEVELS = {
  SAFE: 'safe',
  MODERATE: 'moderate',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

export type CrowdLevel = (typeof CROWD_LEVELS)[keyof typeof CROWD_LEVELS];

// Emergency incident types
export const INCIDENT_TYPES = {
  MEDICAL: 'medical',
  FIGHT: 'fight',
  FIRE: 'fire',
  LOST_CHILD: 'lost_child',
  SUSPICIOUS_OBJECT: 'suspicious_object',
  STAMPEDE: 'stampede',
  INFRASTRUCTURE: 'infrastructure',
  WEATHER: 'weather',
  OTHER: 'other',
} as const;

export type IncidentType = (typeof INCIDENT_TYPES)[keyof typeof INCIDENT_TYPES];

// Incident severity levels
export const SEVERITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

export type SeverityLevel = (typeof SEVERITY_LEVELS)[keyof typeof SEVERITY_LEVELS];

// AI response priorities
export const AI_PRIORITIES = {
  ROUTINE: 'Routine',
  ATTENTION: 'Attention Required',
  URGENT: 'Urgent',
  CRITICAL: 'Critical — Immediate Action',
} as const;

// Transport options
export const TRANSPORT_OPTIONS = [
  { id: 'metro', label: 'Metro/Rail', icon: 'Train', ecoScore: 95 },
  { id: 'bus', label: 'Shuttle Bus', icon: 'Bus', ecoScore: 80 },
  { id: 'rideshare', label: 'Rideshare', icon: 'Car', ecoScore: 50 },
  { id: 'walk', label: 'Walking', icon: 'Footprints', ecoScore: 100 },
  { id: 'cycle', label: 'Cycling', icon: 'Bike', ecoScore: 100 },
  { id: 'car', label: 'Private Car', icon: 'Car', ecoScore: 25 },
] as const;

// API endpoints
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const API_ENDPOINTS = {
  CROWD: '/api/ai/crowd',
  EMERGENCY: '/api/ai/emergency',
  NAVIGATION: '/api/ai/navigation',
  ANNOUNCEMENT: '/api/ai/announcement',
  TRANSPORT: '/api/ai/transport',
  SUSTAINABILITY: '/api/ai/sustainability',
  VOLUNTEER: '/api/ai/volunteer',
  INCIDENT_REPORT: '/api/ai/incident-report',
  TRANSLATE: '/api/ai/translate',
  ACCESSIBILITY: '/api/ai/accessibility',
} as const;

// Rate limiting
export const RATE_LIMIT = {
  MAX_REQUESTS_PER_MINUTE: 20,
  DEBOUNCE_MS: 500,
} as const;

// Accessibility
export const FONT_SIZE_MULTIPLIERS = {
  normal: 1,
  large: 1.15,
  xlarge: 1.3,
} as const;

// Map zones
export const STADIUM_ZONES = [
  { id: 'north-lower', label: 'North Lower', section: 'A', capacity: 8200 },
  { id: 'north-upper', label: 'North Upper', section: 'B', capacity: 6100 },
  { id: 'south-lower', label: 'South Lower', section: 'C', capacity: 8200 },
  { id: 'south-upper', label: 'South Upper', section: 'D', capacity: 6100 },
  { id: 'east-lower', label: 'East Lower', section: 'E', capacity: 9800 },
  { id: 'east-upper', label: 'East Upper', section: 'F', capacity: 7200 },
  { id: 'west-lower', label: 'West Lower', section: 'G', capacity: 9800 },
  { id: 'west-upper', label: 'West Upper', section: 'H', capacity: 7200 },
  { id: 'vip', label: 'VIP / Suites', section: 'VIP', capacity: 2400 },
  { id: 'press', label: 'Press Box', section: 'PRESS', capacity: 500 },
] as const;

// Animation durations (ms)
export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  VERY_SLOW: 800,
} as const;

// Refresh intervals (ms)
export const REFRESH_INTERVALS = {
  CROWD_DATA: 30_000,      // 30 seconds
  INCIDENTS: 15_000,       // 15 seconds
  TRANSPORT: 60_000,       // 1 minute
  KPI_DASHBOARD: 10_000,   // 10 seconds
} as const;
