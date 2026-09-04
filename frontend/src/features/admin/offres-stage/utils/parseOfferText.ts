import type { CreateOfferFormState } from '../types/createOfferWorkflow';
import { createEmptyOfferForm } from '../types/createOfferWorkflow';

/* -------------------------------------------------------------------------- */
/*  Canonical fields                                                          */
/* -------------------------------------------------------------------------- */

type FieldId =
  | 'title'
  | 'company'
  | 'location'
  | 'internshipType'
  | 'workMode'
  | 'department'
  | 'positions'
  | 'deadline'
  | 'startDate'
  | 'endDate'
  | 'duration'
  | 'overview'
  | 'responsibilities'
  | 'requirements'
  | 'benefits'
  | 'learningOpportunities'
  | 'requiredSkills'
  | 'preferredSkills'
  | 'softSkills'
  | 'languages';

/**
 * Section headers, French / English / Arabic-transliterated, mapped to the form
 * field they feed. Keys are compared accent- and case-insensitively.
 *
 * A line is only treated as a section header when its label resolves here.
 * Any other `something: something` line stays part of the current section, so
 * prose such as "Note : le stage est rémunéré" no longer shreds the document
 * into meaningless sections.
 */
const HEADER_KEYWORDS: Array<[FieldId, string[]]> = [
  ['title', [
    'titre', 'titre de loffre', 'titre du poste', 'title', 'job title', 'offer title',
    'poste', 'position', 'intitule', 'intitule du poste', 'offre', 'job', 'role recherche',
  ]],
  ['company', [
    'entreprise', 'company', 'societe', 'organisation', 'organization', 'employeur',
    'employer', 'recruteur', 'recruiter', 'nom de lentreprise', 'company name',
    'a propos de lentreprise', 'about the company', 'qui sommes nous',
  ]],
  ['location', [
    'ville', 'localisation', 'location', 'lieu', 'lieu de stage', 'lieu de travail',
    'city', 'adresse', 'address', 'region', 'pays', 'country', 'site',
  ]],
  ['internshipType', [
    'type', 'type de stage', 'type doffre', 'type offre', 'internship type',
    'categorie', 'category', 'nature du stage', 'nature', 'contrat', 'contract',
    'type de contrat', 'contract type',
  ]],
  ['workMode', [
    'mode de travail', 'mode', 'work mode', 'modalite', 'modalites', 'teletravail',
    'remote', 'presentiel', 'hybride', 'hybrid', 'working mode',
  ]],
  ['department', [
    'departement', 'department', 'service', 'equipe', 'team', 'direction', 'pole',
  ]],
  ['positions', [
    'nombre de postes', 'postes', 'nombre de places', 'places', 'openings',
    'number of positions', 'positions', 'effectif',
  ]],
  ['deadline', [
    'date limite', 'date limite de candidature', 'date limite de depot', 'deadline',
    'application deadline', 'date de cloture', 'date expiration', 'date dexpiration',
    'closing date', 'candidature avant', 'a postuler avant',
  ]],
  ['startDate', [
    'date de debut', 'debut du stage', 'start date', 'date de demarrage',
    'disponibilite', 'starting date', 'date de prise de poste',
  ]],
  ['endDate', [
    'date de fin', 'fin du stage', 'end date',
  ]],
  ['duration', [
    'duree', 'duree du stage', 'duration', 'periode', 'period',
  ]],
  ['overview', [
    'description', 'description du poste', 'description de loffre', 'job description',
    'presentation', 'presentation du poste', 'a propos', 'about', 'about the role',
    'contexte', 'context', 'overview', 'resume', 'summary', 'introduction',
    'profil de poste', 'objectif', 'objectif du stage', 'objectifs',
  ]],
  ['responsibilities', [
    'missions', 'mission', 'vos missions', 'votre mission', 'missions principales',
    'missions et activites', 'missions et taches', 'responsabilites',
    'responsibilities', 'taches', 'taches principales', 'activites', 'votre role',
    'votre quotidien', 'tasks', 'what you will do', 'ce que vous ferez',
    'principales missions',
  ]],
  ['requirements', [
    'prerequis', 'pre requis', 'requirements', 'profil requis', 'profil recherche',
    'profil', 'votre profil', 'conditions', 'conditions requises', 'criteres',
    'criteria', 'exigences', 'qualifications', 'we are looking for',
    'nous recherchons', 'ce que nous attendons', 'formation requise', 'niveau requis',
  ]],
  ['benefits', [
    'avantages', 'avantages du poste', 'benefits', 'ce que nous offrons',
    'nous offrons', 'nous vous offrons', 'what we offer', 'what you will get',
    'perks', 'remuneration', 'gratification', 'salaire', 'salary', 'compensation',
    'compensations',
  ]],
  ['learningOpportunities', [
    'apprentissage', 'ce que vous apprendrez', 'learning', 'learning opportunities',
    'opportunites', 'perspectives', 'evolution', 'what you will learn',
    'encadrement', 'formation',
  ]],
  ['requiredSkills', [
    'competences', 'competences requises', 'competences techniques', 'skills',
    'required skills', 'hard skills', 'technical skills', 'technologies',
    'technologies utilisees', 'stack', 'tech stack', 'outils', 'tools', 'langages',
    'frameworks', 'environnement technique',
  ]],
  ['preferredSkills', [
    'competences souhaitees', 'competences appreciees', 'competences optionnelles',
    'preferred skills', 'nice to have', 'atouts', 'un plus', 'bonus', 'optionnel',
    'serait un plus',
  ]],
  ['softSkills', [
    'soft skills', 'savoir etre', 'qualites', 'qualites personnelles',
    'competences comportementales', 'aptitudes',
  ]],
  ['languages', [
    'langues', 'langue', 'languages', 'language', 'langues requises',
    'langues souhaitees', 'langues parlees', 'niveau de langue',
  ]],
];

