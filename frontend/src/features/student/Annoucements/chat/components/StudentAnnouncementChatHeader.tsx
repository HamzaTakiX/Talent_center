import { FunctionComponent, ReactNode } from 'react';
import { ArrowLeft, Megaphone } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import InternshipOfferAvatar from '../../../../admin/offres-stage/chat/components/InternshipOfferAvatar';
import type { StudentAnnouncementConversation } from '../utils/studentAnnouncementChatMappers';

type Props = {
  conversation: StudentAnnouncementConversation;
  onBack?: () => void;
  onViewAnnouncement: () => void;
  conversationMenu?: ReactNode;
};

function priorityLabelKey(priority: StudentAnnouncementConversation['priority']): string {
  if (priority === 'Urgent') return 'urgent';
  if (priority === 'Important') return 'important';
  return 'normal';
}

const StudentAnnouncementChatHeader: FunctionComponent<Props> = ({
  conversation,
  onBack,
  onViewAnnouncement,
  conversationMenu,
}) => {
  const { t } = useTranslation();

  return (
    <header className="isi-chat-header isi-chat-header--student">
      <div className="isi-chat-header-left">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="isi-icon-btn lg:hidden"
            aria-label={t('student.announcements.chat.back')}
          >
            <ArrowLeft className="size-5" />
          </button>
        ) : null}
        <InternshipOfferAvatar
          url={conversation.coverImageUrl}
          companyName={conversation.companyName}
          offerTitle={conversation.announcementTitle}
          size="header"
        />
        <div className="isi-chat-header-copy min-w-0">
          <h2 className="isi-chat-name truncate">{conversation.announcementTitle}</h2>
          <div className="isi-chat-header-badges">
            {conversation.companyName ? (
              <span className="isi-chat-company-chip">{conversation.companyName}</span>
            ) : null}
            {conversation.announcementType ? (
              <span className="isi-chat-type-chip">{conversation.announcementType}</span>
            ) : null}
            <span className="isi-chat-type-chip">
              {t(`student.announcements.priority.${priorityLabelKey(conversation.priority)}`)}
            </span>
          </div>
        </div>
      </div>

      <div className="isi-chat-actions">
        <button
          type="button"
          onClick={onViewAnnouncement}
          className="isi-header-btn isi-header-btn--accent"
        >
          <Megaphone className="size-4" />
          <span>
            {t('student.announcements.chat.viewAnnouncement', { defaultValue: "Voir l'annonce" })}
          </span>
        </button>
        {conversationMenu}
      </div>
    </header>
  );
};

export default StudentAnnouncementChatHeader;
