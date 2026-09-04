import { FunctionComponent } from 'react';
import { Check, Flag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { encadrantMilestones } from '../data/encadrantMock';
import { ENCADRANT_SURFACE_CARD } from '../constants/encadrantLayout';

const EncadrantMilestonesSection: FunctionComponent = () => {
  const { t } = useTranslation();

  return (
    <section
      aria-label={t('student.encadrant.milestones.title')}
      className={`${ENCADRANT_SURFACE_CARD} min-w-0`}
    >
      <div className="border-b border-solid border-[var(--admin-border)] px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[var(--admin-brand-muted)] text-[var(--admin-brand)]">
            <Flag className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 className="m-0 font-inter text-lg font-bold leading-7 text-[var(--admin-text)]">
              {t('student.encadrant.milestones.title')}
            </h2>
            <p className="m-0 mt-0.5 font-inter text-[13px] leading-5 text-[var(--admin-text-muted)] sm:text-sm">
              {t('student.encadrant.milestones.subtitle')}
            </p>
          </div>
        </div>
      </div>

      <div className="student-agenda-journey__track !mt-0 px-4 py-4 sm:px-5 sm:py-5">
        {encadrantMilestones.map((step, index) => (
          <div key={step.id} className="student-agenda-journey__step">
            <div className="student-agenda-journey__rail">
              <span className={`student-agenda-journey__marker student-agenda-journey__marker--${step.status}`}>
                {step.status === 'completed' ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> : index + 1}
              </span>
              {index < encadrantMilestones.length - 1 ? (
                <span className="student-agenda-journey__line" aria-hidden />
              ) : null}
            </div>
            <div>
              <p className="m-0 text-sm font-semibold text-[var(--admin-text)]">{t(step.labelKey)}</p>
              {step.dateKey ? (
                <p className="m-0 mt-0.5 text-xs text-[var(--admin-text-muted)]">{t(step.dateKey)}</p>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default EncadrantMilestonesSection;
