import { ChangeEvent, FormEvent, FunctionComponent, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle, FileText, ImagePlus, Link2, Loader2, Plus, X } from 'lucide-react';
import AdminSelect from '../../account/components/AdminSelect';
import {
  AdminFormDateInput,
  AdminFormField,
  AdminFormFileInput,
  AdminFormInput,
  AdminFormTextarea,
} from '../../shared/forms/AdminFormPrimitives';
import AdminFormPanelHeader from '../../shared/forms/AdminFormPanelHeader';
import AdminFormSection from '../../shared/forms/AdminFormSection';
import {
  adminFormActionsClass,
  adminFormBodyScrollClass,
  adminFormPanelFlexClass,
  adminFormBtnPrimaryClass,
  adminFormBtnSecondaryClass,
  adminFormGridClass,
  adminFormSectionsStackClass,
} from '../../shared/forms/adminFormClasses';
import {
  ANNOUNCEMENT_AUDIENCE_OPTIONS,
  ANNOUNCEMENT_PRIORITY_OPTIONS,
  ANNOUNCEMENT_VISIBILITY_OPTIONS,
} from '../constants/createAnnouncement';
import { useAnnouncementTypes } from '../hooks/useAnnouncements';
import AdminFormAlert from '../../shared/forms/AdminFormAlert';
import {
  type AnnouncementFormErrors,
  countAnnouncementFormErrors,
} from '../utils/validateCreateAnnouncement';
import AnnouncementTargetingSection from './AnnouncementTargetingSection';
import PublicationSettingsSection from './PublicationSettingsSection';
import type { PublicationMode } from '../utils/scheduleUtils';
import type { TargetingRules } from '../../offres-stage/types/createOfferWorkflow';

const FORM_PREFIX = 'admin.forms.createAnnouncement';
const TARGETING_SECTION_PREFIX = 'admin.forms.createOfferStudio';

const CREATE_FORM_ID = 'create-announcement-form';

type SubmitAction = 'draft' | 'publish' | null;

interface CreateAnnouncementFormProps {
  variant?: 'create' | 'edit';
  hidePanelHeader?: boolean;
  formId?: string;
  title: string;
  type: string;
  audience: string;
  eventDate: string;
  expirationDate: string;
  publicationMode: PublicationMode;
  publishDate: string;
  publishTime: string;
  timezone: string;
  priority: string;
  visibility: string;
  message: string;
  coverImage?: File | null;
  existingCoverUrl?: string | null;
  attachments?: File[];
  attachmentLinks?: string[];
  errors?: AnnouncementFormErrors;
  onTitleChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onAudienceChange: (value: string) => void;
  onEventDateChange: (value: string) => void;
  onExpirationDateChange: (value: string) => void;
  onPublicationModeChange: (mode: PublicationMode) => void;
  onPublishDateChange: (value: string) => void;
  onPublishTimeChange: (value: string) => void;
  onTimezoneChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
  onVisibilityChange: (value: string) => void;
  onMessageChange: (value: string) => void;
  onCoverImageChange?: (file: File | null) => void;
  onAttachmentsChange?: (files: File[]) => void;
  onAttachmentLinksChange?: (urls: string[]) => void;
  targeting?: TargetingRules;
  hasTargeting?: boolean;
  audienceSize?: number;
  audiencePreviewLoading?: boolean;
  onTargetingChange?: (targeting: TargetingRules) => void;
  submitAction?: SubmitAction;
  isSubmitting?: boolean;
  onDraft: () => void;
  onPublish: () => void;
}

