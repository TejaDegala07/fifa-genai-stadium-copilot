// =============================================================================
// AI SERVICE — Frontend API client using Backend AI Gateway
// =============================================================================

import { api } from './api';
import type {
  AIResponse, AnnouncementRequest, AnnouncementOutput,
  SustainabilityProfile, IncidentReport, AIRequestContext
} from '../types';
import type { IncidentType } from '../data/constants';

// ---- Exported AI service methods ------------------------------------------

export const aiService = {
  /**
   * Get crowd intelligence analysis for a specific zone or all zones
   */
  analyzeCrowd: async (context: AIRequestContext, zoneId?: string): Promise<AIResponse> => {
    const res = await api.post('/ai/crowd', { context, zoneId });
    return res.data;
  },

  /**
   * Submit emergency report and get AI triage response
   */
  reportEmergency: async (incidentType: IncidentType, description: string, location: string, context: AIRequestContext): Promise<AIResponse> => {
    const res = await api.post('/ai/emergency', { incidentType, description, location, context });
    return res.data;
  },

  /**
   * Get navigation route to a POI
   */
  getNavigation: async (destination: string, fromSection: string, isWheelchair: boolean, context: AIRequestContext): Promise<AIResponse> => {
    const res = await api.post('/ai/navigation', { destination, fromSection, isWheelchair, context });
    return res.data;
  },

  /**
   * Generate multi-format announcement
   */
  generateAnnouncement: async (request: AnnouncementRequest, context: AIRequestContext): Promise<{ ai: AIResponse; output: AnnouncementOutput }> => {
    const res = await api.post('/ai/announcement', { request, context });
    return res.data;
  },

  /**
   * Get transportation analysis and recommendations
   */
  analyzeTransport: async (destination: string, context: AIRequestContext): Promise<AIResponse> => {
    const res = await api.post('/ai/transport', { destination, context });
    return res.data;
  },

  /**
   * Get sustainability analysis for user
   */
  getSustainability: async (profile: Partial<SustainabilityProfile>, context: AIRequestContext): Promise<AIResponse> => {
    const res = await api.post('/ai/sustainability', { profile, context });
    return res.data;
  },

  /**
   * Get volunteer task assignment recommendations
   */
  assignVolunteerTasks: async (context: AIRequestContext): Promise<AIResponse> => {
    const res = await api.post('/ai/volunteer', { context });
    return res.data;
  },

  /**
   * Generate structured incident report
   */
  generateIncidentReport: async (incidentId: string, context: AIRequestContext): Promise<IncidentReport> => {
    const res = await api.post('/ai/incident-report', { incidentId, context });
    return res.data;
  },

  /**
   * Translate text to target language
   */
  translate: async (text: string, targetLanguage: string): Promise<string> => {
    const res = await api.post('/ai/translate', { text, targetLanguage });
    return res.data.translation;
  },
};
