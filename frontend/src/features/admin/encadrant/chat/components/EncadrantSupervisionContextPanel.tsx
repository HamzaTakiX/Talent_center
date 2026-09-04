import { FunctionComponent } from 'react';
import {
  AlertTriangle,
  ChevronRight,
  CircleDot,
  FileText,
  Mail,
  Shield,
  Tag,
  User,
  Users,
  Workflow,
} from 'lucide-react';
import InternshipInspectorRow from '../../../offres-stage/chat/components/InternshipInspectorRow';
import InternshipStudentAvatar from '../../../offres-stage/chat/components/InternshipStudentAvatar';
import PlatformDeskSupportStatusBadge from '../../../shared/platform-desk-chat/components/PlatformDeskSupportStatusBadge';
import { visibleSupportStatus } from '../../../shared/platform-desk-chat/utils/platformDeskSupportStatus';
import type { PlatformDeskViewerRole } from '../../../shared/platform-desk-chat/types/platformDeskChatTypes';
import type { DeskConversationRecord } from '../../../shared/admin-support-inbox/adapters/mapDeskChatData';

interface Props {
  conversation: DeskConversationRecord;
  onOpenEncadrant?: () => void;
  /** Admin sees workload / accepting students; student does not. */
  viewerRole?: PlatformDeskViewerRole;
}

const ICON_SM = { className: 'size-3.5', strokeWidth: 2 };

const URGENCY_LABEL: Record<string, string> = {
  NONE: 'Aucune',
  NORMAL: 'Normale',
  HIGH: 'Élevée',
  CRITICAL: 'Critique',
};

const URGENCY_TONE: Record<string, string> = {
  NONE: 'neutral',
  NORMAL: 'info',
  HIGH: 'warning',
  CRITICAL: 'danger',
};

const CONTEXT_KIND_LABEL: Record<string, string> = {
  workflow_thread: 'Fil de workflow',
  direct_message: 'Message direct',
  direct: 'Message direct',
};

const WORKFLOW_STATUS_LABEL: Record<string, string> = {
  internship_followup: 'Suivi de stage',
  report_review: 'Revue de rapport',
  meeting_followup: 'Suivi de réunion',
  OPEN: 'Ouvert',
  RESOLVED: 'Résolu',
};

function humanize(value: string): string {
  const spaced = value.replace(/[_-]+/g, ' ').trim();
  if (!spaced) return value;
  return spaced.charAt(0).toUpperCase() + spaced.slice(1).toLowerCase();
}

function resolveEncadrantName(conversation: DeskConversationRecord): string {
  if (conversation.displayName?.trim()) return conversation.displayName.trim();
  const title = conversation.title.trim();
  const separator = title.indexOf('•');
  if (separator > 0) return title.slice(0, separator).trim();
  return title;
}

function isPresent(value?: string): boolean {
  return Boolean(value && value.trim() && value.trim() !== '—');
}

function formatWorkload(current?: number, max?: number): string | null {
  if (current == null && max == null) return null;
  const load = current ?? 0;
  if (!max || max <= 0) return `${load} étudiant(s)`;
  return `${load} / ${max} étudiant(s)`;
}

