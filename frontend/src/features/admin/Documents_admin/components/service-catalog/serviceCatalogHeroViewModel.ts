import type { TFunction } from 'i18next';
import type { DocumentServiceWritePayload } from '../../types/documentServiceCatalog';
import {
  STUDIO_STEPS,
  countCompletedSteps,
  countVisibleSteps,
  enabledWorkflowCount,
  isStudioStepComplete,
} from './serviceCatalogStudioSteps';
import { isStepVisible } from './serviceCatalogStepVisibility';

const P = 'admin.documentsModule.catalog.form.studio';

export interface HeroSummaryChip {
  id: string;
  label: string;
}

export interface HeroStepProgress {
  key: string;
  label: string;
  complete: boolean;
  visible: boolean;
}

export interface HeroKpi {
  id: string;
  label: string;
  value: string;
  highlight?: boolean;
}

export interface ServiceCatalogHeroViewModel {
  completedSteps: number;
  totalSteps: number;
  progressPercent: number;
  summaryChips: HeroSummaryChip[];
  stepProgress: HeroStepProgress[];
  kpis: HeroKpi[];
}

function hasEligibilityRestrictions(value: DocumentServiceWritePayload): boolean {
  const e = value.config.eligibility;
  return (
    e.programIds.length > 0 ||
    e.filiereIds.length > 0 ||
    e.levelIds.length > 0 ||
    e.classGroupIds.length > 0 ||
    e.internshipStudentsOnly ||
    e.finalYearOnly
  );
}

function resolveDeliveryMode(value: DocumentServiceWritePayload, t: TFunction): string {
  const { online, physical } = value.config.delivery;
  const onlineOn = online.enabled;
  const physicalOn = physical.enabled;

  if (onlineOn && physicalOn) return t(`${P}.deliveryMode.hybrid`);
  if (onlineOn) return t(`${P}.deliveryMode.online`);
  if (physicalOn) return t(`${P}.deliveryMode.physical`);
  if (value.config.availability.physicalOnly) return t(`${P}.deliveryMode.physical`);
  return t(`${P}.deliveryMode.none`);
}

function resolveEligibilityLabel(value: DocumentServiceWritePayload, t: TFunction): string {
  const e = value.config.eligibility;
  if (e.finalYearOnly) return t(`${P}.eligibility.finalYear`);
  if (e.internshipStudentsOnly) return t(`${P}.eligibility.internship`);
  if (hasEligibilityRestrictions(value)) return t(`${P}.eligibility.restricted`);
  return t(`${P}.eligibility.open`);
}

export function buildServiceCatalogHeroViewModel(
  value: DocumentServiceWritePayload,
  t: TFunction,
): ServiceCatalogHeroViewModel {
  const cfg = value.config;
  const completedSteps = countCompletedSteps(value);
  const totalSteps = countVisibleSteps(value);
  const progressPercent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  const summaryChips: HeroSummaryChip[] = [];

  const pushChip = (id: string, enabled: boolean, labelKey: string) => {
    if (enabled) summaryChips.push({ id, label: t(labelKey) });
  };

  pushChip('online-request', cfg.availability.onlineRequestEnabled, `${P}.summary.onlineRequest`);
  pushChip('auto-generate', cfg.availability.autoGenerateEnabled, `${P}.summary.autoGenerate`);
  pushChip('visible-students', cfg.availability.visibleToStudents, `${P}.summary.visibleStudents`);
  pushChip('download-pdf', cfg.delivery.online.downloadablePdf, `${P}.summary.downloadPdf`);
  pushChip('email-delivery', cfg.delivery.online.emailDelivery, `${P}.summary.emailDelivery`);
  pushChip('portal-delivery', cfg.delivery.online.portalDelivery, `${P}.summary.portalDelivery`);
  pushChip('physical-pickup', cfg.delivery.physical.enabled, `${P}.summary.physicalPickup`);
  pushChip('signature', cfg.delivery.physical.signatureRequired, `${P}.summary.signatureRequired`);
  pushChip('reservation', cfg.delivery.physical.reservationRequired, `${P}.summary.reservationRequired`);
  pushChip('final-year', cfg.eligibility.finalYearOnly, `${P}.summary.finalYear`);
  pushChip('internship', cfg.eligibility.internshipStudentsOnly, `${P}.summary.internshipOnly`);
  pushChip('manual-validation', cfg.validation.manual, `${P}.summary.manualValidation`);
  pushChip('auto-validation', cfg.validation.automatic, `${P}.summary.automaticValidation`);
  pushChip('reminders', cfg.automation.reminders, `${P}.summary.reminders`);
  pushChip('escalation', cfg.automation.escalation, `${P}.summary.escalation`);
  pushChip('notifications', cfg.automation.notifications, `${P}.summary.notifications`);

  const stepProgress: HeroStepProgress[] = STUDIO_STEPS.map((step) => ({
    key: step.key,
    label: t(`${P}.stepLabels.${step.key}`),
    complete: isStudioStepComplete(step.key, value),
    visible: isStepVisible(step.key, value),
  })).filter((step) => step.visible);

  const deliveryMode = resolveDeliveryMode(value, t);

  const kpis: HeroKpi[] = [
    {
      id: 'workflow',
      label: t(`${P}.kpi.workflowSteps`),
      value: String(enabledWorkflowCount(value)),
    },
    {
      id: 'sla',
      label: t(`${P}.kpi.sla`),
      value: `${cfg.processing.slaHours}h`,
    },
    {
      id: 'delivery',
      label: t(`${P}.kpi.delivery`),
      value: deliveryMode,
      highlight: value.config.delivery.online.enabled,
    },
    {
      id: 'eligibility',
      label: t(`${P}.kpi.eligibility`),
      value: resolveEligibilityLabel(value, t),
    },
  ];

  return {
    completedSteps,
    totalSteps,
    progressPercent,
    summaryChips,
    stepProgress,
    kpis,
  };
}
