import { FunctionComponent, ReactNode } from 'react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useInternshipInboxCopy } from '../../../offres-stage/hooks/useOffersListLabels';
import InternshipStudentAvatar from '../../../offres-stage/chat/components/InternshipStudentAvatar';
import DocumentServiceChatIcon from '../../components/service-catalog/DocumentServiceChatIcon';
import type { DocumentConversation } from '../types/documentChatTypes';

type Props = {
  conversation: DocumentConversation;
  onBack?: () => void;
  onMarkResolved: () => void;
  conversationMenu?: ReactNode;
};

const DocumentChatHeader: FunctionComponent<Props> = ({
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
        <DocumentServiceChatIcon
          iconKey={conversation.iconKey}
          colorTheme={conversation.colorTheme}
          size="header"
        />
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
            {conversation.documentTitle}
            <span className="isi-chat-meta-sep" aria-hidden> · </span>
            {conversation.requestStatus}
            {conversation.serviceCode ? (
              <>
                <span className="isi-chat-meta-sep" aria-hidden> · </span>
                {conversation.serviceCode}
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

export default DocumentChatHeader;
