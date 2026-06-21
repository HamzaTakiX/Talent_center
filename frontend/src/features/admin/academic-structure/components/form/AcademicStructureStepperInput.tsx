import { FunctionComponent } from 'react';
import { Minus, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AdminFormField } from '../../../shared/forms/AdminFormPrimitives';

const PREFIX = 'admin.modules.academicStructure';
const FORM_PREFIX = 'admin.modules.academicStructure.form';

interface AcademicStructureStepperInputProps {
  id: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  error?: string;
}

const AcademicStructureStepperInput: FunctionComponent<AcademicStructureStepperInputProps> = ({
  id,
  value,
  onChange,
  min = 0,
  max = 999,
  error,
}) => {
  const { t } = useTranslation();

  const decrement = () => onChange(Math.max(min, value - 1));
  const increment = () => onChange(Math.min(max, value + 1));

  return (
    <AdminFormField
      htmlFor={id}
      label={t(`${PREFIX}.fields.order`)}
      hint={t(`${FORM_PREFIX}.fields.orderHint`)}
      error={error ? t(`${FORM_PREFIX}.validation.${error}`) : undefined}
    >
      <div className="academic-form-stepper">
        <button
          type="button"
          className="academic-form-stepper__btn"
          onClick={decrement}
          disabled={value <= min}
          aria-label={t(`${FORM_PREFIX}.stepper.decrease`)}
        >
          <Minus className="h-4 w-4" strokeWidth={2} aria-hidden />
        </button>
        <output htmlFor={id} className="academic-form-stepper__value" aria-live="polite">
          {value}
        </output>
        <button
          type="button"
          className="academic-form-stepper__btn"
          onClick={increment}
          disabled={value >= max}
          aria-label={t(`${FORM_PREFIX}.stepper.increase`)}
        >
          <Plus className="h-4 w-4" strokeWidth={2} aria-hidden />
        </button>
      </div>
    </AdminFormField>
  );
};

export default AcademicStructureStepperInput;
