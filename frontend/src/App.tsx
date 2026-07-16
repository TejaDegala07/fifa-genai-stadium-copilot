// =============================================================================
// APP.TSX — Main application entry with routing
// =============================================================================

import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppShell } from './components/layout/AppShell';
import { SkeletonCard } from './components/ui/Skeleton';
import { useThemeStore } from './store/useAppStore';

// Lazy-loaded pages for code splitting
const DashboardPage = lazy(() =>
  import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage }))
);
const CrowdIntelligencePage = lazy(() =>
  import('./pages/CrowdIntelligencePage').then(m => ({ default: m.CrowdIntelligencePage }))
);
const StadiumMapPage = lazy(() =>
  import('./pages/StadiumMapPage').then(m => ({ default: m.StadiumMapPage }))
);
const EmergencyPage = lazy(() =>
  import('./pages/EmergencyPage').then(m => ({ default: m.EmergencyPage }))
);
const TransportPage = lazy(() =>
  import('./pages/TransportPage').then(m => ({ default: m.TransportPage }))
);
const AnnouncementPage = lazy(() =>
  import('./pages/AnnouncementPage').then(m => ({ default: m.AnnouncementPage }))
);
const VolunteerPage = lazy(() =>
  import('./pages/VolunteerPage').then(m => ({ default: m.VolunteerPage }))
);
const MedicalPage = lazy(() =>
  import('./pages/MedicalPage').then(m => ({ default: m.MedicalPage }))
);
const SustainabilityPage = lazy(() =>
  import('./pages/SustainabilityPage').then(m => ({ default: m.SustainabilityPage }))
);
const OperationsPage = lazy(() =>
  import('./pages/OperationsPage').then(m => ({ default: m.OperationsPage }))
);

// ---- Loading Fallback -------------------------------------------------------

const PageSkeleton = () => (
  <div className="p-6 space-y-4">
    <div className="h-8 w-48 skeleton rounded-lg" />
    <div className="grid grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonCard key={i} lines={2} />
      ))}
    </div>
    <SkeletonCard lines={6} />
    <div className="grid grid-cols-2 gap-4">
      <SkeletonCard lines={8} />
      <SkeletonCard lines={8} />
    </div>
  </div>
);

// ---- App -------------------------------------------------------------------

export default function App() {
  const { mode } = useThemeStore();

  return (
    <Router>
      <AppShell>
        <Suspense fallback={<PageSkeleton />}>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/crowd" element={<CrowdIntelligencePage />} />
            <Route path="/map" element={<StadiumMapPage />} />
            <Route path="/emergency" element={<EmergencyPage />} />
            <Route path="/transport" element={<TransportPage />} />
            <Route path="/announcements" element={<AnnouncementPage />} />
            <Route path="/volunteer" element={<VolunteerPage />} />
            <Route path="/medical" element={<MedicalPage />} />
            <Route path="/sustainability" element={<SustainabilityPage />} />
            <Route path="/operations" element={<OperationsPage />} />
            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AppShell>

      {/* Global toast notifications */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: mode === 'light' ? '#FFFFFF' : '#1F2937',
            color: mode === 'light' ? '#0F172A' : '#F9FAFB',
            border: mode === 'light' ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            fontSize: '14px',
            boxShadow: mode === 'light' ? '0 4px 16px rgba(0,0,0,0.1)' : '0 8px 32px rgba(0,0,0,0.4)',
          },
          success: {
            iconTheme: { primary: '#10B981', secondary: mode === 'light' ? '#FFFFFF' : '#F9FAFB' },
          },
          error: {
            iconTheme: { primary: '#EF4444', secondary: mode === 'light' ? '#FFFFFF' : '#F9FAFB' },
          },
        }}
      />
    </Router>
  );
}
