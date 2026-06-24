import type {
  CreateOfferFormState,
  WorkMode,
} from '../../admin/offres-stage/types/createOfferWorkflow';
import { createEmptyOfferForm } from '../../admin/offres-stage/types/createOfferWorkflow';
import {
  extractDescriptionSections,
  formatOfferDetailDateOnly,
} from '../../admin/offres-stage/utils/offerDetailViewModel';
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
import { resolveOfferApplicationMethod } from '../../student/internship_offers/helpers/offerApplyAction';
import { getApiBaseUrl } from '../../../shared/api/config';

export function resolveMediaUrl(path: string): string {
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
      return 'Closed';
    case 'ARCHIVED':
      return 'Archived';
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
    case 'Archived':
      return 'ARCHIVED';
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

export function mapApplicationStatusToUi(
  status: string,
): 'Pending' | 'Accepted' | 'Rejected' | 'Interview' {
  const normalized = status.toUpperCase();
  if (
    normalized === 'ACCEPTED'
    || normalized === 'OFFER_ACCEPTED'
    || normalized === 'INTERNSHIP_STARTED'
    || normalized === 'INTERNSHIP_COMPLETED'
  ) {
    return 'Accepted';
  }
  if (
    normalized.includes('REJECT')
    || normalized === 'WITHDRAWN'
    || normalized === 'EXPIRED'
    || normalized === 'OFFER_DECLINED'
  ) {
    return 'Rejected';
  }
  if (normalized.includes('INTERVIEW') || normalized === 'SHORTLISTED') {
    return 'Interview';
  }
  return 'Pending';
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
    applicationDeadline: offer.application_deadline ?? null,
    publishReadinessScore: offer.publish_readiness_score ?? null,
    publishReady: offer.publish_ready ?? null,
    draftWorkflowStatus: offer.status === 'PENDING_REVIEW' ? 'pending_review' : 'draft',
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
    publishedAt: offer.published_at ?? offer.created_at ?? null,
    isRemote: offer.is_remote,
  };
}

function extractRecommendationTags(rec: StageRecommendation): string[] {
  const fromSkills = (rec.required_skills ?? []).map(String).filter(Boolean).slice(0, 3);
  if (fromSkills.length) return fromSkills;

  const fromOfferType = String(rec.offer_type ?? '').trim();
  if (fromOfferType) return [fromOfferType];

  const fromReasons: string[] = [];
  for (const reason of rec.reasons ?? []) {
    if (typeof reason === 'string' && reason.trim()) {
      fromReasons.push(reason.trim());
      continue;
    }
    if (!reason || typeof reason !== 'object') continue;

    const entry = reason as Record<string, unknown>;
    if (Array.isArray(entry.matched)) {
      for (const skill of entry.matched) {
        const label = String(skill ?? '').trim();
        if (label) fromReasons.push(label);
      }
      continue;
    }
    const label = String(entry.reason ?? entry.label ?? '').trim();
    if (label) fromReasons.push(label);
  }

  return fromReasons.slice(0, 3);
}

function resolveRecommendationLocation(rec: StageRecommendation): string {
  const city = String(rec.location_city ?? '').trim();
  const country = String(rec.location_country ?? '').trim();
  const joined = [city, country].filter(Boolean).join(', ');
  return joined || '—';
}

export function mapRecommendationToStudentCard(
  rec: StageRecommendation,
  matchPercent?: number,
): StudentInternshipOffer {
  const category = (rec.offer_type || 'Business') as StudentInternshipOffer['category'];
  return {
    id: rec.offer_uuid,
    title: rec.offer_title,
    company: rec.company_name,
    companyLogoUrl: rec.company_logo_url
      ? resolveMediaUrl(String(rec.company_logo_url))
      : null,
    location: resolveRecommendationLocation(rec),
    tags: extractRecommendationTags(rec),
    matchPercent: matchPercent ?? Math.round(rec.score),
    category,
  };
}

