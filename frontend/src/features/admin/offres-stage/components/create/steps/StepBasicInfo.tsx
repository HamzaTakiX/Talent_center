import { FunctionComponent } from 'react';

import { useTranslation } from 'react-i18next';

import AdminSelect from '../../../../account/components/AdminSelect';

import {

  AdminFormField,

  AdminFormInput,

} from '../../../../shared/forms/AdminFormPrimitives';

import { adminFormGridClass } from '../../../../shared/forms/adminFormClasses';

import { useOfferBasicInfoOptions } from '../../../../shared/hooks/useAcademicReferenceOptions';

import type { CreateOfferFormState } from '../../../types/createOfferWorkflow';

import {

  OFFER_FIELD_LIMITS,

  SafeFormInput,

} from '../../../../../../design-system/safeContent';

const PREFIX = 'admin.forms.createOfferStudio';



interface StepBasicInfoProps {

  form: CreateOfferFormState;

  onChange: (patch: Partial<CreateOfferFormState>) => void;

}



const StepBasicInfo: FunctionComponent<StepBasicInfoProps> = ({ form, onChange }) => {

  const { t } = useTranslation();

  const { internshipTypeOptions, workModeOptions, loading } = useOfferBasicInfoOptions();



  return (

    <div className={adminFormGridClass}>

      <AdminFormField fieldKey="title" label={t(`${PREFIX}.fields.title`)} htmlFor="offer-title" required>

        <SafeFormInput

          fieldKey="title"

          id="offer-title"

          maxLength={OFFER_FIELD_LIMITS.offerTitle}

          value={form.title}

          onChange={(e) => onChange({ title: e.target.value })}

          placeholder={t(`${PREFIX}.placeholders.title`)}

        />

      </AdminFormField>



      <AdminFormField fieldKey="company" label={t(`${PREFIX}.fields.company`)} htmlFor="company" required>

        <SafeFormInput

          fieldKey="company"

          id="company"

          maxLength={OFFER_FIELD_LIMITS.companyName}

          value={form.company}

          onChange={(e) => onChange({ company: e.target.value })}

          placeholder={t(`${PREFIX}.placeholders.company`)}

        />

      </AdminFormField>



      <AdminSelect

        id="internship-type"

        label={`${t(`${PREFIX}.fields.internshipType`)} *`}

        value={form.internshipType}

        onChange={(v) => onChange({ internshipType: v })}

        searchable

        disabled={loading}

        options={[

          { value: '', label: t(`${PREFIX}.types.select`) },

          ...internshipTypeOptions,

        ]}

      />



      <AdminFormField fieldKey="location" label={t(`${PREFIX}.fields.location`)} htmlFor="location" required>

        <SafeFormInput

          fieldKey="location"

          id="location"

          maxLength={OFFER_FIELD_LIMITS.location}

          value={form.location}

          onChange={(e) => onChange({ location: e.target.value })}

          placeholder={t(`${PREFIX}.placeholders.location`)}

        />

      </AdminFormField>



      <div className="md:col-span-2">

        <span className="offer-studio-form__section-label">

          {t(`${PREFIX}.fields.workMode`)}

        </span>

        <div className="offer-visual-grid">

          {workModeOptions.map((opt) => {

            const Icon = opt.icon;

            const selected = form.workMode === opt.value;

            return (

              <button

                key={opt.value}

                type="button"

                className={`offer-visual-card ${selected ? 'offer-visual-card--selected' : ''}`}

                onClick={() => onChange({ workMode: opt.value })}

                disabled={loading}

              >

                <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />

                <span className="offer-visual-card__label">{opt.label}</span>

              </button>

            );

          })}

        </div>

      </div>



      <AdminFormField fieldKey="specialization" label={t(`${PREFIX}.fields.department`)} htmlFor="department">

        <SafeFormInput

          fieldKey="specialization"

          id="department"

          maxLength={OFFER_FIELD_LIMITS.department}

          value={form.department}

          onChange={(e) => onChange({ department: e.target.value })}

          placeholder={t(`${PREFIX}.placeholders.department`)}

        />

      </AdminFormField>



      <AdminFormField fieldKey="maxStudents" label={t(`${PREFIX}.fields.positions`)} htmlFor="positions">

        <AdminFormInput

          fieldKey="maxStudents"

          id="positions"

          type="number"

          min={1}

          value={String(form.positions)}

          onChange={(e) => onChange({ positions: Math.max(1, Number(e.target.value) || 1) })}

        />

      </AdminFormField>

    </div>

  );

};



export default StepBasicInfo;


