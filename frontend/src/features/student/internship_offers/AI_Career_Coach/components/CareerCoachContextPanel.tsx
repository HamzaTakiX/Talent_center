import { FunctionComponent, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowUpRight, FileText, Flag, ListChecks, Sparkles, Target } from 'lucide-react';
import { STUDENT_CV_ANALYSIS_TOOL_PATH } from '../../CV_Analyse/constants/routes';
import { getScoreColorVar, getScoreTone } from '../../CV_Analyse/utils/cvAnalysisScore';
import type { CoachContextData } from '../types/careerCoach';

interface CareerCoachContextPanelProps {
  context: CoachContextData;
}

interface ContextProgressBarProps {
  value: number;
  compact?: boolean;
  label?: string;
}

const ContextProgressBar: FunctionComponent<ContextProgressBarProps> = ({
  value,
  compact = false,
  label,
}) => {
  const tone = getScoreTone(value);
  const color = getScoreColorVar(tone);

  return (
    <div
      className={`sr-cva-progress sr-acc-context__progress${compact ? ' sr-acc-context__progress--sm' : ''}`}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div
        className="sr-cva-progress__fill sr-acc-context__progress-fill"
        style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: color }}
      />
    </div>
  );
};

const ScoreStat: FunctionComponent<{ value: number; label: string; suffix?: string }> = ({
  value,
  label,
  suffix = '',
}) => {
  const tone = getScoreTone(value);
  const color = getScoreColorVar(tone);

  return (
    <div className="sr-cva-intel-stat sr-acc-context__stat">
      <span className="sr-cva-intel-stat__val sr-acc-context__stat-val" style={{ color }}>
        {value}
        {suffix}
      </span>
      <span className="sr-cva-intel-stat__lbl">{label}</span>
    </div>
  );
};

