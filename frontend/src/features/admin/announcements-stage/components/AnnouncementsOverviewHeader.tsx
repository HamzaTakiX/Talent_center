import { FunctionComponent } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Megaphone, Sparkles, TrendingUp } from 'lucide-react';
import { fadeInUp } from '../../dashboard/ui/animations';
import type { AnnouncementDashboardData } from '../types/announcement';

interface Props {
  summary: AnnouncementDashboardData['summary'] | null;
  engagement?: AnnouncementDashboardData['engagement'];
  loading?: boolean;
}

const AnnouncementsOverviewHeader: FunctionComponent<Props> = ({
  summary,
  engagement,
  loading,
}) => {
  const { t } = useTranslation();
  const rate = engagement?.engagementRate ?? 0;

  return (
    <motion.header {...fadeInUp} className="admin-ann-hero" aria-labelledby="ann-overview-title">
      <motion.div className="admin-ann-hero__glow" aria-hidden />
      <motion.div className="admin-ann-hero__content" {...fadeInUp}>
        <div className="admin-ann-hero__badge">
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          <span>{t('admin.announcementsModule.hero.badge')}</span>
        </div>
        <h1 id="ann-overview-title" className="admin-ann-hero__title">
          {t('admin.announcementsModule.hub.title')}
        </h1>
        <p className="admin-ann-hero__subtitle">{t('admin.announcementsModule.hub.subtitle')}</p>
        <div className="admin-ann-hero__metrics">
          <div className="admin-ann-hero__metric">
            <Megaphone className="h-4 w-4 text-[var(--admin-brand)]" aria-hidden />
            <span className="admin-ann-hero__metric-label">
              {t('admin.announcementsModule.hero.pipeline')}
            </span>
            <span className="admin-ann-hero__metric-value">
              {loading ? '—' : (summary?.activeCount ?? 0) + (summary?.scheduledCount ?? 0)}
            </span>
          </div>
          <div className="admin-ann-hero__metric">
            <TrendingUp className="h-4 w-4 text-[var(--admin-brand)]" aria-hidden />
            <span className="admin-ann-hero__metric-label">
              {t('admin.announcementsModule.kpi.engagement')}
            </span>
            <span className="admin-ann-hero__metric-value">
              {loading ? '—' : `${rate}%`}
            </span>
          </div>
        </div>
      </motion.div>
    </motion.header>
  );
};

export default AnnouncementsOverviewHeader;
