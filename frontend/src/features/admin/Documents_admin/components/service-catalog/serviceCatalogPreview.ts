import type {
  DocumentServiceCatalogItem,
  DocumentServiceWritePayload,
} from '../../types/documentServiceCatalog';

export function buildPreviewService(
  value: DocumentServiceWritePayload,
  fallbackName: string,
  fallbackCode: string,
): DocumentServiceCatalogItem {
  const cfg = value.config;
  return {
    id: 'preview',
    code: value.code.trim() || fallbackCode,
    name: value.name.trim() || fallbackName,
    description: value.description?.trim() ?? '',
    category: value.category,
    iconKey: value.iconKey ?? 'file-text',
    colorTheme: value.colorTheme ?? 'brand',
    isActive: cfg.availability.isActive,
    config: cfg,
    slaHours: cfg.processing.slaHours,
    estimatedHours: cfg.processing.estimatedHours,
    onlineEnabled: cfg.delivery.online.enabled,
    physicalEnabled: cfg.delivery.physical.enabled,
    reservationRequired: cfg.delivery.physical.reservationRequired,
    visibleToStudents: cfg.availability.visibleToStudents,
    autoGenerate: cfg.availability.autoGenerateEnabled,
    requiresWorkflow: cfg.workflow.steps.some((s) => s.enabled),
  };
}
