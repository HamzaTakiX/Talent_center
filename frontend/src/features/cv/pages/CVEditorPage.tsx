import { FunctionComponent, useMemo, useRef, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText, Sparkles, Download, Plus, Briefcase, GraduationCap,
  Lightbulb, FolderOpen, Type, AlignLeft, AlignCenter, AlignRight,
  Bold, Italic, Layout, Check, Link, Mail, Phone,
  MapPin, Calendar, Globe, Star, Wand2, Clock, ListOrdered, Share2,
} from 'lucide-react';

import { useStudentCv } from '../hooks/useStudentCv';
import {
  ContactContent,
  EducationContent,
  ExperienceContent,
  LanguagesContent,
  SkillsContent,
  SummaryContent,
  CvSection,
  SectionType,
} from '../types';
import SectionReorderPanel from '../components/SectionReorderPanel';
import VersionHistoryDrawer from '../components/VersionHistoryDrawer';
import AiSuggestionsPanel from '../components/AiSuggestionsPanel';
import ShareLinksPanel from '../components/ShareLinksPanel';
import { exportNodeToPdf } from '../utils/pdfExporter';

const DEFAULT_CONTACT: ContactContent = {
  email: 'sarah.alami@esca.ma',
  phone: '+212 6 12 34 56 78',
  linkedin: 'linkedin.com/in/sarah-alami',
  website: '',
  location: 'Casablanca, Morocco',
};

const DEFAULT_SUMMARY: SummaryContent = {
  text: "Highly motivated Master's student in Management at ESCA Business School with a strong background in business strategy and digital marketing.",
};

const DEFAULT_EDUCATION: EducationContent = {
  items: [
    {
      id: '1',
      degree: 'Master in Management',
      school: 'ESCA Business School',
      location: 'Casablanca, Morocco',
      start_date: '2023',
      end_date: '2025',
      description: 'Specialization in Digital Marketing and Business Strategy. Current GPA: 3.7/4.0',
    },
  ],
};

const DEFAULT_EXPERIENCE: ExperienceContent = {
  items: [
    {
      id: '1',
      title: 'Marketing Intern',
      company: 'Attijariwafa Bank',
      location: 'Casablanca, Morocco',
      start_date: 'Jun 2023',
      end_date: 'Aug 2023',
      bullets: [
        'Developed and executed social media campaigns that increased engagement by 35%',
        'Conducted market research and competitor analysis for new product launches',
        'Collaborated with design team to create marketing materials',
      ],
    },
  ],
};

const DEFAULT_SKILLS: SkillsContent = {
  items: [
    { id: 's1', name: 'Digital Marketing', level: null },
    { id: 's2', name: 'Data Analysis', level: null },
    { id: 's3', name: 'Project Management', level: null },
    { id: 's4', name: 'Microsoft Office', level: null },
    { id: 's5', name: 'Google Analytics', level: null },
    { id: 's6', name: 'Social Media Marketing', level: null },
  ],
};

const DEFAULT_LANGUAGES: LanguagesContent = {
  items: [
    { id: 'l1', name: 'Arabic', level: 'Native' },
    { id: 'l2', name: 'French', level: 'Fluent' },
    { id: 'l3', name: 'English', level: 'Fluent' },
  ],
};

function findSection(sections: CvSection[] | undefined, type: SectionType): CvSection | undefined {
  return sections?.find((s) => s.section_type === type);
}

