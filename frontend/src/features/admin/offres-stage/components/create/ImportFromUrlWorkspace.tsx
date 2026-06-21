import { FunctionComponent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, AlertTriangle, Link2, RefreshCw, Search } from 'lucide-react';
import ImportSourceUrlBar from './ImportSourceUrlBar';
import {
  IMPORT_LOADING_MESSAGES,
  IMPORT_PLATFORM_DEFS,
  IMPORT_PLATFORM_LABELS,
} from '../../constants/createOfferWorkflow';
import { useOfferBasicInfoOptions } from '../../../shared/hooks/useAcademicReferenceOptions';
import ImportPlatformIcon from './ImportPlatformIcon';
import type {
  CreateOfferFormState,
  ImportJobMeta,
  ImportPhase,
  RecruitmentSettings,
} from '../../types/createOfferWorkflow';
import AdminSelect from '../../../account/components/AdminSelect';
import ImportCompanyLogo from './ImportCompanyLogo';
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

const PREFIX = 'admin.forms.createOfferStudio.import';

interface ImportFromUrlWorkspaceProps {
  importUrl: string;
  onUrlChange: (url: string) => void;
  importPhase: ImportPhase;
  importMessageIndex: number;
  importError: string | null;
  importJobMeta: ImportJobMeta | null;
  form: CreateOfferFormState;
  onFormChange: (patch: Partial<CreateOfferFormState>) => void;
  onAnalyze: () => void;
  onRetry: () => void;
  onTryAnotherUrl: () => void;
  validationAttempted?: boolean;
  hasTargeting?: boolean;
  audienceSize?: number;
  audiencePreviewLoading?: boolean;
}

