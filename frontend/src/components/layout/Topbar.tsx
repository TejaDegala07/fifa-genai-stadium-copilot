// =============================================================================
// TOPBAR — Global top navigation bar
// =============================================================================

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, Search, Sun, Moon,
  Wifi, WifiOff, Clock, Activity, ChevronDown, Check
} from 'lucide-react';
import { useThemeStore, useAlertStore, useCommandStore } from '../../store/useAppStore';
import { useUserStore } from '../../store/useAppStore';
import { LANGUAGES, STADIUM } from '../../data/constants';
import { formatTime } from '../../utils/helpers';
import { cn } from '../../utils/helpers';
import { useTranslation } from '../../hooks/useTranslation';

export const Topbar: React.FC = () => {
  const { mode, toggleMode } = useThemeStore();
  const { unreadCount } = useAlertStore();
  const { open: openCommand } = useCommandStore();
  const { user, setLanguage } = useUserStore();
  const [isOnline] = React.useState(true);
  const [currentTime, setCurrentTime] = React.useState(new Date().toISOString());
  const [langOpen, setLangOpen] = React.useState(false);
  const { t } = useTranslation();
  const langRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toISOString()), 30_000);
    return () => clearInterval(timer);
  }, []);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    if (!langOpen) return;
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [langOpen]);

  const currentLang = LANGUAGES.find((l) => l.code === user.language) ?? LANGUAGES[0];
  const isLight = mode === 'light';

  const handleSelectLang = (code: string) => {
    setLanguage(code as any);
    setLangOpen(false);
  };

  return (
    <header
      className={cn(
        'h-14 backdrop-blur-md border-b flex items-center justify-between px-4 gap-4 sticky top-0 z-40',
        isLight
          ? 'bg-white/90 border-[#E2E8F0]'
          : 'bg-fifa-dark-2/80 border-black/10 dark:border-white/8'
      )}
      role="banner"
    >
      {/* Left — Match info */}
      <div className="flex items-center gap-4 min-w-0">
        <div className="hidden md:flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-foreground">{STADIUM.match.home}</span>
            <span className="text-xs font-black text-muted-foreground">{t('common.vs')}</span>
            <span className="text-sm font-bold text-foreground">{STADIUM.match.away}</span>
          </div>
          <div className={cn('w-px h-4', isLight ? 'bg-[#E2E8F0]' : 'bg-black/15 dark:bg-white/15')} />
          <span className="badge-red text-xs">
            <span className="pulse-dot red" />
            {t('common.live')} — {STADIUM.match.stage}
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
        id="quick-search-trigger"
        onClick={openCommand}
        className={cn(
          'hidden md:flex flex-1 max-w-sm items-center gap-2 px-3 py-2 rounded-lg text-muted-foreground text-sm transition-all duration-200 cursor-pointer',
          isLight
            ? 'bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-gray-100 hover:border-gray-300'
            : 'bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/8 hover:bg-black/10 dark:hover:bg-white/8 hover:border-black/15 dark:border-white/15'
        )}
        aria-label={`${t('topbar.search')} (Ctrl+K)`}
        aria-keyshortcuts="Control+K"
      >
        <Search className="w-4 h-4" />
        <span className="flex-1 text-left">{t('topbar.searchPlaceholder')}</span>
        <kbd className={cn(
          'hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-mono',
          isLight ? 'bg-gray-100' : 'bg-black/10 dark:bg-white/10'
        )}>
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

        <div className={cn('w-px h-5 hidden lg:block', isLight ? 'bg-[#E2E8F0]' : 'bg-black/10 dark:bg-white/10')} />

        {/* Connectivity */}
        <div
          className={cn(
            'flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium',
            isOnline ? 'text-emerald-500' : 'text-red-500'
          )}
          title={isOnline ? t('topbar.online') : t('topbar.offline')}
          role="status"
          aria-label={isOnline ? t('topbar.online') : t('topbar.offline')}
        >
          {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
          <span className="hidden lg:inline">{isOnline ? t('topbar.online') : t('topbar.offline')}</span>
        </div>

        {/* Language selector — click-to-open with solid background */}
        <div className="relative" ref={langRef}>
          <button
            onClick={() => setLangOpen((o) => !o)}
            className={cn(
              'flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-muted-foreground transition-all duration-200 text-sm',
              isLight
                ? 'hover:text-[#0F172A] hover:bg-gray-100'
                : 'hover:text-foreground hover:bg-black/10 dark:hover:bg-white/8',
              langOpen && (isLight ? 'bg-gray-100 text-[#0F172A]' : 'bg-black/10 dark:bg-white/8 text-foreground')
            )}
            aria-label={`${t('topbar.language')}: ${currentLang.label}`}
            aria-haspopup="listbox"
            aria-expanded={langOpen}
          >
            <span className="text-base leading-none" aria-hidden="true">{currentLang.flag}</span>
            <span className="hidden lg:inline text-xs font-medium">{currentLang.code.toUpperCase()}</span>
            <ChevronDown className={cn(
              'w-3 h-3 hidden lg:block transition-transform duration-200',
              langOpen && 'rotate-180'
            )} />
          </button>

          {/* Language dropdown — solid background, no transparency */}
          <AnimatePresence>
            {langOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className={cn(
                  'absolute right-0 top-full mt-1.5 w-52 py-1.5 z-[9999] rounded-xl border overflow-hidden',
                  isLight
                    ? 'bg-white border-[#E2E8F0] shadow-[0_8px_32px_rgba(0,0,0,0.12)]'
                    : 'bg-[#1A2035] border-[rgba(255,255,255,0.1)] shadow-[0_8px_32px_rgba(0,0,0,0.6)]'
                )}
                role="listbox"
                aria-label={t('topbar.language')}
              >
                {/* Header */}
                <div className={cn(
                  'px-3 py-1.5 text-xs font-semibold uppercase tracking-wider mb-0.5',
                  isLight ? 'text-[#94A3B8]' : 'text-[#6B7280]'
                )}>
                  {t('topbar.language')}
                </div>

                {LANGUAGES.map((lang) => {
                  const isSelected = user.language === lang.code;
                  return (
                    <button
                      key={lang.code}
                      onClick={() => handleSelectLang(lang.code)}
                      className={cn(
                        'w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors duration-100',
                        isSelected
                          ? isLight
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-blue-500/15 text-blue-400'
                          : isLight
                            ? 'text-[#0F172A] hover:bg-[#F8FAFC]'
                            : 'text-[#E5E7EB] hover:bg-black/10 dark:hover:bg-white/8'
                      )}
                      role="option"
                      aria-selected={isSelected}
                    >
                      <span className="text-base flex-shrink-0" aria-hidden="true">{lang.flag}</span>
                      <span className="flex-1 text-left font-medium">{lang.label}</span>
                      <span className={cn(
                        'text-xs',
                        isSelected
                          ? isLight ? 'text-blue-500' : 'text-blue-400'
                          : isLight ? 'text-[#94A3B8]' : 'text-[#6B7280]'
                      )}>
                        {lang.nativeLabel}
                      </span>
                      {isSelected && (
                        <Check className={cn(
                          'w-3.5 h-3.5 flex-shrink-0',
                          isLight ? 'text-blue-600' : 'text-blue-400'
                        )} />
                      )}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleMode}
          className={cn(
            'p-2 rounded-lg text-muted-foreground transition-all duration-200',
            isLight
              ? 'hover:text-[#0F172A] hover:bg-gray-100'
              : 'hover:text-foreground hover:bg-black/10 dark:hover:bg-white/8'
          )}
          aria-label={mode === 'dark' ? t('topbar.switchLight') : t('topbar.switchDark')}
        >
          {mode === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Alerts */}
        <button
          className={cn(
            'relative p-2 rounded-lg text-muted-foreground transition-all duration-200',
            isLight
              ? 'hover:text-[#0F172A] hover:bg-gray-100'
              : 'hover:text-foreground hover:bg-black/10 dark:hover:bg-white/8'
          )}
          aria-label={`${t('topbar.notifications')} — ${unreadCount} unread`}
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
