import { FunctionComponent } from 'react';
import HistoryTimelineItem from './HistoryTimelineItem';
import HistoryTimelineLoading from './HistoryTimelineLoading';
import type { HistoryActionRow } from '../types';
import { AdminSearchEmptyState } from '../../ui';

interface HistoryTimelineListProps {
  rows: HistoryActionRow[];
  onViewDetails?: (row: HistoryActionRow) => void;
  hideModuleBadge?: boolean;
  emptyTitleKey?: string;
  loading?: boolean;
}

const HistoryTimelineList: FunctionComponent<HistoryTimelineListProps> = ({
  rows,
  onViewDetails,
  hideModuleBadge = false,
  emptyTitleKey = 'admin.empty.historyFilters',
  loading = false,
}) => {
  if (loading && rows.length === 0) {
    return <HistoryTimelineLoading />;
  }

  if (!loading && rows.length === 0) {
    return <AdminSearchEmptyState titleKey={emptyTitleKey} />;
  }

  const isRefreshing = loading && rows.length > 0;

  return (
    <div className="admin-history-timeline-shell">
      <div
        className={`admin-history-page__timeline relative space-y-3${isRefreshing ? ' admin-history-page__timeline--refreshing' : ''}`}
        aria-busy={loading}
      >
        <div className="admin-timeline-rail absolute bottom-0 left-[27px] top-2 w-0.5" aria-hidden />
        {rows.map((row) => (
          <HistoryTimelineItem
            key={row.id}
            row={row}
            onViewDetails={onViewDetails}
            hideModuleBadge={hideModuleBadge}
          />
        ))}
      </div>
    </div>
  );
};

export default HistoryTimelineList;
