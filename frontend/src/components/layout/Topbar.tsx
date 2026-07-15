// =============================================================================
// TOPBAR — Global top navigation bar
// =============================================================================

import React from 'react';
import { motion } from 'framer-motion';
import {
  Bell, Search, Sun, Moon, Globe, Mic,
  Wifi, WifiOff, Clock, Activity
} from 'lucide-react';
import { useThemeStore, useAlertStore, useCommandStore } from '../../store/useAppStore';
import { useUserStore } from '../../store/useAppStore';
import { LANGUAGES, STADIUM } from '../../data/constants';
import { formatTime } from '../../utils/helpers';
import { cn } from '../../utils/helpers';

export const Topbar: React.FC = () => {
  const { mode, toggleMode } = useThemeStore();
  const { unreadCount } = useAlertStore();
  const { open: openCommand } = useCommandStore();
  const { user, setLanguage } = useUserStore();
  const [isOnline] = React.useState(true);
  const [currentTime, setCurrentTime] = React.useState(new Date().toISOString());

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toISOString()), 30_000);
    return () => clearInterval(timer);
  }, []);

  const currentLang = LANGUAGES.find((l) => l.code === user.language) ?? LANGUAGES[0];

  return (
    <header
      className="h-14 bg-fifa-dark-2/80 backdrop-blur-md border-b border-white/8 flex items-center justify-between px-4 gap-4 sticky top-0 z-40"
      role="banner"
    >
      {/* Left — Match info */}
      <div className="flex items-center gap-4 min-w-0">
        <div className="hidden md:flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-foreground">{STADIUM.match.home}</span>
            <span className="text-xs font-black text-muted-foreground">vs</span>
            <span className="text-sm font-bold text-foreground">{STADIUM.match.away}</span>
          </div>
          <div className="w-px h-4 bg-white/15" />
          <span className="badge-red text-xs">
            <span className="pulse-dot red" />
            LIVE — {STADIUM.match.stage}
          </span>
        </div>

        {/* Stadium name */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-muted-foreground">
          <Activity className="w-3.5 h-3.5" />
          {STADIUM.name}
        </div>
      </div>

      {/* Center — Search trigger */}
      <button
        onClick={openCommand}
        className="hidden md:flex flex-1 max-w-sm items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/8 text-muted-foreground text-sm hover:bg-white/8 hover:border-white/15 transition-all duration-200 cursor-pointer"
        aria-label="Open command palette (Ctrl+K)"
        aria-keyshortcuts="Control+K"
      >
        <Search className="w-4 h-4" />
        <span className="flex-1 text-left">Quick search...</span>
        <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-white/10 font-mono">
          ⌘K
        </kbd>
      </button>

      {/* Right — Actions */}
      <div className="flex items-center gap-1.5">
        {/* Time */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-muted-foreground px-2">
          <Clock className="w-3.5 h-3.5" />
          <span>{formatTime(currentTime)}</span>
        </div>

        <div className="w-px h-5 bg-white/10 hidden lg:block" />

        {/* Connectivity */}
        <div
          className={cn(
            'flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium',
            isOnline ? 'text-emerald-400' : 'text-red-400'
          )}
          title={isOnline ? 'Connected' : 'Offline'}
          role="status"
          aria-label={isOnline ? 'Online' : 'Offline'}
        >
          {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
          <span className="hidden lg:inline">{isOnline ? 'Live' : 'Offline'}</span>
        </div>

        {/* Language selector */}
        <div className="relative group">
          <button
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/8 transition-all duration-200 text-sm"
            aria-label={`Language: ${currentLang.label}`}
            aria-haspopup="listbox"
          >
            <span className="text-base leading-none">{currentLang.flag}</span>
            <span className="hidden lg:inline text-xs font-medium">{currentLang.code.toUpperCase()}</span>
          </button>
          {/* Dropdown */}
          <div
            className="absolute right-0 top-full mt-1 w-48 glass-card py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200"
            role="listbox"
            aria-label="Select language"
          >
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-white/8 transition-colors',
                  user.language === lang.code ? 'text-primary' : 'text-foreground'
                )}
                role="option"
                aria-selected={user.language === lang.code}
              >
                <span className="text-base">{lang.flag}</span>
                <span className="flex-1 text-left">{lang.label}</span>
                <span className="text-xs text-muted-foreground">{lang.nativeLabel}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleMode}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/8 transition-all duration-200"
          aria-label={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
        >
          {mode === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Alerts */}
        <button
          className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/8 transition-all duration-200"
          aria-label={`Notifications — ${unreadCount} unread`}
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </button>
      </div>
    </header>
  );
};
