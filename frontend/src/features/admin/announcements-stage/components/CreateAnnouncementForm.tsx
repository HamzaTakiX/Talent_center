import { FormEvent, FunctionComponent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle, FileText } from 'lucide-react';
import AdminSelect from '../../account/components/AdminSelect';
import {
  AdminFormDateInput,
  AdminFormField,
  AdminFormFileInput,
  AdminFormInput,
  AdminFormTextarea,
} from '../../shared/forms/AdminFormPrimitives';
import {
  adminFormActionsClass,
  adminFormBodyClass,
  adminFormBtnPrimaryClass,
  adminFormBtnSecondaryClass,
  adminFormGridClass,
  adminFormHeaderClass,
  adminFormPanelClass,
  adminFormSubtitleClass,
  adminFormTitleClass,
} from '../../shared/forms/adminFormClasses';
import {
  ANNOUNCEMENT_AUDIENCE_OPTIONS,
  ANNOUNCEMENT_PRIORITY_OPTIONS,
  ANNOUNCEMENT_TYPE_OPTIONS,
  ANNOUNCEMENT_VISIBILITY_OPTIONS,
} from '../constants/createAnnouncement';

const FORM_PREFIX = 'admin.forms.createAnnouncement';

interface CreateAnnouncementFormProps {
  title: string;
  type: string;
  audience: string;
  eventDate: string;
  priority: string;
  visibility: string;
  message: string;
  onTitleChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onAudienceChange: (value: string) => void;
  onEventDateChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
  onVisibilityChange: (value: string) => void;
  onMessageChange: (value: string) => void;
  onDraft: () => void;
  onPublish: () => void;
}

const CreateAnnouncementForm: FunctionComponent<CreateAnnouncementFormProps> = ({
  title,
  type,
  audience,
  eventDate,
  priority,
  visibility,
  message,
  onTitleChange,
  onTypeChange,
  onAudienceChange,
  onEventDateChange,
  onPriorityChange,
  onVisibilityChange,
  onMessageChange,
  onDraft,
  onPublish,
}) => {
  const { t } = useTranslation();

  const typeOptions = useMemo(
    () =>
      ANNOUNCEMENT_TYPE_OPTIONS.map((opt) => ({
        value: opt.value,
        label: t(`${FORM_PREFIX}.types.${opt.labelKey}`),
      })),
    [t]
  );

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
    onPublish();
  };

  return (
    <form className={adminFormPanelClass} onSubmit={handlePublish} noValidate>
      <div className={adminFormBodyClass}>
        <header className={adminFormHeaderClass}>
          <h1 className={adminFormTitleClass}>{t(`${FORM_PREFIX}.title`)}</h1>
          <p className={adminFormSubtitleClass}>{t(`${FORM_PREFIX}.subtitle`)}</p>
        </header>

        <div className={adminFormGridClass}>
          <AdminFormField label={t(`${FORM_PREFIX}.fields.title`)} htmlFor="announcement-title" required>
            <AdminFormInput
              id="announcement-title"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder={t(`${FORM_PREFIX}.placeholders.title`)}
              required
            />
          </AdminFormField>

          <AdminSelect
            id="announcement-type"
            label={`${t(`${FORM_PREFIX}.fields.type`)} *`}
            value={type}
            onChange={onTypeChange}
            options={typeOptions}
          />

          <AdminSelect
            id="target-audience"
            label={`${t(`${FORM_PREFIX}.fields.audience`)} *`}
            value={audience}
            onChange={onAudienceChange}
            options={audienceOptions}
          />

          <AdminFormField label={t(`${FORM_PREFIX}.fields.eventDate`)} htmlFor="event-date">
            <AdminFormDateInput
              id="event-date"
              value={eventDate}
              onChange={(e) => onEventDateChange(e.target.value)}
            />
          </AdminFormField>

          <AdminSelect
            id="priority"
            label={`${t(`${FORM_PREFIX}.fields.priority`)} *`}
            value={priority}
            onChange={onPriorityChange}
            options={priorityOptions}
          />

          <AdminSelect
            id="visibility"
            label={`${t(`${FORM_PREFIX}.fields.visibility`)} *`}
            value={visibility}
            onChange={onVisibilityChange}
            options={visibilityOptions}
          />
        </div>

        <AdminFormField
          className="mt-6"
          label={t(`${FORM_PREFIX}.fields.message`)}
          htmlFor="message-content"
          required
        >
          <AdminFormTextarea
            id="message-content"
            value={message}
            onChange={(e) => onMessageChange(e.target.value)}
            placeholder={t(`${FORM_PREFIX}.placeholders.message`)}
            rows={5}
            required
          />
        </AdminFormField>

        <AdminFormField
          className="mt-6"
          label={t(`${FORM_PREFIX}.fields.attachments`)}
          htmlFor="attachments"
          hint={t(`${FORM_PREFIX}.attachmentsHint`)}
        >
          <AdminFormFileInput id="attachments" multiple />
        </AdminFormField>
      </div>

      <div className={adminFormActionsClass}>
        <button type="button" onClick={onDraft} className={adminFormBtnSecondaryClass}>
          <FileText className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
          {t(`${FORM_PREFIX}.actions.draft`)}
        </button>
        <button type="submit" className={adminFormBtnPrimaryClass}>
          <CheckCircle className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
          {t(`${FORM_PREFIX}.actions.publish`)}
        </button>
      </div>
    </form>
  );
};

export default CreateAnnouncementForm;
