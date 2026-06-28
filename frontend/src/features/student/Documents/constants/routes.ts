/** Routes — module Documents étudiant. */
export const STUDENT_DOCUMENTS_PATH = '/student/documents';
export const STUDENT_DOCUMENTS_CHAT_PATH = '/student/documents/chat';
export const studentDocumentDetailPath = (id: string) => `${STUDENT_DOCUMENTS_PATH}/${id}`;
