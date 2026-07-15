// =============================================================================
// AI SERVICE — Frontend API client for the AI Gateway backend
// =============================================================================

import axios, { AxiosError } from 'axios';
import { API_BASE_URL, API_ENDPOINTS, RATE_LIMIT } from '../data/constants';
import type {
  AIResponse, AnnouncementRequest, AnnouncementOutput,
  CrowdAnalysis, NavigationRoute, TransportAnalysis,
  SustainabilityProfile, IncidentReport, AIRequestContext
} from '../types';
import type { IncidentType } from '../data/constants';

// ---- Axios instance with interceptors -------------------------------------

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
    'X-Client': 'StadiumIQ-Frontend/1.0',
  },
});

// ---- Input sanitization (client-side) -------------------------------------

function sanitizeInput(input: string): string {
  return input
    .slice(0, 2000) // length limit
    .replace(/[<>{}]/g, '') // strip injection chars
    .replace(/prompt\s*:|system\s*:|ignore\s+previous/gi, '') // prompt injection
    .trim();
}

// ---- Mock AI responses (fallback when backend unavailable) ----------------

function createMockAIResponse(feature: string, context: Record<string, unknown> = {}): AIResponse {
  const responses: Record<string, AIResponse> = {
    crowd: {
      situation: 'North Lower (Section A) and East Lower (Section E) are both showing critical crowd density at 92% and 91% capacity respectively, with an increasing trend. The pre-match arrival surge began 90 minutes ago and is intensifying.',
      reasoning: 'With kick-off in 12 minutes, these zones will experience maximum inflow in the next 8-10 minutes. Historical data from similar Brazil-Argentina matches shows a 15% additional surge in the final 10 minutes before kick-off. Gate 1 (Section A) is the primary bottleneck due to its proximity to the nearest metro station.',
      recommendation: 'Immediately activate overflow routing: direct all Gate 1 and Gate 5 arrivals to Section D (52% capacity) and Section F (60% capacity) via the north concourse. Deploy 4 additional crowd management volunteers at the Gate 1 funnel point. Consider temporarily pausing ingress at Gate 1 for 5 minutes to allow current queue to clear.',
      priority: 'Critical — Immediate Action',
      estimatedImpact: 'Reducing Gate 1 flow by 40% would bring Section A back to 80% capacity within 15 minutes, reducing stampede risk by an estimated 85%.',
      confidence: 94,
      actions: [
        { id: 'reroute-gate1', label: 'Activate Gate 1 Overflow', description: 'Redirect fans to Section D via North Concourse', urgency: 'critical', icon: 'ArrowRight' },
        { id: 'deploy-volunteers', label: 'Deploy 4 Volunteers to Gate 1', description: 'Crowd flow management', urgency: 'critical', icon: 'Users' },
        { id: 'pa-announcement', label: 'Broadcast PA Announcement', description: 'Guide fans to alternate sections', urgency: 'high', icon: 'Volume2' },
      ],
    },
    emergency: {
      situation: 'A medical emergency has been reported in Section E, Row 22. Fan is experiencing chest pain. Current zone density is 91%, complicating response team access.',
      reasoning: 'Chest pain in a crowd environment requires immediate triage. High density in East Lower makes standard walking routes to Section E Row 22 potentially 4-6 minutes slower than optimal. The nearest medical center (Med Center A) is at 80m distance but the direct path through Gate 5 concourse is currently congested.',
      recommendation: 'Route Medical Team Alpha via the staff-only eastern service corridor (bypass public concourse). ETA 2 minutes via this route vs 6 minutes via public route. Clear a 3-seat radius around the patient. If cardiac event confirmed, request AED deployment from Station E2 (45m away). Prepare ambulance access via south vehicle gate.',
      priority: 'Critical — Immediate Action',
      estimatedImpact: 'Staff corridor routing reduces medical team ETA from 6 to 2 minutes — a critical difference in cardiac events where every minute reduces survival probability by 7-10%.',
      confidence: 91,
    },
    transport: {
      situation: 'Post-match transport demand will peak in approximately 35 minutes. Current NJ Transit is 15 minutes delayed. Rideshare surge pricing is active at 3.2x. Shuttle buses have 8 routes operational.',
      reasoning: 'With 79,240 fans expected to exit within 90 minutes of full-time whistle, and NJ Transit running delayed, road congestion will reach severe levels if fans primarily choose rideshare. Historical post-match data shows 60% typically use private transport, creating a 45-minute gridlock window.',
      recommendation: 'Depart now (pre-match end) on FIFA Shuttle Route B — 5-minute walk to Shuttle Stop B3, next departure in 12 minutes, estimated 45 minutes to central Manhattan. Alternatively, the NJ Transit train (despite delay) will be faster than rideshare once gridlock begins at 22:30.',
      priority: 'Attention Required',
      estimatedImpact: 'Early shuttle departure saves approximately 55-75 minutes vs rideshare during peak gridlock. CO2 savings of approximately 18kg vs solo car travel.',
      confidence: 87,
    },
    navigation: {
      situation: 'User is requesting navigation from current location in Section E to the nearest accessible washroom. Section E concourse washrooms are at 85% queue capacity (10-min wait). Wheelchair route must avoid stairs.',
      reasoning: 'The nearest washroom to Section E (Floor 1) has a 10-minute wait. The Level 2 washrooms in Section F are accessible via elevator (EV-3) and currently have a 2-minute wait. Total travel time via elevator is 4 minutes, giving total time of 6 minutes vs 12 minutes for the closer option.',
      recommendation: 'Take elevator EV-3 (60m ahead, clearly marked with blue signage) to Level 2, then proceed 30m left to Section F washrooms. Accessible stalls are on the left side. Total time: approximately 6 minutes. Return the same way.',
      priority: 'Routine',
      estimatedImpact: 'Alternate route saves approximately 6 minutes. Elevator is fully operational and accessible.',
      confidence: 96,
    },
    announcement: {
      situation: 'Operations staff has requested an announcement regarding overcrowding at Gate B (North Lower Section A).',
      reasoning: 'The situation requires immediate fan communication in a tone that conveys urgency without causing panic. Multi-format output is needed for PA system, digital boards, and the FIFA app.',
      recommendation: 'Generated 4-format announcement package below. PA version uses calm, authoritative tone. SMS is under 160 characters. Social media includes relevant hashtags.',
      priority: 'Urgent',
      estimatedImpact: 'Effective announcements typically reduce target zone density by 15-25% within 10 minutes.',
      confidence: 90,
    },
    sustainability: {
      situation: "Fan arrived via FIFA Shuttle Bus (eco-score: 80/100) and used a digital ticket. Match attendance recorded. Post-match options include shuttle, metro, or rideshare.",
      reasoning: "Shuttle bus vs private car eliminates approximately 18kg CO2 per journey. Digital ticket eliminated paper waste. 2 water refill station uses detected via app check-ins.",
      recommendation: "Your eco choices today saved approximately 21kg CO2 and avoided 2 single-use plastic bottles. Post-match, taking the NJ Transit rail will save an additional 16kg CO2 vs rideshare. Refill station S4 in Section G is currently available with no queue.",
      priority: 'Routine',
      estimatedImpact: 'Your total eco impact today: 21kg CO2 saved, 2 plastic bottles avoided, 1 digital ticket used. Eco Champion tier status achieved.',
      confidence: 93,
    },
    volunteer: {
      situation: "3 critical volunteer tasks are currently unassigned. Crowd flow management at Gate 1 is the highest priority due to critical density levels. 12 volunteers are currently marked as available.",
      reasoning: "AI has matched available volunteer skills and current zone locations to outstanding tasks. Priority weighting considers task urgency, volunteer proximity, language skills, and crowd safety impact.",
      recommendation: "Assign Volunteer Chen (crowd management certified, currently Section C, 3min walk) to Gate 1 crowd flow task immediately. Assign Volunteer Priya (multilingual EN/HI/TA) to lost child search — parent may be Hindi-speaking. Assign Volunteers Smith & Okafor to concession queue management, East Lower.",
      priority: 'Urgent',
      estimatedImpact: 'Optimal assignment reduces response time from average 12 minutes to 4 minutes for current critical tasks.',
      confidence: 89,
    },
  };

  return responses[feature] || {
    situation: `AI analysis requested for: ${feature}`,
    reasoning: 'Analyzing current stadium conditions, crowd patterns, and contextual factors.',
    recommendation: 'Based on real-time data analysis, all systems are operating within normal parameters.',
    priority: 'Routine',
    estimatedImpact: 'Monitoring active. No immediate action required.',
    confidence: 85,
  };
}

