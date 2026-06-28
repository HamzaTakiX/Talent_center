import { FunctionComponent, ReactNode } from 'react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useInternshipInboxCopy } from '../../../offres-stage/hooks/useOffersListLabels';
import InternshipStudentAvatar from '../../../offres-stage/chat/components/InternshipStudentAvatar';
import type { AnnouncementConversation } from '../types/announcementChatTypes';

const STATUS_LABEL: Record<AnnouncementConversation['publishStatus'], string> = {
  Published: 'Publiée',
  Scheduled: 'Planifiée',
  Draft: 'Brouillon',
  Expired: 'Expirée',
};

type Props = {
  conversation: AnnouncementConversation;
  onBack?: () => void;
  onMarkResolved: () => void;
  conversationMenu?: ReactNode;
};

const AnnouncementChatHeader: FunctionComponent<Props> = ({
  conversation,
  onBack,
  onMarkResolved,
  conversationMenu,
}) => {
  const { t } = useInternshipInboxCopy();

  return (
    <header className="isi-chat-header">
      <div className="isi-chat-header-left">
        {onBack ? (
          <button type="button" onClick={onBack} className="isi-icon-btn lg:hidden" aria-label={t('back')}>
            <ArrowLeft className="size-5" />
          </button>
        ) : null}
        <div className="isi-chat-header-main min-w-0">
          <div className="isi-chat-header-identity">
            <InternshipStudentAvatar
              url={conversation.studentAvatarUrl}
              name={conversation.studentName}
              email={conversation.studentEmail}
              initials={conversation.studentInitials}
              size="header"
            />
            <h2 className="isi-chat-name truncate">{conversation.studentName}</h2>
          </div>
          {conversation.studentEmail ? (
            <p className="isi-chat-email truncate">{conversation.studentEmail}</p>
          ) : null}
          <p className="isi-chat-meta truncate">
            {conversation.program !== '—' ? conversation.program : null}
            {conversation.className !== '—' ? (
              <>
                {conversation.program !== '—' ? (
                  <span className="isi-chat-meta-sep" aria-hidden> · </span>
                ) : null}
                {conversation.className}
              </>
            ) : null}
            {conversation.announcementTitle ? (
              <>
                <span className="isi-chat-meta-sep" aria-hidden> · </span>
                {conversation.announcementTitle}
              </>
            ) : null}
            <span className="isi-chat-meta-sep" aria-hidden> · </span>
            {STATUS_LABEL[conversation.publishStatus]}
          </p>
        </div>
      </div>

      <div className="isi-chat-actions">
        {!conversation.resolved ? (
          <button type="button" onClick={onMarkResolved} className="isi-header-btn">
            <CheckCircle2 className="size-4" />
            <span>{t('resolve')}</span>
          </button>
        ) : null}
        {conversationMenu}
      </div>
    </header>
  );
};

export default AnnouncementChatHeader;
