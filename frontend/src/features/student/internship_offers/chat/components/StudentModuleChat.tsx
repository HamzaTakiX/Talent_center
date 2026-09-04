import { FunctionComponent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import AdminModuleChat from '../../../../admin/shared/admin-module-chat/AdminModuleChat';
import type { AdminChatMessage, AdminChatParticipant } from '../../../../admin/shared/admin-module-chat/adminChatTypes';
import type { SupervisionMeetingChatConfig } from '../../../../shared/meeting-room/types/chatMeetingRequest';
import StudentLayout from '../../../components/StudentLayout';
import type { ChatMessage, ChatParticipant } from '../types';
import { OFFER_FIELD_LIMITS } from '../../../../../design-system/safeContent';

export interface StudentModuleChatProps {
  participantsSeed: ChatParticipant[];
  initialMessages: Record<string, ChatMessage[]>;
  participantSubtitle?: string;
  avatarClassByParticipantId?: Record<string, string>;
  searchPlaceholder?: string;
  composerPlaceholder?: string;
  emptyConversationLabel?: string;
  smartActionsBar?: ReactNode;
  supervisionMeeting?: SupervisionMeetingChatConfig;
}

/** Chat module étudiant — UI admin premium, shell StudentLayout. */
const StudentModuleChat: FunctionComponent<StudentModuleChatProps> = ({
  participantsSeed,
  initialMessages,
  participantSubtitle,
  avatarClassByParticipantId,
  searchPlaceholder,
  composerPlaceholder,
  emptyConversationLabel,
  smartActionsBar,
  supervisionMeeting,
}) => {
  const { t } = useTranslation();
  const emptyLabel = emptyConversationLabel ?? t('student.moduleChat.defaultEmpty');
  return (
  <AdminModuleChat
    Layout={StudentLayout}
    participantsSeed={participantsSeed as AdminChatParticipant[]}
    initialMessages={initialMessages as Record<string, AdminChatMessage[]>}
    participantSubtitle={participantSubtitle}
    avatarClassByParticipantId={avatarClassByParticipantId}
    searchPlaceholder={searchPlaceholder}
    composerPlaceholder={composerPlaceholder}
    emptyConversationLabel={emptyLabel}
    composerMaxLength={OFFER_FIELD_LIMITS.chatMessage}
    smartActionsBar={smartActionsBar}
    supervisionMeeting={supervisionMeeting}
  />
  );
};

export default StudentModuleChat;
