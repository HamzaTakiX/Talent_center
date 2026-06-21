import { FunctionComponent, useEffect, useRef, useState } from 'react';
import {
  Archive,
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

type Props = {
  conversation: InternshipConversation;
  onBack?: () => void;
  onViewStudent: () => void;
  onViewApplication: () => void;
  onViewOffer: () => void;
  onMarkResolved: () => void;
  onArchive: () => void;
};

const InternshipChatHeader: FunctionComponent<Props> = ({
  conversation,
  onBack,
  onViewStudent,
  onViewApplication,
  onViewOffer,
  onMarkResolved,
  onArchive,
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
        <div className="isi-avatar isi-avatar--header">{conversation.studentInitials}</div>
        <div className="min-w-0">
          <h2 className="isi-chat-name truncate">{conversation.studentName}</h2>
          <p className="isi-chat-meta truncate">
            {conversation.program}
            {conversation.className !== '—' ? ` · ${conversation.className}` : ''}
            <span className="isi-chat-meta-sep" aria-hidden> · </span>
            {conversation.offerTitle}
            <span className="isi-chat-meta-sep" aria-hidden> · </span>
            {conversation.company}
            <span className="isi-chat-meta-sep" aria-hidden> · </span>
            {conversation.applicationStatus}
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
        <button type="button" onClick={onArchive} className="isi-header-btn">
          <Archive className="size-4" />
          <span>{t('archive')}</span>
        </button>
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
              <button type="button" role="menuitem" onClick={() => { onViewStudent(); setMenuOpen(false); }}>
                <User className="size-4" />
                {t('viewStudent')}
              </button>
              <button type="button" role="menuitem" onClick={() => { onViewApplication(); setMenuOpen(false); }}>
                <FileText className="size-4" />
                {t('viewApplication')}
              </button>
              <button type="button" role="menuitem" onClick={() => { onViewOffer(); setMenuOpen(false); }}>
                <Briefcase className="size-4" />
                {t('viewOffer')}
              </button>
              <button type="button" role="menuitem" onClick={() => { onViewOffer(); setMenuOpen(false); }}>
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
