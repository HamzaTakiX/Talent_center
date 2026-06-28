import {
  Clock,
  Eye,
  FileStack,
  GitBranch,
  MapPin,
  Paperclip,
  Send,
  ShieldCheck,
  Truck,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import type { DocumentServiceWritePayload, ServiceCatalogFormTab } from '../../types/documentServiceCatalog';
import { isStepVisible } from './serviceCatalogStepVisibility';

export interface StudioStepDef {
  key: ServiceCatalogFormTab;
  icon: LucideIcon;
}

export const STUDIO_STEPS: StudioStepDef[] = [
  { key: 'information', icon: FileStack },
  { key: 'visibility', icon: Eye },
  { key: 'requestMode', icon: Send },
  { key: 'processing', icon: Clock },
  { key: 'delivery', icon: Truck },
  { key: 'pickup', icon: MapPin },
  { key: 'attachments', icon: Paperclip },
  { key: 'validation', icon: ShieldCheck },
  { key: 'workflowAutomation', icon: GitBranch },
];

export function isStudioStepComplete(
  tab: ServiceCatalogFormTab,
  value: DocumentServiceWritePayload,
): boolean {
  if (!isStepVisible(tab, value)) return true;

  const cfg = value.config;
  switch (tab) {
    case 'information':
      return Boolean(value.name.trim());
    case 'visibility':
      return true;
    case 'requestMode':
      if (!cfg.availability.autoGenerateEnabled) return true;
      return Boolean(cfg.template?.fileName && cfg.template?.validated);
    case 'processing':
      return cfg.processing.estimatedHours > 0;
    case 'delivery':
      return cfg.delivery.online.enabled || cfg.delivery.physical.enabled;
    case 'pickup':
      return Boolean(cfg.pickup.pickupOffice.trim() || cfg.pickup.responsibleService.trim());
    case 'attachments':
      return true;
    case 'validation':
      return (
        cfg.validation.internshipRequired ||
        cfg.validation.activeStudentRequired ||
        cfg.validation.registrationCompleteRequired ||
        cfg.validation.srfClearanceRequired ||
        cfg.validation.automatic ||
        cfg.validation.manual
      );
    case 'workflowAutomation':
      return (
        cfg.workflow.steps.some((s) => s.enabled) ||
        cfg.automation.reminders ||
        cfg.automation.escalation ||
        cfg.automation.notifications
      );
    default:
      return false;
  }
}

export function countCompletedSteps(value: DocumentServiceWritePayload): number {
  return STUDIO_STEPS.filter((s) => isStepVisible(s.key, value) && isStudioStepComplete(s.key, value)).length;
}

export function countVisibleSteps(value: DocumentServiceWritePayload): number {
  return STUDIO_STEPS.filter((s) => isStepVisible(s.key, value)).length;
}

export function enabledWorkflowCount(value: DocumentServiceWritePayload): number {
  return value.config.workflow.steps.filter((s) => s.enabled).length;
}

export type WorkloadLevel = 'low' | 'medium' | 'high';

export function getWorkloadLevel(hours: number): WorkloadLevel {
  if (hours >= 72) return 'high';
  if (hours >= 36) return 'medium';
  return 'low';
}

export const SERVICE_ICON_OPTIONS = [
  'file-text',
  'graduation-cap',
  'briefcase',
  'award',
  'wallet',
  'shield',
  'stamp',
  'file-spreadsheet',
] as const;

export type ServiceIconKey = (typeof SERVICE_ICON_OPTIONS)[number];

export const COLOR_THEME_OPTIONS = ['brand', 'blue', 'navy', 'cyan', 'violet', 'slate'] as const;

export type ServiceColorTheme = (typeof COLOR_THEME_OPTIONS)[number];

export const TEMPLATE_PLACEHOLDERS = [
  '{{student_name}}',
  '{{student_id}}',
  '{{program}}',
  '{{academic_level}}',
  '{{class_name}}',
  '{{academic_year}}',
  '{{current_date}}',
] as const;

export const ATTACHMENT_PRESETS = [
  { code: 'cin', labelKey: 'admin.documentsModule.catalog.attachments.idCopy', icon: 'id-card' },
  { code: 'convention', labelKey: 'admin.documentsModule.catalog.attachments.convention', icon: 'file-signature' },
  { code: 'photo', labelKey: 'admin.documentsModule.catalog.attachments.photo', icon: 'image' },
  { code: 'insurance', labelKey: 'admin.documentsModule.catalog.attachments.insurance', icon: 'shield' },
  { code: 'internshipOffer', labelKey: 'admin.documentsModule.catalog.attachments.internshipOffer', icon: 'briefcase' },
  { code: 'paymentProof', labelKey: 'admin.documentsModule.catalog.attachments.paymentProof', icon: 'wallet' },
] as const;
