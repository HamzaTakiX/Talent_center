import { FunctionComponent, ReactNode } from 'react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useInternshipInboxCopy } from '../../../offres-stage/hooks/useOffersListLabels';
import InternshipStudentAvatar from '../../../offres-stage/chat/components/InternshipStudentAvatar';
import type { PlatformDeskConversation, PlatformDeskViewerRole } from '../types/platformDeskChatTypes';
import PlatformDeskSupportStatusBadge from './PlatformDeskSupportStatusBadge';
import { visibleSupportStatus } from '../utils/platformDeskSupportStatus';

type Props = {
  conversation: PlatformDeskConversation;
  onBack?: () => void;
  onMarkResolved: () => void;
  showAdminActions?: boolean;
  viewerRole?: PlatformDeskViewerRole;
  conversationMenu?: ReactNode;
};

const PlatformDeskChatHeader: FunctionComponent<Props> = ({
  conversation,
  onBack,
  onMarkResolved,
  showAdminActions = true,
  viewerRole = 'admin',
  conversationMenu,
}) => {
  const { t } = useInternshipInboxCopy();
  const isStudentDesk = conversation.entityType === 'student_desk';
  const supportStatus = visibleSupportStatus(conversation, viewerRole);

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
              url={conversation.avatarUrl}
              name={conversation.displayName}
              email={conversation.email}
              initials={conversation.initials}
              size="header"
            />
            <div className="isi-chat-header-title-row">
              <h2 className="isi-chat-name truncate">{conversation.displayName}</h2>
              {supportStatus ? (
                <PlatformDeskSupportStatusBadge
                  status={supportStatus}
                  viewerRole={viewerRole}
                  inline
                />
              ) : null}
            </div>
          </div>
          {conversation.email ? (
            <p className="isi-chat-email truncate">{conversation.email}</p>
          ) : null}
          <p className="isi-chat-meta truncate">
            {isStudentDesk && conversation.program !== '—' ? conversation.program : null}
            {isStudentDesk && conversation.className !== '—' ? (
              <>
                {conversation.program !== '—' ? (
                  <span className="isi-chat-meta-sep" aria-hidden>
                    {' '}
                    ·{' '}
                  </span>
                ) : null}
                {conversation.className}
              </>
            ) : null}
            {!isStudentDesk && conversation.roleLabel ? <>{conversation.roleLabel}</> : null}
          </p>
        </div>
      </div>

      <div className="isi-chat-actions">
        {showAdminActions && !conversation.resolved ? (
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

export default PlatformDeskChatHeader;
