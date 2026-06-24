import { FunctionComponent, useCallback, useState, type ChangeEvent, type RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  Download,
  FileText,
  Loader2,
  Lightbulb,
  MapPin,
  Mic,
  RefreshCw,
  Sparkles,
  Target,
  ThumbsUp,
  TrendingUp,
  Upload,
  Wrench,
  Zap,
} from 'lucide-react';
import type { CvAnalysisDashboardData, CvAnalysisStatus } from '../../types/cvAnalysisDashboard';
import { STUDENT_INTERVIEW_SIMULATOR_PATH } from '../../../interview_Simulator/constants/routes';
import OfferCompanyLogo from '../../../../../admin/offres-stage/components/OfferCompanyLogo';
import { resolveMediaUrl } from '../../../../../../shared/api/mediaUrl';
import { formatInterviewSuggestionTitle, resolveDynamicLabel } from '../../utils/resolveDynamicLabel';
import {
  AnimatedCounter,
  CircularScoreRing,
  fadeUp,
  fadeUpVariant,
  ScoreProgressBar,
  stagger,
} from './CvAnalysisPrimitives';
import { getScoreColorVar, getScoreTone } from '../../utils/cvAnalysisScore';
import CvFullPreview from './CvFullPreview';
import CvAnalysisHeroAvatar from './CvAnalysisHeroAvatar';
import ImprovementRoadmap from './ImprovementRoadmap';
import { downloadCvAnalysisReport } from '../../utils/downloadCvAnalysisReport';

interface CvAnalysisMainContentProps {
  data: CvAnalysisDashboardData;
  analysisStatus: CvAnalysisStatus;
  isAnalyzing?: boolean;
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
  analysisStatus,
  isAnalyzing = false,
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
  const [isDownloadingReport, setIsDownloadingReport] = useState(false);
  const { profile, meta, breakdown, insights, detectedSkills, missingSkills, internshipMatches, recommendations, roadmap, interviewSuggestions } = data;
  const isDefaultCv = data.isDefaultCv !== false;

  const recsByPriority = {
    high: recommendations.filter((r) => r.priority === 'high'),
    medium: recommendations.filter((r) => r.priority === 'medium'),
    low: recommendations.filter((r) => r.priority === 'low'),
  };

  const handleDownloadReport = useCallback(async () => {
    if (isDownloadingReport) return;
    setIsDownloadingReport(true);
    try {
      await downloadCvAnalysisReport(data, t);
    } catch {
      // Silent fail — user can retry
    } finally {
      setIsDownloadingReport(false);
    }
  }, [data, isDownloadingReport, t]);

  const statusKey = analysisStatus === 'up_to_date'
    ? 'upToDate'
    : analysisStatus === 'outdated'
      ? 'outdated'
      : analysisStatus === 'processing' || isAnalyzing
        ? 'processing'
        : analysisStatus === 'failed'
          ? 'failed'
          : 'none';

