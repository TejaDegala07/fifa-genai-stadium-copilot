// =============================================================================
// TYPESCRIPT TYPES — FIFA Stadium Intelligence Platform
// =============================================================================

import type { UserRole, CrowdLevel, IncidentType, SeverityLevel, LanguageCode } from '../data/constants';

// ---- AI Response Structure --------------------------------------------------

export interface AIResponse {
  situation: string;
  reasoning: string;
  recommendation: string;
  priority: string;
  estimatedImpact: string;
  confidence: number; // 0-100
  actions?: AIAction[];
  metadata?: Record<string, unknown>;
}

export interface AIAction {
  id: string;
  label: string;
  description: string;
  icon?: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

// ---- User & Auth ------------------------------------------------------------

export interface User {
  id: string;
  name: string;
  role: UserRole;
  section?: string;
  badgeId?: string;
  language: LanguageCode;
  accessibilityNeeds?: AccessibilityProfile;
  avatarUrl?: string;
}

export interface AccessibilityProfile {
  wheelchairAccess: boolean;
  hearingAssistance: boolean;
  visualAssistance: boolean;
  largeFontSize: boolean;
  highContrast: boolean;
  voiceMode: boolean;
}

// ---- Crowd Intelligence ----------------------------------------------------

export interface ZoneCrowdData {
  zoneId: string;
  zoneLabel: string;
  section: string;
  capacity: number;
  currentOccupancy: number;
  density: number; // 0-1
  level: CrowdLevel;
  trend: 'increasing' | 'decreasing' | 'stable';
  lastUpdated: string;
}

export interface CrowdAnalysis {
  zones: ZoneCrowdData[];
  totalOccupancy: number;
  totalCapacity: number;
  overallLevel: CrowdLevel;
  hotspots: string[];
  aiInsight: AIResponse;
  timestamp: string;
}

// ---- Incidents & Emergency --------------------------------------------------

export interface Incident {
  id: string;
  type: IncidentType;
  severity: SeverityLevel;
  location: IncidentLocation;
  reportedBy: string;
  reportedAt: string;
  status: 'reported' | 'acknowledged' | 'in_progress' | 'resolved' | 'closed';
  description: string;
  affectedCount?: number;
  assignedTeam?: string;
  resolvedAt?: string;
  timeline: IncidentTimelineEntry[];
  aiResponse?: AIResponse;
  report?: IncidentReport;
}

export interface IncidentLocation {
  zoneId: string;
  zoneLabel: string;
  section?: string;
  gate?: string;
  description?: string;
  coordinates?: { x: number; y: number };
}

export interface IncidentTimelineEntry {
  timestamp: string;
  event: string;
  actor: string;
  note?: string;
}

export interface IncidentReport {
  id: string;
  incidentId: string;
  generatedAt: string;
  summary: string;
  causeAnalysis: string;
  responseActions: string[];
  recommendations: string[];
  lessonsLearned: string[];
}

// ---- Navigation & Map -------------------------------------------------------

export interface StadiumPOI {
  id: string;
  type: 'washroom' | 'food' | 'medical' | 'exit' | 'entrance' | 'parking' | 'metro' | 'info' | 'atm' | 'accessibility';
  label: string;
  section: string;
  floor: number;
  coordinates: { x: number; y: number };
  isAccessible: boolean;
  currentStatus: 'open' | 'closed' | 'busy' | 'limited';
  waitTimeMinutes?: number;
}

export interface NavigationRoute {
  from: StadiumPOI | { label: string; coordinates: { x: number; y: number } };
  to: StadiumPOI;
  distanceMeters: number;
  estimatedMinutes: number;
  steps: NavigationStep[];
  isAccessible: boolean;
  avoidsCrowds: boolean;
  aiGuidance: AIResponse;
}

export interface NavigationStep {
  instruction: string;
  distanceMeters: number;
  landmark?: string;
  turnDirection?: 'left' | 'right' | 'straight' | 'elevator' | 'ramp';
}

// ---- Transportation ---------------------------------------------------------

export interface TransportOption {
  id: string;
  type: 'metro' | 'bus' | 'rideshare' | 'walk' | 'cycle' | 'car';
  label: string;
  provider?: string;
  currentStatus: 'operational' | 'delayed' | 'disrupted' | 'cancelled';
  nextDeparture?: string;
  frequency?: number; // minutes
  estimatedTravelMinutes: number;
  distanceKm: number;
  ecoScore: number; // 0-100
  crowdLevel: CrowdLevel;
  cost?: { currency: string; amount: number };
}

export interface TransportAnalysis {
  options: TransportOption[];
  recommended: TransportOption;
  bestDepartureTime: string;
  aiAdvice: AIResponse;
  trafficLevel: CrowdLevel;
  weatherImpact: string;
}

// ---- Announcements ----------------------------------------------------------

export interface AnnouncementRequest {
  situation: string;
  tone: 'professional' | 'friendly' | 'urgent' | 'emergency';
  targetAudience: 'all' | 'section' | 'staff' | 'security';
  language: LanguageCode;
  includeTranslations: boolean;
}

export interface AnnouncementOutput {
  pa: string;           // Public address system
  sms: string;          // SMS format
  socialMedia: string;  // Tweet-length
  app: string;          // In-app notification
  translations?: Record<LanguageCode, string>;
  displayDuration?: number; // seconds
}

// ---- Sustainability ---------------------------------------------------------

export interface SustainabilityProfile {
  transportMode: string;
  distanceTraveledKm: number;
  co2SavedKg: number;
  co2EmittedKg: number;
  plasticAvoided: number;
  waterRefills: number;
  digitalTicket: boolean;
  ecoScore: number; // 0-100
  tier: 'bronze' | 'silver' | 'gold' | 'champion';
  tips: string[];
}

// ---- Volunteer -------------------------------------------------------------

export interface VolunteerTask {
  id: string;
  title: string;
  description: string;
  zone: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedMinutes: number;
  skills?: string[];
  assignedVolunteerId?: string;
  status: 'unassigned' | 'assigned' | 'in_progress' | 'completed';
  createdAt: string;
}

export interface VolunteerProfile {
  id: string;
  name: string;
  zone: string;
  currentTask?: VolunteerTask;
  completedTasks: number;
  skills: string[];
  languages: LanguageCode[];
  status: 'available' | 'busy' | 'break' | 'offline';
}

// ---- Operations Dashboard --------------------------------------------------

export interface OperationsKPI {
  label: string;
  value: number | string;
  unit?: string;
  change?: number; // percentage
  trend: 'up' | 'down' | 'stable';
  status: 'good' | 'warning' | 'critical';
  icon: string;
}

export interface OperationsDashboard {
  kpis: OperationsKPI[];
  activeIncidents: Incident[];
  crowdSummary: CrowdAnalysis;
  recentAlerts: Alert[];
  aiInsights: AIResponse[];
  timestamp: string;
}

// ---- Alerts ----------------------------------------------------------------

export interface Alert {
  id: string;
  type: 'crowd' | 'incident' | 'transport' | 'weather' | 'system' | 'security';
  severity: SeverityLevel;
  title: string;
  message: string;
  zone?: string;
  createdAt: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
}

// ---- Theme & UI ------------------------------------------------------------

export interface ThemeConfig {
  mode: 'dark' | 'light';
  highContrast: boolean;
  largeFontSize: boolean;
  reducedMotion: boolean;
}

// ---- AI Request types -------------------------------------------------------

export interface AIRequestContext {
  role: UserRole;
  language: LanguageCode;
  location?: string;
  timestamp: string;
  crowdData?: Partial<CrowdAnalysis>;
  weatherCondition?: string;
  matchPhase?: 'pre' | 'during' | 'halftime' | 'post';
}
