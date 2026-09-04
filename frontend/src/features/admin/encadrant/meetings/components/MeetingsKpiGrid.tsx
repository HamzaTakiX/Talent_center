import { FunctionComponent, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  CalendarClock,
  CalendarX,
  CheckCircle2,
  Clock,
  Layers,
  PlayCircle,
  Timer,
  TrendingUp,
} from 'lucide-react';
import AdminKpiStatCard from '../../../ui/AdminKpiStatCard';
import { AdminKpiStripSkeleton } from '../../../ui';
import type { MeetingsDashboardSummary } from '../types/supervisionMeeting';
import { staggerContainer } from '../../../dashboard/ui/animations';

interface MeetingsKpiGridProps {
  summary: MeetingsDashboardSummary | null;
  loading?: boolean;
}

const MeetingsKpiGrid: FunctionComponent<MeetingsKpiGridProps> = ({ summary, loading }) => {
  const { t } = useTranslation();

  const items = useMemo(
    () => [
      {
        key: 'total',
        value: String(summary?.total ?? 0),
        icon: Layers,
        accent: 'var(--admin-brand)',
        accentBg: 'var(--admin-brand-muted)',
      },
      {
        key: 'active',
        value: String((summary?.upcoming ?? 0) + (summary?.inProgress ?? 0)),
        icon: PlayCircle,
        accent: '#3b82f6',
        accentBg: 'color-mix(in srgb, #3b82f6 14%, var(--admin-bg-elevated))',
      },
      {
        key: 'completed',
        value: String(summary?.completed ?? 0),
        icon: CheckCircle2,
        accent: '#16a34a',
        accentBg: 'color-mix(in srgb, #16a34a 14%, var(--admin-bg-elevated))',
      },
      {
        key: 'delayed',
        value: String((summary?.delayed ?? 0) + (summary?.overdue ?? 0)),
        icon: Timer,
        accent: '#ea580c',
        accentBg: 'color-mix(in srgb, #ea580c 14%, var(--admin-bg-elevated))',
      },
      {
        key: 'cancelled',
        value: String(summary?.cancelled ?? 0),
        icon: CalendarX,
        accent: '#64748b',
        accentBg: 'color-mix(in srgb, #64748b 12%, var(--admin-bg-elevated))',
      },
      {
        key: 'upcoming',
        value: String(summary?.upcoming ?? 0),
        icon: CalendarClock,
        accent: '#4f46e5',
        accentBg: 'color-mix(in srgb, #4f46e5 14%, var(--admin-bg-elevated))',
      },
      {
        key: 'missed',
        value: String(summary?.missed ?? 0),
        icon: Clock,
        accent: '#dc2626',
        accentBg: 'color-mix(in srgb, #dc2626 14%, var(--admin-bg-elevated))',
      },
      {
        key: 'completionRate',
        value: `${summary?.completionRate ?? 0}%`,
        icon: TrendingUp,
        accent: '#0891b2',
        accentBg: 'color-mix(in srgb, #0891b2 14%, var(--admin-bg-elevated))',
      },
    ],
    [summary],
  );

  if (loading && !summary) {
    return <AdminKpiStripSkeleton count={8} />;
  }

  return (
    <motion.div
      className="admin-meetings-kpi-strip"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      aria-busy={loading}
    >
      {items.map((item, index) => (
        <AdminKpiStatCard
          key={item.key}
          label={t(`admin.modules.meetings.kpi.${item.key}`, { defaultValue: item.key })}
          value={loading ? '—' : item.value}
          icon={item.icon}
          accent={item.accent}
          accentBg={item.accentBg}
          index={index}
        />
      ))}
    </motion.div>
  );
};

export default MeetingsKpiGrid;
