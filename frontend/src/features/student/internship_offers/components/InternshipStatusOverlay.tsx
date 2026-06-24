import { FormEvent, FunctionComponent, ReactNode, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../auth/hooks/useAuth';
import { authApi } from '../../../auth/api';
import { AdminFormInput } from '../../../admin/shared/forms/AdminFormPrimitives';
import { ADMIN_FORM_FIELD_ICONS, type AdminFormFieldKey } from '../../../admin/shared/forms/adminFormIcons';
import { adminFormFieldClass, adminFormHintClass, adminFormLabelClass, adminFormRequiredClass } from '../../../admin/shared/forms/adminFormClasses';
import InternshipAssistantBot from './InternshipAssistantBot';
import '../styles/internship-status-overlay.css';

type OverlayStep = 'question' | 'form' | 'success';

interface InternshipStatusOverlayProps {
  onDismiss: () => void;
}

interface InternshipFormState {
  companyName: string;
  specialization: string;
  city: string;
  duration: string;
}

type InternshipFormFieldName = keyof InternshipFormState;
type InternshipFormI18nKey = 'company' | 'specialization' | 'city' | 'duration';

interface InternshipFormFieldConfig {
  id: string;
  name: InternshipFormFieldName;
  i18nKey: InternshipFormI18nKey;
  fieldKey: AdminFormFieldKey;
  autoComplete?: string;
}

const INTERNSHIP_FORM_FIELDS: InternshipFormFieldConfig[] = [
  {
    id: 'internship-company',
    name: 'companyName',
    i18nKey: 'company',
    fieldKey: 'company',
    autoComplete: 'organization',
  },
  {
    id: 'internship-specialization',
    name: 'specialization',
    i18nKey: 'specialization',
    fieldKey: 'specialization',
  },
  {
    id: 'internship-city',
    name: 'city',
    i18nKey: 'city',
    fieldKey: 'location',
    autoComplete: 'address-level2',
  },
  {
    id: 'internship-duration',
    name: 'duration',
    i18nKey: 'duration',
    fieldKey: 'duration',
  },
];

const TOTAL_STEPS = 2;

interface StepProgressProps {
  current: number;
  label: string;
}

const StepProgress: FunctionComponent<StepProgressProps> = ({ current, label }) => (
  <div className="internship-status-overlay__progress">
    <div className="internship-status-overlay__progress-meta">
      <span className="internship-status-overlay__step">{label}</span>
      <span className="internship-status-overlay__progress-count" aria-hidden="true">
        {current} / {TOTAL_STEPS}
      </span>
    </div>
    <div className="internship-status-overlay__progress-track" aria-hidden="true">
      <div
        className="internship-status-overlay__progress-fill"
        style={{ width: `${(current / TOTAL_STEPS) * 100}%` }}
      />
    </div>
  </div>
);

interface InternshipOverlayFormFieldProps {
  label: string;
  hint: string;
  htmlFor: string;
  fieldKey: AdminFormFieldKey;
  children: ReactNode;
}

const InternshipOverlayFormField: FunctionComponent<InternshipOverlayFormFieldProps> = ({
  label,
  hint,
  htmlFor,
  fieldKey,
  children,
}) => {
  const FieldIcon = ADMIN_FORM_FIELD_ICONS[fieldKey];

  return (
    <div className={`${adminFormFieldClass} internship-status-overlay__admin-field`}>
      <label htmlFor={htmlFor} className={adminFormLabelClass}>
        {FieldIcon ? (
          <span className="admin-form-label-icon-wrap" aria-hidden>
            <FieldIcon className="admin-form-label-icon" strokeWidth={1.75} />
          </span>
        ) : null}
        <span>{label}</span>
        <span className={adminFormRequiredClass} aria-hidden>
          *
        </span>
      </label>
      <p className={`${adminFormHintClass} internship-status-overlay__field-hint`}>{hint}</p>
      {children}
    </div>
  );
};

const EMPTY_FORM: InternshipFormState = {
  companyName: '',
  specialization: '',
  city: '',
  duration: '',
};

const InternshipStatusOverlay: FunctionComponent<InternshipStatusOverlayProps> = ({ onDismiss }) => {
  const { t } = useTranslation();
  const { user, updateUser } = useAuth();
  const [step, setStep] = useState<OverlayStep>('question');
  const [answeredYes, setAnsweredYes] = useState(false);
  const [form, setForm] = useState<InternshipFormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const firstName = useMemo(() => {
    const profileName = user?.profile?.first_name?.trim();
    if (profileName) return profileName;
    return user?.student_profile?.first_name?.trim() || '';
  }, [user]);

  const persistStatus = async (payload: {
    has_internship: boolean;
    internship_company_name?: string;
    internship_specialization?: string;
    internship_company_city?: string;
    internship_stage_duration?: string;
  }) => {
    setSubmitting(true);
    setError(null);
    try {
      const updatedUser = await authApi.updateInternshipStatus(payload);
      updateUser(updatedUser);
      setStep('success');
      window.setTimeout(onDismiss, 3200);
    } catch {
      setError(t('student.internshipStatus.error'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleNo = () => {
    setAnsweredYes(false);
    void persistStatus({ has_internship: false });
  };

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAnsweredYes(true);
    void persistStatus({
      has_internship: true,
      internship_company_name: form.companyName.trim(),
      internship_specialization: form.specialization.trim(),
      internship_company_city: form.city.trim(),
      internship_stage_duration: form.duration.trim(),
    });
  };

  return (
    <div className="internship-status-overlay" role="dialog" aria-modal="true" aria-labelledby="internship-status-title">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className={`internship-status-overlay__panel${
          step === 'question' ? ' internship-status-overlay__panel--question' : ''
        }`}
      >
        <div
          className={`internship-status-overlay__bubble${
            step === 'form' ? ' internship-status-overlay__bubble--form' : ''
          }${step === 'question' ? ' internship-status-overlay__bubble--question' : ''}`}
        >
          <AnimatePresence mode="wait">
            {step === 'question' && (
              <motion.div
                key="question"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <StepProgress
                  current={1}
                  label={t('student.internshipStatus.stepLabel', { current: 1, total: TOTAL_STEPS })}
                />
                <h2 id="internship-status-title" className="internship-status-overlay__title">
                  {t('student.internshipStatus.questionTitle')}
                </h2>
                <p className="internship-status-overlay__subtitle">
                  {t('student.internshipStatus.questionSubtitle')}
                </p>
                {error ? <p className="internship-status-overlay__error">{error}</p> : null}
                <div className="internship-status-overlay__choices">
                  <button
                    type="button"
                    className="admin-btn admin-btn-primary admin-btn--sm"
                    disabled={submitting}
                    onClick={() => setStep('form')}
                  >
                    {t('student.internshipStatus.yes')}
                  </button>
                  <button
                    type="button"
                    className="admin-btn admin-btn-secondary admin-btn--sm"
                    disabled={submitting}
                    onClick={handleNo}
                  >
                    {submitting ? t('student.common.loading') : t('student.internshipStatus.no')}
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'form' && (
              <motion.form
                key="form"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="internship-status-overlay__form"
                onSubmit={handleFormSubmit}
              >
                <div className="internship-status-overlay__form-head">
                  <StepProgress
                    current={2}
                    label={t('student.internshipStatus.stepLabel', { current: 2, total: TOTAL_STEPS })}
                  />
                  <h2 id="internship-status-title" className="internship-status-overlay__title">
                    {t('student.internshipStatus.formTitle')}
                  </h2>
                  <p className="internship-status-overlay__subtitle internship-status-overlay__subtitle--form">
                    {t('student.internshipStatus.formSubtitle')}
                  </p>
                </div>

                {error ? <p className="internship-status-overlay__error">{error}</p> : null}

                <div className="internship-status-overlay__fields">
                  {INTERNSHIP_FORM_FIELDS.map((field) => (
                    <InternshipOverlayFormField
                      key={field.id}
                      htmlFor={field.id}
                      label={t(`student.internshipStatus.fields.${field.i18nKey}`)}
                      hint={t(`student.internshipStatus.fields.${field.i18nKey}Hint`)}
                      fieldKey={field.fieldKey}
                    >
                      <AdminFormInput
                        id={field.id}
                        fieldKey={field.fieldKey}
                        value={form[field.name]}
                        onChange={(event) =>
                          setForm((prev) => ({ ...prev, [field.name]: event.target.value }))
                        }
                        placeholder={t(`student.internshipStatus.fields.${field.i18nKey}Placeholder`)}
                        autoComplete={field.autoComplete}
                        required
                      />
                    </InternshipOverlayFormField>
                  ))}
                </div>

                <div className="internship-status-overlay__actions internship-status-overlay__actions--form">
                  <button
                    type="button"
                    className="admin-btn admin-btn-secondary admin-btn--sm internship-status-overlay__btn-secondary"
                    disabled={submitting}
                    onClick={() => setStep('question')}
                  >
                    {t('student.internshipStatus.back')}
                  </button>
                  <button
                    type="submit"
                    className="admin-btn admin-btn-primary admin-btn--sm internship-status-overlay__btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? t('student.common.loading') : t('student.internshipStatus.submit')}
                  </button>
                </div>
              </motion.form>
            )}

            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="internship-status-overlay__success"
              >
                <h2 id="internship-status-title" className="internship-status-overlay__title">
                  {answeredYes
                    ? t('student.internshipStatus.savedTitle')
                    : firstName
                      ? t('student.internshipStatus.successTitleNamed', { name: firstName })
                      : t('student.internshipStatus.successTitle')}
                </h2>
                <p className="internship-status-overlay__subtitle">
                  {answeredYes
                    ? t('student.internshipStatus.savedSubtitle')
                    : t('student.internshipStatus.successSubtitle')}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {(step === 'question' || step === 'success') && (
          <div
            className={`internship-status-overlay__bot-wrap${
              step === 'question' ? ' internship-status-overlay__bot-wrap--overflow' : ''
            }`}
          >
            {step === 'question' ? (
              <div className="internship-status-overlay__bot-glow" aria-hidden="true" />
            ) : (
              <div className="internship-status-overlay__dots" aria-hidden="true">
                <span className="internship-status-overlay__dot" />
                <span className="internship-status-overlay__dot" />
                <span className="internship-status-overlay__dot" />
              </div>
            )}
            <InternshipAssistantBot
              className="internship-status-overlay__bot"
              greeting={t('student.internshipStatus.botGreeting')}
              animated
            />
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default InternshipStatusOverlay;
