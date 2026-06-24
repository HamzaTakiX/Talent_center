/** Backend `AnnouncementType.code` values (see seed_types.py). */
export const ANNOUNCEMENT_TYPE_OPTIONS = [
  { value: '', labelKey: 'select' },
  { value: 'forum-career-fair', labelKey: 'event' },
  { value: 'recruitment-interview', labelKey: 'interview' },
  { value: 'institutional-communication', labelKey: 'info' },
] as const;

export const ANNOUNCEMENT_AUDIENCE_OPTIONS = [
  { value: '', labelKey: 'select' },
  { value: 'allStudents', labelKey: 'allStudents' },
  { value: 'finalYear', labelKey: 'finalYear' },
  { value: 'computerScience', labelKey: 'computerScience' },
] as const;

/** Backend `Announcement.Priority` choices. */
export const ANNOUNCEMENT_PRIORITY_OPTIONS = [
  { value: '', labelKey: 'select' },
  { value: 'NORMAL', labelKey: 'normal' },
  { value: 'IMPORTANT', labelKey: 'important' },
  { value: 'URGENT', labelKey: 'urgent' },
] as const;

/** Backend `Announcement.TargetScope` choices. */
export const ANNOUNCEMENT_VISIBILITY_OPTIONS = [
  { value: '', labelKey: 'select' },
  { value: 'ALL_STUDENTS', labelKey: 'allStudents' },
  { value: 'TARGETED', labelKey: 'targeted' },
  { value: 'CUSTOM', labelKey: 'custom' },
] as const;

const TARGET_SCOPES = new Set(['ALL_STUDENTS', 'TARGETED', 'CUSTOM']);

export function resolveAnnouncementTargetScope(
  visibility: string,
  audience: string,
): 'ALL_STUDENTS' | 'TARGETED' | 'CUSTOM' {
  if (TARGET_SCOPES.has(visibility)) {
    return visibility as 'ALL_STUDENTS' | 'TARGETED' | 'CUSTOM';
  }
  if (audience && audience !== 'allStudents') {
    return 'TARGETED';
  }
  return 'ALL_STUDENTS';
}

export function resolveAnnouncementPriority(priority: string): string {
  return priority || 'NORMAL';
}
