import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  TrendingUp,
  Users,
  type LucideIcon,
} from 'lucide-react';
import AdminKpiGrid from '../../ui/AdminKpiGrid';
import AdminKpiStatCard from '../../ui/AdminKpiStatCard';
import type { SrfDashboardMetrics } from '../hooks/useSrfDashboardMetrics';

const PREFIX = 'admin.modules.srf.dashboard.kpi';

const mad = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M MAD`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K MAD`;
  return `${Math.round(n).toLocaleString()} MAD`;
};

type MetricField = keyof SrfDashboardMetrics;

interface KpiConfig {
  key: string;
  icon: LucideIcon;
  field: MetricField;
  accent: string;
  accentBg: string;
  format?: (value: number) => string;
  suffix?: string;
}

const KPI_CONFIG: KpiConfig[] = [
  {
    key: 'students',
    icon: Users,
    field: 'students',
    accent: 'var(--admin-brand)',
    accentBg: 'var(--admin-brand-muted)',
  },
  {
    key: 'pendingPayments',
    icon: Clock,
    field: 'pendingPayments',
    accent: '#eab308',
    accentBg: 'rgba(234, 179, 8, 0.12)',
  },
  {
    key: 'paid',
    icon: CheckCircle2,
    field: 'paid',
    accent: '#22c55e',
    accentBg: 'rgba(34, 197, 94, 0.12)',
  },
  {
    key: 'overdue',
    icon: AlertTriangle,
    field: 'overdue',
    accent: '#ef4444',
    accentBg: 'rgba(239, 68, 68, 0.12)',
  },
  {
    key: 'outstandingAmount',
    icon: DollarSign,
    field: 'outstandingAmount',
    accent: '#6366f1',
    accentBg: 'rgba(99, 102, 241, 0.12)',
    format: mad,
  },
  {
    key: 'averagePaymentRate',
    icon: TrendingUp,
    field: 'averagePaymentRate',
    accent: '#06b6d4',
    accentBg: 'rgba(6, 182, 212, 0.12)',
    suffix: '%',
  },
];

interface SrfDashboardKpiStripProps {
  metrics: SrfDashboardMetrics;
  loading?: boolean;
}

const SrfDashboardKpiStrip: FunctionComponent<SrfDashboardKpiStripProps> = ({
  metrics,
  loading = false,
}) => {
  const { t } = useTranslation();

  return (
    <AdminKpiGrid columns={3}>
      {KPI_CONFIG.map(({ key, icon, field, format, suffix, accent, accentBg }, index) => {
        const raw = metrics[field];
        const value = format ? format(raw) : `${raw.toLocaleString()}${suffix ?? ''}`;
        return (
          <AdminKpiStatCard
            key={key}
            index={index}
            icon={icon}
            label={t(`${PREFIX}.${key}`)}
            value={value}
            accent={accent}
            accentBg={accentBg}
            valueLoading={loading}
          />
        );
      })}
    </AdminKpiGrid>
  );
};

export default SrfDashboardKpiStrip;
