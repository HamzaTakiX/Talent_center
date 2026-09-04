import { isAxiosError } from 'axios';

export type MeetingErrorCode =
  | 'generic'
  | 'unauthorized'
  | 'noSupervisorAssigned'
  | 'noSupervisedStudents'
  | 'studentRequired'
  | 'notFound';

function combinedErrorText(error: unknown): { status?: number; text: string } {
  if (!isAxiosError(error)) {
    return { text: '' };
  }
  const status = error.response?.status;
  const payload = error.response?.data as
    | { message?: string; errors?: Record<string, string[] | string> }
    | undefined;
  const message = String(payload?.message ?? '').toLowerCase();
  const detailField = payload?.errors?.detail;
  const detail = Array.isArray(detailField)
    ? detailField.join(' ').toLowerCase()
    : String(detailField ?? '').toLowerCase();
  return { status, text: `${message} ${detail}`.trim() };
}

export function parseMeetingSessionError(error: unknown): MeetingErrorCode {
  const { status, text } = combinedErrorText(error);
  if (status === 404) return 'notFound';
  if (status === 403) {
    if (text.includes('no assigned encadrant')) return 'noSupervisorAssigned';
    if (text.includes('no supervised students')) return 'noSupervisedStudents';
    if (text.includes('student_profile_id is required')) return 'studentRequired';
    if (
      text.includes('not allowed') ||
      text.includes('another student') ||
      text.includes('not under your supervision') ||
      text.includes('permission denied')
    ) {
      return 'unauthorized';
    }
    return 'unauthorized';
  }
  return 'generic';
}

export function meetingErrorI18nKey(code: MeetingErrorCode): string {
  switch (code) {
    case 'noSupervisorAssigned':
      return 'meetingRoom.errors.noSupervisorAssigned';
    case 'noSupervisedStudents':
      return 'meetingRoom.errors.noSupervisedStudents';
    case 'studentRequired':
      return 'meetingRoom.errors.studentRequired';
    case 'notFound':
      return 'meetingRoom.errors.notFound';
    case 'unauthorized':
      return 'meetingRoom.errors.unauthorized';
    default:
      return 'meetingRoom.errors.create';
  }
}
