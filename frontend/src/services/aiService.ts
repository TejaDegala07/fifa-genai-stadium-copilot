// =============================================================================
// AI SERVICE — Frontend API client using Google GenAI SDK
// =============================================================================

import { GoogleGenAI, Type } from '@google/genai';
import type {
  AIResponse, AnnouncementRequest, AnnouncementOutput,
  SustainabilityProfile, IncidentReport, AIRequestContext
} from '../types';
import type { IncidentType } from '../data/constants';

// ---- Input sanitization ---------------------------------------------------
function sanitizeInput(input: string): string {
  return input.slice(0, 2000).replace(/[<>{}]/g, '').trim();
}

// ---- Gemini Initialization ------------------------------------------------
function getAIClient() {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('VITE_GEMINI_API_KEY environment variable is not set. Please add it to your .env file.');
  }
  return new GoogleGenAI({ apiKey });
}

// ---- Core wrapper with Retries & Timeout ----------------------------------

const BASE_AI_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    situation: { type: Type.STRING },
    reasoning: { type: Type.STRING },
    recommendation: { type: Type.STRING },
    priority: { type: Type.STRING }, // 'Routine' | 'Attention Required' | 'Urgent' | 'Critical — Immediate Action'
    estimatedImpact: { type: Type.STRING },
    confidence: { type: Type.INTEGER },
  },
  required: ['situation', 'reasoning', 'recommendation', 'priority', 'estimatedImpact', 'confidence'],
};

async function callGemini<T>(
  prompt: string,
  schema: any,
  retries = 2,
  timeoutMs = 20_000
): Promise<T> {
  const ai = getAIClient();
  let attempt = 0;
  let lastError: Error | null = null;

  while (attempt <= retries) {
    try {
      const fetchPromise = ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: schema,
          temperature: 0.2,
        }
      });

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error(`Request timed out after ${timeoutMs / 1000} seconds`)), timeoutMs);
      });

      const response = await Promise.race([fetchPromise, timeoutPromise]);
      const text = response.text;
      return JSON.parse(text || '{}') as T;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(`[AI Service] Attempt ${attempt + 1} failed: ${lastError.message}`);
      attempt++;
      if (attempt <= retries) {
        await new Promise(res => setTimeout(res, 1000 * attempt));
      }
    }
  }

  throw new Error(lastError?.message || 'Failed to connect to Google Gemini AI API.');
}

// ---- Prompt Builder Helpers -----------------------------------------------

function buildContextString(context: AIRequestContext): string {
  return `
Role: ${context.role}
Location: ${context.location || 'Unknown'}
Weather: ${context.weatherCondition || 'N/A'}
Match Phase: ${context.matchPhase || 'N/A'}
  `.trim();
}

// ---- Exported AI service methods ------------------------------------------

