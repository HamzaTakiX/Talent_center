import { FunctionComponent, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import AdminLanguageSwitcher from '../../../../../admin/dashboard/components/AdminLanguageSwitcher';
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Code2,
  FileText,
  Gauge,
  Globe,
  Heart,
  MessageCircleOff,
  MessageSquare,
  Minus,
  Play,
  RotateCcw,
  Sparkles,
  Target,
  X,
  Zap,
} from 'lucide-react';
import type {
  InterviewReportCategory,
  InterviewSimulationReport,
  InterviewSpeechMetric,
} from '../../../types/offerAiCoach';
import { localizeInterviewReport } from '../../utils/localizeInterviewReport';
import { AnimatedCounter, CircularScore, ScoreBar } from './InterviewPrimitives';

interface InterviewReportModalProps {
  open: boolean;
  report: InterviewSimulationReport | null;
  isLoading?: boolean;
  onClose: () => void;
  onViewDetails?: () => void;
  onRetry?: () => void;
}

const CATEGORY_ICONS: Record<string, FunctionComponent<{ className?: string }>> = {
  communication: MessageSquare,
  preparation: Target,
  motivation: Heart,
  technical: Code2,
};

function DeltaBadge({ delta }: { delta: number }) {
  if (delta > 0) {
    return (
      <span className="sr-is-report-delta sr-is-report-delta--up">
        <ArrowUp className="h-3 w-3" aria-hidden />
        {delta}%
      </span>
    );
  }
  if (delta < 0) {
    return (
      <span className="sr-is-report-delta sr-is-report-delta--down">
        <ArrowDown className="h-3 w-3" aria-hidden />
        {Math.abs(delta)}%
      </span>
    );
  }
  return (
    <span className="sr-is-report-delta sr-is-report-delta--neutral">
      <Minus className="h-3 w-3" aria-hidden />
      0%
    </span>
  );
}

function CategoryCard({ item }: { item: InterviewReportCategory }) {
  const Icon = CATEGORY_ICONS[item.id] ?? Sparkles;
  return (
    <div className="sr-is-report-cat-card">
      <div className="sr-is-report-cat-card__head">
        <span className="sr-is-report-cat-card__icon" aria-hidden>
          <Icon className="h-4 w-4" />
        </span>
        <DeltaBadge delta={item.delta} />
      </div>
      <p className="sr-is-report-cat-card__label">{item.label}</p>
      <p className="sr-is-report-cat-card__score">
        <AnimatedCounter value={item.score} />
      </p>
      <ScoreBar score={item.score} />
    </div>
  );
}

