import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import AdminCustomSelect from '../../../ui/AdminCustomSelect';
import { AdminFormField, AdminFormInput } from '../../../shared/forms/AdminFormPrimitives';
import type { DurationUnit } from '../../utils/academicStructureDuration';

const PREFIX = 'admin.modules.academicStructure.form';

interface AcademicStructureDurationInputProps {
  value: number;
  unit: DurationUnit;
  onValueChange: (value: number) => void;
  onUnitChange: (unit: DurationUnit) => void;
  error?: string;
}

const AcademicStructureDurationInput: FunctionComponent<AcademicStructureDurationInputProps> = ({
  value,
  unit,
  onValueChange,
  onUnitChange,
  error,
}) => {
  const { t } = useTranslation();

  const unitOptions = [
    { value: 'months', label: t(`${PREFIX}.duration.months`) },
    { value: 'weeks', label: t(`${PREFIX}.duration.weeks`) },
  ];

  return (
    <div className="academic-form-duration">
      <AdminFormField
        htmlFor="academic-duration-value"
        label={t(`${PREFIX}.duration.value`)}
        required
        error={error ? t(`${PREFIX}.validation.${error}`) : undefined}
      >
        <AdminFormInput
          id="academic-duration-value"
          type="number"
          min={1}
          max={52}
          value={value}
          onChange={(e) => onValueChange(Math.max(1, Number(e.target.value) || 1))}
        />
      </AdminFormField>
      <AdminFormField htmlFor="academic-duration-unit" label={t(`${PREFIX}.duration.unit`)}>
        <AdminCustomSelect
          id="academic-duration-unit"
          value={unit}
          options={unitOptions}
          onChange={(v) => onUnitChange(v as DurationUnit)}
          searchable={false}
          aria-label={t(`${PREFIX}.duration.unit`)}
        />
      </AdminFormField>
    </div>
  );
};

export default AcademicStructureDurationInput;
