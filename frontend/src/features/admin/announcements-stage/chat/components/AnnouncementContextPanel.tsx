import { FunctionComponent, type ReactNode } from 'react';
import {
  Calendar,
  ChevronRight,
  CircleDot,
  Clock,
  ExternalLink,
  Megaphone,
  Tag,
  User,
  Users,
} from 'lucide-react';
import type {
  AnnouncementConversation,
  AnnouncementPublishStatus,
} from '../types/announcementChatTypes';

type Props = {
  conversation: AnnouncementConversation | null;
  onOpenAnnouncement: () => void;
  onOpenStudent: () => void;
  onOpenAudience: () => void;
};

const STATUS_LABEL: Record<AnnouncementPublishStatus, string> = {
  Published: 'Publiée',
  Scheduled: 'Planifiée',
  Draft: 'Brouillon',
  Expired: 'Expirée',
};

function InspectorRow({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="isi-inspector-row">
      <div className="isi-inspector-row-icon" aria-hidden>
        {icon}
      </div>
      <div className="isi-inspector-row-content">
        <span className="isi-inspector-row-label">{label}</span>
        <div className="isi-inspector-row-value">{children}</div>
      </div>
    </div>
  );
}

const AnnouncementContextPanel: FunctionComponent<Props> = ({
  conversation,
  onOpenAnnouncement,
  onOpenStudent,
  onOpenAudience,
}) => {
  if (!conversation) return null;

  const status = conversation.publishStatus;

  return (
    <aside className="isi-inspector">
      <header className="isi-inspector-head">
        <span className="isi-inspector-head-title">Détails</span>
        <span className="isi-inspector-head-badge">{conversation.category}</span>
      </header>

      <div className="isi-inspector-fields">
        <InspectorRow icon={<Megaphone className="size-3.5" />} label="Annonce">
          <span>{conversation.announcementTitle}</span>
        </InspectorRow>

        <InspectorRow icon={<Tag className="size-3.5" />} label="Catégorie">
          <span>{conversation.category}</span>
        </InspectorRow>

        <InspectorRow icon={<CircleDot className="size-3.5" />} label="Statut">
          <span className={`isi-status-pill isi-status-pill--${status.toLowerCase()}`}>
            {STATUS_LABEL[status]}
          </span>
        </InspectorRow>

        <InspectorRow icon={<Calendar className="size-3.5" />} label="Date de publication">
          <span>{conversation.publishDate}</span>
        </InspectorRow>

        <InspectorRow icon={<Clock className="size-3.5" />} label="Date d'expiration">
          <span>{conversation.expiryDate}</span>
        </InspectorRow>

        <InspectorRow icon={<Users className="size-3.5" />} label="Audience">
          <span>{conversation.audience}</span>
        </InspectorRow>
      </div>

      <div className="isi-inspector-divider" />

      <div className="isi-inspector-actions">
        <span className="isi-inspector-actions-title">Actions rapides</span>
        <button type="button" onClick={onOpenAnnouncement} className="isi-inspector-action">
          <span className="isi-inspector-action-icon">
            <ExternalLink className="size-3.5" />
          </span>
          <span className="isi-inspector-action-text">Voir l'annonce</span>
          <ChevronRight className="isi-inspector-action-chevron size-3.5" />
        </button>
        <button type="button" onClick={onOpenAudience} className="isi-inspector-action">
          <span className="isi-inspector-action-icon">
            <Users className="size-3.5" />
          </span>
          <span className="isi-inspector-action-text">Audience ciblée</span>
          <ChevronRight className="isi-inspector-action-chevron size-3.5" />
        </button>
        <button type="button" onClick={onOpenStudent} className="isi-inspector-action">
          <span className="isi-inspector-action-icon">
            <User className="size-3.5" />
          </span>
          <span className="isi-inspector-action-text">Profil étudiant</span>
          <ChevronRight className="isi-inspector-action-chevron size-3.5" />
        </button>
      </div>
    </aside>
  );
};

export default AnnouncementContextPanel;
