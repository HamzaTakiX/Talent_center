import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { ClipboardList, Clock } from 'lucide-react';
import type { SrfConfigAuditEntry } from '../../../api/srfConfig';
import { SrfConfigSectionShell } from '../ui/SrfConfigPrimitives';
import SrfPremiumEmpty from '../../components/student-detail/SrfPremiumEmpty';

const PREFIX = 'admin.modules.srf.configCenter.audit';

interface Props {
  entries: SrfConfigAuditEntry[];
}

const ConfigAuditSection: FunctionComponent<Props> = ({ entries }) => {
  const { t } = useTranslation();

  return (
    <SrfConfigSectionShell
      icon={ClipboardList}
      title={t(`${PREFIX}.title`)}
      subtitle={t(`${PREFIX}.subtitle`)}
    >
      {entries.length === 0 ? (
        <SrfPremiumEmpty
          icon={Clock}
          title={t(`${PREFIX}.emptyTitle`)}
          description={t(`${PREFIX}.empty`)}
        />
      ) : (
        <ol className="relative max-h-80 space-y-0 overflow-y-auto border-s-2 border-[var(--admin-brand)]/20 ps-6 ms-2">
          {entries.map((entry) => (
            <li key={entry.uuid} className="relative pb-5 last:pb-0">
              <span className="absolute -start-[1.65rem] top-1.5 h-3 w-3 rounded-full border-2 border-[var(--admin-brand)] bg-[var(--admin-bg-elevated)]" />
              <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg-subtle)] px-4 py-3 text-sm transition-colors hover:border-[var(--admin-brand)]/30">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold text-[var(--admin-text)]">
                    {entry.action} · {entry.entity_type}
                  </span>
                  <span className="text-[10px] uppercase tracking-wide text-[var(--admin-text-muted)]">
                    {new Date(entry.created_at).toLocaleString()}
                  </span>
                </div>
                {entry.message ? (
                  <p className="mt-1 text-[var(--admin-text-secondary)]">{entry.message}</p>
                ) : null}
                <p className="mt-1 text-xs text-[var(--admin-text-muted)]">{entry.actor_email}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </SrfConfigSectionShell>
  );
};

export default ConfigAuditSection;
