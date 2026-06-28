import type { User } from '../../../../auth/types';
import {
  getAdminDisplayName,
  getAdminUserInitials,
  resolveAvatarUrl,
} from '../../../../admin/dashboard/utils/adminUserDisplay';
import type { CvAnalysisStudentProfile } from '../types/cvAnalysisDashboard';

export const CV_DRAFT_STORAGE_KEY = 'talent-center-quickcv-draft';

export interface CvBuilderSnapshot {
  details: Record<string, unknown>;
  workExp: Record<string, unknown>[];
  education: Record<string, unknown>[];
  projects: Record<string, unknown>[];
  skills: Record<string, unknown>[];
  languages: Record<string, unknown>[];
}

/** Fallback CV — same structure as the CV builder demo data (without icon refs). */
const DEFAULT_CV_SNAPSHOT: CvBuilderSnapshot = {
  details: {
    name: 'Sidhanth Rathod',
    about:
      'Self-taught Front-End Web Developer passionate about creating beautiful and performant websites.',
    email: 'siduck@tutanota.com',
    phone: '+91 9701611257',
    location: 'Hyderabad, India',
    role: 'Frontend Developer',
    github: 'siduck',
    linkedin: 'https://www.linkedin.com/in/sidhanth-rathod-b3829a263',
  },
  workExp: [
    {
      company: 'Jamesmccallumconsulting (Freelance)',
      title: 'React Developer',
      date: '2022 Oct - 2023 Jan',
      desc: '- Converted UI figma designs into responsive React + Tailwindcss components',
    },
    {
      company: 'Ideanomic',
      title: 'Frontend Developer',
      date: '2023 April - 2025 May',
      desc: "- Responsible for creating and maintaining company's website",
    },
  ],
  education: [
    {
      institution: 'Sarada College',
      date: '2019 – 2022',
      qualification: 'BHMCT ( discontinued )',
    },
  ],
  projects: [
    {
      name: 'Quick CV',
      link: 'https://github.com/siduck/quickcv',
      desc: 'Fast resume / cv builder for making beautiful resumes.',
    },
  ],
  skills: [
    { name: 'JavaScript' },
    { name: 'TypeScript' },
    { name: 'React' },
    { name: 'Svelte' },
    { name: 'Tailwind' },
  ],
  languages: [
    { name: 'English', level: 'Professional' },
    { name: 'French', level: 'B1' },
  ],
};

export interface StudentCvProfileInput {
  fullName?: string;
  email?: string;
  phone?: string;
  city?: string;
  programMajor?: string;
  currentClass?: string;
  academicYear?: string;
  linkedinUrl?: string;
  professionalSummary?: string;
  skills?: string[];
  cvFileUrl?: string;
}

export type StudentCvResolveSource = 'draft' | 'profile' | 'profile_file';

export interface ResolvedStudentCv {
  cv: CvBuilderSnapshot;
  source: StudentCvResolveSource;
  fileName?: string;
}

function normalizeCvSnapshot(parsed: Partial<CvBuilderSnapshot>): CvBuilderSnapshot {
  return {
    details: parsed.details ?? {},
    workExp: Array.isArray(parsed.workExp) ? parsed.workExp : [],
    education: Array.isArray(parsed.education) ? parsed.education : [],
    projects: Array.isArray(parsed.projects) ? parsed.projects : [],
    skills: Array.isArray(parsed.skills) ? parsed.skills : [],
    languages: Array.isArray(parsed.languages) ? parsed.languages : [],
  };
}

export function readStoredCvDraft(): CvBuilderSnapshot | null {
  try {
    const raw = localStorage.getItem(CV_DRAFT_STORAGE_KEY);
    if (!raw) return null;
    return normalizeCvSnapshot(JSON.parse(raw) as Partial<CvBuilderSnapshot>);
  } catch {
    return null;
  }
}

export function readDefaultCvSnapshot(): CvBuilderSnapshot {
  return readStoredCvDraft() ?? structuredClone(DEFAULT_CV_SNAPSHOT);
}

const text = (v: unknown) => (typeof v === 'string' ? v.trim() : '');

export function hasMeaningfulCvContent(cv: CvBuilderSnapshot): boolean {
  const detailKeys = ['name', 'about', 'email', 'phone', 'location', 'role', 'github', 'linkedin'];
  if (detailKeys.some((key) => text(cv.details[key]))) return true;

  const lists: unknown[][] = [cv.workExp, cv.education, cv.projects, cv.skills, cv.languages];
  return lists.some((list) =>
    list.some((entry) =>
      Object.values(entry as Record<string, unknown>).some((value) => text(value)),
    ),
  );
}

