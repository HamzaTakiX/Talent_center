import { FunctionComponent, useState } from 'react';
import {
  Briefcase,
  CalendarClock,
  CheckSquare,
  FileText,
  Link2,
  X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ChatEntityReference } from '../types/chatEntityTypes';
import {
  chatEntityTone,
  chatEntityTypeDefaultLabel,
  chatEntityTypeLabelKey,
  entityRefKey,
} from '../utils/chatEntityDisplay';
import '../styles/chat-composer-tags.css';

type Props = {
  entity: ChatEntityReference;
  variant?: 'message' | 'composer';
  onRemove?: (entityType: string, entityId: string) => void;
};

function EntityTypeIcon({ type }: { type?: string }) {
  const iconProps = { className: 'chat-entity-badge__glyph', strokeWidth: 2.2, 'aria-hidden': true as const };
  switch (type) {
    case 'task':
      return <CheckSquare {...iconProps} />;
    case 'meeting':
      return <CalendarClock {...iconProps} />;
    case 'report':
      return <FileText {...iconProps} />;
    case 'internship_offer':
    case 'offer_application':
      return <Briefcase {...iconProps} />;
    default:
      return <Link2 {...iconProps} />;
  }
}

/** Subtitles are built as "status · detail"; the leading segment becomes the status pill. */
function splitSubtitle(subtitle?: string): { status?: string; detail?: string } {
  const value = subtitle?.trim();
  if (!value) return {};
  const [first, ...rest] = value.split('·').map((part) => part.trim());
  if (!rest.length) return { detail: first };
  return { status: first, detail: rest.join(' · ') };
}

const ChatEntityBadge: FunctionComponent<Props> = ({
  entity,
  variant = 'message',
  onRemove,
}) => {
  const { t } = useTranslation();
  const [imageFailed, setImageFailed] = useState(false);
  const tone = chatEntityTone(entity.entity_type);
  const typeLabel = t(chatEntityTypeLabelKey(entity.entity_type), {
    defaultValue: chatEntityTypeDefaultLabel(entity.entity_type),
  });
  const { status, detail } = splitSubtitle(entity.subtitle);
  const showImage = Boolean(entity.image_url) && !imageFailed;

  return (
    <span
      className={[
        'chat-entity-badge',
        `chat-entity-badge--${tone}`,
        `chat-entity-badge--${variant}`,
        onRemove ? 'chat-entity-badge--removable' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      title={entity.subtitle ? `${typeLabel} · ${entity.label} · ${entity.subtitle}` : `${typeLabel} · ${entity.label}`}
    >
      <span className="chat-entity-badge__media" aria-hidden>
        {showImage ? (
          <img
            src={entity.image_url}
            alt=""
            className="chat-entity-badge__photo"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <span className="chat-entity-badge__icon">
            <EntityTypeIcon type={entity.entity_type} />
          </span>
        )}
      </span>
      <span className="chat-entity-badge__copy">
        <span className="chat-entity-badge__head">
          <span className="chat-entity-badge__type">{typeLabel}</span>
          {status ? <span className="chat-entity-badge__status">{status}</span> : null}
        </span>
        <span className="chat-entity-badge__title">{entity.label}</span>
        {detail ? (
          <span className="chat-entity-badge__meta">
            <CalendarClock className="chat-entity-badge__meta-glyph" strokeWidth={2} aria-hidden />
            {detail}
          </span>
        ) : null}
      </span>
      {onRemove ? (
        <button
          type="button"
          className="chat-entity-badge__remove"
          aria-label={t('admin.chat.removeEntity', {
            name: entity.label,
            defaultValue: 'Retirer {{name}}',
          })}
          onClick={() => onRemove(entity.entity_type, entity.entity_id)}
        >
          <X className="size-3" strokeWidth={2.4} aria-hidden />
        </button>
      ) : null}
    </span>
  );
};

export { entityRefKey };
export default ChatEntityBadge;
