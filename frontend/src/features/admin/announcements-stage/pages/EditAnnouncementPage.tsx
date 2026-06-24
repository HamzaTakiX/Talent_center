import { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';

import { useTranslation } from 'react-i18next';

import { useNavigate, useParams } from 'react-router-dom';

import { isAxiosError } from 'axios';

import { useAdminBackLabel } from '../../i18n/useAdminCopy';

import { useAdminToast } from '../../dashboard/context/AdminToastContext';

import { adminAnnouncementsApi } from '../../api/announcements';

import { useAcademicStructureCatalog } from '../../shared/academic-structure/hooks/useAcademicStructureCatalog';

import AdminFormPageShell from '../../ui/AdminFormPageShell';

import AnnouncementFormLoadingSkeleton from '../components/AnnouncementFormLoadingSkeleton';

import CreateAnnouncementForm from '../components/CreateAnnouncementForm';

import {

  resolveAnnouncementPriority,

  resolveAnnouncementTargetScope,

} from '../constants/createAnnouncement';

import { useAnnouncementDetail } from '../hooks/useAnnouncements';

import {

  type AnnouncementFormErrors,

  type AnnouncementFormFieldKey,

  mapApiErrorsToForm,

  scrollToFirstAnnouncementFieldError,

  validateCreateAnnouncementForm,

} from '../utils/validateCreateAnnouncement';

import {

  mapAnnouncementTargetsToTargetingRules,

  mapTargetingRulesToAnnouncementTargets,

} from '../utils/announcementTargetingMappers';

import {

  createEmptyTargetingRules,

  hasTargetingSelection,

} from '../../../shared/utils/targetingMappers';

import type { AnnouncementTargetPayload } from '../types/announcement';
import {
  createDefaultPublicationSchedule,
  splitPublishStartAt,
} from '../utils/scheduleUtils';
import '../styles/admin-announcements.css';



const FORM_PREFIX = 'admin.forms.createAnnouncement';



type SubmitAction = 'draft' | 'publish' | null;



function readAnnField(ann: Record<string, unknown>, ...keys: string[]): string {

  for (const key of keys) {

    const value = ann[key];

    if (value != null && value !== '') return String(value);

  }

  return '';

}



const EditAnnouncementPage: FunctionComponent = () => {

  const navigate = useNavigate();

  const { t, i18n } = useTranslation();

  const { id } = useParams<{ id: string }>();

  const toast = useAdminToast();

  const backLabel = useAdminBackLabel('announcements');

  const lang = i18n.language?.slice(0, 2) || 'fr';

  const { catalog } = useAcademicStructureCatalog();

  const { data, loading } = useAnnouncementDetail(id);



  const [title, setTitle] = useState('');

  const [type, setType] = useState('');

  const [audience, setAudience] = useState('allStudents');

  const [eventDate, setEventDate] = useState('');

  const [expirationDate, setExpirationDate] = useState('');

  const [publicationSchedule, setPublicationSchedule] = useState(createDefaultPublicationSchedule);

  const [priority, setPriority] = useState('NORMAL');

  const [visibility, setVisibility] = useState('ALL_STUDENTS');

  const [message, setMessage] = useState('');

  const [coverImage, setCoverImage] = useState<File | null>(null);

  const [attachments, setAttachments] = useState<File[]>([]);

  const [attachmentLinks, setAttachmentLinks] = useState<string[]>([]);

  const [existingCoverUrl, setExistingCoverUrl] = useState<string | null>(null);

  const [targeting, setTargeting] = useState(createEmptyTargetingRules);

  const [audienceSize, setAudienceSize] = useState(0);

  const [submitAction, setSubmitAction] = useState<SubmitAction>(null);

  const [errors, setErrors] = useState<AnnouncementFormErrors>({});

  const [hydrated, setHydrated] = useState(false);



  const isSubmitting = submitAction !== null;

  const hasTargeting = useMemo(() => hasTargetingSelection(targeting), [targeting]);

  const goBack = () => navigate('/admin/announcements');



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



  useEffect(() => {

    setHydrated(false);

    setCoverImage(null);

    setAttachments([]);

    setAttachmentLinks([]);

    setExistingCoverUrl(null);

    setTargeting(createEmptyTargetingRules());

  }, [id]);



  useEffect(() => {

    if (!data) return;



    const ann = data.announcement as Record<string, unknown>;

    const scope = readAnnField(ann, 'target_scope') || 'ALL_STUDENTS';



    setTitle(readAnnField(ann, 'title'));

    setType(readAnnField(ann, 'typeCode', 'type_code'));

    setMessage(readAnnField(ann, 'body', 'summary'));

    setPriority(readAnnField(ann, 'priority') || 'NORMAL');

    setVisibility(scope);

    setAudience(scope === 'ALL_STUDENTS' ? 'allStudents' : 'finalYear');

    setEventDate(

      ann.publish_start_at ? String(ann.publish_start_at).slice(0, 10) : '',

    );

    setExpirationDate(

      ann.publish_end_at ? String(ann.publish_end_at).slice(0, 10) : '',

    );

    const status = readAnnField(ann, 'status');
    const scheduleTz =
      (ann.scheduleTimezone as string) ||
      ((ann.metadata_json as Record<string, string> | undefined)?.schedule_timezone) ||
      'Africa/Casablanca';
    if (status === 'SCHEDULED' && ann.publish_start_at) {
      const split = splitPublishStartAt(String(ann.publish_start_at));
      setPublicationSchedule({
        publicationMode: 'schedule',
        publishDate: split.publishDate,
        publishTime: split.publishTime,
        timezone: scheduleTz,
      });
    } else {
      setPublicationSchedule(createDefaultPublicationSchedule());
    }

    setExistingCoverUrl(readAnnField(ann, 'coverImageUrl', 'cover_image_url') || null);

    setAudienceSize(data.audienceCount ?? 0);

    setHydrated(true);

  }, [data]);



  useEffect(() => {

    if (!data || !catalog) return;



    const ann = data.announcement as Record<string, unknown>;

    const targets = (ann.targets ?? []) as AnnouncementTargetPayload[];

    setTargeting(mapAnnouncementTargetsToTargetingRules(targets, catalog, lang));

  }, [catalog, data, lang]);



  const clearFieldError = useCallback((field: AnnouncementFormFieldKey) => {

    setErrors((prev) => {

      if (!prev[field]) return prev;

      const next = { ...prev };

      delete next[field];

      return next;

    });

  }, []);



  const submit = async () => {

    if (!id || isSubmitting) return;



    const validationErrors = validateCreateAnnouncementForm(formValues, t, {
      hasTargeting,
      publishing: true,
      skipPublicationSchedule: true,
    });

    if (Object.keys(validationErrors).length > 0) {

      setErrors(validationErrors);

      scrollToFirstAnnouncementFieldError(validationErrors);

      return;

    }



    if (hasTargeting && !catalog) {

      toast.error(t('common.error', { defaultValue: 'Error' }));

      return;

    }



    setErrors({});

    setSubmitAction('publish');



    try {

      const targets = hasTargeting

        ? mapTargetingRulesToAnnouncementTargets(targeting, catalog, lang)

        : [];



      const isScheduled = publicationSchedule.publicationMode === 'schedule';
      const currentStatus = readAnnField(
        (data?.announcement ?? {}) as Record<string, unknown>,
        'status',
      );

      await adminAnnouncementsApi.update(id, {

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

        status: isScheduled ? 'SCHEDULED' : currentStatus || 'DRAFT',

        ...(isScheduled

          ? {

              schedule_date: publicationSchedule.publishDate,

              schedule_time: publicationSchedule.publishTime,

              schedule_timezone: publicationSchedule.timezone,

            }

          : {}),

      });



      if (coverImage) {

        try {

          await adminAnnouncementsApi.uploadCover(id, coverImage);

        } catch {

          toast.error(

            t(`${FORM_PREFIX}.coverUploadError`, {

              defaultValue: "L'annonce est enregistrée mais l'image n'a pas pu être envoyée.",

            }),

          );

          navigate(`/admin/announcements/${id}`);

          return;

        }

      }



      if (attachments.length > 0) {

        try {

          await adminAnnouncementsApi.uploadAttachments(id, attachments);

        } catch {

          toast.error(

            t(`${FORM_PREFIX}.attachmentsUploadError`, {

              defaultValue: "L'annonce est enregistrée mais les pièces jointes n'ont pas pu être envoyées.",

            }),

          );

          navigate(`/admin/announcements/${id}`);

          return;

        }

      }



      if (attachmentLinks.length > 0) {

        try {

          await adminAnnouncementsApi.uploadAttachmentLinks(id, attachmentLinks);

        } catch {

          toast.error(

            t(`${FORM_PREFIX}.attachmentLinksUploadError`, {

              defaultValue: "L'annonce est enregistrée mais les liens n'ont pas pu être enregistrés.",

            }),

          );

          navigate(`/admin/announcements/${id}`);

          return;

        }

      }



      toast.success(

        t(`${FORM_PREFIX}.updateSuccess`, { defaultValue: 'Modifications enregistrées.' }),

      );

      navigate(`/admin/announcements/${id}`);

    } catch (err: unknown) {

      if (isAxiosError(err) && err.response?.data && typeof err.response.data === 'object') {

        const payload = err.response.data as { errors?: Record<string, unknown> };

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



  if (loading || (data && !hydrated)) {

    return (

      <AdminFormPageShell backLabel={backLabel} onBack={goBack}>

        <AnnouncementFormLoadingSkeleton />

      </AdminFormPageShell>

    );

  }



  if (!data) {

    return (

      <AdminFormPageShell backLabel={backLabel} onBack={goBack}>

        <p className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface-muted)]/30 px-4 py-6 text-sm text-[var(--admin-text-secondary)]">

          {t('admin.common.notFound.announcement')}

        </p>

      </AdminFormPageShell>

    );

  }



  const ann = data.announcement as Record<string, unknown>;



  return (

    <AdminFormPageShell

      backLabel={backLabel}

      onBack={() => !isSubmitting && goBack()}

      heroTitle={t(`${FORM_PREFIX}.editTitle`)}

      heroSubtitle={t(`${FORM_PREFIX}.editSubtitle`)}

      breadcrumbs={[

        { label: t('admin.common.breadcrumbs.announcements'), onClick: goBack },

        { label: String(ann.title ?? '') },

      ]}

    >

      <div className="admin-ann-form-shell">

        <CreateAnnouncementForm

          hidePanelHeader

          variant="edit"

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

          existingCoverUrl={existingCoverUrl}

          targeting={targeting}

          hasTargeting={hasTargeting}

          audienceSize={audienceSize}

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

          onDraft={goBack}

          onPublish={submit}

        />

      </div>

    </AdminFormPageShell>

  );

};



export default EditAnnouncementPage;

