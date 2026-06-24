import { FunctionComponent, useEffect, useRef, useState } from 'react';
import {
  Archive,
  ArchiveRestore,
  ArrowLeft,
  CheckCircle2,
  MoreHorizontal,
  Shield,
  User,
} from 'lucide-react';
import { useInternshipInboxCopy } from '../../../offres-stage/hooks/useOffersListLabels';
import InternshipStudentAvatar from '../../../offres-stage/chat/components/InternshipStudentAvatar';
import type { PlatformDeskConversation } from '../types/platformDeskChatTypes';

type Props = {
  conversation: PlatformDeskConversation;
  onBack?: () => void;
  onOpenProfile?: () => void;
  onMarkResolved: () => void;
  onArchive: () => void;
  onUnarchive: () => void;
  showAdminActions?: boolean;
};

const PlatformDeskChatHeader: FunctionComponent<Props> = ({
  conversation,
  onBack,
  onOpenProfile,
  onMarkResolved,
  onArchive,
  onUnarchive,
  showAdminActions = true,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { t } = useInternshipInboxCopy();
  const isStudentDesk = conversation.entityType === 'student_desk';

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [menuOpen]);

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
            <h2 className="isi-chat-name truncate">{conversation.displayName}</h2>
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
            {!isStudentDesk && conversation.roleLabel ? (
              <>
                {conversation.roleLabel}
              </>
            ) : null}
            {conversation.workflowStatus ? (
              <>
                <span className="isi-chat-meta-sep" aria-hidden>
                  {' '}
                  ·{' '}
                </span>
                {conversation.workflowStatus}
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
        {showAdminActions ? (
          conversation.archived ? (
            <button type="button" onClick={onUnarchive} className="isi-header-btn">
              <ArchiveRestore className="size-4" />
              <span>{t('unarchive')}</span>
            </button>
          ) : (
            <button type="button" onClick={onArchive} className="isi-header-btn">
              <Archive className="size-4" />
              <span>{t('archive')}</span>
            </button>
          )
        ) : null}
        {onOpenProfile ? (
          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="isi-icon-btn"
              aria-label={t('moreActions')}
              aria-expanded={menuOpen}
            >
              <MoreHorizontal className="size-4" />
            </button>
            {menuOpen ? (
              <div className="isi-header-menu" role="menu">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    onOpenProfile();
                    setMenuOpen(false);
                  }}
                  disabled={!conversation.userId}
                >
                  {isStudentDesk ? <User className="size-4" /> : <Shield className="size-4" />}
                  {isStudentDesk ? t('viewStudent') : "Voir l'administrateur"}
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </header>
  );
};

export default PlatformDeskChatHeader;
