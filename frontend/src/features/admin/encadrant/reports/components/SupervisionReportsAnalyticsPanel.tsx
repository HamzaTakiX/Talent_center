import { FunctionComponent, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { BadgeCheck, GraduationCap, ShieldAlert, ShieldCheck, type LucideIcon } from 'lucide-react';
import AdminDonutChart from '../../../ui/charts/AdminDonutChart';
import { AdminChartDonutSkeleton } from '../../../ui';
import { staggerContainer, staggerItem } from '../../../dashboard/ui/animations';

const ANALYTICS_PREFIX = 'admin.modules.reports.analytics';

const RISK_TONES: Record<string, string> = {
  CRITICAL: '#ef4444',
  HIGH: '#f97316',
  MEDIUM: '#eab308',
  LOW: '#3b82f6',
};

const TONE_VALIDATION = { accent: '#10b981', soft: 'rgba(16, 185, 129, 0.14)' };
const TONE_SUCCESS = { accent: '#3b82f6', soft: 'rgba(59, 130, 246, 0.14)' };
const TONE_RISK = { accent: '#f59e0b', soft: 'rgba(245, 158, 11, 0.14)' };

const CARD_SHELL =
  'relative overflow-hidden rounded-[var(--admin-radius-lg)] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-5 shadow-[var(--admin-shadow-sm)] transition-shadow duration-300 hover:shadow-[var(--admin-shadow-md)]';

function toPercent(raw: unknown): number {
  const value = Number(raw ?? 0);
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, value * 100));
}

interface RateCardProps {
  label: string;
  percent: number;
  icon: LucideIcon;
  tone: { accent: string; soft: string };
  index: number;
}

const RateCard: FunctionComponent<RateCardProps> = ({ label, percent, icon: Icon, tone, index }) => (
  <motion.div variants={staggerItem} className={CARD_SHELL}>
    <span
      className="absolute inset-y-4 start-0 w-[3px] rounded-e-full"
      style={{ background: tone.accent }}
      aria-hidden
    />
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-[var(--admin-text-muted)]">
          {label}
        </p>
        <p className="mt-1.5 text-3xl font-bold leading-none tabular-nums text-[var(--admin-text)]">
          {percent.toFixed(1)}
          <span className="ms-0.5 text-lg font-semibold text-[var(--admin-text-secondary)]">%</span>
        </p>
      </div>
      <span
        className="grid h-10 w-10 shrink-0 place-items-center rounded-[var(--admin-radius-sm)]"
        style={{ background: tone.soft, color: tone.accent }}
        aria-hidden
      >
        <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
      </span>
    </div>
    <div
      className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-[var(--admin-surface-inset)]"
      role="presentation"
    >
      <motion.span
        className="block h-full rounded-full"
        style={{ background: tone.accent }}
        initial={{ width: 0 }}
        animate={{ width: `${percent}%` }}
        transition={{ duration: 0.6, delay: 0.15 + index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  </motion.div>
);

interface SupervisionReportsAnalyticsPanelProps {
  analytics?: Record<string, unknown> | null;
  loading?: boolean;
}

const AnalyticsCardSkeleton: FunctionComponent<{ donut?: boolean }> = ({ donut = false }) => (
  <div className={CARD_SHELL} aria-hidden>
    <span className="absolute inset-y-4 start-0 w-[3px] rounded-e-full bg-[var(--admin-border)]" />
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1 space-y-3">
        <span className="admin-shimmer block h-3 w-28 rounded-md" />
        {donut ? null : <span className="admin-shimmer block h-8 w-16 rounded-md" />}
      </div>
      <span className="admin-shimmer h-10 w-10 shrink-0 rounded-[var(--admin-radius-sm)]" />
    </div>
    {donut ? (
      <div className="mt-3">
        <AdminChartDonutSkeleton legendItems={4} />
      </div>
    ) : (
      <span className="admin-shimmer mt-4 block h-1.5 w-full rounded-full" />
    )}
  </div>
);

const SupervisionReportsAnalyticsPanel: FunctionComponent<SupervisionReportsAnalyticsPanelProps> = ({
  analytics,
  loading = false,
}) => {
  const { t } = useTranslation();
  const showSkeleton = loading;
  const validationPercent = toPercent(analytics?.validation_rate);
  const successPercent = toPercent(analytics?.internship_success_rate);
  const riskDist = (analytics?.risk_distribution ?? {}) as Record<string, number>;

  const riskChart = useMemo(
    () =>
      Object.entries(riskDist)
        .map(([level, value]) => ({
          key: level,
          label: t(`${ANALYTICS_PREFIX}.riskLevel.${level}`, { defaultValue: level }),
          value: Number(value) || 0,
          color: RISK_TONES[level] ?? TONE_SUCCESS.accent,
        }))
        .filter((segment) => segment.value > 0),
    [riskDist, t],
  );

  const riskLabel = t(`${ANALYTICS_PREFIX}.riskDist`);

  if (showSkeleton) {
    return (
      <div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        role="status"
        aria-busy="true"
        aria-label={t('admin.common.loading')}
      >
        <span className="sr-only">{t('admin.common.loading')}</span>
        <AnalyticsCardSkeleton />
        <AnalyticsCardSkeleton />
        <AnalyticsCardSkeleton donut />
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <motion.div
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      <RateCard
        label={t(`${ANALYTICS_PREFIX}.validationRate`)}
        percent={validationPercent}
        icon={BadgeCheck}
        tone={TONE_VALIDATION}
        index={0}
      />
      <RateCard
        label={t(`${ANALYTICS_PREFIX}.successRate`)}
        percent={successPercent}
        icon={GraduationCap}
        tone={TONE_SUCCESS}
        index={1}
      />

      <motion.div variants={staggerItem} className={CARD_SHELL}>
        <span
          className="absolute inset-y-4 start-0 w-[3px] rounded-e-full"
          style={{ background: TONE_RISK.accent }}
          aria-hidden
        />
        <div className="flex items-start justify-between gap-3">
          <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-[var(--admin-text-muted)]">
            {riskLabel}
          </p>
          <span
            className="grid h-10 w-10 shrink-0 place-items-center rounded-[var(--admin-radius-sm)]"
            style={{ background: TONE_RISK.soft, color: TONE_RISK.accent }}
            aria-hidden
          >
            <ShieldAlert className="h-[18px] w-[18px]" strokeWidth={2} />
          </span>
        </div>

        {riskChart.length > 0 ? (
          <div className="mt-3">
            <AdminDonutChart
              segments={riskChart}
              ariaLabel={riskLabel}
              centerCaption={t(`${ANALYTICS_PREFIX}.totalCaption`)}
            />
          </div>
        ) : (
          <div className="mt-4 flex flex-col items-center gap-2 py-6 text-center">
            <span
              className="grid h-11 w-11 place-items-center rounded-full"
              style={{ background: TONE_RISK.soft, color: TONE_RISK.accent }}
            >
              <ShieldCheck className="h-5 w-5" strokeWidth={2} aria-hidden />
            </span>
            <p className="text-sm font-medium text-[var(--admin-text)]">
              {t(`${ANALYTICS_PREFIX}.riskEmptyTitle`)}
            </p>
            <p className="max-w-[26ch] text-xs leading-relaxed text-[var(--admin-text-secondary)]">
              {t(`${ANALYTICS_PREFIX}.riskEmptyDesc`)}
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default SupervisionReportsAnalyticsPanel;