const CareerCoachContextPanel: FunctionComponent<CareerCoachContextPanelProps> = ({ context }) => {
  const { t } = useTranslation();
  const label = (key: string) => (key.startsWith('student.') ? t(key) : key);

  const cvDisplayName = context.hasCv && context.cvFileName
    ? context.cvFileName
    : t('student.internshipOffers.careerCoach.context.noCv');

  return (
    <aside className="sr-acc-context sr-cva__right" aria-label={t('student.internshipOffers.careerCoach.context.aria')}>
      <section className="sr-cva-glass sr-acc-context__card sr-acc-context__card--accent">
        <h3 className="sr-cva-section-title sr-acc-context__section-title">
          <FileText className="h-4 w-4 text-[var(--admin-brand)]" aria-hidden />
          {t('student.internshipOffers.careerCoach.context.currentCv')}
        </h3>

        <div className="sr-acc-context__cv-panel">
          <div className="sr-acc-context__cv-row">
            <span className="sr-acc-context__cv-icon" aria-hidden>
              <FileText className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="sr-acc-context__cv-name" title={cvDisplayName}>
                {cvDisplayName}
              </p>
              {!context.hasAnalysis && (
                <p className="sr-acc-context__cv-hint m-0">
                  {t('student.internshipOffers.careerCoach.context.noAnalysis')}
                </p>
              )}
            </div>
            <Link
              to={STUDENT_CV_ANALYSIS_TOOL_PATH}
              className="sr-acc-context__link"
              title={t('student.internshipOffers.careerCoach.context.openCvAnalysis')}
            >
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
              <span className="sr-only">{t('student.internshipOffers.careerCoach.context.openCvAnalysis')}</span>
            </Link>
          </div>
        </div>

        {context.hasAnalysis ? (
          <>
            <div className="sr-cva-intel-grid sr-acc-context__stats">
              <ScoreStat
                value={context.cvScore}
                label={t('student.internshipOffers.careerCoach.context.cvScore')}
              />
              <ScoreStat
                value={context.atsScore}
                label={t('student.internshipOffers.careerCoach.context.atsScore')}
                suffix="%"
              />
            </div>
            {context.lastAnalysis && (
              <p className="sr-acc-context__meta m-0">
                {t('student.internshipOffers.careerCoach.context.lastAnalysis', { date: context.lastAnalysis })}
              </p>
            )}
          </>
        ) : (
          <Link to={STUDENT_CV_ANALYSIS_TOOL_PATH} className="sr-acc-context__cta">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            {t('student.internshipOffers.careerCoach.context.analyzeCv')}
          </Link>
        )}
      </section>

      <section className="sr-cva-glass sr-acc-context__card">
        <h3 className="sr-cva-section-title sr-acc-context__section-title">
          <Target className="h-4 w-4 text-[var(--admin-brand)]" aria-hidden />
          {t('student.internshipOffers.careerCoach.context.readiness')}
        </h3>
        <div className="sr-acc-context__readiness-block">
          <div
            className="sr-acc-context__readiness-ring"
            style={
              {
                '--sr-acc-readiness': `${context.readinessPercent}%`,
                '--sr-acc-readiness-color': getScoreColorVar(getScoreTone(context.readinessPercent)),
              } as CSSProperties
            }
            role="img"
            aria-label={`${context.readinessPercent}%`}
          >
            <span
              className="sr-acc-context__readiness-val"
              style={{ color: getScoreColorVar(getScoreTone(context.readinessPercent)) }}
            >
              {context.readinessPercent}%
            </span>
          </div>
          <p className="sr-acc-context__readiness-caption m-0">
            {t('student.internshipOffers.careerCoach.context.readinessHint')}
          </p>
          <ContextProgressBar
            value={context.readinessPercent}
            label={t('student.internshipOffers.careerCoach.context.readiness')}
          />
        </div>
      </section>

      <section className="sr-cva-glass sr-acc-context__card">
        <h3 className="sr-cva-section-title sr-acc-context__section-title">
          <Flag className="h-4 w-4 text-[var(--admin-brand)]" aria-hidden />
          {t('student.internshipOffers.careerCoach.context.focusAreas')}
        </h3>
        {context.focusAreas.length > 0 ? (
          <ul className="sr-acc-context__chips">
            {context.focusAreas.map((area) => (
              <li key={area.id} className="sr-acc-context__chip">
                {label(area.labelKey)}
              </li>
            ))}
          </ul>
        ) : (
          <div className="sr-acc-context__empty-box">
            <Flag className="sr-acc-context__empty-icon" aria-hidden />
            <p className="sr-acc-context__empty m-0">
              {t('student.internshipOffers.careerCoach.context.noFocus')}
            </p>
          </div>
        )}
      </section>

      <section className="sr-cva-glass sr-acc-context__card">
        <h3 className="sr-cva-section-title sr-acc-context__section-title">
          <ListChecks className="h-4 w-4 text-[var(--admin-brand)]" aria-hidden />
          {t('student.internshipOffers.careerCoach.context.activeGoals')}
        </h3>
        {context.activeGoals.length > 0 ? (
          <div className="sr-acc-context__goals">
            {context.activeGoals.map((goal) => (
              <div key={goal.id} className="sr-acc-context__goal">
                <div className="sr-acc-context__goal-head">
                  <span className="sr-acc-context__goal-label">{label(goal.labelKey)}</span>
                  <span
                    className="sr-acc-context__goal-pct"
                    style={{ color: getScoreColorVar(getScoreTone(goal.progress)) }}
                  >
                    {goal.progress}%
                  </span>
                </div>
                <ContextProgressBar
                  value={goal.progress}
                  compact
                  label={label(goal.labelKey)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="sr-acc-context__empty-box">
            <ListChecks className="sr-acc-context__empty-icon" aria-hidden />
            <p className="sr-acc-context__empty m-0">
              {t('student.internshipOffers.careerCoach.context.noGoals')}
            </p>
          </div>
        )}
      </section>

      <p className="sr-acc-context__footnote">{t('student.internshipOffers.careerCoach.context.footnote')}</p>
    </aside>
  );
};

export default CareerCoachContextPanel;
