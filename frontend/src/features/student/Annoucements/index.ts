export { default as AnnouncementsPage } from './pages/AnnouncementsPage';
export { default as AllAnnouncementsPage } from './pages/AllAnnouncementsPage';
export { ChatPage as AnnouncementsChatPage } from './chat';
export { HistoryPage as AnnouncementsHistoryPage } from './history';
export {
  STUDENT_ANNOUNCEMENTS_PATH,
  STUDENT_ANNOUNCEMENTS_ALL_PATH,
  STUDENT_ANNOUNCEMENTS_CHAT_PATH,
  STUDENT_ANNOUNCEMENTS_HISTORY_PATH,
} from './constants/routes';
export type {
  AnnouncementTag,
  AnnouncementPriority,
  AnnouncementsStatItem,
  StudentAnnouncementItem,
  FullAnnouncementItem,
} from './types';
