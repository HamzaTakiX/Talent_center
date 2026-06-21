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
import { formatRelativeTime } from '../utils/formatRelativeTime';
import { textContainsUrl } from '../../shared/formatSourceUrl';
import HistorySummaryText from './HistorySummaryText';
import type { HistoryActionRow } from '../types';

const MAIN_PREFIX = 'admin.historyUi.main';
const AUDIT_PREFIX = 'admin.auditCenter';

interface HistoryTimelineItemProps {
  row: HistoryActionRow;
  onViewDetails?: (row: HistoryActionRow) => void;
  hideModuleBadge?: boolean;
}

function formatEntityLabel(entityType?: string, entityId?: number | null): string | null {
  if (!entityType) return null;
  const label = entityType.replace(/_/g, ' ');
  if (entityId != null) return `${label} #${entityId}`;
  return label;
}

const HistoryTimelineItem: FunctionComponent<HistoryTimelineItemProps> = ({
  row,
  onViewDetails,
  hideModuleBadge = false,
}) => {
  const { t } = useTranslation();

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

  const relativeTime = formatRelativeTime(
    row.occurredAt ?? row.timestamp,
    Date.now(),
    (key, opts) => t(key, opts ?? {}),
  );
  const entityLabel = formatEntityLabel(row.entityType, row.entityId);
  const roleLabel = row.actorRole
    ? t(`${AUDIT_PREFIX}.roles.${row.actorRole}`, row.actorRole)
    : null;

  return (
    <article className="admin-main-history-item admin-audit-timeline-item relative flex min-w-0 max-w-full items-start gap-0 pl-0">
      <div className="relative z-[1] flex w-12 shrink-0 justify-center pt-3 sm:w-14">
        <span
          className="admin-history-circle ring-2 ring-[var(--admin-bg-elevated)]"
          data-history-variant={variant}
        >
          {row.isAutomated ? (
            <Bot className="admin-history-circle__icon h-4 w-4" strokeWidth={2} aria-hidden />
          ) : (
            <History className="admin-history-circle__icon h-4 w-4" strokeWidth={2} aria-hidden />
          )}
        </span>
      </div>

      <div className="admin-main-history-item__body box-border min-w-0 flex-1 py-1 pl-2 sm:pl-3">
        <div className="admin-main-history-item__card admin-audit-timeline-card admin-mobile-card box-border min-w-0 max-w-full overflow-hidden p-3 transition hover:bg-[var(--admin-row-hover)] sm:min-h-[80px] sm:p-4">
          <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start sm:gap-3">
            <div className="min-w-0 space-y-1.5">
              <div className="admin-audit-timeline-item__meta flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--admin-text-secondary)]">
                <span className="font-medium text-[var(--admin-text)]">{actor}</span>
                {roleLabel ? (
                  <>
                    <span aria-hidden>·</span>
                    <span>{roleLabel}</span>
                  </>
                ) : null}
                {!hideModuleBadge ? (
                  <>
                    <span aria-hidden>·</span>
                    <span>{moduleLabel}</span>
                  </>
                ) : null}
                {entityLabel ? (
                  <>
                    <span aria-hidden>·</span>
                    <span className="truncate">{entityLabel}</span>
                  </>
                ) : null}
                <span aria-hidden>·</span>
                <time className="tabular-nums text-[var(--admin-text-secondary)]" dateTime={row.occurredAt}>
                  {relativeTime}
                </time>
              </div>

              <div className="admin-main-history-item__badges flex max-w-full flex-wrap items-center gap-1">
                <span
                  className={historyTimelineBadgeClass(criticalityBadgeClass(crit))}
                  title={t(`${AUDIT_PREFIX}.criticality.${crit}`)}
                >
                  {t(`${AUDIT_PREFIX}.criticality.${crit}`)}
                </span>
                {!hideModuleBadge ? (
                  <span className={historyTimelineBadgeClass(historyModuleBadgeClass())} title={moduleLabel}>
                    {moduleLabel}
                  </span>
                ) : null}
                <span
                  className={historyTimelineBadgeClass(historyActionBadgeClass(row.actionType))}
                  title={actionLabel}
                >
                  {actionLabel}
                </span>
              </div>

              <p className="text-sm font-semibold leading-5 text-[var(--admin-text)]">
                {row.entityPath && !textContainsUrl(title) ? (
                  <Link
                    to={row.entityPath}
                    className="text-[var(--admin-primary)] hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {title}
                  </Link>
                ) : (
                  <HistorySummaryText text={title} />
                )}
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
