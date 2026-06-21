import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AdminFormDateInput,
  AdminFormField,
  AdminFormInput,
} from '../../../../shared/forms/AdminFormPrimitives';
import { adminFormGridClass } from '../../../../shared/forms/adminFormClasses';
import {
  APPLICATION_METHOD_OPTIONS,
  VISIBILITY_OPTIONS,
} from '../../../constants/createOfferWorkflow';
import type {
  ApplicationMethod,
  CreateOfferFormState,
  RecruitmentSettings,
  Visibility,
} from '../../../types/createOfferWorkflow';
import { OFFER_FIELD_LIMITS, SafeFormInput } from '../../../../../../design-system/safeContent';
const PREFIX = 'admin.forms.createOfferStudio.recruitment';

interface StepRecruitmentProps {
  form: CreateOfferFormState;
  onChange: (recruitment: RecruitmentSettings) => void;
}

const StepRecruitment: FunctionComponent<StepRecruitmentProps> = ({ form, onChange }) => {
  const { t } = useTranslation();
  const r = form.recruitment;

  const patch = (p: Partial<RecruitmentSettings>) => onChange({ ...r, ...p });

  return (
    <div className="offer-studio-form__stack">
      <div className={adminFormGridClass}>
        <AdminFormField fieldKey="deadline" label={t(`${PREFIX}.deadline`)} htmlFor="deadline">
          <AdminFormDateInput
            id="deadline"
            value={r.applicationDeadline}
            onChange={(e) => patch({ applicationDeadline: e.target.value })}
          />
        </AdminFormField>

        <AdminFormField fieldKey="eventDate" label={t(`${PREFIX}.startDate`)} htmlFor="start-date">
          <AdminFormDateInput
            id="start-date"
            value={r.startDate}
            onChange={(e) => patch({ startDate: e.target.value })}
          />
        </AdminFormField>

        <AdminFormField fieldKey="eventDate" label={t(`${PREFIX}.endDate`)} htmlFor="end-date">
          <AdminFormDateInput
            id="end-date"
            value={r.endDate}
            onChange={(e) => patch({ endDate: e.target.value })}
          />
        </AdminFormField>

        <AdminFormField fieldKey="maxStudents" label={t(`${PREFIX}.profilesNeeded`)} htmlFor="profiles">
          <AdminFormInput
            fieldKey="maxStudents"
            id="profiles"
            type="number"
            min={1}
            value={String(r.profilesNeeded)}
            onChange={(e) => patch({ profilesNeeded: Math.max(1, Number(e.target.value) || 1) })}
          />
        </AdminFormField>
      </div>

      <div>
        <span className="offer-studio-form__section-label">
          {t(`${PREFIX}.visibility`)}
        </span>
        <div className="offer-chip-grid">
          {VISIBILITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`offer-chip ${r.visibility === opt.value ? 'offer-chip--selected' : ''}`}
              onClick={() => patch({ visibility: opt.value as Visibility })}
            >
              {t(`${PREFIX}.visibilityOptions.${opt.labelKey}`)}
            </button>
          ))}
        </div>
      </div>

      <label className="admin-toggle-row flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          className="admin-toggle"
          checked={r.autoExpiration}
          onChange={(e) => patch({ autoExpiration: e.target.checked })}
        />
        <span className="offer-studio-form__toggle-label">{t(`${PREFIX}.autoExpiration`)}</span>
      </label>

      <div>
        <span className="offer-studio-form__section-label">
          {t(`${PREFIX}.applicationMethod`)}
        </span>
        <div className="offer-visual-grid">
          {APPLICATION_METHOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`offer-visual-card ${r.applicationMethod === opt.value ? 'offer-visual-card--selected' : ''}`}
              onClick={() => patch({ applicationMethod: opt.value as ApplicationMethod })}
            >
              <span className="offer-visual-card__label">
                {t(`${PREFIX}.methodOptions.${opt.labelKey}`)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {r.applicationMethod === 'external' && (
        <AdminFormField label={t(`${PREFIX}.externalUrl`)} htmlFor="external-url">
          <SafeFormInput
            id="external-url"
            maxLength={OFFER_FIELD_LIMITS.externalUrl}
            value={r.externalUrl}
            onChange={(e) => patch({ externalUrl: e.target.value })}
            placeholder="https://"
          />
        </AdminFormField>
      )}

      {r.applicationMethod === 'email' && (
        <AdminFormField fieldKey="email" label={t(`${PREFIX}.submissionEmail`)} htmlFor="sub-email">
          <SafeFormInput
            fieldKey="email"
            id="sub-email"
            type="email"
            maxLength={OFFER_FIELD_LIMITS.email}
            value={r.submissionEmail}
            onChange={(e) => patch({ submissionEmail: e.target.value })}
            placeholder="recrutement@entreprise.ma"
          />
        </AdminFormField>
      )}
    </div>
  );
};

export default StepRecruitment;
