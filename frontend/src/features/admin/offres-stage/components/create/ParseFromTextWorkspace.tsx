import { type ChangeEvent, FunctionComponent, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  FileText,
  RefreshCw,
  Scan,
  Upload,
} from 'lucide-react';
import type {
  CreateOfferFormState,
  RecruitmentSettings,
  TextPhase,
} from '../../types/createOfferWorkflow';
import { useOfferBasicInfoOptions } from '../../../shared/hooks/useAcademicReferenceOptions';
import AdminSelect from '../../../account/components/AdminSelect';
import TagInput from './TagInput';
import StepTargeting from './steps/StepTargeting';
import { OFFER_STUDIO_BTN_PRIMARY, OFFER_STUDIO_BTN_SECONDARY } from './offerStudioClasses';
import {
  AdminFormDateInput,
  AdminFormField,
  AdminFormInput,
  AdminFormTextarea,
} from '../../../shared/forms/AdminFormPrimitives';
import { buildSectionStatuses, isReadyToPublish } from './reviewOfferHelpers';

const PREFIX = 'admin.forms.createOfferStudio.text';

interface ParseFromTextWorkspaceProps {
  textInput: string;
  onTextChange: (value: string) => void;
  textPhase: TextPhase;
  textError: string | null;
  textExtractedFields: string[];
  form: CreateOfferFormState;
  onFormChange: (patch: Partial<CreateOfferFormState>) => void;
  onParse: () => void;
  onReset: () => void;
  validationAttempted?: boolean;
  hasTargeting?: boolean;
  audienceSize?: number;
  audiencePreviewLoading?: boolean;
}

