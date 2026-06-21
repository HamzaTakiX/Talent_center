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

export function readDefaultCvSnapshot(): CvBuilderSnapshot {
  try {
    const raw = localStorage.getItem(CV_DRAFT_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<CvBuilderSnapshot>;
      return {
        details: parsed.details ?? {},
        workExp: Array.isArray(parsed.workExp) ? parsed.workExp : [],
        education: Array.isArray(parsed.education) ? parsed.education : [],
        projects: Array.isArray(parsed.projects) ? parsed.projects : [],
        skills: Array.isArray(parsed.skills) ? parsed.skills : [],
        languages: Array.isArray(parsed.languages) ? parsed.languages : [],
      };
    }
  } catch {
    /* use default */
  }
  return structuredClone(DEFAULT_CV_SNAPSHOT);
}

const text = (v: unknown) => (typeof v === 'string' ? v.trim() : '');

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
