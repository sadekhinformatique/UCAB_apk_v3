
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { generateFinancialReport } from '../services/geminiService';
import { Sparkles, Send, Loader2, AlertTriangle } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { UserRole } from '../types';

const AIReport: React.FC = () => {
  const { transactions, members, user } = useStore();
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  // Security Check
  if (user?.role === UserRole.MEMBRE) {
    return <Navigate to="/" replace />;
  }

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    // Pass actual data to the service
    const result = await generateFinancialReport(transactions, members, query);
    setResponse(result);
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 h-[calc(100vh-140px)] flex flex-col">
      <div className="flex items-center gap-3 mb-2">
         <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
            <Sparkles size={24} />
         </div>
         <div>
            <h2 className="text-2xl font-bold text-slate-800">Assistant Financier Intelligent</h2>
            <p className="text-sm text-slate-500">Analysez vos finances et générez des rapports via l'IA Gemini.</p>
         </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm p-6 overflow-y-auto">
        {!response && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center opacity-50">
                <Sparkles size={48} className="mb-4" />
                <p>Posez une question comme :</p>
                <ul className="mt-2 space-y-1 text-sm">
                    <li>"Génère un bilan financier pour ce mois"</li>
                    <li>"Quelle est la plus grosse dépense ?"</li>
                    <li>"Liste les membres en retard de cotisation"</li>
                </ul>
                 {!process.env.API_KEY && (
                  <div className="mt-6 p-3 bg-amber-50 border border-amber-200 rounded text-amber-700 flex items-center gap-2 text-xs max-w-md">
                    <AlertTriangle size={16} />
                    <span>Note: Clé API Gemini non détectée. Le mode démo simulera une réponse si l'API échoue.</span>
                  </div>
                )}
            </div>
        )}

        {loading && (
            <div className="flex items-center justify-center h-full text-purple-600 gap-2">
                <Loader2 size={24} className="animate-spin" />
                <span>Analyse des données financières en cours...</span>
            </div>
        )}

        {response && (
            <div className="prose prose-slate max-w-none">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 whitespace-pre-wrap">
                    {response}
                </div>
            </div>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleAsk} className="relative">
        <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Demandez une analyse ou un rapport..."
            className="w-full pl-4 pr-14 py-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm outline-none text-slate-700"
        />
        <button 
            type="submit" 
            disabled={loading || !query}
            className="absolute right-2 top-2 bottom-2 bg-purple-600 hover:bg-purple-700 text-white px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
            <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default AIReport;
