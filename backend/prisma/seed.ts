import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const MOCK_ZONES = [
  { id: 'z1', label: 'North Lower', section: 'A', density: 92, capacity: 12500, currentCount: 11500, status: 'critical', trend: 'increasing' },
  { id: 'z2', label: 'North Upper', section: 'B', density: 70, capacity: 15000, currentCount: 10500, status: 'moderate', trend: 'stable' },
  { id: 'z3', label: 'South Lower', section: 'C', density: 84, capacity: 12500, currentCount: 10500, status: 'high', trend: 'increasing' },
  { id: 'z4', label: 'South Upper', section: 'D', density: 52, capacity: 15000, currentCount: 7800, status: 'safe', trend: 'decreasing' },
  { id: 'z5', label: 'East Lower', section: 'E', density: 91, capacity: 10000, currentCount: 9100, status: 'critical', trend: 'increasing' },
  { id: 'z6', label: 'East Upper', section: 'F', density: 60, capacity: 12500, currentCount: 7500, status: 'safe', trend: 'stable' },
];

const MOCK_INCIDENTS = [
  {
    id: 'INC-2026-001',
    type: 'medical',
    severity: 'high',
    status: 'active',
    description: 'Fan experiencing chest pain in Section E',
    location: JSON.stringify({ x: 75, y: 35, zoneId: 'z5', zoneLabel: 'East Lower' }),
    assignedTeam: 'Med Team Alpha',
    timeline: JSON.stringify([
      { timestamp: new Date(Date.now() - 5 * 60000).toISOString(), event: 'Reported via Fan App' },
      { timestamp: new Date(Date.now() - 3 * 60000).toISOString(), event: 'Assigned to Med Team Alpha' },
    ]),
  },
  {
    id: 'INC-2026-002',
    type: 'crowd',
    severity: 'critical',
    status: 'active',
    description: 'Severe bottleneck at Gate 1',
    location: JSON.stringify({ x: 20, y: 20, zoneId: 'z1', zoneLabel: 'North Lower' }),
    timeline: JSON.stringify([
      { timestamp: new Date(Date.now() - 15 * 60000).toISOString(), event: 'Detected by Crowd AI' },
    ]),
  }
];

const MOCK_ALERTS = [
  {
    id: 'alt-1',
    type: 'critical',
    message: 'Gate 1 congestion exceeding safe limits. Reroute incoming fans to Gate 2 immediately.',
    targetAudience: 'operations',
    targetZone: 'North Lower',
  },
  {
    id: 'alt-2',
    type: 'info',
    message: 'Transport update: NJ Transit train 4310 delayed by 15 mins.',
    targetAudience: 'fan',
  }
];

async function main() {
  console.log('Seeding Database...');

  // Create Users
  const adminUser = await prisma.user.create({
    data: {
      id: 'u-ops-001',
      name: 'Sarah O.',
      role: 'operations',
    }
  });

  await prisma.user.create({
    data: { id: 'u-fan-001', name: 'Demo Fan', role: 'fan', section: 'E' }
  });

  await prisma.user.create({
    data: { id: 'u-sec-001', name: 'Security 1', role: 'security' }
  });

  // Create Zones
  for (const z of MOCK_ZONES) {
    await prisma.crowdZone.upsert({
      where: { id: z.id },
      update: {},
      create: z,
    });
  }

  // Create Incidents
  for (const inc of MOCK_INCIDENTS) {
    await prisma.incident.create({ data: inc });
  }

  // Create Alerts
  for (const alt of MOCK_ALERTS) {
    await prisma.alert.create({ data: alt });
  }

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
