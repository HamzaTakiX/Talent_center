export type StudentDocumentPrimaryFilter = 'all' | 'archived';

export type StudentDocumentInboxFilters = {
  primary: StudentDocumentPrimaryFilter;
  unread: boolean;
};

export type StudentDocumentPrimaryFilterCounts = {
  all: number;
  archived: number;
};

export const EMPTY_STUDENT_DOCUMENT_FILTERS: StudentDocumentInboxFilters = {
  primary: 'all',
  unread: false,
};
