import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Check, XCircle } from 'lucide-react';
import { WIZARD_STEPS } from '../../constants/createOfferWorkflow';
import { getWizardStepVisualState } from './reviewOfferHelpers';
import type { CreateOfferFormState, WizardStep } from '../../types/createOfferWorkflow';
import type { WizardStepVisualState } from './reviewOfferHelpers';

const PREFIX = 'admin.forms.createOfferStudio.steps';

interface CreateOfferStepperProps {
  currentStep: WizardStep;
  form: CreateOfferFormState;
  validationAttempted?: boolean;
  isEditMode?: boolean;
  onSelect: (step: WizardStep) => void;
}

function StepIndexContent({
  visualState,
  index,
}: {
  visualState: WizardStepVisualState;
  index: number;
}) {
  if (visualState === 'complete') {
    return <Check className="h-2.5 w-2.5" aria-hidden />;
  }
  if (visualState === 'missing') {
    return <AlertTriangle className="h-2.5 w-2.5" aria-hidden />;
  }
  if (visualState === 'error') {
    return <XCircle className="h-2.5 w-2.5" aria-hidden />;
  }
  return <>{index + 1}</>;
}

const CreateOfferStepper: FunctionComponent<CreateOfferStepperProps> = ({
  currentStep,
  form,
  validationAttempted = false,
  isEditMode = false,
  onSelect,
}) => {
  const { t } = useTranslation();

  return (
    <nav className="offer-stepper" aria-label={t(`${PREFIX}.navigation`)}>
      {WIZARD_STEPS.map((step, index) => {
        const visualState = getWizardStepVisualState(
          step.key,
          currentStep,
          form,
          validationAttempted,
          isEditMode,
        );
        const label = t(`${PREFIX}.${step.key}`);

        return (
          <button
            key={step.key}
            type="button"
            className={`offer-stepper__step offer-stepper__step--${visualState}`}
            onClick={() => onSelect(step.key)}
            aria-current={visualState === 'active' ? 'step' : undefined}
            title={label}
          >
            <span className="offer-stepper__index" aria-hidden>
              <StepIndexContent visualState={visualState} index={index} />
            </span>
            <span className="offer-stepper__label">{label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default CreateOfferStepper;
