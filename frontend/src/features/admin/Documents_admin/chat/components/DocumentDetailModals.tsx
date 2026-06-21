import { FunctionComponent, type ReactNode } from 'react';
import { X } from 'lucide-react';
import type { DocumentConversation } from '../types/documentChatTypes';

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
  conversation: DocumentConversation | null;
  requestOpen: boolean;
  studentOpen: boolean;
  workflowOpen: boolean;
  onCloseRequest: () => void;
  onCloseStudent: () => void;
  onCloseWorkflow: () => void;
};

export const DocumentDetailModals: FunctionComponent<Props> = ({
  conversation,
  requestOpen,
  studentOpen,
  workflowOpen,
  onCloseRequest,
  onCloseStudent,
  onCloseWorkflow,
}) => {
  if (!conversation) return null;

  return (
    <>
      <ModalShell open={requestOpen} title="Détails de la demande" onClose={onCloseRequest}>
        <dl className="isi-modal-dl">
          <div><dt>Document</dt><dd>{conversation.documentTitle}</dd></div>
          <div><dt>Référence</dt><dd>{conversation.reference}</dd></div>
          <div><dt>Catégorie</dt><dd>{conversation.documentCategory}</dd></div>
          <div><dt>Statut</dt><dd>{conversation.requestStatus}</dd></div>
          <div><dt>Priorité</dt><dd>{conversation.priority}</dd></div>
          <div><dt>Service</dt><dd>{conversation.serviceName}</dd></div>
          <div><dt>Livraison</dt><dd>{conversation.deliveryMethod}</dd></div>
          {conversation.requestNotes ? (
            <div><dt>Notes</dt><dd>{conversation.requestNotes}</dd></div>
          ) : null}
        </dl>
      </ModalShell>

      <ModalShell open={workflowOpen} title="Workflow" onClose={onCloseWorkflow}>
        <dl className="isi-modal-dl">
          <div><dt>Étape actuelle</dt><dd>{conversation.workflowStep ?? '—'}</dd></div>
          <div><dt>Statut</dt><dd>{conversation.requestStatus}</dd></div>
          <div><dt>Échéance SLA</dt><dd>{conversation.slaDeadline}</dd></div>
          <div><dt>Service responsable</dt><dd>{conversation.serviceName}</dd></div>
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
