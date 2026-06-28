import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Award,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  FileText,
  RotateCcw,
  Target,
  TrendingUp,
  XCircle,
} from 'lucide-react';
import { STUDENT_CV_ANALYSIS_TOOL_PATH } from '../../../CV_Analyse/constants/routes';
import { STUDENT_INTERNSHIP_OFFERS_PATH } from '../../../constants/routes';
import type { InterviewSimulationReport } from '../../../types/offerAiCoach';
import type { TranscriptEntry } from '../../types/interviewSimulatorDashboard';
import { AnimatedCounter, CircularScore, fadeUp, ScoreBar } from './InterviewPrimitives';

interface InterviewSummaryViewProps {
  overallScore: number;
  report: InterviewSimulationReport | null;
  transcript: TranscriptEntry[];
  onRetake: () => void;
  onBackToHub: () => void;
  onOpenReport?: () => void;
  expandedTranscriptId: string | null;
  onToggleTranscript: (id: string) => void;
}

function getScoreTier(score: number): { label: string; cls: string } {
  if (score >= 85) return { label: 'Excellent', cls: 'sr-is-score-tier--excellent' };
  if (score >= 70) return { label: 'Good', cls: 'sr-is-score-tier--good' };
  if (score >= 55) return { label: 'Fair', cls: 'sr-is-score-tier--fair' };
  return { label: 'Needs Work', cls: 'sr-is-score-tier--low' };
}

