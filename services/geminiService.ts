import { getFunctions, httpsCallable } from "firebase/functions";
import { FeedbackData } from "../types";
import { app } from "./firebase";

// Initialize Firebase Functions with Asia Southeast region
// This matches the region where our Cloud Functions are deployed
const functions = getFunctions(app, "asia-southeast1");

/**
 * Generate a Vietnamese sentence for translation practice
 * Now calls Cloud Function instead of direct Gemini API
 * 
 * @param level - Difficulty level (1-10)
 * @param topic - Topic for the sentence
 * @param avoidSentences - Array of sentences to avoid generating
 * @returns Vietnamese sentence string
 */
export async function generateSentence(
  level: number,
  topic: string,
  avoidSentences: string[] = []
): Promise<string> {
  try {
    const generateSentenceCallable = httpsCallable<
      { level: number; topic: string; avoidSentences?: string[] },
      { sentence: string }
    >(functions, "generateSentence");

    const result = await generateSentenceCallable({
      level,
      topic,
      avoidSentences: avoidSentences.slice(0, 20), // Limit to last 20
    });

    return result.data.sentence;
  } catch (error: any) {
    console.error("Error calling generateSentence Cloud Function:", error);

    // Provide user-friendly error messages
    if (error.code === "functions/unauthenticated") {
      throw new Error("Bạn cần đăng nhập để sử dụng tính năng này");
    } else if (error.code === "functions/invalid-argument") {
      throw new Error("Thông tin không hợp lệ. Vui lòng kiểm tra lại.");
    } else if (error.code === "functions/internal") {
      throw new Error("Lỗi hệ thống. Vui lòng thử lại sau.");
    }

    throw new Error("Không thể tạo câu mới. Vui lòng thử lại.");
  }
}

/**
 * Analyze user's translation
 * Now calls Cloud Function instead of direct Gemini API
 * 
 * @param vnSentence - Original Vietnamese sentence
 * @param userTranslation - User's English translation
 * @param level - Difficulty level
 * @returns Detailed feedback data
 */
export async function analyzeTranslation(
  vnSentence: string,
  userTranslation: string,
  level: number
): Promise<FeedbackData> {
  try {
    const analyzeTranslationCallable = httpsCallable<
      { vnSentence: string; userTranslation: string; level: number },
      FeedbackData
    >(functions, "analyzeTranslation");

    const result = await analyzeTranslationCallable({
      vnSentence,
      userTranslation,
      level,
    });

    return result.data;
  } catch (error: any) {
    console.error("Error calling analyzeTranslation Cloud Function:", error);

    // Provide user-friendly error messages
    if (error.code === "functions/unauthenticated") {
      throw new Error("Bạn cần đăng nhập để sử dụng tính năng này");
    } else if (error.code === "functions/invalid-argument") {
      throw new Error("Thông tin không hợp lệ. Vui lòng kiểm tra lại.");
    } else if (error.code === "functions/internal") {
      throw new Error("Lỗi phân tích. Vui lòng thử lại sau.");
    }

    throw new Error("Không thể phân tích bản dịch. Vui lòng thử lại.");
  }
}
