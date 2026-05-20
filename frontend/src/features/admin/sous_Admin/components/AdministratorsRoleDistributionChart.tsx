import { FunctionComponent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { AdminAdministratorRow } from '../../api/types';
import { useAdminTableValues } from '../../i18n/useAdminTableValues';
import { AdminChartDonutSkeleton, AdminSectionEmptyState } from '../../ui';
import AdminDonutChart from '../../ui/charts/AdminDonutChart';
import { buildAdministratorsRoleChartSegments } from '../utils/administratorsChartData';

interface AdministratorsRoleDistributionChartProps {
  rows: AdminAdministratorRow[];
  loading?: boolean;
}

const AdministratorsRoleDistributionChart: FunctionComponent<
  AdministratorsRoleDistributionChartProps
> = ({ rows, loading = false }) => {
  const { t } = useTranslation();
  const { adminRole } = useAdminTableValues();

  const segments = useMemo(
    () => buildAdministratorsRoleChartSegments(rows, adminRole),
    [rows, adminRole],
  );

  const ariaLabel = t('admin.charts.admins-role-distribution.ariaLabel', {
    defaultValue: 'Donut chart of administrator roles',
  });

  if (loading && rows.length === 0) {
    return <AdminChartDonutSkeleton legendItems={5} />;
  }

  if (segments.length === 0) {
    return (
      <AdminSectionEmptyState
        variant="inline"
        iconPreset="users"
        titleKey="admin.empty.administratorsSearch"
        descriptionKey="admin.empty.tryAdjusting"
      />
    );
  }

  return <AdminDonutChart segments={segments} ariaLabel={ariaLabel} />;
};

export default AdministratorsRoleDistributionChart;
