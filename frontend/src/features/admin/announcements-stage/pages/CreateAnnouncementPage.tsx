import { FunctionComponent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAdminBackLabel } from '../../i18n/useAdminCopy';
import { useAdminToast } from '../../dashboard/context/AdminToastContext';
import { adminAnnouncementsApi } from '../../api/announcements';
import AdminFormPageShell from '../../ui/AdminFormPageShell';
import CreateAnnouncementForm from '../components/CreateAnnouncementForm';
import '../styles/admin-announcements.css';

const FORM_PREFIX = 'admin.forms.createAnnouncement';

const TYPE_MAP: Record<string, string> = {
  Event: 'forum-career-fair',
  Interview: 'recruitment-interview',
  Info: 'institutional-communication',
};

const CreateAnnouncementPage: FunctionComponent = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const toast = useAdminToast();
  const backLabel = useAdminBackLabel('announcements');
  const [title, setTitle] = useState('');
  const [type, setType] = useState('');
  const [audience, setAudience] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [priority, setPriority] = useState('NORMAL');
  const [visibility, setVisibility] = useState('ALL_STUDENTS');
  const [message, setMessage] = useState('');

  const submit = async (publish: boolean) => {
    if (!title.trim() || !type) {
      toast.error(t('common.error', { defaultValue: 'Validation error' }));
      return;
    }
    try {
      const created = await adminAnnouncementsApi.create({
        title,
        summary: title,
        body: message,
        announcementTypeCode: TYPE_MAP[type] ?? 'other',
        priority: priority as 'NORMAL',
        target_scope: visibility,
        publish_start_at: eventDate || null,
        status: publish ? 'PUBLISHED' : 'DRAFT',
      });
      if (publish && created?.id) await adminAnnouncementsApi.action(String(created.id), 'publish');
      toast.success(t(`${FORM_PREFIX}.publishSuccess`, { defaultValue: 'Announcement saved' }));
      navigate('/admin/announcements');
    } catch {
      toast.error(t('common.error', { defaultValue: 'Error' }));
    }
  };

  return (
    <AdminFormPageShell
      backLabel={backLabel}
      onBack={() => navigate('/admin/announcements')}
      heroTitle={t(`${FORM_PREFIX}.title`)}
      heroSubtitle={t(`${FORM_PREFIX}.subtitle`)}
    >
      <div className="admin-ann-form-shell">
      <CreateAnnouncementForm
        hidePanelHeader
        title={title}
        type={type}
        audience={audience}
        eventDate={eventDate}
        priority={priority}
        visibility={visibility}
        message={message}
        onTitleChange={setTitle}
        onTypeChange={setType}
        onAudienceChange={setAudience}
        onEventDateChange={setEventDate}
        onPriorityChange={setPriority}
        onVisibilityChange={setVisibility}
        onMessageChange={setMessage}
        onDraft={() => submit(false)}
        onPublish={() => submit(true)}
      />
      </div>
    </AdminFormPageShell>
  );
};

export default CreateAnnouncementPage;
