import { FunctionComponent, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Sparkles, X, Loader2, RefreshCw } from 'lucide-react';

import { cvApi } from '../api';
import { CvAiAnalysis, CvAiAnalysisSuggestion } from '../types';

interface AiSuggestionsPanelProps {
  cvId: number;
  open: boolean;
  onClose: () => void;
  onAnalyzed?: (analysis: CvAiAnalysis) => void;
}

const severityColor: Record<CvAiAnalysisSuggestion['severity'], string> = {
  low: 'bg-blue-50 text-blue-700 border-blue-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  high: 'bg-red-50 text-red-700 border-red-200',
};

const AiSuggestionsPanel: FunctionComponent<AiSuggestionsPanelProps> = ({
  cvId,
  open,
  onClose,
  onAnalyzed,
}) => {
  const [latest, setLatest] = useState<CvAiAnalysis | null>(null);
  const [history, setHistory] = useState<CvAiAnalysis[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await cvApi.listAnalyses(cvId);
      setHistory(list);
      if (list.length > 0) setLatest(list[0]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load analyses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) loadHistory();
  }, [open, cvId]);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setError(null);
    try {
      const fresh = await cvApi.analyze(cvId);
      setLatest(fresh);
      setHistory((prev) => [fresh, ...prev]);
      onAnalyzed?.(fresh);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 z-40"
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.2 }}
            className="fixed top-0 right-0 bottom-0 w-[420px] bg-white shadow-2xl z-50 flex flex-col"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h2 className="font-semibold text-gray-900">AI Suggestions</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white rounded text-xs font-medium disabled:opacity-60"
                >
                  {analyzing ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3.5 h-3.5" />
                  )}
                  {analyzing ? 'Analyzing...' : 'Re-analyze'}
                </button>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading && <p className="p-5 text-sm text-gray-500">Loading analyses...</p>}
              {error && <p className="p-5 text-sm text-red-600">{error}</p>}

              {!loading && !latest && !error && (
                <div className="p-8 text-center">
                  <Sparkles className="w-10 h-10 text-purple-300 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">No analysis yet.</p>
                  <button
                    onClick={handleAnalyze}
                    disabled={analyzing}
                    className="px-4 py-2 bg-purple-600 text-white rounded text-sm font-medium disabled:opacity-60"
                  >
                    Analyze now
                  </button>
                </div>
              )}

              {latest && (
                <div className="p-5 space-y-5">
                  <ScoreCard score={latest.score} provider={latest.provider} />

                  {latest.strengths_json.length > 0 && (
                    <section>
                      <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Strengths
                      </h3>
                      <ul className="space-y-1.5">
                        {latest.strengths_json.map((s, i) => (
                          <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                            <span className="text-emerald-600 mt-0.5">&#10003;</span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {latest.weaknesses_json.length > 0 && (
                    <section>
                      <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        Weaknesses
                      </h3>
                      <ul className="space-y-1.5">
                        {latest.weaknesses_json.map((w, i) => (
                          <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                            <span className="text-amber-600 mt-0.5">!</span>
                            <span>{w}</span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {latest.suggestions_json.length > 0 && (
                    <section>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                        Suggestions
                      </h3>
                      <ul className="space-y-2">
                        {latest.suggestions_json.map((sug, i) => (
                          <li
                            key={i}
                            className={`px-3 py-2 rounded border text-sm ${severityColor[sug.severity]}`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-semibold uppercase tracking-wide">
                                {sug.section}
                              </span>
                              <span className="text-[10px] uppercase">{sug.severity}</span>
                            </div>
                            <p>{sug.message}</p>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {history.length > 1 && (
                    <section>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                        History
                      </h3>
                      <ul className="space-y-1 text-xs text-gray-500">
                        {history.slice(1).map((h) => (
                          <li key={h.id} className="flex justify-between">
                            <span>{new Date(h.analyzed_at).toLocaleString()}</span>
                            <span className="font-semibold text-gray-700">{h.score}/100</span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

const ScoreCard: FunctionComponent<{ score: number; provider: string }> = ({ score, provider }) => {
  const color = score >= 80 ? 'text-emerald-600' : score >= 60 ? 'text-amber-600' : 'text-red-600';
  const label = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Needs work';
  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className={`text-4xl font-bold ${color}`}>{score}</div>
      <div>
        <div className="text-sm font-semibold text-gray-900">{label}</div>
        <div className="text-xs text-gray-500">Provider: {provider}</div>
      </div>
    </div>
  );
};

export default AiSuggestionsPanel;
