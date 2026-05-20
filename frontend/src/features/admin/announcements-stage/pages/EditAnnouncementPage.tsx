import { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useAdminBackLabel } from '../../i18n/useAdminCopy';
import AdminFormPageShell from '../../ui/AdminFormPageShell';
import CreateAnnouncementForm from '../components/CreateAnnouncementForm';
import { announcementsMockData } from '../data/announcementsMockData';

const FORM_PREFIX = 'admin.forms.createAnnouncement';

const EditAnnouncementPage: FunctionComponent = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const backLabel = useAdminBackLabel('announcements');
  const goBack = () => navigate('/admin/announcements');

  const row = useMemo(
    () => announcementsMockData.find((a) => a.id === id),
    [id],
  );

  const [title, setTitle] = useState('');
  const [type, setType] = useState('');
  const [audience, setAudience] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [priority, setPriority] = useState('');
  const [visibility, setVisibility] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!row) return;
    setTitle(row.title);
    setType(row.type);
    setAudience(row.targetAudience);
    setEventDate(row.date);
    setPriority('normal');
    setVisibility('public');
    setMessage('');
  }, [row]);

  if (!row) {
    return (
      <AdminFormPageShell backLabel={backLabel} onBack={goBack}>
        <p className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface-muted)]/30 px-4 py-6 text-sm text-[var(--admin-text-secondary)]">
          {t('admin.common.notFound.announcement')}
        </p>
      </AdminFormPageShell>
    );
  }

  return (
    <AdminFormPageShell
      backLabel={backLabel}
      onBack={goBack}
      heroTitle={t(`${FORM_PREFIX}.editTitle`)}
      heroSubtitle={t(`${FORM_PREFIX}.editSubtitle`)}
      breadcrumbs={[
        { label: t('admin.common.breadcrumbs.announcements'), onClick: goBack },
        { label: row.title },
      ]}
    >
      <CreateAnnouncementForm
        hidePanelHeader
        variant="edit"
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
        onDraft={goBack}
        onPublish={goBack}
      />
    </AdminFormPageShell>
  );
};

export default EditAnnouncementPage;
