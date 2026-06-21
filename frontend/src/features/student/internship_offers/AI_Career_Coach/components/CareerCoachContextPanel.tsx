import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Target } from 'lucide-react';
import type { CoachContextData } from '../types/careerCoach';

interface CareerCoachContextPanelProps {
  context: CoachContextData;
}

const CareerCoachContextPanel: FunctionComponent<CareerCoachContextPanelProps> = ({ context }) => {
  const { t } = useTranslation();

  return (
    <aside className="sr-acc-context" aria-label={t('student.internshipOffers.careerCoach.context.aria')}>
      <section className="sr-acc-context__card">
        <h3 className="sr-acc-context__label">{t('student.internshipOffers.careerCoach.context.currentCv')}</h3>
        <div className="sr-acc-context__cv-row">
          <FileText className="h-4 w-4 shrink-0 text-[var(--admin-brand)]" aria-hidden />
          <span className="truncate text-sm font-medium text-[var(--admin-text)]">{context.cvFileName}</span>
        </div>
        <div className="sr-acc-context__scores">
          <div>
            <span className="sr-acc-context__score-val">{context.cvScore}</span>
            <span className="sr-acc-context__score-lbl">{t('student.internshipOffers.careerCoach.context.cvScore')}</span>
          </div>
          <div>
            <span className="sr-acc-context__score-val">{context.atsScore}%</span>
            <span className="sr-acc-context__score-lbl">{t('student.internshipOffers.careerCoach.context.atsScore')}</span>
          </div>
        </div>
        <p className="sr-acc-context__meta m-0">
          {t('student.internshipOffers.careerCoach.context.lastAnalysis', { date: context.lastAnalysis })}
        </p>
      </section>

      <section className="sr-acc-context__card">
        <h3 className="sr-acc-context__label">
          <Target className="h-3.5 w-3.5" aria-hidden />
          {t('student.internshipOffers.careerCoach.context.readiness')}
        </h3>
        <div className="sr-acc-context__readiness-row">
          <span className="sr-acc-context__readiness-val">{context.readinessPercent}%</span>
        </div>
        <div className="sr-acc-context__progress">
          <div className="sr-acc-context__progress-fill" style={{ width: `${context.readinessPercent}%` }} />
        </div>
      </section>

      <section className="sr-acc-context__card">
        <h3 className="sr-acc-context__label">{t('student.internshipOffers.careerCoach.context.focusAreas')}</h3>
        <ul className="sr-acc-context__list">
          {context.focusAreas.map((area) => (
            <li key={area.id}>{t(area.labelKey)}</li>
          ))}
        </ul>
      </section>

      <section className="sr-acc-context__card">
        <h3 className="sr-acc-context__label">{t('student.internshipOffers.careerCoach.context.activeGoals')}</h3>
        <div className="sr-acc-context__goals">
          {context.activeGoals.map((goal) => (
            <div key={goal.id} className="sr-acc-context__goal">
              <div className="sr-acc-context__goal-head">
                <span>{t(goal.labelKey)}</span>
                <span>{goal.progress}%</span>
              </div>
              <div className="sr-acc-context__progress sr-acc-context__progress--sm">
                <div className="sr-acc-context__progress-fill" style={{ width: `${goal.progress}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <p className="sr-acc-context__footnote">{t('student.internshipOffers.careerCoach.context.footnote')}</p>
    </aside>
  );
};

export default CareerCoachContextPanel;
