import { FunctionComponent, ReactNode } from 'react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import type { InternshipConversation } from '../types/internshipChatTypes';
import { useInternshipInboxCopy } from '../../hooks/useOffersListLabels';
import InternshipStudentAvatar from './InternshipStudentAvatar';
import { conversationHasApplication } from '../utils/internshipChatDisplayUtils';

type Props = {
  conversation: InternshipConversation;
  onBack?: () => void;
  onMarkResolved: () => void;
  conversationMenu?: ReactNode;
};

const InternshipChatHeader: FunctionComponent<Props> = ({
  conversation,
  onBack,
  onMarkResolved,
  conversationMenu,
}) => {
  const { t } = useInternshipInboxCopy();
  const hasApplication = conversationHasApplication(conversation);

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
            {conversation.program}
            {conversation.className !== '—' ? ` · ${conversation.className}` : ''}
            <span className="isi-chat-meta-sep" aria-hidden> · </span>
            {conversation.offerTitle}
            <span className="isi-chat-meta-sep" aria-hidden> · </span>
            {conversation.company}
            {hasApplication ? (
              <>
                <span className="isi-chat-meta-sep" aria-hidden> · </span>
                {conversation.applicationStatus}
              </>
            ) : null}
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

export default InternshipChatHeader;
