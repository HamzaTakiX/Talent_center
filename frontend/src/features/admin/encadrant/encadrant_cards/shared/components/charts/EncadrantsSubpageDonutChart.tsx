import { FunctionComponent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { AdminEncadrantRow } from '../../../../../api/types';
import { AdminChartDonutSkeleton, AdminSectionEmptyState } from '../../../../../ui';
import AdminDonutChart from '../../../../../ui/charts/AdminDonutChart';
import type { EncadrantListSliceFilter } from '../../types/encadrantListSlice';
import type { EncadrantDashboardStats } from '../../utils/encadrantStats';
import { buildSubpageEncadrantDonut } from '../../utils/encadrantsSubpageChartData';
import EncadrantsReportsEmptyState from '../EncadrantsReportsEmptyState';

interface EncadrantsSubpageDonutChartProps {
  filter: EncadrantListSliceFilter;
  globalStats: EncadrantDashboardStats | null;
  allRows: AdminEncadrantRow[];
  loading?: boolean;
}

const EncadrantsSubpageDonutChart: FunctionComponent<EncadrantsSubpageDonutChartProps> = ({
  filter,
  globalStats,
  allRows,
  loading = false,
}) => {
  const { t } = useTranslation();

  const labels = useMemo(
    () => ({
      active: t('admin.charts.encadrants-reports-split.segments.active', {
        defaultValue: 'Actifs',
      }),
      inactive: t('admin.charts.encadrants-reports-split.segments.inactive', {
        defaultValue: 'Inactifs',
      }),
      withStudents: t('admin.charts.encadrants-with-students.segments.with', {
        defaultValue: 'Avec étudiants',
      }),
      withoutStudents: t('admin.charts.encadrants-with-students.segments.without', {
        defaultValue: 'Sans étudiants',
      }),
      others: t('admin.charts.encadrants-department-load.segments.others', {
        defaultValue: 'Autres',
      }),
    }),
    [t],
  );

  const { segments, centerTotal } = useMemo(() => {
    if (!globalStats) return { segments: [], centerTotal: 0 };
    return buildSubpageEncadrantDonut(filter, globalStats, allRows, labels);
  }, [filter, globalStats, allRows, labels]);

  const centerCaption = useMemo(() => {
    if (filter === 'with_students') {
      return t('admin.charts.encadrants-top-assigned.centerCaption', {
        defaultValue: 'étudiants assignés',
      });
    }
    return t('admin.pagination.encadrants', { defaultValue: 'encadrants' });
  }, [filter, t]);

  const ariaLabel = useMemo(() => {
    switch (filter) {
      case 'with_students':
        return t('admin.charts.encadrants-top-assigned.ariaLabel', {
          defaultValue: 'Répartition des étudiants assignés par encadrant',
        });
      case 'reports_in_progress':
        return t('admin.charts.encadrants-reports-split.ariaLabel', {
          defaultValue: 'Statut des rapports encadrants',
        });
      case 'meetings':
        return t('admin.charts.encadrants-meetings-weekly.ariaLabel', {
          defaultValue: 'Encadrants avec ou sans étudiants assignés',
        });
      default:
        return t('admin.charts.encadrants-department-load.ariaLabel', {
          defaultValue: 'Encadrants par filière sur le total',
        });
    }
  }, [filter, t]);

  if (filter === 'reports_in_progress') {
    return <EncadrantsReportsEmptyState />;
  }

  if (loading && !globalStats) {
    return <AdminChartDonutSkeleton />;
  }

  if (!globalStats || segments.length === 0) {
    return (
      <AdminSectionEmptyState
        variant="inline"
        iconPreset="users"
        titleKey="admin.empty.encadrantsSearch"
        descriptionKey="admin.empty.tryAdjusting"
      />
    );
  }

  return (
    <AdminDonutChart
      segments={segments}
      ariaLabel={ariaLabel}
      centerTotal={centerTotal}
      centerCaption={centerCaption}
    />
  );
};

export default EncadrantsSubpageDonutChart;