function SpeechMetricCard({ metric }: { metric: InterviewSpeechMetric }) {
  const trendClass =
    metric.trend === 'up'
      ? 'sr-is-report-speech__trend--up'
      : metric.trend === 'down'
        ? 'sr-is-report-speech__trend--down'
        : 'sr-is-report-speech__trend--neutral';
  const TrendIcon =
    metric.trend === 'up' ? ArrowUp : metric.trend === 'down' ? ArrowDown : Minus;

  return (
    <div className="sr-is-report-speech-card">
      <span className="sr-is-report-speech-card__icon" aria-hidden>
        {metric.id === 'pace' ? <Gauge className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
      </span>
      <div className="sr-is-report-speech-card__body">
        <p className="sr-is-report-speech-card__label">{metric.label}</p>
        <p className="sr-is-report-speech-card__score">
          <AnimatedCounter value={metric.score} />
        </p>
        {metric.detail ? (
          <p className="sr-is-report-speech-card__detail">{metric.detail}</p>
        ) : metric.assessment ? (
          <p className={`sr-is-report-speech__trend ${trendClass}`}>
            <TrendIcon className="h-3 w-3" aria-hidden />
            {metric.assessment}
          </p>
        ) : null}
      </div>
    </div>
  );
}

const InterviewReportModal: FunctionComponent<InterviewReportModalProps> = ({
  open,
  report,
  isLoading = false,
  onClose,
  onViewDetails,
  onRetry,
}) => {
  const { t, i18n } = useTranslation();

  const displayReport = useMemo(
    () => (report ? localizeInterviewReport(report, t) : null),
    [report, t, i18n.language],
  );

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const isInsufficient =
    (displayReport?.answers_analyzed ?? 0) === 0
    || displayReport?.readiness_key === 'insufficient_data'
    || displayReport?.insufficient_data;

  const readinessClass = `sr-is-report-readiness sr-is-report-readiness--${displayReport?.readiness_key ?? 'needs_review'}`;

  return (
    <div className="admin-modal-overlay sr-is-report-overlay" role="presentation" onClick={onClose}>
      <div
        className="admin-modal sr-is-report-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sr-is-report-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="admin-modal-header sr-is-report-modal__header">
          <div className="sr-is-report-modal__header-brand" aria-hidden>
            <span className="sr-is-report-modal__header-icon">
              <ClipboardList className="h-5 w-5" strokeWidth={1.75} />
            </span>
          </div>
          <div className="admin-modal-header__content sr-is-report-modal__header-content">
            {report?.role_label ? (
              <p className="sr-is-report-role-badge">{report.role_label}</p>
            ) : null}
            <h2 id="sr-is-report-title" className="admin-modal-header__title">
              {t('student.internshipOffers.interviewSim.report.title')}
            </h2>
            <p className="admin-modal-header__description">
              {isLoading
                ? t('student.internshipOffers.interviewSim.report.loading')
                : t('student.internshipOffers.interviewSim.report.subtitle', {
                    count: displayReport?.answers_analyzed ?? 0,
                  })}
            </p>
          </div>
          <div className="sr-is-report-modal__header-actions">
            <div
              className="sr-is-report-modal__translate"
              aria-label={t('student.internshipOffers.interviewSim.report.translateAria')}
            >
              <Globe className="sr-is-report-modal__translate-icon h-3.5 w-3.5" aria-hidden />
              <span className="sr-is-report-modal__translate-label">
                {t('student.internshipOffers.interviewSim.report.translate')}
              </span>
              <AdminLanguageSwitcher />
            </div>
            <button
              type="button"
              className="admin-modal-close sr-is-report-modal__close"
              onClick={onClose}
              aria-label={t('student.internshipOffers.interviewSim.report.close')}
            >
              <X className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
        </header>

        <div className="admin-modal-body sr-is-report-modal__body">
          {isLoading ? (
            <div className="sr-is-report-loading">
              <Sparkles className="h-8 w-8 animate-pulse text-[var(--admin-brand)]" aria-hidden />
              <p>{t('student.internshipOffers.interviewSim.report.analyzing')}</p>
            </div>
          ) : displayReport ? (
            <>
              {isInsufficient ? (
                <div className="sr-is-report-empty-state sr-is-report-empty-state--modal">
                  <div className="sr-is-report-empty-state__visual">
                    <span className="sr-is-report-empty-state__orb" aria-hidden />
                    <span className="sr-is-report-empty-state__icon-wrap" aria-hidden>
                      <MessageCircleOff className="h-7 w-7" strokeWidth={1.75} />
                    </span>
                  </div>
                  <p className="sr-is-report-empty-state__title">
                    {t('student.internshipOffers.interviewSim.report.noAnswersTitle')}
                  </p>
                  <p className="sr-is-report-empty-state__desc">
                    {t('student.internshipOffers.interviewSim.report.noAnswersDesc')}
                  </p>
                  <div className="sr-is-report-steps">
                    <p className="sr-is-report-steps__heading">
                      {t('student.internshipOffers.interviewSim.report.stepsHeading')}
                    </p>
                    <div className="sr-is-report-steps__list">
                      <div className="sr-is-report-step">
                        <span className="sr-is-report-step__track" aria-hidden>
                          <span className="sr-is-report-step__num">1</span>
                        </span>
                        <span className="sr-is-report-step__icon" aria-hidden>
                          <Play className="h-4 w-4" strokeWidth={2} />
                        </span>
                        <span className="sr-is-report-step__label">
                          {t('student.internshipOffers.interviewSim.report.stepStart')}
                        </span>
                      </div>
                      <div className="sr-is-report-step">
                        <span className="sr-is-report-step__track" aria-hidden>
                          <span className="sr-is-report-step__num">2</span>
                        </span>
                        <span className="sr-is-report-step__icon" aria-hidden>
                          <MessageSquare className="h-4 w-4" strokeWidth={2} />
                        </span>
                        <span className="sr-is-report-step__label">
                          {t('student.internshipOffers.interviewSim.report.stepAnswer')}
                        </span>
                      </div>
                      <div className="sr-is-report-step">
                        <span className="sr-is-report-step__track" aria-hidden>
                          <span className="sr-is-report-step__num">3</span>
                        </span>
                        <span className="sr-is-report-step__icon" aria-hidden>
                          <BarChart3 className="h-4 w-4" strokeWidth={2} />
                        </span>
                        <span className="sr-is-report-step__label">
                          {t('student.internshipOffers.interviewSim.report.stepScore')}
                        </span>
                      </div>
                    </div>
                  </div>
                  {displayReport.weaknesses[0] ? (
                    <div className="sr-is-report-empty-state__status">
                      <span className={readinessClass}>{displayReport.readiness_text}</span>
                      <p className="sr-is-report-empty-state__status-detail">
                        {displayReport.weaknesses[0]}
                      </p>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="sr-is-report-hero">
                  <CircularScore score={displayReport.overall_score} />
                  <span className={readinessClass}>{displayReport.readiness_text}</span>
                </div>
              )}

              {!isInsufficient ? (
                <>
                  <div className="sr-is-report-cat-grid">
                    {displayReport.categories.map((cat) => (
                      <CategoryCard key={cat.id} item={cat} />
                    ))}
                  </div>

                  <div className="sr-is-report-speech-grid">
                    {displayReport.speech_metrics.map((metric) => (
                      <SpeechMetricCard key={metric.id} metric={metric} />
                    ))}
                  </div>
                </>
              ) : null}

              {!isInsufficient && (displayReport.strengths.length > 0 || displayReport.weaknesses.length > 0) && (
                <div className="sr-is-report-insights">
                  {displayReport.strengths.length > 0 && (
                    <div className="sr-is-report-insights__col sr-is-report-insights__col--strengths">
                      <h3>
                        <CheckCircle2 className="h-4 w-4" aria-hidden />
                        {t('student.internshipOffers.interviewSim.report.strengths')}
                      </h3>
                      <ul>
                        {displayReport.strengths.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {displayReport.weaknesses.length > 0 && (
                    <div className="sr-is-report-insights__col sr-is-report-insights__col--weaknesses">
                      <h3>
                        <AlertCircle className="h-4 w-4" aria-hidden />
                        {t('student.internshipOffers.interviewSim.report.weaknesses')}
                      </h3>
                      <ul>
                        {displayReport.weaknesses.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : null}
        </div>

        <footer className="admin-modal-footer sr-is-report-modal__footer">
          <button type="button" className="sr-is-report-btn sr-is-report-btn--ghost" onClick={onClose}>
            <X className="h-4 w-4" aria-hidden />
            {t('student.internshipOffers.interviewSim.report.close')}
          </button>
          {isInsufficient && onRetry ? (
            <button type="button" className="sr-is-report-btn sr-is-report-btn--primary" onClick={onRetry}>
              <RotateCcw className="h-4 w-4" aria-hidden />
              {t('student.internshipOffers.interviewSim.report.retry')}
            </button>
          ) : onViewDetails && displayReport && !isInsufficient ? (
            <button type="button" className="sr-is-report-btn sr-is-report-btn--primary" onClick={onViewDetails}>
              <FileText className="h-4 w-4" aria-hidden />
              {t('student.internshipOffers.interviewSim.report.viewDetails')}
            </button>
          ) : null}
        </footer>
      </div>
    </div>
  );
};

export default InterviewReportModal;
