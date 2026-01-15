
import React, { useState, useEffect, useCallback } from 'react';
import { HistoryItem, AppState, VocabItem, GrammarItem, FeedbackData, TOPICS } from './types';
import { generateSentence, analyzeTranslation, resetChatSession } from './services/geminiService';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import PracticeArea from './components/PracticeArea';
import Dashboard from './components/Dashboard';

const STORAGE_KEY = 'lingo_coach_state_v1';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : null;
    return parsed ? {
      ...parsed,
      currentTopic: parsed.currentTopic || TOPICS[0] // Ensure backward compatibility
    } : {
      currentLevel: 1,
      currentTopic: TOPICS[0],
      history: [],
      vocabBank: {},
      grammarBank: {},
    };
  });

  const [view, setView] = useState<'practice' | 'stats'>('practice');
  const [currentVnSentence, setCurrentVnSentence] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Persistence
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const fetchNewSentence = useCallback(async (level: number, topic: string) => {
    setIsLoading(true);
    setFeedback(null);
    try {
      const sentence = await generateSentence(level, topic);
      setCurrentVnSentence(sentence);
    } catch (error) {
      console.error(error);
      alert("Failed to fetch sentence. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!currentVnSentence && view === 'practice') {
      fetchNewSentence(state.currentLevel, state.currentTopic);
    }
  }, [state.currentLevel, state.currentTopic, currentVnSentence, view, fetchNewSentence]);

  const handleLevelChange = async (newLevel: number) => {
    await resetChatSession();
    setState(prev => ({ ...prev, currentLevel: newLevel }));
    setCurrentVnSentence('');
    setFeedback(null);
    setIsMobileMenuOpen(false); // Close menu on mobile selection
  };

  const handleTopicChange = async (newTopic: string) => {
    setState(prev => ({ ...prev, currentTopic: newTopic }));
    setCurrentVnSentence('');
    setFeedback(null);
    setIsMobileMenuOpen(false); // Close menu on mobile selection
  };

  const handleViewChange = (newView: 'practice' | 'stats') => {
    setView(newView);
    setIsMobileMenuOpen(false); // Close menu on mobile selection
  }

  const handleSubmitTranslation = async (userTranslation: string) => {
    setIsLoading(true);
    try {
      const result = await analyzeTranslation(currentVnSentence, userTranslation, state.currentLevel);
      setFeedback(result);

      // Update State
      setState(prev => {
        const newHistoryItem: HistoryItem = {
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          vnSentence: currentVnSentence,
          userTranslation,
          feedback: result,
          level: prev.currentLevel,
          topic: prev.currentTopic,
        };

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

        return {
          ...prev,
          history: [newHistoryItem, ...prev.history],
          vocabBank: newVocabBank,
          grammarBank: newGrammarBank,
        };
      });

    } catch (error) {
      console.error(error);
      alert("Analysis failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    fetchNewSentence(state.currentLevel, state.currentTopic);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar 
        currentView={view} 
        onViewChange={handleViewChange} 
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
        />
        
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {view === 'practice' ? (
            <PracticeArea 
              vnSentence={currentVnSentence}
              isLoading={isLoading}
              onSubmit={handleSubmitTranslation}
              feedback={feedback}
              onNext={handleNext}
              onLevelChange={handleLevelChange}
              currentLevel={state.currentLevel}
            />
          ) : (
            <Dashboard 
              history={state.history} 
              vocabBank={state.vocabBank} 
              grammarBank={state.grammarBank}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
