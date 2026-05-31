import { FunctionComponent } from 'react';
import EncadrantModuleChat from '../components/EncadrantModuleChat';
import {
  encadrantPortalChatInitialMessages,
  encadrantPortalChatParticipants,
} from '../data/encadrantChatMock';

const ChatPage: FunctionComponent = () => (
  <EncadrantModuleChat
    participantsSeed={encadrantPortalChatParticipants}
    initialMessages={encadrantPortalChatInitialMessages}
    participantSubtitle="student • internship supervision"
    searchPlaceholder="Search students or conversations"
    composerPlaceholder="Write a message to your student..."
    emptyConversationLabel="Select a conversation with a student"
  />
);

export default ChatPage;
