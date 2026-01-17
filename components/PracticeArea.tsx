
import React, { useState, useEffect } from 'react';
import { FeedbackData } from '../types';

interface PracticeAreaProps {
  vnSentence: string;
  isLoading: boolean;
  onSubmit: (translation: string) => void;
  feedback: FeedbackData | null;
  onNext: () => void;
  onLevelChange: (level: number) => void;
  currentLevel: number;
  isReviewMode?: boolean; // New Prop
}

const PracticeArea: React.FC<PracticeAreaProps> = ({ 
  vnSentence, 
  isLoading, 
  onSubmit, 
  feedback, 
  onNext,
  onLevelChange,
  currentLevel,
  isReviewMode
}) => {
  const [translation, setTranslation] = useState('');

  // Reset translation when sentence changes
  useEffect(() => {
    setTranslation('');
  }, [vnSentence]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (translation.trim() && !isLoading) {
      onSubmit(translation);
    }
  };

  // Helper to parse [[error]] markings
  const renderMarkedTranslation = (text: string) => {
    if (!text) return null;
    const parts = text.split(/\[\[(.*?)\]\]/g);
    return (
      <span className="text-lg leading-relaxed">
        {parts.map((part, i) => {
          // Odd indices are captured groups (content inside brackets)
          if (i % 2 === 1) {
            return (
              <span key={i} className="text-rose-500 font-bold decoration-rose-300 underline decoration-2 mx-1">
                {part}
              </span>
            );
          }
          return <span key={i} className="text-slate-800">{part}</span>;
        })}
      </span>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Intro section if it's the very beginning */}
      {!vnSentence && !isLoading && (
        <div className="glass p-12 rounded-3xl text-center space-y-6">
          <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-slate-800">Welcome, I'm your English Coach</h2>
          <p className="text-slate-600 max-w-md mx-auto">
            Ready to master Vietnamese-to-English translation? Select your level and let's start translating!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {[1, 5, 10].map(l => (
              <button 
                key={l}
                onClick={() => onLevelChange(l)}
                className="px-6 py-3 bg-white border border-slate-200 rounded-xl hover:border-indigo-500 hover:text-indigo-600 transition-all font-medium"
              >
                Start Level {l}
              </button>
            ))}
          </div>
        </div>
      )}

      {vnSentence && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className={`glass p-8 rounded-3xl border-l-8 shadow-sm relative overflow-hidden ${isReviewMode ? 'border-amber-500' : 'border-indigo-500'}`}>
            {isReviewMode && (
              <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                Review Mode
              </div>
            )}
            <div className={`text-xs font-semibold uppercase mb-2 ${isReviewMode ? 'text-amber-600' : 'text-indigo-500'}`}>
              {isReviewMode ? 'Review Old Mistake' : `Vietnamese Source (Level ${currentLevel})`}
            </div>
            <p className="text-2xl font-medium text-slate-800 italic leading-relaxed">
              "{vnSentence}"
            </p>
          </div>

          {!feedback ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <textarea
                value={translation}
                onChange={(e) => setTranslation(e.target.value)}
                placeholder="Type your English translation here..."
                className="w-full h-40 p-6 rounded-3xl border-2 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all resize-none text-lg outline-none"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!translation.trim() || isLoading}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-slate-800 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Analyzing...
                  </>
                ) : (
                  "Submit Translation"
                )}
              </button>
            </form>
          ) : (
            <div className="animate-in zoom-in-95 duration-500 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
                  <div className="text-xs font-bold text-slate-400 uppercase mb-1">Score</div>
                  <div className={`text-5xl font-black ${feedback.score > 80 ? 'text-emerald-500' : feedback.score > 50 ? 'text-amber-500' : 'text-rose-500'}`}>
                    {feedback.score}
                  </div>
                </div>
                <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                   <div className="text-xs font-bold text-slate-400 uppercase mb-2">Coach's Analysis</div>
                   <p className="text-slate-700 leading-relaxed">{feedback.analysis}</p>
                </div>
              </div>

              {/* User Correction & Better Version Block */}
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                
                {/* Your Translation with Errors Marked */}
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase mb-2">Your Translation (Marked)</div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    {renderMarkedTranslation(feedback.markedUserTranslation || translation)}
                  </div>
                </div>

                {/* Better Version */}
                <div className="pt-6 border-t border-slate-100">
                  <div className="text-xs font-bold text-emerald-600 uppercase mb-2">Better Version</div>
                  <p className="text-xl font-semibold text-emerald-900 leading-relaxed">{feedback.betterVersion}</p>
                  {feedback.alternative && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <div className="text-[10px] font-bold text-emerald-500 uppercase mb-1">Alternative Phrasing</div>
                      <p className="text-emerald-800 italic">{feedback.alternative}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
                  <h4 className="text-sm font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full"></span> Key Vocabulary
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {feedback.extractedVocab.map((v, i) => (
                      <div key={i} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm group relative cursor-help">
                        <span className="font-bold text-slate-700">{v.word}</span>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[200px] p-2 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-xl">
                          {v.meaning}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
                  <h4 className="text-sm font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-amber-500 rounded-full"></span> Grammar Points
                  </h4>
                  <ul className="space-y-2">
                    {feedback.grammarPoints.map((p, i) => (
                      <li key={i} className="text-sm text-slate-600 flex items-center gap-2">
                        <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={onNext}
                  className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-3"
                >
                  {isReviewMode ? "Complete Review" : "Next Sentence"}
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {isLoading && !feedback && (
        <div className="fixed inset-0 bg-white/40 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
           <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-6"></div>
           <p className="text-lg font-bold text-slate-700 animate-pulse">
            Thinking up a {vnSentence ? 'feedback' : 'challenge'}...
           </p>
        </div>
      )}
    </div>
  );
};

export default PracticeArea;
