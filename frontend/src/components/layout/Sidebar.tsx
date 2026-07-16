// =============================================================================
// SIDEBAR — Role-aware navigation sidebar
// =============================================================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Map, AlertOctagon, Users, Bus,
  Leaf, Megaphone, Activity, ChevronLeft, ChevronRight,
  HandHelping, Shield, Stethoscope, Settings, Zap,
  Globe, LogOut
} from 'lucide-react';
import { cn } from '../../utils/helpers';
import { useUserStore, useThemeStore } from '../../store/useAppStore';
import { ROLE_CONFIG, USER_ROLES } from '../../data/constants';
import type { UserRole } from '../../data/constants';
import { APP_NAME } from '../../data/constants';
import { useTranslation } from '../../hooks/useTranslation';

interface NavItem {
  id: string;
  labelKey: string;
  icon: React.ElementType;
  path: string;
  roles: UserRole[];
  badge?: number | string;
  isAlert?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard, path: '/', roles: ['fan', 'volunteer', 'security', 'operations', 'medical', 'transport'] },
  { id: 'crowd', labelKey: 'nav.crowdIntel', icon: Activity, path: '/crowd', roles: ['security', 'operations', 'volunteer'] },
  { id: 'map', labelKey: 'nav.stadiumMap', icon: Map, path: '/map', roles: ['fan', 'volunteer', 'security', 'medical', 'transport', 'operations'] },
  { id: 'emergency', labelKey: 'nav.emergency', icon: AlertOctagon, path: '/emergency', roles: ['fan', 'volunteer', 'security', 'operations', 'medical'] },
  { id: 'transport', labelKey: 'nav.transport', icon: Bus, path: '/transport', roles: ['fan', 'transport', 'operations', 'volunteer'] },
  { id: 'announcements', labelKey: 'nav.announcements', icon: Megaphone, path: '/announcements', roles: ['operations', 'security'] },
  { id: 'volunteer', labelKey: 'nav.volunteers', icon: HandHelping, path: '/volunteer', roles: ['volunteer', 'operations'] },
  { id: 'medical', labelKey: 'nav.medical', icon: Stethoscope, path: '/medical', roles: ['medical', 'operations'] },
  { id: 'sustainability', labelKey: 'nav.ecoImpact', icon: Leaf, path: '/sustainability', roles: ['fan', 'operations'] },
  { id: 'operations', labelKey: 'nav.operations', icon: Settings, path: '/operations', roles: ['operations'] },
];