export function extractFileNameFromUrl(url: string): string {
  const clean = url.split('?')[0]?.split('#')[0] ?? url;
  const segment = clean.split('/').filter(Boolean).pop();
  return segment ? decodeURIComponent(segment) : 'Mon_CV.pdf';
}

export function buildCvSnapshotFromProfile(input: StudentCvProfileInput): CvBuilderSnapshot | null {
  const name = text(input.fullName);
  const about = text(input.professionalSummary);
  const skills = (input.skills ?? []).map((skill) => text(skill)).filter(Boolean);

  if (!name && !about && skills.length === 0) {
    return null;
  }

  const education =
    text(input.programMajor) || text(input.currentClass) || text(input.academicYear)
      ? [
          {
            institution: text(input.programMajor),
            qualification: text(input.currentClass),
            date: text(input.academicYear),
          },
        ]
      : [];

  return {
    details: {
      name,
      about,
      email: text(input.email),
      phone: text(input.phone),
      location: text(input.city),
      role: text(input.programMajor),
      linkedin: text(input.linkedinUrl),
    },
    workExp: [],
    education,
    projects: [],
    skills: skills.map((skill) => ({ name: skill })),
    languages: [],
  };
}

export function resolveStudentCvSnapshot(
  input?: StudentCvProfileInput | null,
): ResolvedStudentCv | null {
  const draft = readStoredCvDraft();
  if (draft && hasMeaningfulCvContent(draft)) {
    return { cv: draft, source: 'draft' };
  }

  if (input) {
    const profileCv = buildCvSnapshotFromProfile(input);
    if (profileCv) {
      return { cv: profileCv, source: 'profile' };
    }

    const cvFileUrl = text(input.cvFileUrl);
    if (cvFileUrl) {
      const name = text(input.fullName) || 'Mon CV';
      return {
        cv: {
          details: {
            name,
            email: text(input.email),
            phone: text(input.phone),
            location: text(input.city),
            role: text(input.programMajor),
            about: text(input.professionalSummary),
            linkedin: text(input.linkedinUrl),
          },
          workExp: [],
          education: [],
          projects: [],
          skills: (input.skills ?? []).map((skill) => ({ name: text(skill) })).filter((s) => s.name),
          languages: [],
        },
        source: 'profile_file',
        fileName: extractFileNameFromUrl(cvFileUrl),
      };
    }
  }

  return null;
}

export function profileInputFromUser(user: {
  email?: string;
  full_name?: string;
  profile?: { first_name?: string; last_name?: string; updated_at?: string };
  student_profile?: {
    first_name?: string;
    last_name?: string;
    phone?: string;
    city?: string;
    program_major?: string;
    current_class?: string;
    academic_year?: string;
    linkedin_url?: string;
    professional_summary?: string;
    skills?: string[];
    cv_file?: string;
  };
} | null | undefined): StudentCvProfileInput | null {
  if (!user) return null;

  const sp = user.student_profile;
  const profileName = [sp?.first_name, sp?.last_name].filter(Boolean).join(' ');
  const accountName = [user.profile?.first_name, user.profile?.last_name].filter(Boolean).join(' ');

  return {
    fullName: profileName || accountName || text(user.full_name),
    email: user.email,
    phone: sp?.phone,
    city: sp?.city,
    programMajor: sp?.program_major,
    currentClass: sp?.current_class,
    academicYear: sp?.academic_year,
    linkedinUrl: sp?.linkedin_url,
    professionalSummary: sp?.professional_summary,
    skills: sp?.skills,
    cvFileUrl: sp?.cv_file,
  };
}

export function getCvDisplayName(cv: CvBuilderSnapshot): string {
  return text(cv.details.name) || 'Mon CV';
}

export function getCvFileLabel(cv: CvBuilderSnapshot): string {
  const name = text(cv.details.name).replace(/\s+/g, '_') || 'Mon_CV';
  return `${name}_CV.pdf`;
}

