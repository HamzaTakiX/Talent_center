import { FunctionComponent, useEffect, useRef, useState } from 'react';
import {
  Archive,
  ArchiveRestore,
  ArrowLeft,
  CheckCircle2,
  Megaphone,
  MoreHorizontal,
  User,
} from 'lucide-react';
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
  onOpenAnnouncement: () => void;
  onOpenStudent: () => void;
  onMarkResolved: () => void;
  onArchive: () => void;
  onUnarchive: () => void;
};

const AnnouncementChatHeader: FunctionComponent<Props> = ({
  conversation,
  onBack,
  onOpenAnnouncement,
  onOpenStudent,
  onMarkResolved,
  onArchive,
  onUnarchive,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { t } = useInternshipInboxCopy();

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
        {conversation.archived ? (
          <button type="button" onClick={onUnarchive} className="isi-header-btn">
            <ArchiveRestore className="size-4" />
            <span>{t('unarchive')}</span>
          </button>
        ) : (
          <button type="button" onClick={onArchive} className="isi-header-btn">
            <Archive className="size-4" />
            <span>{t('archive')}</span>
          </button>
        )}
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
                  onOpenStudent();
                  setMenuOpen(false);
                }}
                disabled={!conversation.studentUserId}
              >
                <User className="size-4" />
                {t('viewStudent')}
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  onOpenAnnouncement();
                  setMenuOpen(false);
                }}
                disabled={!conversation.announcementUuid}
              >
                <Megaphone className="size-4" />
                Voir l&apos;annonce
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
};

export default AnnouncementChatHeader;
