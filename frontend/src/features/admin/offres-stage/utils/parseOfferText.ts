import type { CreateOfferFormState } from '../types/createOfferWorkflow';
import { createEmptyOfferForm } from '../types/createOfferWorkflow';

/* -------------------------------------------------------------------------- */
/*  Keyword maps – French and English section headers                         */
/* -------------------------------------------------------------------------- */

const TITLE_KEYS = [
  'titre', 'title', 'poste', 'position', "intitulé du poste", 'intitule du poste',
  'intitulé', 'intitule', 'offre', 'offer title', 'job title',
];

const COMPANY_KEYS = [
  'entreprise', 'company', 'société', 'societe', 'organisation', 'organization',
  'employeur', 'employer', 'recruteur', 'recruiter',
];

const LOCATION_KEYS = [
  'ville', 'location', 'localisation', 'lieu', 'city', 'adresse', 'address',
  'lieu de stage', 'site',
];

const TYPE_KEYS = [
  'type', 'type de stage', "type d'offre", 'type offre', 'internship type',
  'catégorie', 'categorie', 'nature du stage', 'nature',
];

const WORKMODE_KEYS = [
  'mode de travail', 'mode', 'work mode', 'télétravail', 'remote', 'présentiel',
  'presentiel', 'hybride', 'hybrid',
];

const DEADLINE_KEYS = [
  'date limite', 'deadline', 'date de clôture', 'date de cloture',
  'date limite de candidature', 'date expiration', 'closing date',
  'date limite de dépôt', 'date fin', 'date fin de candidature',
];

const OVERVIEW_KEYS = [
  'description', 'présentation', 'presentation', 'à propos', 'a propos',
  'about', 'mission', 'contexte', 'context', 'overview', 'résumé', 'resume',
  'introduction', 'profil de poste', 'description du poste',
];

const RESPONSIBILITIES_KEYS = [
  'missions', 'responsabilités', 'responsabilites', 'responsibilities',
  'tâches', 'taches', 'activités', 'activites', 'missions et activités',
  'missions et tâches', 'vos missions', 'votre mission', 'votre rôle',
  'votre role', 'rôle', 'role', 'tasks',
];

const REQUIREMENTS_KEYS = [
  'prérequis', 'prerequis', 'requirements', 'profil requis', 'profil recherché',
  'profil recherche', 'conditions', 'criteria', 'critères', 'criteres',
  'votre profil', 'profil', 'exigences', 'qualifications', 'we are looking for',
  'nous recherchons',
];

const SKILLS_KEYS = [
  'compétences', 'competences', 'compétences requises', 'competences requises',
  'skills', 'required skills', 'hard skills', 'technologies', 'stack',
  'outils', 'tools', 'langages', 'frameworks', 'compétences techniques',
  'competences techniques', 'tech stack',
];

const PREFERRED_SKILLS_KEYS = [
  'compétences souhaitées', 'competences souhaitees', 'preferred skills',
  'compétences appréciées', 'soft skills', 'atouts', 'bonus', 'nice to have',
  'un plus', 'compétences optionnelles', 'optionnel',
];

const BENEFITS_KEYS = [
  'avantages', 'benefits', 'ce que nous offrons', 'nous offrons',
  'what we offer', 'what you will get', 'perks', 'compensations',
  'nous vous offrons', 'avantages du poste', 'remuneration', 'rémunération',
];

const LANGUAGES_KEYS = [
  'langues', 'languages', 'langue', 'language', 'langues requises',
  'langues souhaitées', 'langues parlées',
];

/* -------------------------------------------------------------------------- */
/*  Internship type normalizer                                                 */
/* -------------------------------------------------------------------------- */

function normalizeType(raw: string): string {
  const s = raw.toLowerCase().trim();
  if (s.includes('pfe')) return 'pfe';
  if (s.includes('pfa')) return 'pfa';
  if (s.includes('alternance')) return 'alternance';
  if (s.includes('été') || s.includes('summer') || s.includes('estival')) return 'summer';
  if (s.includes('observation')) return 'observation';
  if (s.includes('stage') || s.includes('intern')) return 'internship';
  return s;
}

function normalizeWorkMode(raw: string): string {
  const s = raw.toLowerCase().trim();
  if (s === 'remote' || s.includes('télétravail') || s.includes('à distance') || s.includes('distance') || s.includes('remote')) return 'remote';
  if (s.includes('hybrid')) return 'hybrid';
  return 'onsite';
}

/* -------------------------------------------------------------------------- */
/*  List parser — comma/semicolon/newline/dash lists                          */
/* -------------------------------------------------------------------------- */

function parseList(raw: string): string[] {
  // Strip leading dashes, asterisks, bullets
  const cleaned = raw.split('\n')
    .map((line) => line.replace(/^[\s\-\*•·▪▸►]+/, '').trim())
    .filter(Boolean)
    .join('\n');

  const byNewline = cleaned.split('\n').map((s) => s.trim()).filter(Boolean);
  if (byNewline.length > 1) return byNewline;

  // Try comma or semicolon split
  return cleaned.split(/[,;]/).map((s) => s.trim()).filter(Boolean);
}

/* -------------------------------------------------------------------------- */
/*  Core parser                                                                */
/* -------------------------------------------------------------------------- */

