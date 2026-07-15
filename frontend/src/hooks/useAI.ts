// =============================================================================
// useAI — Custom hook for AI feature calls
// =============================================================================

import { useState, useCallback } from 'react';
import { aiService } from '../services/aiService';
import type { AIResponse } from '../types';
import type { AIRequestContext } from '../types';
import { useUserStore } from '../store/useAppStore';
import { STADIUM } from '../data/constants';

export interface UseAIState {
  data: AIResponse | null;
  isLoading: boolean;
  error: string | null;
  isUsingMock: boolean;
}

export interface UseAIActions {
  analyzeCrowd: (zoneId?: string) => Promise<void>;
  reportEmergency: (type: string, description: string, location: string) => Promise<void>;
  getNavigation: (destination: string, isWheelchair?: boolean) => Promise<void>;
  analyzeTransport: (destination?: string) => Promise<void>;
  assignTasks: () => Promise<void>;
  getSustainability: () => Promise<void>;
  reset: () => void;
}

export function useAI(): UseAIState & UseAIActions {
  const [data, setData] = useState<AIResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUsingMock, setIsUsingMock] = useState(false);

  const { user } = useUserStore();

  const buildContext = useCallback((): AIRequestContext => ({
    role: user.role,
    language: user.language,
    location: user.section ? `Section ${user.section}` : undefined,
    timestamp: new Date().toISOString(),
    weatherCondition: 'Clear, 28°C',
    matchPhase: 'pre',
  }), [user]);

  const execute = useCallback(async (fn: () => Promise<AIResponse>) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fn();
      setData(result);
      setIsUsingMock(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI service unavailable. Using cached intelligence.');
      setIsUsingMock(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const analyzeCrowd = useCallback(async (zoneId?: string) => {
    await execute(() => aiService.analyzeCrowd(buildContext(), zoneId));
  }, [execute, buildContext]);

  const reportEmergency = useCallback(async (
    type: string,
    description: string,
    location: string
  ) => {
    await execute(() =>
      aiService.reportEmergency(type as any, description, location, buildContext())
    );
  }, [execute, buildContext]);

  const getNavigation = useCallback(async (
    destination: string,
    isWheelchair = false
  ) => {
    await execute(() =>
      aiService.getNavigation(
        destination,
        user.section ?? 'Main Entrance',
        isWheelchair,
        buildContext()
      )
    );
  }, [execute, buildContext, user.section]);

  const analyzeTransport = useCallback(async (destination = 'Manhattan, NYC') => {
    await execute(() => aiService.analyzeTransport(destination, buildContext()));
  }, [execute, buildContext]);

  const assignTasks = useCallback(async () => {
    await execute(() => aiService.assignVolunteerTasks(buildContext()));
  }, [execute, buildContext]);

  const getSustainability = useCallback(async () => {
    await execute(() =>
      aiService.getSustainability(
        { transportMode: 'metro', digitalTicket: true, waterRefills: 2 },
        buildContext()
      )
    );
  }, [execute, buildContext]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    data, isLoading, error, isUsingMock,
    analyzeCrowd, reportEmergency, getNavigation,
    analyzeTransport, assignTasks, getSustainability, reset,
  };
}
