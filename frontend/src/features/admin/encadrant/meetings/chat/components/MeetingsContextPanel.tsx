import { FunctionComponent } from 'react';
import { Calendar, User } from 'lucide-react';
import SupportContextPanel from '../../../../shared/admin-support-inbox/components/SupportContextPanel';
import type { MeetingConversation } from '../types/meetingsChatTypes';

interface Props {
  conversation: MeetingConversation;
}

const MeetingsContextPanel: FunctionComponent<Props> = ({ conversation }) => (
  <SupportContextPanel
    title="Détails réunion"
    badge={<span className="isi-inspector-head-badge">{conversation.meetingStatus}</span>}
  >
    <div className="isi-inspector-row">
      <span className="isi-inspector-row-label">Réunion</span>
      <span className="isi-inspector-row-value">{conversation.meetingTitle}</span>
    </div>
    <div className="isi-inspector-row">
      <span className="isi-inspector-row-label">Date</span>
      <span className="isi-inspector-row-value">{conversation.meetingDate}</span>
    </div>
    <div className="isi-inspector-row">
      <span className="isi-inspector-row-label">Encadrant</span>
      <span className="isi-inspector-row-value">{conversation.encadrantName}</span>
    </div>
    <div className="isi-inspector-row">
      <span className="isi-inspector-row-label">Étudiant</span>
      <span className="isi-inspector-row-value">{conversation.participantName}</span>
    </div>
    <div className="isi-inspector-actions mt-4">
      <button type="button" className="isi-inspector-action">
        <span className="isi-inspector-action-icon">
          <Calendar className="size-3.5" />
        </span>
        <span className="isi-inspector-action-text">Voir l’agenda</span>
      </button>
      <button type="button" className="isi-inspector-action">
        <span className="isi-inspector-action-icon">
          <User className="size-3.5" />
        </span>
        <span className="isi-inspector-action-text">Profil participant</span>
      </button>
    </div>
  </SupportContextPanel>
);

export default MeetingsContextPanel;
