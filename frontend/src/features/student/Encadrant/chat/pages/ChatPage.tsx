import { FunctionComponent } from 'react';
import StudentModuleChat from '../../../internship_offers/chat/components/StudentModuleChat';
import {
  studentEncadrantChatInitialMessages,
  studentEncadrantChatParticipants,
} from '../data/studentEncadrantChatMock';

const ChatPage: FunctionComponent = () => (
  <StudentModuleChat
    participantsSeed={studentEncadrantChatParticipants}
    initialMessages={studentEncadrantChatInitialMessages}
    participantSubtitle="Encadrant • Suivi de stage"
    searchPlaceholder="Search supervisor or conversations"
    composerPlaceholder="Write a message to your encadrant..."
    emptyConversationLabel="Select a conversation with your encadrant"
  />
);

export default ChatPage;
