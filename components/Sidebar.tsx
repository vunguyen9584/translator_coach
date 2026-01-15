
import React, { useRef, useEffect } from 'react';
import { TOPICS } from '../types';

const BookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
  </svg>
);

const StatsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
  </svg>
);

interface SidebarProps {
  currentView: 'practice' | 'stats';
  onViewChange: (view: 'practice' | 'stats') => void;
  currentLevel: number;
  onLevelChange: (level: number) => void;
  currentTopic: string;
  onTopicChange: (topic: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  onViewChange, 
  currentLevel, 
  onLevelChange,
  currentTopic,
  onTopicChange,
  isOpen,
  onClose
}) => {
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Close sidebar if clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <div 
        className={`fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Sidebar Container */}
      <aside 
        ref={sidebarRef}
        className={`
          fixed md:relative inset-y-0 left-0 z-50
          w-80 md:w-72
          bg-slate-900 text-white 
          flex flex-col 
          transition-transform duration-300 ease-out
          shadow-2xl md:shadow-none
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center font-bold text-xl">L</div>
            <span className="font-bold text-lg tracking-tight">LingoCoach</span>
          </div>
          {/* Close button for mobile */}
          <button onClick={onClose} className="md:hidden text-slate-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="px-4 space-y-2 mb-6">
          <button 
            onClick={() => onViewChange('practice')}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${currentView === 'practice' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <BookIcon />
            <span className="font-medium">Practice</span>
          </button>
          <button 
            onClick={() => onViewChange('stats')}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${currentView === 'stats' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <StatsIcon />
            <span className="font-medium">Dashboard</span>
          </button>
        </nav>

        <div className="flex-1 overflow-y-auto px-4 pb-4 border-t border-slate-800">
          {/* Difficulty Level Selector */}
          <div className="mt-6 mb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Difficulty Level
          </div>
          <div className="grid grid-cols-5 gap-2 mb-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((lvl) => (
              <button
                key={lvl}
                onClick={() => onLevelChange(lvl)}
                className={`w-full h-9 rounded-lg text-sm font-bold transition-all ${currentLevel === lvl ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
              >
                {lvl}
              </button>
            ))}
          </div>
          <div className="mb-6 text-[10px] text-slate-500 min-h-[15px] italic">
            {currentLevel <= 3 && "Start simple."}
            {currentLevel > 3 && currentLevel <= 7 && "Let's get serious."}
            {currentLevel > 7 && "Master class."}
          </div>

          {/* Topic Selector */}
          <div className="mb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider sticky top-0 bg-slate-900 py-2 z-10">
            Conversation Topic
          </div>
          <div className="flex flex-col gap-1 pb-10">
            {TOPICS.map((topic) => (
              <button
                key={topic}
                onClick={() => onTopicChange(topic)}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all truncate flex items-center justify-between group ${
                  currentTopic === topic 
                    ? 'bg-slate-700 text-white' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <span>{topic}</span>
                {currentTopic === topic && (
                   <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                )}
              </button>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
