
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, User } from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  limit,
  orderBy 
} from "firebase/firestore";

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
  // Ideally, use environment variables.
  if (process.env.FIREBASE_API_KEY) {
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
     console.warn("Firebase config missing. Auth features will be simulated or disabled.");
     app = initializeApp(firebaseConfig);
  }
  
  auth = getAuth(app);
  db = getFirestore(app);
  googleProvider = new GoogleAuthProvider();
} catch (e) {
  console.error("Firebase Initialization Error:", e);
}

export { auth, db };

export const signInWithGoogle = async () => {
  if (!auth) throw new Error("Firebase not initialized");
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Login failed", error);
    throw error;
  }
};

export const logoutUser = async () => {
  if (!auth) return;
  await signOut(auth);
};

// --- Firestore Helpers ---

const LOW_SCORE_COLLECTION = "low_score_sentences";

export const saveLowScoreSentence = async (userId: string, data: {
  vnSentence: string;
  topic: string;
  level: number;
  score: number;
}) => {
  if (!db) return;
  try {
    // Use the sentence itself as ID (base64 encoded to be safe) or just a hash
    // Simple approach: auto-id, but query by content. 
    // Better approach for deduplication: create a deterministic ID from the sentence
    const id = btoa(unescape(encodeURIComponent(data.vnSentence))).replace(/\//g, '_');
    
    await setDoc(doc(db, "users", userId, LOW_SCORE_COLLECTION, id), {
      vnSentence: data.vnSentence,
      topic: data.topic,
      level: data.level,
      lastScore: data.score,
      timestamp: Date.now()
    });
  } catch (e) {
    console.error("Error saving low score:", e);
  }
};

export const deleteReviewSentence = async (userId: string, vnSentence: string) => {
  if (!db) return;
  try {
    const id = btoa(unescape(encodeURIComponent(vnSentence))).replace(/\//g, '_');
    await deleteDoc(doc(db, "users", userId, LOW_SCORE_COLLECTION, id));
    console.log("Review sentence deleted/mastered:", vnSentence);
  } catch (e) {
    console.error("Error deleting review sentence:", e);
  }
};

export const fetchReviewSentence = async (userId: string): Promise<any | null> => {
  if (!db) return null;
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
    console.error("Error fetching review:", e);
    return null;
  }
};
