import { FunctionComponent, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bot, Eye, ExternalLink, History } from 'lucide-react';
import {
  historyActionBadgeClass,
  historyModuleBadgeClass,
  historyTimelineBadgeClass,
} from '../constants/historyConstants';
import { criticalityBadgeClass, criticalityTimelineVariant } from '../constants/criticalityStyles';
import { HISTORY_MODULE_I18N_KEY } from '../constants/historyModuleI18n';
import type { HistoryActionRow } from '../types';

const MAIN_PREFIX = 'admin.historyUi.main';
const AUDIT_PREFIX = 'admin.auditCenter';

interface HistoryTimelineItemProps {
  row: HistoryActionRow;
  onViewDetails?: (row: HistoryActionRow) => void;
  hideModuleBadge?: boolean;
}

const HistoryTimelineItem: FunctionComponent<HistoryTimelineItemProps> = ({
  row,
  onViewDetails,
  hideModuleBadge = false,
}) => {
  const { t } = useTranslation();
  const [date, time] = row.timestamp.split(' ');

  const moduleLabel = t(`${MAIN_PREFIX}.modules.${HISTORY_MODULE_I18N_KEY[row.module]}`);
  const actionLabel = t(`${MAIN_PREFIX}.actions.${row.actionType}`);
  const crit = row.criticality ?? 'INFO';
  const variant = criticalityTimelineVariant(crit);

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
    <article className="admin-main-history-item relative flex min-w-0 max-w-full items-start gap-0 pl-0">
      <div className="relative z-[1] flex w-12 shrink-0 justify-center pt-3 sm:w-14">
        <span className="admin-history-circle ring-2 ring-[var(--admin-bg-elevated)]" data-history-variant={variant}>
          {row.isAutomated ? (
            <Bot className="admin-history-circle__icon h-4 w-4" strokeWidth={2} aria-hidden />
          ) : (
            <History className="admin-history-circle__icon h-4 w-4" strokeWidth={2} aria-hidden />
          )}
        </span>
      </div>

      <div className="admin-main-history-item__body box-border min-w-0 flex-1 py-1 pl-2 sm:pl-3">
        <div className="admin-main-history-item__card admin-mobile-card box-border min-w-0 max-w-full overflow-hidden p-3 transition hover:bg-[var(--admin-row-hover)] sm:min-h-[72px] sm:p-3.5">
          <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-3">
            <div className="min-w-0 space-y-1">
              <div className="admin-main-history-item__badges flex max-w-full flex-wrap items-center gap-1">
                <span
                  className={historyTimelineBadgeClass(criticalityBadgeClass(crit))}
                  title={t(`${AUDIT_PREFIX}.criticality.${crit}`)}
                >
                  {t(`${AUDIT_PREFIX}.criticality.${crit}`)}
                </span>
                {hideModuleBadge ? null : (
                  <span className={historyTimelineBadgeClass(historyModuleBadgeClass())} title={moduleLabel}>
                    {moduleLabel}
                  </span>
                )}
                <span
                  className={historyTimelineBadgeClass(historyActionBadgeClass(row.actionType))}
                  title={actionLabel}
                >
                  {actionLabel}
                </span>
              </div>

              <p className="break-words text-sm font-medium leading-5 text-[var(--admin-text)]">
                {row.entityPath ? (
                  <Link
                    to={row.entityPath}
                    className="text-[var(--admin-primary)] hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {title}
                  </Link>
                ) : (
                  title
                )}
              </p>
              <p className="truncate text-xs leading-4 text-[var(--admin-text-secondary)]">
                {actor} {formattedDate ? `• ${formattedDate}` : ''} {time ?? ''}
              </p>
            </div>

            <div className="admin-main-history-item__actions flex shrink-0 flex-wrap items-center sm:justify-end">
              <div
                className="admin-history-action-group"
                role="group"
                aria-label={t(`${MAIN_PREFIX}.rowActionsAria`, { defaultValue: 'Row actions' })}
              >
                {row.entityPath ? (
                  <Link
                    to={row.entityPath}
                    className="admin-history-action-btn admin-history-action-btn--open"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="admin-history-action-btn__icon" aria-hidden />
                    <span>{t(`${AUDIT_PREFIX}.openEntity`)}</span>
                  </Link>
                ) : null}
                <button
                  type="button"
                  className="admin-history-action-btn admin-history-action-btn--details"
                  onClick={() => onViewDetails?.(row)}
                >
                  <Eye className="admin-history-action-btn__icon" aria-hidden />
                  <span>{t(`${MAIN_PREFIX}.viewDetails`)}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default HistoryTimelineItem;
