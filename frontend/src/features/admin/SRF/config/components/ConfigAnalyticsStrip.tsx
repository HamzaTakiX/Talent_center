import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Ban, Calendar, Mail, ShieldAlert, Users } from 'lucide-react';
import type { SrfConfigAnalytics } from '../../../api/srfConfig';

const PREFIX = 'admin.modules.srf.configCenter.analytics';

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
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      {cards.map(({ key, value, icon: Icon }) => (
        <div
          key={key}
          className="group relative overflow-hidden rounded-xl border border-[color-mix(in_srgb,var(--admin-brand)_18%,var(--admin-border))] bg-gradient-to-br from-[var(--admin-bg-elevated)] to-[color-mix(in_srgb,var(--admin-brand)_6%,var(--admin-bg-elevated))] p-4 shadow-sm transition-all duration-300 hover:border-[var(--admin-brand)]/35 hover:shadow-[var(--admin-shadow-glow)]"
        >
          <span
            className="pointer-events-none absolute -end-4 -top-4 h-16 w-16 rounded-full bg-[var(--admin-brand)]/10 blur-2xl transition-opacity group-hover:opacity-100"
            aria-hidden
          />
          <div className="relative flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--admin-brand-muted)] ring-1 ring-[var(--admin-brand)]/15">
              <Icon className="h-5 w-5 text-[var(--admin-brand)]" strokeWidth={1.75} />
            </span>
            <div className="min-w-0">
              <p className="text-2xl font-bold tabular-nums text-[var(--admin-text)]">{value}</p>
              <p className="text-xs leading-snug text-[var(--admin-text-secondary)]">{t(`${PREFIX}.${key}`)}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ConfigAnalyticsStrip;
