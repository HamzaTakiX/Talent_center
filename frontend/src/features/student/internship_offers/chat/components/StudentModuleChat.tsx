import { FunctionComponent } from 'react';
import AdminModuleChat from '../../../../admin/shared/admin-module-chat/AdminModuleChat';
import type { AdminChatMessage, AdminChatParticipant } from '../../../../admin/shared/admin-module-chat/adminChatTypes';
import StudentLayout from '../../../components/StudentLayout';
import type { ChatMessage, ChatParticipant } from '../types';

export interface StudentModuleChatProps {
  participantsSeed: ChatParticipant[];
  initialMessages: Record<string, ChatMessage[]>;
  participantSubtitle?: string;
  avatarClassByParticipantId?: Record<string, string>;
  searchPlaceholder?: string;
  composerPlaceholder?: string;
  emptyConversationLabel?: string;
}

/** Chat module étudiant — UI admin premium, shell StudentLayout. */
const StudentModuleChat: FunctionComponent<StudentModuleChatProps> = ({
  participantsSeed,
  initialMessages,
  participantSubtitle,
  avatarClassByParticipantId,
  searchPlaceholder,
  composerPlaceholder,
  emptyConversationLabel = 'Sélectionnez une conversation',
}) => (
  <AdminModuleChat
    Layout={StudentLayout}
    participantsSeed={participantsSeed as AdminChatParticipant[]}
    initialMessages={initialMessages as Record<string, AdminChatMessage[]>}
    participantSubtitle={participantSubtitle}
    avatarClassByParticipantId={avatarClassByParticipantId}
    searchPlaceholder={searchPlaceholder}
    composerPlaceholder={composerPlaceholder}
    emptyConversationLabel={emptyConversationLabel}
  />
);

export default StudentModuleChat;
