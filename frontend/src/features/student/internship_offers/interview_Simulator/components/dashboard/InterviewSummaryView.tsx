import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  ChevronDown,
  FileText,
  RotateCcw,
  Target,
  TrendingUp,
} from 'lucide-react';
import {
  IMPROVEMENT_ROADMAP,
  MOCK_TRANSCRIPT,
  SKILL_GAPS,
  SUMMARY_BREAKDOWN,
  SUMMARY_STRENGTHS,
  SUMMARY_WEAKNESSES,
  TIMELINE_SCORES,
} from '../../data/interviewSimulatorDashboardMock';
import { STUDENT_CV_ANALYSIS_TOOL_PATH } from '../../../CV_Analyse/constants/routes';
import { STUDENT_INTERNSHIP_OFFERS_PATH } from '../../../constants/routes';
import { AnimatedCounter, CircularScore, fadeUp } from './InterviewPrimitives';

interface InterviewSummaryViewProps {
  overallScore: number;
  onRetake: () => void;
  onBackToHub: () => void;
  expandedTranscriptId: string | null;
  onToggleTranscript: (id: string) => void;
}

const InterviewSummaryView: FunctionComponent<InterviewSummaryViewProps> = ({
  overallScore,
  onRetake,
  onBackToHub,
  expandedTranscriptId,
  onToggleTranscript,
}) => {
  const { t } = useTranslation();

  return (
    <div className="sr-is__root sr-is flex flex-col gap-6 pb-8">
      <motion.div className="sr-is-glass sr-is-summary-hero" {...fadeUp}>
        <div className="sr-is-celebration" aria-hidden>🎉</div>
        <h1 className="sr-is-hero__title">{t('student.internshipOffers.interviewSim.summary.completed')}</h1>
        <CircularScore score={overallScore} />
      </motion.div>

      <motion.section className="sr-is-glass p-4" {...fadeUp}>
        <h2 className="sr-is-section-title">{t('student.internshipOffers.interviewSim.summary.breakdownTitle')}</h2>
        <div className="sr-is-breakdown-grid">
          {SUMMARY_BREAKDOWN.map((item) => (
            <div key={item.id} className="sr-is-glass sr-is-breakdown-item sr-is-glass--hover">
              <div className="sr-is-breakdown-item__score">
                <AnimatedCounter value={item.score} suffix="%" />
              </div>
              <div className="sr-is-breakdown-item__label">{t(item.labelKey)}</div>
            </div>
          ))}
        </div>
      </motion.section>

      <div className="grid gap-4 md:grid-cols-2">
        <motion.section className="sr-is-glass p-4" {...fadeUp}>
          <h2 className="sr-is-section-title text-emerald-600">{t('student.internshipOffers.interviewSim.summary.strengthsTitle')}</h2>
          <ul className="m-0 list-inside list-disc space-y-1 text-sm text-[var(--admin-text-secondary)]">
            {SUMMARY_STRENGTHS.map((key) => <li key={key}>{t(key)}</li>)}
          </ul>
        </motion.section>
        <motion.section className="sr-is-glass p-4" {...fadeUp}>
          <h2 className="sr-is-section-title text-amber-600">{t('student.internshipOffers.interviewSim.summary.weaknessesTitle')}</h2>
          <ul className="m-0 list-inside list-disc space-y-1 text-sm text-[var(--admin-text-secondary)]">
            {SUMMARY_WEAKNESSES.map((key) => <li key={key}>{t(key)}</li>)}
          </ul>
        </motion.section>
      </div>

      <motion.section className="sr-is-glass p-4" {...fadeUp}>
        <h2 className="sr-is-section-title">
          <Target className="h-4 w-4 text-[var(--admin-brand)]" aria-hidden />
          {t('student.internshipOffers.interviewSim.summary.coachTitle')}
        </h2>
        <p className="m-0 text-sm leading-relaxed text-[var(--admin-text-secondary)]">
          {t('student.internshipOffers.interviewSim.summary.coachAdvice')}
        </p>
      </motion.section>

      <motion.section className="sr-is-glass" {...fadeUp}>
        <h2 className="sr-is-section-title px-4 pt-4">
          <FileText className="h-4 w-4 text-[var(--admin-brand)]" aria-hidden />
          {t('student.internshipOffers.interviewSim.summary.transcriptTitle')}
        </h2>
        {MOCK_TRANSCRIPT.map((entry) => {
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
                  <span className="font-bold text-[var(--admin-brand)]">{entry.score}%</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
                </span>
              </button>
              {open && (
                <div className="sr-is-accordion__body">
                  <p className="m-0 mb-2 font-semibold text-[var(--admin-text)]">{t('student.internshipOffers.interviewSim.summary.yourAnswer')}</p>
                  <p className="m-0 mb-3">{entry.answer}</p>
                  <p className="m-0 mb-1 font-semibold text-[var(--admin-text)]">{t('student.internshipOffers.interviewSim.summary.aiFeedback')}</p>
                  <p className="m-0">{entry.feedback}</p>
                </div>
              )}
            </div>
          );
        })}
      </motion.section>

      <motion.section className="sr-is-glass p-4" {...fadeUp}>
        <h2 className="sr-is-section-title">
          <BarChart3 className="h-4 w-4 text-[var(--admin-brand)]" aria-hidden />
          {t('student.internshipOffers.interviewSim.summary.timelineTitle')}
        </h2>
        <div className="sr-is-timeline">
          {TIMELINE_SCORES.map((item) => (
            <div key={item.question} className="sr-is-timeline__item">
              <div className="sr-is-timeline__dot">{item.question}</div>
              <div className="flex-1">
                <p className="m-0 text-sm font-semibold text-[var(--admin-text)]">
                  {t('student.internshipOffers.interviewSim.summary.questionN', { n: item.question })}
                </p>
              </div>
              <span className="text-sm font-bold text-[var(--admin-brand)]">{item.score}%</span>
            </div>
          ))}
        </div>
      </motion.section>

      <motion.section className="sr-is-glass p-4" {...fadeUp}>
        <h2 className="sr-is-section-title">{t('student.internshipOffers.interviewSim.summary.skillGapsTitle')}</h2>
        <div className="flex flex-wrap gap-2">
          {SKILL_GAPS.map((gap) => (
            <span key={gap.id} className="sr-is-skill-gap">
              {gap.name}
              <span className={`sr-is-priority sr-is-priority--${gap.priority}`}>
                {t(`student.internshipOffers.interviewSim.summary.priority.${gap.priority}`)}
              </span>
            </span>
          ))}
        </div>
      </motion.section>

      <motion.section className="sr-is-glass p-4" {...fadeUp}>
        <h2 className="sr-is-section-title">{t('student.internshipOffers.interviewSim.roadmap.title')}</h2>
        <div className="sr-is-timeline">
          {IMPROVEMENT_ROADMAP.map((week) => (
            <div key={week.id} className="sr-is-timeline__item">
              <div className="sr-is-timeline__dot">W{week.week}</div>
              <p className="m-0 text-sm text-[var(--admin-text-secondary)]">{t(week.titleKey)}</p>
            </div>
          ))}
        </div>
      </motion.section>

      <motion.section {...fadeUp}>
        <h2 className="sr-is-section-title">{t('student.internshipOffers.interviewSim.summary.nextActions')}</h2>
        <div className="sr-is-next-actions">
          <button type="button" className="sr-is-glass sr-is-next-card sr-is-glass--hover" onClick={onRetake}>
            <RotateCcw className="mx-auto mb-2 h-6 w-6 text-[var(--admin-brand)]" />
            <span className="text-sm font-semibold">{t('student.internshipOffers.interviewSim.summary.retake')}</span>
          </button>
          <button type="button" className="sr-is-glass sr-is-next-card sr-is-glass--hover" onClick={onRetake}>
            <TrendingUp className="mx-auto mb-2 h-6 w-6 text-[var(--admin-brand)]" />
            <span className="text-sm font-semibold">{t('student.internshipOffers.interviewSim.summary.higherDifficulty')}</span>
          </button>
          <button type="button" className="sr-is-glass sr-is-next-card sr-is-glass--hover" onClick={onBackToHub}>
            <Target className="mx-auto mb-2 h-6 w-6 text-[var(--admin-brand)]" />
            <span className="text-sm font-semibold">{t('student.internshipOffers.interviewSim.summary.practiceSkills')}</span>
          </button>
          <Link to={STUDENT_CV_ANALYSIS_TOOL_PATH} className="sr-is-glass sr-is-next-card sr-is-glass--hover no-underline">
            <FileText className="mx-auto mb-2 h-6 w-6 text-[var(--admin-brand)]" />
            <span className="text-sm font-semibold text-[var(--admin-text)]">{t('student.internshipOffers.interviewSim.summary.openCv')}</span>
          </Link>
          <Link to={STUDENT_INTERNSHIP_OFFERS_PATH} className="sr-is-glass sr-is-next-card sr-is-glass--hover no-underline">
            <ArrowRight className="mx-auto mb-2 h-6 w-6 text-[var(--admin-brand)]" />
            <span className="text-sm font-semibold text-[var(--admin-text)]">{t('student.internshipOffers.interviewSim.summary.matchingOffers')}</span>
          </Link>
        </div>
      </motion.section>
    </div>
  );
};

export default InterviewSummaryView;
