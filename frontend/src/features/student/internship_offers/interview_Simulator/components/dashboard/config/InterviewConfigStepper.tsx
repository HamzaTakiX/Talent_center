import { FunctionComponent } from 'react';
import { Briefcase, Check, Clock, ClipboardCheck, Gauge, Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const STEPS = [
  { id: 'role', icon: Briefcase, labelKey: 'student.internshipOffers.interviewSim.config.steps.role' },
  { id: 'difficulty', icon: Gauge, labelKey: 'student.internshipOffers.interviewSim.config.steps.difficulty' },
  { id: 'duration', icon: Clock, labelKey: 'student.internshipOffers.interviewSim.config.steps.duration' },
  { id: 'language', icon: Languages, labelKey: 'student.internshipOffers.interviewSim.config.steps.language' },
  { id: 'review', icon: ClipboardCheck, labelKey: 'student.internshipOffers.interviewSim.config.steps.review' },
] as const;

interface InterviewConfigStepperProps {
  step: number;
  onStepChange: (step: number) => void;
}

const InterviewConfigStepper: FunctionComponent<InterviewConfigStepperProps> = ({ step, onStepChange }) => {
  const { t } = useTranslation();

  return (
    <nav className="sr-is-config-stepper" aria-label={t('student.internshipOffers.interviewSim.config.stepperAria')}>
      <ol className="sr-is-config-stepper__list">
        {STEPS.map((s, index) => {
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
                  {isDone ? <Check className="h-5 w-5" strokeWidth={2.5} /> : <Icon className="h-5 w-5" strokeWidth={2} />}
                </span>
                <span className="sr-is-config-stepper__label">{t(s.labelKey)}</span>
              </button>
              {index < STEPS.length - 1 ? (
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
    </nav>
  );
};

export default InterviewConfigStepper;
