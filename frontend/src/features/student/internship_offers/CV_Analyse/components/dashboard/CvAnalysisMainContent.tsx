import { FunctionComponent, type ChangeEvent, type RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowRight,
  Check,
  ChevronDown,
  Download,
  FileText,
  Lightbulb,
  MapPin,
  RefreshCw,
  Sparkles,
  Target,
  ThumbsUp,
  TrendingUp,
  Upload,
  Wrench,
  Zap,
} from 'lucide-react';
import type { CvAnalysisDashboardData } from '../../types/cvAnalysisDashboard';
import { STUDENT_INTERVIEW_SIMULATOR_PATH } from '../../../interview_Simulator/constants/routes';
import {
  AnimatedCounter,
  CircularScoreRing,
  fadeUp,
  fadeUpVariant,
  ScoreProgressBar,
  Sparkline,
  stagger,
} from './CvAnalysisPrimitives';
import { getScoreColorVar, getScoreTone } from '../../utils/cvAnalysisScore';

interface CvAnalysisMainContentProps {
  data: CvAnalysisDashboardData;
  expandedMatchId: string | null;
  onToggleMatch: (id: string) => void;
  expandedRecId: string | null;
  onToggleRec: (id: string) => void;
  onReanalyze: () => void;
  onImport: () => void;
  fileInputRef: RefObject<HTMLInputElement>;
  onImportFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

const INSIGHT_ICONS = {
  strengths: ThumbsUp,
  weaknesses: AlertTriangle,
  opportunities: Lightbulb,
  risks: Zap,
};

const CvAnalysisMainContent: FunctionComponent<CvAnalysisMainContentProps> = ({
  data,
  expandedMatchId,
  onToggleMatch,
  expandedRecId,
  onToggleRec,
  onReanalyze,
  onImport,
  fileInputRef,
  onImportFileChange,
}) => {
  const { t } = useTranslation();
  const { profile, meta, breakdown, insights, detectedSkills, missingSkills, internshipMatches, recommendations, roadmap, interviewSuggestions, careerMetrics } = data;
  const isDefaultCv = data.isDefaultCv !== false;

  const recsByPriority = {
    high: recommendations.filter((r) => r.priority === 'high'),
    medium: recommendations.filter((r) => r.priority === 'medium'),
    low: recommendations.filter((r) => r.priority === 'low'),
  };

  return (
    <div className="sr-cva__main">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={onImportFileChange}
      />

      {/* Hero */}
      <section id="cva-section-upload" className="sr-cva-glass sr-cva-glass--hero">
        <div className="sr-cva-hero__inner">
          <div className="min-w-0 flex-1">
            <div className="sr-cva-hero__profile">
              <div className="sr-cva-hero__avatar" aria-hidden>{profile.avatarInitials}</div>
              <div>
                <p className="m-0 text-sm font-semibold text-[var(--admin-text)]">{profile.name}</p>
                <p className="m-0 text-xs text-[var(--admin-text-secondary)]">{profile.program}</p>
                <div className="sr-cva-completion-bar">
                  <motion.div
                    className="sr-cva-completion-bar__fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${profile.profileCompletion}%` }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
                <p className="m-0 mt-1 text-xs text-[var(--admin-text-muted)]">
                  {t('student.internshipOffers.cvDashboard.hero.completion', { pct: profile.profileCompletion })}
                </p>
              </div>
            </div>

            {isDefaultCv ? (
              <span className="sr-cva-hero__badge mt-3">
                <FileText className="h-3.5 w-3.5" aria-hidden />
                {t('student.internshipOffers.cvDashboard.hero.defaultCvBadge')}
              </span>
            ) : null}

            <h1 className="sr-cva-hero__title mt-4">{t('student.internshipOffers.cvDashboard.hero.title')}</h1>
            <p className="sr-cva-hero__subtitle">
              {isDefaultCv
                ? t('student.internshipOffers.cvDashboard.hero.defaultCvSubtitle', { file: data.cvFileName })
                : t('student.internshipOffers.cvDashboard.hero.importedSubtitle', { file: data.cvFileName })}
            </p>
          </div>
          <div className="sr-cva-hero__actions">
            <button type="button" className="sr-cva-btn sr-cva-btn--secondary" onClick={onReanalyze}>
              <RefreshCw className="h-4 w-4" aria-hidden />
              {t('student.internshipOffers.cvDashboard.hero.reanalyze')}
            </button>
            <button type="button" className="sr-cva-btn sr-cva-btn--secondary">
              <Download className="h-4 w-4" aria-hidden />
              {t('student.internshipOffers.cvDashboard.hero.download')}
            </button>
          </div>
        </div>

        <div className="sr-cva-hero__import-prompt">
          <div className="min-w-0 flex-1">
            <p className="sr-cva-hero__import-title m-0">
              {t('student.internshipOffers.cvDashboard.hero.importPrompt')}
            </p>
            <p className="sr-cva-hero__import-desc m-0">
              {t('student.internshipOffers.cvDashboard.hero.importHint')}
            </p>
          </div>
          <button type="button" className="sr-cva-btn sr-cva-btn--primary shrink-0" onClick={onImport}>
            <Upload className="h-4 w-4" aria-hidden />
            {t('student.internshipOffers.cvDashboard.hero.importOtherCv')}
          </button>
        </div>
      </section>

      {/* Score Card */}
      <section id="cva-section-analysis">
        <motion.div className="sr-cva-glass sr-cva-score-card sr-cva-glass--hover" {...fadeUp}>
          <CircularScoreRing score={meta.overallScore} />
          <div className="min-w-0">
            <h2 className="m-0 text-lg font-bold text-[var(--admin-text)]">
              {t('student.internshipOffers.cvDashboard.score.title')}
            </h2>
            <p className="mt-1 text-sm text-[var(--admin-text-secondary)]">
              {t('student.internshipOffers.cvDashboard.score.lastAnalyzed', { date: meta.lastAnalyzed })}
            </p>
            <p className="text-xs text-[var(--admin-text-muted)]">
              {t('student.internshipOffers.cvDashboard.score.version', { version: meta.analysisVersion })}
            </p>
            <p className="mt-2 text-xs text-[var(--admin-text-muted)]">
              {data.cvFileName}
            </p>
          </div>
        </motion.div>

        <h3 className="sr-cva-section-title mt-6">{t('student.internshipOffers.cvDashboard.breakdown.title')}</h3>
        <motion.div className="sr-cva-breakdown-grid" variants={stagger} initial="initial" animate="animate">
          {breakdown.map((item, i) => {
            const tone = getScoreTone(item.score);
            const color = getScoreColorVar(tone);
            return (
              <motion.div
                key={item.id}
                className="sr-cva-glass sr-cva-breakdown-card sr-cva-glass--hover"
                variants={fadeUpVariant}
              >
                <div className="sr-cva-breakdown-card__label">{t(item.labelKey)}</div>
                <div className="sr-cva-breakdown-card__score" style={{ color }}>
                  <AnimatedCounter value={item.score} suffix={item.id === 'ats' || item.id === 'readiness' ? '%' : ''} />
                  {item.id !== 'ats' && item.id !== 'readiness' && (
                    <span className="text-sm font-medium text-[var(--admin-text-muted)]"> / 100</span>
                  )}
                </div>
                <ScoreProgressBar score={item.score} delay={i * 0.08} />
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* Compatibility */}
      <section id="cva-section-compatibility">
        <motion.div className="sr-cva-glass sr-cva-section-card" {...fadeUp}>
          <h3 className="sr-cva-section-title">
            <Target className="h-4 w-4 text-[var(--admin-brand)]" aria-hidden />
            {t('student.internshipOffers.cvDashboard.compatibility.title')}
          </h3>
          <p className="mb-4 text-sm text-[var(--admin-text-secondary)]">
            {t('student.internshipOffers.cvDashboard.compatibility.subtitle')}
          </p>
          <div className="flex flex-col gap-3">
            {internshipMatches.map((match) => {
              const isOpen = expandedMatchId === match.id;
              return (
                <motion.div
                  key={match.id}
                  className="sr-cva-glass sr-cva-match-card sr-cva-glass--hover"
                  layout
                  onClick={() => onToggleMatch(match.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && onToggleMatch(match.id)}
                >
                  <div className="sr-cva-match-card__head">
                    <div className="sr-cva-match-logo" aria-hidden>{match.companyInitials}</div>
                    <div className="min-w-0 flex-1">
                      <p className="m-0 text-sm font-bold text-[var(--admin-text)]">{match.title}</p>
                      <p className="m-0 flex items-center gap-1 text-xs text-[var(--admin-text-muted)]">
                        <MapPin className="h-3 w-3" aria-hidden />
                        {match.company} · {match.location}
                      </p>
                    </div>
                    <span className="sr-cva-match-pct">{match.matchPercent}%</span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-[var(--admin-text-muted)] transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      aria-hidden
                    />
                  </div>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        className="sr-cva-match-detail"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <p className="m-0 text-xs font-semibold text-[var(--admin-text)]">
                          {t('student.internshipOffers.cvDashboard.compatibility.whyScore')}
                        </p>
                        {[
                          { key: 'skills', val: match.breakdown.skills },
                          { key: 'location', val: match.breakdown.location },
                          { key: 'experience', val: match.breakdown.experience },
                          { key: 'education', val: match.breakdown.education },
                        ].map((row) => (
                          <div key={row.key} className="sr-cva-match-bar-row">
                            <span>{t(`student.internshipOffers.cvDashboard.compatibility.${row.key}`)}</span>
                            <ScoreProgressBar score={row.val} />
                            <span>{row.val}%</span>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* Recommendations */}
      <section id="cva-section-recommendations">
        <motion.div className="sr-cva-glass sr-cva-section-card" {...fadeUp}>
          <h3 className="sr-cva-section-title">
            <Lightbulb className="h-4 w-4 text-[var(--admin-brand)]" aria-hidden />
            {t('student.internshipOffers.cvDashboard.recs.title')}
          </h3>
          {(['high', 'medium', 'low'] as const).map((priority) => {
            const items = recsByPriority[priority];
            if (!items.length) return null;
            return (
              <div key={priority} className="mb-5 last:mb-0">
                <p className={`sr-cva-priority-badge sr-cva-priority-badge--${priority} mb-3`}>
                  {t(`student.internshipOffers.cvDashboard.recs.priority.${priority}`)}
                </p>
                <div className="flex flex-col gap-2">
                  {items.map((rec) => {
                    const isOpen = expandedRecId === rec.id;
                    return (
                      <div key={rec.id} className="sr-cva-glass sr-cva-rec-card sr-cva-glass--hover">
                        <div
                          className="sr-cva-rec-card__head"
                          onClick={() => onToggleRec(rec.id)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => e.key === 'Enter' && onToggleRec(rec.id)}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="m-0 text-sm font-semibold text-[var(--admin-text)]">{t(rec.titleKey)}</p>
                            <AnimatePresence>
                              {isOpen && (
                                <motion.p
                                  className="m-0 mt-1 text-xs text-[var(--admin-text-secondary)]"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                >
                                  {t(rec.descriptionKey)}
                                </motion.p>
                              )}
                            </AnimatePresence>
                          </div>
                          <span className="sr-cva-rec-gain">
                            <TrendingUp className="h-3 w-3" aria-hidden />
                            +{rec.scoreGain} {t('student.internshipOffers.cvDashboard.recs.points')}
                          </span>
                          <ChevronDown
                            className={`h-4 w-4 shrink-0 text-[var(--admin-text-muted)] transition-transform ${isOpen ? 'rotate-180' : ''}`}
                            aria-hidden
                          />
                        </div>
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              className="mt-3 flex items-center justify-between gap-2 border-t border-[var(--cva-glass-border)] pt-3"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                            >
                              <span className="text-xs text-[var(--admin-text-muted)]">
                                {t('student.internshipOffers.cvDashboard.recs.impact')}: {rec.impactLevel}/10
                              </span>
                              <button type="button" className="sr-cva-btn sr-cva-btn--primary" style={{ padding: '0.375rem 0.875rem', minHeight: 32, fontSize: '0.75rem' }}>
                                {t(rec.actionKey)}
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* Roadmap */}
        <motion.div className="sr-cva-glass mt-4" {...fadeUp}>
          <div className="sr-cva-section-card" style={{ paddingBottom: 0 }}>
            <h3 className="sr-cva-section-title">{t('student.internshipOffers.cvDashboard.roadmap.title')}</h3>
          </div>
          <div className="sr-cva-roadmap">
            {roadmap.map((step) => (
              <div key={step.id} className="sr-cva-roadmap__step">
                <div className={`sr-cva-roadmap__dot${step.completed ? ' sr-cva-roadmap__dot--done' : ''}`}>
                  {step.completed ? <Check className="h-3 w-3" aria-hidden /> : step.step}
                </div>
                <div>
                  <p className="m-0 text-sm font-semibold text-[var(--admin-text)]">
                    {t('student.internshipOffers.cvDashboard.roadmap.step', { n: step.step })}
                  </p>
                  <p className="m-0 text-xs text-[var(--admin-text-secondary)]">{t(step.titleKey)}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Before / After */}
        <motion.div className="sr-cva-glass sr-cva-compare mt-4" {...fadeUp}>
          <div>
            <div className="sr-cva-compare__score" style={{ color: getScoreColorVar(getScoreTone(meta.overallScore)) }}>
              <AnimatedCounter value={meta.overallScore} />
            </div>
            <p className="sr-cva-compare__label">{t('student.internshipOffers.cvDashboard.compare.current')}</p>
          </div>
          <ArrowRight className="sr-cva-compare__arrow h-8 w-8" aria-hidden />
          <div>
            <div className="sr-cva-compare__score" style={{ color: getScoreColorVar(getScoreTone(meta.potentialScore)) }}>
              <AnimatedCounter value={meta.potentialScore} />
            </div>
            <p className="sr-cva-compare__label">{t('student.internshipOffers.cvDashboard.compare.potential')}</p>
          </div>
        </motion.div>
      </section>

      {/* Skills */}
      <section id="cva-section-skills">
        <motion.div className="sr-cva-glass sr-cva-section-card" {...fadeUp}>
          <h3 className="sr-cva-section-title">
            <Wrench className="h-4 w-4 text-[var(--admin-brand)]" aria-hidden />
            {t('student.internshipOffers.cvDashboard.skills.title')}
          </h3>
          <p className="mb-3 text-sm font-semibold text-[var(--admin-text)]">
            {t('student.internshipOffers.cvDashboard.skills.detected')}
          </p>
          <div className="sr-cva-chips mb-5">
            {detectedSkills.map((skill) => (
              <span key={skill.id} className="sr-cva-chip">{skill.name}</span>
            ))}
          </div>
          <p className="mb-3 text-sm font-semibold text-[var(--admin-text)]">
            {t('student.internshipOffers.cvDashboard.skills.missing')}
          </p>
          <div className="sr-cva-chips">
            {missingSkills.map((skill) => (
              <span
                key={skill.id}
                className={`sr-cva-chip sr-cva-chip--missing-${skill.priority ?? 'optional'}`}
              >
                {skill.name}
                <span className="text-[0.625rem] opacity-80">
                  {t(`student.internshipOffers.cvDashboard.skills.priority.${skill.priority}`)}
                </span>
              </span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* AI Analysis */}
      <section id="cva-section-ai">
        <motion.div className="sr-cva-glass sr-cva-section-card" {...fadeUp}>
          <h3 className="sr-cva-section-title">
            <Sparkles className="h-4 w-4 text-[var(--admin-brand)]" aria-hidden />
            {t('student.internshipOffers.cvDashboard.ai.title')}
          </h3>
          <div className="sr-cva-insights-grid">
            {insights.map((group) => {
              const Icon = INSIGHT_ICONS[group.category];
              return (
                <div
                  key={group.category}
                  className={`sr-cva-glass sr-cva-insight-group sr-cva-insight-group--${group.category} sr-cva-glass--hover`}
                >
                  <div className="sr-cva-insight-group__head">
                    <Icon className="h-4 w-4" aria-hidden />
                    {t(`student.internshipOffers.cvDashboard.ai.${group.category}`)}
                  </div>
                  <ul className="sr-cva-insight-list">
                    {group.items.map((item) => (
                      <li key={item.id}>{item.text}</li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* Interview */}
      <section id="cva-section-interview">
        <motion.div className="sr-cva-glass sr-cva-section-card" {...fadeUp}>
          <h3 className="sr-cva-section-title">
            <Sparkles className="h-4 w-4 text-[var(--admin-brand)]" aria-hidden />
            {t('student.internshipOffers.cvDashboard.interview.title')}
          </h3>
          <p className="mb-4 text-sm text-[var(--admin-text-secondary)]">
            {t('student.internshipOffers.cvDashboard.interview.subtitle')}
          </p>
          <div className="mb-4 flex flex-col gap-2">
            {interviewSuggestions.map((s) => (
              <div
                key={s.id}
                className="sr-cva-glass flex items-center justify-between gap-3 p-3 sr-cva-glass--hover"
              >
                <span className="text-sm font-medium text-[var(--admin-text)]">{t(s.titleKey)}</span>
                <span className="admin-badge admin-badge--info text-xs">{s.type}</span>
              </div>
            ))}
          </div>
          <Link to={STUDENT_INTERVIEW_SIMULATOR_PATH} className="sr-cva-btn sr-cva-btn--primary w-full sm:w-auto">
            {t('student.internshipOffers.cvDashboard.interview.cta')}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </motion.div>
      </section>

      {/* Career Insights */}
      <section id="cva-section-career">
        <motion.div className="sr-cva-glass sr-cva-section-card" {...fadeUp}>
          <h3 className="sr-cva-section-title">
            <TrendingUp className="h-4 w-4 text-[var(--admin-brand)]" aria-hidden />
            {t('student.internshipOffers.cvDashboard.career.title')}
          </h3>
          <div className="sr-cva-metrics-grid">
            {careerMetrics.map((metric) => (
              <div key={metric.id} className="sr-cva-glass sr-cva-metric-card sr-cva-glass--hover">
                <div className="sr-cva-metric-card__value">
                  <AnimatedCounter value={metric.value} suffix={metric.unit ?? ''} />
                </div>
                <div className="sr-cva-metric-card__label">{t(metric.labelKey)}</div>
                <Sparkline values={metric.trend} />
              </div>
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default CvAnalysisMainContent;
