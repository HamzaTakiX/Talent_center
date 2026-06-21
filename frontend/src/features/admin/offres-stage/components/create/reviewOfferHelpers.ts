import type { AnalyticsPreview, CreateOfferFormState, WizardStep } from '../../types/createOfferWorkflow';
import { hasTargetingSelection as targetingHasSelection } from '../../../../shared/utils/targetingMappers';

export type ReviewSectionId = 'basic' | 'description' | 'skills' | 'targeting' | 'recruitment';

export type ValidationChecklistSectionId = ReviewSectionId | 'publication';

export interface ValidationChecklistItem {
  id: ValidationChecklistSectionId;
  step: WizardStep;
  complete: boolean;
}

export interface ReviewSectionStatus {
  id: ReviewSectionId;
  step: WizardStep;
  complete: boolean;
  missingLabelKey?: string;
}

export interface RequiredFieldCheck {
  id: string;
  labelKey: string;
  complete: boolean;
}

function hasTargetingSelection(form: CreateOfferFormState): boolean {
  return targetingHasSelection(form.targeting);
}

export function computeReadinessScore(form: CreateOfferFormState): number {
  const checks = [
    Boolean(form.title.trim()),
    Boolean(form.company.trim()),
    Boolean(form.internshipType),
    Boolean(form.location.trim()),
    Boolean(form.description.overview.trim()),
    form.requiredSkills.length > 0,
    hasTargetingSelection(form),
    Boolean(form.recruitment.applicationDeadline),
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export type WizardStepVisualState = 'active' | 'complete' | 'missing' | 'error' | 'neutral';

export function isReadyToPublish(form: CreateOfferFormState): boolean {
  return computeReadinessScore(form) === 100;
}

export function getPublishReadiness(form: CreateOfferFormState) {
  const sections = buildSectionStatuses(form);
  const score = computeReadinessScore(form);
  return {
    score,
    ready: score === 100,
    sections,
    incompleteSections: sections.filter((section) => !section.complete),
  };
}

export function buildSectionStatuses(form: CreateOfferFormState): ReviewSectionStatus[] {
  const basicComplete =
    Boolean(form.title.trim()) &&
    Boolean(form.company.trim()) &&
    Boolean(form.internshipType) &&
    Boolean(form.location.trim());

  const descriptionComplete = Boolean(form.description.overview.trim());
  const skillsComplete = form.requiredSkills.length > 0;
  const targetingComplete = hasTargetingSelection(form);
  const recruitmentComplete = Boolean(form.recruitment.applicationDeadline);

  return [
    {
      id: 'basic',
      step: 'basic',
      complete: basicComplete,
      missingLabelKey: !basicComplete ? 'missingBasic' : undefined,
    },
    {
      id: 'description',
      step: 'description',
      complete: descriptionComplete,
      missingLabelKey: !descriptionComplete ? 'missingOverview' : undefined,
    },
    {
      id: 'skills',
      step: 'skills',
      complete: skillsComplete,
      missingLabelKey: !skillsComplete ? 'missingSkills' : undefined,
    },
    {
      id: 'targeting',
      step: 'targeting',
      complete: targetingComplete,
      missingLabelKey: !targetingComplete ? 'missingTargeting' : undefined,
    },
    {
      id: 'recruitment',
      step: 'recruitment',
      complete: recruitmentComplete,
      missingLabelKey: !recruitmentComplete ? 'missingDeadline' : undefined,
    },
  ];
}

export function buildValidationChecklist(form: CreateOfferFormState): ValidationChecklistItem[] {
  const sections = buildSectionStatuses(form);
  const publicationComplete = Boolean(form.recruitment.applicationDeadline);

  return [
    ...sections.map((section) => ({
      id: section.id,
      step: section.step,
      complete: section.complete,
    })),
    {
      id: 'publication',
      step: 'recruitment',
      complete: publicationComplete,
    },
  ];
}

export function getWizardStepVisualState(
  step: WizardStep,
  currentStep: WizardStep,
  form: CreateOfferFormState,
  validationAttempted = false,
  isEditMode = false,
): WizardStepVisualState {
  if (step === currentStep) return 'active';
  if (step === 'review') return 'neutral';

  const section = buildSectionStatuses(form).find((entry) => entry.step === step);
  if (section?.complete) return 'complete';
  if (validationAttempted) return 'error';
  if (isEditMode) return 'missing';
  return 'neutral';
}

export function buildRequiredFieldChecks(form: CreateOfferFormState): RequiredFieldCheck[] {
  return [
    { id: 'title', labelKey: 'title', complete: Boolean(form.title.trim()) },
    { id: 'description', labelKey: 'description', complete: Boolean(form.description.overview.trim()) },
    { id: 'company', labelKey: 'company', complete: Boolean(form.company.trim()) },
    { id: 'location', labelKey: 'location', complete: Boolean(form.location.trim()) },
    { id: 'skills', labelKey: 'skills', complete: form.requiredSkills.length > 0 },
    { id: 'targeting', labelKey: 'targeting', complete: hasTargetingSelection(form) },
    {
      id: 'recruitment',
      labelKey: 'recruitment',
      complete: Boolean(form.recruitment.applicationDeadline),
    },
    {
      id: 'deadline',
      labelKey: 'deadline',
      complete: Boolean(form.recruitment.applicationDeadline),
    },
  ];
}

export function computeInternshipDuration(
  startDate: string,
  endDate: string,
  t: (key: string, opts?: Record<string, unknown>) => string,
): string | null {
  if (!startDate || !endDate) return null;
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) return null;

  const diffDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 14) {
    return t('admin.forms.createOfferStudio.review.duration.weeks', {
      count: Math.max(1, Math.round(diffDays / 7)),
    });
  }
  const months = Math.round(diffDays / 30);
  if (months < 24) {
    return t('admin.forms.createOfferStudio.review.duration.months', { count: Math.max(1, months) });
  }
  return t('admin.forms.createOfferStudio.review.duration.months', { count: months });
}

export function formatReviewDate(
  value: string,
  locale: string,
  fallback: string,
): string {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function buildOfferTags(form: CreateOfferFormState, workModeLabel: string): string[] {
  const tags: string[] = [];
  if (form.internshipType) tags.push(form.internshipType.toUpperCase());
  if (form.workMode && workModeLabel) tags.push(workModeLabel);
  form.targeting.categories.forEach((c) => tags.push(c));
  return tags;
}

export function displayExpectedReach(
  analytics: AnalyticsPreview,
  hasTargeting: boolean,
  t: (key: string) => string,
): string {
  if (analytics.expectedReach !== null) return String(analytics.expectedReach);
  return hasTargeting
    ? t('admin.forms.createOfferStudio.preview.audiencePending')
    : t('admin.forms.createOfferStudio.preview.notAvailable');
}
