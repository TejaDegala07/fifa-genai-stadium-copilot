// =============================================================================
// COMMAND PALETTE — Global search and quick actions
// =============================================================================

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Search, LayoutDashboard, Map, AlertOctagon, Activity,
  Bus, Megaphone, Leaf, Settings, HandHelping, Stethoscope,
  ArrowRight, Zap, X
} from 'lucide-react';
import { Command } from 'cmdk';
import FocusTrap from 'focus-trap-react';
import { useCommandStore, useUserStore, useThemeStore } from '../../store/useAppStore';
import { cn } from '../../utils/helpers';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ElementType;
  action: () => void;
  category: string;
  keywords: string[];
}

export const CommandPalette: React.FC = () => {
  const { isOpen, close } = useCommandStore();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { mode } = useThemeStore();
  const isLight = mode === 'light';

  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);

  // Position based on trigger
  useEffect(() => {
    if (isOpen) {
      const trigger = document.getElementById('quick-search-trigger');
      if (trigger && trigger.offsetWidth > 0) {
        setTriggerRect(trigger.getBoundingClientRect());
      } else {
        setTriggerRect(null);
      }
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Focus input automatically
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        document.getElementById('quick-search-input')?.focus();
      }, 50);
    }
  }, [isOpen]);

  const commands: CommandItem[] = useMemo(() => [
    { id: 'nav-dashboard', label: 'Dashboard', description: 'Main overview', icon: LayoutDashboard, action: () => navigate('/'), category: 'Navigate', keywords: ['home', 'overview'] },
    { id: 'nav-crowd', label: 'Crowd Intelligence', description: 'Real-time crowd density', icon: Activity, action: () => navigate('/crowd'), category: 'Navigate', keywords: ['density', 'zone', 'congestion'] },
    { id: 'nav-map', label: 'Stadium Map', description: 'Interactive navigation', icon: Map, action: () => navigate('/map'), category: 'Navigate', keywords: ['navigation', 'route', 'find'] },
    { id: 'nav-emergency', label: 'Emergency Copilot', description: 'Report & manage incidents', icon: AlertOctagon, action: () => navigate('/emergency'), category: 'Navigate', keywords: ['incident', 'medical', 'fire', 'urgent'] },
    { id: 'nav-transport', label: 'Transportation', description: 'Transport recommendations', icon: Bus, action: () => navigate('/transport'), category: 'Navigate', keywords: ['bus', 'metro', 'train', 'parking'] },
    { id: 'nav-announcements', label: 'Announcements', description: 'Generate PA announcements', icon: Megaphone, action: () => navigate('/announcements'), category: 'Navigate', keywords: ['pa', 'broadcast', 'alert'] },
    { id: 'nav-sustainability', label: 'Eco Impact', description: 'Sustainability tracking', icon: Leaf, action: () => navigate('/sustainability'), category: 'Navigate', keywords: ['eco', 'carbon', 'green'] },
    { id: 'nav-volunteer', label: 'Volunteer Hub', description: 'Task assignments', icon: HandHelping, action: () => navigate('/volunteer'), category: 'Navigate', keywords: ['tasks', 'assign', 'help'] },
    { id: 'nav-medical', label: 'Medical Center', description: 'Medical incidents & triage', icon: Stethoscope, action: () => navigate('/medical'), category: 'Navigate', keywords: ['health', 'first aid', 'hospital'] },
    { id: 'nav-operations', label: 'Operations', description: 'Full ops dashboard', icon: Settings, action: () => navigate('/operations'), category: 'Navigate', keywords: ['kpi', 'manage', 'control'] },
    { id: 'action-emergency', label: 'Report Emergency', description: 'Immediately report an incident', icon: Zap, action: () => navigate('/emergency?action=report'), category: 'Quick Actions', keywords: ['help', 'sos', 'danger', 'urgent'] },
  ], [navigate]);

  // Group commands by category natively
  const grouped = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    commands.forEach((cmd) => {
      if (!groups[cmd.category]) groups[cmd.category] = [];
      groups[cmd.category].push(cmd);
    });
    return groups;
  }, [commands]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') close();
    };

    const handleGlobal = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        isOpen ? close() : useCommandStore.getState().open();
      }
    };

    window.addEventListener('keydown', handleKey);
    window.addEventListener('keydown', handleGlobal);
    return () => {
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('keydown', handleGlobal);
    };
  }, [isOpen, close]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <FocusTrap focusTrapOptions={{ initialFocus: false, fallbackFocus: '#qs-fallback' }}>
          <div className="fixed inset-0 z-50">
            <button id="qs-fallback" className="sr-only" aria-hidden="true" tabIndex={0}>Fallback Focus</button>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={close}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm"
              aria-hidden="true"
            />
            
            <Command
              className="absolute z-50"
              style={triggerRect ? {
                top: triggerRect.bottom + 8,
                left: triggerRect.left,
                width: triggerRect.width,
              } : {
                top: '20vh',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '100%',
                maxWidth: '32rem'
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -10 }}
                transition={{ duration: 0.15 }}
                className={cn(
                  'overflow-hidden shadow-2xl',
                  isLight ? 'bg-white border border-[#E2E8F0]' : 'bg-[#1A2035] border border-[rgba(255,255,255,0.1)]',
                  'rounded-xl' // Same as search bar roughly
                )}
              >
                {/* Search input */}
                <div className={cn(
                  'flex items-center gap-3 px-4 py-3 border-b',
                  isLight ? 'border-[#E2E8F0]' : 'border-black/10 dark:border-white/10'
                )}>
                  <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <Command.Input
                    id="quick-search-input"
                    value={query}
                    onValueChange={setQuery}
                    placeholder="Search features, actions, sections..."
                    className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-sm"
                  />
                  <button onClick={close} aria-label="Close command palette">
                    <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                  </button>
                </div>

                {/* Results */}
                <Command.List className="max-h-80 overflow-y-auto p-2">
                  <Command.Empty className="py-8 text-center text-muted-foreground text-sm">
                    No results found.
                  </Command.Empty>
                  
                  {Object.entries(grouped).map(([category, items]) => (
                    <Command.Group 
                      key={category} 
                      heading={category}
                      className="px-2 py-1 text-xs text-muted-foreground font-semibold uppercase tracking-wide [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1 [&_[cmdk-group-heading]]:mb-1"
                    >
                      {items.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Command.Item
                            key={item.id}
                            value={`${item.label} ${item.description || ''} ${item.keywords.join(' ')}`}
                            onSelect={() => { item.action(); close(); }}
                            className={cn(
                              'group w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left cursor-pointer outline-none transition-colors duration-100',
                              // cmdk automatically applies data-selected attribute to focused items
                              'data-[selected=true]:bg-primary/20 data-[selected=true]:text-foreground',
                              isLight
                                ? 'text-muted-foreground hover:bg-gray-100'
                                : 'text-muted-foreground hover:bg-black/5 dark:bg-white/5'
                            )}
                          >
                            <div className={cn(
                              'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                              isLight ? 'bg-gray-100' : 'bg-black/5 dark:bg-white/5'
                            )}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-foreground">{item.label}</div>
                              {item.description && (
                                <div className="text-xs text-muted-foreground">{item.description}</div>
                              )}
                            </div>
                            <ArrowRight className="w-4 h-4 text-primary opacity-0 group-data-[selected=true]:opacity-100 flex-shrink-0 transition-opacity" />
                          </Command.Item>
                        );
                      })}
                    </Command.Group>
                  ))}
                </Command.List>

                {/* Footer */}
                <div className={cn(
                  'px-4 py-2 border-t flex items-center gap-4 text-xs text-muted-foreground',
                  isLight ? 'border-[#E2E8F0]' : 'border-black/10 dark:border-white/10'
                )}>
                  <span className="flex items-center gap-1"><kbd className={cn('px-1 rounded', isLight ? 'bg-gray-100' : 'bg-black/10 dark:bg-white/10')}>↑↓</kbd> navigate</span>
                  <span className="flex items-center gap-1"><kbd className={cn('px-1 rounded', isLight ? 'bg-gray-100' : 'bg-black/10 dark:bg-white/10')}>↵</kbd> select</span>
                  <span className="flex items-center gap-1"><kbd className={cn('px-1 rounded', isLight ? 'bg-gray-100' : 'bg-black/10 dark:bg-white/10')}>ESC</kbd> close</span>
                </div>
              </motion.div>
            </Command>
          </div>
        </FocusTrap>
      )}
    </AnimatePresence>
  );
};
