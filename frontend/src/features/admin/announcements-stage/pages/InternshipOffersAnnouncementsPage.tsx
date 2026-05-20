import { FunctionComponent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AdminListPageShell } from '../../ui';
import AnnouncementsFiltersBar, { type AnnListFilters } from '../components/AnnouncementsFiltersBar';
import AnnouncementsFeedSection from '../components/AnnouncementsFeedSection';
import AnnouncementsNavStrip from '../components/AnnouncementsNavStrip';
import { useAnnouncementsList } from '../hooks/useAnnouncements';
import '../styles/admin-announcements.css';

const InternshipOffersAnnouncementsPage: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [filters, setFilters] = useState<AnnListFilters>({ internship_only: true });
  const { items, total, loading } = useAnnouncementsList({
    internship_only: true,
    page_size: 12,
    search: filters.search || undefined,
    status: filters.status,
    priority: filters.priority,
  });

  return (
    <AdminListPageShell onBack={() => navigate('/admin/announcements')} backTo="announcements">
      <div className="admin-ann-workspace">
        <header className="admin-ann-hero admin-ann-hero--compact">
          <h1 className="admin-ann-hero__title">{t('admin.announcementsModule.internships.title')}</h1>
          <p className="admin-ann-hero__subtitle">{t('admin.announcementsModule.internships.subtitle')}</p>
        </header>
        <AnnouncementsNavStrip />
        <AnnouncementsFiltersBar filters={filters} onChange={setFilters} />
        <AnnouncementsFeedSection
          items={items}
          loading={loading}
          total={total}
          hasSearch={Boolean(filters.search?.trim() || filters.status || filters.priority)}
        />
      </div>
    </AdminListPageShell>
  );
};

export default InternshipOffersAnnouncementsPage;