const EncadrantSupervisionContextPanel: FunctionComponent<Props> = ({
  conversation,
  onOpenEncadrant,
  viewerRole = 'admin',
}) => {
  const isStudentViewer = viewerRole === 'student';
  const isEncadrantViewer = viewerRole === 'encadrant';
  const peerName = resolveEncadrantName(conversation);
  const peerSectionTitle = isEncadrantViewer ? 'Étudiant' : 'Encadrant';
  const canViewEncadrant = Boolean(
    onOpenEncadrant && (conversation.encadrantProfileId || conversation.userId),
  );
  const supportStatus = visibleSupportStatus(conversation, viewerRole);
  const urgency = conversation.urgency;
  const hasUrgency = Boolean(urgency && urgency !== 'NONE');
  const specialization = (conversation.specializationDomains ?? []).join(', ');
  const supervisedTypes = (conversation.supervisedInternshipTypes ?? []).join(', ');
  const workload = formatWorkload(conversation.currentStudents, conversation.maxStudents);
  const hasSupervisionContext =
    isPresent(conversation.entityLabel) ||
    isPresent(conversation.workflowStatus) ||
    isPresent(conversation.contextKind) ||
    hasUrgency ||
    isPresent(specialization) ||
    isPresent(supervisedTypes) ||
    Boolean(workload);

  return (
    <aside className="isi-inspector">
      <header className="isi-inspector-head">
        <span className="isi-inspector-head-title">Contexte supervision</span>
        {hasUrgency && urgency ? (
          <span className={`isi-status-pill isi-status-pill--${URGENCY_TONE[urgency] ?? 'neutral'}`}>
            {URGENCY_LABEL[urgency] ?? humanize(urgency)}
          </span>
        ) : null}
      </header>

      <div className="isi-inspector-section-title">{peerSectionTitle}</div>
      <div className="isi-inspector-student-card">
        <InternshipStudentAvatar
          url={conversation.avatarUrl}
          name={peerName}
          email={conversation.email}
          initials={conversation.avatarInitials}
          size="inspector"
        />
        <div className="isi-inspector-student-card-copy min-w-0">
          <p className="isi-inspector-student-card-name">{peerName}</p>
          {isPresent(conversation.email) ? (
            <p className="isi-inspector-student-card-email">{conversation.email}</p>
          ) : isPresent(conversation.roleLabel) ? (
            <p className="isi-inspector-student-card-email">{conversation.roleLabel}</p>
          ) : null}
        </div>
      </div>

      <div className="isi-inspector-fields">
        <InternshipInspectorRow icon={<User {...ICON_SM} />} label="Nom">
          <span>{peerName}</span>
        </InternshipInspectorRow>
        {isPresent(conversation.roleLabel) ? (
          <InternshipInspectorRow icon={<Shield {...ICON_SM} />} label="Rôle">
            <span>{conversation.roleLabel}</span>
          </InternshipInspectorRow>
        ) : null}
        {isPresent(conversation.program) ? (
          <InternshipInspectorRow icon={<CircleDot {...ICON_SM} />} label="Programme(s)">
            <span>{conversation.program}</span>
          </InternshipInspectorRow>
        ) : null}
        {isPresent(conversation.academicLevel) ? (
          <InternshipInspectorRow icon={<CircleDot {...ICON_SM} />} label="Niveau(x)">
            <span>{conversation.academicLevel}</span>
          </InternshipInspectorRow>
        ) : null}
        {!isStudentViewer && isPresent(conversation.className) ? (
          <InternshipInspectorRow icon={<CircleDot {...ICON_SM} />} label="Classe(s)">
            <span>{conversation.className}</span>
          </InternshipInspectorRow>
        ) : null}
        {!isEncadrantViewer && isPresent(specialization) ? (
          <InternshipInspectorRow icon={<Tag {...ICON_SM} />} label="Spécialisation">
            <span>{specialization}</span>
          </InternshipInspectorRow>
        ) : null}
        {!isEncadrantViewer && isPresent(supervisedTypes) ? (
          <InternshipInspectorRow icon={<FileText {...ICON_SM} />} label="Types de stage">
            <span>{supervisedTypes}</span>
          </InternshipInspectorRow>
        ) : null}
        {!isStudentViewer && !isEncadrantViewer && workload ? (
          <InternshipInspectorRow icon={<Users {...ICON_SM} />} label="Charge">
            <span>{workload}</span>
          </InternshipInspectorRow>
        ) : null}
        {!isStudentViewer && !isEncadrantViewer && conversation.acceptingStudents != null ? (
          <InternshipInspectorRow icon={<CircleDot {...ICON_SM} />} label="Accepte des étudiants">
            <span>{conversation.acceptingStudents ? 'Oui' : 'Non'}</span>
          </InternshipInspectorRow>
        ) : null}
        {!isEncadrantViewer && conversation.isEncadrantActive != null ? (
          <InternshipInspectorRow icon={<CircleDot {...ICON_SM} />} label="Statut compte">
            <span>{conversation.isEncadrantActive ? 'Actif' : 'Inactif'}</span>
          </InternshipInspectorRow>
        ) : null}
        {isPresent(conversation.email) ? (
          <InternshipInspectorRow icon={<Mail {...ICON_SM} />} label="Email">
            <span>{conversation.email}</span>
          </InternshipInspectorRow>
        ) : null}
        {supportStatus ? (
          <InternshipInspectorRow icon={<CircleDot {...ICON_SM} />} label="Statut conversation">
            <PlatformDeskSupportStatusBadge status={supportStatus} viewerRole={viewerRole} inline />
          </InternshipInspectorRow>
        ) : null}
      </div>

      {!isStudentViewer ? (
        <>
          <div className="isi-inspector-divider" />
          <div className="isi-inspector-section-title">Supervision</div>
          {hasSupervisionContext ? (
            <div className="isi-inspector-fields">
              {isPresent(conversation.entityLabel) ? (
                <InternshipInspectorRow icon={<FileText {...ICON_SM} />} label="Dossier">
                  <span>{conversation.entityLabel}</span>
                </InternshipInspectorRow>
              ) : null}
              {isPresent(conversation.workflowStatus) && conversation.workflowStatus ? (
                <InternshipInspectorRow icon={<Workflow {...ICON_SM} />} label="Workflow">
                  <span>
                    {WORKFLOW_STATUS_LABEL[conversation.workflowStatus] ??
                      humanize(conversation.workflowStatus)}
                  </span>
                </InternshipInspectorRow>
              ) : null}
              {isPresent(conversation.contextKind) && conversation.contextKind ? (
                <InternshipInspectorRow icon={<Tag {...ICON_SM} />} label="Type">
                  <span>
                    {CONTEXT_KIND_LABEL[conversation.contextKind] ??
                      humanize(conversation.contextKind)}
                  </span>
                </InternshipInspectorRow>
              ) : null}
              {hasUrgency && urgency ? (
                <InternshipInspectorRow icon={<AlertTriangle {...ICON_SM} />} label="Urgence">
                  <span
                    className={`isi-status-pill isi-status-pill--${
                      URGENCY_TONE[urgency] ?? 'neutral'
                    } isi-status-pill--inline`}
                  >
                    {URGENCY_LABEL[urgency] ?? humanize(urgency)}
                  </span>
                </InternshipInspectorRow>
              ) : null}
            </div>
          ) : (
            <p className="isi-inspector-empty text-sm">
              Aucun contexte de supervision rattaché à cette conversation.
            </p>
          )}
        </>
      ) : null}

      {!isStudentViewer && !isEncadrantViewer && onOpenEncadrant ? (
        <>
          <div className="isi-inspector-divider" />
          <div className="isi-inspector-actions">
            <span className="isi-inspector-actions-title">Actions rapides</span>
            <button
              type="button"
              className="isi-inspector-action isi-inspector-action--primary"
              onClick={onOpenEncadrant}
              disabled={!canViewEncadrant}
            >
              <span className="isi-inspector-action-icon">
                <User {...ICON_SM} />
              </span>
              <span className="isi-inspector-action-text">Profil encadrant</span>
              <ChevronRight className="isi-inspector-action-chevron size-3.5" />
            </button>
          </div>
        </>
      ) : null}
    </aside>
  );
};

export default EncadrantSupervisionContextPanel;
