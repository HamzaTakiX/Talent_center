import { FunctionComponent } from 'react';
import {
  Building2,
  Calendar,
  CalendarClock,
  ChevronRight,
  CircleDot,
  ExternalLink,
  FileText,
  Mail,
  Megaphone,
  Tag,
  User,
  Users,
} from 'lucide-react';
import InternshipInspectorRow from '../../../offres-stage/chat/components/InternshipInspectorRow';
import InternshipOfferAvatar from '../../../offres-stage/chat/components/InternshipOfferAvatar';
import InternshipStudentAvatar from '../../../offres-stage/chat/components/InternshipStudentAvatar';
import { useAnnouncementAttachments } from '../hooks/useAnnouncementAttachments';
import type {
  AnnouncementConversation,
  AnnouncementPriority,
  AnnouncementPublishStatus,
} from '../types/announcementChatTypes';
import AnnouncementInspectorAttachments from './AnnouncementInspectorAttachments';
import AnnouncementInspectorUrls from './AnnouncementInspectorUrls';

type Props = {
  conversation: AnnouncementConversation | null;
  onOpenAnnouncement: () => void;
  onOpenStudent: () => void;
};

const ICON = { className: 'size-4', strokeWidth: 2.25 };
const ICON_SM = { className: 'size-3.5', strokeWidth: 2 };

const STATUS_LABEL: Record<AnnouncementPublishStatus, string> = {
  Published: 'Publiée',
  Scheduled: 'Planifiée',
  Draft: 'Brouillon',
  Expired: 'Expirée',
};

const PRIORITY_LABEL: Record<AnnouncementPriority, string> = {
  Normal: 'Normale',
  Important: 'Importante',
  Urgent: 'Urgente',
};

const AnnouncementContextPanel: FunctionComponent<Props> = ({
  conversation,
  onOpenAnnouncement,
  onOpenStudent,
}) => {
  const { attachments, urlLinks, loading: attachmentsLoading } = useAnnouncementAttachments(
    conversation?.announcementUuid,
  );

  if (!conversation) return null;

  const announcementType = conversation.announcementTypeName?.trim() || '';
  const status = conversation.publishStatus;
  const canViewStudent = Boolean(conversation.studentUserId);

  return (
    <aside className="isi-inspector">
      <header className="isi-inspector-head">
        <span className="isi-inspector-head-title">Contexte annonce</span>
      </header>

      <div className="isi-inspector-section-title">Étudiant</div>
      <div className="isi-inspector-student-card">
        <InternshipStudentAvatar
          url={conversation.studentAvatarUrl}
          name={conversation.studentName}
          email={conversation.studentEmail}
          initials={conversation.studentInitials}
          size="inspector"
        />
        <div className="isi-inspector-student-card-copy min-w-0">
          <p className="isi-inspector-student-card-name">{conversation.studentName}</p>
          {conversation.studentEmail ? (
            <p className="isi-inspector-student-card-email">{conversation.studentEmail}</p>
          ) : null}
        </div>
      </div>
      <div className="isi-inspector-fields">
        <InternshipInspectorRow icon={<User {...ICON_SM} />} label="Nom">
          <span>{conversation.studentName}</span>
        </InternshipInspectorRow>
        <InternshipInspectorRow icon={<CircleDot {...ICON_SM} />} label="Programme">
          <span>{conversation.program}</span>
        </InternshipInspectorRow>
        <InternshipInspectorRow icon={<CircleDot {...ICON_SM} />} label="Classe">
          <span>{conversation.className}</span>
        </InternshipInspectorRow>
        {conversation.studentEmail ? (
          <InternshipInspectorRow icon={<Mail {...ICON_SM} />} label="Email">
            <span>{conversation.studentEmail}</span>
          </InternshipInspectorRow>
        ) : null}
      </div>

      <div className="isi-inspector-divider" />

      <div className="isi-inspector-section-title">Annonce</div>
      <div className="isi-inspector-offer-card">
        <InternshipOfferAvatar
          url={conversation.coverImageUrl}
          companyName={conversation.companyName}
          offerTitle={conversation.announcementTitle}
          size="header"
        />
        <div className="isi-inspector-offer-card-copy min-w-0">
          {conversation.companyName ? (
            <p className="isi-inspector-offer-card-company">{conversation.companyName}</p>
          ) : null}
          <p className="isi-inspector-offer-card-title">{conversation.announcementTitle}</p>
        </div>
      </div>
      <div className="isi-inspector-fields isi-inspector-fields--card">
        <InternshipInspectorRow icon={<FileText {...ICON} />} label="Titre">
          <span>{conversation.announcementTitle}</span>
        </InternshipInspectorRow>
        {conversation.companyName ? (
          <InternshipInspectorRow icon={<Building2 {...ICON} />} label="Organisation">
            <span>{conversation.companyName}</span>
          </InternshipInspectorRow>
        ) : null}
        {announcementType ? (
          <InternshipInspectorRow icon={<Megaphone {...ICON} />} label="Type">
            <span>{announcementType}</span>
          </InternshipInspectorRow>
        ) : null}
        <InternshipInspectorRow icon={<Tag {...ICON} />} label="Catégorie">
          <span>{conversation.category}</span>
        </InternshipInspectorRow>
        <InternshipInspectorRow icon={<CircleDot {...ICON} />} label="Statut">
          <span className={`isi-status-pill isi-status-pill--${status.toLowerCase()}`}>
            {STATUS_LABEL[status]}
          </span>
        </InternshipInspectorRow>
        <InternshipInspectorRow icon={<CircleDot {...ICON} />} label="Priorité">
          <span>{PRIORITY_LABEL[conversation.priority]}</span>
        </InternshipInspectorRow>
        <InternshipInspectorRow icon={<Calendar {...ICON} />} label="Date de publication">
          <span>{conversation.publishDate}</span>
        </InternshipInspectorRow>
        <InternshipInspectorRow icon={<CalendarClock {...ICON} />} label="Date d'expiration">
          <span>{conversation.expiryDate}</span>
        </InternshipInspectorRow>
        <InternshipInspectorRow icon={<Users {...ICON} />} label="Audience">
          <span>{conversation.audience}</span>
        </InternshipInspectorRow>
      </div>

      <div className="isi-inspector-divider" />

      <AnnouncementInspectorAttachments attachments={attachments} loading={attachmentsLoading} />

      <div className="isi-inspector-divider" />

      <AnnouncementInspectorUrls links={urlLinks} loading={attachmentsLoading} />

      <div className="isi-inspector-divider" />

      <div className="isi-inspector-actions">
        <span className="isi-inspector-actions-title">Actions rapides</span>
        <button
          type="button"
          className="isi-inspector-action isi-inspector-action--primary"
          onClick={onOpenAnnouncement}
          disabled={!conversation.announcementUuid}
        >
          <span className="isi-inspector-action-icon">
            <ExternalLink {...ICON} />
          </span>
          <span className="isi-inspector-action-text">Voir l'annonce</span>
          <ChevronRight className="isi-inspector-action-chevron size-4" strokeWidth={2.25} />
        </button>
        <button
          type="button"
          className="isi-inspector-action"
          onClick={onOpenStudent}
          disabled={!canViewStudent}
        >
          <span className="isi-inspector-action-icon">
            <User {...ICON_SM} />
          </span>
          <span className="isi-inspector-action-text">Profil étudiant</span>
          <ChevronRight className="isi-inspector-action-chevron size-3.5" />
        </button>
      </div>
    </aside>
  );
};

export default AnnouncementContextPanel;
