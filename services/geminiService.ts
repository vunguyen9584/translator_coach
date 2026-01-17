
import { GoogleGenAI, Type } from "@google/genai";
import { FeedbackData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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

// Stateless generation
export async function generateSentence(
  level: number, 
  topic: string, 
  avoidSentences: string[] = []
): Promise<string> {
  
  const topicInstruction = topic === "Random (Mix)" 
    ? "Topic: Random (Pick a specific, interesting topic)"
    : `Topic: ${topic}`;

  // We limit the avoidance list to the last 20 to save input tokens, 
  // relying on the model's randomness for older items.
  const recentAvoidance = avoidSentences.slice(0, 20);
  const avoidanceInstruction = recentAvoidance.length > 0
    ? `IMPORTANT: DO NOT generate any of the following sentences: ${JSON.stringify(recentAvoidance)}`
    : "";

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION_BASE,
      temperature: 0.9, // Higher temperature for variety since we are stateless
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
    } catch (e) {}
  }

  return text.replace(/\*\*/g, '').replace(/^["']|["']$/g, '').trim();
}

export async function analyzeTranslation(
  vnSentence: string, 
  userTranslation: string, 
  level: number
): Promise<FeedbackData> {
  
  // Stateless call - we send the context (vnSentence) again.
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
        required: ["score", "analysis", "markedUserTranslation", "betterVersion", "alternative", "extractedVocab", "grammarPoints"],
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

  try {
    const text = response.text?.trim();
    if (!text) throw new Error("Empty response");
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse AI response", e);
    throw new Error("Failed to analyze translation");
  }
}
