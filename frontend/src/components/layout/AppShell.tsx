// =============================================================================
// APP SHELL — Main layout container with error boundary
// =============================================================================

import React, { Component, type ErrorInfo } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { CommandPalette } from '../ui/CommandPalette';
import { useThemeStore } from '../../store/useAppStore';
import { cn } from '../../utils/helpers';
import { AlertTriangle, RefreshCw } from 'lucide-react';

// ---- Error Boundary ---------------------------------------------------------

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[StadiumIQ] Uncaught error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-8" role="alert">
          <div className="w-16 h-16 rounded-full bg-red-500/15 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Something went wrong</h1>
          <p className="text-muted-foreground text-center max-w-md">
            {this.state.error?.message ?? 'An unexpected error occurred in the stadium intelligence platform.'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/15 text-primary border border-primary/30 hover:bg-primary/25 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ---- AppShell ---------------------------------------------------------------

interface AppShellProps {
  children: React.ReactNode;
}

function AppShellInner({ children }: AppShellProps) {
  const { mode, highContrast, largeFontSize } = useThemeStore();

  return (
    <div
      className={cn(
        'flex h-screen overflow-hidden',
        mode === 'light' && 'light',
        highContrast && 'high-contrast',
        largeFontSize && 'large-text'
      )}
    >
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar />
        <main
          id="main-content"
          className="flex-1 overflow-y-auto overflow-x-hidden"
          role="main"
          aria-label="Main content"
        >
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>

      {/* Command Palette (global) */}
      <CommandPalette />
    </div>
  );
}

export function AppShell({ children }: AppShellProps) {
  return (
    <ErrorBoundary>
      <AppShellInner>{children}</AppShellInner>
    </ErrorBoundary>
  );
}
