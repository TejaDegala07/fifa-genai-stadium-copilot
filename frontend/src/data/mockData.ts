// =============================================================================
// MOCK DATA — Realistic stadium simulation data
// =============================================================================

import type {
  ZoneCrowdData, Incident, StadiumPOI, TransportOption,
  VolunteerTask, VolunteerProfile, Alert, OperationsKPI
} from '../types';

// ---- Crowd Data ------------------------------------------------------------

export const MOCK_CROWD_DATA: ZoneCrowdData[] = [
  {
    zoneId: 'north-lower', zoneLabel: 'North Lower', section: 'A',
    capacity: 8200, currentOccupancy: 7544, density: 0.92,
    level: 'critical', trend: 'increasing', lastUpdated: new Date().toISOString(),
  },
  {
    zoneId: 'north-upper', zoneLabel: 'North Upper', section: 'B',
    capacity: 6100, currentOccupancy: 4270, density: 0.70,
    level: 'moderate', trend: 'stable', lastUpdated: new Date().toISOString(),
  },
  {
    zoneId: 'south-lower', zoneLabel: 'South Lower', section: 'C',
    capacity: 8200, currentOccupancy: 6888, density: 0.84,
    level: 'high', trend: 'increasing', lastUpdated: new Date().toISOString(),
  },
  {
    zoneId: 'south-upper', zoneLabel: 'South Upper', section: 'D',
    capacity: 6100, currentOccupancy: 3172, density: 0.52,
    level: 'safe', trend: 'decreasing', lastUpdated: new Date().toISOString(),
  },
  {
    zoneId: 'east-lower', zoneLabel: 'East Lower', section: 'E',
    capacity: 9800, currentOccupancy: 8918, density: 0.91,
    level: 'critical', trend: 'increasing', lastUpdated: new Date().toISOString(),
  },
  {
    zoneId: 'east-upper', zoneLabel: 'East Upper', section: 'F',
    capacity: 7200, currentOccupancy: 4320, density: 0.60,
    level: 'safe', trend: 'stable', lastUpdated: new Date().toISOString(),
  },
  {
    zoneId: 'west-lower', zoneLabel: 'West Lower', section: 'G',
    capacity: 9800, currentOccupancy: 7840, density: 0.80,
    level: 'high', trend: 'stable', lastUpdated: new Date().toISOString(),
  },
  {
    zoneId: 'west-upper', zoneLabel: 'West Upper', section: 'H',
    capacity: 7200, currentOccupancy: 3960, density: 0.55,
    level: 'safe', trend: 'decreasing', lastUpdated: new Date().toISOString(),
  },
];

// ---- POIs ------------------------------------------------------------------

export const MOCK_POIS: StadiumPOI[] = [
  { id: 'med-1', type: 'medical', label: 'Medical Center A', section: 'A', floor: 1, coordinates: { x: 20, y: 40 }, isAccessible: true, currentStatus: 'open' },
  { id: 'med-2', type: 'medical', label: 'Medical Center B', section: 'C', floor: 1, coordinates: { x: 80, y: 40 }, isAccessible: true, currentStatus: 'open' },
  { id: 'med-3', type: 'medical', label: 'First Aid Post E', section: 'E', floor: 1, coordinates: { x: 50, y: 20 }, isAccessible: true, currentStatus: 'busy', waitTimeMinutes: 8 },
  { id: 'wc-1', type: 'washroom', label: 'Restrooms Gate 1', section: 'A', floor: 1, coordinates: { x: 15, y: 30 }, isAccessible: true, currentStatus: 'open', waitTimeMinutes: 3 },
  { id: 'wc-2', type: 'washroom', label: 'Restrooms Gate 3', section: 'C', floor: 1, coordinates: { x: 85, y: 30 }, isAccessible: true, currentStatus: 'busy', waitTimeMinutes: 10 },
  { id: 'wc-3', type: 'washroom', label: 'Restrooms Level 2 East', section: 'F', floor: 2, coordinates: { x: 65, y: 25 }, isAccessible: false, currentStatus: 'open', waitTimeMinutes: 2 },
  { id: 'food-1', type: 'food', label: 'Concession A1', section: 'A', floor: 1, coordinates: { x: 18, y: 55 }, isAccessible: true, currentStatus: 'open', waitTimeMinutes: 7 },
  { id: 'food-2', type: 'food', label: 'Concession E2', section: 'E', floor: 1, coordinates: { x: 55, y: 18 }, isAccessible: true, currentStatus: 'busy', waitTimeMinutes: 15 },
  { id: 'food-3', type: 'food', label: 'Premium Dining West', section: 'G', floor: 2, coordinates: { x: 30, y: 55 }, isAccessible: true, currentStatus: 'open', waitTimeMinutes: 4 },
  { id: 'exit-1', type: 'exit', label: 'Main Exit Gate 1', section: 'A', floor: 1, coordinates: { x: 10, y: 50 }, isAccessible: true, currentStatus: 'open' },
  { id: 'exit-2', type: 'exit', label: 'Exit Gate 4', section: 'D', floor: 1, coordinates: { x: 90, y: 50 }, isAccessible: true, currentStatus: 'open' },
  { id: 'exit-3', type: 'exit', label: 'Emergency Exit E-7', section: 'E', floor: 1, coordinates: { x: 50, y: 10 }, isAccessible: false, currentStatus: 'open' },
  { id: 'metro-1', type: 'metro', label: 'NJ Transit — East Rutherford', section: 'External', floor: 0, coordinates: { x: 70, y: 90 }, isAccessible: true, currentStatus: 'operational' } as any,
  { id: 'park-1', type: 'parking', label: 'Lot A — Accessible', section: 'External', floor: 0, coordinates: { x: 15, y: 85 }, isAccessible: true, currentStatus: 'limited' } as any,
  { id: 'info-1', type: 'info', label: 'Information Desk', section: 'Main', floor: 1, coordinates: { x: 50, y: 50 }, isAccessible: true, currentStatus: 'open' },
];

