import { FunctionComponent } from 'react';
import type { HistoryActionRow } from '../types';
import { AdminSearchEmptyState } from '../../ui';
import HistoryTimelineItem from './HistoryTimelineItem';

interface HistoryTimelineListProps {
  rows: HistoryActionRow[];
  onViewDetails?: (row: HistoryActionRow) => void;
  hideModuleBadge?: boolean;
  emptyTitleKey?: string;
}

const HistoryTimelineList: FunctionComponent<HistoryTimelineListProps> = ({
  rows,
  onViewDetails,
  hideModuleBadge = false,
  emptyTitleKey = 'admin.empty.historyFilters',
}) => {
  if (rows.length === 0) {
    return <AdminSearchEmptyState titleKey={emptyTitleKey} />;
  }

  return (
    <div className="admin-history-page__timeline relative space-y-3">
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
  );
};

export default HistoryTimelineList;
