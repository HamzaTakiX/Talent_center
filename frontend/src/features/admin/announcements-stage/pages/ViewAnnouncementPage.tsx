import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import AdminModulePageShell from '../../ui/AdminModulePageShell';
import AdminModulePageSkeleton from '../../ui/AdminModulePageSkeleton';
import { useAdminBackLabel } from '../../i18n/useAdminCopy';
import AnnouncementDetailView from '../components/AnnouncementDetailView';
import AnnouncementsPremiumEmpty from '../components/AnnouncementsPremiumEmpty';
import { useAnnouncementDetail } from '../hooks/useAnnouncements';
import '../styles/admin-announcements.css';

const ViewAnnouncementPage: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const backLabel = useAdminBackLabel('announcements');
  const { data, loading } = useAnnouncementDetail(id);

  return (
    <AdminModulePageShell width="wide">
      <div className="admin-ann-workspace">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/announcements')}
            className="admin-btn-surface inline-flex items-center gap-2 rounded-lg border border-[var(--admin-border)] px-4 py-2 text-sm font-medium text-[var(--admin-text)] transition-colors hover:bg-[var(--admin-row-hover)]"
          >
            {backLabel}
          </button>
          {data && id ? (
            <button
              type="button"
              className="admin-btn-primary inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold"
              onClick={() => navigate(`/admin/announcements/${id}/edit`)}
            >
              <Pencil className="h-4 w-4" aria-hidden />
              {t('admin.announcementsModule.detail.edit')}
            </button>
          ) : null}
        </div>

        {loading ? (
          <AdminModulePageSkeleton />
        ) : data ? (
          <AnnouncementDetailView data={data} />
        ) : (
          <AnnouncementsPremiumEmpty variant="list" onAction={() => navigate('/admin/announcements')} />
        )}
      </div>
    </AdminModulePageShell>
  );
};

export default ViewAnnouncementPage;
