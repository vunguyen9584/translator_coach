
import React from 'react';
import { HistoryItem } from '../types';
import { User } from 'firebase/auth';

interface HeaderProps {
  history: HistoryItem[];
  vocabCount: number;
  onMenuClick: () => void;
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  history, 
  vocabCount, 
  onMenuClick,
  user,
  onLogin,
  onLogout
}) => {
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
          <p className="hidden md:block text-xs text-slate-500">Practice your translation skills</p>
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        <div className="text-right hidden sm:block">
          <div className="text-[10px] md:text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg Score</div>
          <div className="text-lg md:text-xl font-bold text-indigo-600 leading-none">{avgScore}%</div>
        </div>
        <div className="w-px h-8 bg-slate-200 hidden sm:block"></div>
        <div className="hidden sm:block text-right">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Vocab</div>
          <div className="text-xl font-bold text-emerald-600 leading-none">{vocabCount}</div>
        </div>

        {/* User Profile / Login */}
        <div className="pl-4 border-l border-slate-200">
          {user ? (
             <div className="flex items-center gap-3">
               <img 
                 src={user.photoURL || "https://ui-avatars.com/api/?name=" + user.email} 
                 alt="Avatar" 
                 className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-slate-200"
               />
               <button 
                 onClick={onLogout}
                 className="hidden md:block text-xs font-medium text-slate-500 hover:text-red-500 transition-colors"
               >
                 Sign Out
               </button>
             </div>
          ) : (
            <button
              onClick={onLogin}
              className="px-4 py-2 bg-slate-900 text-white text-xs md:text-sm font-bold rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