/** Fields whose content is a list rather than a paragraph. */
const LIST_FIELDS = new Set<FieldId>([
  'requiredSkills',
  'preferredSkills',
  'softSkills',
  'languages',
]);

/* -------------------------------------------------------------------------- */
/*  Text normalisation                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Word, Google Docs and most job boards paste characters that break naive
 * parsing: non-breaking spaces around French colons, zero-width joiners, curly
 * quotes and private-use-area bullet glyphs (Wingdings). Fold them all to their
 * ASCII equivalent before doing anything else.
 */
function normalizeText(raw: string): string {
  return raw
    .replace(/\r\n?/g, '\n')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/[\u00A0\u2007\u202F\u2009\u2002-\u2006]/g, ' ')
    .replace(/[\u2018\u2019\u201B\u2032]/g, "'")
    .replace(/[\u201C\u201D\u201E\u2033]/g, '"')
    .replace(/[\u2013\u2014\u2212]/g, '-')
    .replace(/[\u2026]/g, '...')
    .replace(/^[ \t]*[\u2022\u25AA\u25CF\u25E6\u2023\u2043\u00B7\u25B8\u25BA\u2794\uF0A7\uF0B7\uF0FC\u2751\u25AB\u2043]+[ \t]*/gm, '- ')
    .replace(/[ \t]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n');
}

