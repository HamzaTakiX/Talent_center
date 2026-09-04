import i18n from 'i18next';
import { meetingRoomAr } from './meeting-room.ar';
import { meetingRoomEn } from './meeting-room.en';
import { meetingRoomFr } from './meeting-room.fr';

let registered = false;

export function registerMeetingRoomTranslations(): void {
  if (registered) return;
  registered = true;
  i18n.addResourceBundle('en', 'translation', { meetingRoom: meetingRoomEn }, true, true);
  i18n.addResourceBundle('fr', 'translation', { meetingRoom: meetingRoomFr }, true, true);
  i18n.addResourceBundle('ar', 'translation', { meetingRoom: meetingRoomAr }, true, true);
}
