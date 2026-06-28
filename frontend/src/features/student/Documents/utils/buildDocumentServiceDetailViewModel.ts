import type { TFunction } from 'i18next';
import type { DocumentServiceCatalogItem, ServiceWorkflowStep } from '../../../admin/Documents_admin/types/documentServiceCatalog';
import { documentServiceHasAutoGenerate } from './documentServiceHelpers';

export interface DocumentDetailListItem {
  label: string;
  value: string;
}

export interface DocumentDetailAttachmentItem {
  label: string;
  required: boolean;
}

export interface DocumentServiceDetailViewModel {
  categoryLabel: string;
  deliveryChips: string[];
  workflowSteps: string[];
  prerequisites: string[];
  attachments: DocumentDetailAttachmentItem[];
  dynamicFields: DocumentDetailAttachmentItem[];
  pickupInfo: DocumentDetailListItem[];
  processingInfo: DocumentDetailListItem[];
  requestModeLabel: string;
  canRequest: boolean;
  canGenerate: boolean;
  isAutoGenerate: boolean;
  hasGeneratedOutput: boolean;
  requestOnline: boolean;
}

function resolveDeliveryChips(item: DocumentServiceCatalogItem, t: TFunction): string[] {
  const chips: string[] = [];
  const { delivery, availability } = item.config;

  if (item.onlineEnabled || delivery.online.enabled) {
    chips.push(t('admin.documentsModule.catalog.badges.online'));
  }
  if (item.physicalEnabled || delivery.physical.enabled) {
    chips.push(t('admin.documentsModule.catalog.badges.physical'));
  }
  if (item.reservationRequired || delivery.physical.reservationRequired) {
    chips.push(t('admin.documentsModule.catalog.badges.reservation'));
  }
  if (item.autoGenerate || availability.autoGenerateEnabled) {
    chips.push(t('admin.documentsModule.catalog.badges.autoGen'));
  }

  return chips;
}

function resolvePrerequisites(item: DocumentServiceCatalogItem, t: TFunction): string[] {
  const P = 'student.documents.detail.prerequisites';
  const { validation, eligibility } = item.config;
  const items: string[] = [];

  if (validation.activeStudentRequired) items.push(t(`${P}.activeStudent`));
  if (validation.registrationCompleteRequired) items.push(t(`${P}.registrationComplete`));
  if (validation.srfClearanceRequired) items.push(t(`${P}.srfClearance`));
  if (validation.internshipRequired) items.push(t(`${P}.internship`));
  if (validation.serviceApprovalRequired) items.push(t(`${P}.serviceApproval`));
  if (eligibility.internshipStudentsOnly) items.push(t(`${P}.internshipStudentsOnly`));
  if (eligibility.finalYearOnly) items.push(t(`${P}.finalYearOnly`));

  return items;
}

function resolveRequestMode(item: DocumentServiceCatalogItem, t: TFunction): string {
  const { availability } = item.config;
  if (availability.physicalOnly) return t('student.documents.detail.requestMode.physicalOnly');
  if (availability.onlineRequestEnabled) return t('student.documents.detail.requestMode.online');
  return t('student.documents.detail.requestMode.unavailable');
}

const WORKFLOW_STEP_LABEL_BY_CODE: Record<string, string> = {
  submitted: 'admin.documentsModule.workflow.submit',
  under_verification: 'admin.documentsModule.workflow.verify',
  waiting_reservation: 'admin.documentsModule.workflow.reserve',
  validated: 'admin.documentsModule.workflow.generate',
  ready: 'admin.documentsModule.workflow.ready',
  delivered: 'admin.documentsModule.workflow.delivered',
};

function resolveWorkflowStepLabel(step: ServiceWorkflowStep, t: TFunction): string {
  const labelKey = WORKFLOW_STEP_LABEL_BY_CODE[step.code] ?? step.labelKey;
  return t(labelKey);
}

export function buildDocumentServiceDetailViewModel(
  item: DocumentServiceCatalogItem,
  t: TFunction,
): DocumentServiceDetailViewModel {
  const { config } = item;
  const pickupInfo: DocumentDetailListItem[] = [];

  if (config.pickup.pickupOffice) {
    pickupInfo.push({
      label: t('student.documents.detail.pickup.office'),
      value: config.pickup.pickupOffice,
    });
  }
  if (config.pickup.responsibleService) {
    pickupInfo.push({
      label: t('student.documents.detail.pickup.service'),
      value: config.pickup.responsibleService,
    });
  }
  if (config.pickup.openingHours) {
    pickupInfo.push({
      label: t('student.documents.detail.pickup.hours'),
      value: config.pickup.openingHours,
    });
  }
  if (config.delivery.physical.signatureRequired) {
    pickupInfo.push({
      label: t('student.documents.detail.pickup.signature'),
      value: t('student.documents.detail.pickup.required'),
    });
  }
  if (config.delivery.physical.appointmentMandatory) {
    pickupInfo.push({
      label: t('student.documents.detail.pickup.appointment'),
      value: t('student.documents.detail.pickup.required'),
    });
  }

  const processingInfo: DocumentDetailListItem[] = [
    {
      label: t('student.documents.detail.processing.estimated'),
      value: t('admin.documentsModule.catalog.estimatedDelay', { hours: item.estimatedHours }),
    },
    {
      label: t('student.documents.detail.processing.sla'),
      value: t('student.documents.detail.processing.slaValue', { hours: item.slaHours }),
    },
  ];

  if (config.processing.urgencyRules.trim()) {
    processingInfo.push({
      label: t('student.documents.detail.processing.urgency'),
      value: config.processing.urgencyRules,
    });
  }

  const isAutoGenerate = documentServiceHasAutoGenerate(item);
  const hasGeneratedOutput = Boolean(item.studentRequest?.hasGeneratedOutput);

  return {
    categoryLabel: t(`admin.documentsModule.catalog.categories.${item.category}`),
    deliveryChips: resolveDeliveryChips(item, t),
    workflowSteps: config.workflow.steps
      .filter((step) => step.enabled)
      .map((step) => resolveWorkflowStepLabel(step, t)),
    prerequisites: resolvePrerequisites(item, t),
    attachments: config.requiredAttachments.map((rule) => ({
      label: t(rule.labelKey),
      required: rule.required,
    })),
    dynamicFields: config.dynamicFields.map((field) => ({
      label: t(field.labelKey),
      required: Boolean(field.required),
    })),
    pickupInfo,
    processingInfo,
    requestModeLabel: resolveRequestMode(item, t),
    canRequest: item.isActive && !isAutoGenerate && (item.studentRequest?.canRequestNew ?? true),
    canGenerate: item.isActive && isAutoGenerate && (item.studentRequest?.canGenerate ?? true),
    isAutoGenerate,
    hasGeneratedOutput,
    requestOnline: config.availability.onlineRequestEnabled,
  };
}
