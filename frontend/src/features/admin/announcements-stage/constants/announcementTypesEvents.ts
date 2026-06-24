export const ANNOUNCEMENT_TYPES_CHANGED_EVENT = 'announcement-types-changed';

export function dispatchAnnouncementTypesChanged(): void {
  window.dispatchEvent(new Event(ANNOUNCEMENT_TYPES_CHANGED_EVENT));
}
