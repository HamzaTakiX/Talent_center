import { FunctionComponent } from 'react';
import {
  CircleDot,
  ChevronRight,
  Mail,
  Shield,
  User,
} from 'lucide-react';
import InternshipInspectorRow from '../../../offres-stage/chat/components/InternshipInspectorRow';
import InternshipStudentAvatar from '../../../offres-stage/chat/components/InternshipStudentAvatar';
import type { DeskConversationRecord } from '../../../shared/admin-support-inbox/adapters/mapDeskChatData';

type Props = {
  conversation: DeskConversationRecord;
  onOpenStudent?: () => void;
};

const ICON_SM = { className: 'size-3.5', strokeWidth: 2 };

function resolveStudentName(conversation: DeskConversationRecord): string {
  if (conversation.displayName?.trim()) return conversation.displayName.trim();
  const title = conversation.title.trim();
  const separator = title.indexOf('•');
  if (separator > 0) return title.slice(0, separator).trim();
  return title;
}

const StudentDeskContextPanel: FunctionComponent<Props> = ({ conversation, onOpenStudent }) => {
  const studentName = resolveStudentName(conversation);
  const canViewStudent = Boolean(onOpenStudent && conversation.userId);

  return (
    <aside className="isi-inspector">
      <header className="isi-inspector-head">
        <span className="isi-inspector-head-title">Contexte étudiant</span>
        {conversation.program && conversation.program !== '—' ? (
          <span className="isi-inspector-head-badge">{conversation.program}</span>
        ) : null}
      </header>

      <div className="isi-inspector-section-title">Étudiant</div>
      <div className="isi-inspector-student-card">
        <InternshipStudentAvatar
          url={conversation.avatarUrl}
          name={studentName}
          email={conversation.email}
          initials={conversation.avatarInitials}
          size="inspector"
        />
        <div className="isi-inspector-student-card-copy min-w-0">
          <p className="isi-inspector-student-card-name">{studentName}</p>
          {conversation.email ? (
            <p className="isi-inspector-student-card-email">{conversation.email}</p>
          ) : null}
        </div>
      </div>

      <div className="isi-inspector-fields">
        <InternshipInspectorRow icon={<User {...ICON_SM} />} label="Nom">
          <span>{studentName}</span>
        </InternshipInspectorRow>
        {conversation.program && conversation.program !== '—' ? (
          <InternshipInspectorRow icon={<CircleDot {...ICON_SM} />} label="Programme">
            <span>{conversation.program}</span>
          </InternshipInspectorRow>
        ) : null}
        {conversation.className && conversation.className !== '—' ? (
          <InternshipInspectorRow icon={<CircleDot {...ICON_SM} />} label="Classe">
            <span>{conversation.className}</span>
          </InternshipInspectorRow>
        ) : null}
        {conversation.academicLevel && conversation.academicLevel !== '—' ? (
          <InternshipInspectorRow icon={<CircleDot {...ICON_SM} />} label="Niveau">
            <span>{conversation.academicLevel}</span>
          </InternshipInspectorRow>
        ) : null}
        {conversation.email ? (
          <InternshipInspectorRow icon={<Mail {...ICON_SM} />} label="Email">
            <span>{conversation.email}</span>
          </InternshipInspectorRow>
        ) : null}
        {conversation.entityLabel ? (
          <InternshipInspectorRow icon={<CircleDot {...ICON_SM} />} label="Sujet">
            <span>{conversation.entityLabel}</span>
          </InternshipInspectorRow>
        ) : null}
        {conversation.workflowStatus ? (
          <InternshipInspectorRow icon={<CircleDot {...ICON_SM} />} label="Statut">
            <span>{conversation.workflowStatus}</span>
          </InternshipInspectorRow>
        ) : null}
      </div>

      {onOpenStudent ? (
        <>
          <div className="isi-inspector-divider" />
          <div className="isi-inspector-actions">
            <span className="isi-inspector-actions-title">Actions rapides</span>
            <button
              type="button"
              className="isi-inspector-action isi-inspector-action--primary"
              onClick={onOpenStudent}
              disabled={!canViewStudent}
            >
              <span className="isi-inspector-action-icon">
                <User {...ICON_SM} />
              </span>
              <span className="isi-inspector-action-text">Profil étudiant</span>
              <ChevronRight className="isi-inspector-action-chevron size-3.5" />
            </button>
          </div>
        </>
      ) : null}
    </aside>
  );
};

export default StudentDeskContextPanel;