const CVEditorPage: FunctionComponent = () => {
  const params = useParams<{ id?: string }>();
  const cvId = params.id ? Number(params.id) : null;
  const {
    cv, loading, error, reload, exportPdf,
    addSection, deleteSection, reorderSections, updateSection,
  } = useStudentCv(cvId);

  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [fontWeight, setFontWeight] = useState<'regular' | 'bold'>('regular');
  const [alignment, setAlignment] = useState<'left' | 'center' | 'right'>('left');
  const [layout, setLayout] = useState<'modern' | 'classic' | 'minimal'>('modern');
  const [aiSuggestions, setAiSuggestions] = useState(true);
  const [busy, setBusy] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const content = useMemo(() => {
    const contact = (findSection(cv?.sections, 'contact')?.content_json as ContactContent) || DEFAULT_CONTACT;
    const summary = (findSection(cv?.sections, 'summary')?.content_json as SummaryContent) || DEFAULT_SUMMARY;
    const education = (findSection(cv?.sections, 'education')?.content_json as EducationContent) || DEFAULT_EDUCATION;
    const experience = (findSection(cv?.sections, 'experience')?.content_json as ExperienceContent) || DEFAULT_EXPERIENCE;
    const skills = (findSection(cv?.sections, 'skills')?.content_json as SkillsContent) || DEFAULT_SKILLS;
    const languages = (findSection(cv?.sections, 'languages')?.content_json as LanguagesContent) || DEFAULT_LANGUAGES;
    return { contact, summary, education, experience, skills, languages };
  }, [cv]);

  const personalInfo = {
    name: cv?.title || 'Sarah Alami',
    title: 'Business Management Student | Digital Marketing Enthusiast',
    ...content.contact,
  };

  const cvScore = cv?.current_score ?? 82;

  const fontSizeClasses = { small: 'text-xs', medium: 'text-sm', large: 'text-base' };
  const fontWeightClasses = { regular: 'font-normal', bold: 'font-semibold' };
  const alignmentClasses = { left: 'text-left', center: 'text-center', right: 'text-right' };

  // ---- Inline Editable Text Component ----------------------------------------
  interface EditableTextProps {
    value: string;
    onSave: (value: string) => void;
    className?: string;
    multiline?: boolean;
    placeholder?: string;
  }

  const EditableText: FunctionComponent<EditableTextProps> = ({
    value,
    onSave,
    className = '',
    multiline = false,
    placeholder = 'Click to edit...',
  }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(value);
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

    const handleClick = () => {
      setIsEditing(true);
      setEditValue(value);
      setTimeout(() => inputRef.current?.focus(), 0);
    };

    const handleSave = useCallback(() => {
      if (editValue !== value) {
        onSave(editValue);
      }
      setIsEditing(false);
    }, [editValue, value, onSave]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !multiline) {
        handleSave();
      } else if (e.key === 'Escape') {
        setEditValue(value);
        setIsEditing(false);
      }
    };

    if (isEditing) {
      const inputClasses = `${className} bg-white border-2 border-blue-500 rounded px-2 py-1 outline-none w-full resize-none`;
      if (multiline) {
        return (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className={inputClasses}
            rows={3}
          />
        );
      }
      return (
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className={inputClasses}
        />
      );
    }

    return (
      <span
        onClick={handleClick}
        className={`${className} cursor-text hover:bg-blue-50/50 rounded px-1 -mx-1 transition-colors border border-transparent hover:border-blue-200`}
        title="Click to edit"
      >
        {value || placeholder}
      </span>
    );
  };

  const handleAnalyze = () => {
    if (!cvId) return;
    setAiPanelOpen(true);
  };

  const handleDownload = async () => {
    if (!cvId || !previewRef.current) return;
    setBusy(true);
    try {
      await exportPdf();
      const fileName = (cv?.title || 'cv').replace(/[^a-z0-9-_]+/gi, '_');
      await exportNodeToPdf(previewRef.current, fileName);
    } finally {
      setBusy(false);
    }
  };

  const handleAddSection = async (sectionType: SectionType, label: string) => {
    if (!cvId) return;
    setBusy(true);
    try {
      await addSection({ section_type: sectionType, label });
    } finally {
      setBusy(false);
    }
  };

  const handleToggleVisibility = (sectionId: number, isVisible: boolean) => {
    updateSection(sectionId, { is_visible: isVisible });
  };

  const handleDeleteSection = async (sectionId: number) => {
    if (!window.confirm('Delete this section?')) return;
    await deleteSection(sectionId);
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/80 px-5 py-3 shadow-sm relative z-10 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                <FileText className="w-5 h-5 text-white" strokeWidth={1.5} />
              </div>
              <div>
                <h1 className="font-semibold text-gray-900 text-sm tracking-tight">CV Editor</h1>
                <p className="text-[10px] text-gray-400 font-medium -mt-1">Digital Talent Center</p>
              </div>
            </div>
            <div className="h-5 w-px bg-gray-200/80" />
            <div className="flex items-center gap-2 text-gray-500">
              <FileText className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs font-medium">
                {cv ? `${cv.title} (${cv.template.name})` : 'Sarah_Alami_CV_2024.pdf'}
                {loading && ' — loading...'}
                {error && ` — ${error}`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
              <div className="relative w-10 h-10">
                <svg className="w-10 h-10 transform -rotate-90">
                  <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="3" fill="none" className="text-gray-200" />
                  <circle
                    cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="3" fill="none"
                    strokeDasharray={`${(cvScore / 100) * 100.5} 100.5`}
                    className="text-green-500"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-700">
                  {cvScore}
                </span>
              </div>
              <div className="text-left">
                <p className="text-[10px] font-medium text-gray-700">CV Score</p>
                <p className="text-[10px] text-green-600">Excellent</p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={handleAnalyze}
              disabled={!cvId || busy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg text-xs font-medium disabled:opacity-60"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Analyze with AI
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => setHistoryOpen(true)}
              disabled={!cvId}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-xs font-medium disabled:opacity-60"
            >
              <Clock className="w-3.5 h-3.5" />
              History
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => setShareOpen(true)}
              disabled={!cvId}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-xs font-medium disabled:opacity-60"
            >
              <Share2 className="w-3.5 h-3.5" />
              Share
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={handleDownload}
              disabled={!cvId || busy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium disabled:opacity-60"
            >
              <Download className="w-3.5 h-3.5" />
              Download PDF
            </motion.button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden min-h-0">
        <aside className="w-64 bg-white border-r border-gray-200 overflow-y-auto flex-shrink-0">
          <div className="p-4 space-y-4">
            <div>
              <h3 className="flex items-center gap-1.5 text-xs font-semibold text-gray-900 mb-2">
                <Plus className="w-3.5 h-3.5" />
                Add Section
              </h3>
              <div className="space-y-1.5">
                <motion.button
                  whileHover={{ scale: 1.01, backgroundColor: '#f3f4f6' }}
                  onClick={() => handleAddSection('experience', 'Experience')}
                  disabled={!cvId || busy}
                  className="w-full flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg text-xs text-gray-700 transition-colors disabled:opacity-60"
                >
                  <Briefcase className="w-4 h-4 text-gray-500" />
                  Add Experience
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.01, backgroundColor: '#f3f4f6' }}
                  onClick={() => handleAddSection('education', 'Education')}
                  disabled={!cvId || busy}
                  className="w-full flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg text-xs text-gray-700 transition-colors disabled:opacity-60"
                >
                  <GraduationCap className="w-4 h-4 text-gray-500" />
                  Add Education
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.01, backgroundColor: '#f3f4f6' }}
                  onClick={() => handleAddSection('skills', 'Skills')}
                  disabled={!cvId || busy}
                  className="w-full flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg text-xs text-gray-700 transition-colors disabled:opacity-60"
                >
                  <Lightbulb className="w-4 h-4 text-gray-500" />
                  Add Skills
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.01, backgroundColor: '#f3f4f6' }}
                  onClick={() => handleAddSection('projects', 'Projects')}
                  disabled={!cvId || busy}
                  className="w-full flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg text-xs text-gray-700 transition-colors disabled:opacity-60"
                >
                  <FolderOpen className="w-4 h-4 text-gray-500" />
                  Add Project
                </motion.button>
              </div>
            </div>

            <div className="border-t border-gray-200" />

            {cv && cv.sections.length > 0 && (
              <div>
                <h3 className="flex items-center gap-1.5 text-xs font-semibold text-gray-900 mb-2">
                  <ListOrdered className="w-3.5 h-3.5" />
                  Sections (drag to reorder)
                </h3>
                <SectionReorderPanel
                  sections={cv.sections}
                  onReorder={(orderedIds) => reorderSections(orderedIds)}
                  onToggleVisibility={handleToggleVisibility}
                  onDelete={handleDeleteSection}
                />
              </div>
            )}

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

        <main className="flex-1 bg-slate-100 overflow-y-auto py-6 px-4 min-h-0">
          <div className="max-w-3xl mx-auto">
            <motion.div
              ref={previewRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white shadow-2xl rounded-xl overflow-hidden ring-1 ring-gray-200"
              style={{ minHeight: '900px' }}
            >
              <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
                {aiSuggestions && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="absolute top-4 right-4 bg-purple-600 text-white text-xs px-3 py-2 rounded-lg flex items-center gap-2 shadow-lg"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Great! Your title is clear and professional.</span>
                  </motion.div>
                )}

                <h1 className="text-3xl font-bold mb-1">
                  <EditableText
                    value={personalInfo.name}
                    onSave={(val) => {
                      const contactSection = cv?.sections.find(s => s.section_type === 'contact');
                      if (contactSection && cvId) {
                        updateSection(contactSection.id, { content_json: { ...content.contact, email: val } });
                      }
                    }}
                    className="text-white"
                  />
                </h1>
                <p className="text-base text-blue-100">
                  <EditableText
                    value={personalInfo.title}
                    onSave={(val) => {
                      // Would update title - need to implement CV title update
                      console.log('Title updated:', val);
                    }}
                    className="text-blue-100"
                  />
                </p>
              </div>

              <div className={`flex ${layout === 'modern' ? 'flex-row' : 'flex-col'}`}>
                {(layout === 'modern' || layout === 'minimal') && (
                  <div className={`${layout === 'modern' ? 'w-1/3' : 'w-full'} bg-gray-50 p-5 ${fontSizeClasses[fontSize]}`}>
                    <div className="mb-5">
                      <h2 className={`flex items-center gap-2 text-[10px] font-bold tracking-wider uppercase text-gray-900 mb-3 ${alignmentClasses[alignment]}`}>
                        <span className="w-5 h-0.5 bg-blue-600" />
                        Contact
                      </h2>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          <EditableText
                            value={personalInfo.email}
                            onSave={(val) => {
                              const contactSection = cv?.sections.find(s => s.section_type === 'contact');
                              if (contactSection && cvId) {
                                updateSection(contactSection.id, { content_json: { ...content.contact, email: val } });
                              }
                            }}
                            className="text-gray-600 text-xs"
                          />
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          <EditableText
                            value={personalInfo.phone}
                            onSave={(val) => {
                              const contactSection = cv?.sections.find(s => s.section_type === 'contact');
                              if (contactSection && cvId) {
                                updateSection(contactSection.id, { content_json: { ...content.contact, phone: val } });
                              }
                            }}
                            className="text-gray-600 text-xs"
                          />
                        </div>
                        <div className="flex items-center gap-2 text-blue-600">
                          <Link className="w-4 h-4 flex-shrink-0" />
                          <EditableText
                            value={personalInfo.linkedin}
                            onSave={(val) => {
                              const contactSection = cv?.sections.find(s => s.section_type === 'contact');
                              if (contactSection && cvId) {
                                updateSection(contactSection.id, { content_json: { ...content.contact, linkedin: val } });
                              }
                            }}
                            className="text-blue-600 text-xs"
                          />
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          <EditableText
                            value={personalInfo.location}
                            onSave={(val) => {
                              const contactSection = cv?.sections.find(s => s.section_type === 'contact');
                              if (contactSection && cvId) {
                                updateSection(contactSection.id, { content_json: { ...content.contact, location: val } });
                              }
                            }}
                            className="text-gray-600 text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mb-5">
                      <h2 className={`flex items-center gap-2 text-[10px] font-bold tracking-wider uppercase text-gray-900 mb-3 ${alignmentClasses[alignment]}`}>
                        <span className="w-5 h-0.5 bg-blue-600" />
                        Skills
                      </h2>
                      <div className="space-y-1">
                        {content.skills.items.map((skill, idx) => (
                          <div key={skill.id} className="flex items-start gap-2 text-gray-700">
                            <span className="text-gray-400 mt-1">&bull;</span>
                            <EditableText
                              value={skill.name}
                              onSave={(val) => {
                                const skillsSection = cv?.sections.find(s => s.section_type === 'skills');
                                if (skillsSection && cvId) {
                                  const newItems = [...content.skills.items];
                                  newItems[idx] = { ...skill, name: val };
                                  updateSection(skillsSection.id, { content_json: { items: newItems } });
                                }
                              }}
                              className="text-gray-700 text-xs"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h2 className={`flex items-center gap-2 text-[10px] font-bold tracking-wider uppercase text-gray-900 mb-3 ${alignmentClasses[alignment]}`}>
                        <span className="w-5 h-0.5 bg-blue-600" />
                        Languages
                      </h2>
                      <div className="space-y-1.5">
                        {content.languages.items.map((lang, idx) => (
                          <div key={lang.id} className="flex justify-between items-center gap-2">
                            <EditableText
                              value={lang.name}
                              onSave={(val) => {
                                const langSection = cv?.sections.find(s => s.section_type === 'languages');
                                if (langSection && cvId) {
                                  const newItems = [...content.languages.items];
                                  newItems[idx] = { ...lang, name: val };
                                  updateSection(langSection.id, { content_json: { items: newItems } });
                                }
                              }}
                              className="text-gray-700 text-xs"
                            />
                            <EditableText
                              value={lang.level}
                              onSave={(val) => {
                                const langSection = cv?.sections.find(s => s.section_type === 'languages');
                                if (langSection && cvId) {
                                  const newItems = [...content.languages.items];
                                  newItems[idx] = { ...lang, level: val };
                                  updateSection(langSection.id, { content_json: { items: newItems } });
                                }
                              }}
                              className="text-gray-500 text-xs"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className={`${layout === 'modern' ? 'w-2/3' : 'w-full'} p-5 ${fontSizeClasses[fontSize]}`}>
                  <div className="mb-5">
                    <h2 className={`flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-gray-900 mb-3 ${alignmentClasses[alignment]}`}>
                      <Star className="w-4 h-4 text-blue-600" />
                      Profile Summary
                    </h2>
                    <EditableText
                      value={content.summary.text}
                      onSave={(val) => {
                        const summarySection = cv?.sections.find(s => s.section_type === 'summary');
                        if (summarySection && cvId) {
                          updateSection(summarySection.id, { content_json: { text: val } });
                        }
                      }}
                      multiline
                      className={`text-gray-600 leading-relaxed text-sm ${fontWeightClasses[fontWeight]} ${alignmentClasses[alignment]}`}
                    />
                  </div>

                  <div className="mb-5">
                    <h2 className={`flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-gray-900 mb-3 ${alignmentClasses[alignment]}`}>
                      <GraduationCap className="w-4 h-4 text-blue-600" />
                      Education
                    </h2>
                    <div className="space-y-3">
                      {content.education.items.map((edu, idx) => {
                        const eduSection = cv?.sections.find(s => s.section_type === 'education');
                        const updateEdu = (updates: Partial<typeof edu>) => {
                          if (eduSection && cvId) {
                            const newItems = [...content.education.items];
                            newItems[idx] = { ...edu, ...updates };
                            updateSection(eduSection.id, { content_json: { items: newItems } });
                          }
                        };
                        return (
                          <div key={edu.id} className="border-l-2 border-blue-600 pl-4">
                            <div className="flex justify-between items-start mb-1 gap-2">
                              <EditableText
                                value={edu.degree}
                                onSave={(val) => updateEdu({ degree: val })}
                                className="font-semibold text-gray-900 text-xs"
                              />
                              <div className="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0">
                                <Calendar className="w-3 h-3" />
                                <EditableText
                                  value={`${edu.start_date} - ${edu.end_date}`}
                                  onSave={(val) => {
                                    const [start, end] = val.split(' - ');
                                    updateEdu({ start_date: start?.trim() || edu.start_date, end_date: end?.trim() || edu.end_date });
                                  }}
                                  className="text-gray-500 text-[10px]"
                                />
                              </div>
                            </div>
                            <EditableText
                              value={edu.school}
                              onSave={(val) => updateEdu({ school: val })}
                              className="text-blue-600 text-xs mb-1 block"
                            />
                            <EditableText
                              value={edu.description}
                              onSave={(val) => updateEdu({ description: val })}
                              multiline
                              className="text-gray-600 text-xs"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <h2 className={`flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-gray-900 mb-3 ${alignmentClasses[alignment]}`}>
                      <Briefcase className="w-4 h-4 text-blue-600" />
                      Professional Experience
                    </h2>
                    <div className="space-y-4">
                      {content.experience.items.map((exp, idx) => {
                        const expSection = cv?.sections.find(s => s.section_type === 'experience');
                        const updateExp = (updates: Partial<typeof exp>) => {
                          if (expSection && cvId) {
                            const newItems = [...content.experience.items];
                            newItems[idx] = { ...exp, ...updates };
                            updateSection(expSection.id, { content_json: { items: newItems } });
                          }
                        };
                        return (
                          <div key={exp.id} className="border-l-2 border-blue-600 pl-4">
                            <div className="flex justify-between items-start mb-1 gap-2">
                              <EditableText
                                value={exp.title}
                                onSave={(val) => updateExp({ title: val })}
                                className="font-semibold text-gray-900 text-xs"
                              />
                              <div className="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0">
                                <Calendar className="w-3 h-3" />
                                <EditableText
                                  value={`${exp.start_date} - ${exp.end_date}`}
                                  onSave={(val) => {
                                    const [start, end] = val.split(' - ');
                                    updateExp({ start_date: start?.trim() || exp.start_date, end_date: end?.trim() || exp.end_date });
                                  }}
                                  className="text-gray-500 text-[10px]"
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-1 text-blue-600 text-xs mb-2">
                              <EditableText
                                value={exp.company}
                                onSave={(val) => updateExp({ company: val })}
                                className="text-blue-600 text-xs"
                              />
                              <span>|</span>
                              <EditableText
                                value={exp.location}
                                onSave={(val) => updateExp({ location: val })}
                                className="text-blue-600 text-xs"
                              />
                            </div>
                            <ul className="space-y-1">
                              {exp.bullets.map((desc, bIdx) => (
                                <li key={bIdx} className="text-gray-600 text-xs flex items-start gap-2">
                                  <span className="text-gray-400 mt-1">&bull;</span>
                                  <EditableText
                                    value={desc}
                                    onSave={(val) => {
                                      const newBullets = [...exp.bullets];
                                      newBullets[bIdx] = val;
                                      updateExp({ bullets: newBullets });
                                    }}
                                    multiline
                                    className="text-gray-600 text-xs"
                                  />
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {layout === 'classic' && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h2 className={`flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-gray-900 mb-3 ${alignmentClasses[alignment]}`}>
                        <Globe className="w-4 h-4 text-blue-600" />
                        Contact Information
                      </h2>
                      <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                        <span>{personalInfo.email}</span>
                        <span>&bull;</span>
                        <span>{personalInfo.phone}</span>
                        <span>&bull;</span>
                        <span className="text-blue-600">{personalInfo.linkedin}</span>
                        <span>&bull;</span>
                        <span>{personalInfo.location}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            <p className="text-center text-xs text-gray-500 mt-3">
              Click on any text to edit directly. Hover over sections to see AI suggestions.
            </p>
          </div>
        </main>
      </div>

      {cvId && (
        <>
          <VersionHistoryDrawer
            cvId={cvId}
            open={historyOpen}
            onClose={() => setHistoryOpen(false)}
            onRestored={reload}
          />
          <AiSuggestionsPanel
            cvId={cvId}
            open={aiPanelOpen}
            onClose={() => setAiPanelOpen(false)}
            onAnalyzed={() => reload()}
          />
          <ShareLinksPanel
            cvId={cvId}
            open={shareOpen}
            onClose={() => setShareOpen(false)}
          />
        </>
      )}
    </div>
  );
};

export default CVEditorPage;
