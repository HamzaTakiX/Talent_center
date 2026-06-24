import { FunctionComponent, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Loader2, Megaphone } from 'lucide-react';
import { isAxiosError } from 'axios';
import { useAdminBackLabel } from '../../i18n/useAdminCopy';
import { useAdminToast } from '../../dashboard/context/AdminToastContext';
import { adminAnnouncementsApi } from '../../api/announcements';
import { useAcademicStructureCatalog } from '../../shared/academic-structure/hooks/useAcademicStructureCatalog';
import AdminFormPageShell from '../../ui/AdminFormPageShell';
import CreateAnnouncementForm, { CREATE_FORM_ID } from '../components/CreateAnnouncementForm';
import {
  resolveAnnouncementPriority,
  resolveAnnouncementTargetScope,
} from '../constants/createAnnouncement';
import {
  type AnnouncementFormErrors,
  type AnnouncementFormFieldKey,
  mapApiErrorsToForm,
  scrollToFirstAnnouncementFieldError,
  validateCreateAnnouncementForm,
} from '../utils/validateCreateAnnouncement';
import { mapTargetingRulesToAnnouncementTargets } from '../utils/announcementTargetingMappers';
import {
  createEmptyTargetingRules,
  hasTargetingSelection,
} from '../../../shared/utils/targetingMappers';
import {
  createDefaultPublicationSchedule,
} from '../utils/scheduleUtils';
import '../styles/admin-announcements.css';

const FORM_PREFIX = 'admin.forms.createAnnouncement';

type SubmitAction = 'draft' | 'publish' | null;