const InterviewSummaryView: FunctionComponent<InterviewSummaryViewProps> = ({
  overallScore,
  report,
  transcript,
  onRetake,
  onBackToHub,
  onOpenReport,
  expandedTranscriptId,
  onToggleTranscript,
}) => {
  const { t } = useTranslation();
  const isInsufficient =
    (report?.answers_analyzed ?? 0) === 0
    || report?.readiness_key === 'insufficient_data'
    || report?.insufficient_data;
  const tier = isInsufficient
    ? { label: report?.readiness_text ?? '—', cls: 'sr-is-score-tier--low' }
    : getScoreTier(overallScore);
  const breakdown = report?.categories ?? [];
  const strengths = report?.strengths ?? [];
  const weaknesses = report?.weaknesses ?? [];
  const skillGaps = report?.missing_skills ?? [];
  const timeline = report?.timeline ?? transcript.map((entry, index) => ({
    order: index + 1,
    question: entry.question,
    answer: entry.answer,
    score: entry.score,
  }));

  return (
    <div className="sr-is__root sr-is flex flex-col gap-6 pb-8">
      <motion.div className="sr-is-glass sr-is-summary-hero" {...fadeUp}>
        <div className="sr-is-celebration" aria-hidden>🎉</div>
        <h1 className="sr-is-hero__title">{t('student.internshipOffers.interviewSim.summary.completed')}</h1>
        {report?.role_label ? (
          <p className="sr-is-summary-role-badge">{report.role_label}</p>
        ) : null}
        {isInsufficient ? (
          <div className="sr-is-report-empty-state sr-is-report-empty-state--summary">
            <p className="sr-is-report-empty-state__title">
              {t('student.internshipOffers.interviewSim.report.noAnswersTitle')}
            </p>
            <p className="sr-is-report-empty-state__desc">
              {t('student.internshipOffers.interviewSim.report.noAnswersDesc')}
            </p>
          </div>
        ) : (
          <CircularScore score={overallScore} />
        )}
        <div className={`sr-is-score-tier ${tier.cls}`}>
          <Award className="h-3.5 w-3.5" aria-hidden />
          {report?.readiness_text ?? tier.label}
        </div>
        {onOpenReport && !isInsufficient ? (
          <button type="button" className="sr-is-btn sr-is-btn--secondary mt-3" onClick={onOpenReport}>
            {t('student.internshipOffers.interviewSim.report.viewDetails')}
          </button>
        ) : null}
      </motion.div>

      {breakdown.length > 0 && !isInsufficient ? (
        <motion.section className="sr-is-glass p-4" {...fadeUp}>
          <h2 className="sr-is-section-title">{t('student.internshipOffers.interviewSim.summary.breakdownTitle')}</h2>
          <div className="sr-is-breakdown-grid">
            {breakdown.map((item) => (
              <div key={item.id} className="sr-is-glass sr-is-breakdown-item sr-is-glass--hover">
                <div className="sr-is-breakdown-item__score">
                  <AnimatedCounter value={item.score} suffix="%" />
                </div>
                <div className="sr-is-breakdown-item__label">{item.label}</div>
                <ScoreBar score={item.score} />
              </div>
            ))}
          </div>
        </motion.section>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <motion.section className="sr-is-glass p-4" {...fadeUp}>
          <h2 className="sr-is-section-title" style={{ color: 'var(--is-score-high)' }}>
            <CheckCircle2 className="h-4 w-4" aria-hidden />
            {t('student.internshipOffers.interviewSim.summary.strengthsTitle')}
          </h2>
          <ul className="m-0 space-y-2 p-0 list-none">
            {strengths.length > 0 ? strengths.map((item) => (
              <li key={item} className="sr-is-summary-sw-item sr-is-summary-sw-item--strength">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
                {item}
              </li>
            )) : (
              <li className="sr-is-summary-sw-item sr-is-summary-sw-item--strength">
                {t('student.internshipOffers.interviewSim.report.noStrengths')}
              </li>
            )}
          </ul>
        </motion.section>
        <motion.section className="sr-is-glass p-4" {...fadeUp}>
          <h2 className="sr-is-section-title" style={{ color: 'var(--is-score-medium)' }}>
            <XCircle className="h-4 w-4" aria-hidden />
            {t('student.internshipOffers.interviewSim.summary.weaknessesTitle')}
          </h2>
          <ul className="m-0 space-y-2 p-0 list-none">
            {weaknesses.length > 0 ? weaknesses.map((item) => (
              <li key={item} className="sr-is-summary-sw-item sr-is-summary-sw-item--weakness">
                <XCircle className="h-3.5 w-3.5 shrink-0" aria-hidden />
                {item}
              </li>
            )) : (
              <li className="sr-is-summary-sw-item sr-is-summary-sw-item--weakness">
                {t('student.internshipOffers.interviewSim.report.noWeaknesses')}
              </li>
            )}
          </ul>
        </motion.section>
      </div>

      {report?.recommendations?.length ? (
        <motion.section className="sr-is-glass p-4" {...fadeUp}>
          <h2 className="sr-is-section-title">
            <Target className="h-4 w-4 text-[var(--admin-brand)]" aria-hidden />
            {t('student.internshipOffers.interviewSim.summary.coachTitle')}
          </h2>
          <ul className="m-0 space-y-2 p-0 list-none">
            {report.recommendations.map((item) => (
              <li key={item} className="text-sm leading-relaxed text-[var(--admin-text-secondary)]">
                {item}
              </li>
            ))}
          </ul>
        </motion.section>
      ) : null}

      {transcript.length > 0 ? (
        <motion.section className="sr-is-glass" {...fadeUp}>
          <h2 className="sr-is-section-title px-4 pt-4">
            <FileText className="h-4 w-4 text-[var(--admin-brand)]" aria-hidden />
            {t('student.internshipOffers.interviewSim.summary.transcriptTitle')}
          </h2>
          {transcript.map((entry) => {
            const open = expandedTranscriptId === entry.id;
            return (
              <div key={entry.id}>
                <button
                  type="button"
                  className="sr-is-accordion__trigger"
                  onClick={() => onToggleTranscript(entry.id)}
                >
                  <span className="truncate pr-2">{entry.question}</span>
                  <span className="flex shrink-0 items-center gap-2">
                    {entry.score > 0 ? (
                      <span className="font-bold text-[var(--admin-brand)]">{entry.score}%</span>
                    ) : null}
                    <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
                  </span>
                </button>
                {open && (
                  <div className="sr-is-accordion__body">
                    <p className="m-0 mb-2 font-semibold text-[var(--admin-text)]">
                      {t('student.internshipOffers.interviewSim.summary.yourAnswer')}
                    </p>
                    <p className="m-0 mb-3">{entry.answer}</p>
                    {entry.feedback ? (
                      <>
                        <p className="m-0 mb-1 font-semibold text-[var(--admin-text)]">
                          {t('student.internshipOffers.interviewSim.summary.aiFeedback')}
                        </p>
                        <p className="m-0">{entry.feedback}</p>
                      </>
                    ) : null}
                  </div>
                )}
              </div>
            );
          })}
        </motion.section>
      ) : null}

      {timeline.length > 0 ? (
        <motion.section className="sr-is-glass p-4" {...fadeUp}>
          <h2 className="sr-is-section-title">
            <BarChart3 className="h-4 w-4 text-[var(--admin-brand)]" aria-hidden />
            {t('student.internshipOffers.interviewSim.summary.timelineTitle')}
          </h2>
          <div className="sr-is-timeline">
            {timeline.map((item) => (
              <div key={item.order} className="sr-is-timeline__item">
                <div className="sr-is-timeline__dot">{item.order}</div>
                <div className="flex-1">
                  <p className="m-0 text-sm font-semibold text-[var(--admin-text)]">
                    {t('student.internshipOffers.interviewSim.summary.questionN', { n: item.order })}
                  </p>
                </div>
                {typeof item.score === 'number' ? (
                  <span className="text-sm font-bold text-[var(--admin-brand)]">{item.score}%</span>
                ) : null}
              </div>
            ))}
          </div>
        </motion.section>
      ) : null}

      {skillGaps.length > 0 ? (
        <motion.section className="sr-is-glass p-4" {...fadeUp}>
          <h2 className="sr-is-section-title">{t('student.internshipOffers.interviewSim.summary.skillGapsTitle')}</h2>
          <div className="flex flex-wrap gap-2">
            {skillGaps.map((gap) => (
              <span key={gap} className="sr-is-skill-gap">
                {gap}
              </span>
            ))}
          </div>
        </motion.section>
      ) : null}

      <motion.section {...fadeUp}>
        <h2 className="sr-is-section-title">{t('student.internshipOffers.interviewSim.summary.nextActions')}</h2>
        <div className="sr-is-next-actions">
          <button type="button" className="sr-is-glass sr-is-next-card sr-is-glass--hover" onClick={onRetake}>
            <span className="sr-is-next-card__icon" aria-hidden>
              <RotateCcw strokeWidth={1.75} />
            </span>
            <span className="sr-is-next-card__label">{t('student.internshipOffers.interviewSim.summary.retake')}</span>
          </button>
          <button type="button" className="sr-is-glass sr-is-next-card sr-is-glass--hover" onClick={onRetake}>
            <span className="sr-is-next-card__icon" aria-hidden>
              <TrendingUp strokeWidth={1.75} />
            </span>
            <span className="sr-is-next-card__label">{t('student.internshipOffers.interviewSim.summary.higherDifficulty')}</span>
          </button>
          <button type="button" className="sr-is-glass sr-is-next-card sr-is-glass--hover" onClick={onBackToHub}>
            <span className="sr-is-next-card__icon" aria-hidden>
              <Target strokeWidth={1.75} />
            </span>
            <span className="sr-is-next-card__label">{t('student.internshipOffers.interviewSim.summary.practiceSkills')}</span>
          </button>
          <Link to={STUDENT_CV_ANALYSIS_TOOL_PATH} className="sr-is-glass sr-is-next-card sr-is-glass--hover no-underline">
            <span className="sr-is-next-card__icon" aria-hidden>
              <FileText strokeWidth={1.75} />
            </span>
            <span className="sr-is-next-card__label">{t('student.internshipOffers.interviewSim.summary.openCv')}</span>
          </Link>
          <Link to={STUDENT_INTERNSHIP_OFFERS_PATH} className="sr-is-glass sr-is-next-card sr-is-glass--hover no-underline">
            <span className="sr-is-next-card__icon" aria-hidden>
              <ArrowRight strokeWidth={1.75} />
            </span>
            <span className="sr-is-next-card__label">{t('student.internshipOffers.interviewSim.summary.matchingOffers')}</span>
          </Link>
        </div>
      </motion.section>
    </div>
  );
};

export default InterviewSummaryView;
