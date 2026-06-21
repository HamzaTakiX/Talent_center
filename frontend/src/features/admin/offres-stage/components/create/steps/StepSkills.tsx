import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { AdminFormField, AdminFormInput } from '../../../../shared/forms/AdminFormPrimitives';
import type { CreateOfferFormState } from '../../../types/createOfferWorkflow';
import TagInput from '../TagInput';
import { OFFER_FIELD_LIMITS } from '../../../../../../design-system/safeContent';
const PREFIX = 'admin.forms.createOfferStudio.skills';

interface StepSkillsProps {
  form: CreateOfferFormState;
  onChange: (patch: Partial<CreateOfferFormState>) => void;
}

const StepSkills: FunctionComponent<StepSkillsProps> = ({ form, onChange }) => {
  const { t } = useTranslation();

  return (
    <div className="offer-studio-form__stack">
      <AdminFormField fieldKey="skills" label={t(`${PREFIX}.required`)} htmlFor="required-skills">
        <TagInput
          id="required-skills"
          tags={form.requiredSkills}
          onChange={(requiredSkills) => onChange({ requiredSkills })}
          placeholder={t(`${PREFIX}.placeholder`)}
          maxTagLength={OFFER_FIELD_LIMITS.skillName}
        />
      </AdminFormField>

      <AdminFormField fieldKey="skills" label={t(`${PREFIX}.preferred`)} htmlFor="preferred-skills">
        <TagInput
          id="preferred-skills"
          tags={form.preferredSkills}
          onChange={(preferredSkills) => onChange({ preferredSkills })}
          placeholder={t(`${PREFIX}.placeholder`)}
          maxTagLength={OFFER_FIELD_LIMITS.skillName}
        />
      </AdminFormField>

      <AdminFormField label={t(`${PREFIX}.languages`)} htmlFor="languages">
        <TagInput
          id="languages"
          tags={form.languages}
          onChange={(languages) => onChange({ languages })}
          placeholder={t(`${PREFIX}.languagesPlaceholder`)}
          maxTagLength={OFFER_FIELD_LIMITS.tag}
        />
      </AdminFormField>

      <AdminFormField fieldKey="skills" label={t(`${PREFIX}.softSkills`)} htmlFor="soft-skills">
        <TagInput
          id="soft-skills"
          tags={form.softSkills}
          onChange={(softSkills) => onChange({ softSkills })}
          placeholder={t(`${PREFIX}.softPlaceholder`)}
          maxTagLength={OFFER_FIELD_LIMITS.skillName}
        />
      </AdminFormField>

      <AdminFormField fieldKey="duration" label={t(`${PREFIX}.experience`)} htmlFor="experience">
        <AdminFormInput
          fieldKey="duration"
          id="experience"
          value={form.yearsExperience}
          onChange={(e) => onChange({ yearsExperience: e.target.value })}
          placeholder={t(`${PREFIX}.experiencePlaceholder`)}
        />
      </AdminFormField>

      <AdminFormField fieldKey="skills" label={t(`${PREFIX}.certifications`)} htmlFor="certifications">
        <TagInput
          id="certifications"
          tags={form.certifications}
          onChange={(certifications) => onChange({ certifications })}
          placeholder={t(`${PREFIX}.certPlaceholder`)}
          maxTagLength={OFFER_FIELD_LIMITS.tag}
        />
      </AdminFormField>
    </div>
  );
};

export default StepSkills;
