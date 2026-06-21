import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Bot, ArrowRight } from 'lucide-react';
import type { HistoryActionRow } from '../types';
import { criticalityBadgeClass } from '../constants/criticalityStyles';
import HistorySummaryText from './HistorySummaryText';

const PREFIX = 'admin.auditCenter';

interface HistoryEventDetailDrawerProps {
  row: HistoryActionRow | null;
  open: boolean;
  onClose: () => void;
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'object') return JSON.stringify(value, null, 2);
  return String(value);
}

const HistoryEventDetailDrawer: FunctionComponent<HistoryEventDetailDrawerProps> = ({
  row,
  open,
  onClose,
}) => {
  const { t } = useTranslation();
  if (!open || !row) return null;

  const oldEntries = Object.entries(row.oldValues ?? {});
  const newEntries = Object.entries(row.newValues ?? {});
  const crit = row.criticality ?? 'INFO';

  return (
    <div className="fixed inset-0 z-[80] flex justify-end" role="dialog" aria-modal="true">
      <button type="button" className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} aria-label={t(`${PREFIX}.drawer.close`)} />
      <aside className="relative flex h-full w-full max-w-md flex-col border-s border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] shadow-2xl animate-in slide-in-from-right duration-200">
        <header className="flex items-start justify-between gap-3 border-b border-[var(--admin-border)] px-5 py-4">
          <div className="min-w-0 space-y-2">
            <span className={`inline-flex items-center gap-1 ${criticalityBadgeClass(crit)}`}>
              {row.isAutomated ? <Bot className="h-3.5 w-3.5" aria-hidden /> : null}
              {t(`${PREFIX}.criticality.${crit}`)}
            </span>
            <h2 className="text-base font-semibold leading-snug text-[var(--admin-text)]">
              <HistorySummaryText text={row.title} />
            </h2>
            <p className="text-xs text-[var(--admin-text-secondary)]">
              {row.actor} · {row.timestamp}
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-[var(--admin-row-hover)]">
            <X className="h-5 w-5" aria-hidden />
          </button>
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--admin-text-secondary)]">
              {t(`${PREFIX}.drawer.context`)}
            </h3>
            <dl className="mt-2 space-y-1 text-sm">
              <div className="flex justify-between gap-2">
                <dt className="text-[var(--admin-text-secondary)]">{t(`${PREFIX}.drawer.module`)}</dt>
                <dd className="font-medium text-[var(--admin-text)]">{row.sourceApp ?? row.module}</dd>
              </div>
              {row.entityType ? (
                <div className="flex justify-between gap-2">
                  <dt className="text-[var(--admin-text-secondary)]">{t(`${PREFIX}.drawer.entity`)}</dt>
                  <dd className="font-mono text-xs text-[var(--admin-text)]">
                    {row.entityType}#{row.entityId ?? '—'}
                  </dd>
                </div>
              ) : null}
            </dl>
          </section>

          {(oldEntries.length > 0 || newEntries.length > 0) && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--admin-text-secondary)]">
                {t(`${PREFIX}.drawer.changes`)}
              </h3>
              <ul className="mt-2 space-y-2">
                {Array.from(new Set([...oldEntries.map(([k]) => k), ...newEntries.map(([k]) => k)])).map((key) => {
                  const oldV = row.oldValues?.[key];
                  const newV = row.newValues?.[key];
                  return (
                    <li key={key} className="admin-mobile-card rounded-lg p-3 text-sm">
                      <p className="mb-1 font-medium text-[var(--admin-text)]">{key}</p>
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="rounded bg-[#fee2e2] px-2 py-0.5 text-[#b4232d] line-through">
                          {formatValue(oldV)}
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[var(--admin-text-secondary)]" aria-hidden />
                        <span className="rounded bg-[#e7f6ec] px-2 py-0.5 text-[#0f7b3a]">{formatValue(newV)}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </div>
      </aside>
    </div>
  );
};

export default HistoryEventDetailDrawer;
