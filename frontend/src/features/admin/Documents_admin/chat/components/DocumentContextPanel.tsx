import { FunctionComponent, type ReactNode } from 'react';
import {
  ChevronRight,
  CircleDot,
  Clock,
  ExternalLink,
  FileText,
  GitBranch,
  Hash,
  Package,
  User,
} from 'lucide-react';
import type { DocumentConversation, DocumentRequestStatus } from '../types/documentChatTypes';

type Props = {
  conversation: DocumentConversation | null;
  onOpenRequest: () => void;
  onOpenStudent: () => void;
  onOpenWorkflow: () => void;
};

const STATUS_LABEL: Record<DocumentRequestStatus, string> = {
  Submitted: 'Soumise',
  'Under Review': 'En vérification',
  Validated: 'Validée',
  Rejected: 'Refusée',
  'Correction Required': 'Correction requise',
  Pending: 'En attente',
};

function InspectorRow({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="isi-inspector-row">
      <div className="isi-inspector-row-icon" aria-hidden>
        {icon}
      </div>
      <div className="isi-inspector-row-content">
        <span className="isi-inspector-row-label">{label}</span>
        <div className="isi-inspector-row-value">{children}</div>
      </div>
    </div>
  );
}

function statusClass(status: DocumentRequestStatus): string {
  const map: Record<DocumentRequestStatus, string> = {
    Submitted: 'submitted',
    'Under Review': 'under-review',
    Validated: 'validated',
    Rejected: 'rejected',
    'Correction Required': 'correction-required',
    Pending: 'pending',
  };
  return `isi-status-pill--${map[status]}`;
}

const DocumentContextPanel: FunctionComponent<Props> = ({
  conversation,
  onOpenRequest,
  onOpenStudent,
  onOpenWorkflow,
}) => {
  if (!conversation) return null;

  const status = conversation.requestStatus;

  return (
    <aside className="isi-inspector">
      <header className="isi-inspector-head">
        <span className="isi-inspector-head-title">Détails</span>
        <span className="isi-inspector-head-badge">{conversation.documentCategory}</span>
      </header>

      <div className="isi-inspector-fields">
        <InspectorRow icon={<FileText className="size-3.5" />} label="Document">
          <span>{conversation.documentTitle}</span>
        </InspectorRow>

        <InspectorRow icon={<Hash className="size-3.5" />} label="Référence">
          <span>{conversation.reference}</span>
        </InspectorRow>

        <InspectorRow icon={<CircleDot className="size-3.5" />} label="Statut">
          <span className={`isi-status-pill ${statusClass(status)}`}>
            {STATUS_LABEL[status]}
          </span>
        </InspectorRow>

        <InspectorRow icon={<Clock className="size-3.5" />} label="Date de soumission">
          <span>{conversation.submittedDate}</span>
        </InspectorRow>

        <InspectorRow icon={<Clock className="size-3.5" />} label="Échéance SLA">
          <span>{conversation.slaDeadline}</span>
        </InspectorRow>

        <InspectorRow icon={<Package className="size-3.5" />} label="Livraison">
          <span>{conversation.deliveryMethod}</span>
        </InspectorRow>
      </div>

      <div className="isi-inspector-divider" />

      <div className="isi-inspector-actions">
        <span className="isi-inspector-actions-title">Actions rapides</span>
        <button type="button" onClick={onOpenRequest} className="isi-inspector-action">
          <span className="isi-inspector-action-icon">
            <ExternalLink className="size-3.5" />
          </span>
          <span className="isi-inspector-action-text">Voir la demande</span>
          <ChevronRight className="isi-inspector-action-chevron size-3.5" />
        </button>
        <button type="button" onClick={onOpenWorkflow} className="isi-inspector-action">
          <span className="isi-inspector-action-icon">
            <GitBranch className="size-3.5" />
          </span>
          <span className="isi-inspector-action-text">Workflow</span>
          <ChevronRight className="isi-inspector-action-chevron size-3.5" />
        </button>
        <button type="button" onClick={onOpenStudent} className="isi-inspector-action">
          <span className="isi-inspector-action-icon">
            <User className="size-3.5" />
          </span>
          <span className="isi-inspector-action-text">Profil étudiant</span>
          <ChevronRight className="isi-inspector-action-chevron size-3.5" />
        </button>
      </div>
    </aside>
  );
};

export default DocumentContextPanel;