function foldKey(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Longest-match lookup so "type de stage" wins over "type". */
const KEYWORD_TO_FIELD: Array<[string, FieldId]> = HEADER_KEYWORDS
  .flatMap(([field, keywords]) => keywords.map((kw) => [foldKey(kw), field] as [string, FieldId]))
  .sort((a, b) => b[0].length - a[0].length);

/**
 * Resolve a candidate label to a canonical field.
 * Accepts decorations frequently found in pasted offers: leading numbering
 * ("1.", "II -"), surrounding markdown emphasis, and trailing qualifiers
 * ("Missions (principales)").
 */
function matchFieldKey(candidate: string): FieldId | null {
  const cleaned = candidate
    .replace(/^[\s#>*_\-–—]+/, '')
    .replace(/^[0-9IVXivx]{1,4}\s*[.)\-–]\s*/, '')
    .replace(/\([^)]*\)/g, ' ');
  const folded = foldKey(cleaned);
  if (!folded || folded.length > 60) return null;

  for (const [keyword, field] of KEYWORD_TO_FIELD) {
    if (folded === keyword) return field;
  }
  // Prefix match on a word boundary: "missions principales du stagiaire".
  for (const [keyword, field] of KEYWORD_TO_FIELD) {
    if (keyword.length < 4) continue;
    if (folded.startsWith(`${keyword} `)) return field;
  }
  return null;
}

/** A bare heading line: no colon, short, no terminal punctuation. */
function looksLikeHeading(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed || trimmed.length > 60) return false;
  if (trimmed.startsWith('-')) return false;
  return !/[.!?,;]$/.test(trimmed);
}

/* -------------------------------------------------------------------------- */
/*  Value normalisers                                                         */
/* -------------------------------------------------------------------------- */

function normalizeType(raw: string): string {
  const s = foldKey(raw);
  if (s.includes('pfe') || s.includes('fin d etudes') || s.includes('fin detudes')) return 'pfe';
  if (s.includes('pfa') || s.includes('fin d annee')) return 'pfa';
  if (s.includes('alternance') || s.includes('apprentissage')) return 'alternance';
  if (s.includes('ete') || s.includes('summer') || s.includes('estival')) return 'summer';
  if (s.includes('observation') || s.includes('decouverte')) return 'observation';
  if (s.includes('initiation')) return 'initiation';
  if (s.includes('stage') || s.includes('intern')) return 'internship';
  return '';
}

function normalizeWorkMode(raw: string): string {
  const s = foldKey(raw);
  if (s.includes('hybrid')) return 'hybrid';
  if (s.includes('remote') || s.includes('teletravail') || s.includes('distance')) return 'remote';
  if (s.includes('presentiel') || s.includes('on site') || s.includes('onsite') || s.includes('sur place')) return 'onsite';
  return '';
}

function parseList(raw: string): string[] {
  const lines = raw
    .split('\n')
    .map((line) => line.replace(/^[\s\-*]+/, '').replace(/^\d+[.)]\s*/, '').trim())
    .filter(Boolean);

  const items = lines.length > 1
    ? lines
    : (lines[0] ?? '').split(/[,;/|]|\s+\/\s+/);

  const seen = new Set<string>();
  const result: string[] = [];
  for (const item of items) {
    const value = item.replace(/^[\s\-*]+/, '').replace(/[.;,]+$/, '').trim();
    if (!value || value.length > 80) continue;
    const dedupeKey = foldKey(value);
    if (!dedupeKey || seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);
    result.push(value);
  }
  return result;
}

const MONTHS: Record<string, number> = {
  janvier: 1, january: 1, jan: 1,
  fevrier: 2, february: 2, feb: 2, fev: 2,
  mars: 3, march: 3, mar: 3,
  avril: 4, april: 4, avr: 4, apr: 4,
  mai: 5, may: 5,
  juin: 6, june: 6, jun: 6,
  juillet: 7, july: 7, jul: 7, juil: 7,
  aout: 8, august: 8, aug: 8,
  septembre: 9, september: 9, sep: 9, sept: 9,
  octobre: 10, october: 10, oct: 10,
  novembre: 11, november: 11, nov: 11,
  decembre: 12, december: 12, dec: 12,
};

