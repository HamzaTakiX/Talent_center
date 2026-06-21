import type {
  CreateOfferFormState,
  DescriptionSections,
  WorkMode,
} from '../../admin/offres-stage/types/createOfferWorkflow';
import { createEmptyOfferForm, EMPTY_DESCRIPTION } from '../../admin/offres-stage/types/createOfferWorkflow';
import { mapBackendRulesToTargetingRules, mapTargetingRulesToPayload } from './targetingMappers';
import type {
  BackendOfferStatus,
  StageOfferDetail,
  StageOfferListItem,
  StageOfferWritePayload,
  StageRecommendation,
  UiOfferStatus,
} from '../types/stageTypes';
import type { InternshipOffer } from '../../admin/offres-stage/types';
import type { InternshipOffer as StudentInternshipOffer, InternshipOfferDetails } from '../../student/internship_offers/types';
import { getApiBaseUrl } from '../../../shared/api/config';

function resolveMediaUrl(path: string): string {
  const trimmed = path.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const origin = getApiBaseUrl().replace(/\/api\/?$/i, '');
  return `${origin}${trimmed.startsWith('/') ? trimmed : `/${trimmed}`}`;
}

/** Logo URL from list or detail API payloads (detail historically omitted company_logo_url). */
export function resolveStageOfferLogoUrl(offer: StageOfferListItem | StageOfferDetail): string | null {
  const fromField = offer.company_logo_url;
  if (typeof fromField === 'string' && fromField.trim()) {
    return resolveMediaUrl(fromField);
  }

  const record = offer as StageOfferDetail;
  const metaLogo = record.metadata_json?.company_logo;
  if (typeof metaLogo === 'string' && metaLogo.trim()) {
    return resolveMediaUrl(metaLogo);
  }

  const uploadedLogo = record.company_logo;
  if (typeof uploadedLogo === 'string' && uploadedLogo.trim()) {
    return resolveMediaUrl(uploadedLogo);
  }

  return null;
}

export function mapBackendStatusToUi(status: BackendOfferStatus | string): UiOfferStatus {
  switch (status) {
    case 'OPEN':
    case 'PUBLISHED':
      return 'Active';
    case 'DRAFT':
    case 'PENDING_REVIEW':
      return 'Draft';
    case 'EXPIRED':
      return 'Expired';
    case 'CLOSED':
    case 'ARCHIVED':
      return 'Closed';
    default:
      return 'Draft';
  }
}

export function mapUiStatusToBackend(status: UiOfferStatus | 'all'): BackendOfferStatus | undefined {
  switch (status) {
    case 'Active':
      return 'OPEN';
    case 'Draft':
      return 'DRAFT';
    case 'Expired':
      return 'EXPIRED';
    case 'Closed':
      return 'CLOSED';
    default:
      return undefined;
  }
}

function formatDeadline(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(
      new Date(iso),
    );
  } catch {
    return iso;
  }
}

export function mapStageOfferToAdminRow(offer: StageOfferListItem): InternshipOffer {
  return {
    id: offer.uuid,
    title: offer.title,
    company: offer.company_name,
    companyLogoUrl: resolveStageOfferLogoUrl(offer),
    status: mapBackendStatusToUi(offer.status),
    applicants: offer.application_count,
    deadline: formatDeadline(offer.application_deadline),
    publishReadinessScore: offer.publish_readiness_score ?? null,
    publishReady: offer.publish_ready ?? null,
  };
}

export function mapStageOfferToStudentCard(
  offer: StageOfferListItem,
  matchPercent = 0,
): StudentInternshipOffer {
  const skills = [...(offer as StageOfferDetail).required_skills ?? []].slice(0, 3);
  return {
    id: offer.uuid,
    title: offer.title,
    company: offer.company_name,
    companyLogoUrl: resolveStageOfferLogoUrl(offer),
    location: offer.location_city || '—',
    tags: skills.length ? skills : [offer.offer_type],
    matchPercent,
    category: offer.offer_type as StudentInternshipOffer['category'],
  };
}

export function mapRecommendationToStudentCard(rec: StageRecommendation): StudentInternshipOffer {
  return {
    id: rec.offer_uuid,
    title: rec.offer_title,
    company: rec.company_name,
    location: '—',
    tags: Array.isArray(rec.reasons) ? rec.reasons.map(String).slice(0, 3) : [],
    matchPercent: Math.round(rec.score),
    category: 'Business',
  };
}

export function mapStageDetailToAdminDetail(
  offer: StageOfferDetail,
  applicants: { uuid: string; student_email: string; status: string; match_score_at_apply: number | null }[] = [],
) {
  return {
    id: offer.uuid,
    title: offer.title,
    company: offer.company_name,
    status: mapBackendStatusToUi(offer.status),
    applicants: offer.application_count,
    deadline: formatDeadline(offer.application_deadline),
    location: [offer.location_city, offer.location_country].filter(Boolean).join(', ') || '—',
    postedOn: formatDeadline(offer.published_at ?? offer.created_at),
    description: offer.description ?? '',
    skills: offer.required_skills ?? [],
    studentApplications: applicants.map((a) => ({
      id: a.uuid,
      studentName: a.student_email.split('@')[0] ?? a.student_email,
      classLabel: '—',
      field: '—',
      matchScore: a.match_score_at_apply ?? 0,
      status: a.status === 'ACCEPTED' ? ('Accepted' as const) : ('Pending' as const),
    })),
  };
}