export const aiService = {
  /**
   * Get crowd intelligence analysis for a specific zone or all zones
   */
  analyzeCrowd: async (
    context: AIRequestContext,
    zoneId?: string
  ): Promise<AIResponse> => {
    const prompt = `
You are an advanced Stadium Operations AI. Analyze the current crowd situation.
Context:
${buildContextString(context)}
Target Zone: ${zoneId ? sanitizeInput(zoneId) : 'All Zones'}

Provide a structured JSON response identifying crowd congestion, wait times, and immediate actionable recommendations for crowd control and staff deployment.
    `.trim();

    return callGemini<AIResponse>(prompt, BASE_AI_SCHEMA);
  },

  /**
   * Submit emergency report and get AI triage response
   */
  reportEmergency: async (
    incidentType: IncidentType,
    description: string,
    location: string,
    context: AIRequestContext
  ): Promise<AIResponse> => {
    const prompt = `
You are an Emergency Response AI for a major stadium. Triage the following incident.
Context:
${buildContextString(context)}
Incident Type: ${incidentType}
Location: ${sanitizeInput(location)}
Description: ${sanitizeInput(description)}

Provide a structured JSON response with triage reasoning, an immediate action plan, priority level, and estimated impact of those actions. Prioritize human safety above all.
    `.trim();

    return callGemini<AIResponse>(prompt, BASE_AI_SCHEMA);
  },

  /**
   * Get navigation route to a POI
   */
  getNavigation: async (
    destination: string,
    fromSection: string,
    isWheelchair: boolean,
    context: AIRequestContext
  ): Promise<AIResponse> => {
    const prompt = `
You are a Stadium Navigation AI. Provide routing instructions for a guest.
Context:
${buildContextString(context)}
From: ${sanitizeInput(fromSection)}
To: ${sanitizeInput(destination)}
Requires Wheelchair Access: ${isWheelchair ? 'Yes' : 'No'}

Provide a structured JSON response outlining the best path, avoiding current crowd congestion, noting elevators if wheelchair access is required, and estimating total travel time.
    `.trim();

    return callGemini<AIResponse>(prompt, BASE_AI_SCHEMA);
  },

  /**
   * Generate multi-format announcement
   */
  generateAnnouncement: async (
    request: AnnouncementRequest,
    context: AIRequestContext
  ): Promise<{ ai: AIResponse; output: AnnouncementOutput }> => {
    const prompt = `
You are the Stadium Communications AI. You need to draft a public announcement based on an operations request.
Context:
${buildContextString(context)}
Situation: ${sanitizeInput(request.situation)}
Target Audience: ${request.targetAudience}

Generate an analysis of the situation (AIResponse) and multiple formats of the announcement (AnnouncementOutput).
The response must perfectly match the nested JSON schema requested.
    `.trim();

    const schema = {
      type: Type.OBJECT,
      properties: {
        ai: BASE_AI_SCHEMA,
        output: {
          type: Type.OBJECT,
          properties: {
            pa: { type: Type.STRING },
            sms: { type: Type.STRING },
            socialMedia: { type: Type.STRING },
            app: { type: Type.STRING },
            translations: {
              type: Type.OBJECT,
              properties: {
                es: { type: Type.STRING },
                fr: { type: Type.STRING },
                ar: { type: Type.STRING }
              }
            }
          },
          required: ['pa', 'sms', 'socialMedia', 'app', 'translations']
        }
      },
      required: ['ai', 'output']
    };

    return callGemini<{ ai: AIResponse; output: AnnouncementOutput }>(prompt, schema);
  },

  /**
   * Get transportation analysis and recommendations
   */
  analyzeTransport: async (
    destination: string,
    context: AIRequestContext
  ): Promise<AIResponse> => {
    const prompt = `
You are a Stadium Transport AI. Provide post-match or current transit recommendations.
Context:
${buildContextString(context)}
Destination: ${sanitizeInput(destination)}

Provide a structured JSON response identifying the fastest transit methods (bus, metro, rideshare), expected wait times, traffic conditions, and eco-friendly recommendations.
    `.trim();

    return callGemini<AIResponse>(prompt, BASE_AI_SCHEMA);
  },

  /**
   * Get sustainability analysis for user
   */
  getSustainability: async (
    profile: Partial<SustainabilityProfile>,
    context: AIRequestContext
  ): Promise<AIResponse> => {
    const prompt = `
You are an Eco-Impact AI. Analyze the fan's sustainability metrics.
Context:
${buildContextString(context)}
Profile Info: ${JSON.stringify(profile)}

Provide a structured JSON response acknowledging their eco-friendly choices (like public transit or digital tickets), calculating approximate CO2 savings, and recommending further green actions.
    `.trim();

    return callGemini<AIResponse>(prompt, BASE_AI_SCHEMA);
  },

  /**
   * Get volunteer task assignment recommendations
   */
  assignVolunteerTasks: async (context: AIRequestContext): Promise<AIResponse> => {
    const prompt = `
You are a Volunteer Management AI. Distribute pending tasks.
Context:
${buildContextString(context)}

Analyze the current stadium conditions and provide a structured JSON response recommending where available volunteers should be dispatched (e.g., crowd control, medical assistance, lost & found) based on priority.
    `.trim();

    return callGemini<AIResponse>(prompt, BASE_AI_SCHEMA);
  },

  /**
   * Generate structured incident report
   */
  generateIncidentReport: async (
    incidentId: string,
    context: AIRequestContext
  ): Promise<IncidentReport> => {
    const prompt = `
You are a Post-Incident Analysis AI. Generate a formal report for an incident.
Context:
${buildContextString(context)}
Incident ID: ${incidentId}

Generate a structured JSON response representing the full incident report, including summary, root cause analysis, timeline of response actions, and future recommendations.
    `.trim();

    const schema = {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING },
        incidentId: { type: Type.STRING },
        generatedAt: { type: Type.STRING },
        summary: { type: Type.STRING },
        causeAnalysis: { type: Type.STRING },
        responseActions: { type: Type.ARRAY, items: { type: Type.STRING } },
        recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
        lessonsLearned: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ['id', 'incidentId', 'generatedAt', 'summary', 'causeAnalysis', 'responseActions', 'recommendations', 'lessonsLearned']
    };

    return callGemini<IncidentReport>(prompt, schema);
  },

  /**
   * Translate text to target language
   */
  translate: async (
    text: string,
    targetLanguage: string
  ): Promise<string> => {
    const prompt = `Translate the following text to ${targetLanguage}. Return ONLY a JSON object with a single 'translation' string field containing the result.\n\nText to translate: ${sanitizeInput(text)}`;
    
    const schema = {
      type: Type.OBJECT,
      properties: {
        translation: { type: Type.STRING }
      },
      required: ['translation']
    };

    try {
      const res = await callGemini<{translation: string}>(prompt, schema, 1, 10000);
      return res.translation;
    } catch {
      return text;
    }
  },
};
