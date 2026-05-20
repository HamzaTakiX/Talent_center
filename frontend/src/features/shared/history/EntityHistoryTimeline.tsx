import { FunctionComponent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { adminHistoryApi } from '../../admin/api/history';
import { mapEventToRow } from '../../admin/main_history/utils/historyMappers';
import HistoryTimelineList from '../../admin/main_history/components/HistoryTimelineList';
import type { HistoryActionRow } from '../../admin/main_history/types';

const PREFIX = 'admin.auditCenter';

export interface EntityHistoryTimelineProps {
  entityType: string;
  entityId: number;
  title?: string;
  maxItems?: number;
}

const EntityHistoryTimeline: FunctionComponent<EntityHistoryTimelineProps> = ({
  entityType,
  entityId,
  title,
  maxItems = 20,
}) => {
  const { t } = useTranslation();
  const [rows, setRows] = useState<HistoryActionRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    adminHistoryApi
      .entityTimeline(entityType, entityId, { page: 1, page_size: maxItems })
      .then((data) => {
        if (!cancelled) setRows(data.items.map(mapEventToRow));
      })
      .catch(() => {
        if (!cancelled) setRows([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [entityType, entityId, maxItems]);

  return (
    <section className="admin-module-panel w-full overflow-hidden shadow-sm">
      <header className="border-b border-[var(--admin-border)] px-4 py-3 sm:px-5">
        <h3 className="text-sm font-semibold text-[var(--admin-text)]">
          {title ?? t(`${PREFIX}.entityTimelineTitle`)}
        </h3>
      </header>
      <div className="px-4 py-4 sm:px-5">
        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="admin-skeleton h-16 rounded-xl" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <p className="py-6 text-center text-sm text-[var(--admin-text-secondary)]">
            {t(`${PREFIX}.entityTimelineEmpty`)}
          </p>
        ) : (
          <HistoryTimelineList rows={rows} />
        )}
      </div>
    </section>
  );
};

export default EntityHistoryTimeline;
