import { FunctionComponent } from 'react';
import type { StudentHistoryActionRow } from '../types';
import HistoryTimelineItem from './HistoryTimelineItem';

interface HistoryTimelineListProps {
  rows: StudentHistoryActionRow[];
}

const HistoryTimelineList: FunctionComponent<HistoryTimelineListProps> = ({ rows }) => {
  if (rows.length === 0) {
    return (
      <div className="rounded-[10px] border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] p-10 text-center">
        <p className="text-sm font-medium text-[var(--admin-text-muted)]">
          No activities match your filters. Try another area or status.
        </p>
      </div>
    );
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
