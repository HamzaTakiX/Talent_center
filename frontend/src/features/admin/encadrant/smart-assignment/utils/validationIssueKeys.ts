import type { SmartAssignmentValidationIssue } from '../../../api/types';

export const issueTitleKey = (code: string): string =>
  `admin.smartAssignment.validation.issues.${code}.title`;

export const issueDescriptionKey = (code: string): string =>
  `admin.smartAssignment.validation.issues.${code}.description`;

export const recommendationKey = (code: string): string =>
  `admin.smartAssignment.validation.recommendations.${code}`;

export const sortIssuesBySeverity = (
  issues: SmartAssignmentValidationIssue[],
): SmartAssignmentValidationIssue[] => {
  const order = { critical: 0, warning: 1, info: 2 };
  return [...issues].sort((a, b) => order[a.severity] - order[b.severity]);
};