function toIso(year: number, month: number, day: number): string | null {
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const iso = `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const probe = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(probe.getTime())) return null;
  return iso;
}

/**
 * Parse the first date found in `raw`.
 * Day-first is assumed for ambiguous `x/y/z` because the platform is
 * French-speaking; a day > 12 in the second position flips the reading.
 * The native `Date` fallback was removed: it silently turned "15" or
 * "Compétences" into a date in some locales.
 */
function parseDate(raw: string): string | null {
  const s = raw.trim();

  const iso = /(\d{4})-(\d{1,2})-(\d{1,2})/.exec(s);
  if (iso) return toIso(Number(iso[1]), Number(iso[2]), Number(iso[3]));

  const numeric = /(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{2,4})/.exec(s);
  if (numeric) {
    let [, first, second, yearRaw] = numeric;
    let year = Number(yearRaw);
    if (year < 100) year += year < 70 ? 2000 : 1900;
    let day = Number(first);
    let month = Number(second);
    if (month > 12 && day <= 12) {
      [day, month] = [month, day];
    }
    return toIso(year, month, day);
  }

  const textual = /(\d{1,2})(?:er)?\s+([A-Za-zÀ-ÿ]{3,10})\.?\s+(\d{4})/.exec(s);
  if (textual) {
    const month = MONTHS[foldKey(textual[2])];
    if (month) return toIso(Number(textual[3]), month, Number(textual[1]));
  }

  const monthFirst = /([A-Za-zÀ-ÿ]{3,10})\.?\s+(\d{1,2}),?\s+(\d{4})/.exec(s);
  if (monthFirst) {
    const month = MONTHS[foldKey(monthFirst[1])];
    if (month) return toIso(Number(monthFirst[3]), month, Number(monthFirst[2]));
  }

  return null;
}

function parsePositions(raw: string): number | null {
  const match = /\d{1,3}/.exec(raw);
  if (!match) return null;
  const value = Number(match[0]);
  return value > 0 && value <= 999 ? value : null;
}

/* -------------------------------------------------------------------------- */
/*  Sectioning                                                               */
/* -------------------------------------------------------------------------- */

export type OfferTextSections = Partial<Record<FieldId, string>>;

interface SplitResult {
  sections: OfferTextSections;
  /** Lines before the first recognised header — usually title / company / city. */
  preamble: string[];
}

const INLINE_HEADER_RE = /^\s*([^:\n]{2,60}?)\s*:\s*(.*)$/;

function splitSections(text: string): SplitResult {
  const sections: OfferTextSections = {};
  const preamble: string[] = [];
  const buffers = new Map<FieldId, string[]>();

  let current: FieldId | null = null;

  const push = (field: FieldId, line: string) => {
    const buffer = buffers.get(field);
    if (buffer) buffer.push(line);
    else buffers.set(field, [line]);
  };

  for (const rawLine of text.split('\n')) {
    const line = rawLine.trimEnd();

    const inline = INLINE_HEADER_RE.exec(line);
    const inlineField = inline ? matchFieldKey(inline[1]) : null;
    if (inline && inlineField) {
      current = inlineField;
      const value = inline[2].trim();
      if (value) push(inlineField, value);
      else if (!buffers.has(inlineField)) buffers.set(inlineField, []);
      continue;
    }

    if (!inline && looksLikeHeading(line)) {
      const headingField = matchFieldKey(line);
      if (headingField) {
        current = headingField;
        if (!buffers.has(headingField)) buffers.set(headingField, []);
        continue;
      }
    }

    if (current) push(current, line);
    else if (line.trim()) preamble.push(line.trim());
  }

  for (const [field, lines] of buffers) {
    const value = lines.join('\n').trim();
    if (value) sections[field] = value;
  }

  return { sections, preamble };
}

/* -------------------------------------------------------------------------- */
/*  Whole-document fallbacks                                                  */
/* -------------------------------------------------------------------------- */

const COMPANY_HINT_RE = /\b(?:chez|au sein de|pour le compte de|at)\s+([A-Z][\w&''.\-]*(?:\s+[A-Z][\w&''.\-]*){0,3})/;

const KNOWN_CITIES = [
  'Casablanca', 'Rabat', 'Marrakech', 'Marrakesh', 'Tanger', 'Tangier', 'Fès', 'Fes',
  'Agadir', 'Meknès', 'Meknes', 'Oujda', 'Kénitra', 'Kenitra', 'Tétouan', 'Tetouan',
  'Salé', 'Sale', 'Mohammedia', 'El Jadida', 'Safi', 'Beni Mellal', 'Nador',
  'Laâyoune', 'Laayoune', 'Dakhla', 'Essaouira', 'Ifrane', 'Berrechid', 'Settat',
  'Paris', 'Lyon', 'Marseille', 'Toulouse', 'Lille', 'Bordeaux', 'Nantes',
  'Madrid', 'Barcelone', 'Barcelona', 'Bruxelles', 'Brussels', 'Genève', 'Geneva',
  'Montréal', 'Montreal', 'Londres', 'London', 'Dubaï', 'Dubai',
];

function detectCity(text: string): string | null {
  for (const city of KNOWN_CITIES) {
    const re = new RegExp(`\\b${city.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (re.test(text)) return city;
  }
  return null;
}

