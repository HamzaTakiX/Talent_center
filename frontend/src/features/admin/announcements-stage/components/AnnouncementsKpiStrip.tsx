import { FunctionComponent, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  AlertTriangle,
  Briefcase,
  Eye,
  FileEdit,
  Megaphone,
  Timer,
} from 'lucide-react';
import AdminKpiStatCard from '../../ui/AdminKpiStatCard';
import { AdminKpiStripSkeleton } from '../../ui';
import type { AnnouncementDashboardData } from '../types/announcement';
import { staggerContainer } from '../../dashboard/ui/animations';

interface Props {
  summary: AnnouncementDashboardData['summary'] | null;
  engagement?: AnnouncementDashboardData['engagement'];
  loading?: boolean;
  onNavigate?: (key: string) => void;
}

const AnnouncementsKpiStrip: FunctionComponent<Props> = ({
  summary,
  engagement,
  loading,
  onNavigate,
}) => {
  const { t } = useTranslation();

  const items = useMemo(
    () => [
      { key: 'active', value: String(summary?.activeCount ?? 0), icon: Megaphone, accent: 'var(--admin-brand)', accentBg: 'var(--admin-brand-muted)' },
      { key: 'internships', value: String(summary?.internshipOffersCount ?? 0), icon: Briefcase, accent: '#0891b2', accentBg: 'color-mix(in srgb, #0891b2 14%, var(--admin-bg-elevated))' },
      { key: 'urgent', value: String(summary?.urgentCount ?? 0), icon: AlertTriangle, accent: '#dc2626', accentBg: 'color-mix(in srgb, #dc2626 12%, var(--admin-bg-elevated))' },
      { key: 'expiring', value: String(summary?.expiringCount ?? 0), icon: Timer, accent: '#ea580c', accentBg: 'color-mix(in srgb, #ea580c 12%, var(--admin-bg-elevated))' },
      { key: 'drafts', value: String(summary?.draftCount ?? 0), icon: FileEdit, accent: '#64748b', accentBg: 'color-mix(in srgb, #64748b 10%, var(--admin-bg-elevated))' },
      { key: 'views', value: String(engagement?.views ?? summary?.totalViews ?? 0), icon: Eye, accent: '#2563eb', accentBg: 'color-mix(in srgb, #2563eb 12%, var(--admin-bg-elevated))' },
      { key: 'engagement', value: `${engagement?.engagementRate ?? 0}%`, icon: Megaphone, accent: '#16a34a', accentBg: 'color-mix(in srgb, #16a34a 12%, var(--admin-bg-elevated))' },
    ],
    [summary, engagement],
  );

  if (loading && !summary) return <AdminKpiStripSkeleton count={7} />;

  return (
    <motion.div
      className="admin-ann-kpi-strip"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {items.map((item, index) => (
        <AdminKpiStatCard
          key={item.key}
          label={t(`admin.announcementsModule.kpi.${item.key}`)}
          value={loading ? '—' : item.value}
          icon={item.icon}
          accent={item.accent}
          accentBg={item.accentBg}
          index={index}
          onClick={onNavigate ? () => onNavigate(item.key) : undefined}
        />
      ))}
    </motion.div>
  );
};

export default AnnouncementsKpiStrip;
