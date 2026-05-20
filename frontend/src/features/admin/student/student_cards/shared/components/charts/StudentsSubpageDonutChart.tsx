import { FunctionComponent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { AdminStudentRow, StudentDashboardStats } from '../../../../../api/types';
import { AdminChartDonutSkeleton, AdminSectionEmptyState } from '../../../../../ui';
import AdminDonutChart from '../../../../../ui/charts/AdminDonutChart';
import type { StudentListSliceFilter } from '../../types/studentListSlice';
import { buildOnboardingStepDonut, buildSubpageDonutSegments } from '../../utils/studentsSubpageChartData';

interface StudentsSubpageDonutChartProps {
  filter: StudentListSliceFilter;
  globalStats: StudentDashboardStats | null;
  allRows: AdminStudentRow[];
  variant?: 'main' | 'onboarding';
  loading?: boolean;
}

const StudentsSubpageDonutChart: FunctionComponent<StudentsSubpageDonutChartProps> = ({
  filter,
  globalStats,
  allRows,
  variant = 'main',
  loading = false,
}) => {
  const { t } = useTranslation();

  const labels = useMemo(
    () => ({
      active: t('admin.charts.students-active-split.segments.active', { defaultValue: 'Actifs' }),
      inactive: t('admin.charts.students-active-split.segments.inactive', { defaultValue: 'Inactifs' }),
      withInternship: t('admin.charts.students-internship-split.segments.with', {
        defaultValue: 'Avec stage',
      }),
      withoutInternship: t('admin.charts.students-internship-split.segments.without', {
        defaultValue: 'Sans stage',
      }),
      high: t('admin.charts.students-engagement-distribution.segments.high', { defaultValue: 'Élevé' }),
      medium: t('admin.charts.students-engagement-distribution.segments.medium', {
        defaultValue: 'Moyen',
      }),
      low: t('admin.charts.students-engagement-distribution.segments.low', { defaultValue: 'Faible' }),
      others: t('admin.charts.students-field-distribution.segments.others', { defaultValue: 'Autres' }),
      step0: t('admin.charts.students-onboarding-steps.labels.step0', { defaultValue: '0 %' }),
      step50: t('admin.charts.students-onboarding-steps.labels.step50', { defaultValue: '50 %' }),
      step100: t('admin.charts.students-onboarding-steps.labels.step100', { defaultValue: '100 %' }),
    }),
    [t],
  );

  const total = globalStats?.total ?? allRows.length;

  const { segments, centerTotal, centerCaption } = useMemo(() => {
    if (variant === 'onboarding') {
      return {
        segments: buildOnboardingStepDonut(allRows, total, {
          step0: labels.step0,
          step50: labels.step50,
          step100: labels.step100,
        }),
        centerTotal: total,
        centerCaption: t('admin.pagination.students', { defaultValue: 'étudiants' }),
      };
    }
    const built = buildSubpageDonutSegments(filter, globalStats, allRows, labels);
    return {
      ...built,
      centerCaption: t('admin.pagination.students', { defaultValue: 'étudiants' }),
    };
  }, [variant, filter, globalStats, allRows, labels, total, t]);

  const ariaLabel = useMemo(() => {
    if (variant === 'onboarding') {
      return t('admin.charts.students-onboarding-steps.ariaLabel', {
        defaultValue: 'Répartition de la complétion du profil',
      });
    }
    switch (filter) {
      case 'active':
      case 'inactive':
        return t('admin.charts.students-active-split.ariaLabel', {
          defaultValue: 'Actifs et inactifs sur le total des étudiants',
        });
      case 'without_internship':
      case 'with_internship':
        return t('admin.charts.students-internship-split.ariaLabel', {
          defaultValue: 'Avec ou sans stage sur le total des étudiants',
        });
      case 'engagement':
        return t('admin.charts.students-engagement-distribution.ariaLabel', {
          defaultValue: 'Niveaux d’engagement sur le total des étudiants',
        });
      default:
        return t('admin.charts.students-field-distribution.ariaLabel', {
          defaultValue: 'Répartition par filière sur le total des étudiants',
        });
    }
  }, [filter, variant, t]);

  if (loading && segments.length === 0) {
    return <AdminChartDonutSkeleton />;
  }

  if (segments.length === 0) {
    return (
      <AdminSectionEmptyState
        variant="inline"
        iconPreset="users"
        titleKey="admin.empty.studentsSearch"
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

export default StudentsSubpageDonutChart;
