// =============================================================================
// GEMINI AI SERVICE
// =============================================================================

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, SchemaType, ResponseSchema } from '@google/generative-ai';
import { logger } from '../utils/logger';

const API_KEY = process.env.GEMINI_API_KEY || '';
const MODEL_NAME = 'gemini-2.0-flash';

let genAI: GoogleGenerativeAI | null = null;

if (API_KEY) {
  genAI = new GoogleGenerativeAI(API_KEY);
}

const SAFETY_SETTINGS = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

const SYSTEM_CONTEXT = `You are StadiumIQ, an expert AI Stadium Intelligence Copilot for FIFA World Cup 2026 at MetLife Stadium.
You must analyze raw telemetry, crowd conditions, and emergencies to provide specific, actionable intelligence.
Do not provide generic advice. All recommendations must be practical and tailored to the specific stadium environment.
Maintain a professional and calm tone at all times.`;

const standardResponseSchema: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    situation: { type: SchemaType.STRING, description: "One paragraph describing the current situation factually" },
    reasoning: { type: SchemaType.STRING, description: "One paragraph explaining your analytical reasoning" },
    recommendation: { type: SchemaType.STRING, description: "One paragraph with specific, actionable recommendations" },
    priority: { type: SchemaType.STRING, description: "One of: Routine | Attention Required | Urgent | Critical - Immediate Action" },
    estimatedImpact: { type: SchemaType.STRING, description: "One sentence describing expected outcome if recommendation is followed" },
    confidence: { type: SchemaType.INTEGER, description: "Integer from 0 to 100 representing confidence in analysis" },
    actions: {
      type: SchemaType.ARRAY,
      description: "List of 1 to 3 specific actions to take",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          id: { type: SchemaType.STRING, description: "Unique action ID (e.g. action-dispatch-med)" },
          label: { type: SchemaType.STRING, description: "Button label for the action" },
          description: { type: SchemaType.STRING, description: "Detailed description of what the action does" },
          urgency: { type: SchemaType.STRING, description: "low | medium | high | critical" }
        },
        required: ["id", "label", "description", "urgency"]
      }
    }
  },
  required: ["situation", "reasoning", "recommendation", "priority", "estimatedImpact", "confidence", "actions"]
};

// ---- Main call function using Structured Outputs ---------------------------

export async function callGemini(
  userPrompt: string, 
  customSchema?: ResponseSchema
): Promise<Record<string, unknown>> {
  if (!genAI) {
    throw new Error('Gemini API key not configured');
  }

  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    safetySettings: SAFETY_SETTINGS,
    systemInstruction: SYSTEM_CONTEXT,
    generationConfig: {
      temperature: 0.2, // Lower temperature for more factual responses
      topK: 40,
      topP: 0.95,
      responseMimeType: "application/json",
      responseSchema: customSchema || standardResponseSchema,
    },
  });

  try {
    const result = await model.generateContent(userPrompt);
    const textResponse = result.response.text();
    // Since responseMimeType is application/json, it is guaranteed to be JSON
    return JSON.parse(textResponse);
  } catch (err) {
    logger.error('Gemini API call failed', { error: err });
    throw err;
  }
}
