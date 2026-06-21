import { FunctionComponent } from 'react';
import type { DeskConversationRecord } from '../../../shared/admin-support-inbox/adapters/mapDeskChatData';
import SupportContextPanel from '../../../shared/admin-support-inbox/components/SupportContextPanel';

interface Props {
  conversation: DeskConversationRecord;
}

const URGENCY_LABEL: Record<string, string> = {
  NONE: 'Aucune',
  NORMAL: 'Normale',
  HIGH: 'Élevée',
  CRITICAL: 'Critique',
};

const EncadrantSupervisionContextPanel: FunctionComponent<Props> = ({ conversation }) => (
  <SupportContextPanel
    title="Contexte supervision"
    badge={
      conversation.urgency && conversation.urgency !== 'NONE' ? (
        <span className="isi-status-pill isi-status-pill--urgent">
          {URGENCY_LABEL[conversation.urgency] ?? conversation.urgency}
        </span>
      ) : null
    }
  >
    {conversation.entityLabel ? (
      <div className="isi-inspector-row">
        <div className="isi-inspector-row-content">
          <span className="isi-inspector-row-label">Dossier</span>
          <span className="isi-inspector-row-value">{conversation.entityLabel}</span>
        </div>
      </div>
    ) : null}
    {conversation.workflowStatus ? (
      <div className="isi-inspector-row">
        <div className="isi-inspector-row-content">
          <span className="isi-inspector-row-label">Workflow</span>
          <span className="isi-inspector-row-value">{conversation.workflowStatus}</span>
        </div>
      </div>
    ) : null}
    {conversation.contextKind ? (
      <div className="isi-inspector-row">
        <div className="isi-inspector-row-content">
          <span className="isi-inspector-row-label">Type</span>
          <span className="isi-inspector-row-value">{conversation.contextKind}</span>
        </div>
      </div>
    ) : null}
    {!conversation.entityLabel && !conversation.workflowStatus && !conversation.contextKind ? (
      <p className="isi-inspector-empty text-sm text-[var(--admin-text-muted)]">
        Sélectionnez une conversation pour afficher le contexte de supervision.
      </p>
    ) : null}
  </SupportContextPanel>
);

export default EncadrantSupervisionContextPanel;