  return (
    <div className="sr-cva__main">
      {analysisStatus === 'none' ? (
        <div className="sr-cva-outdated-banner" role="status">
          <Sparkles className="h-4 w-4 shrink-0" aria-hidden />
          <p className="m-0 flex-1 text-sm">{t('student.internshipOffers.cvDashboard.status.noneMessage')}</p>
          <button type="button" className="sr-cva-btn sr-cva-btn--primary sr-cva-btn--sm" onClick={onReanalyze}>
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            {t('student.internshipOffers.cvDashboard.hero.startAnalysis')}
          </button>
        </div>
      ) : null}

      {analysisStatus === 'outdated' ? (
        <div className="sr-cva-outdated-banner" role="status">
          <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />
          <p className="m-0 flex-1 text-sm">{t('student.internshipOffers.cvDashboard.status.outdatedMessage')}</p>
          <button type="button" className="sr-cva-btn sr-cva-btn--primary sr-cva-btn--sm" onClick={onReanalyze}>
            <RefreshCw className="h-3.5 w-3.5" aria-hidden />
            {t('student.internshipOffers.cvDashboard.hero.reanalyze')}
          </button>
        </div>
      ) : null}

      {isAnalyzing ? (
        <div className="sr-cva-processing-banner" role="status">
          <RefreshCw className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
          <p className="m-0 text-sm">{t('student.internshipOffers.cvDashboard.analyzing.desc')}</p>
        </div>
      ) : null}

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
              <CvAnalysisHeroAvatar profile={profile} />
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
            {analysisStatus === 'none' ? (
              <button type="button" className="sr-cva-btn sr-cva-btn--primary" onClick={onReanalyze}>
                <Sparkles className="h-4 w-4" aria-hidden />
                {t('student.internshipOffers.cvDashboard.hero.startAnalysis')}
              </button>
            ) : (
              <button type="button" className="sr-cva-btn sr-cva-btn--secondary" onClick={onReanalyze} disabled={isAnalyzing}>
                <RefreshCw className={`h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} aria-hidden />
                {t('student.internshipOffers.cvDashboard.hero.reanalyze')}
              </button>
            )}
            {analysisStatus !== 'none' ? (
              <button
                type="button"
                className="sr-cva-btn sr-cva-btn--secondary"
                onClick={() => void handleDownloadReport()}
                disabled={isDownloadingReport || isAnalyzing}
                aria-busy={isDownloadingReport}
              >
                {isDownloadingReport ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Download className="h-4 w-4" aria-hidden />
                )}
                {isDownloadingReport
                  ? t('student.internshipOffers.cvDashboard.hero.downloading', { defaultValue: 'Génération…' })
                  : t('student.internshipOffers.cvDashboard.hero.download')}
              </button>
            ) : null}
            <button type="button" className="sr-cva-btn sr-cva-btn--primary" onClick={onImport}>
              <Upload className="h-4 w-4" aria-hidden />
              {t('student.internshipOffers.cvDashboard.hero.importOtherCv')}
            </button>
          </div>
        </div>

        {(data.importedPreview || data.cvSnapshot) ? (
          <CvFullPreview
            key={
              data.importedPreview?.objectUrl ??
              data.importedPreview?.fileName ??
              data.cvFileName ??
              'cv-preview'
            }
            snapshot={data.cvSnapshot}
            importedPreview={data.importedPreview}
            cvFileUrl={data.cvFileUrl}
            fileName={data.cvFileName}
          />
        ) : null}
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
            {meta.cvVersion ? (
              <p className="text-xs text-[var(--admin-text-muted)]">
                {t('student.internshipOffers.cvDashboard.score.cvVersion', { version: meta.cvVersion })}
              </p>
            ) : null}
            <span className={`sr-cva-status-badge sr-cva-status-badge--${statusKey} mt-2`}>
              {t(`student.internshipOffers.cvDashboard.status.${statusKey}`)}
            </span>
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
            {internshipMatches.length === 0 ? (
              <p className="text-sm text-[var(--admin-text-secondary)]">
                {t('student.internshipOffers.cvDashboard.compatibility.empty', {
                  defaultValue: 'Aucune offre publiée disponible pour le moment.',
                })}
              </p>
            ) : null}
            {internshipMatches.map((match) => {
              const isOpen = expandedMatchId === match.id;
              const level = match.matchLevel;
              const levelLabel =
                level === 'strong'
                  ? 'Forte'
                  : level === 'partial'
                    ? 'Partielle'
                    : level === 'weak'
                      ? 'Faible'
                      : 'Non compatible';
              const levelClass =
                level === 'strong'
                  ? 'admin-badge--success'
                  : level === 'partial'
                    ? 'admin-badge--info'
                    : 'admin-badge--warning';
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
                    <OfferCompanyLogo
                      url={resolveMediaUrl(match.companyLogoUrl)}
                      companyName={match.company}
                      size="table"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="m-0 text-sm font-bold text-[var(--admin-text)]">{match.title}</p>
                      <p className="m-0 flex items-center gap-1 text-xs text-[var(--admin-text-muted)]">
                        <MapPin className="h-3 w-3" aria-hidden />
                        {match.company} · {match.location}
                      </p>
                      {level ? (
                        <span className={`admin-badge ${levelClass} mt-1 text-[10px]`}>{levelLabel}</span>
                      ) : null}
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
                        {match.explanation ? (
                          <p className="m-0 mb-2 text-xs text-[var(--admin-text-secondary)]">{match.explanation}</p>
                        ) : null}
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
                            <p className="m-0 text-sm font-semibold text-[var(--admin-text)]">
                              {resolveDynamicLabel(t, rec.titleKey, rec.isDynamic)}
                            </p>
                            <AnimatePresence>
                              {isOpen && (
                                <motion.p
                                  className="m-0 mt-1 text-xs text-[var(--admin-text-secondary)]"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                >
                                  {resolveDynamicLabel(t, rec.descriptionKey, rec.isDynamic)}
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

        <ImprovementRoadmap steps={roadmap} />

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
        <motion.div className="sr-cva-glass sr-cva-section-card sr-cva-skills" {...fadeUp}>
          <div className="sr-cva-skills__header">
            <h3 className="sr-cva-section-title m-0">
              <Wrench className="h-4 w-4 text-[var(--admin-brand)]" aria-hidden />
              {t('student.internshipOffers.cvDashboard.skills.title')}
            </h3>
          </div>

          <div className="sr-cva-skills-grid">
            <div className="sr-cva-skills-panel sr-cva-skills-panel--detected">
              <div className="sr-cva-skills-panel__head">
                <span className="sr-cva-skills-panel__icon" aria-hidden>
                  <CheckCircle2 className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="sr-cva-skills-panel__title">
                    {t('student.internshipOffers.cvDashboard.skills.detected')}
                  </p>
                  <p className="sr-cva-skills-panel__count">
                    {t('student.internshipOffers.cvDashboard.skills.detectedCount', {
                      count: detectedSkills.length,
                      defaultValue: '{{count}} compétence(s)',
                    })}
                  </p>
                </div>
              </div>
              <div className="sr-cva-skills-chips">
                {detectedSkills.length === 0 ? (
                  <p className="sr-cva-skills-empty">
                    {t('student.internshipOffers.cvDashboard.skills.noDetected', {
                      defaultValue: 'Aucune compétence détectée pour le moment.',
                    })}
                  </p>
                ) : (
                  detectedSkills.map((skill) => (
                    <span key={skill.id} className="sr-cva-skill-chip sr-cva-skill-chip--detected">
                      {skill.name}
                    </span>
                  ))
                )}
              </div>
            </div>

            <div className="sr-cva-skills-panel sr-cva-skills-panel--missing">
              <div className="sr-cva-skills-panel__head">
                <span className="sr-cva-skills-panel__icon" aria-hidden>
                  <AlertTriangle className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="sr-cva-skills-panel__title">
                    {t('student.internshipOffers.cvDashboard.skills.missing')}
                  </p>
                  <p className="sr-cva-skills-panel__count">
                    {t('student.internshipOffers.cvDashboard.skills.missingCount', {
                      count: missingSkills.length,
                      defaultValue: '{{count}} à développer',
                    })}
                  </p>
                </div>
              </div>
              <div className="sr-cva-skills-chips">
                {missingSkills.length === 0 ? (
                  <p className="sr-cva-skills-empty">
                    {t('student.internshipOffers.cvDashboard.skills.noMissing', {
                      defaultValue: 'Aucune lacune identifiée — excellent profil !',
                    })}
                  </p>
                ) : (
                  missingSkills.map((skill) => (
                    <span
                      key={skill.id}
                      className={`sr-cva-skill-chip sr-cva-skill-chip--missing-${skill.priority ?? 'optional'}`}
                    >
                      <span className="sr-cva-skill-chip__name">{skill.name}</span>
                      <span className="sr-cva-skill-chip__priority">
                        {t(`student.internshipOffers.cvDashboard.skills.priority.${skill.priority ?? 'optional'}`)}
                      </span>
                    </span>
                  ))
                )}
              </div>
            </div>
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
        <motion.div className="sr-cva-glass sr-cva-section-card sr-cva-interview" {...fadeUp}>
          <div className="sr-cva-interview__header">
            <h3 className="sr-cva-section-title m-0">
              <Sparkles className="h-4 w-4 text-[var(--admin-brand)]" aria-hidden />
              {t('student.internshipOffers.cvDashboard.interview.title')}
            </h3>
            <p className="sr-cva-interview__subtitle">
              {t('student.internshipOffers.cvDashboard.interview.subtitle')}
            </p>
          </div>
          <div className="sr-cva-interview-list">
            {interviewSuggestions.map((s, index) => (
              <div key={s.id} className="sr-cva-interview-item sr-cva-glass--hover">
                <span className="sr-cva-interview-item__index" aria-hidden>
                  {index + 1}
                </span>
                <span className="sr-cva-interview-item__icon" aria-hidden>
                  <Mic className="h-4 w-4" />
                </span>
                <div className="sr-cva-interview-item__body">
                  <p className="sr-cva-interview-item__title">
                    {formatInterviewSuggestionTitle(resolveDynamicLabel(t, s.titleKey, true))}
                  </p>
                  {s.reason ? (
                    <p className="sr-cva-interview-item__reason">{s.reason}</p>
                  ) : null}
                </div>
                <span className={`sr-cva-interview-type-badge sr-cva-interview-type-badge--${s.type}`}>
                  {t(`student.internshipOffers.cvDashboard.interview.types.${s.type}`, s.type)}
                </span>
              </div>
            ))}
          </div>
          <div className="sr-cva-interview-cta">
            <Link to={STUDENT_INTERVIEW_SIMULATOR_PATH} className="sr-cva-btn sr-cva-btn--ai">
              {t('student.internshipOffers.cvDashboard.interview.cta')}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default CvAnalysisMainContent;
