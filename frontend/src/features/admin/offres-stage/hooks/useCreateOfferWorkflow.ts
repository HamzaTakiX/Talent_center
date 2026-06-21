import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { stageApi } from '../../../shared/api/stageApi';
import type { StageImportJob } from '../../../shared/types/stageTypes';
import {
  mapCreateOfferFormToImportOverrides,
  mapCreateOfferFormToPayload,
} from '../../../shared/utils/stageMappers';
import { mapTargetingRulesToPayload } from '../../../shared/utils/targetingMappers';
import { parseAdminApiError } from '../../shared/utils/parseAdminApiError';
import { buildSectionStatuses } from '../components/create/reviewOfferHelpers';
import { IMPORT_LOADING_MESSAGES } from '../constants/createOfferWorkflow';
import type {
  AnalyticsPreview,
  CreateOfferFormState,
  CreationMethod,
  DuplicateOffer,
  ImportJobMeta,
  ImportPhase,
  SmartInsight,
  TargetingRules,
  WizardStep,
} from '../types/createOfferWorkflow';
import { createEmptyOfferForm } from '../types/createOfferWorkflow';
import { hasTargetingSelection as targetingHasSelection } from '../../../shared/utils/targetingMappers';

export type OfferStudioMode = 'create' | 'edit';
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface OfferStudioOptions {
  mode?: OfferStudioMode;
  offerId?: string;
  initialForm?: CreateOfferFormState;
  offerStatus?: string;
  lastUpdatedAt?: string | null;
}

function hasTargetingSelection(targeting: TargetingRules): boolean {
  return targetingHasSelection(targeting);
}

