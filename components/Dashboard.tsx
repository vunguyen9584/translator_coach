
import React from 'react';
import { HistoryItem, VocabItem, GrammarItem } from '../types';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

interface DashboardProps {
  history: HistoryItem[];
  vocabBank: Record<string, VocabItem>;
  grammarBank: Record<string, GrammarItem>;
}

const Dashboard: React.FC<DashboardProps> = ({ history, vocabBank, grammarBank }) => {
  const chartData = history
    .slice(0, 20)
    .reverse()
    .map((item, idx) => ({
      name: `T-${history.length - idx}`,
      score: item.feedback.score,
    }));

  // Fix: Cast Object.values results to explicit types to fix 'unknown' type errors in TypeScript inference
  const sortedVocab = (Object.values(vocabBank) as VocabItem[]).sort((a, b) => b.count - a.count);
  const sortedGrammar = (Object.values(grammarBank) as GrammarItem[]).sort((a, b) => b.count - a.count);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Progress Chart */}
        <div className="lg:col-span-2 glass p-8 rounded-3xl">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-indigo-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.5 4.5L21.75 4.5M21.75 18.25h-15a2.25 2.25 0 0 1-2.25-2.25V4.25" />
            </svg>
            Performance Trend
          </h3>
          <div className="h-64 w-full">
            {history.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#6366f1" 
                    strokeWidth={4} 
                    dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }} 
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 italic">
                Complete your first translation to see trends
              </div>
            )}
          </div>
        </div>

        {/* Level Stats */}
        <div className="glass p-8 rounded-3xl flex flex-col justify-between">
           <div>
            <h3 className="text-lg font-bold text-slate-800 mb-6">Learning Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                <span className="text-slate-500 font-medium">Exercises</span>
                <span className="text-xl font-bold text-slate-800">{history.length}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                <span className="text-slate-500 font-medium">Vocab Learned</span>
                <span className="text-xl font-bold text-slate-800">{Object.keys(vocabBank).length}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                <span className="text-slate-500 font-medium">Highest Score</span>
                <span className="text-xl font-bold text-emerald-600">
                  {history.length > 0 ? Math.max(...history.map(h => h.feedback.score)) : 0}%
                </span>
              </div>
            </div>
           </div>
           <button className="mt-8 w-full py-4 bg-indigo-50 text-indigo-600 rounded-2xl font-bold hover:bg-indigo-100 transition-all">
             Download Report
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Vocabulary List */}
        <div className="glass p-8 rounded-3xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800">Vocabulary Bank</h3>
            <span className="px-3 py-1 bg-indigo-100 text-indigo-600 text-xs font-bold rounded-full">
              {sortedVocab.length} Items
            </span>
          </div>
          <div className="max-h-96 overflow-y-auto pr-2 space-y-2">
            {sortedVocab.length > 0 ? sortedVocab.map((v, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-indigo-200 transition-all shadow-sm">
                <div>
                  <div className="font-bold text-slate-800">{v.word}</div>
                  <div className="text-xs text-slate-500">{v.meaning}</div>
                </div>
                <div className="text-xs font-bold text-indigo-500 bg-indigo-50 px-2 py-1 rounded">
                  Seen {v.count}x
                </div>
              </div>
            )) : (
              <div className="text-center py-10 text-slate-400 italic">No vocabulary collected yet.</div>
            )}
          </div>
        </div>

        {/* Grammar Checklist */}
        <div className="glass p-8 rounded-3xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800">Grammar Progress</h3>
            <span className="px-3 py-1 bg-amber-100 text-amber-600 text-xs font-bold rounded-full">
              {sortedGrammar.length} Rules
            </span>
          </div>
          <div className="max-h-96 overflow-y-auto pr-2 space-y-2">
            {sortedGrammar.length > 0 ? sortedGrammar.map((g, i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${g.count > 5 ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                  {g.count > 5 ? '✓' : g.count}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-slate-800 text-sm">{g.point}</div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div 
                      className={`h-full transition-all ${g.count > 5 ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                      style={{ width: `${Math.min(g.count * 10, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-10 text-slate-400 italic">Start translating to identify grammar points.</div>
            )}
          </div>
        </div>

      </div>

      {/* History Feed */}
      <div className="glass p-8 rounded-3xl">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Recent Sessions</h3>
        <div className="space-y-4">
          {history.length > 0 ? history.slice(0, 5).map((item) => (
            <div key={item.id} className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase rounded">Level {item.level}</span>
                  <span className="text-xs text-slate-400">{new Date(item.timestamp).toLocaleDateString()}</span>
                </div>
                <div className="font-bold text-lg text-indigo-600">{item.feedback.score}%</div>
              </div>
              <p className="text-slate-800 font-medium line-clamp-1 italic text-sm">" {item.vnSentence} "</p>
              <p className="text-slate-500 text-xs line-clamp-1">Result: {item.feedback.betterVersion}</p>
            </div>
          )) : (
             <div className="text-center py-10 text-slate-400 italic">No sessions yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
