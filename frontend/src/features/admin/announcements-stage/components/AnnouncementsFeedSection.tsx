import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import type { AnnouncementListItem } from '../types/announcement';
import AnnouncementCard from './AnnouncementCard';
import AnnouncementsPremiumEmpty from './AnnouncementsPremiumEmpty';
import { AdminSectionSkeletonShell } from '../../ui/AdminSectionSkeleton';

interface Props {
  items: AnnouncementListItem[];
  loading?: boolean;
  total?: number;
  hasSearch?: boolean;
}

const AnnouncementsFeedSection: FunctionComponent<Props> = ({
  items,
  loading,
  total = 0,
  hasSearch,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <section className="admin-ann-feed">
      <div className="admin-ann-feed__head">
        <h3 className="admin-ann-panel-title">{t('admin.announcementsModule.feed.title')}</h3>
        <span className="admin-ann-feed__count">{total}</span>
      </div>

      {loading ? (
        <AdminSectionSkeletonShell className="admin-ann-card-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="admin-shimmer admin-ann-skeleton-card" aria-hidden />
          ))}
        </AdminSectionSkeletonShell>
      ) : items.length === 0 ? (
        <AnnouncementsPremiumEmpty
          variant={hasSearch ? 'search' : 'list'}
          onAction={() => navigate('/admin/announcements/create')}
        />
      ) : (
        <div className="admin-ann-card-grid">
          {items.map((item, index) => (
            <AnnouncementCard
              key={item.id}
              item={item}
              index={index}
              onClick={() => navigate(`/admin/announcements/${item.id}`)}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default AnnouncementsFeedSection;
