import { FunctionComponent, KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ArchiveRestore, Building2, Calendar, Eye, MousePointerClick, Users } from 'lucide-react';
import type { AnnouncementListItem, AnnouncementTypeItem } from '../types/announcement';
import { typeIcon } from '../utils/announcementMeta';
import AnnouncementStatusBadge from './AnnouncementStatusBadge';
import AnnouncementPriorityBadge from './AnnouncementPriorityBadge';
import AnnouncementCardActions from './AnnouncementCardActions';
import { fadeInUp } from '../../dashboard/ui/animations';

interface Props {
  item: AnnouncementListItem;
  typeMeta?: AnnouncementTypeItem | null;
  index?: number;
  onClick: () => void;
  onDeleted?: () => void | Promise<void>;
  onUnarchive?: () => void | Promise<void>;
  unarchiveBusy?: boolean;
  selectionMode?: boolean;
  selected?: boolean;
  onToggleSelect?: () => void;
}

const AnnouncementCard: FunctionComponent<Props> = ({
  item,
  typeMeta,
  index = 0,
  onClick,
  onDeleted,
  onUnarchive,
  unarchiveBusy = false,
  selectionMode = false,
  selected = false,
  onToggleSelect,
}) => {
  const { t } = useTranslation();
  const resolvedType = typeMeta ?? { code: item.typeCode, icon: undefined };
  const TypeIcon = typeIcon(resolvedType);
  const typeAccent = typeMeta?.color;
  const typeLabel = typeMeta?.nameLocalized ?? item.typeName ?? item.typeCode;
  const isUrgent =
    item.priority === 'URGENT' || item.priority === 'INSTITUTIONAL_CRITICAL' || item.is_pinned;

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (selectionMode) onToggleSelect?.();
      else onClick();
    }
  };

  const handleCardClick = () => {
    if (selectionMode) onToggleSelect?.();
    else onClick();
  };

  const stopCardActivation = (event: { stopPropagation: () => void }) => {
    event.stopPropagation();
  };

  return (
    <motion.article
      className={`admin-ann-card${selectionMode ? ' admin-ann-card--selectable' : ''}${selected ? ' admin-ann-card--selected' : ''}`}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={item.title}
      {...fadeInUp}
      transition={{ delay: index * 0.04 }}
    >
      <div className="admin-ann-card__cover">
        {item.coverImageUrl ? (
          <img src={item.coverImageUrl} alt="" className="admin-ann-card__cover-image" loading="lazy" />
        ) : (
          <div
            className="admin-ann-card__cover-placeholder"
            style={
              typeAccent
                ? {
                    backgroundColor: `color-mix(in srgb, ${typeAccent} 14%, var(--admin-bg-elevated))`,
                    color: typeAccent,
                  }
                : undefined
            }
            aria-hidden
          >
            <TypeIcon className="h-10 w-10 opacity-80" />
          </div>
        )}
        <div className="admin-ann-card__badges">
          <div className="admin-ann-card__badge-group">
            <AnnouncementStatusBadge status={item.status} />
            {isUrgent ? <AnnouncementPriorityBadge priority={item.priority} /> : null}
          </div>
          <div
            className="admin-ann-card__actions"
            onClick={stopCardActivation}
            onMouseDown={stopCardActivation}
            onKeyDown={stopCardActivation}
          >
            {selectionMode ? (
              <div className="admin-ann-card__select">
                <input
                  type="checkbox"
                  className="admin-ann-card__checkbox"
                  checked={selected}
                  onChange={() => onToggleSelect?.()}
                  aria-label={t('admin.announcementsModule.actions.selectItem', {
                    title: item.title,
                    defaultValue: `Sélectionner ${item.title}`,
                  })}
                />
              </div>
            ) : (
              <AnnouncementCardActions item={item} onDeleted={onDeleted} />
            )}
          </div>
        </div>
      </div>
      <div className="admin-ann-card__body">
        <h3 className="admin-ann-card__title">{item.title}</h3>
        {item.company_name ? (
          <p className="admin-ann-card__company">
            <Building2 className="inline h-3 w-3 me-1 opacity-70" aria-hidden />
            {item.company_name}
          </p>
        ) : null}
        <div className="admin-ann-card__chips">
          <span
            className="admin-ann-chip"
            style={
              typeAccent
                ? {
                    borderColor: `color-mix(in srgb, ${typeAccent} 35%, var(--admin-border))`,
                    color: typeAccent,
                    backgroundColor: `color-mix(in srgb, ${typeAccent} 10%, transparent)`,
                  }
                : undefined
            }
          >
            {typeLabel}
          </span>
          <span className="admin-ann-chip">
            <Users className="h-3 w-3" aria-hidden />
            {t(`admin.announcementsModule.scopes.${item.target_scope}`, {
              defaultValue: item.target_scope,
            })}
          </span>
        </div>
        <div className="admin-ann-card__stats">
          <span className="admin-ann-card__stat">
            <Eye className="h-3.5 w-3.5" aria-hidden />
            {item.view_count}
          </span>
          <span className="admin-ann-card__stat">
            <MousePointerClick className="h-3.5 w-3.5" aria-hidden />
            {item.click_count}
          </span>
          {item.application_deadline ? (
            <span className="admin-ann-card__stat">
              <Calendar className="h-3.5 w-3.5" aria-hidden />
              {new Date(item.application_deadline).toLocaleDateString()}
            </span>
          ) : null}
        </div>
        {onUnarchive ? (
          <div
            className="admin-ann-card__footer"
            onClick={stopCardActivation}
            onMouseDown={stopCardActivation}
            onKeyDown={stopCardActivation}
          >
            <button
              type="button"
              className="admin-ann-card__unarchive-btn"
              disabled={unarchiveBusy}
              onClick={() => void onUnarchive()}
            >
              <ArchiveRestore className="h-4 w-4" aria-hidden />
              {t('admin.announcementsModule.archived.unarchive')}
            </button>
          </div>
        ) : null}
      </div>
    </motion.article>
  );
};

export default AnnouncementCard;
