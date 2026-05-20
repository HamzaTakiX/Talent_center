import {
  Clock,
  Eye,
  FileStack,
  FormInput,
  GitBranch,
  MapPin,
  Paperclip,
  Settings2,
  ShieldCheck,
  Truck,
  Users,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import type { DocumentServiceWritePayload, ServiceCatalogFormTab } from '../../types/documentServiceCatalog';

export interface StudioStepDef {
  key: ServiceCatalogFormTab;
  icon: LucideIcon;
}

export const STUDIO_STEPS: StudioStepDef[] = [
  { key: 'basic', icon: Settings2 },
  { key: 'availability', icon: Eye },
  { key: 'eligibility', icon: Users },
  { key: 'processing', icon: Clock },
  { key: 'delivery', icon: Truck },
  { key: 'pickup', icon: MapPin },
  { key: 'attachments', icon: Paperclip },
  { key: 'fields', icon: FormInput },
  { key: 'validation', icon: ShieldCheck },
  { key: 'workflow', icon: GitBranch },
  { key: 'automation', icon: Zap },
];

export function isStudioStepComplete(
  tab: ServiceCatalogFormTab,
  value: DocumentServiceWritePayload,
): boolean {
  const cfg = value.config;
  switch (tab) {
    case 'basic':
      return Boolean(value.name.trim() && value.code.trim());
    case 'availability':
      return (
        cfg.availability.isActive ||
        !cfg.availability.visibleToStudents ||
        cfg.availability.physicalOnly ||
        cfg.availability.autoGenerateEnabled
      );
    case 'eligibility':
      return (
        cfg.eligibility.academicYears.length > 0 ||
        cfg.eligibility.internshipStudentsOnly ||
        cfg.eligibility.finalYearOnly
      );
    case 'processing':
      return cfg.processing.estimatedHours > 0 && cfg.processing.slaHours > 0;
    case 'delivery':
      return cfg.delivery.online.enabled || cfg.delivery.physical.enabled;
    case 'pickup':
      return Boolean(cfg.pickup.pickupOffice.trim() || cfg.pickup.responsibleService.trim());
    case 'attachments':
      return cfg.requiredAttachments.length > 0;
    case 'fields':
      return cfg.dynamicFields.length > 0;
    case 'validation':
      return (
        cfg.validation.automatic ||
        cfg.validation.manual ||
        cfg.validation.srfClearanceRequired ||
        cfg.validation.multiStep
      );
    case 'workflow':
      return cfg.workflow.steps.some((s) => s.enabled);
    case 'automation':
      return cfg.automation.reminders || cfg.automation.escalation || cfg.automation.notifications;
    default:
      return false;
  }
}

export function countCompletedSteps(value: DocumentServiceWritePayload): number {
  return STUDIO_STEPS.filter((s) => isStudioStepComplete(s.key, value)).length;
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