// ---- Incidents -------------------------------------------------------------

export const MOCK_INCIDENTS: Incident[] = [
  {
    id: 'INC-2026-001',
    type: 'medical',
    severity: 'medium',
    location: { zoneId: 'east-lower', zoneLabel: 'East Lower', section: 'E', gate: 'Gate 5' },
    reportedBy: 'Volunteer Martinez',
    reportedAt: new Date(Date.now() - 12 * 60000).toISOString(),
    status: 'in_progress',
    description: 'Fan experiencing chest pain, Section E Row 22',
    affectedCount: 1,
    assignedTeam: 'Medical Team Alpha',
    timeline: [
      { timestamp: new Date(Date.now() - 12 * 60000).toISOString(), event: 'Incident reported', actor: 'Volunteer Martinez' },
      { timestamp: new Date(Date.now() - 10 * 60000).toISOString(), event: 'Medical team dispatched', actor: 'Operations Center' },
      { timestamp: new Date(Date.now() - 7 * 60000).toISOString(), event: 'Medical team on scene', actor: 'Medical Team Alpha' },
    ],
  },
  {
    id: 'INC-2026-002',
    type: 'fight',
    severity: 'high',
    location: { zoneId: 'north-lower', zoneLabel: 'North Lower', section: 'A', gate: 'Gate 1' },
    reportedBy: 'Security Officer Chen',
    reportedAt: new Date(Date.now() - 5 * 60000).toISOString(),
    status: 'in_progress',
    description: 'Altercation between 3 fans near entrance Gate 1, Section A',
    affectedCount: 3,
    assignedTeam: 'Security Unit B',
    timeline: [
      { timestamp: new Date(Date.now() - 5 * 60000).toISOString(), event: 'Altercation reported', actor: 'Security Officer Chen' },
      { timestamp: new Date(Date.now() - 3 * 60000).toISOString(), event: 'Security unit dispatched', actor: 'Operations Center' },
    ],
  },
  {
    id: 'INC-2026-003',
    type: 'lost_child',
    severity: 'high',
    location: { zoneId: 'west-lower', zoneLabel: 'West Lower', section: 'G', description: 'Concession Area G2' },
    reportedBy: 'Fan Self-Report (App)',
    reportedAt: new Date(Date.now() - 3 * 60000).toISOString(),
    status: 'acknowledged',
    description: 'Lost child, 7yr old male, green shirt. Parent searching near concession G2.',
    affectedCount: 1,
    assignedTeam: 'Volunteer Team 3',
    timeline: [
      { timestamp: new Date(Date.now() - 3 * 60000).toISOString(), event: 'Lost child reported via app', actor: 'System' },
      { timestamp: new Date(Date.now() - 2 * 60000).toISOString(), event: 'Volunteers alerted', actor: 'Operations Center' },
    ],
  },
];

