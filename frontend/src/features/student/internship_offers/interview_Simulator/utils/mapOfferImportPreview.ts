import type { StageOfferImportPreview } from '../../../../shared/types/stageTypes';

const PLATFORM_COMPANY_NAMES = new Set([
  'linkedin',
  'indeed',
  'rekrute',
  'emploi.ma',
  'novojob',
  'unknown company',
]);

const PLACEHOLDER_TITLES = new Set([
  'imported internship offer',
  'imported linkedin offer',
  'imported indeed offer',
]);

export interface MappedOfferImportPreview {
  preview: StageOfferImportPreview;
  customJobTitle: string;
  customCompany: string;
  customDescription: string;
}

function sanitizeCompanyName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed || PLATFORM_COMPANY_NAMES.has(trimmed.toLowerCase())) {
    return '';
  }
  return trimmed;
}

function sanitizeTitle(title: string): string {
  const trimmed = title.trim();
  if (!trimmed || PLACEHOLDER_TITLES.has(trimmed.toLowerCase())) {
    return '';
  }
  return trimmed;
}

function buildSimulatorDescription(preview: StageOfferImportPreview): string {
  return [preview.description, preview.requirements, preview.benefits].filter(Boolean).join('\n\n');
}

export function mapOfferImportPreview(preview: StageOfferImportPreview): MappedOfferImportPreview {
  const sanitized: StageOfferImportPreview = {
    ...preview,
    title: sanitizeTitle(preview.title),
    company_name: sanitizeCompanyName(preview.company_name),
  };

  return {
    preview: sanitized,
    customJobTitle: sanitized.title,
    customCompany: sanitized.company_name,
    customDescription: buildSimulatorDescription(sanitized),
  };
}

export const OFFER_IMPORT_PLATFORM_LABELS: Record<string, string> = {
  LINKEDIN: 'LinkedIn',
  INDEED: 'Indeed',
  REKRUTE: 'ReKrute',
  EMPLOI_MA: 'Emploi.ma',
  NOVOJOB: 'Novojob',
  COMPANY_WEBSITE: 'Site entreprise',
  UNKNOWN: 'Site web',
};