const ImportFromUrlWorkspace: FunctionComponent<ImportFromUrlWorkspaceProps> = ({
  importUrl,
  onUrlChange,
  importPhase,
  importMessageIndex,
  importError,
  importJobMeta,
  form,
  onFormChange,
  onAnalyze,
  onRetry,
  onTryAnotherUrl,
  validationAttempted = false,
  hasTargeting = false,
  audienceSize = 0,
  audiencePreviewLoading = false,
}) => {
  const { t } = useTranslation();
  const { internshipTypeOptions } = useOfferBasicInfoOptions();
  const RECRUITMENT_PREFIX = 'admin.forms.createOfferStudio.recruitment';
  const REVIEW_PREFIX = 'admin.forms.createOfferStudio.review.completion';

  const sectionStatuses = useMemo(() => buildSectionStatuses(form), [form]);
  const readyToPublish = useMemo(() => isReadyToPublish(form), [form]);
  const missingSections = useMemo(
    () => sectionStatuses.filter((section) => !section.complete),
    [sectionStatuses],
  );

  const requiredError = (complete: boolean) =>
    validationAttempted && !complete ? t(`${PREFIX}.validation.required`) : undefined;

  const platformLabel = importJobMeta?.detectedPlatform
    ? IMPORT_PLATFORM_LABELS[importJobMeta.detectedPlatform] ?? importJobMeta.detectedPlatform
    : null;

  const urlInputRow = (showTryAnother: boolean) => (
    <AdminFormField label={t(`${PREFIX}.urlLabel`)} htmlFor="import-url">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <AdminFormInput
          id="import-url"
          value={importUrl}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder={t(`${PREFIX}.urlPlaceholder`)}
          className="min-w-0 flex-1"
        />
        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            className={`${OFFER_STUDIO_BTN_PRIMARY} h-10`}
            onClick={onAnalyze}
            disabled={!importUrl.trim() || importPhase === 'analyzing'}
          >
            <Search className="h-4 w-4" aria-hidden />
            {showTryAnother ? t(`${PREFIX}.reAnalyze`) : t(`${PREFIX}.analyze`)}
          </button>
          {showTryAnother && (
            <button
              type="button"
              className={`${OFFER_STUDIO_BTN_SECONDARY} h-10`}
              onClick={onTryAnotherUrl}
            >
              <RefreshCw className="h-4 w-4" aria-hidden />
              {t(`${PREFIX}.tryAnotherUrl`)}
            </button>
          )}
        </div>
      </div>
    </AdminFormField>
  );

  return (
    <div className="offer-studio-panel">
      <div className="offer-studio-panel__head">
        <h2 className="offer-studio-panel__title">{t(`${PREFIX}.title`)}</h2>
        <p className="offer-studio-panel__desc">{t(`${PREFIX}.desc`)}</p>
      </div>
      <div className="offer-studio-panel__body offer-studio-form">
        {(importPhase === 'idle' || importPhase === 'failed') && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {IMPORT_PLATFORM_DEFS.map(({ key, label }) => (
                <span
                  key={key}
                  className="admin-badge admin-badge--neutral offer-import-platform-badge text-xs"
                >
                  <ImportPlatformIcon platform={key} />
                  {label}
                </span>
              ))}
            </div>
            {urlInputRow(false)}
            {importError && (
              <div
                className="flex items-start gap-2 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-alert-high-bg)] px-3 py-2 text-sm text-[var(--admin-text)]"
                role="alert"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <div>
                  <p className="font-medium">{t(`${PREFIX}.errors.title`)}</p>
                  <p className="mt-0.5">{importError}</p>
                  <button type="button" className={`${OFFER_STUDIO_BTN_SECONDARY} mt-2 h-8 text-xs`} onClick={onRetry}>
                    {t(`${PREFIX}.errors.retry`)}
                  </button>
                </div>
              </div>
            )}
            <p className="flex items-center gap-1.5 text-xs text-[var(--admin-text-secondary)]">
              <Link2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span>{t(`${PREFIX}.hint`)}</span>
            </p>
          </motion.div>
        )}

        {importPhase === 'analyzing' && (
          <div className="offer-import-loading">
            <div className="offer-import-loading__spinner" aria-hidden />
            <AnimatePresence mode="wait">
              <motion.p
                key={importMessageIndex}
                className="offer-import-loading__message"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
              >
                {t(`${PREFIX}.loading.${IMPORT_LOADING_MESSAGES[importMessageIndex]}`)}
              </motion.p>
            </AnimatePresence>
          </div>
        )}

        {importPhase === 'extracted' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <div className="offer-import-url-bar rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] p-4">
              {urlInputRow(true)}
              <p className="mt-2 text-xs text-[var(--admin-text-secondary)]">
                {t(`${PREFIX}.tryAnotherHint`)}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-medium text-[var(--admin-brand)]">
                {t(`${PREFIX}.extracted`)}
              </p>
              {platformLabel && importJobMeta?.detectedPlatform && (
                <span className="admin-badge admin-badge--brand offer-import-platform-badge text-xs">
                  <ImportPlatformIcon platform={importJobMeta.detectedPlatform} />
                  {platformLabel}
                </span>
              )}
            </div>

            <section className="offer-extracted-section">
              <h3 className="offer-extracted-section__title">{t(`${PREFIX}.sections.basic`)}</h3>
              <p className="mb-3 text-xs text-[var(--admin-text-secondary)]">{t(`${PREFIX}.requiredHint`)}</p>
              <div className="offer-extracted-grid">
                <div className="offer-extracted-card offer-extracted-card--company">
                  <AdminFormField
                    label={t(`${PREFIX}.fields.company`)}
                    htmlFor="import-company"
                    required
                    error={requiredError(Boolean(form.company.trim()))}
                  >
                    <div className="offer-extracted-company-row">
                      <ImportCompanyLogo
                        url={importJobMeta?.companyLogoUrl}
                        companyName={form.company}
                      />
                      <AdminFormInput
                        id="import-company"
                        value={form.company}
                        onChange={(e) => onFormChange({ company: e.target.value })}
                        className="flex-1"
                        required
                      />
                    </div>
                  </AdminFormField>
                </div>
                <div className="offer-extracted-card">
                  <AdminFormField
                    label={t(`${PREFIX}.fields.title`)}
                    htmlFor="import-title"
                    required
                    error={requiredError(Boolean(form.title.trim()))}
                  >
                    <AdminFormInput
                      id="import-title"
                      value={form.title}
                      onChange={(e) => onFormChange({ title: e.target.value })}
                      required
                    />
                  </AdminFormField>
                </div>
                <div className="offer-extracted-card">
                  <AdminFormField
                    label={t(`${PREFIX}.fields.location`)}
                    htmlFor="import-location"
                    required
                    error={requiredError(Boolean(form.location.trim()))}
                  >
                    <AdminFormInput
                      id="import-location"
                      value={form.location}
                      onChange={(e) => onFormChange({ location: e.target.value })}
                      required
                    />
                  </AdminFormField>
                </div>
                <div className="offer-extracted-card">
                  <AdminSelect
                    id="import-internship-type"
                    label={`${t(`${PREFIX}.fields.internshipType`)} *`}
                    value={form.internshipType}
                    onChange={(v) => onFormChange({ internshipType: v })}
                    options={[
                      { value: '', label: t('admin.forms.createOfferStudio.types.select') },
                      ...internshipTypeOptions,
                    ]}
                  />
                  {requiredError(Boolean(form.internshipType)) ? (
                    <p className="admin-form-field-error -mt-1">{requiredError(Boolean(form.internshipType))}</p>
                  ) : null}
                </div>
              </div>
            </section>

            <section className="offer-extracted-section">
              <h3 className="offer-extracted-section__title">{t(`${PREFIX}.sections.description`)}</h3>
              <div className="offer-extracted-grid">
                <div className="offer-extracted-card md:col-span-2">
                  <AdminFormField
                    label={t(`${PREFIX}.fields.description`)}
                    htmlFor="import-description"
                    required
                    error={requiredError(Boolean(form.description.overview.trim()))}
                  >
                    <AdminFormTextarea
                      id="import-description"
                      value={form.description.overview}
                      onChange={(e) =>
                        onFormChange({
                          description: { ...form.description, overview: e.target.value },
                        })
                      }
                      required
                    />
                  </AdminFormField>
                </div>
                <div className="offer-extracted-card">
                  <span className="offer-extracted-card__label">{t(`${PREFIX}.fields.requirements`)}</span>
                  <AdminFormTextarea
                    value={form.description.requirements}
                    onChange={(e) =>
                      onFormChange({
                        description: { ...form.description, requirements: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="offer-extracted-card">
                  <span className="offer-extracted-card__label">{t(`${PREFIX}.fields.benefits`)}</span>
                  <AdminFormTextarea
                    value={form.description.benefits}
                    onChange={(e) =>
                      onFormChange({
                        description: { ...form.description, benefits: e.target.value },
                      })
                    }
                  />
                </div>
              </div>
            </section>

            <section className="offer-extracted-section">
              <h3 className="offer-extracted-section__title">{t(`${PREFIX}.sections.skills`)}</h3>
              <div className="offer-extracted-grid">
                <div className="offer-extracted-card md:col-span-2">
                  <AdminFormField
                    label={t(`${PREFIX}.fields.skills`)}
                    htmlFor="import-skills"
                    required
                    error={requiredError(form.requiredSkills.length > 0)}
                  >
                    <TagInput
                      tags={form.requiredSkills}
                      onChange={(requiredSkills) => onFormChange({ requiredSkills })}
                      placeholder={t(`${PREFIX}.skillsPlaceholder`)}
                    />
                  </AdminFormField>
                </div>
                <div className="offer-extracted-card md:col-span-2">
                  <span className="offer-extracted-card__label">{t(`${PREFIX}.fields.preferredSkills`)}</span>
                  <TagInput
                    tags={form.preferredSkills}
                    onChange={(preferredSkills) => onFormChange({ preferredSkills })}
                    placeholder={t(`${PREFIX}.skillsPlaceholder`)}
                  />
                </div>
                <div className="offer-extracted-card md:col-span-2">
                  <span className="offer-extracted-card__label">{t(`${PREFIX}.fields.languages`)}</span>
                  <TagInput
                    tags={form.languages}
                    onChange={(languages) => onFormChange({ languages })}
                    placeholder={t(`${PREFIX}.languagesPlaceholder`)}
                  />
                </div>
              </div>
            </section>

            <section className="offer-extracted-section">
              <h3 className="offer-extracted-section__title">{t(`${PREFIX}.sections.targeting`)}</h3>
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

            <section className="offer-extracted-section">
              <h3 className="offer-extracted-section__title">{t(`${PREFIX}.sections.recruitment`)}</h3>
              <div className="offer-extracted-grid">
                <div className="offer-extracted-card">
                  <AdminFormField
                    label={t(`${RECRUITMENT_PREFIX}.deadline`)}
                    htmlFor="import-deadline"
                    required
                    error={requiredError(Boolean(form.recruitment.applicationDeadline))}
                  >
                    <AdminFormDateInput
                      id="import-deadline"
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

            {validationAttempted && !readyToPublish && missingSections.length > 0 && (
              <div
                className="flex items-start gap-2 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-alert-high-bg)] px-3 py-2 text-sm text-[var(--admin-text)]"
                role="alert"
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <div>
                  <p className="font-medium">{t(`${PREFIX}.validation.incompleteTitle`)}</p>
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

            {importJobMeta && (
              <section className="offer-extracted-section offer-import-metadata">
                <h3 className="offer-extracted-section__title">{t(`${PREFIX}.sections.metadata`)}</h3>
                <dl className="offer-import-metadata__grid">
                  <div>
                    <dt>{t(`${PREFIX}.metadata.source`)}</dt>
                    <dd>{platformLabel ?? importJobMeta.detectedPlatform}</dd>
                  </div>
                  <div>
                    <dt>{t(`${PREFIX}.metadata.parser`)}</dt>
                    <dd>{importJobMeta.parserUsed || '—'}</dd>
                  </div>
                  <div>
                    <dt>{t(`${PREFIX}.metadata.importDate`)}</dt>
                    <dd>{new Date(importJobMeta.importDate).toLocaleString()}</dd>
                  </div>
                  <div className="offer-import-metadata__url-row">
                    <dt>{t(`${PREFIX}.metadata.sourceUrl`)}</dt>
                    <dd>
                      <ImportSourceUrlBar url={importJobMeta.sourceUrl} />
                    </dd>
                  </div>
                </dl>
              </section>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ImportFromUrlWorkspace;
