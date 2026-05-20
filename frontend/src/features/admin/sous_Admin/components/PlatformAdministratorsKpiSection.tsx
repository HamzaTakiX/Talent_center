import { FunctionComponent, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, FileText, MessageSquare, Shield, Wallet } from 'lucide-react';
import type { AdminAdministratorRow } from '../../api/types';
import StudentDashboardStatCard from '../../student/components/StudentDashboardStatCard';
import { PLATFORM_ADMIN_KPI_STAT_TO_PATH } from '../constants/platformAdministratorsNavigation';
import type { PlatformAdminKpiStatKey, PlatformAdministratorsKpiStat } from '../types/platformAdministrators';
import AdminKpiGrid from '../../ui/AdminKpiGrid';

interface PlatformAdministratorsKpiSectionProps {
  rows: AdminAdministratorRow[];
  loading?: boolean;
}

const PlatformAdministratorsKpiSection: FunctionComponent<PlatformAdministratorsKpiSectionProps> = ({
  rows,
  loading = false,
}) => {
  const navigate = useNavigate();

  const stats = useMemo((): PlatformAdministratorsKpiStat[] => {
    const countByRole = (slug: string) =>
      rows.filter((r) => r.role_slugs.includes(slug as never)).length;
    return [
      {
        label: 'Total Admins',
        labelKey: 'administrators.totalAdmins',
        statKey: 'total',
        value: loading ? 0 : rows.length,
        Icon: Shield,
        iconBgClass: 'bg-[#a855f7]',
      },
      {
        label: 'Admin Stage',
        labelKey: 'administrators.stage',
        statKey: 'stage',
        value: loading ? 0 : countByRole('stage'),
        Icon: Briefcase,
        iconBgClass: 'bg-[#3b82f6]',
      },
      {
        label: 'Admin Finance',
        labelKey: 'administrators.finance',
        statKey: 'finance',
        value: loading ? 0 : countByRole('finance'),
        Icon: Wallet,
        iconBgClass: 'bg-[#22c55e]',
      },
      {
        label: 'Admin Documents',
        labelKey: 'administrators.documents',
        statKey: 'documents',
        value: loading ? 0 : countByRole('documents'),
        Icon: FileText,
        iconBgClass: 'bg-[#f97316]',
      },
      {
        label: 'Admin Communication',
        labelKey: 'administrators.communication',
        statKey: 'communication',
        value: loading ? 0 : countByRole('communication'),
        Icon: MessageSquare,
        iconBgClass: 'bg-[#6366f1]',
      },
    ];
  }, [rows, loading]);

  return (
    <AdminKpiGrid columns={5}>
      {stats.map((stat, index) => (
        <StudentDashboardStatCard
          key={stat.statKey}
          label={stat.label}
          labelKey={stat.labelKey}
          value={stat.value}
          IconComponent={stat.Icon}
          iconBgClass={stat.iconBgClass}
          index={index}
          onClick={
            stat.statKey === 'total'
              ? undefined
              : () =>
                  navigate(
                    PLATFORM_ADMIN_KPI_STAT_TO_PATH[
                      stat.statKey as Exclude<PlatformAdminKpiStatKey, 'total'>
                    ],
                  )
          }
        />
      ))}
    </AdminKpiGrid>
  );
};

export default PlatformAdministratorsKpiSection;
