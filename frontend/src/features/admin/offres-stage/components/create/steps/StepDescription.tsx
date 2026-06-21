import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AdminFormField,
} from '../../../../shared/forms/AdminFormPrimitives';
import type { CreateOfferFormState, DescriptionSections } from '../../../types/createOfferWorkflow';
import {
  OFFER_FIELD_LIMITS,
  SafeFormTextarea,
  TEXTAREA_MAX_HEIGHT,
} from '../../../../../../design-system/safeContent';
const PREFIX = 'admin.forms.createOfferStudio.description';

const SECTIONS: { key: keyof DescriptionSections; labelKey: string }[] = [
  { key: 'overview', labelKey: 'overview' },
  { key: 'responsibilities', labelKey: 'responsibilities' },
  { key: 'requirements', labelKey: 'requirements' },
  { key: 'benefits', labelKey: 'benefits' },
  { key: 'learningOpportunities', labelKey: 'learning' },
];

interface StepDescriptionProps {
  form: CreateOfferFormState;
  onChange: (description: DescriptionSections) => void;
}

const StepDescription: FunctionComponent<StepDescriptionProps> = ({ form, onChange }) => {
  const { t } = useTranslation();

  return (
    <div className="offer-studio-form__stack">
      {SECTIONS.map((section) => (
        <AdminFormField
          key={section.key}
          fieldKey="message"
          label={t(`${PREFIX}.${section.labelKey}`)}
          htmlFor={`desc-${section.key}`}
        >
          <SafeFormTextarea
            fieldKey="message"
            id={`desc-${section.key}`}
            maxLength={OFFER_FIELD_LIMITS.descriptionSection}
            maxHeight={TEXTAREA_MAX_HEIGHT.description}
            value={form.description[section.key]}
            onChange={(e) =>
              onChange({ ...form.description, [section.key]: e.target.value })
            }
            placeholder={t(`${PREFIX}.placeholders.${section.labelKey}`)}
            rows={section.key === 'overview' ? 5 : 4}
          />
        </AdminFormField>
      ))}
    </div>
  );
};

export default StepDescription;
