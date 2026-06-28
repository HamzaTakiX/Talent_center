import type { SimulatorConfig } from '../types/interviewSimulatorDashboard';

export function buildExternalOfferPayload(config: SimulatorConfig) {
  const preview = config.extractedOfferPreview;

  if (preview) {
    return {
      title: preview.title || config.customJobTitle || '',
      company_name: preview.company_name || config.customCompany || '',
      description: preview.description || config.customDescription || '',
      requirements: preview.requirements || '',
      benefits: preview.benefits || '',
      location_city: preview.location_city || '',
      required_skills: preview.required_skills || [],
      source_url: preview.source_url || config.offerUrl || '',
    };
  }

  if (config.customJobTitle?.trim() || config.customCompany?.trim() || config.customDescription?.trim()) {
    return {
      title: config.customJobTitle || '',
      company_name: config.customCompany || '',
      description: config.customDescription || '',
      source_url: config.offerUrl || '',
    };
  }

  return undefined;
}
