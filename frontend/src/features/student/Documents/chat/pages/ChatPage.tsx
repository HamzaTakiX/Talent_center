import { FunctionComponent } from 'react';
import StudentModuleChat from '../../../internship_offers/chat/components/StudentModuleChat';
import {
  studentDocumentsChatInitialMessages,
  studentDocumentsChatParticipants,
} from '../data/studentDocumentsChatMock';

const ChatPage: FunctionComponent = () => (
  <StudentModuleChat
    participantsSeed={studentDocumentsChatParticipants}
    initialMessages={studentDocumentsChatInitialMessages}
    participantSubtitle="documents desk"
    searchPlaceholder="Search files or conversations"
    composerPlaceholder="Write a message about your document..."
    emptyConversationLabel="Select a conversation about your documents"
  />
);

export default ChatPage;
