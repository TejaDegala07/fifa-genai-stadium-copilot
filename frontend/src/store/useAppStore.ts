// =============================================================================
// APP STORE — Zustand global state management
// =============================================================================

import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import type { User, Alert, ThemeConfig, Incident } from '../types';
import type { UserRole, LanguageCode } from '../data/constants';
import { USER_ROLES, LANGUAGES } from '../data/constants';

// ---- Theme Store -----------------------------------------------------------

interface ThemeStore extends ThemeConfig {
  setMode: (mode: 'dark' | 'light') => void;
  toggleMode: () => void;
  setHighContrast: (v: boolean) => void;
  setLargeFontSize: (v: boolean) => void;
  setReducedMotion: (v: boolean) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    devtools((set) => ({
      mode: 'dark',
      highContrast: false,
      largeFontSize: false,
      reducedMotion: false,
      setMode: (mode) => set({ mode }),
      toggleMode: () => set((s) => ({ mode: s.mode === 'dark' ? 'light' : 'dark' })),
      setHighContrast: (highContrast) => set({ highContrast }),
      setLargeFontSize: (largeFontSize) => set({ largeFontSize }),
      setReducedMotion: (reducedMotion) => set({ reducedMotion }),
    })),
    { name: 'theme-store' }
  )
);

// ---- User/Role Store -------------------------------------------------------

interface UserStore {
  user: User;
  token: string | null;
  setRole: (role: UserRole) => Promise<void>;
  setLanguage: (language: LanguageCode) => void;
  setSection: (section: string) => void;
  updateAccessibility: (updates: Partial<User['accessibilityNeeds']>) => void;
}

const DEFAULT_USER: User = {
  id: 'u-demo-001',
  name: 'Demo User',
  role: USER_ROLES.FAN,
  section: 'E',
  badgeId: 'FAN-2026-01234',
  language: 'en',
  accessibilityNeeds: {
    wheelchairAccess: false,
    hearingAssistance: false,
    visualAssistance: false,
    largeFontSize: false,
    highContrast: false,
    voiceMode: false,
  },
};

import { api } from '../services/api';

export const useUserStore = create<UserStore>()(
  persist(
    devtools((set, get) => ({
      user: DEFAULT_USER,
      token: null,
      setRole: async (role) => {
        try {
          // Perform simulated silent login to get JWT for role
          const res = await api.post('/auth/login', { role });
          set((s) => ({
            user: { ...s.user, role, id: res.data.user.id, name: res.data.user.name },
            token: res.data.token
          }));
        } catch (e) {
          console.error("Login failed for role", role);
          set((s) => ({ user: { ...s.user, role } }));
        }
      },
      setLanguage: (language) =>
        set((s) => ({
          user: { ...s.user, language },
        })),
      setSection: (section) =>
        set((s) => ({
          user: { ...s.user, section },
        })),
      updateAccessibility: (updates) =>
        set((s) => ({
          user: {
            ...s.user,
            accessibilityNeeds: { ...s.user.accessibilityNeeds!, ...updates },
          },
        })),
    })),
    { name: 'user-store' }
  )
);

// ---- Alerts Store ----------------------------------------------------------

interface AlertStore {
  alerts: Alert[];
  unreadCount: number;
  fetchAlerts: () => Promise<void>;
  addAlert: (alert: Alert) => void;
  acknowledgeAlert: (id: string, by: string) => Promise<void>;
  acknowledgeAll: () => void;
  clearAlert: (id: string) => Promise<void>;
}

import { MOCK_ALERTS } from '../data/mockData';

export const useAlertStore = create<AlertStore>()(
  devtools((set) => ({
    alerts: MOCK_ALERTS,
    unreadCount: MOCK_ALERTS.filter((a) => !a.acknowledged).length,
    fetchAlerts: async () => {
      try {
        const res = await api.get('/alerts');
        set({ alerts: res.data, unreadCount: res.data.filter((a: Alert) => !a.acknowledged).length });
      } catch (e) {
        console.error(e);
      }
    },
    addAlert: (alert) =>
      set((s) => ({
        alerts: [alert, ...s.alerts],
        unreadCount: s.unreadCount + (alert.acknowledged ? 0 : 1),
      })),
    acknowledgeAlert: async (id, by) => {
      try {
        await api.post(`/alerts/${id}/acknowledge`);
        set((s) => ({
          alerts: s.alerts.map((a) =>
            a.id === id ? { ...a, acknowledged: true, acknowledgedBy: by } : a
          ),
          unreadCount: Math.max(0, s.unreadCount - 1),
        }));
      } catch (e) { console.error(e); }
    },
    acknowledgeAll: () =>
      set((s) => ({
        alerts: s.alerts.map((a) => ({ ...a, acknowledged: true })),
        unreadCount: 0,
      })),
    clearAlert: async (id) => {
      try {
        await api.delete(`/alerts/${id}`);
        set((s) => {
          const alert = s.alerts.find((a) => a.id === id);
          return {
            alerts: s.alerts.filter((a) => a.id !== id),
            unreadCount: alert && !alert.acknowledged ? Math.max(0, s.unreadCount - 1) : s.unreadCount,
          };
        });
      } catch (e) { console.error(e); }
    }
  }))
);

// ---- Incident Store --------------------------------------------------------

interface IncidentStore {
  incidents: Incident[];
  fetchIncidents: () => Promise<void>;
  addIncident: (incident: Incident) => void;
  updateIncident: (id: string, updates: Partial<Incident>) => void;
  resolveIncident: (id: string) => Promise<void>;
}

import { MOCK_INCIDENTS } from '../data/mockData';

export const useIncidentStore = create<IncidentStore>()(
  devtools((set) => ({
    incidents: MOCK_INCIDENTS,
    fetchIncidents: async () => {
      try {
        const res = await api.get('/incidents');
        // Parse the JSON strings from DB back to objects to match frontend types
        const parsed = res.data.map((inc: any) => ({
          ...inc,
          location: typeof inc.location === 'string' ? JSON.parse(inc.location) : inc.location,
          timeline: typeof inc.timeline === 'string' ? JSON.parse(inc.timeline) : inc.timeline,
        }));
        set({ incidents: parsed });
      } catch (e) { console.error(e); }
    },
    addIncident: (incident) =>
      set((s) => ({ incidents: [incident, ...s.incidents] })),
    updateIncident: (id, updates) =>
      set((s) => ({
        incidents: s.incidents.map((inc) =>
          inc.id === id ? { ...inc, ...updates } : inc
        ),
      })),
    resolveIncident: async (id) => {
      try {
        await api.post(`/incidents/${id}/resolve`);
        set((s) => ({
          incidents: s.incidents.map((inc) =>
            inc.id === id
              ? { ...inc, status: 'resolved', resolvedAt: new Date().toISOString() }
              : inc
          ),
        }));
      } catch (e) { console.error(e); }
    }
  }))
);

// ---- Command Palette Store -------------------------------------------------

interface CommandStore {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export const useCommandStore = create<CommandStore>()((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
}));