const CreateAnnouncementPage: FunctionComponent = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const toast = useAdminToast();
  const backLabel = useAdminBackLabel('announcements');
  const lang = i18n.language?.slice(0, 2) || 'fr';
  const { catalog } = useAcademicStructureCatalog();

  const [title, setTitle] = useState('');
  const [type, setType] = useState('');
  const [audience, setAudience] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [publicationSchedule, setPublicationSchedule] = useState(createDefaultPublicationSchedule);
  const [priority, setPriority] = useState('NORMAL');
  const [visibility, setVisibility] = useState('ALL_STUDENTS');
  const [message, setMessage] = useState('');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [attachmentLinks, setAttachmentLinks] = useState<string[]>([]);
  const [targeting, setTargeting] = useState(createEmptyTargetingRules);
  const [submitAction, setSubmitAction] = useState<SubmitAction>(null);
  const [errors, setErrors] = useState<AnnouncementFormErrors>({});

  const isSubmitting = submitAction !== null;
  const hasTargeting = useMemo(() => hasTargetingSelection(targeting), [targeting]);

  const formValues = {
    title,
    type,
    audience,
    priority,
    visibility,
    message,
    eventDate,
    expirationDate,
    publicationMode: publicationSchedule.publicationMode,
    publishDate: publicationSchedule.publishDate,
    publishTime: publicationSchedule.publishTime,
    timezone: publicationSchedule.timezone,
  };

  const clearFieldError = useCallback((field: AnnouncementFormFieldKey) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const submit = async (publish: boolean) => {
    if (isSubmitting) return;

    const validationErrors = validateCreateAnnouncementForm(formValues, t, {
      hasTargeting,
      publishing: publish,
    });
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      scrollToFirstAnnouncementFieldError(validationErrors);
      return;
    }

    setErrors({});
    setSubmitAction(publish ? 'publish' : 'draft');

    try {
      const targets = hasTargeting
        ? mapTargetingRulesToAnnouncementTargets(targeting, catalog, lang)
        : undefined;

      const isScheduled =
        publish && publicationSchedule.publicationMode === 'schedule';

      const created = await adminAnnouncementsApi.create({
        title: title.trim(),
        summary: title.trim(),
        body: message.trim(),
        announcementTypeCode: type,
        priority: resolveAnnouncementPriority(priority) as 'NORMAL',
        target_scope: hasTargeting
          ? 'TARGETED'
          : resolveAnnouncementTargetScope(visibility, audience),
        targets,
        publish_start_at: eventDate ? `${eventDate}T00:00:00` : null,
        publish_end_at: expirationDate ? `${expirationDate}T23:59:59` : null,
        status: publish ? (isScheduled ? 'SCHEDULED' : 'PUBLISHED') : 'DRAFT',
        ...(isScheduled
          ? {
              schedule_date: publicationSchedule.publishDate,
              schedule_time: publicationSchedule.publishTime,
              schedule_timezone: publicationSchedule.timezone,
            }
          : {}),
      });

      if (coverImage && created?.id) {
        try {
          await adminAnnouncementsApi.uploadCover(created.id, coverImage);
        } catch {
          toast.error(
            t(`${FORM_PREFIX}.coverUploadError`, {
              defaultValue: "L'annonce est créée mais l'image n'a pas pu être envoyée.",
            }),
          );
          navigate('/admin/announcements');
          return;
        }
      }

      if (attachments.length > 0 && created?.id) {
        try {
          await adminAnnouncementsApi.uploadAttachments(created.id, attachments);
        } catch {
          toast.error(
            t(`${FORM_PREFIX}.attachmentsUploadError`, {
              defaultValue: "L'annonce est créée mais les pièces jointes n'ont pas pu être envoyées.",
            }),
          );
          navigate('/admin/announcements');
          return;
        }
      }

      if (attachmentLinks.length > 0 && created?.id) {
        try {
          await adminAnnouncementsApi.uploadAttachmentLinks(created.id, attachmentLinks);
        } catch {
          toast.error(
            t(`${FORM_PREFIX}.attachmentLinksUploadError`, {
              defaultValue: "L'annonce est créée mais les liens n'ont pas pu être enregistrés.",
            }),
          );
          navigate('/admin/announcements');
          return;
        }
      }

      toast.success(
        publish
          ? isScheduled
            ? t(`${FORM_PREFIX}.scheduleSuccess`, { defaultValue: 'Annonce planifiée avec succès' })
            : t(`${FORM_PREFIX}.publishSuccess`, { defaultValue: 'Announcement published' })
          : t(`${FORM_PREFIX}.draftSuccess`, { defaultValue: 'Draft saved' }),
      );
      navigate(isScheduled ? '/admin/announcements/scheduled' : '/admin/announcements');
    } catch (err: unknown) {
      if (isAxiosError(err) && err.response?.data && typeof err.response.data === 'object') {
        const payload = err.response.data as { errors?: Record<string, unknown>; message?: string };
        if (payload.errors && typeof payload.errors === 'object') {
          const mapped = mapApiErrorsToForm(payload.errors, t);
          if (Object.keys(mapped).length > 0) {
            setErrors(mapped);
            scrollToFirstAnnouncementFieldError(mapped);
            return;
          }
        }
      }
      toast.error(t('common.error', { defaultValue: 'Error' }));
    } finally {
      setSubmitAction(null);
    }
  };

  return (
    <AdminFormPageShell
      backLabel={backLabel}
      onBack={() => !isSubmitting && navigate('/admin/announcements')}
      heroTitle={t(`${FORM_PREFIX}.title`)}
      heroSubtitle={t(`${FORM_PREFIX}.subtitle`)}
      heroIcon={Megaphone}
      heroAction={
        <button
          type="submit"
          form={CREATE_FORM_ID}
          disabled={isSubmitting}
          aria-busy={submitAction === 'publish'}
          className="admin-btn-primary inline-flex h-10 items-center justify-center gap-2 rounded-lg px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitAction === 'publish' ? (
            <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
          ) : (
            <CheckCircle className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
          )}
          {submitAction === 'publish'
            ? t(`${FORM_PREFIX}.actions.publishing`, { defaultValue: 'Publishing…' })
            : t(`${FORM_PREFIX}.actions.create`)}
        </button>
      }
    >
      <div className="admin-ann-form-shell">
        <CreateAnnouncementForm
          hidePanelHeader
          title={title}
          type={type}
          audience={audience}
          eventDate={eventDate}
          expirationDate={expirationDate}
          publicationMode={publicationSchedule.publicationMode}
          publishDate={publicationSchedule.publishDate}
          publishTime={publicationSchedule.publishTime}
          timezone={publicationSchedule.timezone}
          priority={priority}
          visibility={visibility}
          message={message}
          coverImage={coverImage}
          attachments={attachments}
          attachmentLinks={attachmentLinks}
          targeting={targeting}
          hasTargeting={hasTargeting}
          audienceSize={0}
          onTargetingChange={setTargeting}
          errors={errors}
          onTitleChange={(value) => {
            setTitle(value);
            clearFieldError('title');
          }}
          onTypeChange={(value) => {
            setType(value);
            clearFieldError('type');
          }}
          onAudienceChange={(value) => {
            setAudience(value);
            clearFieldError('audience');
          }}
          onEventDateChange={(value) => {
            setEventDate(value);
            clearFieldError('eventDate');
          }}
          onExpirationDateChange={(value) => {
            setExpirationDate(value);
            clearFieldError('expirationDate');
          }}
          onPublicationModeChange={(mode) => {
            setPublicationSchedule((prev) => ({ ...prev, publicationMode: mode }));
            clearFieldError('publishDate');
            clearFieldError('publishTime');
          }}
          onPublishDateChange={(value) => {
            setPublicationSchedule((prev) => ({ ...prev, publishDate: value }));
            clearFieldError('publishDate');
          }}
          onPublishTimeChange={(value) => {
            setPublicationSchedule((prev) => ({ ...prev, publishTime: value }));
            clearFieldError('publishTime');
          }}
          onTimezoneChange={(value) => {
            setPublicationSchedule((prev) => ({ ...prev, timezone: value }));
            clearFieldError('timezone');
          }}
          onPriorityChange={(value) => {
            setPriority(value);
            clearFieldError('priority');
          }}
          onVisibilityChange={(value) => {
            setVisibility(value);
            clearFieldError('visibility');
          }}
          onMessageChange={(value) => {
            setMessage(value);
            clearFieldError('message');
          }}
          onCoverImageChange={setCoverImage}
          onAttachmentsChange={setAttachments}
          onAttachmentLinksChange={setAttachmentLinks}
          submitAction={submitAction}
          isSubmitting={isSubmitting}
          onDraft={() => submit(false)}
          onPublish={() => submit(true)}
        />
      </div>
    </AdminFormPageShell>
  );
};

export default CreateAnnouncementPage;
