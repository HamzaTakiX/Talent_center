import { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Archive } from 'lucide-react';
import AdminModulePageShell from '../../ui/AdminModulePageShell';
import AdminBackButton from '../../ui/AdminBackButton';
import { useAdminBackLabel } from '../../i18n/useAdminCopy';
import AdminModulePageSkeleton from '../../ui/AdminModulePageSkeleton';
import AdminSearchInput from '../../ui/AdminSearchInput';
import AdminPagination from '../../ui/AdminPagination';
import AnnouncementCard from '../components/AnnouncementCard';
import AnnouncementsPremiumEmpty from '../components/AnnouncementsPremiumEmpty';
import { useAnnouncementsList } from '../hooks/useAnnouncements';
import { useAnnouncementMutation } from '../hooks/useAnnouncementMutation';
import { useAnnouncementTypes } from '../hooks/useAnnouncements';
import '../styles/admin-announcements.css';

const PAGE_SIZE = 12;

const ArchivedAnnouncementsPage: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const backLabel = useAdminBackLabel('announcements');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [unarchivingId, setUnarchivingId] = useState<string | null>(null);
  const { unarchiveAnnouncement } = useAnnouncementMutation();
  const { typesByCode } = useAnnouncementTypes();

  useEffect(() => {
    setPage(1);
  }, [search]);

  const listParams = useMemo(
    () => ({
      page,
      page_size: PAGE_SIZE,
      status: 'ARCHIVED',
      search: search.trim() || undefined,
      ordering: '-created_at' as const,
    }),
    [page, search],
  );

  const {
    items,
    total,
    page: currentPage,
    total_pages,
    loading,
    refresh,
  } = useAnnouncementsList(listParams);

  const handleUnarchive = useCallback(
    async (id: string) => {
      setUnarchivingId(id);
      try {
        await unarchiveAnnouncement(id);
        const wasLastOnPage = items.length === 1 && page > 1;
        await refresh();
        if (wasLastOnPage) {
          setPage((current) => Math.max(1, current - 1));
        }
      } finally {
        setUnarchivingId(null);
      }
    },
    [items.length, page, refresh, unarchiveAnnouncement],
  );

  if (loading && items.length === 0 && !search) {
    return (
      <AdminModulePageShell width="wide">
        <AdminModulePageSkeleton />
      </AdminModulePageShell>
    );
  }

  return (
    <AdminModulePageShell width="wide">
      <div className="admin-ann-workspace" data-admin-search-id="announcements-archived">
        <AdminBackButton onClick={() => navigate('/admin/announcements')} label={backLabel} />

        <header
          className="admin-ann-hero admin-ann-hero--compact admin-ann-hero--archived"
          aria-labelledby="ann-archived-title"
        >
          <div className="admin-ann-hero__glow" aria-hidden />
          <div className="admin-ann-hero__content">
            <div className="admin-ann-hero__badge admin-ann-hero__badge--archived">
              <Archive className="h-3.5 w-3.5" aria-hidden />
              <span>{t('admin.announcementsModule.nav.archived')}</span>
            </div>
            <h1 id="ann-archived-title" className="admin-ann-hero__title">
              {t('admin.announcementsModule.archived.title')}
            </h1>
            <p className="admin-ann-hero__subtitle">
              {t('admin.announcementsModule.archived.subtitle', { count: total })}
            </p>
          </div>
        </header>

        <section className="admin-ann-scheduled-panel">
          <div className="admin-ann-scheduled-toolbar">
            <AdminSearchInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('admin.announcementsModule.archived.searchPlaceholder')}
              aria-label={t('admin.announcementsModule.archived.searchPlaceholder')}
            />
          </div>

          {loading && items.length === 0 ? (
            <AdminModulePageSkeleton />
          ) : items.length === 0 ? (
            <AnnouncementsPremiumEmpty
              variant="list"
              title={t('admin.announcementsModule.archived.emptyTitle')}
              subtitle={t('admin.announcementsModule.archived.emptySubtitle')}
            />
          ) : (
            <>
              <div className="admin-ann-card-grid admin-ann-card-grid--archived">
                {items.map((item, index) => (
                  <AnnouncementCard
                    key={item.id}
                    item={item}
                    typeMeta={typesByCode.get(item.typeCode)}
                    index={index}
                    onClick={() => navigate(`/admin/announcements/${item.id}`)}
                    onUnarchive={() => handleUnarchive(item.id)}
                    unarchiveBusy={unarchivingId === item.id}
                  />
                ))}
              </div>
              <AdminPagination
                page={currentPage}
                totalPages={total_pages}
                totalItems={total}
                pageSize={PAGE_SIZE}
                onPageChange={setPage}
                itemLabel={t('admin.announcementsModule.archived.paginationLabel')}
              />
            </>
          )}
        </section>
      </div>
    </AdminModulePageShell>
  );
};

export default ArchivedAnnouncementsPage;
