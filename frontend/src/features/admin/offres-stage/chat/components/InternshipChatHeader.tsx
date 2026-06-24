import { FunctionComponent, useEffect, useRef, useState } from 'react';
import {
  Archive,
  ArchiveRestore,
  ArrowLeft,
  Briefcase,
  CheckCircle2,
  ExternalLink,
  FileText,
  MoreHorizontal,
  User,
} from 'lucide-react';
import type { InternshipConversation } from '../types/internshipChatTypes';
import { useInternshipInboxCopy } from '../../hooks/useOffersListLabels';
import InternshipStudentAvatar from './InternshipStudentAvatar';
import { conversationHasApplication } from '../utils/internshipChatDisplayUtils';

type Props = {
  conversation: InternshipConversation;
  onBack?: () => void;
  onViewStudent: () => void;
  onViewApplication: () => void;
  onViewOffer: () => void;
  onOpenOfferInModule?: () => void;
  onMarkResolved: () => void;
  onArchive: () => void;
  onUnarchive: () => void;
};

const InternshipChatHeader: FunctionComponent<Props> = ({
  conversation,
  onBack,
  onViewStudent,
  onViewApplication,
  onViewOffer,
  onOpenOfferInModule,
  onMarkResolved,
  onArchive,
  onUnarchive,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { t } = useInternshipInboxCopy();
  const hasApplication = conversationHasApplication(conversation);

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
                  onViewStudent();
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
                  onViewApplication();
                  setMenuOpen(false);
                }}
                disabled={!hasApplication || !conversation.offerUuid}
              >
                <FileText className="size-4" />
                {t('viewApplication')}
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  onViewOffer();
                  setMenuOpen(false);
                }}
                disabled={!conversation.offerUuid}
              >
                <Briefcase className="size-4" />
                {t('viewOffer')}
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  (onOpenOfferInModule ?? onViewOffer)();
                  setMenuOpen(false);
                }}
                disabled={!conversation.offerUuid}
              >
                <ExternalLink className="size-4" />
                {t('openInModule')}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
};

export default InternshipChatHeader;
