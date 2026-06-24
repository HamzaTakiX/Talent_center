import { FunctionComponent } from 'react';
import {
  CircleDot,
  ChevronRight,
  Mail,
  Shield,
  User,
} from 'lucide-react';
import InternshipInspectorRow from '../../offres-stage/chat/components/InternshipInspectorRow';
import InternshipStudentAvatar from '../../offres-stage/chat/components/InternshipStudentAvatar';
import type { DeskConversationRecord } from '../../shared/admin-support-inbox/adapters/mapDeskChatData';

type Props = {
  conversation: DeskConversationRecord;
  onOpenAdministrator?: () => void;
};

const ICON_SM = { className: 'size-3.5', strokeWidth: 2 };

function resolveAdminName(conversation: DeskConversationRecord): string {
  if (conversation.displayName?.trim()) return conversation.displayName.trim();
  return conversation.title.trim();
}

const AdminDeskContextPanel: FunctionComponent<Props> = ({
  conversation,
  onOpenAdministrator,
}) => {
  const adminName = resolveAdminName(conversation);
  const canViewAdmin = Boolean(onOpenAdministrator && conversation.userId);

  return (
    <aside className="isi-inspector">
      <header className="isi-inspector-head">
        <span className="isi-inspector-head-title">Contexte administrateur</span>
        {conversation.roleLabel ? (
          <span className="isi-inspector-head-badge">{conversation.roleLabel}</span>
        ) : null}
      </header>

      <div className="isi-inspector-section-title">Administrateur</div>
      <div className="isi-inspector-student-card">
        <InternshipStudentAvatar
          url={conversation.avatarUrl}
          name={adminName}
          email={conversation.email}
          initials={conversation.avatarInitials}
          size="inspector"
        />
        <div className="isi-inspector-student-card-copy min-w-0">
          <p className="isi-inspector-student-card-name">{adminName}</p>
          {conversation.email ? (
            <p className="isi-inspector-student-card-email">{conversation.email}</p>
          ) : null}
        </div>
      </div>

      <div className="isi-inspector-fields">
        <InternshipInspectorRow icon={<User {...ICON_SM} />} label="Nom">
          <span>{adminName}</span>
        </InternshipInspectorRow>
        {conversation.roleLabel ? (
          <InternshipInspectorRow icon={<Shield {...ICON_SM} />} label="Rôle">
            <span>{conversation.roleLabel}</span>
          </InternshipInspectorRow>
        ) : null}
        {conversation.email ? (
          <InternshipInspectorRow icon={<Mail {...ICON_SM} />} label="Email">
            <span>{conversation.email}</span>
          </InternshipInspectorRow>
        ) : null}
        {conversation.entityLabel ? (
          <InternshipInspectorRow icon={<CircleDot {...ICON_SM} />} label="Dossier">
            <span>{conversation.entityLabel}</span>
          </InternshipInspectorRow>
        ) : null}
        {conversation.workflowStatus ? (
          <InternshipInspectorRow icon={<CircleDot {...ICON_SM} />} label="Workflow">
            <span>{conversation.workflowStatus}</span>
          </InternshipInspectorRow>
        ) : null}
        {conversation.contextKind ? (
          <InternshipInspectorRow icon={<CircleDot {...ICON_SM} />} label="Type">
            <span>{conversation.contextKind}</span>
          </InternshipInspectorRow>
        ) : null}
        {conversation.urgency && conversation.urgency !== 'NONE' ? (
          <InternshipInspectorRow icon={<CircleDot {...ICON_SM} />} label="Urgence">
            <span>{conversation.urgency}</span>
          </InternshipInspectorRow>
        ) : null}
      </div>

      {onOpenAdministrator ? (
        <>
          <div className="isi-inspector-divider" />
          <div className="isi-inspector-actions">
            <span className="isi-inspector-actions-title">Actions rapides</span>
            <button
              type="button"
              className="isi-inspector-action isi-inspector-action--primary"
              onClick={onOpenAdministrator}
              disabled={!canViewAdmin}
            >
              <span className="isi-inspector-action-icon">
                <Shield {...ICON_SM} />
              </span>
              <span className="isi-inspector-action-text">Voir l&apos;administrateur</span>
              <ChevronRight className="isi-inspector-action-chevron size-3.5" />
            </button>
          </div>
        </>
      ) : null}
    </aside>
  );
};

export default AdminDeskContextPanel;