const ParseFromTextWorkspace: FunctionComponent<ParseFromTextWorkspaceProps> = ({
  textInput,
  onTextChange,
  textPhase,
  textError,
  textExtractedFields,
  form,
  onFormChange,
  onParse,
  onReset,
  validationAttempted = false,
  hasTargeting = false,
  audienceSize = 0,
  audiencePreviewLoading = false,
}) => {
  const { t } = useTranslation();
  const { internshipTypeOptions } = useOfferBasicInfoOptions();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const RECRUITMENT_PREFIX = 'admin.forms.createOfferStudio.recruitment';
  const REVIEW_PREFIX = 'admin.forms.createOfferStudio.review.completion';

  const sectionStatuses = useMemo(() => buildSectionStatuses(form), [form]);
  const readyToPublish = useMemo(() => isReadyToPublish(form), [form]);
  const missingSections = useMemo(
    () => sectionStatuses.filter((s) => !s.complete),
    [sectionStatuses],
  );

  const requiredError = (complete: boolean) =>
    validationAttempted && !complete ? t('admin.forms.createOfferStudio.import.validation.required') : undefined;

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result;
      if (typeof content === 'string') onTextChange(content);
    };
    reader.readAsText(file, 'UTF-8');
    // Reset input so same file can be re-uploaded
    e.target.value = '';
  };

  const formatHint = t(`${PREFIX}.formatHint`);

  return (
    <div className="offer-studio-panel">
      <div className="offer-studio-panel__head">
        <h2 className="offer-studio-panel__title">{t(`${PREFIX}.title`)}</h2>
        <p className="offer-studio-panel__desc">{t(`${PREFIX}.desc`)}</p>
      </div>

      <div className="offer-studio-panel__body offer-studio-form">

        {/* ── INPUT PHASE ── */}
        {(textPhase === 'idle' || textPhase === 'failed') && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">

            {/* Toolbar: file upload */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className={`${OFFER_STUDIO_BTN_SECONDARY} h-9 gap-1.5`}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4" aria-hidden />
                {t(`${PREFIX}.uploadFile`)}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.text"
                className="sr-only"
                aria-hidden
                onChange={handleFileUpload}
              />
              <span className="text-xs text-[var(--admin-text-secondary)]">
                {t(`${PREFIX}.uploadHint`)}
              </span>
            </div>

            {/* Textarea */}
            <AdminFormField label={t(`${PREFIX}.pasteLabel`)} htmlFor="offer-text-input">
              <textarea
                id="offer-text-input"
                value={textInput}
                onChange={(e) => onTextChange(e.target.value)}
                rows={14}
                placeholder={t(`${PREFIX}.pastePlaceholder`)}
                className="admin-form-textarea offer-text-input w-full resize-y font-mono text-sm"
                spellCheck={false}
              />
            </AdminFormField>

            {/* Format hint */}
            <details className="offer-text-format-hint rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] text-xs">
              <summary className="flex cursor-pointer items-center gap-1.5 px-3 py-2 font-medium text-[var(--admin-text-secondary)]">
                <FileText className="h-3.5 w-3.5 shrink-0" aria-hidden />
                {t(`${PREFIX}.formatHintTitle`)}
              </summary>
              <pre className="whitespace-pre-wrap px-3 pb-3 pt-1 text-[var(--admin-text-secondary)]">
                {formatHint}
              </pre>
            </details>

            {/* Error */}
            {textError && (
              <div
                className="flex items-start gap-2 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-alert-high-bg)] px-3 py-2 text-sm text-[var(--admin-text)]"
                role="alert"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <div>
                  <p className="font-medium">{t(`${PREFIX}.errors.title`)}</p>
                  <p className="mt-0.5">{t(`${PREFIX}.errors.${textError}`, { defaultValue: textError })}</p>
                </div>
              </div>
            )}

            {/* Parse button */}
            <button
              type="button"
              className={`${OFFER_STUDIO_BTN_PRIMARY} h-10 w-full sm:w-auto`}
              onClick={onParse}
              disabled={!textInput.trim() || textPhase === 'parsing'}
            >
              <Scan className="h-4 w-4" aria-hidden />
              {t(`${PREFIX}.parse`)}
            </button>
          </motion.div>
        )}

        {/* ── PARSING PHASE ── */}
        {textPhase === 'parsing' && (
          <div className="offer-import-loading">
            <div className="offer-import-loading__spinner" aria-hidden />
            <AnimatePresence mode="wait">
              <motion.p
                className="offer-import-loading__message"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
              >
                {t(`${PREFIX}.parsing`)}
              </motion.p>
            </AnimatePresence>
          </div>
        )}

        {/* ── EXTRACTED PHASE ── */}
        {textPhase === 'extracted' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

            {/* Extraction summary banner */}
            <div className="flex flex-wrap items-start gap-3 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] p-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--admin-success)]" aria-hidden />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--admin-text)]">
                  {t(`${PREFIX}.extractedSummary`, { count: textExtractedFields.length })}
                </p>
                <p className="mt-0.5 text-xs text-[var(--admin-text-secondary)]">
                  {t(`${PREFIX}.extractedHint`)}
                </p>
              </div>
              <button
                type="button"
                className={`${OFFER_STUDIO_BTN_SECONDARY} h-8 shrink-0 gap-1.5 text-xs`}
                onClick={onReset}
              >
                <RefreshCw className="h-3.5 w-3.5" aria-hidden />
                {t(`${PREFIX}.reset`)}
              </button>
            </div>

            {/* Original text (collapsible) */}
            <details className="offer-text-format-hint rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] text-xs">
              <summary className="flex cursor-pointer items-center gap-1.5 px-3 py-2 font-medium text-[var(--admin-text-secondary)]">
                <ClipboardList className="h-3.5 w-3.5 shrink-0" aria-hidden />
                {t(`${PREFIX}.viewOriginalText`)}
              </summary>
              <pre className="max-h-48 overflow-y-auto whitespace-pre-wrap px-3 pb-3 pt-1 text-[var(--admin-text-secondary)]">
                {textInput}
              </pre>
            </details>

            {/* ── Basic info ── */}
            <section className="offer-extracted-section">
              <h3 className="offer-extracted-section__title">
                {t('admin.forms.createOfferStudio.import.sections.basic')}
              </h3>
              <p className="mb-3 text-xs text-[var(--admin-text-secondary)]">
                {t('admin.forms.createOfferStudio.import.requiredHint')}
              </p>
              <div className="offer-extracted-grid">
                <div className="offer-extracted-card">
                  <AdminFormField
                    label={t('admin.forms.createOfferStudio.import.fields.title')}
                    htmlFor="text-title"
                    required
                    error={requiredError(Boolean(form.title.trim()))}
                  >
                    <AdminFormInput
                      id="text-title"
                      value={form.title}
                      onChange={(e) => onFormChange({ title: e.target.value })}
                      required
                    />
                  </AdminFormField>
                </div>
                <div className="offer-extracted-card">
                  <AdminFormField
                    label={t('admin.forms.createOfferStudio.import.fields.company')}
                    htmlFor="text-company"
                    required
                    error={requiredError(Boolean(form.company.trim()))}
                  >
                    <AdminFormInput
                      id="text-company"
                      value={form.company}
                      onChange={(e) => onFormChange({ company: e.target.value })}
                      required
                    />
                  </AdminFormField>
                </div>
                <div className="offer-extracted-card">
                  <AdminFormField
                    label={t('admin.forms.createOfferStudio.import.fields.location')}
                    htmlFor="text-location"
                    required
                    error={requiredError(Boolean(form.location.trim()))}
                  >
                    <AdminFormInput
                      id="text-location"
                      value={form.location}
                      onChange={(e) => onFormChange({ location: e.target.value })}
                      required
                    />
                  </AdminFormField>
                </div>
                <div className="offer-extracted-card">
                  <AdminSelect
                    id="text-internship-type"
                    label={`${t('admin.forms.createOfferStudio.import.fields.internshipType')} *`}
                    value={form.internshipType}
                    onChange={(v) => onFormChange({ internshipType: v })}
                    options={[
                      { value: '', label: t('admin.forms.createOfferStudio.types.select') },
                      ...internshipTypeOptions,
                    ]}
                  />
                  {requiredError(Boolean(form.internshipType)) ? (
                    <p className="admin-form-field-error -mt-1">
                      {requiredError(Boolean(form.internshipType))}
                    </p>
                  ) : null}
                </div>
              </div>
            </section>

            {/* ── Description ── */}
            <section className="offer-extracted-section">
              <h3 className="offer-extracted-section__title">
                {t('admin.forms.createOfferStudio.import.sections.description')}
              </h3>
              <div className="offer-extracted-grid">
                <div className="offer-extracted-card md:col-span-2">
                  <AdminFormField
                    label={t('admin.forms.createOfferStudio.import.fields.description')}
                    htmlFor="text-description"
                    required
                    error={requiredError(Boolean(form.description.overview.trim()))}
                  >
                    <AdminFormTextarea
                      id="text-description"
                      value={form.description.overview}
                      onChange={(e) =>
                        onFormChange({ description: { ...form.description, overview: e.target.value } })
                      }
                      required
                    />
                  </AdminFormField>
                </div>
                <div className="offer-extracted-card">
                  <span className="offer-extracted-card__label">
                    {t('admin.forms.createOfferStudio.description.responsibilities')}
                  </span>
                  <AdminFormTextarea
                    value={form.description.responsibilities}
                    onChange={(e) =>
                      onFormChange({ description: { ...form.description, responsibilities: e.target.value } })
                    }
                  />
                </div>
                <div className="offer-extracted-card">
                  <span className="offer-extracted-card__label">
                    {t('admin.forms.createOfferStudio.import.fields.requirements')}
                  </span>
                  <AdminFormTextarea
                    value={form.description.requirements}
                    onChange={(e) =>
                      onFormChange({ description: { ...form.description, requirements: e.target.value } })
                    }
                  />
                </div>
                <div className="offer-extracted-card">
                  <span className="offer-extracted-card__label">
                    {t('admin.forms.createOfferStudio.import.fields.benefits')}
                  </span>
                  <AdminFormTextarea
                    value={form.description.benefits}
                    onChange={(e) =>
                      onFormChange({ description: { ...form.description, benefits: e.target.value } })
                    }
                  />
                </div>
              </div>
            </section>

            {/* ── Skills ── */}
            <section className="offer-extracted-section">
              <h3 className="offer-extracted-section__title">
                {t('admin.forms.createOfferStudio.import.sections.skills')}
              </h3>
              <div className="offer-extracted-grid">
                <div className="offer-extracted-card md:col-span-2">
                  <AdminFormField
                    label={t('admin.forms.createOfferStudio.import.fields.skills')}
                    htmlFor="text-skills"
                    required
                    error={requiredError(form.requiredSkills.length > 0)}
                  >
                    <TagInput
                      tags={form.requiredSkills}
                      onChange={(requiredSkills) => onFormChange({ requiredSkills })}
                      placeholder={t('admin.forms.createOfferStudio.import.skillsPlaceholder')}
                    />
                  </AdminFormField>
                </div>
                <div className="offer-extracted-card md:col-span-2">
                  <span className="offer-extracted-card__label">
                    {t('admin.forms.createOfferStudio.import.fields.preferredSkills')}
                  </span>
                  <TagInput
                    tags={form.preferredSkills}
                    onChange={(preferredSkills) => onFormChange({ preferredSkills })}
                    placeholder={t('admin.forms.createOfferStudio.import.skillsPlaceholder')}
                  />
                </div>
                <div className="offer-extracted-card md:col-span-2">
                  <span className="offer-extracted-card__label">
                    {t('admin.forms.createOfferStudio.import.fields.languages')}
                  </span>
                  <TagInput
                    tags={form.languages}
                    onChange={(languages) => onFormChange({ languages })}
                    placeholder={t('admin.forms.createOfferStudio.import.languagesPlaceholder')}
                  />
                </div>
              </div>
            </section>

            {/* ── Targeting ── */}
            <section className="offer-extracted-section">
              <h3 className="offer-extracted-section__title">
                {t('admin.forms.createOfferStudio.import.sections.targeting')}
              </h3>
              {validationAttempted && !hasTargeting && (
                <p className="mb-3 text-sm text-[var(--admin-alert-high-fg)]" role="alert">
                  {t(`${REVIEW_PREFIX}.missing.missingTargeting`)}
                </p>
              )}
              <StepTargeting
                form={form}
                audienceSize={audienceSize}
                audiencePreviewLoading={audiencePreviewLoading}
                hasTargeting={hasTargeting}
                onChange={(targeting) => onFormChange({ targeting })}
              />
            </section>

            {/* ── Recruitment ── */}
            <section className="offer-extracted-section">
              <h3 className="offer-extracted-section__title">
                {t('admin.forms.createOfferStudio.import.sections.recruitment')}
              </h3>
              <div className="offer-extracted-grid">
                <div className="offer-extracted-card">
                  <AdminFormField
                    label={t(`${RECRUITMENT_PREFIX}.deadline`)}
                    htmlFor="text-deadline"
                    required
                    error={requiredError(Boolean(form.recruitment.applicationDeadline))}
                  >
                    <AdminFormDateInput
                      id="text-deadline"
                      value={form.recruitment.applicationDeadline}
                      onChange={(e) =>
                        onFormChange({
                          recruitment: {
                            ...form.recruitment,
                            applicationDeadline: e.target.value,
                          } satisfies RecruitmentSettings,
                        })
                      }
                      required
                    />
                  </AdminFormField>
                </div>
              </div>
            </section>

            {/* Validation summary */}
            {validationAttempted && !readyToPublish && missingSections.length > 0 && (
              <div
                className="flex items-start gap-2 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-alert-high-bg)] px-3 py-2 text-sm text-[var(--admin-text)]"
                role="alert"
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <div>
                  <p className="font-medium">
                    {t('admin.forms.createOfferStudio.import.validation.incompleteTitle')}
                  </p>
                  <ul className="mt-1 list-inside list-disc text-[var(--admin-text-secondary)]">
                    {missingSections.map((section) => (
                      <li key={section.id}>
                        {t(`${REVIEW_PREFIX}.sections.${section.id}`)}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ParseFromTextWorkspace;
