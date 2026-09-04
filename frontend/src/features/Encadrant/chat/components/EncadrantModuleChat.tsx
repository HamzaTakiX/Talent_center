import { FunctionComponent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import AdminModuleChat from '../../../admin/shared/admin-module-chat/AdminModuleChat';
import type {
  AdminChatMessage,
  AdminChatParticipant,
} from '../../../admin/shared/admin-module-chat/adminChatTypes';
import EncadrantLayout from '../../components/EncadrantLayout';
import type { SupervisionMeetingChatConfig } from '../../../shared/meeting-room/types/chatMeetingRequest';
import type { ChatMessage, ChatParticipant } from '../types';

export interface EncadrantModuleChatProps {
  participantsSeed: ChatParticipant[];
  initialMessages: Record<string, ChatMessage[]>;
  participantSubtitle?: string;
  avatarClassByParticipantId?: Record<string, string>;
  searchPlaceholder?: string;
  composerPlaceholder?: string;
  emptyConversationLabel?: string;
  smartActionsBar?: ReactNode;
  supervisionMeeting?: SupervisionMeetingChatConfig;
  selectedConversationId?: string;
  onSelectConversation?: (id: string) => void;
}

/**
 * Encadrant portal chat — same premium shell as Admin/Student (`AdminModuleChat`),
 * wrapped in EncadrantLayout. Presentation only; send/select logic stays in AdminModuleChat.
 */
const EncadrantModuleChat: FunctionComponent<EncadrantModuleChatProps> = ({
  participantsSeed,
  initialMessages,
  participantSubtitle,
  avatarClassByParticipantId,
  searchPlaceholder,
  composerPlaceholder,
  emptyConversationLabel,
  smartActionsBar,
  supervisionMeeting,
  selectedConversationId,
  onSelectConversation,
}) => {
  const { t } = useTranslation();

  return (
    <AdminModuleChat
      Layout={EncadrantLayout}
      participantsSeed={participantsSeed as AdminChatParticipant[]}
      initialMessages={initialMessages as Record<string, AdminChatMessage[]>}
      participantSubtitle={
        participantSubtitle ?? t('encadrant.chat.participantSubtitle')
      }
      avatarClassByParticipantId={avatarClassByParticipantId}
      searchPlaceholder={
        searchPlaceholder ?? t('encadrant.common.searchConversations')
      }
      composerPlaceholder={
        composerPlaceholder ?? t('encadrant.chat.composerPlaceholder')
      }
      emptyConversationLabel={
        emptyConversationLabel ?? t('encadrant.chat.emptyConversation')
      }
      smartActionsBar={smartActionsBar}
      supervisionMeeting={supervisionMeeting}
      selectedConversationId={selectedConversationId}
      onSelectConversation={onSelectConversation}
    />
  );
};

export default EncadrantModuleChat;
