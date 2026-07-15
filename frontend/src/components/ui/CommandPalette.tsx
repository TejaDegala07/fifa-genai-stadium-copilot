// =============================================================================
// COMMAND PALETTE — Global search and quick actions
// =============================================================================

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Search, LayoutDashboard, Map, AlertOctagon, Activity,
  Bus, Megaphone, Leaf, Settings, HandHelping, Stethoscope,
  ArrowRight, Zap, Command as CommandIcon, X
} from 'lucide-react';
import { Command } from 'cmdk';
import FocusTrap from 'focus-trap-react';
import { useCommandStore, useUserStore } from '../../store/useAppStore';
import { useDebounce } from '../../hooks/useDebounce';
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
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const { user } = useUserStore();
  const debouncedQuery = useDebounce(query, 150);

  const commands: CommandItem[] = useMemo(() => [
    { id: 'nav-dashboard', label: 'Go to Dashboard', description: 'Main overview', icon: LayoutDashboard, action: () => navigate('/'), category: 'Navigate', keywords: ['home', 'overview'] },
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

  const filtered = useMemo(() => {
    if (!debouncedQuery) return commands;
    const q = debouncedQuery.toLowerCase();
    return commands.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(q) ||
        cmd.description?.toLowerCase().includes(q) ||
        cmd.keywords.some((k) => k.includes(q)) ||
        cmd.category.toLowerCase().includes(q)
    );
  }, [commands, debouncedQuery]);

  const grouped = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    filtered.forEach((cmd) => {
      if (!groups[cmd.category]) groups[cmd.category] = [];
      groups[cmd.category].push(cmd);
    });
    return groups;
  }, [filtered]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [debouncedQuery]);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const executeSelected = useCallback(() => {
    if (filtered[selectedIndex]) {
      filtered[selectedIndex].action();
      close();
    }
  }, [filtered, selectedIndex, close]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      }
      if (e.key === 'Enter') executeSelected();
    };

    // Global Ctrl+K
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
  }, [isOpen, close, executeSelected, filtered.length]);

  let flatIndex = 0;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <FocusTrap>
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={close}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              aria-hidden="true"
            />
            
            <Command.Dialog
              open={isOpen}
              onOpenChange={close}
              className="relative w-full max-w-lg z-50"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -10 }}
                transition={{ duration: 0.15 }}
                className="glass-card overflow-hidden"
              >
                {/* Search input */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
                  <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <Command.Input
                    autoFocus
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
                <Command.List
                  className="max-h-80 overflow-y-auto p-2"
                >
                  {Object.keys(grouped).length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground text-sm">
                      No results for "{query}"
                    </div>
                  ) : (
                    Object.entries(grouped).map(([category, items]) => (
                      <div key={category}>
                        <div className="px-2 py-1 text-xs text-muted-foreground font-semibold uppercase tracking-wide">
                          {category}
                        </div>
                        {items.map((item) => {
                          const Icon = item.icon;
                          const currentIndex = flatIndex++;
                          const isSelected = currentIndex === selectedIndex;
                          return (
                            <button
                              key={item.id}
                              onClick={() => { item.action(); close(); }}
                              onMouseEnter={() => setSelectedIndex(currentIndex)}
                              className={cn(
                                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors duration-100',
                                isSelected ? 'bg-primary/20 text-foreground' : 'text-muted-foreground hover:bg-white/5'
                              )}
                              role="option"
                              aria-selected={isSelected}
                            >
                              <div className={cn(
                                'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                                isSelected ? 'bg-primary/25' : 'bg-white/5'
                              )}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-foreground">{item.label}</div>
                                {item.description && (
                                  <div className="text-xs text-muted-foreground">{item.description}</div>
                                )}
                              </div>
                              {isSelected && (
                                <ArrowRight className="w-4 h-4 text-primary flex-shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    ))
                  )}
                </Command.List>

                {/* Footer */}
                <div className="px-4 py-2 border-t border-white/10 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><kbd className="bg-white/10 px-1 rounded">↑↓</kbd> navigate</span>
                  <span className="flex items-center gap-1"><kbd className="bg-white/10 px-1 rounded">↵</kbd> select</span>
                  <span className="flex items-center gap-1"><kbd className="bg-white/10 px-1 rounded">ESC</kbd> close</span>
                </div>
              </motion.div>
            </Command.Dialog>
          </div>
        </FocusTrap>
      )}
    </AnimatePresence>
  );
};