interface SidebarProps {
  onNavigate?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onNavigate }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setRole } = useUserStore();
  const { mode } = useThemeStore();
  const { t } = useTranslation();

  const isLight = mode === 'light';

  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(user.role));
  const roleConfig = ROLE_CONFIG[user.role];

  const handleNavigate = (path: string) => {
    navigate(path);
    onNavigate?.();
  };

  const roleColors: Record<UserRole, string> = {
    fan: 'from-blue-500/20 to-blue-600/20 border-blue-500/30 text-blue-600',
    volunteer: 'from-emerald-500/20 to-emerald-600/20 border-emerald-500/30 text-emerald-600',
    security: 'from-orange-500/20 to-orange-600/20 border-orange-500/30 text-orange-600',
    operations: 'from-purple-500/20 to-purple-600/20 border-purple-500/30 text-purple-600',
    medical: 'from-red-500/20 to-red-600/20 border-red-500/30 text-red-600',
    transport: 'from-cyan-500/20 to-cyan-600/20 border-cyan-500/30 text-cyan-600',
  };

  const roleColorsDark: Record<UserRole, string> = {
    fan: 'from-blue-500/20 to-blue-600/20 border-blue-500/30 text-blue-400',
    volunteer: 'from-emerald-500/20 to-emerald-600/20 border-emerald-500/30 text-emerald-400',
    security: 'from-orange-500/20 to-orange-600/20 border-orange-500/30 text-orange-400',
    operations: 'from-purple-500/20 to-purple-600/20 border-purple-500/30 text-purple-400',
    medical: 'from-red-500/20 to-red-600/20 border-red-500/30 text-red-400',
    transport: 'from-cyan-500/20 to-cyan-600/20 border-cyan-500/30 text-cyan-400',
  };

  const currentRoleColor = isLight ? roleColors[user.role] : roleColorsDark[user.role];

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className={cn(
        'relative flex flex-col h-full z-50',
        isLight
          ? 'bg-white border-r border-[#E2E8F0]'
          : 'bg-fifa-dark-2 border-r border-black/10 dark:border-white/8'
      )}
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className={cn(
        'flex items-center gap-3 px-4 py-5 border-b',
        isLight ? 'border-[#E2E8F0]' : 'border-black/10 dark:border-white/8'
      )}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0 shadow-glow-blue">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="font-display font-bold text-lg text-foreground leading-none">{APP_NAME}</div>
              <div className="text-xs text-muted-foreground">FIFA WC 2026</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Role Badge */}
      <div className={cn(
        'px-3 py-3 border-b',
        isLight ? 'border-[#E2E8F0]' : 'border-black/10 dark:border-white/8'
      )}>
        <div className={cn(
          'flex items-center gap-2.5 px-3 py-2 rounded-lg border bg-gradient-to-r',
          currentRoleColor
        )}>
          <div className="w-2 h-2 rounded-full bg-current opacity-80 animate-pulse flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="min-w-0"
              >
                <div className="text-xs font-semibold truncate">{t(`role.${user.role}` as any)}</div>
                <div className="text-xs opacity-70 truncate">
                  {user.section ? `${t('sidebar.section')} ${user.section}` : t('sidebar.stadium')}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto scrollbar-hide" role="navigation">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path ||
            (item.path !== '/' && location.pathname.startsWith(item.path));

          return (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.path)}
              className={cn(
                'sidebar-item w-full',
                isActive && 'active',
                collapsed && 'justify-center px-2',
                isLight && !isActive && 'hover:bg-gray-100 text-[#475569] hover:text-[#0F172A]',
                isLight && isActive && 'bg-blue-50 text-blue-700 border-blue-200'
              )}
              title={collapsed ? t(item.labelKey as any) : undefined}
              aria-label={t(item.labelKey as any)}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="w-4.5 h-4.5 flex-shrink-0" aria-hidden="true" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 text-left truncate"
                  >
                    {t(item.labelKey as any)}
                  </motion.span>
                )}
              </AnimatePresence>
              {!collapsed && item.badge && (
                <span className="px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-semibold">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Role Switcher (demo feature) */}
      {!collapsed && (
        <div className={cn(
          'px-3 py-3 border-t',
          isLight ? 'border-[#E2E8F0]' : 'border-black/10 dark:border-white/8'
        )}>
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-2 px-1">
            {t('sidebar.switchRole')}
          </p>
          <div className="grid grid-cols-3 gap-1">
            {Object.entries(USER_ROLES).map(([key, value]) => (
              <button
                key={value}
                onClick={() => setRole(value)}
                className={cn(
                  'py-1 px-1 rounded text-xs font-medium transition-all duration-150 truncate',
                  user.role === value
                    ? 'bg-primary/20 text-primary border border-primary/30'
                    : isLight
                      ? 'text-[#475569] hover:text-[#0F172A] hover:bg-gray-100'
                      : 'text-muted-foreground hover:text-foreground hover:bg-black/5 dark:bg-white/5'
                )}
                title={t(`role.${value}` as any)}
                aria-label={`Switch to ${t(`role.${value}` as any)} role`}
                aria-pressed={user.role === value}
              >
                {t(`role.${value}` as any).split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={cn(
          'absolute top-5 right-2 w-6 h-6 rounded-full border flex items-center justify-center transition-colors z-10',
          isLight
            ? 'bg-white border-[#E2E8F0] text-[#475569] hover:text-[#0F172A] hover:bg-gray-50'
            : 'bg-fifa-dark-3 border-black/15 dark:border-white/15 text-muted-foreground hover:text-foreground'
        )}
        aria-label={collapsed ? t('sidebar.expand') : t('sidebar.collapse')}
        aria-expanded={!collapsed}
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </motion.aside>
  );
};
