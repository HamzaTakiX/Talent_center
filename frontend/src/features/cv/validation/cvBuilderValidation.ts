export interface CvValidationIssue {
  code: string;
  section: string;
  severity: string;
  message_key: string;
}

const text = (v: unknown) => (typeof v === 'string' ? v.trim() : '');

const hasContact = (details: Record<string, unknown>) =>
  ['email', 'phone', 'location', 'website', 'github', 'linkedin'].some((k) => text(details[k]));

const entryFilled = (entry: Record<string, unknown>, ...fields: string[]) =>
  fields.some((f) => text(entry[f]));

export function validateCvPayload(payload: Record<string, unknown>): {
  valid: boolean;
  issues: CvValidationIssue[];
} {
  const issues: CvValidationIssue[] = [];
  const details = (payload.details as Record<string, unknown>) || {};

  if (!text(details.name)) {
    issues.push({
      code: 'missing_full_name',
      section: 'contact',
      severity: 'high',
      message_key: 'cv.ai.validation.missingFullName',
    });
  }
  if (!text(details.role)) {
    issues.push({
      code: 'missing_professional_title',
      section: 'profile_summary',
      severity: 'high',
      message_key: 'cv.ai.validation.missingTitle',
    });
  }
  if (!hasContact(details)) {
    issues.push({
      code: 'missing_contact',
      section: 'contact',
      severity: 'high',
      message_key: 'cv.ai.validation.missingContact',
    });
  }
  if (!text(details.about)) {
    issues.push({
      code: 'missing_summary',
      section: 'profile_summary',
      severity: 'high',
      message_key: 'cv.ai.validation.missingSummary',
    });
  }

  const education = (payload.education as Record<string, unknown>[]) || [];
  if (!education.some((e) => entryFilled(e, 'institution', 'qualification', 'date'))) {
    issues.push({
      code: 'missing_education',
      section: 'education',
      severity: 'high',
      message_key: 'cv.ai.validation.missingEducation',
    });
  }

  const work = (payload.workExp as Record<string, unknown>[]) || [];
  const projects = (payload.projects as Record<string, unknown>[]) || [];
  const expOk = work.some((w) => entryFilled(w, 'company', 'title', 'desc', 'date'));
  const projOk = projects.some((p) => entryFilled(p, 'name', 'desc', 'link'));
  if (!expOk && !projOk) {
    issues.push({
      code: 'missing_experience_or_project',
      section: 'experience',
      severity: 'high',
      message_key: 'cv.ai.validation.missingExperience',
    });
  }

  const skills = (payload.skills as Record<string, unknown>[]) || [];
  if (!skills.some((s) => text(s.name))) {
    issues.push({
      code: 'missing_skills',
      section: 'skills',
      severity: 'high',
      message_key: 'cv.ai.validation.missingSkills',
    });
  }

  const languages = (payload.languages as Record<string, unknown>[]) || [];
  if (!languages.some((l) => entryFilled(l, 'name', 'level'))) {
    issues.push({
      code: 'missing_languages',
      section: 'languages',
      severity: 'high',
      message_key: 'cv.ai.validation.missingLanguages',
    });
  }

  return { valid: issues.length === 0, issues };
}
