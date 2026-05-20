import { FunctionComponent } from 'react';
import StudentModuleChat from '../components/StudentModuleChat';
import {
  studentInternshipChatInitialMessages,
  studentInternshipChatParticipants,
} from '../data/studentInternshipChatMock';

const ChatPage: FunctionComponent = () => (
  <StudentModuleChat
    participantsSeed={studentInternshipChatParticipants}
    initialMessages={studentInternshipChatInitialMessages}
    participantSubtitle="online"
    searchPlaceholder="Search offers or conversations"
    composerPlaceholder="Write a message about this offer..."
    emptyConversationLabel="Select a conversation about an internship offer"
  />
);

export default ChatPage;
