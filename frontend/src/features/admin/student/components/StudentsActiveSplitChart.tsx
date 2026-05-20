import { FunctionComponent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { StudentDashboardStats } from '../../api/types';
import { AdminChartDonutSkeleton, AdminSectionEmptyState } from '../../ui';
import AdminDonutChart from '../../ui/charts/AdminDonutChart';
import { buildStudentsActiveSplitSegments } from '../utils/studentsChartData';

interface StudentsActiveSplitChartProps {
  stats: StudentDashboardStats | null;
  loading?: boolean;
}

const StudentsActiveSplitChart: FunctionComponent<StudentsActiveSplitChartProps> = ({
  stats,
  loading = false,
}) => {
  const { t } = useTranslation();

  const segments = useMemo(() => {
    if (!stats) return [];
    return buildStudentsActiveSplitSegments(stats, {
      active: t('admin.charts.students-active-split.segments.active', { defaultValue: 'Active' }),
      inactive: t('admin.charts.students-active-split.segments.inactive', { defaultValue: 'Inactive' }),
    });
  }, [stats, t]);

  const ariaLabel = t('admin.charts.students-active-split.ariaLabel', {
    defaultValue: 'Donut chart of active and inactive students',
  });

  if (loading && !stats) {
    return <AdminChartDonutSkeleton />;
  }

  if (!stats || segments.length === 0) {
    return (
      <AdminSectionEmptyState
        variant="inline"
        iconPreset="users"
        titleKey="admin.empty.studentsSearch"
        descriptionKey="admin.empty.tryAdjusting"
      />
    );
  }

  return <AdminDonutChart segments={segments} ariaLabel={ariaLabel} />;
};

export default StudentsActiveSplitChart;
