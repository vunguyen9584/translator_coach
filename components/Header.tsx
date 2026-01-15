
import React from 'react';
import { HistoryItem } from '../types';

interface HeaderProps {
  history: HistoryItem[];
  vocabCount: number;
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ history, vocabCount, onMenuClick }) => {
  const avgScore = history.length > 0 
    ? Math.round(history.reduce((sum, item) => sum + item.feedback.score, 0) / history.length) 
    : 0;

  return (
    <header className="h-16 md:h-20 border-b border-slate-200 bg-white/80 backdrop-blur-md px-4 md:px-8 flex items-center justify-between z-10 sticky top-0">
      <div className="flex items-center gap-4">
        {/* Mobile Hamburger Button */}
        <button 
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Open Menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>

        <div>
          <h1 className="text-lg md:text-xl font-bold text-slate-800">Coach Session</h1>
          <p className="hidden md:block text-xs text-slate-500">Practice your translation skills with real-time feedback</p>
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        <div className="text-right">
          <div className="text-[10px] md:text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg Score</div>
          <div className="text-lg md:text-xl font-bold text-indigo-600 leading-none">{avgScore}%</div>
        </div>
        <div className="w-px h-8 bg-slate-200 hidden sm:block"></div>
        <div className="hidden sm:block text-right">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Vocab Mastered</div>
          <div className="text-xl font-bold text-emerald-600 leading-none">{vocabCount}</div>
        </div>
        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 md:w-6 md:h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
          </svg>
        </div>
      </div>
    </header>
  );
};

export default Header;
