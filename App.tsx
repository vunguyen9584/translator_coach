
import React, { useState, useEffect, useCallback } from 'react';
import { HistoryItem, AppState, VocabItem, GrammarItem, FeedbackData, TOPICS, User } from './types';
import { generateSentence, analyzeTranslation } from './services/geminiService';
import { 
  signInWithGoogle, 
  logoutUser, 
  loginAsDemoUser,
  auth, 
  saveLowScoreSentence, 
  fetchReviewSentence, 
  deleteReviewSentence,
  subscribeToAuthChanges
} from './services/firebase';

import Sidebar from './components/Sidebar';
import Header from './components/Header';
import PracticeArea from './components/PracticeArea';
import Dashboard from './components/Dashboard';
import AuthErrorModal from './components/AuthErrorModal';

const STORAGE_KEY = 'lingo_coach_state_v2';

const App: React.FC = () => {
  // --- Auth State ---
  const [user, setUser] = useState<User | null>(null);
  const [showAuthError, setShowAuthError] = useState(false);

  // --- App Logic State ---
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : null;
    return parsed ? {
      ...parsed,
      currentTopic: parsed.currentTopic || TOPICS[0],
      // Initialize new fields if they don't exist
      recentSentences: parsed.recentSentences || [],
      sentencesSinceLastReview: parsed.sentencesSinceLastReview || 0,
      nextReviewThreshold: parsed.nextReviewThreshold || 5, 
    } : {
      currentLevel: 1,
      currentTopic: TOPICS[0],
      history: [],
      vocabBank: {},
      grammarBank: {},
      recentSentences: [],
      sentencesSinceLastReview: 0,
      nextReviewThreshold: 5,
    };
  });

  const [view, setView] = useState<'practice' | 'stats'>('practice');
  const [currentVnSentence, setCurrentVnSentence] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Track if current sentence is a review sentence from Firebase
  const [isReviewMode, setIsReviewMode] = useState<boolean>(false);

  // --- Effects ---

  // Auth Listener
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((currentUser) => {
      // Only set user if we haven't manually set a mock user (which might trigger null here first if real auth isn't connected)
      // However, usually onAuthStateChanged is the source of truth.
      if (currentUser) {
        setUser(currentUser);
      }
    });
    return () => unsubscribe();
  }, []);

  // Persistence
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Initial Load (Only if empty)
  useEffect(() => {
    if (!currentVnSentence && view === 'practice' && !isLoading) {
      handleNextSentence();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  // --- Methods ---

  const handleLogin = async () => {
    try {
      const loggedInUser = await signInWithGoogle();
      if (loggedInUser) {
        setUser(loggedInUser);
      }
    } catch (e: any) {
      const errorCode = e?.code;
      console.error("Login Error in App", e);

      // Check specifically for domain errors or operation not allowed
      if (errorCode === 'auth/unauthorized-domain' || errorCode === 'auth/operation-not-allowed') {
        setShowAuthError(true);
      } else {
        alert("Login failed: " + (e.message || "Unknown error"));
      }
    }
  };

  const handleDemoLogin = async () => {
    const demoUser = await loginAsDemoUser();
    setUser(demoUser);
    setShowAuthError(false);
  };

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
  };

  const fetchNewSentence = useCallback(async (level: number, topic: string) => {
    setIsLoading(true);
    setFeedback(null);
    setIsReviewMode(false);
    
    try {
      // Token Optimization: Pass exclude list
      // We take the last 50 items to keep prompt size reasonable
      const excludeList = state.recentSentences.slice(0, 50);
      const sentence = await generateSentence(level, topic, excludeList);
      setCurrentVnSentence(sentence);
    } catch (error) {
      console.error(error);
      alert("Failed to fetch sentence. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [state.recentSentences]);

  const handleNextSentence = useCallback(async () => {
    // Logic: Check if we should review a low-score sentence
    const shouldReview = 
      user && // Must be logged in
      state.sentencesSinceLastReview >= state.nextReviewThreshold;

    if (shouldReview) {
      setIsLoading(true);
      setFeedback(null);
      try {
        const reviewData = await fetchReviewSentence(user.uid);
        
        if (reviewData) {
          setIsReviewMode(true);
          setCurrentVnSentence(reviewData.vnSentence);
          // If the review sentence is a different level/topic, that's okay, 
          // it's a review. But we could update UI to show "Review Mode"
          setIsLoading(false);
          return; // Done
        } else {
          // No review items found, proceed to normal generation
          // Reset counter so we don't query empty DB every time
          setState(prev => ({
            ...prev,
            sentencesSinceLastReview: 0,
            nextReviewThreshold: Math.floor(Math.random() * 11) + 5 // Random 5-15
          }));
        }
      } catch (e) {
        console.error("Review fetch error", e);
      }
    }

    // Normal Flow
    fetchNewSentence(state.currentLevel, state.currentTopic);

  }, [user, state.sentencesSinceLastReview, state.nextReviewThreshold, state.currentLevel, state.currentTopic, fetchNewSentence]);

  const handleSubmitTranslation = async (userTranslation: string) => {
    setIsLoading(true);
    try {
      const result = await analyzeTranslation(currentVnSentence, userTranslation, state.currentLevel);
      setFeedback(result);

      // --- Firebase Sync Logic ---
      if (user) {
        // 1. If score < 80, save to Firebase
        if (result.score < 80) {
          await saveLowScoreSentence(user.uid, {
            vnSentence: currentVnSentence,
            topic: state.currentTopic,
            level: state.currentLevel,
            score: result.score
          });
        }
        // 2. If score == 100 and it WAS a review (or just check existence), delete it
        // We delete if score is perfect to "graduate" the sentence
        if (result.score === 100) {
           await deleteReviewSentence(user.uid, currentVnSentence);
        }
      }

      // --- State Update ---
      setState(prev => {
        const newHistoryItem: HistoryItem = {
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          vnSentence: currentVnSentence,
          userTranslation,
          feedback: result,
          level: prev.currentLevel,
          topic: prev.currentTopic,
          isReview: isReviewMode,
        };

        // Update Vocab Bank
        const newVocabBank = { ...prev.vocabBank };
        result.extractedVocab.forEach(v => {
          const key = v.word.toLowerCase();
          if (newVocabBank[key]) {
            newVocabBank[key].count += 1;
            newVocabBank[key].lastSeen = Date.now();
          } else {
            newVocabBank[key] = { word: v.word, meaning: v.meaning, count: 1, lastSeen: Date.now() };
          }
        });

        // Update Grammar Bank
        const newGrammarBank = { ...prev.grammarBank };
        result.grammarPoints.forEach(p => {
          const key = p.toLowerCase();
          if (newGrammarBank[key]) {
            newGrammarBank[key].count += 1;
            newGrammarBank[key].lastSeen = Date.now();
          } else {
            newGrammarBank[key] = { point: p, count: 1, lastSeen: Date.now() };
          }
        });

        // Update Recent Sentences (for anti-repetition)
        // Keep only last 100
        const newRecent = [currentVnSentence, ...prev.recentSentences].slice(0, 100);

        // Update Review Logic
        // If we just did a review, reset counter. If normal, increment.
        const newCounter = isReviewMode ? 0 : prev.sentencesSinceLastReview + 1;
        // If we just reset, calculate new threshold. Else keep same.
        const newThreshold = isReviewMode 
          ? Math.floor(Math.random() * 11) + 5 // Random 5-15
          : prev.nextReviewThreshold;

        return {
          ...prev,
          history: [newHistoryItem, ...prev.history],
          vocabBank: newVocabBank,
          grammarBank: newGrammarBank,
          recentSentences: newRecent,
          sentencesSinceLastReview: newCounter,
          nextReviewThreshold: newThreshold,
        };
      });

    } catch (error) {
      console.error(error);
      alert("Analysis failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLevelChange = (newLevel: number) => {
    setState(prev => ({ ...prev, currentLevel: newLevel }));
    setIsMobileMenuOpen(false);
    if (view === 'practice') {
        setCurrentVnSentence('');
        setFeedback(null);
        setTimeout(() => fetchNewSentence(newLevel, state.currentTopic), 10);
    }
  };

  const handleTopicChange = (newTopic: string) => {
    setState(prev => ({ ...prev, currentTopic: newTopic }));
    setCurrentVnSentence('');
    setFeedback(null);
    setIsMobileMenuOpen(false);
    setTimeout(() => fetchNewSentence(state.currentLevel, newTopic), 10);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar 
        currentView={view} 
        onViewChange={setView} 
        currentLevel={state.currentLevel} 
        onLevelChange={handleLevelChange}
        currentTopic={state.currentTopic}
        onTopicChange={handleTopicChange}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
      
      <main className="flex-1 flex flex-col h-full overflow-hidden relative transition-all duration-300">
        <Header 
          history={state.history} 
          vocabCount={Object.keys(state.vocabBank).length} 
          onMenuClick={() => setIsMobileMenuOpen(true)}
          user={user}
          onLogin={handleLogin}
          onLogout={handleLogout}
        />
        
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {view === 'practice' ? (
            <PracticeArea 
              vnSentence={currentVnSentence}
              isLoading={isLoading}
              onSubmit={handleSubmitTranslation}
              feedback={feedback}
              onNext={handleNextSentence}
              onLevelChange={handleLevelChange}
              currentLevel={state.currentLevel}
              isReviewMode={isReviewMode}
            />
          ) : (
            <Dashboard 
              history={state.history} 
              vocabBank={state.vocabBank} 
              grammarBank={state.grammarBank}
            />
          )}
        </div>
        
        {/* Domain Error Modal */}
        <AuthErrorModal 
          isOpen={showAuthError} 
          onClose={() => setShowAuthError(false)}
          onDemoLogin={handleDemoLogin}
        />
      </main>
    </div>
  );
};

export default App;
