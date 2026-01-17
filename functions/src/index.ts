import * as functions from "firebase-functions";
import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini AI with API key from environment
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || ""
});

const SYSTEM_INSTRUCTION_BASE = `
Act as an Expert English Translation Coach for Vietnamese learners. 
Goal: Help improve Vietnamese-to-English translation skills.

RULES:
1. Difficulty Levels: 1 (Beginner) to 10 (Proficiency).
2. Process: Generate a VN sentence -> Wait for translation -> Analyze -> Provide Feedback.
3. LANGUAGE RULES:
   - "analysis": Write in Vietnamese to explain nuances and errors clearly to the learner.
   - "betterVersion": MUST be in English. It's the most natural/correct translation.
   - "alternative": MUST be in English. It's another valid English way to express the same idea.
   - "extractedVocab": "word" (English), "meaning" (Vietnamese).
   - "grammarPoints": English grammatical terms/rules.
4. Tone: Professional, encouraging, and pedagogically sound.
`;

// Interface definitions
interface GenerateSentenceRequest {
    level: number;
    topic: string;
    avoidSentences?: string[];
}

interface AnalyzeTranslationRequest {
    vnSentence: string;
    userTranslation: string;
    level: number;
}

interface FeedbackData {
    score: number;
    analysis: string;
    markedUserTranslation: string;
    betterVersion: string;
    alternative: string;
    extractedVocab: Array<{ word: string; meaning: string }>;
    grammarPoints: string[];
}

/**
 * Cloud Function: Generate a Vietnamese sentence for translation practice
 * 
 * HTTP POST endpoint that accepts:
 * - level: number (1-10)
 * - topic: string
 * - avoidSentences: string[] (optional)
 * 
 * Returns: { sentence: string }
 */
export const generateSentence = functions
    .region("asia-southeast1") // Choose region closest to your users
    .https.onCall(async (data: GenerateSentenceRequest, context) => {
        // Optional: Verify authentication
        // if (!context.auth) {
        //   throw new functions.https.HttpsError(
        //     "unauthenticated",
        //     "User must be authenticated"
        //   );
        // }

        const { level, topic, avoidSentences = [] } = data;

        // Validate input
        if (!level || level < 1 || level > 10) {
            throw new functions.https.HttpsError(
                "invalid-argument",
                "Level must be between 1 and 10"
            );
        }

        if (!topic) {
            throw new functions.https.HttpsError(
                "invalid-argument",
                "Topic is required"
            );
        }

        try {
            const topicInstruction = topic === "Random (Mix)"
                ? "Topic: Random (Pick a specific, interesting topic)"
                : `Topic: ${topic}`;

            // Limit avoidance list to last 20 sentences
            const recentAvoidance = avoidSentences.slice(0, 20);
            const avoidanceInstruction = recentAvoidance.length > 0
                ? `IMPORTANT: DO NOT generate any of the following sentences: ${JSON.stringify(recentAvoidance)}`
                : "";

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                config: {
                    systemInstruction: SYSTEM_INSTRUCTION_BASE,
                    temperature: 0.9,
                },
                contents: {
                    parts: [
                        {
                            text: `ACTION: Generate a single new, unique Vietnamese sentence at Level ${level}.
              ${topicInstruction}
              ${avoidanceInstruction}
              Ensure it is natural and context-rich.
              Return ONLY the Vietnamese sentence text.`
                        }
                    ]
                }
            });

            let text = response.text?.trim() || "";

            // Cleanup JSON or Markdown artifacts if any
            if (text.startsWith('{') || text.includes('"')) {
                try {
                    const jsonMatch = text.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        const parsed = JSON.parse(jsonMatch[0]);
                        text = parsed.vietnamese_sentence || parsed.sentence || text;
                    }
                } catch (e) {
                    // Ignore parsing errors
                }
            }

            const cleanedText = text.replace(/\*\*/g, '').replace(/^["']|["']$/g, '').trim();

            return { sentence: cleanedText };

        } catch (error: any) {
            console.error("Error generating sentence:", error);
            throw new functions.https.HttpsError(
                "internal",
                "Failed to generate sentence",
                error.message
            );
        }
    });

/**
 * Cloud Function: Analyze user's translation
 * 
 * HTTP POST endpoint that accepts:
 * - vnSentence: string
 * - userTranslation: string
 * - level: number (1-10)
 * 
 * Returns: FeedbackData
 */
export const analyzeTranslation = functions
    .region("asia-southeast1")
    .https.onCall(async (data: AnalyzeTranslationRequest, context) => {
        // Optional: Verify authentication
        // if (!context.auth) {
        //   throw new functions.https.HttpsError(
        //     "unauthenticated",
        //     "User must be authenticated"
        //   );
        // }

        const { vnSentence, userTranslation, level } = data;

        // Validate input
        if (!vnSentence || !userTranslation) {
            throw new functions.https.HttpsError(
                "invalid-argument",
                "Vietnamese sentence and user translation are required"
            );
        }

        if (!level || level < 1 || level > 10) {
            throw new functions.https.HttpsError(
                "invalid-argument",
                "Level must be between 1 and 10"
            );
        }

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                config: {
                    systemInstruction: SYSTEM_INSTRUCTION_BASE,
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            score: {
                                type: Type.NUMBER,
                                description: "Score from 0 to 100 based on accuracy and naturalness."
                            },
                            analysis: {
                                type: Type.STRING,
                                description: "Explanation of errors or praise in Vietnamese."
                            },
                            markedUserTranslation: {
                                type: Type.STRING,
                                description: "Return the User's exact translation string, but wrap any incorrect, unnatural, or grammatically wrong words/phrases in double brackets like [[wrong word]]. If the sentence is perfect, return it unchanged."
                            },
                            betterVersion: {
                                type: Type.STRING,
                                description: "The most natural English translation."
                            },
                            alternative: {
                                type: Type.STRING,
                                description: "Another valid English phrasing (NOT Vietnamese)."
                            },
                            extractedVocab: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        word: { type: Type.STRING, description: "The English word." },
                                        meaning: { type: Type.STRING, description: "The Vietnamese meaning." }
                                    },
                                    required: ["word", "meaning"]
                                }
                            },
                            grammarPoints: {
                                type: Type.ARRAY,
                                items: { type: Type.STRING, description: "Grammar rules used in English." }
                            }
                        },
                        required: [
                            "score",
                            "analysis",
                            "markedUserTranslation",
                            "betterVersion",
                            "alternative",
                            "extractedVocab",
                            "grammarPoints"
                        ],
                    }
                },
                contents: {
                    parts: [{
                        text: `
              SOURCE VN: "${vnSentence}"
              USER EN TRANSLATION: "${userTranslation}"
              Difficulty Level: ${level}
              
              Provide feedback. Remember: "betterVersion" and "alternative" MUST BE ENGLISH.
            `
                    }]
                }
            });

            const text = response.text?.trim();
            if (!text) {
                throw new Error("Empty response from AI");
            }

            const feedback: FeedbackData = JSON.parse(text);
            return feedback;

        } catch (error: any) {
            console.error("Error analyzing translation:", error);
            throw new functions.https.HttpsError(
                "internal",
                "Failed to analyze translation",
                error.message
            );
        }
    });
