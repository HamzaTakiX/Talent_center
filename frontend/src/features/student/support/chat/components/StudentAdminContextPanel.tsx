import { FunctionComponent } from 'react';
import {
  CircleDot,
  Mail,
  Shield,
  User,
} from 'lucide-react';
import InternshipInspectorRow from '../../../../admin/offres-stage/chat/components/InternshipInspectorRow';
import InternshipStudentAvatar from '../../../../admin/offres-stage/chat/components/InternshipStudentAvatar';
import type { DeskConversationRecord } from '../../../../admin/shared/admin-support-inbox/adapters/mapDeskChatData';

type Props = {
  conversation: DeskConversationRecord;
};

const ICON_SM = { className: 'size-3.5', strokeWidth: 2 };

const StudentAdminContextPanel: FunctionComponent<Props> = ({ conversation }) => (
  <aside className="isi-inspector">
    <header className="isi-inspector-head">
      <span className="isi-inspector-head-title">Administrateur</span>
      {conversation.roleLabel ? (
        <span className="isi-inspector-head-badge">{conversation.roleLabel}</span>
      ) : null}
    </header>

    <div className="isi-inspector-section-title">Contact</div>
    <div className="isi-inspector-student-card">
      <InternshipStudentAvatar
        url={conversation.avatarUrl}
        name={conversation.displayName}
        email={conversation.email}
        initials={conversation.avatarInitials}
        size="inspector"
      />
      <div className="isi-inspector-student-card-copy min-w-0">
        <p className="isi-inspector-student-card-name">{conversation.displayName}</p>
        {conversation.email ? (
          <p className="isi-inspector-student-card-email">{conversation.email}</p>
        ) : null}
      </div>
    </div>

    <div className="isi-inspector-fields">
      <InternshipInspectorRow icon={<User {...ICON_SM} />} label="Nom">
        <span>{conversation.displayName}</span>
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
        <InternshipInspectorRow icon={<CircleDot {...ICON_SM} />} label="Service">
          <span>{conversation.entityLabel}</span>
        </InternshipInspectorRow>
      ) : null}
    </div>
  </aside>
);

export default StudentAdminContextPanel;