export function getAvatarInitials(cv: CvBuilderSnapshot): string {
  const name = text(cv.details.name);
  if (!name) return 'CV';
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function computeStudentProfileCompletionPercent(user: User | null | undefined): number {
  const sp = user?.student_profile;
  if (!sp) return 0;
  if (sp.profile_completed) return 100;

  const checks = [
    Boolean(sp.filiere_id || sp.filiere || text(sp.program_major)),
    Boolean(sp.skills?.length),
    Boolean(text(sp.professional_summary)),
    Boolean(text(sp.city)),
  ];
  const done = checks.filter(Boolean).length;
  return Math.round((done / checks.length) * 100);
}

/**
 * Compute "Préparation stage" score from the 9-criteria weighted formula.
 *
 * Weights:
 *   CV complété                          20 %
 *   Profil étudiant complété             15 %
 *   Compétences renseignées              10 %
 *   Career Coach IA utilisé              10 %  (not available client-side → 0 unless provided)
 *   CV analysé par l'IA                  10 %  (not available client-side → 0 unless provided)
 *   Simulation d'entretien terminée      15 %  (not available client-side → 0 unless provided)
 *   Au moins une candidature envoyée     10 %
 *   Documents obligatoires prêts (CV,LM) 5  %
 *   Préférences de stage complétées      5  %
 *   Total                               100 %
 *
 * Pass `serverScore` (from `internship_readiness_score` in the journey API) whenever
 * available — it is computed by the backend with full signal access and is authoritative.
 */
export function computeStageReadiness(
  user: User | null | undefined,
  options: {
    serverScore?: number | null;
    applicationsCount?: number;
    cvAnalyzed?: boolean;
    careerCoachUsed?: boolean;
    simulationDone?: boolean;
  } = {},
): number {
  if (options.serverScore != null && options.serverScore >= 0) {
    return options.serverScore;
  }

  const sp = user?.student_profile;
  if (!sp) return 0;

  const hasCv = Boolean(text(sp.cv_file));
  const profileCompleted = Boolean(sp.profile_completed);
  const hasSkills = Boolean(sp.skills?.length);
  const hasApplication = (options.applicationsCount ?? 0) > 0;
  const cvAnalyzed = options.cvAnalyzed ?? false;
  const careerCoachUsed = options.careerCoachUsed ?? false;
  const simulationDone = options.simulationDone ?? false;
  const hasPreferences = Boolean(text(sp.availability) && text(sp.city));

  const score =
    (hasCv ? 20 : 0) +
    (profileCompleted ? 15 : 0) +
    (hasSkills ? 10 : 0) +
    (careerCoachUsed ? 10 : 0) +
    (cvAnalyzed ? 10 : 0) +
    (simulationDone ? 15 : 0) +
    (hasApplication ? 10 : 0) +
    (hasCv ? 5 : 0) +
    (hasPreferences ? 5 : 0);

  return Math.min(100, score);
}

export function buildCvAnalysisStudentProfileFromUser(
  user: User | null | undefined,
): CvAnalysisStudentProfile | null {
  if (!user) return null;

  const name = getAdminDisplayName(user);
  if (!name) return null;

  const program =
    text(user.student_profile?.program_major) || text(user.student_profile?.current_class);
  const avatarUrl = resolveAvatarUrl(user.profile?.avatar);

  return {
    name,
    program,
    avatarInitials: getAdminUserInitials(name, user.email),
    avatarUrl: avatarUrl ?? undefined,
    profileCompletion: computeStudentProfileCompletionPercent(user),
  };
}

export function computeProfileCompletion(cv: CvBuilderSnapshot): number {
  let filled = 0;
  let total = 0;

  const detailKeys = ['name', 'about', 'email', 'phone', 'location', 'role'];
  detailKeys.forEach((key) => {
    total += 1;
    if (text(cv.details[key])) filled += 1;
  });

  const listChecks: [unknown[], number][] = [
    [cv.workExp, 1],
    [cv.education, 1],
    [cv.skills, 1],
    [cv.projects, 0.5],
    [cv.languages, 0.5],
  ];

  listChecks.forEach(([list, weight]) => {
    total += weight;
    const hasEntry = list.some((entry) =>
      Object.values(entry as Record<string, unknown>).some((v) => text(v)),
    );
    if (hasEntry) filled += weight;
  });

  return Math.min(100, Math.round((filled / total) * 100));
}

export function extractDetectedSkills(cv: CvBuilderSnapshot): { id: string; name: string }[] {
  return cv.skills
    .map((s, i) => ({ id: `sk-${i}`, name: text(s.name) }))
    .filter((s) => s.name);
}
