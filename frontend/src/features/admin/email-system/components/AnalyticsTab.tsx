import { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart3 } from 'lucide-react';
import AdminButton from '../../ui/AdminButton';
import type { AnalyticsOverview } from '../types/emailSystemTypes';
import {
  EmailSystemMetricCard,
  EmailSystemSectionShell,
  EmailSystemTablePanel,
  emailSystemTableTdClass,
  emailSystemTableThClass,
} from '../ui/EmailSystemPrimitives';

const PREFIX = 'admin.modules.emailSystem.analytics';

const PERIODS = [
  { days: 1, key: 'today' },
  { days: 7, key: '7d' },
  { days: 30, key: '30d' },
  { days: 90, key: '90d' },
] as const;

interface Props {
  load: (days: number) => Promise<AnalyticsOverview>;
}

const AnalyticsTab: FunctionComponent<Props> = ({ load }) => {
  const { t } = useTranslation();
  const [days, setDays] = useState(30);
  const [data, setData] = useState<AnalyticsOverview | null>(null);

  const refresh = useCallback(() => {
    void load(days).then(setData);
  }, [days, load]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <div className="email-system-tab-stack">
      <EmailSystemSectionShell
        icon={BarChart3}
        title={t(`${PREFIX}.title`, { defaultValue: 'Email analytics' })}
        subtitle={t(`${PREFIX}.subtitle`, { defaultValue: 'Delivery performance across the platform.' })}
        action={
          <div className="flex flex-wrap gap-2">
            {PERIODS.map((p) => (
              <AdminButton
                key={p.key}
                variant={days === p.days ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setDays(p.days)}
              >
                {t(`${PREFIX}.period.${p.key}`)}
              </AdminButton>
            ))}
          </div>
        }
      >
        {data ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <EmailSystemMetricCard label={t(`${PREFIX}.sent`)} value={data.sent} />
            <EmailSystemMetricCard label={t(`${PREFIX}.delivered`)} value={data.delivered} />
            <EmailSystemMetricCard label={t(`${PREFIX}.opened`)} value={data.opened} />
            <EmailSystemMetricCard label={t(`${PREFIX}.clicked`)} value={data.clicked} />
            <EmailSystemMetricCard label={t(`${PREFIX}.failed`)} value={data.failed} />
            <EmailSystemMetricCard label={t(`${PREFIX}.queued`)} value={data.queued} />
          </div>
        ) : null}
      </EmailSystemSectionShell>

      {data && (data.templates ?? []).length > 0 ? (
        <EmailSystemTablePanel
          title={t(`${PREFIX}.topTemplates`)}
          minWidth="480px"
        >
          <table className="admin-table admin-table--safe w-full">
            <thead>
              <tr>
                <th className={emailSystemTableThClass}>{t(`${PREFIX}.template`)}</th>
                <th className={`${emailSystemTableThClass} text-right`}>{t(`${PREFIX}.count`)}</th>
              </tr>
            </thead>
            <tbody>
              {data.templates.map((row) => (
                <tr key={row.template_code}>
                  <td className={`${emailSystemTableTdClass} font-mono text-xs`}>{row.template_code}</td>
                  <td className={`${emailSystemTableTdClass} text-right tabular-nums`}>{row.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </EmailSystemTablePanel>
      ) : null}
    </div>
  );
};

export default AnalyticsTab;
