import { FunctionComponent, ReactNode } from 'react';
import { ArrowLeft, CheckCircle2, Mail, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useInternshipInboxCopy } from '../../../offres-stage/hooks/useOffersListLabels';
import InternshipStudentAvatar from '../../../offres-stage/chat/components/InternshipStudentAvatar';
import type { PlatformDeskConversation, PlatformDeskViewerRole } from '../types/platformDeskChatTypes';
import PlatformDeskSupportStatusBadge from './PlatformDeskSupportStatusBadge';
import { visibleSupportStatus } from '../utils/platformDeskSupportStatus';
import { resolveStudentPlatformDeskRoleLabel } from '../../../../student/support/chat/utils/platformDeskStudentLabels';

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
  const { t: tStudent } = useTranslation();
  const isStudentDesk =
    conversation.entityType === 'student_desk' || conversation.entityType === 'student_admin_dm';
  const isEncadrantPeerThread =
    conversation.entityType === 'encadrant_desk' || conversation.entityType === 'supervision_dm';
  // Academic snapshot (filière, classe) for student peers (admin) or encadrant peers (admin/student).
  const showAcademicMeta =
    (viewerRole === 'admin' && (isStudentDesk || isEncadrantPeerThread)) ||
    (viewerRole === 'student' && conversation.entityType === 'supervision_dm');
  const supportStatus = visibleSupportStatus(conversation, viewerRole);
  const roleLabel =
    viewerRole === 'student'
      ? resolveStudentPlatformDeskRoleLabel(conversation.roleLabel, tStudent)
      : conversation.roleLabel;
  const detailIconProps = {
    className: 'isi-chat-header-detail-icon',
    strokeWidth: 2,
    'aria-hidden': true as const,
  };

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
            <p className="isi-chat-email isi-chat-header-detail truncate">
              <Mail {...detailIconProps} />
              <span className="truncate">{conversation.email}</span>
            </p>
          ) : null}
          <p className="isi-chat-meta truncate">
            {showAcademicMeta && conversation.program !== '—' ? conversation.program : null}
            {showAcademicMeta && conversation.className !== '—' && viewerRole === 'admin' ? (
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
            {!showAcademicMeta && roleLabel ? (
              <span className="isi-chat-header-detail">
                <Shield {...detailIconProps} />
                <span className="truncate">{roleLabel}</span>
              </span>
            ) : null}
            {showAcademicMeta && roleLabel && isEncadrantPeerThread ? (
              <>
                {conversation.program !== '—' ||
                (viewerRole === 'admin' && conversation.className !== '—') ? (
                  <span className="isi-chat-meta-sep" aria-hidden>
                    {' '}
                    ·{' '}
                  </span>
                ) : null}
                <span className="isi-chat-header-detail">
                  <Shield {...detailIconProps} />
                  <span className="truncate">{roleLabel}</span>
                </span>
              </>
            ) : null}
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