function parseDescriptionFromApi(description?: string): DescriptionSections {
  const sections = { ...EMPTY_DESCRIPTION };
  if (!description?.trim()) return sections;

  const parts = description.split(/\n\n+/).map((part) => part.trim()).filter(Boolean);
  if (parts.length === 0) return sections;

  return {
    ...sections,
    overview: parts[0] ?? '',
    requirements: parts[1] ?? '',
    benefits: parts[2] ?? '',
  };
}

function mapWorkModeFlags(code: string): { is_remote: boolean; is_hybrid: boolean } {
  const normalized = String(code || 'onsite').toLowerCase();
  if (normalized === 'remote') return { is_remote: true, is_hybrid: false };
  if (normalized === 'hybrid' || normalized === 'flexible') return { is_remote: false, is_hybrid: true };
  return { is_remote: false, is_hybrid: false };
}

function resolveWorkMode(offer: StageOfferDetail): WorkMode {
  if (offer.is_remote && !offer.is_hybrid) return 'remote';
  if (offer.is_hybrid) return 'hybrid';
  return 'onsite';
}

function mergeTargetingFromOffer(offer: StageOfferDetail) {
  const fromRules = mapBackendRulesToTargetingRules(offer.targeting_rules);
  const mergeList = (ruleValues: string[], fieldValues: unknown) => {
    const fromField = Array.isArray(fieldValues) ? fieldValues.map(String) : [];
    return [...new Set([...ruleValues, ...fromField])];
  };

  return {
    programs: mergeList(fromRules.programs, offer.programs),
    classes: mergeList(fromRules.classes, offer.classes),
    levels: mergeList(fromRules.levels, offer.levels),
    departments: mergeList(fromRules.departments, offer.departments),
    categories: mergeList(fromRules.categories, offer.categories),
    internshipTypes: mergeList(fromRules.internshipTypes, offer.internship_types),
  };
}

export function mapStageDetailToCreateOfferForm(offer: StageOfferDetail): CreateOfferFormState {
  const empty = createEmptyOfferForm();
  const applicationMethod = offer.external_url ? 'external' : empty.recruitment.applicationMethod;

  return {
    ...empty,
    title: offer.title ?? '',
    company: offer.company_name ?? '',
    internshipType: String(offer.offer_type ?? '').toLowerCase(),
    location: offer.location_city ?? '',
    workMode: resolveWorkMode(offer),
    description: parseDescriptionFromApi(offer.description),
    requiredSkills: offer.required_skills ?? [],
    preferredSkills: offer.preferred_skills ?? [],
    targeting: mergeTargetingFromOffer(offer),
    recruitment: {
      ...empty.recruitment,
      applicationDeadline: offer.application_deadline?.slice(0, 10) ?? '',
      externalUrl: offer.external_url ?? '',
      applicationMethod,
    },
  };
}

export function mapCreateOfferFormToPayload(form: CreateOfferFormState): StageOfferWritePayload {
  const description = [
    form.description.overview,
    form.description.requirements,
    form.description.benefits,
  ]
    .filter(Boolean)
    .join('\n\n');

  return {
    title: form.title.trim(),
    company_name: form.company.trim(),
    description: description || undefined,
    location_city: form.location.trim() || undefined,
    offer_type: form.internshipType || undefined,
    ...mapWorkModeFlags(form.workMode),
    application_deadline: form.recruitment.applicationDeadline || null,
    required_skills: form.requiredSkills,
    preferred_skills: form.preferredSkills,
    external_url: form.recruitment.externalUrl || undefined,
    ...mapTargetingRulesToPayload(form.targeting),
  };
}

export function mapCreateOfferFormToImportOverrides(form: CreateOfferFormState): Record<string, unknown> {
  const payload = mapCreateOfferFormToPayload(form);
  return {
    ...payload,
    requirements: form.description.requirements,
    benefits: form.description.benefits,
    description: form.description.overview,
    preferred_skills: form.preferredSkills,
    required_languages: form.languages,
    location_city: form.location.trim() || undefined,
    is_remote: mapWorkModeFlags(form.workMode).is_remote,
    is_hybrid: mapWorkModeFlags(form.workMode).is_hybrid,
  };
}

export function mapStageDetailToStudentDetails(
  offer: StageOfferDetail,
  matchPercent = 0,
): InternshipOfferDetails {
  const requiredSkills = (offer.required_skills ?? []).map((label) => ({
    label,
    variant: 'primary' as const,
  }));
  return {
    id: offer.uuid,
    title: offer.title,
    company: offer.company_name,
    companyLogoUrl: resolveStageOfferLogoUrl(offer),
    location: offer.location_city || '—',
    tags: offer.required_skills?.slice(0, 3) ?? [],
    matchPercent,
    category: (offer.offer_type ?? 'Business') as StudentInternshipOffer['category'],
    description: offer.description ?? '',
    responsibilities: [],
    requiredProfile: offer.preferred_skills ?? [],
    requiredSkills,
    aiMatchSummary: '',
    matchingSkills: [],
    relevantExperience: [],
    skillsToDevelop: [],
    aiRecommendations: [],
  };
}
