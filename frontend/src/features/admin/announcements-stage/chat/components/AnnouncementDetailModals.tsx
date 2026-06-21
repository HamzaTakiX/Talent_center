import { FunctionComponent, type ReactNode } from 'react';
import { X } from 'lucide-react';
import type { AnnouncementConversation } from '../types/announcementChatTypes';

type ModalShellProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
};

const ModalShell: FunctionComponent<ModalShellProps> = ({ open, title, onClose, children }) => {
  if (!open) return null;
  return (
    <div className="isi-modal-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="isi-modal" onClick={(e) => e.stopPropagation()}>
        <div className="isi-modal-header">
          <h2 className="isi-modal-title">{title}</h2>
          <button type="button" onClick={onClose} className="isi-icon-btn" aria-label="Fermer">
            <X className="size-4" />
          </button>
        </div>
        <div className="isi-modal-body">{children}</div>
      </div>
    </div>
  );
};

type Props = {
  conversation: AnnouncementConversation | null;
  announcementOpen: boolean;
  studentOpen: boolean;
  audienceOpen: boolean;
  onCloseAnnouncement: () => void;
  onCloseStudent: () => void;
  onCloseAudience: () => void;
};

export const AnnouncementDetailModals: FunctionComponent<Props> = ({
  conversation,
  announcementOpen,
  studentOpen,
  audienceOpen,
  onCloseAnnouncement,
  onCloseStudent,
  onCloseAudience,
}) => {
  if (!conversation) return null;

  return (
    <>
      <ModalShell open={announcementOpen} title="Détails de l'annonce" onClose={onCloseAnnouncement}>
        <dl className="isi-modal-dl">
          <div><dt>Titre</dt><dd>{conversation.announcementTitle}</dd></div>
          <div><dt>Catégorie</dt><dd>{conversation.category}</dd></div>
          <div><dt>Statut</dt><dd>{conversation.publishStatus}</dd></div>
          <div><dt>Priorité</dt><dd>{conversation.priority}</dd></div>
          <div><dt>Publication</dt><dd>{conversation.publishDate}</dd></div>
          <div><dt>Expiration</dt><dd>{conversation.expiryDate}</dd></div>
          {conversation.announcementBody ? (
            <div><dt>Contenu</dt><dd>{conversation.announcementBody}</dd></div>
          ) : null}
          {conversation.announcementNotes ? (
            <div><dt>Notes</dt><dd>{conversation.announcementNotes}</dd></div>
          ) : null}
        </dl>
      </ModalShell>

      <ModalShell open={audienceOpen} title="Audience ciblée" onClose={onCloseAudience}>
        <dl className="isi-modal-dl">
          <div><dt>Portée</dt><dd>{conversation.audience}</dd></div>
          <div><dt>Catégorie</dt><dd>{conversation.category}</dd></div>
          <div><dt>Priorité</dt><dd>{conversation.priority}</dd></div>
        </dl>
      </ModalShell>

      <ModalShell open={studentOpen} title="Fiche étudiant" onClose={onCloseStudent}>
        <dl className="isi-modal-dl">
          <div><dt>Nom</dt><dd>{conversation.studentName}</dd></div>
          {conversation.studentEmail ? (
            <div><dt>Email</dt><dd>{conversation.studentEmail}</dd></div>
          ) : null}
        </dl>
      </ModalShell>
    </>
  );
};
