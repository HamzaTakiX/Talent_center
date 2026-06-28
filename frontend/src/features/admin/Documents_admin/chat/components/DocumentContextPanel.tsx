import { FunctionComponent } from 'react';
import {
  ChevronRight,
  CircleDot,
  Clock,
  ExternalLink,
  FileText,
  Hash,
  Tag,
  User,
} from 'lucide-react';
import InternshipInspectorRow from '../../../offres-stage/chat/components/InternshipInspectorRow';
import DocumentServiceChatIcon from '../../components/service-catalog/DocumentServiceChatIcon';
import type { DocumentConversation, DocumentRequestStatus } from '../types/documentChatTypes';

type Props = {
  conversation: DocumentConversation | null;
  onOpenService: () => void;
  onOpenStudent: () => void;
};

const ICON = { className: 'size-4', strokeWidth: 2.25 };

const STATUS_LABEL: Record<DocumentRequestStatus, string> = {
  Submitted: 'Soumise',
  'Under Review': 'En vérification',
  Validated: 'Validée',
  Rejected: 'Refusée',
  'Correction Required': 'Correction requise',
  Pending: 'En attente',
};

const DocumentContextPanel: FunctionComponent<Props> = ({
  conversation,
  onOpenService,
  onOpenStudent,
}) => {
  if (!conversation) return null;

  const status = conversation.requestStatus;

  return (
    <aside className="isi-inspector">
      <header className="isi-inspector-head">
        <span className="isi-inspector-head-title">Contexte</span>
      </header>

      <div className="isi-inspector-section-title">Document</div>
      <div className="isi-inspector-offer-card">
        <DocumentServiceChatIcon
          iconKey={conversation.iconKey}
          colorTheme={conversation.colorTheme}
          size="panel"
        />
        <div className="isi-inspector-offer-card-copy min-w-0">
          <p className="isi-inspector-offer-card-title">{conversation.documentTitle}</p>
        </div>
      </div>

      <div className="isi-inspector-fields isi-inspector-fields--card">
        <InternshipInspectorRow icon={<FileText {...ICON} />} label="Titre">
          <span>{conversation.documentTitle}</span>
        </InternshipInspectorRow>
        <InternshipInspectorRow icon={<Hash {...ICON} />} label="Code">
          <span>{conversation.serviceCode || conversation.reference}</span>
        </InternshipInspectorRow>
        <InternshipInspectorRow icon={<Tag {...ICON} />} label="Catégorie">
          <span>{conversation.documentCategory}</span>
        </InternshipInspectorRow>
        <InternshipInspectorRow icon={<CircleDot {...ICON} />} label="Statut">
          <span className="isi-status-pill">{STATUS_LABEL[status]}</span>
        </InternshipInspectorRow>
        <InternshipInspectorRow icon={<Clock {...ICON} />} label="Délai SLA">
          <span>{conversation.slaDeadline}</span>
        </InternshipInspectorRow>
      </div>

      <div className="isi-inspector-divider" />

      <div className="isi-inspector-actions">
        <span className="isi-inspector-actions-title">Actions rapides</span>
        <button
          type="button"
          className="isi-inspector-action isi-inspector-action--primary"
          onClick={onOpenService}
          disabled={!conversation.serviceId}
        >
          <span className="isi-inspector-action-icon">
            <ExternalLink {...ICON} />
          </span>
          <span className="isi-inspector-action-text">Voir le service</span>
          <ChevronRight className="isi-inspector-action-chevron size-4" strokeWidth={2.25} />
        </button>
        <button type="button" className="isi-inspector-action" onClick={onOpenStudent}>
          <span className="isi-inspector-action-icon">
            <User {...ICON} />
          </span>
          <span className="isi-inspector-action-text">Profil étudiant</span>
          <ChevronRight className="isi-inspector-action-chevron size-3.5" />
        </button>
      </div>
    </aside>
  );
};

export default DocumentContextPanel;
