import { FunctionComponent } from 'react';
import StudentModuleChat from '../../../internship_offers/chat/components/StudentModuleChat';
import {
  studentAnnouncementsChatInitialMessages,
  studentAnnouncementsChatParticipants,
} from '../data/studentAnnouncementsChatMock';

const ChatPage: FunctionComponent = () => (
  <StudentModuleChat
    participantsSeed={studentAnnouncementsChatParticipants}
    initialMessages={studentAnnouncementsChatInitialMessages}
    participantSubtitle="announcements desk"
    searchPlaceholder="Search announcements or conversations"
    composerPlaceholder="Write a message about this announcement..."
    emptyConversationLabel="Select a conversation about an announcement"
  />
);

export default ChatPage;
