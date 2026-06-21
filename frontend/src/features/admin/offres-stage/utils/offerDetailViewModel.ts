import { IMPORT_PLATFORM_LABELS } from '../constants/createOfferWorkflow';
import type { TargetingRules } from '../types/createOfferWorkflow';
import { mapBackendRulesToTargetingRules } from '../../../shared/utils/targetingMappers';
import { mapBackendStatusToUi } from '../../../shared/utils/stageMappers';
import type { BackendOfferStatus, StageApplication, StageOfferDetail } from '../../../shared/types/stageTypes';

export type OfferDetailNavSection =
  | 'overview'
  | 'description'
  | 'skills'
  | 'targeting'
  | 'recruitment'
  | 'publication'
  | 'applications'
  | 'import'
  | 'audit';

export interface OfferDescriptionSections {
  overview: string;
  responsibilities: string;
  requirements: string;
  benefits: string;
  additionalNotes: string;
}

export interface OfferApplicationInsights {
  total: number;
  accepted: number;
  rejected: number;
  pending: number;
  interviewing: number;
  conversionRate: number | null;
}

export interface OfferDetailViewModel {
  id: string;
  title: string;
  company: string;
  location: string;
  status: BackendOfferStatus;
  uiStatus: ReturnType<typeof mapBackendStatusToUi>;
  publicationStatus: string;
  internshipType: string;
  workMode: 'remote' | 'hybrid' | 'onsite' | null;
  department: string;
  positionsAvailable: number | null;
  durationMonths: number | null;
  referenceCode: string;
  languageRequirement: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  archivedAt: string;
  createdBy: string;
  source: string;
  description: OfferDescriptionSections;
  requiredSkills: string[];
  preferredSkills: string[];
  languages: string[];
  certifications: string[];
  softSkills: string[];
  yearsExperience: string;
  targeting: TargetingRules;
  targetingRuleCount: number;
  hasTargeting: boolean;
  applicationDeadline: string;
  startDate: string;
  endDate: string;
  externalUrl: string;
  applicationMethod: string;
  visibility: string;
  autoExpiration: boolean | null;
  compensation: string;
  minEducationLevel: string;
  viewCount: number;
  applicationCount: number;
  importInfo: {
    platform: string;
    url: string;
    importedBy: string;
    importDate: string;
    parserUsed: string;
  } | null;
  audit: {
    created: string;
    updated: string;
    published: string;
    archived: string;
    lastActivity: string;
  };
  applicationInsights: OfferApplicationInsights;
}

function readMeta(offer: StageOfferDetail): Record<string, unknown> {
  const meta = offer.metadata_json;
  return meta && typeof meta === 'object' && !Array.isArray(meta)
    ? (meta as Record<string, unknown>)
    : {};
}

function readString(value: unknown): string {
  if (value == null) return '';
  return String(value).trim();
}

function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map(String).filter(Boolean);
}