const CreateAnnouncementForm: FunctionComponent<CreateAnnouncementFormProps> = ({
  variant = 'create',
  hidePanelHeader = false,
  formId = CREATE_FORM_ID,
  title,
  type,
  audience,
  eventDate,
  expirationDate,
  publicationMode,
  publishDate,
  publishTime,
  timezone,
  priority,
  visibility,
  message,
  coverImage = null,
  existingCoverUrl = null,
  attachments = [],
  attachmentLinks = [],
  errors = {},
  onTitleChange,
  onTypeChange,
  onAudienceChange,
  onEventDateChange,
  onExpirationDateChange,
  onPublicationModeChange,
  onPublishDateChange,
  onPublishTimeChange,
  onTimezoneChange,
  onPriorityChange,
  onVisibilityChange,
  onMessageChange,
  onCoverImageChange,
  onAttachmentsChange,
  onAttachmentLinksChange,
  targeting,
  hasTargeting = false,
  audienceSize = 0,
  audiencePreviewLoading = false,
  onTargetingChange,
  submitAction = null,
  isSubmitting = false,
  onDraft,
  onPublish,
}) => {
  const { t } = useTranslation();
  const { activeTypes, loading: typesLoading } = useAnnouncementTypes();
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [linkDraft, setLinkDraft] = useState('');
  const [linkDraftError, setLinkDraftError] = useState<string | null>(null);

  useEffect(() => {
    if (!coverImage) {
      setCoverPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(coverImage);
    setCoverPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [coverImage]);

  const displayCoverUrl = coverPreviewUrl ?? existingCoverUrl ?? null;

  const handleCoverFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      onCoverImageChange?.(null);
      return;
    }
    if (!file.type.startsWith('image/')) return;
    onCoverImageChange?.(file);
  };

  const handleAttachmentsChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files;
    if (!selected?.length) return;
    onAttachmentsChange?.([...attachments, ...Array.from(selected)]);
    event.target.value = '';
  };

  const removeAttachment = (index: number) => {
    onAttachmentsChange?.(attachments.filter((_, i) => i !== index));
  };

  const isValidAttachmentUrl = (value: string) => {
    try {
      const url = new URL(value.trim());
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const addAttachmentLink = () => {
    const trimmed = linkDraft.trim();
    if (!trimmed) {
      setLinkDraftError(t(`${FORM_PREFIX}.validation.invalidAttachmentUrl`));
      return;
    }
    if (!isValidAttachmentUrl(trimmed)) {
      setLinkDraftError(t(`${FORM_PREFIX}.validation.invalidAttachmentUrl`));
      return;
    }
    if (attachmentLinks.some((link) => link === trimmed)) {
      setLinkDraftError(t(`${FORM_PREFIX}.validation.duplicateAttachmentUrl`));
      return;
    }
    onAttachmentLinksChange?.([...attachmentLinks, trimmed]);
    setLinkDraft('');
    setLinkDraftError(null);
  };

  const removeAttachmentLink = (index: number) => {
    onAttachmentLinksChange?.(attachmentLinks.filter((_, i) => i !== index));
  };

  const clearCoverImage = () => {
    onCoverImageChange?.(null);
  };

  const typeOptions = useMemo(
    () => [
      { value: '', label: t(`${FORM_PREFIX}.types.select`) },
      ...activeTypes.map((tp) => ({
        value: tp.code,
        label: tp.nameLocalized || tp.name,
      })),
    ],
    [activeTypes, t],
  );

  const handleTypeChange = (value: string) => {
    onTypeChange(value);
    const selected = activeTypes.find((tp) => tp.code === value);
    if (selected?.default_priority) {
      onPriorityChange(selected.default_priority);
    }
  };

  const audienceOptions = useMemo(
    () =>
      ANNOUNCEMENT_AUDIENCE_OPTIONS.map((opt) => ({
        value: opt.value,
        label: t(`${FORM_PREFIX}.audiences.${opt.labelKey}`),
      })),
    [t]
  );

  const priorityOptions = useMemo(
    () =>
      ANNOUNCEMENT_PRIORITY_OPTIONS.map((opt) => ({
        value: opt.value,
        label: t(`${FORM_PREFIX}.priorities.${opt.labelKey}`),
      })),
    [t]
  );

  const visibilityOptions = useMemo(
    () =>
      ANNOUNCEMENT_VISIBILITY_OPTIONS.map((opt) => ({
        value: opt.value,
        label: t(`${FORM_PREFIX}.visibilities.${opt.labelKey}`),
      })),
    [t]
  );

  const handlePublish = (e: FormEvent) => {
    e.preventDefault();
    if (!isSubmitting) onPublish();
  };

  const handleDraft = () => {
    if (!isSubmitting) onDraft();
  };

  const formTitle =
    variant === 'edit'
      ? t(`${FORM_PREFIX}.editTitle`)
      : t(`${FORM_PREFIX}.title`);
  const formSubtitle =
    variant === 'edit' ? t(`${FORM_PREFIX}.editSubtitle`) : t(`${FORM_PREFIX}.subtitle`);

  const errorCount = countAnnouncementFormErrors(errors);
  const hasErrors = errorCount > 0;

  return (
    <form id={formId} className={adminFormPanelFlexClass} onSubmit={handlePublish} noValidate aria-busy={isSubmitting}>
      {!hidePanelHeader && <AdminFormPanelHeader title={formTitle} subtitle={formSubtitle} />}

      {hasErrors ? (
        <AdminFormAlert variant="error">
          {t(`${FORM_PREFIX}.validation.summary`, { count: errorCount })}
        </AdminFormAlert>
      ) : null}

      <div className={adminFormBodyScrollClass}>
        <div className={adminFormSectionsStackClass}>
        <AdminFormSection
          sectionKey="content"
          title={t(`${FORM_PREFIX}.sections.general`)}
          description={t(`${FORM_PREFIX}.sections.generalHint`)}
        >
        <div className={adminFormGridClass}>
          <AdminFormField
            fieldKey="title"
            label={t(`${FORM_PREFIX}.fields.title`)}
            htmlFor="announcement-title"
            required
            error={errors.title}
          >
            <AdminFormInput
              fieldKey="title"
              id="announcement-title"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder={t(`${FORM_PREFIX}.placeholders.title`)}
              disabled={isSubmitting}
              aria-invalid={errors.title ? true : undefined}
            />
          </AdminFormField>

          <AdminSelect
            id="announcement-type"
            label={t(`${FORM_PREFIX}.fields.type`)}
            value={type}
            onChange={handleTypeChange}
            options={typeOptions}
            disabled={isSubmitting || typesLoading}
            required
            error={errors.type}
          />

          <AdminSelect
            id="target-audience"
            label={t(`${FORM_PREFIX}.fields.audience`)}
            value={audience}
            onChange={onAudienceChange}
            options={audienceOptions}
            disabled={isSubmitting}
            required
            error={errors.audience}
          />

          <AdminFormField
            fieldKey="expirationDate"
            label={t(`${FORM_PREFIX}.fields.expirationDate`)}
            htmlFor="expiration-date"
            error={errors.expirationDate}
            required
          >
            <AdminFormDateInput
              id="expiration-date"
              value={expirationDate}
              onChange={(e) => onExpirationDateChange(e.target.value)}
              disabled={isSubmitting}
              required
              aria-invalid={errors.expirationDate ? true : undefined}
            />
          </AdminFormField>

          <AdminFormField
            fieldKey="eventDate"
            label={t(`${FORM_PREFIX}.fields.eventDate`)}
            htmlFor="event-date"
            error={errors.eventDate}
          >
            <AdminFormDateInput
              id="event-date"
              value={eventDate}
              onChange={(e) => onEventDateChange(e.target.value)}
              disabled={isSubmitting}
              aria-invalid={errors.eventDate ? true : undefined}
            />
          </AdminFormField>

          <AdminSelect
            id="priority"
            label={t(`${FORM_PREFIX}.fields.priority`)}
            value={priority}
            onChange={onPriorityChange}
            options={priorityOptions}
            disabled={isSubmitting}
            required
            error={errors.priority}
          />

          <AdminSelect
            id="visibility"
            label={t(`${FORM_PREFIX}.fields.visibility`)}
            value={visibility}
            onChange={onVisibilityChange}
            options={visibilityOptions}
            disabled={isSubmitting}
            required
            error={errors.visibility}
          />
        </div>
        </AdminFormSection>

        {targeting && onTargetingChange ? (
          <AdminFormSection
            sectionKey="targeting"
            title={t(`${TARGETING_SECTION_PREFIX}.steps.targeting`)}
            description={t(`${TARGETING_SECTION_PREFIX}.stepDesc.targeting`)}
          >
            <AnnouncementTargetingSection
              targeting={targeting}
              hasTargeting={hasTargeting}
              audienceSize={audienceSize}
              audiencePreviewLoading={audiencePreviewLoading}
              onChange={onTargetingChange}
              disabled={isSubmitting}
            />
          </AdminFormSection>
        ) : null}

        {variant === 'create' ? (
          <PublicationSettingsSection
            publicationMode={publicationMode}
            publishDate={publishDate}
            publishTime={publishTime}
            timezone={timezone}
            errors={{
              publishDate: errors.publishDate,
              publishTime: errors.publishTime,
              timezone: errors.timezone,
            }}
            disabled={isSubmitting}
            onPublicationModeChange={onPublicationModeChange}
            onPublishDateChange={onPublishDateChange}
            onPublishTimeChange={onPublishTimeChange}
            onTimezoneChange={onTimezoneChange}
          />
        ) : null}

        <AdminFormSection
          sectionKey="cover"
          title={t(`${FORM_PREFIX}.fields.coverImage`)}
          description={t(`${FORM_PREFIX}.coverImageHint`)}
        >
          <div className="admin-ann-cover-upload">
            {displayCoverUrl ? (
              <div className="admin-ann-cover-upload__preview-wrap">
                <img
                  src={displayCoverUrl}
                  alt={t(`${FORM_PREFIX}.coverImagePreviewAlt`)}
                  className="admin-ann-cover-upload__preview"
                />
                <button
                  type="button"
                  className="admin-ann-cover-upload__remove"
                  onClick={clearCoverImage}
                  disabled={isSubmitting}
                  aria-label={t(`${FORM_PREFIX}.coverImageRemove`)}
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </div>
            ) : (
              <div className="admin-ann-cover-upload__empty">
                <ImagePlus className="h-8 w-8 opacity-50" strokeWidth={1.5} aria-hidden />
                <p className="admin-ann-cover-upload__hint">{t(`${FORM_PREFIX}.coverImageDropHint`)}</p>
              </div>
            )}
            <AdminFormField label={t(`${FORM_PREFIX}.fields.coverImage`)} htmlFor="announcement-cover">
              <AdminFormFileInput
                id="announcement-cover"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleCoverFileChange}
                disabled={isSubmitting}
              />
            </AdminFormField>
          </div>
        </AdminFormSection>

        <AdminFormSection
          sectionKey="description"
          title={t(`${FORM_PREFIX}.fields.message`)}
          description={t(`${FORM_PREFIX}.sections.messageHint`)}
        >
          <AdminFormField
            fieldKey="message"
            label={t(`${FORM_PREFIX}.fields.message`)}
            htmlFor="message-content"
            required
            error={errors.message}
          >
            <AdminFormTextarea
              fieldKey="message"
              id="message-content"
              value={message}
              onChange={(e) => onMessageChange(e.target.value)}
              placeholder={t(`${FORM_PREFIX}.placeholders.message`)}
              rows={5}
              disabled={isSubmitting}
              aria-invalid={errors.message ? true : undefined}
            />
          </AdminFormField>
        </AdminFormSection>

        <AdminFormSection
          sectionKey="attachments"
          title={t(`${FORM_PREFIX}.sections.attachmentsTitle`)}
          description={t(`${FORM_PREFIX}.attachmentsHint`)}
        >
          <div className="admin-ann-attachments-stack">
            <AdminFormField label={t(`${FORM_PREFIX}.fields.attachmentFiles`)} htmlFor="attachments">
              {attachments.length > 0 ? (
                <ul className="admin-ann-attachments-pending" aria-label={t(`${FORM_PREFIX}.fields.attachmentFiles`)}>
                  {attachments.map((file, index) => (
                    <li key={`${file.name}-${file.size}-${index}`} className="admin-ann-attachments-pending__item">
                      <FileText className="h-4 w-4 shrink-0 opacity-60" strokeWidth={1.75} aria-hidden />
                      <span className="admin-ann-attachments-pending__name">{file.name}</span>
                      <button
                        type="button"
                        className="admin-ann-attachments-pending__remove"
                        onClick={() => removeAttachment(index)}
                        disabled={isSubmitting}
                        aria-label={t(`${FORM_PREFIX}.attachmentRemove`, { name: file.name })}
                      >
                        <X className="h-4 w-4" aria-hidden />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
              <AdminFormFileInput
                id="attachments"
                multiple
                onChange={handleAttachmentsChange}
                disabled={isSubmitting}
              />
            </AdminFormField>

            <AdminFormField
              label={t(`${FORM_PREFIX}.fields.attachmentLinks`)}
              htmlFor="attachment-link"
              error={linkDraftError ?? undefined}
            >
              {attachmentLinks.length > 0 ? (
                <ul
                  className="admin-ann-attachments-pending"
                  aria-label={t(`${FORM_PREFIX}.fields.attachmentLinks`)}
                >
                  {attachmentLinks.map((link, index) => (
                    <li key={`${link}-${index}`} className="admin-ann-attachments-pending__item">
                      <Link2 className="h-4 w-4 shrink-0 opacity-60" strokeWidth={1.75} aria-hidden />
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="admin-ann-attachments-pending__name admin-ann-attachments-pending__link"
                      >
                        {link}
                      </a>
                      <button
                        type="button"
                        className="admin-ann-attachments-pending__remove"
                        onClick={() => removeAttachmentLink(index)}
                        disabled={isSubmitting}
                        aria-label={t(`${FORM_PREFIX}.attachmentLinkRemove`, { url: link })}
                      >
                        <X className="h-4 w-4" aria-hidden />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
              <div className="admin-ann-attachment-link-row">
                <AdminFormInput
                  id="attachment-link"
                  type="url"
                  value={linkDraft}
                  onChange={(e) => {
                    setLinkDraft(e.target.value);
                    if (linkDraftError) setLinkDraftError(null);
                  }}
                  placeholder={t(`${FORM_PREFIX}.placeholders.attachmentLink`)}
                  disabled={isSubmitting}
                  aria-invalid={linkDraftError ? true : undefined}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addAttachmentLink();
                    }
                  }}
                />
                <button
                  type="button"
                  className={`${adminFormBtnSecondaryClass} admin-ann-attachment-link-row__add`}
                  onClick={addAttachmentLink}
                  disabled={isSubmitting}
                >
                  <Plus className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                  {t(`${FORM_PREFIX}.actions.addAttachmentLink`)}
                </button>
              </div>
            </AdminFormField>
          </div>
        </AdminFormSection>
        </div>
      </div>

      <div className={adminFormActionsClass}>
        <button
          type="button"
          onClick={handleDraft}
          disabled={isSubmitting}
          aria-busy={submitAction === 'draft'}
          className={`${adminFormBtnSecondaryClass} disabled:cursor-not-allowed disabled:opacity-60`}
        >
          {submitAction === 'draft' ? (
            <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
          ) : (
            <FileText className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
          )}
          {submitAction === 'draft'
            ? t(`${FORM_PREFIX}.actions.savingDraft`, { defaultValue: 'Saving draft…' })
            : variant === 'edit'
              ? t(`${FORM_PREFIX}.actions.cancel`)
              : t(`${FORM_PREFIX}.actions.draft`)}
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          aria-busy={submitAction === 'publish'}
          className={`${adminFormBtnPrimaryClass} disabled:cursor-not-allowed disabled:opacity-60`}
        >
          {submitAction === 'publish' ? (
            <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
          ) : (
            <CheckCircle className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
          )}
          {submitAction === 'publish'
            ? variant === 'edit'
              ? t(`${FORM_PREFIX}.actions.saving`, { defaultValue: 'Enregistrement…' })
              : publicationMode === 'schedule'
                ? t(`${FORM_PREFIX}.actions.scheduling`, { defaultValue: 'Planification…' })
                : t(`${FORM_PREFIX}.actions.publishing`, { defaultValue: 'Publication en cours…' })
            : variant === 'edit'
              ? t(`${FORM_PREFIX}.actions.save`)
              : publicationMode === 'schedule'
                ? t(`${FORM_PREFIX}.actions.schedule`)
                : t(`${FORM_PREFIX}.actions.publish`)}
        </button>
      </div>
    </form>
  );
};

export { CREATE_FORM_ID };
export default CreateAnnouncementForm;
