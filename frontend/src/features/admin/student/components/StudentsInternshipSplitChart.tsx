import { FunctionComponent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { StudentDashboardStats } from '../../api/types';
import { AdminChartDonutSkeleton, AdminSectionEmptyState } from '../../ui';
import AdminDonutChart from '../../ui/charts/AdminDonutChart';
import { buildStudentsInternshipSplitSegments } from '../utils/studentsChartData';

interface StudentsInternshipSplitChartProps {
  stats: StudentDashboardStats | null;
  loading?: boolean;
}

const StudentsInternshipSplitChart: FunctionComponent<StudentsInternshipSplitChartProps> = ({
  stats,
  loading = false,
}) => {
  const { t } = useTranslation();

  const segments = useMemo(() => {
    if (!stats) return [];
    return buildStudentsInternshipSplitSegments(stats, {
      withInternship: t('admin.charts.students-internship-split.segments.with'),
      withoutInternship: t('admin.charts.students-internship-split.segments.without'),
    });
  }, [stats, t]);

  const ariaLabel = t('admin.charts.students-internship-split.ariaLabel', {
    defaultValue: 'Donut chart of students with and without internship',
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

export default StudentsInternshipSplitChart;
