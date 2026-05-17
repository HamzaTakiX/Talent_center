import { FunctionComponent } from 'react';
import type { HistoryActionRow } from '../types';
import { AdminSearchEmptyState } from '../../ui';
import HistoryTimelineItem from './HistoryTimelineItem';

interface HistoryTimelineListProps {
  rows: HistoryActionRow[];
}

const HistoryTimelineList: FunctionComponent<HistoryTimelineListProps> = ({ rows }) => {
  if (rows.length === 0) {
    return <AdminSearchEmptyState titleKey="admin.empty.historyFilters" />;
  }

  return (
    <>
      {rows.map((row) => (
        <HistoryTimelineItem key={row.id} row={row} />
      ))}
    </>
  );
};

export default HistoryTimelineList;