export function formatOfferDetailDate(iso: string | null | undefined, locale = 'fr-FR'): string {
  if (!iso) return '';
  try {
    return new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function formatOfferDetailDateOnly(iso: string | null | undefined, locale = 'fr-FR'): string {
  if (!iso) return '';
  try {
    return new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(iso));
  } catch {
    return iso.slice(0, 10);
  }
}

function resolveWorkMode(offer: StageOfferDetail): OfferDetailViewModel['workMode'] {
  if (offer.is_remote) return 'remote';
  if (offer.is_hybrid) return 'hybrid';
  if (offer.location_city || offer.location_country) return 'onsite';
  return null;
}

function resolvePublicationStatus(status: BackendOfferStatus): string {
  switch (status) {
    case 'PUBLISHED':
    case 'OPEN':
      return 'published';
    case 'DRAFT':
    case 'PENDING_REVIEW':
      return 'draft';
    case 'EXPIRED':
      return 'expired';
    case 'CLOSED':
      return 'closed';
    case 'ARCHIVED':
      return 'archived';
    default:
      return 'draft';
  }
}

function extractDescriptionSections(offer: StageOfferDetail): OfferDescriptionSections {
  const meta = readMeta(offer);
  const descMeta =
    meta.description_sections && typeof meta.description_sections === 'object'
      ? (meta.description_sections as Record<string, unknown>)
      : {};

  return {
    overview: readString(descMeta.overview) || readString(meta.overview) || readString(offer.description),
    responsibilities: readString(descMeta.responsibilities) || readString(meta.responsibilities),
    requirements: readString(descMeta.requirements) || readString(meta.requirements),
    benefits: readString(descMeta.benefits) || readString(meta.benefits),
    additionalNotes:
      readString(descMeta.learningOpportunities) ||
      readString(descMeta.additional_notes) ||
      readString(meta.learning_opportunities),
  };
}

function resolveApplicationMethod(offer: StageOfferDetail, meta: Record<string, unknown>): string {
  const fromMeta = readString(meta.application_method);
  if (fromMeta) return fromMeta;
  if (readString(offer.external_url)) return 'external';
  return 'internal';
}

function resolveVisibility(meta: Record<string, unknown>, hasTargeting: boolean): string {
  const fromMeta = readString(meta.visibility);
  if (fromMeta) return fromMeta;
  return hasTargeting ? 'targeted' : 'public';
}

function buildApplicationInsights(
  apps: StageApplication[],
  applicationCount: number,
): OfferApplicationInsights {
  const total = Math.max(applicationCount, apps.length);
  let accepted = 0;
  let rejected = 0;
  let pending = 0;
  let interviewing = 0;

  for (const app of apps) {
    const status = app.status.toUpperCase();
    if (status.includes('ACCEPT')) {
      accepted += 1;
    } else if (status.includes('REJECT') || status.includes('DECLIN')) {
      rejected += 1;
    } else if (status.includes('INTERVIEW')) {
      interviewing += 1;
    } else {
      pending += 1;
    }
  }

  const conversionRate = total > 0 ? Math.round((accepted / total) * 100) : null;

  return { total, accepted, rejected, pending, interviewing, conversionRate };
}

function resolveCompensation(offer: StageOfferDetail): string {
  const amount = offer.compensation_amount;
  if (amount == null || amount === '') return '';
  const currency = readString(offer.compensation_currency) || 'MAD';
  const period = readString(offer.compensation_period);
  return period && period !== 'NOT_SPECIFIED'
    ? `${amount} ${currency} (${period})`
    : `${amount} ${currency}`;
}

export function buildOfferDetailViewModel(
  offer: StageOfferDetail,
  applications: StageApplication[] = [],
): OfferDetailViewModel {
  const meta = readMeta(offer);
  const targeting = mapBackendRulesToTargetingRules(offer.targeting_rules);
  const hasTargeting = Object.values(targeting).some((items) => items.length > 0);
  const status = (offer.status ?? 'DRAFT') as BackendOfferStatus;
  const externalSource = readString(offer.external_source);
  const externalUrl = readString(offer.external_url);
  const importJobUuid = readString(meta.import_job_uuid);

  const importInfo =
    externalSource || externalUrl || importJobUuid
      ? {
          platform:
            readString(meta.source_platform) ||
            IMPORT_PLATFORM_LABELS[externalSource as keyof typeof IMPORT_PLATFORM_LABELS] ||
            externalSource ||
            '',
          url: externalUrl,
          importedBy: readString(meta.imported_by) || readString(meta.importedBy),
          importDate: formatOfferDetailDate(readString(meta.import_date) || readString(offer.created_at)),
          parserUsed: readString(meta.parser_used),
        }
      : null;

  const positionsRaw = meta.positions ?? meta.profiles_needed ?? meta.profilesNeeded;
  const positionsAvailable =
    typeof positionsRaw === 'number' ? positionsRaw : Number(positionsRaw) || null;

  return {
    id: offer.uuid,
    title: offer.title,
    company: offer.company_name,
    location: [offer.location_city, offer.location_country].filter(Boolean).join(', '),
    status,
    uiStatus: mapBackendStatusToUi(status),
    publicationStatus: resolvePublicationStatus(status),
    internshipType: readString(offer.offer_type),
    workMode: resolveWorkMode(offer),
    department: readString(meta.department),
    positionsAvailable,
    durationMonths: typeof offer.duration_months === 'number' ? offer.duration_months : null,
    referenceCode: readString(offer.slug) || offer.uuid.slice(0, 8).toUpperCase(),
    languageRequirement: readString(meta.language ?? meta.work_language),
    createdAt: formatOfferDetailDate(offer.created_at),
    updatedAt: formatOfferDetailDate(offer.updated_at),
    publishedAt: formatOfferDetailDate(offer.published_at),
    archivedAt: formatOfferDetailDate(readString(offer.archived_at)),
    createdBy: readString(meta.created_by) || readString(meta.createdBy) || '',
    source: externalSource ? 'import' : readString(meta.source) || 'manual',
    description: extractDescriptionSections(offer),
    requiredSkills: offer.required_skills ?? [],
    preferredSkills: offer.preferred_skills ?? [],
    languages: readStringArray(offer.required_languages ?? meta.languages),
    certifications: readStringArray(meta.certifications),
    softSkills: readStringArray(meta.soft_skills ?? meta.softSkills),
    yearsExperience: readString(meta.years_experience ?? meta.yearsExperience),
    targeting,
    targetingRuleCount: offer.targeting_rules?.length ?? 0,
    hasTargeting,
    applicationDeadline: formatOfferDetailDateOnly(offer.application_deadline),
    startDate: formatOfferDetailDateOnly(readString(offer.start_date)),
    endDate: formatOfferDetailDateOnly(readString(offer.end_date)),
    externalUrl,
    applicationMethod: resolveApplicationMethod(offer, meta),
    visibility: resolveVisibility(meta, hasTargeting),
    autoExpiration:
      typeof meta.auto_expiration === 'boolean'
        ? meta.auto_expiration
        : typeof meta.autoExpiration === 'boolean'
          ? meta.autoExpiration
          : null,
    compensation: resolveCompensation(offer),
    minEducationLevel: readString(offer.min_education_level),
    viewCount: offer.view_count ?? 0,
    applicationCount: offer.application_count ?? 0,
    importInfo,
    audit: {
      created: formatOfferDetailDate(offer.created_at),
      updated: formatOfferDetailDate(offer.updated_at),
      published: formatOfferDetailDate(offer.published_at),
      archived: formatOfferDetailDate(readString(offer.archived_at)),
      lastActivity: formatOfferDetailDate(
        readString(offer.updated_at) ||
          readString(offer.published_at) ||
          readString(offer.closed_at) ||
          offer.created_at,
      ),
    },
    applicationInsights: buildApplicationInsights(applications, offer.application_count ?? 0),
  };
}
