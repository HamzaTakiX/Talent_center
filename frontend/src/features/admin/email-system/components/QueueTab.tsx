import { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AdminButton from '../../ui/AdminButton';
import { AdminTableEmptyState } from '../../ui';
import { adminTableBtn, adminTableBtnDanger, adminTableBtnSuccess } from '../../ui/adminTableButtons';
import type { QueueItem } from '../types/emailSystemTypes';
import {
  EmailSystemStatusBadge,
  EmailSystemTablePanel,
  emailSystemTableTdClass,
  emailSystemTableThClass,
} from '../ui/EmailSystemPrimitives';

const PREFIX = 'admin.modules.emailSystem.queue';

const FILTERS = ['', 'PENDING', 'PROCESSING', 'SENT', 'FAILED'] as const;

interface Props {
  load: (status?: string) => Promise<{ items: QueueItem[]; stats: Record<string, number> }>;
  onRetry: (id: number) => Promise<void>;
  onCancel: (id: number) => Promise<void>;
}

const queueTone = (status: string): 'success' | 'warning' | 'danger' | 'neutral' | 'info' => {
  if (status === 'SENT' || status === 'DELIVERED') return 'success';
  if (status === 'FAILED') return 'danger';
  if (status === 'PROCESSING') return 'info';
  if (status === 'PENDING' || status === 'QUEUED' || status === 'RETRY_SCHEDULED') return 'warning';
  return 'neutral';
};

const QueueTab: FunctionComponent<Props> = ({ load, onRetry, onCancel }) => {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<string>('');
  const [items, setItems] = useState<QueueItem[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});

  const refresh = useCallback(() => {
    void load(filter || undefined).then((res) => {
      setItems(res.items);
      setStats(res.stats);
    });
  }, [filter, load]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const toolbar = (
    <>
      {FILTERS.map((f) => (
        <AdminButton
          key={f || 'all'}
          variant={filter === f ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilter(f)}
        >
          {f ? t(`${PREFIX}.filters.${f.toLowerCase()}`) : t(`${PREFIX}.filters.all`)}
        </AdminButton>
      ))}
      <span className="ms-auto flex flex-wrap gap-3 text-xs text-[var(--admin-text-secondary)]">
        <span>{t(`${PREFIX}.stats.pending`)}: {stats.pending ?? 0}</span>
        <span>{t(`${PREFIX}.stats.processing`)}: {stats.processing ?? 0}</span>
        <span>{t(`${PREFIX}.stats.failed`)}: {stats.failed ?? 0}</span>
      </span>
    </>
  );

  return (
    <EmailSystemTablePanel
      title={t(`${PREFIX}.title`, { defaultValue: 'Email queue' })}
      subtitle={t(`${PREFIX}.subtitle`, { defaultValue: 'Monitor pending and failed deliveries.' })}
      toolbar={toolbar}
      minWidth="1000px"
    >
      <table className="admin-table admin-table--safe w-full">
        <thead>
          <tr>
            <th className={emailSystemTableThClass}>{t(`${PREFIX}.recipient`)}</th>
            <th className={emailSystemTableThClass}>{t(`${PREFIX}.template`)}</th>
            <th className={emailSystemTableThClass}>{t(`${PREFIX}.status`)}</th>
            <th className={emailSystemTableThClass}>{t(`${PREFIX}.attempts`)}</th>
            <th className={emailSystemTableThClass}>{t(`${PREFIX}.created`)}</th>
            <th className={`${emailSystemTableThClass} text-center`}>{t(`${PREFIX}.actions`)}</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <AdminTableEmptyState colSpan={6} title={t(`${PREFIX}.empty`)} />
          ) : (
            items.map((row) => (
              <tr key={row.id}>
                <td className={emailSystemTableTdClass}>{row.user_email}</td>
                <td className={`${emailSystemTableTdClass} font-mono text-xs`}>
                  {row.template_code || row.event_code}
                </td>
                <td className={emailSystemTableTdClass}>
                  <EmailSystemStatusBadge tone={queueTone(row.status)}>{row.status}</EmailSystemStatusBadge>
                </td>
                <td className={`${emailSystemTableTdClass} tabular-nums`}>{row.attempts}</td>
                <td className={`${emailSystemTableTdClass} text-[var(--admin-text-secondary)]`}>
                  {new Date(row.created_at).toLocaleString()}
                </td>
                <td className={emailSystemTableTdClass}>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {row.status === 'FAILED' ? (
                      <button
                        type="button"
                        className={`${adminTableBtn} ${adminTableBtnSuccess}`}
                        onClick={() => void onRetry(row.id).then(refresh)}
                      >
                        {t(`${PREFIX}.retry`)}
                      </button>
                    ) : null}
                    {['PENDING', 'QUEUED', 'RETRY_SCHEDULED'].includes(row.status) ? (
                      <button
                        type="button"
                        className={`${adminTableBtn} ${adminTableBtnDanger}`}
                        onClick={() => void onCancel(row.id).then(refresh)}
                      >
                        {t(`${PREFIX}.cancel`)}
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </EmailSystemTablePanel>
  );
};

export default QueueTab;