export function mapStageDetailToAdminDetail(
  offer: StageOfferDetail,
  applicants: {
    uuid: string;
    student_email: string;
    student_name?: string;
    student_class?: string;
    student_field?: string;
    status: string;
    match_score_at_apply: number | null;
  }[] = [],
) {
  const applicantRows = applicants.map((a) => ({
    id: a.uuid,
    studentName: a.student_name?.trim() || a.student_email.split('@')[0] || a.student_email,
    classLabel: a.student_class?.trim() || '—',
    field: a.student_field?.trim() || '—',
    matchScore: Math.round(Number(a.match_score_at_apply ?? 0)),
    status: mapApplicationStatusToUi(a.status),
  }));

  return {
    id: offer.uuid,
    title: offer.title,
    company: offer.company_name,
    status: mapBackendStatusToUi(offer.status),
    applicants: Math.max(offer.application_count, applicantRows.length),
    deadline: formatDeadline(offer.application_deadline),
    location: [offer.location_city, offer.location_country].filter(Boolean).join(', ') || '—',
    postedOn: formatDeadline(offer.published_at ?? offer.created_at),
    description: offer.description ?? '',
    skills: offer.required_skills ?? [],
    studentApplications: applicantRows,
  };
}

function splitTextToItems(text: string): string[] {
  if (!text.trim()) return [];
  return text
    .split(/\n+/)
    .map((line) => line.replace(/^[\s•\-*]+/, '').trim())
    .filter(Boolean);
}

function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map(String).filter(Boolean);
}

function resolveWorkModeLabel(offer: StageOfferDetail): string | null {
  if (offer.is_remote && !offer.is_hybrid) return 'remote';
  if (offer.is_hybrid) return 'hybrid';
  if (offer.location_city || offer.location_country) return 'onsite';
  return null;
}

function resolveCompensationLabel(offer: StageOfferDetail): string {
  const amount = offer.compensation_amount;
  if (amount == null || amount === '') return '';
  const currency = String(offer.compensation_currency || 'MAD').trim();
  const period = String(offer.compensation_period || '').trim();
  return period && period !== 'NOT_SPECIFIED'
    ? `${amount} ${currency} (${period})`
    : `${amount} ${currency}`;
}

function buildStudentOfferTags(offer: StageOfferDetail): string[] {
  const tags: string[] = [];
  const offerType = String(offer.offer_type ?? '').trim();
  if (offerType) tags.push(offerType);

  const workMode = resolveWorkModeLabel(offer);
  if (workMode === 'remote') tags.push('Remote');
  else if (workMode === 'hybrid') tags.push('Hybrid');

  if (offer.application_deadline) {
    tags.push(formatDeadline(offer.application_deadline));
  }

  return tags.length ? tags : (offer.required_skills?.slice(0, 2) ?? []);
}

