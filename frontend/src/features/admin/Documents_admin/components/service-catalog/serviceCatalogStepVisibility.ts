import type { DocumentServiceWritePayload, ServiceCatalogFormTab } from '../../types/documentServiceCatalog';
import { STUDIO_STEPS } from './serviceCatalogStudioSteps';

export function isStepVisible(tab: ServiceCatalogFormTab, value: DocumentServiceWritePayload): boolean {
  const cfg = value.config;
  switch (tab) {
    case 'pickup':
      return cfg.delivery.physical.enabled;
    default:
      return true;
  }
}

export function getVisibleSteps(value: DocumentServiceWritePayload) {
  return STUDIO_STEPS.filter((step) => isStepVisible(step.key, value));
}

export function resolveActiveStep(
  active: ServiceCatalogFormTab,
  value: DocumentServiceWritePayload,
): ServiceCatalogFormTab {
  if (isStepVisible(active, value)) return active;
  const visible = getVisibleSteps(value);
  return visible[0]?.key ?? 'information';
}
