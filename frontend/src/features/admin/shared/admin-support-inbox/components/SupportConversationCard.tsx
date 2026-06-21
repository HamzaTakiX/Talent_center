import { FunctionComponent } from 'react';
import type { SupportConversationListItem } from '../types/supportInboxTypes';

interface Props {
  item: SupportConversationListItem;
  active: boolean;
  onSelect: (id: string) => void;
}

const SupportConversationCard: FunctionComponent<Props> = ({ item, active, onSelect }) => (
  <button
    type="button"
    onClick={() => onSelect(item.id)}
    className={`isi-conv-item ${active ? 'isi-conv-item--active' : ''}`}
  >
    <div className="isi-avatar">{item.avatarInitials}</div>
    <div className="isi-conv-body">
      <div className="isi-conv-row">
        <span className="isi-conv-name">{item.name}</span>
        <span className="isi-conv-time">{item.timeLabel}</span>
      </div>
      {item.contextLine ? <p className="isi-conv-offer">{item.contextLine}</p> : null}
      <p className="isi-conv-preview">{item.preview}</p>
      {item.statusLabel ? <span className="isi-status-text">{item.statusLabel}</span> : null}
    </div>
    {item.unreadCount > 0 ? (
      <span className="isi-unread">{item.unreadCount > 99 ? '99+' : item.unreadCount}</span>
    ) : null}
  </button>
);

export default SupportConversationCard;