function parseDescriptionFromApi(offer: StageOfferDetail): CreateOfferFormState['description'] {
  const sections = extractDescriptionSections(offer);
  return {
    overview: sections.overview,
    responsibilities: sections.responsibilities,
    requirements: sections.requirements,
    benefits: sections.benefits,
    learningOpportunities: sections.additionalNotes,
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
  const applicationMethod =
    (offer.metadata_json?.application_method as CreateOfferFormState['recruitment']['applicationMethod']) ||
    empty.recruitment.applicationMethod;
  const meta = offer.metadata_json ?? {};

  return {
    ...empty,
    title: offer.title ?? '',
    company: offer.company_name ?? '',
    internshipType: String(offer.offer_type ?? '').toLowerCase(),
    location: offer.location_city ?? '',
    workMode: resolveWorkMode(offer),
    description: parseDescriptionFromApi(offer),
    requiredSkills: offer.required_skills ?? [],
    preferredSkills: offer.preferred_skills ?? [],
    languages: readStringArray(offer.required_languages ?? meta.languages),
    softSkills: readStringArray(meta.soft_skills ?? meta.softSkills),
    certifications: readStringArray(meta.certifications),
    yearsExperience: String(meta.years_experience ?? meta.yearsExperience ?? ''),
    department: String(meta.department ?? ''),
    positions: Number(meta.positions ?? meta.profiles_needed ?? meta.profilesNeeded) || empty.positions,
    targeting: mergeTargetingFromOffer(offer),
    recruitment: {
      ...empty.recruitment,
      applicationDeadline: offer.application_deadline?.slice(0, 10) ?? '',
      startDate: offer.start_date?.slice(0, 10) ?? '',
      endDate: offer.end_date?.slice(0, 10) ?? '',
      externalUrl: offer.external_url ?? '',
      applicationMethod,
      visibility: String(meta.visibility ?? empty.recruitment.visibility) as CreateOfferFormState['recruitment']['visibility'],
      autoExpiration:
        typeof meta.auto_expiration === 'boolean'
          ? meta.auto_expiration
          : typeof meta.autoExpiration === 'boolean'
            ? meta.autoExpiration
            : empty.recruitment.autoExpiration,
      profilesNeeded:
        Number(meta.profiles_needed ?? meta.profilesNeeded) || empty.recruitment.profilesNeeded,
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
    start_date: form.recruitment.startDate || null,
    end_date: form.recruitment.endDate || null,
    required_skills: form.requiredSkills,
    preferred_skills: form.preferredSkills,
    required_languages: form.languages,
    external_url: form.recruitment.externalUrl || undefined,
    metadata_json: {
      description_sections: {
        overview: form.description.overview,
        responsibilities: form.description.responsibilities,
        requirements: form.description.requirements,
        benefits: form.description.benefits,
        learningOpportunities: form.description.learningOpportunities,
      },
      languages: form.languages,
      soft_skills: form.softSkills,
      certifications: form.certifications,
      years_experience: form.yearsExperience,
      department: form.department,
      profiles_needed: form.recruitment.profilesNeeded,
      visibility: form.recruitment.visibility,
      auto_expiration: form.recruitment.autoExpiration,
      application_method: form.recruitment.applicationMethod,
    },
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
  const sections = extractDescriptionSections(offer);
  const meta = offer.metadata_json ?? {};
  const requiredSkills = (offer.required_skills ?? []).map((label) => ({
    label,
    variant: 'primary' as const,
  }));
  const preferredSkills = offer.preferred_skills ?? [];
  const languages = readStringArray(offer.required_languages ?? meta.languages);

  return {
    id: offer.uuid,
    title: offer.title,
    company: offer.company_name,
    companyLogoUrl: resolveStageOfferLogoUrl(offer),
    location: [offer.location_city, offer.location_country].filter(Boolean).join(', ') || '—',
    tags: buildStudentOfferTags(offer),
    matchPercent,
    category: (offer.offer_type ?? 'Business') as StudentInternshipOffer['category'],
    description: sections.overview,
    requirements: sections.requirements,
    benefits: sections.benefits,
    learningOpportunities: sections.additionalNotes,
    responsibilities: splitTextToItems(sections.responsibilities),
    requiredProfile: splitTextToItems(sections.requirements),
    preferredSkills,
    languages,
    requiredSkills,
    applicationDeadline: formatOfferDetailDateOnly(offer.application_deadline),
    startDate: formatOfferDetailDateOnly(offer.start_date),
    endDate: formatOfferDetailDateOnly(offer.end_date),
    workMode: resolveWorkModeLabel(offer),
    internshipType: String(offer.offer_type ?? ''),
    compensation: resolveCompensationLabel(offer),
    durationMonths: typeof offer.duration_months === 'number' ? offer.duration_months : null,
    minEducationLevel: String(offer.min_education_level ?? '').trim(),
    externalUrl: String(offer.external_url ?? '').trim(),
    applicationMethod: resolveOfferApplicationMethod({
      externalUrl: offer.external_url,
      metadata: offer.metadata_json ?? undefined,
    }),
    aiMatchSummary: '',
    matchingSkills: [],
    relevantExperience: [],
    skillsToDevelop: [],
    aiRecommendations: [],
  };
}
