import { FunctionComponent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, History } from 'lucide-react';
import { historyActionBadgeClass, historyModuleBadgeClass } from '../constants/historyConstants';
import { HISTORY_MODULE_I18N_KEY } from '../constants/historyModuleI18n';
import type { HistoryActionRow } from '../types';

const MAIN_PREFIX = 'admin.historyUi.main';

interface HistoryTimelineItemProps {
  row: HistoryActionRow;
}

const HistoryTimelineItem: FunctionComponent<HistoryTimelineItemProps> = ({ row }) => {
  const { t } = useTranslation();
  const [date, time] = row.timestamp.split(' ');

  const moduleLabel = t(`${MAIN_PREFIX}.modules.${HISTORY_MODULE_I18N_KEY[row.module]}`);
  const actionLabel = t(`${MAIN_PREFIX}.actions.${row.actionType}`);

  const { title, actor } = useMemo(() => {
    const titleKey = `${MAIN_PREFIX}.rows.${row.id}.title`;
    const actorKey = `${MAIN_PREFIX}.rows.${row.id}.actor`;
    const translatedTitle = t(titleKey);
    const translatedActor = t(actorKey);
    return {
      title: translatedTitle === titleKey ? row.title : translatedTitle,
      actor: translatedActor === actorKey ? row.actor : translatedActor,
    };
  }, [row.id, row.title, row.actor, t]);

  const formattedDate = date?.includes('-') ? date.split('-').reverse().join('/') : date;

  return (
    <div className="admin-main-history-item box-border max-w-full overflow-hidden admin-mobile-card p-3 transition hover:bg-[var(--admin-row-hover)] sm:min-h-[76px] sm:p-4">
      <div className="flex min-w-0 flex-col gap-3 sm:min-h-[76px] sm:flex-row sm:items-center sm:gap-4">
        <div className="flex min-w-0 flex-1 items-start gap-3 overflow-hidden sm:items-center sm:gap-4">
          <span className="admin-main-history-item__icon shrink-0" data-history-variant="info">
            <History className="admin-history-circle__icon" strokeWidth={2} aria-hidden />
          </span>
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex h-[22px] shrink-0 items-center ${historyModuleBadgeClass()}`}>
                {moduleLabel}
              </span>
              <span className={`inline-flex h-[22px] shrink-0 items-center ${historyActionBadgeClass(row.actionType)}`}>
                {actionLabel}
              </span>
            </div>

            <p className="break-words text-sm font-medium leading-5 text-[var(--admin-text)]">{title}</p>
            <p className="text-xs leading-4 text-[var(--admin-text-secondary)]">
              {actor} {formattedDate ? `• ${formattedDate}` : ''} {time ?? ''}
            </p>
          </div>
        </div>
        <button
          type="button"
          className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium text-[var(--admin-text)] transition hover:bg-[var(--admin-row-hover)] hover:underline sm:ml-auto sm:w-auto sm:justify-end sm:bg-transparent sm:py-0"
          onClick={() => console.log('View details', row.id)}
        >
          <Eye className="h-4 w-4 shrink-0" />
          <span className="whitespace-nowrap">{t(`${MAIN_PREFIX}.viewDetails`)}</span>
        </button>
      </div>
    </div>
  );
};

export default HistoryTimelineItem;
