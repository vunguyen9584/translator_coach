
export enum DifficultyLevel {
  BEGINNER = 1,
  INTERMEDIATE = 5,
  PROFICIENCY = 10
}

export const TOPICS = [
  "Random (Mix)",
  "Daily Routines",
  "Family & Home Life",
  "Food & Cooking",
  "Travel & Adventure",
  "Shopping & Fashion",
  "Health & Fitness",
  "Job & Career",
  "Business & Finance",
  "Technology & Innovation",
  "Social Media & Internet",
  "Movies, Music & Arts",
  "Education & Learning",
  "Sports & Competition",
  "Nature & Environment",
  "Relationships & Feelings",
  "Culture & Traditions",
  "Science & Discovery",
  "News & Current Events",
  "History & Past Events",
  "Weather & Seasons",
  "Dreams & Ambitions",
  "Transport & Commuting",
  "Celebrations & Holidays"
];

export interface FeedbackData {
  score: number;
  analysis: string;
  betterVersion: string;
  markedUserTranslation?: string;
  alternative?: string;
  extractedVocab: { word: string; meaning: string }[];
  grammarPoints: string[];
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  vnSentence: string;
  userTranslation: string;
  feedback: FeedbackData;
  level: number;
  topic?: string;
  isReview?: boolean; // New field to track if this was a review session
}

export interface VocabItem {
  word: string;
  meaning: string;
  count: number;
  lastSeen: number;
}

export interface GrammarItem {
  point: string;
  count: number;
  lastSeen: number;
}

// Data structure for sentences stored in Firestore
export interface ReviewSentence {
  id: string; // usually the vnSentence string or a hash
  vnSentence: string;
  topic: string;
  level: number;
  lastScore: number;
  timestamp: number;
}

export interface AppState {
  currentLevel: number;
  currentTopic: string;
  history: HistoryItem[];
  vocabBank: Record<string, VocabItem>;
  grammarBank: Record<string, GrammarItem>;
  // Logic for token optimization and review
  recentSentences: string[]; // Store last 100 sentences locally to avoid repetition
  sentencesSinceLastReview: number;
  nextReviewThreshold: number; // Random number between 5-15
}

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}
