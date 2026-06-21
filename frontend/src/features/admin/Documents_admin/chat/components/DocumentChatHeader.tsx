import { FunctionComponent, useEffect, useRef, useState } from 'react';
import {
  Archive,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  FileText,
  GitBranch,
  MoreHorizontal,
  User,
} from 'lucide-react';
import type { DocumentConversation } from '../types/documentChatTypes';

type Props = {
  conversation: DocumentConversation;
  onBack?: () => void;
  onOpenRequest: () => void;
  onOpenStudent: () => void;
  onOpenWorkflow: () => void;
  onMarkResolved: () => void;
  onArchive: () => void;
};

const DocumentChatHeader: FunctionComponent<Props> = ({
  conversation,
  onBack,
  onOpenRequest,
  onOpenStudent,
  onOpenWorkflow,
  onMarkResolved,
  onArchive,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
          <button type="button" onClick={onBack} className="isi-icon-btn lg:hidden" aria-label="Retour">
            <ArrowLeft className="size-5" />
          </button>
        ) : null}
        <div className="isi-avatar isi-avatar--header">{conversation.studentInitials}</div>
        <div className="min-w-0">
          <h2 className="isi-chat-name truncate">{conversation.studentName}</h2>
          <p className="isi-chat-meta truncate">
            {conversation.documentTitle}
            <span className="isi-chat-meta-sep" aria-hidden> · </span>
            {conversation.requestStatus}
          </p>
        </div>
      </div>

      <div className="isi-chat-actions">
        {!conversation.resolved ? (
          <button type="button" onClick={onMarkResolved} className="isi-header-btn">
            <CheckCircle2 className="size-4" />
            <span>Résoudre</span>
          </button>
        ) : null}
        <button type="button" onClick={onArchive} className="isi-header-btn">
          <Archive className="size-4" />
          <span>Archiver</span>
        </button>
        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="isi-icon-btn"
            aria-label="Plus d'actions"
            aria-expanded={menuOpen}
          >
            <MoreHorizontal className="size-4" />
          </button>
          {menuOpen ? (
            <div className="isi-header-menu" role="menu">
              <button type="button" role="menuitem" onClick={() => { onOpenRequest(); setMenuOpen(false); }}>
                <FileText className="size-4" />
                Voir la demande
              </button>
              <button type="button" role="menuitem" onClick={() => { onOpenWorkflow(); setMenuOpen(false); }}>
                <GitBranch className="size-4" />
                Workflow
              </button>
              <button type="button" role="menuitem" onClick={() => { onOpenStudent(); setMenuOpen(false); }}>
                <User className="size-4" />
                Profil étudiant
              </button>
              <button type="button" role="menuitem" onClick={() => { onOpenRequest(); setMenuOpen(false); }}>
                <ExternalLink className="size-4" />
                Ouvrir dans le module
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
};

export default DocumentChatHeader;
