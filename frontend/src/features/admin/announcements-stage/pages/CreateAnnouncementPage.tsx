import { FunctionComponent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAdminBackLabel } from '../../i18n/useAdminCopy';
import AdminLayout from '../../components/AdminLayout';
import CreateAnnouncementForm from '../components/CreateAnnouncementForm';

const CreateAnnouncementPage: FunctionComponent = () => {
  const navigate = useNavigate();
  const backLabel = useAdminBackLabel('announcements');
  const [title, setTitle] = useState('');
  const [type, setType] = useState('');
  const [audience, setAudience] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [priority, setPriority] = useState('');
  const [visibility, setVisibility] = useState('');
  const [message, setMessage] = useState('');

  const goBack = () => navigate('/admin/announcements');

  return (
    <AdminLayout>
      <div className="flex w-full min-w-0 flex-col gap-5 pb-2 font-inter">
        <button
          type="button"
          onClick={goBack}
          className="inline-flex h-9 w-fit shrink-0 items-center justify-center gap-2 admin-btn-surface rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] px-4 text-center text-sm font-medium text-[var(--admin-text)] transition-colors hover:bg-[var(--admin-row-hover)]"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
          <span className="leading-5">{backLabel}</span>
        </button>

        <CreateAnnouncementForm
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
      </div>
    </AdminLayout>
  );
};

export default CreateAnnouncementPage;