type SectionMap = Record<string, string>;

/**
 * Split raw text into named sections.
 * A section starts on a line like: "Key:" or "Key: inline value"
 * Content continues until the next section header.
 */
function extractSections(text: string): SectionMap {
  const sections: SectionMap = {};
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');

  let currentKey: string | null = null;
  let currentLines: string[] = [];

  const flush = () => {
    if (currentKey !== null) {
      sections[currentKey] = currentLines.join('\n').trim();
    }
  };

  // Regex: "some text:" at start of line (section header) or "key: value" (inline)
  const headerRe = /^([^:\n]{2,60})\s*:\s*(.*)$/;

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const match = headerRe.exec(line);

    if (match) {
      const key = match[1].trim().toLowerCase();
      const value = match[2].trim();

      flush();
      currentKey = key;
      currentLines = value ? [value] : [];
    } else if (currentKey !== null) {
      currentLines.push(line);
    }
  }

  flush();
  return sections;
}

/** Find the first value in `sections` whose key starts with (or equals) any keyword. */
function findField(sections: SectionMap, keys: string[]): string | null {
  for (const [key, value] of Object.entries(sections)) {
    for (const kw of keys) {
      if (key === kw || key.startsWith(kw) || kw.startsWith(key)) {
        return value || null;
      }
    }
  }
  return null;
}

/* -------------------------------------------------------------------------- */
/*  Public API                                                                 */
/* -------------------------------------------------------------------------- */

export interface ParseOfferTextResult {
  form: CreateOfferFormState;
  /** keys that were successfully extracted */
  extracted: string[];
  /** raw sections detected (for debugging / display) */
  sections: SectionMap;
}

export function parseOfferText(text: string): ParseOfferTextResult {
  const base = createEmptyOfferForm();
  const sections = extractSections(text);
  const extracted: string[] = [];

  const take = (field: string, keys: string[], transform?: (v: string) => string): string | null => {
    const v = findField(sections, keys);
    if (v) {
      extracted.push(field);
      return transform ? transform(v) : v;
    }
    return null;
  };

  // --- Single-line string fields ---
  const title = take('title', TITLE_KEYS);
  const company = take('company', COMPANY_KEYS);
  const location = take('location', LOCATION_KEYS);
  const internshipType = take('internshipType', TYPE_KEYS, normalizeType);
  const workMode = take('workMode', WORKMODE_KEYS, normalizeWorkMode);

  // --- Deadline ---
  const deadlineRaw = take('deadline', DEADLINE_KEYS);
  let applicationDeadline = base.recruitment.applicationDeadline;
  if (deadlineRaw) {
    // Try to parse a date — accept formats like YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY
    const iso = parseDate(deadlineRaw);
    if (iso) applicationDeadline = iso;
  }

  // --- Description sections ---
  const overview = findField(sections, OVERVIEW_KEYS);
  const responsibilities = findField(sections, RESPONSIBILITIES_KEYS);
  const requirements = findField(sections, REQUIREMENTS_KEYS);
  const benefits = findField(sections, BENEFITS_KEYS);

  if (overview) extracted.push('overview');
  if (responsibilities) extracted.push('responsibilities');
  if (requirements) extracted.push('requirements');
  if (benefits) extracted.push('benefits');

  // --- Skills ---
  const skillsRaw = findField(sections, SKILLS_KEYS);
  const preferredRaw = findField(sections, PREFERRED_SKILLS_KEYS);
  const languagesRaw = findField(sections, LANGUAGES_KEYS);

  const requiredSkills = skillsRaw ? parseList(skillsRaw) : base.requiredSkills;
  const preferredSkills = preferredRaw ? parseList(preferredRaw) : base.preferredSkills;
  const languages = languagesRaw ? parseList(languagesRaw) : base.languages;

  if (skillsRaw) extracted.push('requiredSkills');
  if (preferredRaw) extracted.push('preferredSkills');
  if (languagesRaw) extracted.push('languages');

  const form: CreateOfferFormState = {
    ...base,
    title: title ?? base.title,
    company: company ?? base.company,
    location: location ?? base.location,
    internshipType: internshipType ?? base.internshipType,
    workMode: workMode ?? base.workMode,
    description: {
      overview: overview ?? base.description.overview,
      responsibilities: responsibilities ?? base.description.responsibilities,
      requirements: requirements ?? base.description.requirements,
      benefits: benefits ?? base.description.benefits,
      learningOpportunities: base.description.learningOpportunities,
    },
    requiredSkills,
    preferredSkills,
    languages,
    recruitment: {
      ...base.recruitment,
      applicationDeadline,
    },
  };

  return { form, extracted, sections };
}

/* -------------------------------------------------------------------------- */
/*  Date helpers                                                               */
/* -------------------------------------------------------------------------- */

function parseDate(raw: string): string | null {
  const s = raw.trim();

  // Already ISO: 2025-12-31
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  // DD/MM/YYYY or DD-MM-YYYY
  const dmy = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/.exec(s);
  if (dmy) {
    const [, d, m, y] = dmy;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // MM/DD/YYYY
  const mdy = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s);
  if (mdy) {
    const [, m, d, y] = mdy;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // Try native Date parse as fallback
  const parsed = new Date(s);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }

  return null;
}
