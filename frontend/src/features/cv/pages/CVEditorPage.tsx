import { FunctionComponent, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText, Plus, Briefcase, GraduationCap, Lightbulb, FolderOpen,
  Type, AlignLeft, AlignCenter, AlignRight, Bold, Italic,
  Layout, Check, Wand2, Download, Save, Sparkles,
} from 'lucide-react';
import StandardCvTemplate, { SectionSuggestionMap } from '../components/StandardCvTemplate';
import { cvApi } from '../api';
import type { CvAiAnalysis, SectionType } from '../types';
import { exportNodeToPdf } from '../utils/pdfExporter';

/**
 * CV Editor — Canva-like canvas editor for creating and editing CV templates.
 * Users can add text, shapes, and images, drag them around, and export as PDF.
 */
const CVEditorPage: FunctionComponent = () => {
  const [cvTitle, setCvTitle] = useState('CV Template');
  const [accentColor, setAccentColor] = useState('#2563eb');

  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [fontWeight, setFontWeight] = useState<'regular' | 'bold'>('regular');
  const [alignment, setAlignment] = useState<'left' | 'center' | 'right'>('left');
  const [layout, setLayout] = useState<'modern' | 'classic' | 'minimal'>('modern');
  const [aiSuggestions, setAiSuggestions] = useState(true);

  // ---- Backend wiring ------------------------------------------------------
  // Resolve the user's primary CV on mount. If none exists, create one so the
  // header / sidebar actions have a target to act on.
  const [cvId, setCvId] = useState<number | null>(null);
  const [cvScore, setCvScore] = useState<number>(82);
  const [latestAnalysis, setLatestAnalysis] = useState<CvAiAnalysis | null>(null);
  const exportRef = useRef<HTMLElement>(null);
  const titleSaveTimerRef = useRef<number | null>(null);
  const cvLoadedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await cvApi.listMyCvs();
        if (cancelled) return;
        const primary = list.find((c) => c.is_primary) ?? list[0];
        if (primary) {
          setCvId(primary.id);
          setCvTitle(primary.title);
          if (typeof primary.current_score === 'number') setCvScore(primary.current_score);
          cvLoadedRef.current = true;
          console.info('[cv-editor] loaded CV', primary.id);
          return;
        }
        // No CV yet — create one so subsequent actions have a target.
        const created = await cvApi.createCv({ title: 'CV Template' });
        if (cancelled) return;
        setCvId(created.id);
        setCvTitle(created.title);
        cvLoadedRef.current = true;
        console.info('[cv-editor] created new CV', created.id);
      } catch (e) {
        console.error('[cv-editor] failed to load or create CV (auth token missing? backend down?):', e);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Pull the most recent analysis on cv load so badges show immediately when
  // the user re-opens the editor after an earlier analyze run.
  useEffect(() => {
    if (cvId == null) return;
    let cancelled = false;
    cvApi.listAnalyses(cvId)
      .then((list) => {
        if (cancelled || list.length === 0) return;
        setLatestAnalysis(list[0]);
        setCvScore(list[0].score);
      })
      .catch((e) => console.warn('[cv-editor] could not load analysis history:', e));
    return () => { cancelled = true; };
  }, [cvId]);

  // Build a SectionType -> message map from the most recent analysis. The
  // template renders a badge above each section that has at least one
  // suggestion. We pick the FIRST suggestion per section (highest priority
  // for now; severity-based ordering can be layered on later).
  const sectionSuggestions = useMemo<SectionSuggestionMap>(() => {
    if (!latestAnalysis?.suggestions_json) return {};
    const map: SectionSuggestionMap = {};
    for (const sug of latestAnalysis.suggestions_json) {
      const key = sug.section as keyof SectionSuggestionMap;
      if (!map[key]) map[key] = sug.message;
    }
    return map;
  }, [latestAnalysis]);

  // Debounced persistence of CV title — fires only after the user stops typing,
  // and only once the CV has been loaded (so the initial setCvTitle from the
  // mount fetch doesn't trigger a redundant PATCH).
  useEffect(() => {
    if (cvId == null || !cvLoadedRef.current) return;
    if (titleSaveTimerRef.current) window.clearTimeout(titleSaveTimerRef.current);
    titleSaveTimerRef.current = window.setTimeout(async () => {
      try {
        await cvApi.updateCv(cvId, { title: cvTitle });
        console.info('[cv-editor] title saved');
      } catch (e) {
        console.error('[cv-editor] failed to save title:', e);
      }
    }, 600);
    return () => {
      if (titleSaveTimerRef.current) window.clearTimeout(titleSaveTimerRef.current);
    };
  }, [cvTitle, cvId]);

  const requireCv = (action: string): number | null => {
    if (cvId == null) {
      console.warn(`[cv-editor] ${action} ignored: CV not ready yet`);
      return null;
    }
    return cvId;
  };

  const handleAddSection = async (sectionType: SectionType, label: string) => {
    const id = requireCv('addSection');
    if (id == null) return;
    try {
      const added = await cvApi.addSection(id, { section_type: sectionType, label });
      console.info(`[cv-editor] section added: ${sectionType} (#${added.id})`);
    } catch (e) {
      console.error('[cv-editor] addSection failed:', e);
    }
  };

  const handleAnalyze = async () => {
    const id = requireCv('analyze');
    if (id == null) return;
    try {
      const result = await cvApi.analyze(id);
      setCvScore(result.score);
      setLatestAnalysis(result);
      console.info('[cv-editor] analysis complete:', result);
    } catch (e) {
      console.error('[cv-editor] analyze failed:', e);
    }
  };

  const handleSave = async () => {
    const id = requireCv('save');
    if (id == null) return;
    try {
      const version = await cvApi.saveVersion(id, 'Manual save from editor');
      console.info(`[cv-editor] version saved: v${version.version_number}`);
    } catch (e) {
      console.error('[cv-editor] save failed:', e);
    }
  };

  const handleDownload = async () => {
    const id = requireCv('download');
    if (id == null) return;
    try {
      // Server-side: record the export attempt (best-effort, non-blocking).
      cvApi.exportPdf(id).catch((e) => {
        console.warn('[cv-editor] export-pdf log failed (non-fatal):', e);
      });
      // Client-side: render the canvas to a multi-page A4 PDF.
      if (!exportRef.current) {
        console.error('[cv-editor] export node not mounted');
        return;
      }
      const fileName = (cvTitle || 'cv').replace(/[^a-z0-9-_]+/gi, '_');
      await exportNodeToPdf(exportRef.current, fileName);
      console.info('[cv-editor] PDF downloaded');
    } catch (e) {
      console.error('[cv-editor] download failed:', e);
    }
  };

  return (
    <>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a1a1a1;
        }
      `}</style>
      <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      <header className="bg-white border-b border-gray-200 px-6 py-4 relative z-10 flex-shrink-0">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-500/25">
                <Briefcase className="w-5 h-5 text-white" strokeWidth={1.5} />
              </div>
              <div>
                <h1 className="font-bold text-gray-900 text-base tracking-tight">CV Editor</h1>
                <p className="text-xs text-gray-500 font-medium">Digital Talent Center</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-12 w-[142px] relative rounded-lg bg-gray-50 border border-gray-200 flex items-center px-3 gap-3">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <svg className="w-12 h-12 transform -rotate-90">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="#e5e7eb"
                    strokeWidth="4"
                    fill="none"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="#22c55e"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray="125.6"
                    strokeDashoffset={125.6 - (cvScore / 100) * 125.6}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-sm font-bold text-gray-800">{cvScore}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-gray-700">CV Score</span>
                <span className="text-xs text-gray-500">Excellent</span>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAnalyze}
              className="h-9 px-4 rounded-lg bg-gradient-to-r from-purple-500 to-purple-700 text-white font-medium text-sm flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Analyze with AI
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              className="h-9 px-4 rounded-lg bg-white border border-gray-300 text-gray-700 font-medium text-sm flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDownload}
              className="h-9 px-4 rounded-lg bg-indigo-500 text-white font-medium text-sm flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </motion.button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden min-h-0">
        <aside className="w-64 bg-white border-r border-gray-200 overflow-y-auto overflow-x-hidden flex-shrink-0 custom-scrollbar">
          <div className="p-4 space-y-4">
            <div>
              <h3 className="flex items-center gap-1.5 text-xs font-semibold text-gray-900 mb-2">
                <Plus className="w-3.5 h-3.5" />
                CV Styling
              </h3>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600 font-medium whitespace-nowrap">CV Title</span>
                  <input
                    type="text"
                    value={cvTitle}
                    onChange={(e) => setCvTitle(e.target.value)}
                    className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="CV Title"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 font-medium">Accent Color</span>
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer border-0"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200" />

            <div>
              <h3 className="flex items-center gap-1.5 text-xs font-semibold text-gray-900 mb-2">
                <Plus className="w-3.5 h-3.5" />
                Add Section
              </h3>
              <div className="space-y-1.5">
                <motion.button
                  whileHover={{ scale: 1.01, backgroundColor: '#f3f4f6' }}
                  onClick={() => handleAddSection('experience', 'Experience')}
                  className="w-full flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg text-xs text-gray-700 transition-colors"
                >
                  <Briefcase className="w-4 h-4 text-gray-500" />
                  Add Experience
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.01, backgroundColor: '#f3f4f6' }}
                  onClick={() => handleAddSection('education', 'Education')}
                  className="w-full flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg text-xs text-gray-700 transition-colors"
                >
                  <GraduationCap className="w-4 h-4 text-gray-500" />
                  Add Education
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.01, backgroundColor: '#f3f4f6' }}
                  onClick={() => handleAddSection('skills', 'Skills')}
                  className="w-full flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg text-xs text-gray-700 transition-colors"
                >
                  <Lightbulb className="w-4 h-4 text-gray-500" />
                  Add Skills
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.01, backgroundColor: '#f3f4f6' }}
                  onClick={() => handleAddSection('projects', 'Projects')}
                  className="w-full flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg text-xs text-gray-700 transition-colors"
                >
                  <FolderOpen className="w-4 h-4 text-gray-500" />
                  Add Project
                </motion.button>
              </div>
            </div>

            <div className="border-t border-gray-200" />

            <div>
              <h3 className="flex items-center gap-1.5 text-xs font-semibold text-gray-900 mb-2">
                <Type className="w-3.5 h-3.5" />
                Text Styling
              </h3>

              <div className="mb-2">
                <label className="text-[10px] text-gray-600 mb-1 block">Font Size</label>
                <div className="flex gap-1.5">
                  {(['small', 'medium', 'large'] as const).map((size) => (
                    <button
                      key={size}
                      onClick={() => setFontSize(size)}
                      className={`flex-1 py-1.5 px-2 rounded text-[10px] font-medium capitalize transition-colors ${
                        fontSize === size ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-2">
                <label className="text-[10px] text-gray-600 mb-1 block">Font Weight</label>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setFontWeight('regular')}
                    className={`flex-1 py-1.5 px-2 rounded text-[10px] font-medium transition-colors ${
                      fontWeight === 'regular' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Regular
                  </button>
                  <button
                    onClick={() => setFontWeight('bold')}
                    className={`flex-1 py-1.5 px-2 rounded text-[10px] transition-colors ${
                      fontWeight === 'bold' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Bold className="w-3.5 h-3.5 mx-auto" />
                  </button>
                  <button className="flex-1 py-1.5 px-2 rounded text-[10px] bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                    <Italic className="w-3.5 h-3.5 mx-auto" />
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-gray-600 mb-1 block">Alignment</label>
                <div className="flex gap-1.5">
                  {([
                    { key: 'left', icon: AlignLeft },
                    { key: 'center', icon: AlignCenter },
                    { key: 'right', icon: AlignRight },
                  ] as const).map(({ key, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => setAlignment(key)}
                      className={`flex-1 py-1.5 px-2 rounded transition-colors ${
                        alignment === key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 mx-auto" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200" />

            <div>
              <h3 className="flex items-center gap-1.5 text-xs font-semibold text-gray-900 mb-2">
                <Layout className="w-3.5 h-3.5" />
                Layout Options
              </h3>
              <div className="space-y-1.5">
                {([
                  { key: 'modern', label: 'Modern Split' },
                  { key: 'classic', label: 'Classic Single' },
                  { key: 'minimal', label: 'Minimal Clean' },
                ] as const).map(({ key, label }) => (
                  <motion.button
                    key={key}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => setLayout(key)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                      layout === key ? 'bg-blue-50 border border-blue-200 text-blue-700' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="font-medium">{label}</span>
                    {layout === key && <Check className="w-3.5 h-3.5" />}
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Wand2 className="w-3.5 h-3.5 text-purple-600" />
                <span className="text-xs font-semibold text-gray-900">AI Suggestions</span>
              </div>
              <button
                onClick={() => setAiSuggestions(!aiSuggestions)}
                className={`relative w-10 h-5 rounded-full transition-colors ${
                  aiSuggestions ? 'bg-purple-600' : 'bg-gray-300'
                }`}
              >
                <motion.div animate={{ x: aiSuggestions ? 20 : 2 }} className="absolute top-1 w-3 h-3 bg-white rounded-full" />
              </button>
            </div>
          </div>
        </aside>

        <main ref={exportRef} className="flex-1 bg-slate-100 overflow-hidden min-h-0">
          <StandardCvTemplate accentColor={accentColor} sectionSuggestions={sectionSuggestions} />
        </main>
      </div>
    </div>
    </>
  );
};

export default CVEditorPage;
