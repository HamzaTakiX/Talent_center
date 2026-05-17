import type { AdministratorListFilter } from '../types/platformAdministrators';

export const ADMINISTRATOR_LIST_PAGE_TITLE: Record<AdministratorListFilter, string> = {
  all: 'All Administrators',
  stage: 'Stage Administrators',
  finance: 'Finance Administrators',
  documents: 'Documents Administrators',
  communication: 'Communication Administrators'
};
