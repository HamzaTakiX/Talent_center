import { FunctionComponent, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { announcementsMockData } from '../data/announcementsMockData';

const EditAnnouncementPage: FunctionComponent = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const row = useMemo(
    () => announcementsMockData.find((a) => a.id === id),
    [id]
  );

  return (
    <AdminLayout>
      <div className="mx-auto w-full min-w-0 max-w-[1600px] space-y-5 font-inter">
        <button
          type="button"
          onClick={() => navigate('/admin/announcements')}
          className="inline-flex h-9 items-center justify-center gap-2 admin-btn-surface rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] px-4 text-center text-sm font-medium text-[var(--admin-text)] transition-colors hover:bg-[var(--admin-row-hover)]"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
          <span className="leading-5">Back to Announcements</span>
        </button>

        <div className="box-border flex w-full flex-col gap-4 admin-module-panel px-6 py-6 text-left text-[var(--admin-text)]">
          {row ? (
            <>
              <h1 className="m-0 text-base font-medium leading-4">Edit announcement</h1>
              <p className="m-0 text-base leading-6 text-[var(--admin-text-secondary)]">
                « {row.title} » — front-end only; wire your form and API here.
              </p>
              <button
                type="button"
                onClick={() => navigate(`/admin/announcements/${row.id}`)}
                className="inline-flex h-9 w-fit items-center admin-btn-surface rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] px-4 text-sm font-medium text-[var(--admin-text)] hover:admin-field border border-[var(--admin-border)] bg-[var(--admin-input-bg)]"
              >
                View details
              </button>
            </>
          ) : (
            <p className="m-0 text-[var(--admin-text-secondary)]">Announcement not found.</p>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default EditAnnouncementPage;
