import { FunctionComponent } from 'react';
import { Eye, History } from 'lucide-react';
import {
  STUDENT_HISTORY_EVENT_TYPE_BADGE_CLASS,
  STUDENT_HISTORY_EVENT_TYPE_LABEL,
  STUDENT_HISTORY_MANAGEMENT_STATUS_BADGE_CLASS,
  STUDENT_HISTORY_MANAGEMENT_STATUS_LABEL,
} from '../constants/historyConstants';
import type { StudentHistoryActionRow } from '../types';

interface HistoryTimelineItemProps {
  row: StudentHistoryActionRow;
}

const HistoryTimelineItem: FunctionComponent<HistoryTimelineItemProps> = ({ row }) => {
  const [date, time] = row.timestamp.split(' ');
  const formattedDate = date?.includes('-') ? date.split('-').reverse().join('/') : date;
  const eventLabel = STUDENT_HISTORY_EVENT_TYPE_LABEL[row.eventType];
  const statusLabel = STUDENT_HISTORY_MANAGEMENT_STATUS_LABEL[row.managementStatus];

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-col gap-3 rounded-[10px] border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] p-3 transition hover:bg-neutral-50 sm:min-h-[76px] sm:flex-row sm:items-center sm:gap-4 sm:p-4">
      <div className="flex min-w-0 flex-1 items-start gap-3 sm:items-center sm:gap-4">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#dbeafe] text-[#193cb8] opacity-100 sm:h-10 sm:w-10">
          <History className="h-4 w-4 sm:h-5 sm:w-5" />
        </span>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex h-[22px] items-center rounded-lg border border-[var(--admin-border)] px-2 py-0.5 text-xs font-medium leading-4 text-[var(--admin-text)]">
              {row.module}
            </span>
            <span
              className={`inline-flex h-[22px] items-center rounded-lg px-2 py-0.5 text-xs font-medium leading-4 ${STUDENT_HISTORY_EVENT_TYPE_BADGE_CLASS[row.eventType]}`}
            >
              {eventLabel}
            </span>
            <span
              className={`inline-flex h-[22px] items-center rounded-lg px-2 py-0.5 text-xs font-medium leading-4 ${STUDENT_HISTORY_MANAGEMENT_STATUS_BADGE_CLASS[row.managementStatus]}`}
            >
              {statusLabel}
            </span>
          </div>

          <p className="break-words text-sm font-medium leading-5 text-[var(--admin-text)]">{row.title}</p>
          <p className="text-xs leading-4 text-[var(--admin-text-muted)]">
            {row.detail}
            {formattedDate ? ` • ${formattedDate}` : ''} {time ?? ''}
          </p>
        </div>
      </div>
      <button
        type="button"
        className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium text-[var(--admin-text)] transition hover:bg-[var(--admin-row-hover)] hover:underline sm:ml-auto sm:w-auto sm:justify-end sm:bg-transparent sm:py-0"
        onClick={() => console.log('View details', row.id)}
      >
        <Eye className="h-4 w-4 shrink-0" />
        <span className="whitespace-nowrap">View Details</span>
      </button>
    </div>
  );
};

export default HistoryTimelineItem;
