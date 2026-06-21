import { FunctionComponent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import PlatformKpiStrip from '../../../../design-system/PlatformKpiStrip';
import {
  BriefcaseBusiness,
  Clock3,
  FileText,
  MessageCircleMore,
  Users,
  Video,
} from 'lucide-react';
import type { HistoryStatItem } from '../../../admin/main_history/types';

const iconByKey: Record<string, typeof Clock3> = {
  my_applications: BriefcaseBusiness,
  my_documents: FileText,
  my_meetings: Video,
  my_interview_simulations: Users,
  my_notifications: MessageCircleMore,
  recent_activity: Clock3,
};

const bgByKey: Record<string, string> = {
  my_applications: 'bg-[#3b82f6]',
  my_documents: 'bg-[#d97706]',
  my_meetings: 'bg-[#7c3aed]',
  my_interview_simulations: 'bg-[#9333ea]',
  my_notifications: 'bg-[#14b8a6]',
  recent_activity: 'bg-[#2563eb]',
};

interface StudentHistoryStatsStripProps {
  stats: HistoryStatItem[];
  loading?: boolean;
}

const StudentHistoryStatsStrip: FunctionComponent<StudentHistoryStatsStripProps> = ({
  stats,
  loading = false,
}) => {
  const { t } = useTranslation();

  const items = useMemo(
    () =>
      stats.map((item) => ({
        id: item.key,
        label: t(`student.mainHistory.stats.${item.key}`, item.label),
        value: item.value,
        icon: iconByKey[item.key] ?? Clock3,
        iconBgClass: bgByKey[item.key] ?? 'bg-[#3b82f6]',
      })),
    [stats, t],
  );

  if (loading && items.length === 0) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6" aria-busy>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="admin-skeleton h-16 rounded-xl" />
        ))}
      </div>
    );
  }

  if (items.length === 0) return null;

  return (
    <PlatformKpiStrip
      items={items}
      columns={3}
      className="w-full min-w-0 max-w-full student-audit-strip"
      ariaLabel={t('student.mainHistory.statsAria')}
    />
  );
};

export default StudentHistoryStatsStrip;
