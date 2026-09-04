import { CSSProperties, FunctionComponent, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  TrendingUp,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { easePremium } from '../../dashboard/ui/animations';
import { AdminStudentsStatsSkeleton } from '../../ui/AdminSectionSkeleton';
import type { SrfDashboardMetrics } from '../hooks/useSrfDashboardMetrics';

const PREFIX = 'admin.modules.srf.dashboard.kpi';

const mad = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M MAD`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K MAD`;
  return `${Math.round(n).toLocaleString()} MAD`;
};

const clampPercent = (value: number) => Math.min(100, Math.max(0, Math.round(value)));

interface SrfKpiCard {
  key: string;
  Icon: LucideIcon;
  value: string;
  badge: string;
  accent: string;
  accentBg: string;
  piePercent?: number;
}

interface SrfDashboardKpiStripProps {
  metrics: SrfDashboardMetrics;
  loading?: boolean;
}

const SrfDashboardKpiStrip: FunctionComponent<SrfDashboardKpiStripProps> = ({
  metrics,
  loading = false,
}) => {
  const { t } = useTranslation();

  const cards = useMemo<SrfKpiCard[]>(() => {
    const total = Math.max(metrics.students, 0);
    const ratioOfTotal = (value: number) => (total > 0 ? Math.round((value / total) * 100) : 0);
    const paymentRate = clampPercent(metrics.averagePaymentRate);

    return [
      {
        key: 'students',
        Icon: Users,
        value: metrics.students.toLocaleString(),
        badge: t(`${PREFIX}.badges.allAccounts`, { defaultValue: 'Tous les comptes' }),
        accent: '#3b82f6',
        accentBg: 'rgba(59, 130, 246, 0.16)',
      },
      {
        key: 'pendingPayments',
        Icon: Clock,
        value: metrics.pendingPayments.toLocaleString(),
        badge: t(`${PREFIX}.badges.percentOfTotal`, {
          percent: ratioOfTotal(metrics.pendingPayments),
          defaultValue: `${ratioOfTotal(metrics.pendingPayments)}% du total`,
        }),
        accent: '#eab308',
        accentBg: 'rgba(234, 179, 8, 0.16)',
        piePercent: ratioOfTotal(metrics.pendingPayments),
      },
      {
        key: 'paid',
        Icon: CheckCircle2,
        value: metrics.paid.toLocaleString(),
        badge: t(`${PREFIX}.badges.percentOfTotal`, {
          percent: ratioOfTotal(metrics.paid),
          defaultValue: `${ratioOfTotal(metrics.paid)}% du total`,
        }),
        accent: '#22c55e',
        accentBg: 'rgba(34, 197, 94, 0.16)',
        piePercent: ratioOfTotal(metrics.paid),
      },
      {
        key: 'overdue',
        Icon: AlertTriangle,
        value: metrics.overdue.toLocaleString(),
        badge: t(`${PREFIX}.badges.percentOfTotal`, {
          percent: ratioOfTotal(metrics.overdue),
          defaultValue: `${ratioOfTotal(metrics.overdue)}% du total`,
        }),
        accent: '#ef4444',
        accentBg: 'rgba(239, 68, 68, 0.16)',
        piePercent: ratioOfTotal(metrics.overdue),
      },
      {
        key: 'outstandingAmount',
        Icon: DollarSign,
        value: mad(metrics.outstandingAmount),
        badge: t(`${PREFIX}.badges.outstanding`, { defaultValue: 'Reste à encaisser' }),
        accent: '#6366f1',
        accentBg: 'rgba(99, 102, 241, 0.16)',
      },
      {
        key: 'averagePaymentRate',
        Icon: TrendingUp,
        value: `${paymentRate}%`,
        badge: t(`${PREFIX}.badges.avgRate`, { defaultValue: 'Niveau moyen' }),
        accent: '#06b6d4',
        accentBg: 'rgba(6, 182, 212, 0.16)',
        piePercent: paymentRate,
      },
    ];
  }, [metrics, t]);

  const isInitialLoad =
    loading &&
    metrics.students === 0 &&
    metrics.pendingPayments === 0 &&
    metrics.paid === 0 &&
    metrics.overdue === 0 &&
    metrics.outstandingAmount === 0 &&
    metrics.averagePaymentRate === 0;

  if (isInitialLoad) {
    return <AdminStudentsStatsSkeleton count={6} withPiePattern="all-but-first" />;
  }

  return (
    <div className="admin-students-stats-grid">
      {cards.map((card, index) => {
        const title = t(`${PREFIX}.${card.key}`);

        return (
          <motion.article
            key={card.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.4, ease: easePremium }}
            whileHover={{ scale: 1.02, y: -2 }}
            className={`admin-students-stat-card${card.piePercent != null ? ' admin-students-stat-card--rate' : ''}`}
            style={
              {
                '--student-stat-accent': card.accent,
                '--student-stat-accent-bg': card.accentBg,
              } as CSSProperties
            }
          >
            <div className="admin-students-stat-card__body">
              <div className="admin-students-stat-card__head">
                <span className="admin-students-stat-card__icon" aria-hidden>
                  <card.Icon className="h-5 w-5" strokeWidth={1.8} />
                </span>
                <p className="admin-students-stat-card__title">{title}</p>
              </div>
              <p className="admin-students-stat-card__value">{card.value}</p>
              <span className="admin-students-stat-card__badge">{card.badge}</span>
            </div>
            {card.piePercent != null ? (
              <div
                className="admin-students-stat-card__pie"
                style={{ '--student-stat-pie': card.piePercent } as CSSProperties}
                role="img"
                aria-label={`${title} ${card.piePercent}%`}
              >
                <span className="admin-students-stat-card__pie-inner">{card.piePercent}%</span>
              </div>
            ) : null}
          </motion.article>
        );
      })}
    </div>
  );
};

export default SrfDashboardKpiStrip;