// ---- Alerts ----------------------------------------------------------------

export const MOCK_ALERTS: Alert[] = [
  {
    id: 'ALT-001', type: 'crowd', severity: 'critical',
    title: 'Critical Crowd Density — North Lower (A)', titleKey: 'alert.crowd.critical.title',
    message: 'Zone A has reached 92% capacity. Recommend diverting incoming fans to Section D or F via alternate entry.', messageKey: 'alert.crowd.critical.msg',
    zone: 'north-lower', createdAt: new Date(Date.now() - 8 * 60000).toISOString(), acknowledged: false,
  },
  {
    id: 'ALT-002', type: 'crowd', severity: 'critical',
    title: 'Critical Crowd Density — East Lower (E)', titleKey: 'alert.crowd.east.title',
    message: 'Zone E at 91% capacity. Gate 5 showing queues >20 min. AI recommends activating overflow protocol.', messageKey: 'alert.crowd.east.msg',
    zone: 'east-lower', createdAt: new Date(Date.now() - 6 * 60000).toISOString(), acknowledged: false,
  },
  {
    id: 'ALT-003', type: 'transport', severity: 'medium',
    title: 'NJ Transit Delay — East Rutherford Line', titleKey: 'alert.transport.delay.title',
    message: '15-minute delay on inbound trains. Expected 2,400 additional fans arriving via road. Update transport advisories.', messageKey: 'alert.transport.delay.msg',
    createdAt: new Date(Date.now() - 20 * 60000).toISOString(), acknowledged: true, acknowledgedBy: 'Transport Coordinator Kim',
  },
  {
    id: 'ALT-004', type: 'weather', severity: 'low',
    title: 'Light Rain Expected Post-Match', titleKey: 'alert.weather.rain.title',
    message: 'Weather forecast: light rain beginning 22:15. Recommend activating covered exit routing for accessible fans.', messageKey: 'alert.weather.rain.msg',
    createdAt: new Date(Date.now() - 45 * 60000).toISOString(), acknowledged: true, acknowledgedBy: 'Ops Manager Rodriguez',
  },
  {
    id: 'ALT-005', type: 'incident', severity: 'high',
    title: 'Medical Incident — Section E', titleKey: 'alert.medical.incident.title',
    message: 'Fan receiving medical assistance Section E Row 22. Medical Team Alpha on scene. Status: stable.', messageKey: 'alert.medical.incident.msg',
    zone: 'east-lower', createdAt: new Date(Date.now() - 10 * 60000).toISOString(), acknowledged: true, acknowledgedBy: 'Dr. Williams',
  },
];

// ---- Transport Options -----------------------------------------------------

export const MOCK_TRANSPORT_OPTIONS: TransportOption[] = [
  {
    id: 'metro-1', type: 'metro', label: 'NJ Transit Rail', provider: 'NJ Transit',
    currentStatus: 'delayed', nextDeparture: '22:45', frequency: 15,
    estimatedTravelMinutes: 35, distanceKm: 24, ecoScore: 95,
    crowdLevel: 'high', cost: { currency: 'USD', amount: 4.5 },
  },
  {
    id: 'bus-1', type: 'bus', label: 'FIFA Shuttle Bus', provider: 'FIFA Official',
    currentStatus: 'operational', nextDeparture: '22:30', frequency: 10,
    estimatedTravelMinutes: 45, distanceKm: 22, ecoScore: 80,
    crowdLevel: 'moderate', cost: { currency: 'USD', amount: 0 },
  },
  {
    id: 'rideshare-1', type: 'rideshare', label: 'Uber / Lyft',
    currentStatus: 'operational',
    estimatedTravelMinutes: 55, distanceKm: 24, ecoScore: 50,
    crowdLevel: 'high', cost: { currency: 'USD', amount: 38 },
  },
  {
    id: 'walk-1', type: 'walk', label: 'Walk to Overflow Lot',
    currentStatus: 'operational',
    estimatedTravelMinutes: 18, distanceKm: 1.2, ecoScore: 100,
    crowdLevel: 'safe', cost: { currency: 'USD', amount: 0 },
  },
];

// ---- KPIs ------------------------------------------------------------------