// ---- API call with fallback ------------------------------------------------

async function callAI<T>(
  endpoint: string,
  payload: Record<string, unknown>,
  featureKey: string
): Promise<T> {
  try {
    const response = await apiClient.post<T>(endpoint, payload);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && (error.code === 'ECONNREFUSED' || error.response?.status === 503)) {
      // Backend unavailable — return rich mock
      console.warn(`[StadiumIQ] Backend unavailable, using mock AI response for: ${featureKey}`);
      return createMockAIResponse(featureKey) as T;
    }
    throw error;
  }
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
    return callAI<AIResponse>(
      API_ENDPOINTS.CROWD,
      { context, zoneId: zoneId ? sanitizeInput(zoneId) : undefined },
      'crowd'
    );
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
    return callAI<AIResponse>(
      API_ENDPOINTS.EMERGENCY,
      {
        incidentType,
        description: sanitizeInput(description),
        location: sanitizeInput(location),
        context,
      },
      'emergency'
    );
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
    return callAI<AIResponse>(
      API_ENDPOINTS.NAVIGATION,
      {
        destination: sanitizeInput(destination),
        fromSection: sanitizeInput(fromSection),
        isWheelchair,
        context,
      },
      'navigation'
    );
  },

  /**
   * Generate multi-format announcement
   */
  generateAnnouncement: async (
    request: AnnouncementRequest,
    context: AIRequestContext
  ): Promise<{ ai: AIResponse; output: AnnouncementOutput }> => {
    try {
      const response = await apiClient.post<{ ai: AIResponse; output: AnnouncementOutput }>(
        API_ENDPOINTS.ANNOUNCEMENT,
        { request: { ...request, situation: sanitizeInput(request.situation) }, context }
      );
      return response.data;
    } catch {
      const mockOutput: AnnouncementOutput = {
        pa: `Attention all guests: Due to high attendance levels, we kindly request fans with tickets for Sections A and E to temporarily use alternate entrance routes via Sections D and F. Stadium staff are available at all entrances to assist you. Thank you for your cooperation and enjoy the match.`,
        sms: `⚽ FIFA WC26: Gate B full. Use Gates D or F. Staff available to assist. Thank you! #FIFA2026`,
        socialMedia: `📢 Update for #FIFAWC2026 fans at MetLife: Sections A & E at capacity. Please use Sections D & F entrances — faster access & less wait! Our team is there to help 🏟 #FanExperience`,
        app: `Heads up! Section A & E entrances are busy right now. Staff are guiding fans to Section D & F for quicker entry. Tap for alternate route.`,
        translations: {
          en: `Please proceed to Sections D and F for faster entry.`,
          es: `Por favor diríjase a las Secciones D y F para una entrada más rápida.`,
          fr: `Veuillez vous diriger vers les Sections D et F pour une entrée plus rapide.`,
          ar: `يرجى التوجه إلى الأقسام D و F للدخول بشكل أسرع.`,
          pt: `Por favor, dirija-se às Seções D e F para entrada mais rápida.`,
          hi: `कृपया तेज़ प्रवेश के लिए सेक्शन D और F की ओर जाएं।`,
          ja: `DセクションとFセクションへお進みください。スムーズにご入場いただけます。`,
        },
      };
      return { ai: createMockAIResponse('announcement'), output: mockOutput };
    }
  },

  /**
   * Get transportation analysis and recommendations
   */
  analyzeTransport: async (
    destination: string,
    context: AIRequestContext
  ): Promise<AIResponse> => {
    return callAI<AIResponse>(
      API_ENDPOINTS.TRANSPORT,
      { destination: sanitizeInput(destination), context },
      'transport'
    );
  },

  /**
   * Get sustainability analysis for user
   */
  getSustainability: async (
    profile: Partial<SustainabilityProfile>,
    context: AIRequestContext
  ): Promise<AIResponse> => {
    return callAI<AIResponse>(
      API_ENDPOINTS.SUSTAINABILITY,
      { profile, context },
      'sustainability'
    );
  },

  /**
   * Get volunteer task assignment recommendations
   */
  assignVolunteerTasks: async (context: AIRequestContext): Promise<AIResponse> => {
    return callAI<AIResponse>(
      API_ENDPOINTS.VOLUNTEER,
      { context },
      'volunteer'
    );
  },

  /**
   * Generate structured incident report
   */
  generateIncidentReport: async (
    incidentId: string,
    context: AIRequestContext
  ): Promise<IncidentReport> => {
    try {
      const response = await apiClient.post<IncidentReport>(
        API_ENDPOINTS.INCIDENT_REPORT,
        { incidentId, context }
      );
      return response.data;
    } catch {
      return {
        id: `RPT-${Date.now()}`,
        incidentId,
        generatedAt: new Date().toISOString(),
        summary: 'Medical incident in Section E, Row 22. Fan experienced chest pain. Medical Team Alpha responded within 4 minutes via staff corridor. Patient stabilized on scene.',
        causeAnalysis: 'High heat index (32°C), prolonged standing in crowded zone, possible dehydration contributing factors. No structural or crowd management failure identified.',
        responseActions: [
          'Medical team dispatched within 2 minutes of report',
          'Staff corridor routing reduced ETA by 4 minutes',
          'AED standby activated at Station E2',
          'Crowd cleared 3-seat radius around patient',
          'Ambulance on standby via south vehicle gate',
        ],
        recommendations: [
          'Increase water distribution frequency in Section E (high density, high heat)',
          'Position additional first-aid volunteers in Zone E during halftime crush',
          'Review pre-match hydration awareness messaging in high-density zones',
        ],
        lessonsLearned: [
          'Staff corridor routing protocol proved effective — recommend standardizing for all high-density zones',
          'AED station density in East Lower is adequate',
        ],
      };
    }
  },

  /**
   * Translate text to target language
   */
  translate: async (
    text: string,
    targetLanguage: string
  ): Promise<string> => {
    try {
      const response = await apiClient.post<{ translation: string }>(
        API_ENDPOINTS.TRANSLATE,
        { text: sanitizeInput(text), targetLanguage }
      );
      return response.data.translation;
    } catch {
      return text; // Return original on failure
    }
  },
};
