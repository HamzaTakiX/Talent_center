import type { SmartAssignmentValidationIssue } from '../../../api/types';

export const issueTitleKey = (code: string): string =>
  `admin.smartAssignment.validation.issues.${code}.title`;

export const issueDescriptionKey = (code: string): string =>
  `admin.smartAssignment.validation.issues.${code}.description`;

export const recommendationKey = (code: string): string =>
  `admin.smartAssignment.validation.recommendations.${code}`;

export const getIssueTranslationParams = (
  issue: SmartAssignmentValidationIssue,
): Record<string, string | number> => ({
  count: issue.count,
  ...(issue.metadata as Record<string, string | number>),
});

export const getIssueReactKey = (issue: SmartAssignmentValidationIssue, index: number): string => {
  const meta = issue.metadata as Record<string, unknown>;
  if (meta?.internship_type != null && String(meta.internship_type).length > 0) {
    return `${issue.code}:${String(meta.internship_type)}`;
  }
  if (meta?.academic_year != null && String(meta.academic_year).length > 0) {
    return `${issue.code}:${String(meta.academic_year)}`;
  }
  return `${issue.code}:${index}`;
};

export const sortIssuesBySeverity = (
  issues: SmartAssignmentValidationIssue[],
): SmartAssignmentValidationIssue[] => {
  const order = { critical: 0, warning: 1, info: 2 };
  return [...issues].sort((a, b) => order[a.severity] - order[b.severity]);
};