export const MOCK_KPIs: OperationsKPI[] = [
  { label: 'Total Attendance', labelKey: 'kpi.totalAttendance', value: 79_240, unit: 'fans', change: 2.1, trend: 'up', status: 'good', icon: 'Users' },
  { label: 'Capacity', labelKey: 'kpi.capacity', value: '96%', change: 0, trend: 'stable', status: 'warning', icon: 'Activity' },
  { label: 'Active Incidents', labelKey: 'kpi.activeIncidents', value: 3, change: 1, trend: 'up', status: 'warning', icon: 'AlertTriangle' },
  { label: 'Avg Response Time', labelKey: 'kpi.avgResponseTime', value: '4.2', unit: 'min', change: -8.5, trend: 'down', status: 'good', icon: 'Clock' },
  { label: 'Medical Cases', labelKey: 'kpi.medicalCases', value: 7, change: 2, trend: 'up', status: 'warning', icon: 'Heart' },
  { label: 'Volunteers Active', labelKey: 'kpi.volunteersActive', value: 428, change: 0, trend: 'stable', status: 'good', icon: 'HandHelping' },
  { label: 'Transport Score', labelKey: 'kpi.transportScore', value: '72%', change: -5, trend: 'down', status: 'warning', icon: 'Bus' },
  { label: 'Eco Score', labelKey: 'kpi.ecoScore', value: 84, unit: '/100', change: 3, trend: 'up', status: 'good', icon: 'Leaf' },
];

// ---- Volunteer Tasks -------------------------------------------------------

export const MOCK_VOLUNTEER_TASKS: VolunteerTask[] = [
  {
    id: 'VT-001', title: 'Crowd Flow Management — Gate 1',
    description: 'Guide incoming fans from Gate 1 to alternative sections D and F. Use iPad app to show real-time section capacity.',
    zone: 'north-lower', priority: 'critical', estimatedMinutes: 30,
    skills: ['Communication', 'Crowd Management'],
    status: 'in_progress', createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
  },
  {
    id: 'VT-002', title: 'Accessibility Escort — Section B',
    description: 'Escort wheelchair user from Gate 3 to accessible seating Section B Row 1. Use elevator route.',
    zone: 'north-upper', priority: 'high', estimatedMinutes: 20,
    skills: ['Accessibility', 'First Aid'],
    status: 'assigned', createdAt: new Date(Date.now() - 8 * 60000).toISOString(),
  },
  {
    id: 'VT-003', title: 'Lost Child Search — West Lower',
    description: 'Assist in locating 7yr old child last seen near Concession G2. Work with security team.',
    zone: 'west-lower', priority: 'high', estimatedMinutes: 15,
    skills: ['Communication'],
    status: 'in_progress', createdAt: new Date(Date.now() - 3 * 60000).toISOString(),
  },
  {
    id: 'VT-004', title: 'Concession Queue Management — East',
    description: 'Manage queues at Concession E2, currently 15-min wait. Redirect to Concession E4 (5-min wait).',
    zone: 'east-lower', priority: 'medium', estimatedMinutes: 45,
    skills: ['Communication', 'Crowd Management'],
    status: 'unassigned', createdAt: new Date(Date.now() - 20 * 60000).toISOString(),
  },
];

// ---- Crowd history for charts ----------------------------------------------

export const CROWD_HISTORY = Array.from({ length: 24 }, (_, i) => {
  const hour = 16 + Math.floor(i / 4);
  const min = (i % 4) * 15;
  return {
    time: `${hour}:${String(min).padStart(2, '0')}`,
    north: Math.round(3000 + Math.sin(i / 3) * 2000 + i * 150 + Math.random() * 500),
    south: Math.round(2800 + Math.cos(i / 4) * 1800 + i * 120 + Math.random() * 400),
    east: Math.round(4500 + Math.sin(i / 2) * 2500 + i * 180 + Math.random() * 600),
    west: Math.round(4000 + Math.cos(i / 3) * 2200 + i * 160 + Math.random() * 450),
  };
});

// ---- Incident history for charts ------------------------------------------

export const INCIDENT_HISTORY = [
  { hour: '16:00', medical: 1, security: 0, infrastructure: 0 },
  { hour: '17:00', medical: 2, security: 1, infrastructure: 0 },
  { hour: '18:00', medical: 1, security: 2, infrastructure: 1 },
  { hour: '19:00', medical: 3, security: 1, infrastructure: 0 },
  { hour: '20:00', medical: 2, security: 3, infrastructure: 1 },
  { hour: '21:00', medical: 4, security: 2, infrastructure: 0 },
  { hour: '21:48', medical: 2, security: 2, infrastructure: 0 },
];
