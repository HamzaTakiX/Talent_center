import { FunctionComponent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Clock, TrendingUp, Wallet } from 'lucide-react';
import PlatformKpiStrip from '../../../../design-system/PlatformKpiStrip';
import { AdminKpiStripSkeleton } from '../../../admin/ui/AdminSectionSkeleton';
import type { SrfFinancialSummary } from '../hooks/useStudentSrfData';
import { formatMad } from '../utils/formatMad';

interface SrfStatsGridProps {
  summary: SrfFinancialSummary;
  loading?: boolean;
}

const SrfStatsGrid: FunctionComponent<SrfStatsGridProps> = ({ summary, loading = false }) => {
  const { t } = useTranslation();

  const items = useMemo(
    () => [
      {
        id: 'totalDue',
        label: t('student.srf.stats.totalDue'),
        value: formatMad(summary.totalDue),
        icon: Wallet,
        iconBgClass: 'bg-[#2b7fff]',
      },
      {
        id: 'paid',
        label: t('student.srf.stats.paid'),
        value: formatMad(summary.paid),
        icon: CheckCircle2,
        iconBgClass: 'bg-[#22c55e]',
      },
      {
        id: 'remaining',
        label: t('student.srf.stats.remaining'),
        value: formatMad(summary.remaining),
        icon: Clock,
        iconBgClass: 'bg-[#f59e0b]',
      },
      {
        id: 'installments',
        label: t('student.srf.stats.installments'),
        value: `${summary.paidInstallments}/${summary.totalInstallments}`,
        icon: TrendingUp,
        iconBgClass: 'bg-[#8b5cf6]',
      },
    ],
    [summary, t],
  );

  if (loading) {
    return (
      <div id="student-srf-stats" className="min-w-0">
        <AdminKpiStripSkeleton count={4} />
      </div>
    );
  }

  return (
    <div id="student-srf-stats" className="min-w-0">
      <PlatformKpiStrip items={items} columns={4} ariaLabel={t('student.srf.stats.aria')} />
    </div>
  );
};

export default SrfStatsGrid;