/** Deadline mentioned mid-sentence, e.g. "Candidatures avant le 15/09/2025". */
function detectDeadline(text: string): string | null {
  const re = /(?:date limite|deadline|avant le|jusqu'au|jusqu au|closing date|apply before|postuler avant)[^\n]{0,40}/gi;
  for (const match of text.match(re) ?? []) {
    const iso = parseDate(match);
    if (iso) return iso;
  }
  return null;
}

/* -------------------------------------------------------------------------- */
/*  Public API                                                                */
/* -------------------------------------------------------------------------- */

export type ParseOfferTextErrorCode = 'text_too_short' | 'no_fields_extracted';

export interface ParseOfferTextResult {
  form: CreateOfferFormState;
  /** Canonical field names that received a value. */
  extracted: string[];
  /** Recognised sections, keyed by canonical field (debug / preview). */
  sections: OfferTextSections;
  /** Fields the publish flow still needs from the user. */
  missing: string[];
  error: ParseOfferTextErrorCode | null;
}

const MIN_USABLE_LENGTH = 40;

export function parseOfferText(text: string): ParseOfferTextResult {
  const base = createEmptyOfferForm();
  const normalized = normalizeText(text ?? '');
  const trimmed = normalized.trim();

  if (trimmed.length < MIN_USABLE_LENGTH) {
    return {
      form: base,
      extracted: [],
      sections: {},
      missing: ['title', 'company', 'overview'],
      error: 'text_too_short',
    };
  }

  const { sections, preamble } = splitSections(normalized);
  const extracted = new Set<string>();

  const takeText = (field: FieldId): string | null => {
    const value = sections[field]?.trim();
    if (!value) return null;
    extracted.add(field);
    return value;
  };

  const takeList = (field: FieldId): string[] | null => {
    const value = sections[field]?.trim();
    if (!value) return null;
    const items = parseList(value);
    if (!items.length) return null;
    extracted.add(field);
    return items;
  };

  // --- Identity fields, with whole-document fallbacks ---------------------
  let title = takeText('title');
  let company = takeText('company');
  let location = takeText('location');

  // A pasted job posting normally starts with the title, then the company,
  // then the city. Use the preamble only for what the labels did not provide.
  const preambleQueue = preamble.filter((line) => line.length <= 140);
  if (!title && preambleQueue.length) {
    title = preambleQueue.shift() ?? null;
    if (title) extracted.add('title');
  }
  if (!company) {
    const hint = COMPANY_HINT_RE.exec(trimmed);
    if (hint) {
      company = hint[1].trim();
      extracted.add('company');
    } else if (preambleQueue.length) {
      const candidate = preambleQueue[0];
      if (candidate && candidate.length <= 80 && !/[.!?]$/.test(candidate)) {
        company = preambleQueue.shift() ?? null;
        if (company) extracted.add('company');
      }
    }
  }
  if (!location) {
    const city = detectCity(trimmed);
    if (city) {
      location = city;
      extracted.add('location');
    }
  }

  const typeSection = sections.internshipType ?? '';
  let internshipType = normalizeType(typeSection);
  if (internshipType) extracted.add('internshipType');
  else {
    internshipType = normalizeType(`${title ?? ''} ${trimmed.slice(0, 1500)}`);
    if (internshipType) extracted.add('internshipType');
  }

  let workMode = normalizeWorkMode(sections.workMode ?? '');
  if (workMode) extracted.add('workMode');
  else {
    workMode = normalizeWorkMode(trimmed);
    if (workMode) extracted.add('workMode');
  }

  const department = takeText('department');
  const positions = sections.positions ? parsePositions(sections.positions) : null;
  if (positions) extracted.add('positions');

  // --- Dates --------------------------------------------------------------
  const deadline = (sections.deadline ? parseDate(sections.deadline) : null) ?? detectDeadline(trimmed);
  if (deadline) extracted.add('deadline');
  const startDate = sections.startDate ? parseDate(sections.startDate) : null;
  if (startDate) extracted.add('startDate');
  const endDate = sections.endDate ? parseDate(sections.endDate) : null;
  if (endDate) extracted.add('endDate');

  // --- Narrative sections -------------------------------------------------
  let overview = takeText('overview');
  const responsibilities = takeText('responsibilities');
  const requirements = takeText('requirements');
  const benefits = takeText('benefits');
  const learningOpportunities = takeText('learningOpportunities');

  // Unlabelled prose: everything left in the preamble becomes the overview so
  // a plain copy-paste from a website still produces a usable draft.
  if (!overview) {
    const leftover = preambleQueue.join('\n').trim();
    if (leftover.length >= 30) {
      overview = leftover;
      extracted.add('overview');
    } else if (!responsibilities && !requirements) {
      overview = trimmed;
      extracted.add('overview');
    }
  }

  // --- Lists --------------------------------------------------------------
  const requiredSkills = takeList('requiredSkills') ?? base.requiredSkills;
  const preferredSkills = takeList('preferredSkills') ?? base.preferredSkills;
  const softSkills = takeList('softSkills') ?? base.softSkills;
  const languages = takeList('languages') ?? base.languages;

  const form: CreateOfferFormState = {
    ...base,
    title: title ?? base.title,
    company: company ?? base.company,
    location: location ?? base.location,
    internshipType: internshipType || base.internshipType,
    workMode: workMode || base.workMode,
    department: department ?? base.department,
    positions: positions ?? base.positions,
    description: {
      overview: overview ?? base.description.overview,
      responsibilities: responsibilities ?? base.description.responsibilities,
      requirements: requirements ?? base.description.requirements,
      benefits: benefits ?? base.description.benefits,
      learningOpportunities: learningOpportunities ?? base.description.learningOpportunities,
    },
    requiredSkills,
    preferredSkills,
    softSkills,
    languages,
    recruitment: {
      ...base.recruitment,
      applicationDeadline: deadline ?? base.recruitment.applicationDeadline,
      startDate: startDate ?? base.recruitment.startDate,
      endDate: endDate ?? base.recruitment.endDate,
      profilesNeeded: positions ?? base.recruitment.profilesNeeded,
    },
  };

  const missing: string[] = [];
  if (!form.title.trim()) missing.push('title');
  if (!form.company.trim()) missing.push('company');
  if (!form.description.overview.trim()) missing.push('overview');

  // The parser only fails when it could not even name the offer; anything else
  // is a partially filled draft the admin can complete in the form.
  const error: ParseOfferTextErrorCode | null = form.title.trim() ? null : 'no_fields_extracted';

  return {
    form,
    extracted: Array.from(extracted),
    sections,
    missing,
    error,
  };
}
