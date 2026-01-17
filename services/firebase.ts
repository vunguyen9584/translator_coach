
// Use wildcard imports and cast to any to avoid "Module has no exported member" errors
// which occur in some environments where Firebase types are not correctly resolved.
import * as firebaseApp from "firebase/app";
import * as firebaseAuth from "firebase/auth";
import * as firebaseFirestore from "firebase/firestore";
import { User } from "../types";

const { initializeApp } = firebaseApp as any;
const { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } = firebaseAuth as any;
const { 
  getFirestore, collection, doc, setDoc, deleteDoc, getDocs, query, where, limit, orderBy 
} = firebaseFirestore as any;

// TODO: REPLACE WITH YOUR OWN FIREBASE CONFIGURATION
// You can get this from the Firebase Console -> Project Settings -> General -> Your apps
const firebaseConfig = {
  apiKey: "AIzaSyCtTAhRz7PTnNA86GMJG9XISetUmdZ3LLk",
  authDomain: "lingocoach-71f0b.firebaseapp.com",
  projectId: "lingocoach-71f0b",
  storageBucket: "lingocoach-71f0b.firebasestorage.app",
  messagingSenderId: "963480789489",
  appId: "1:963480789489:web:74910f40602dff2c012450"
};

// Initialize Firebase only if config is valid (prevent crash on placeholder)
let app;
let auth: any;
let db: any;
let googleProvider: any;

try {
  // Check if we are in a "demo" mode or if the user hasn't set up keys yet.
  // We check typeof process to avoid ReferenceError in browser environments without polyfills
  const hasEnv = typeof process !== 'undefined' && process.env;
  
  if (hasEnv && process.env.FIREBASE_API_KEY) {
     const envConfig = {
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID
     }
     app = initializeApp(envConfig);
  } else {
     // Fallback for demo purposes if no env vars (won't actually connect)
     console.warn("Using default/placeholder Firebase config.");
     app = initializeApp(firebaseConfig);
  }
  
  auth = getAuth(app);
  db = getFirestore(app);
  googleProvider = new GoogleAuthProvider();
} catch (e) {
  console.error("Firebase Initialization Error:", e);
}

export { auth, db };

// Mock user generator
const createMockUser = (): User => {
  return {
    uid: 'mock-user-' + Date.now(),
    displayName: 'Demo User',
    email: 'demo@lingocoach.com',
    photoURL: 'https://ui-avatars.com/api/?name=Demo+User&background=random',
  } as User;
};

// EXPORT THIS FUNCTION SO UI CAN CALL IT DIRECTLY
export const loginAsDemoUser = async (): Promise<User> => {
  return createMockUser();
};

export const signInWithGoogle = async (): Promise<User | null> => {
  if (!auth || !googleProvider) {
    console.warn("Firebase not initialized. Returning mock user.");
    return createMockUser();
  }
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    // IMPORTANT: We now throw the error so the UI can decide what to do
    // instead of silently falling back to demo user.
    console.error("Login failed", error);
    throw error;
  }
};

export const logoutUser = async () => {
  if (!auth) return;
  try {
    await signOut(auth);
  } catch (e) {
    console.error("Logout error", e);
  }
};

export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  if (auth && onAuthStateChanged) {
    return onAuthStateChanged(auth, callback);
  }
  // If auth is not active, just return null user
  callback(null);
  return () => {};
};

// --- Firestore Helpers ---

const LOW_SCORE_COLLECTION = "low_score_sentences";

export const saveLowScoreSentence = async (userId: string, data: {
  vnSentence: string;
  topic: string;
  level: number;
  score: number;
}) => {
  if (!db || userId.startsWith('mock-user')) return; // Skip DB for mock users
  try {
    const id = btoa(unescape(encodeURIComponent(data.vnSentence))).replace(/\//g, '_');
    
    await setDoc(doc(db, "users", userId, LOW_SCORE_COLLECTION, id), {
      vnSentence: data.vnSentence,
      topic: data.topic,
      level: data.level,
      lastScore: data.score,
      timestamp: Date.now()
    });
  } catch (e) {
    // Silent fail for demo/mock
    if (userId.startsWith('mock-user')) return;
    console.error("Error saving low score:", e);
  }
};

export const deleteReviewSentence = async (userId: string, vnSentence: string) => {
  if (!db || userId.startsWith('mock-user')) return;
  try {
    const id = btoa(unescape(encodeURIComponent(vnSentence))).replace(/\//g, '_');
    await deleteDoc(doc(db, "users", userId, LOW_SCORE_COLLECTION, id));
    console.log("Review sentence deleted/mastered:", vnSentence);
  } catch (e) {
     // Silent fail for demo/mock
    if (userId.startsWith('mock-user')) return;
    console.error("Error deleting review sentence:", e);
  }
};

export const fetchReviewSentence = async (userId: string): Promise<any | null> => {
  if (!db || userId.startsWith('mock-user')) return null;
  try {
    const q = query(
      collection(db, "users", userId, LOW_SCORE_COLLECTION),
      orderBy("timestamp", "asc"), // Oldest mistakes first
      limit(1)
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data();
    }
    return null;
  } catch (e) {
     // Silent fail for demo/mock
    if (userId.startsWith('mock-user')) return null;
    console.error("Error fetching review:", e);
    return null;
  }
};
