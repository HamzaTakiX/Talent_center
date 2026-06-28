import { FunctionComponent, useMemo } from 'react';
import {
  AlertTriangle,
  Briefcase,
  CheckCircle,
  TrendingUp,
  UserX,
  Users,
} from 'lucide-react';
import StudentCardStatGrid from './StudentCardStatGrid';
import type { StudentDashboardStats } from '../../api/types';
import { AdminKpiStripSkeleton } from '../../ui/AdminSectionSkeleton';

interface StudentsStatGridProps {
  stats?: StudentDashboardStats | null;
  loading?: boolean;
}

const StudentsStatGrid: FunctionComponent<StudentsStatGridProps> = ({ stats = null, loading = false }) => {
  const displayStats = useMemo(() => {
    const data: StudentDashboardStats = stats ?? {
      total: 0,
      active: 0,
      inactive: 0,
      without_internship: 0,
      with_internship: 0,
      engagement_percent: 0,
    };
    return [
      {
        labelKey: 'students.totalStudents',
        value: data.total,
        Icon: Users,
        iconBgClass: 'bg-[#3b82f6]',
      },
      {
        labelKey: 'students.active',
        value: data.active,
        Icon: CheckCircle,
        iconBgClass: 'bg-[#22c55e]',
      },
      {
        labelKey: 'students.inactive',
        value: data.inactive,
        Icon: UserX,
        iconBgClass: 'bg-[#64748b]',
      },
      {
        labelKey: 'students.withoutInternship',
        value: data.without_internship,
        Icon: AlertTriangle,
        iconBgClass: 'bg-[#f97316]',
      },
      {
        labelKey: 'students.withInternship',
        value: data.with_internship,
        Icon: Briefcase,
        iconBgClass: 'bg-[#6366f1]',
      },
      {
        labelKey: 'students.engagementLevel',
        value: data.engagement_percent,
        valueSuffix: '%',
        Icon: TrendingUp,
        iconBgClass: 'bg-[#a855f7]',
      },
    ];
  }, [stats]);

  if (loading) {
    return <AdminKpiStripSkeleton count={6} />;
  }

  return (
    <StudentCardStatGrid
      stats={displayStats.map((card) => ({
        labelKey: card.labelKey,
        value: card.value,
        valueSuffix: card.valueSuffix,
        Icon: card.Icon,
        iconBgClass: card.iconBgClass,
      }))}
      columns={3}
    />
  );
};

export default StudentsStatGrid;
