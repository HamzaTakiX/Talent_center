import { type CSSProperties, FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { AlertTriangle, Ban, Calendar, Mail, ShieldAlert, Users } from 'lucide-react';
import type { SrfConfigAnalytics } from '../../../api/srfConfig';
import { staggerContainer, staggerItem } from '../../../dashboard/ui/animations';

const PREFIX = 'admin.modules.srf.configCenter.analytics';

interface AccentConfig {
  accent: string;
  bg: string;
}

const ACCENTS: AccentConfig[] = [
  { accent: 'var(--admin-brand)', bg: 'var(--admin-brand-muted)' },
  { accent: '#f59e0b', bg: 'rgba(245,158,11,.12)' },
  { accent: '#10b981', bg: 'rgba(16,185,129,.12)' },
  { accent: '#06b6d4', bg: 'rgba(6,182,212,.12)' },
  { accent: '#ef4444', bg: 'rgba(239,68,68,.12)' },
  { accent: '#f97316', bg: 'rgba(249,115,22,.12)' },
];

interface Props {
  analytics: SrfConfigAnalytics;
}

const ConfigAnalyticsStrip: FunctionComponent<Props> = ({ analytics }) => {
  const { t } = useTranslation();

  const cards = [
    { key: 'approaching', value: analytics.students_approaching_restriction, icon: Users },
    { key: 'risks', value: analytics.pending_financial_risks, icon: ShieldAlert },
    { key: 'exams', value: analytics.upcoming_exam_periods, icon: Calendar },
    { key: 'campaigns', value: analytics.active_warning_campaigns, icon: Mail },
    { key: 'blocked', value: analytics.blocked_students_count, icon: Ban },
    { key: 'atRisk', value: analytics.at_risk_students_count, icon: AlertTriangle },
  ] as const;

  return (
    <motion.section
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="overflow-hidden rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] shadow-sm"
      aria-label={t(`${PREFIX}.sectionLabel`, { defaultValue: 'Financial module analytics' })}
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 2xl:grid-cols-6">
        {cards.map(({ key, value, icon: Icon }, idx) => {
          const { accent, bg } = ACCENTS[idx];
          return (
            <motion.div
              key={key}
              variants={staggerItem}
              custom={idx}
              className="group relative flex items-center gap-3 overflow-hidden border-b border-r border-[var(--admin-border)] p-4 transition-colors duration-200 last:border-r-0"
              style={{ '--cell-bg': bg } as CSSProperties}
            >
              {/* Left accent bar */}
              <span
                className="pointer-events-none absolute inset-y-2 start-0 w-[3px] rounded-e-full opacity-75 transition-opacity duration-200 group-hover:opacity-100"
                style={{ background: accent }}
                aria-hidden
              />

              {/* Hover tint overlay */}
              <span
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                style={{ background: bg, opacity: 0 }}
                aria-hidden
              />

              {/* Icon */}
              <span
                className="relative ms-1.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105"
                style={{ background: bg, color: accent }}
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
              </span>

              {/* Content */}
              <div className="relative min-w-0">
                <p className="text-xl font-bold tabular-nums leading-tight text-[var(--admin-text)] sm:text-2xl">
                  {value}
                </p>
                <p className="truncate text-xs text-[var(--admin-text-secondary)]">{t(`${PREFIX}.${key}`)}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
};

export default ConfigAnalyticsStrip;
