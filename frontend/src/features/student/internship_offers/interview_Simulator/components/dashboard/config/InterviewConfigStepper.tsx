import { FunctionComponent } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { WizardStepDef } from '../../../utils/interviewWizardSteps';

interface InterviewConfigStepperProps {
  steps: WizardStepDef[];
  step: number;
  onStepChange: (step: number) => void;
}

const InterviewConfigStepper: FunctionComponent<InterviewConfigStepperProps> = ({
  steps,
  step,
  onStepChange,
}) => {
  const { t } = useTranslation();
  const progressPct = steps.length ? Math.round(((step + 1) / steps.length) * 100) : 0;

  return (
    <nav className="sr-is-config-stepper" aria-label={t('student.internshipOffers.interviewSim.config.stepperAria')}>
      <ol className="sr-is-config-stepper__list">
        {steps.map((s, index) => {
          const Icon = s.icon;
          const isActive = index === step;
          const isDone = index < step;
          const isClickable = index <= step;

          return (
            <li key={s.id} className="sr-is-config-stepper__item">
              <button
                type="button"
                className={[
                  'sr-is-config-stepper__step',
                  isActive && 'sr-is-config-stepper__step--active',
                  isDone && 'sr-is-config-stepper__step--done',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => isClickable && onStepChange(index)}
                disabled={!isClickable}
                aria-current={isActive ? 'step' : undefined}
              >
                <span className="sr-is-config-stepper__icon-wrap">
                  {isDone ? (
                    <CheckCircle2 className="h-5 w-5" strokeWidth={2} />
                  ) : (
                    <Icon className="h-5 w-5" strokeWidth={2} />
                  )}
                </span>
                <span className="sr-is-config-stepper__label">{t(s.labelKey)}</span>
              </button>
              {index < steps.length - 1 ? (
                <span
                  className={[
                    'sr-is-config-stepper__connector',
                    index < step && 'sr-is-config-stepper__connector--done',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  aria-hidden
                />
              ) : null}
            </li>
          );
        })}
      </ol>
      <div className="sr-is-config-stepper__progress-row" aria-hidden>
        <div className="sr-is-config-stepper__progress-bar">
          <div className="sr-is-config-stepper__progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
        <span className="sr-is-config-stepper__progress-pct">{progressPct}%</span>
      </div>
    </nav>
  );
};

export default InterviewConfigStepper;