function computeCompleteness(form: CreateOfferFormState): number {
  const checks = [
    Boolean(form.title.trim()),
    Boolean(form.company.trim()),
    Boolean(form.internshipType),
    Boolean(form.location.trim()),
    Boolean(form.description.overview.trim()),
    form.requiredSkills.length > 0,
    hasTargetingSelection(form.targeting),
    Boolean(form.recruitment.applicationDeadline),
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

function buildInsights(form: CreateOfferFormState): SmartInsight[] {
  const insights: SmartInsight[] = [];

  if (form.recruitment.applicationDeadline) {
    const deadline = new Date(form.recruitment.applicationDeadline);
    const daysLeft = (deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    if (daysLeft > 0 && daysLeft < 7) {
      insights.push({ id: 'deadline', type: 'warning', message: 'deadlineClose' });
    }
  }

  const completeness = computeCompleteness(form);
  if (completeness > 0 && completeness < 50) {
    insights.push({ id: 'incomplete', type: 'info', message: 'incompleteForm' });
  }

  if (hasTargetingSelection(form.targeting)) {
    insights.push({ id: 'audiencePending', type: 'info', message: 'audienceAfterPublish' });
  }

  return insights;
}

function mapImportJobToForm(
  job: StageImportJob,
  prev: CreateOfferFormState,
): CreateOfferFormState {
  const normalized = (job.normalized_data ?? {}) as Record<string, unknown>;
  const requiredSkills = Array.isArray(normalized.required_skills)
    ? (normalized.required_skills as string[])
    : prev.requiredSkills;
  const preferredSkills = Array.isArray(normalized.preferred_skills)
    ? (normalized.preferred_skills as string[])
    : prev.preferredSkills;
  const languages = Array.isArray(normalized.required_languages)
    ? (normalized.required_languages as string[])
    : prev.languages;

  const deadline = normalized.application_deadline
    ? String(normalized.application_deadline).slice(0, 10)
    : prev.recruitment.applicationDeadline;

  return {
    ...prev,
    title: String(normalized.title ?? prev.title),
    company: String(normalized.company_name ?? prev.company),
    location: String(normalized.location_city ?? normalized.location ?? prev.location),
    internshipType: String(normalized.offer_type ?? prev.internshipType).toLowerCase(),
    requiredSkills: requiredSkills.length ? requiredSkills : prev.requiredSkills,
    preferredSkills,
    languages,
    description: {
      ...prev.description,
      overview: String(normalized.description ?? prev.description.overview),
      requirements: String(normalized.requirements ?? prev.description.requirements),
      benefits: String(normalized.benefits ?? prev.description.benefits),
    },
    recruitment: {
      ...prev.recruitment,
      applicationDeadline: deadline,
      externalUrl: job.source_url || prev.recruitment.externalUrl,
      applicationMethod: 'external',
    },
  };
}

function mapDuplicateFromJob(job: StageImportJob): DuplicateOffer | null {
  const info = job.duplicate_info;
  if (!info) return null;
  return {
    id: info.uuid,
    title: info.title,
    company: info.company_name,
    similarity: info.similarity_percent,
    publishedDaysAgo: info.published_days_ago,
  };
}

function buildImportMeta(job: StageImportJob): ImportJobMeta {
  const normalized = (job.normalized_data ?? {}) as Record<string, unknown>;
  const metadata = (job.import_metadata ?? normalized.import_metadata ?? {}) as Record<string, unknown>;
  const extracted = (job.extracted_data ?? {}) as Record<string, unknown>;
  const companyLogo = String(
    normalized.company_logo ?? metadata.company_logo ?? extracted.company_logo ?? '',
  );
  return {
    jobUuid: job.uuid,
    detectedPlatform: job.detected_platform,
    parserUsed: job.parser_used,
    sourceUrl: job.source_url,
    importDate: String(metadata.import_date ?? job.created_at),
    companyLogoUrl: companyLogo,
  };
}

export function useCreateOfferWorkflow(
  initialMethod: CreationMethod = null,
  options: OfferStudioOptions = {},
) {
  const {
    mode = 'create',
    offerId,
    initialForm,
    offerStatus,
    lastUpdatedAt,
  } = options;
  const isEditMode = mode === 'edit';

  const [method, setMethod] = useState<CreationMethod>(isEditMode ? 'manual' : initialMethod);
  const [currentStep, setCurrentStep] = useState<WizardStep>('basic');
  const [form, setForm] = useState<CreateOfferFormState>(initialForm ?? createEmptyOfferForm());
  const [importUrl, setImportUrl] = useState('');
  const [importPhase, setImportPhase] = useState<ImportPhase>('idle');
  const [importMessageIndex, setImportMessageIndex] = useState(0);
  const [importError, setImportError] = useState<string | null>(null);
  const [importJobMeta, setImportJobMeta] = useState<ImportJobMeta | null>(null);
  const [duplicate, setDuplicate] = useState<DuplicateOffer | null>(null);
  const [duplicateDismissed, setDuplicateDismissed] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(lastUpdatedAt ?? null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [validationAttempted, setValidationAttempted] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const skipAutoSaveRef = useRef(true);
  const savedStatusTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!initialForm) return;
    setForm(initialForm);
    setLastSavedAt(lastUpdatedAt ?? null);
    skipAutoSaveRef.current = true;
    setHasUnsavedChanges(false);
    setSaveStatus('idle');
  }, [initialForm, lastUpdatedAt]);

  useEffect(() => {
    return () => {
      if (savedStatusTimerRef.current !== null) {
        window.clearTimeout(savedStatusTimerRef.current);
      }
    };
  }, []);

  const markSaved = useCallback((updatedAt: string) => {
    setLastSavedAt(updatedAt);
    setHasUnsavedChanges(false);
    setSaveStatus('saved');
    setSaveError(null);
    if (savedStatusTimerRef.current !== null) {
      window.clearTimeout(savedStatusTimerRef.current);
    }
    savedStatusTimerRef.current = window.setTimeout(() => {
      setSaveStatus('idle');
    }, 3000);
  }, []);

  const saveDraft = useCallback(async () => {
    if (!isEditMode || !offerId) return null;

    setSaveStatus('saving');
    setSaveError(null);
    try {
      const payload = mapCreateOfferFormToPayload(form);
      const updated = await stageApi.update(offerId, payload);
      markSaved(updated.updated_at ?? new Date().toISOString());
      return updated;
    } catch (err) {
      const message = parseAdminApiError(err, 'draft_save_failed').message;
      setSaveError(message);
      setSaveStatus('error');
      throw err;
    }
  }, [form, isEditMode, markSaved, offerId]);

  const updateForm = useCallback((patch: Partial<CreateOfferFormState>) => {
    setForm((prev) => ({ ...prev, ...patch }));
    if (isEditMode) {
      if (skipAutoSaveRef.current) {
        skipAutoSaveRef.current = false;
        return;
      }
      setHasUnsavedChanges(true);
      if (saveStatus === 'saved') {
        setSaveStatus('idle');
      }
    }
  }, [isEditMode, saveStatus]);

  useEffect(() => {
    if (!isEditMode || !offerId || skipAutoSaveRef.current) return;

    const timer = window.setTimeout(() => {
      void saveDraft();
    }, 2000);

    return () => window.clearTimeout(timer);
  }, [form, isEditMode, offerId, saveDraft]);

  const [audienceSize, setAudienceSize] = useState(0);
  const [audiencePreviewLoading, setAudiencePreviewLoading] = useState(false);
  const hasTargeting = useMemo(() => hasTargetingSelection(form.targeting), [form.targeting]);

  useEffect(() => {
    if (!offerId || !hasTargeting) {
      setAudienceSize(0);
      setAudiencePreviewLoading(false);
      return;
    }
    setAudiencePreviewLoading(true);
    const timer = window.setTimeout(() => {
      void stageApi
        .targetingPreview(offerId, mapTargetingRulesToPayload(form.targeting))
        .then((preview) => {
          setAudienceSize(preview.recipient_count ?? preview.affected_students ?? 0);
        })
        .catch(() => setAudienceSize(0))
        .finally(() => setAudiencePreviewLoading(false));
    }, 400);
    return () => window.clearTimeout(timer);
  }, [offerId, form.targeting, hasTargeting]);
  const sectionStatuses = useMemo(() => buildSectionStatuses(form), [form]);

  const analytics = useMemo<AnalyticsPreview>(() => {
    const completeness = computeCompleteness(form);
    return {
      expectedReach: null,
      targetStudents: null,
      predictedApplications: null,
      visibilityScore: Math.min(100, completeness + (form.recruitment.visibility === 'public' ? 15 : 0)),
      completenessScore: completeness,
    };
  }, [form]);

  const insights = useMemo(() => buildInsights(form), [form]);
  const suggestedStudents = useMemo(() => [], []);

  const canPreviewMatchScore = useMemo(
    () => Boolean(form.title.trim() && form.company.trim() && form.requiredSkills.length > 0),
    [form.title, form.company, form.requiredSkills.length],
  );

  const wizardStepIndex = useMemo(() => {
    const steps: WizardStep[] = ['basic', 'description', 'skills', 'targeting', 'recruitment', 'review'];
    return steps.indexOf(currentStep);
  }, [currentStep]);

  const goNext = useCallback(() => {
    const steps: WizardStep[] = ['basic', 'description', 'skills', 'targeting', 'recruitment', 'review'];
    const idx = steps.indexOf(currentStep);
    if (idx < steps.length - 1) setCurrentStep(steps[idx + 1]);
  }, [currentStep]);

  const goPrev = useCallback(() => {
    const steps: WizardStep[] = ['basic', 'description', 'skills', 'targeting', 'recruitment', 'review'];
    const idx = steps.indexOf(currentStep);
    if (idx > 0) setCurrentStep(steps[idx - 1]);
  }, [currentStep]);

  const analyzeImport = useCallback(async () => {
    if (!importUrl.trim()) return;
    setImportPhase('analyzing');
    setImportMessageIndex(0);
    setImportError(null);
    setImportJobMeta(null);
    setDuplicate(null);
    setDuplicateDismissed(false);

    const messageTimer = window.setInterval(() => {
      setImportMessageIndex((i) => Math.min(i + 1, IMPORT_LOADING_MESSAGES.length - 1));
    }, 850);

    try {
      const job = await stageApi.startImport(importUrl.trim());
      window.clearInterval(messageTimer);

      setForm(mapImportJobToForm(job, createEmptyOfferForm()));
      setImportJobMeta(buildImportMeta(job));
      setImportPhase('extracted');

      const dup = mapDuplicateFromJob(job);
      setDuplicate(dup);
      setDuplicateDismissed(!dup);
    } catch (err) {
      window.clearInterval(messageTimer);
      setImportError(parseAdminApiError(err, 'import_failed').message);
      setImportPhase('failed');
    }
  }, [importUrl]);

  const resetImportForNewUrl = useCallback(() => {
    setForm(createEmptyOfferForm());
    setImportUrl('');
    setImportPhase('idle');
    setImportError(null);
    setImportJobMeta(null);
    setDuplicate(null);
    setDuplicateDismissed(false);
    setImportMessageIndex(0);
  }, []);

  const submitImport = useCallback(
    async (publish: boolean) => {
      if (!importJobMeta?.jobUuid) {
        throw new Error('Import job missing');
      }
      const overrides = {
        ...mapCreateOfferFormToImportOverrides(form),
        ...(importJobMeta.companyLogoUrl ? { company_logo: importJobMeta.companyLogoUrl } : {}),
      };
      const skipDuplicate = Boolean(duplicate && duplicateDismissed);
      if (publish) {
        return stageApi.approveImport(importJobMeta.jobUuid, overrides, skipDuplicate);
      }
      return stageApi.saveImportDraft(importJobMeta.jobUuid, overrides, skipDuplicate);
    },
    [duplicate, duplicateDismissed, form, importJobMeta?.jobUuid, importJobMeta?.companyLogoUrl],
  );

  const resetWorkflow = useCallback(() => {
    setMethod(isEditMode ? 'manual' : initialMethod);
    setCurrentStep('basic');
    setForm(initialForm ?? createEmptyOfferForm());
    setImportUrl('');
    setImportPhase('idle');
    setImportError(null);
    setImportJobMeta(null);
    setDuplicate(null);
    setDuplicateDismissed(false);
    skipAutoSaveRef.current = true;
    setHasUnsavedChanges(false);
    setValidationAttempted(false);
    setSaveStatus('idle');
    setSaveError(null);
  }, [initialForm, initialMethod, isEditMode]);

  const rejectImport = useCallback(async (reason = '') => {
    if (!importJobMeta?.jobUuid) return;
    await stageApi.rejectImport(importJobMeta.jobUuid, reason);
    resetWorkflow();
  }, [importJobMeta?.jobUuid, resetWorkflow]);

  const checkDuplicates = useCallback((): DuplicateOffer | null => duplicate, [duplicate]);

  return {
    mode,
    isEditMode,
    offerId,
    offerStatus,
    method,
    setMethod,
    currentStep,
    setCurrentStep,
    form,
    updateForm,
    importUrl,
    setImportUrl,
    importPhase,
    importMessageIndex,
    importError,
    importJobMeta,
    duplicate,
    duplicateDismissed,
    setDuplicateDismissed,
    audienceSize,
    audiencePreviewLoading,
    hasTargeting,
    sectionStatuses,
    analytics,
    insights,
    suggestedStudents,
    canPreviewMatchScore,
    wizardStepIndex,
    goNext,
    goPrev,
    analyzeImport,
    submitImport,
    rejectImport,
    resetImportForNewUrl,
    checkDuplicates,
    resetWorkflow,
    saveStatus,
    lastSavedAt,
    hasUnsavedChanges,
    validationAttempted,
    setValidationAttempted,
    saveDraft,
    saveError,
  };
}

export type CreateOfferWorkflow = ReturnType<typeof useCreateOfferWorkflow>;
