/**
 * Student UI — alias du design system plateforme + shells étudiant.
 */

export * from '../../../design-system';
export * from '../../../design-system/platformTokens';
export * from '../design-system/studentSemanticStyles';

export { default as StudentPageContent } from './StudentPageContent';
export { default as StudentModulePageShell } from './StudentModulePageShell';
export { default as StudentSearchEmptyState } from './StudentSearchEmptyState';
export type { StudentSearchEmptyStateProps } from './StudentSearchEmptyState';
export { default as StudentPortalPage } from '../components/StudentPortalPage';
