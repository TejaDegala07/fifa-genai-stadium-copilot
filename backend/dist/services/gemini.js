"use strict";
// =============================================================================
// GEMINI AI SERVICE
// =============================================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.callGemini = callGemini;
const generative_ai_1 = require("@google/generative-ai");
const logger_1 = require("../utils/logger");
const API_KEY = process.env.GEMINI_API_KEY || '';
const MODEL_NAME = 'gemini-2.0-flash';
let genAI = null;
if (API_KEY) {
    genAI = new generative_ai_1.GoogleGenerativeAI(API_KEY);
}
const SAFETY_SETTINGS = [
    { category: generative_ai_1.HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: generative_ai_1.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: generative_ai_1.HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: generative_ai_1.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: generative_ai_1.HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: generative_ai_1.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: generative_ai_1.HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: generative_ai_1.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];
const SYSTEM_CONTEXT = `You are StadiumIQ, an expert AI Stadium Intelligence Copilot for FIFA World Cup 2026 at MetLife Stadium.
You must analyze raw telemetry, crowd conditions, and emergencies to provide specific, actionable intelligence.
Do not provide generic advice. All recommendations must be practical and tailored to the specific stadium environment.
Maintain a professional and calm tone at all times.`;
const standardResponseSchema = {
    type: generative_ai_1.SchemaType.OBJECT,
    properties: {
        situation: { type: generative_ai_1.SchemaType.STRING, description: "One paragraph describing the current situation factually" },
        reasoning: { type: generative_ai_1.SchemaType.STRING, description: "One paragraph explaining your analytical reasoning" },
        recommendation: { type: generative_ai_1.SchemaType.STRING, description: "One paragraph with specific, actionable recommendations" },
        priority: { type: generative_ai_1.SchemaType.STRING, description: "One of: Routine | Attention Required | Urgent | Critical - Immediate Action" },
        estimatedImpact: { type: generative_ai_1.SchemaType.STRING, description: "One sentence describing expected outcome if recommendation is followed" },
        confidence: { type: generative_ai_1.SchemaType.INTEGER, description: "Integer from 0 to 100 representing confidence in analysis" },
        actions: {
            type: generative_ai_1.SchemaType.ARRAY,
            description: "List of 1 to 3 specific actions to take",
            items: {
                type: generative_ai_1.SchemaType.OBJECT,
                properties: {
                    id: { type: generative_ai_1.SchemaType.STRING, description: "Unique action ID (e.g. action-dispatch-med)" },
                    label: { type: generative_ai_1.SchemaType.STRING, description: "Button label for the action" },
                    description: { type: generative_ai_1.SchemaType.STRING, description: "Detailed description of what the action does" },
                    urgency: { type: generative_ai_1.SchemaType.STRING, description: "low | medium | high | critical" }
                },
                required: ["id", "label", "description", "urgency"]
            }
        }
    },
    required: ["situation", "reasoning", "recommendation", "priority", "estimatedImpact", "confidence", "actions"]
};
// ---- Main call function using Structured Outputs ---------------------------
async function callGemini(userPrompt, customSchema) {
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
    }
    catch (err) {
        logger_1.logger.error('Gemini API call failed', { error: err });
        throw err;
    }
}
//# sourceMappingURL=gemini.js.map