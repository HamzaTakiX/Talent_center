import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import type { SupervisionReportTimelineEvent } from '../types/supervisionReport';

interface SupervisionReportWorkflowTimelineProps {
  events: SupervisionReportTimelineEvent[];
}

const SupervisionReportWorkflowTimeline: FunctionComponent<SupervisionReportWorkflowTimelineProps> = ({
  events,
}) => {
  const { t } = useTranslation();

  if (!events.length) return null;

  return (
    <section className="admin-card p-4">
      <h3 className="mb-4 font-semibold">
        {t('admin.modules.reports.detail.timeline', { defaultValue: 'Historique' })}
      </h3>
      <ol className="relative border-s border-[var(--admin-border)] ps-4">
        {events.map((e) => (
          <li key={e.id} className="mb-4 ms-2">
            <span className="absolute -start-1.5 mt-1.5 h-3 w-3 rounded-full border border-white bg-[var(--admin-brand)]" />
            <p className="text-sm font-medium text-[var(--admin-text)]">{e.action}</p>
            <p className="text-xs text-[var(--admin-text-muted)]">
              {e.fromStatus && e.toStatus ? `${e.fromStatus} → ${e.toStatus}` : null}
              {e.actor ? ` · ${e.actor}` : ''}
              {' · '}
              {new Date(e.createdAt).toLocaleString()}
            </p>
            {e.note ? <p className="mt-1 text-sm text-[var(--admin-text-secondary)]">{e.note}</p> : null}
          </li>
        ))}
      </ol>
    </section>
  );
};

export default SupervisionReportWorkflowTimeline;
