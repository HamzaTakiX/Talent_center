import type {
  ReportModelGuide,
  ReportModelProgressSnapshot,
  ReportModelSection,
  ReportModelSectionProgress,
  ReportModelSectionStatus,
} from '../types/reportModelGuide';

function normalizeTitle(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/^\d+([.\-)]\d+)*[.\-)]?\s*/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractHeadings(html: string): Array<{ level: number; title: string }> {
  const headings: Array<{ level: number; title: string }> = [];
  const re = /<h([1-3])[^>]*>([\s\S]*?)<\/h\1>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html)) !== null) {
    const title = match[2].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    if (title) headings.push({ level: Number(match[1]), title });
  }
  return headings;
}

function countWordsNearHeading(html: string, headingTitle: string): number {
  const escaped = headingTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(
    `<h[1-3][^>]*>\\s*${escaped}\\s*<\\/h[1-3]>([\\s\\S]*?)(?=<h[1-3]\\b|$)`,
    'i',
  );
  const match = html.match(re);
  if (!match?.[1]) return 0;
  const text = match[1].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  if (!text) return 0;
  return text.split(' ').filter(Boolean).length;
}

function titlesMatch(modelTitle: string, studentTitle: string, aliases: string[] = []): boolean {
  const target = normalizeTitle(modelTitle);
  const candidate = normalizeTitle(studentTitle);
  if (!target || !candidate) return false;
  if (target === candidate) return true;
  if (candidate.includes(target) || target.includes(candidate)) return true;
  return aliases.some((alias) => {
    const a = normalizeTitle(alias);
    return a && (a === candidate || candidate.includes(a) || a.includes(candidate));
  });
}

function statusFromWords(wordCount: number, matched: boolean): {
  status: ReportModelSectionStatus;
  progressPercent: number;
} {
  if (!matched || wordCount <= 0) {
    return { status: 'not_started', progressPercent: 0 };
  }
  if (wordCount < 80) {
    return { status: 'in_progress', progressPercent: Math.min(60, Math.max(20, Math.round(wordCount / 2))) };
  }
  return { status: 'completed', progressPercent: 100 };
}

function buildTree(sections: ReportModelSection[]): ReportModelSection[] {
  return [...sections].sort((a, b) => a.order - b.order || a.level - b.level);
}

function childrenOf(sections: ReportModelSection[], parentId: string): ReportModelSection[] {
  return sections.filter((s) => s.parentId === parentId);
}

function computeNodeProgress(
  section: ReportModelSection,
  all: ReportModelSection[],
  html: string,
  headings: Array<{ level: number; title: string }>,
): ReportModelSectionProgress {
  const kids = childrenOf(all, section.id).map((child) =>
    computeNodeProgress(child, all, html, headings),
  );

  const matchedHeading = headings.find((h) =>
    titlesMatch(section.title, h.title, section.matchAliases),
  );
  const matched = Boolean(matchedHeading);
  const wordCount = matchedHeading
    ? countWordsNearHeading(html, matchedHeading.title)
    : 0;

  if (kids.length > 0) {
    const avg =
      kids.reduce((sum, c) => sum + c.progressPercent, 0) / kids.length;
    const progressPercent = Math.round(avg);
    let status: ReportModelSectionStatus = 'not_started';
    if (progressPercent >= 100) status = 'completed';
    else if (progressPercent > 0 || kids.some((c) => c.status !== 'not_started')) {
      status = 'in_progress';
    }
    return {
      sectionId: section.id,
      title: section.title,
      level: section.level,
      status,
      progressPercent,
      matched: matched || kids.some((c) => c.matched),
      children: kids,
    };
  }

  const leaf = statusFromWords(wordCount, matched);
  return {
    sectionId: section.id,
    title: section.title,
    level: section.level,
    status: leaf.status,
    progressPercent: leaf.progressPercent,
    matched,
    children: [],
  };
}

/**
 * Calculates report progress against the expected model structure.
 * Progress is derived from matching headings in the student HTML and
 * non-empty content under those headings — not hardcoded percentages.
 */
export function calculateReportModelProgress(
  model: ReportModelGuide | null,
  studentHtml: string,
): ReportModelProgressSnapshot {
  if (!model || model.sections.length === 0) {
    return {
      overallPercent: 0,
      currentSectionId: null,
      currentSectionTitle: null,
      currentSectionPercent: 0,
      chapters: [],
    };
  }

  return calculateSectionsProgress(model.sections, studentHtml);
}

/** Progress against a student-owned sommaire (outline). */
export function calculateOutlineProgress(
  sections: Array<Pick<ReportModelSection, 'id' | 'parentId' | 'title' | 'order' | 'level' | 'matchAliases'>>,
  studentHtml: string,
): ReportModelProgressSnapshot {
  if (sections.length === 0) {
    return {
      overallPercent: 0,
      currentSectionId: null,
      currentSectionTitle: null,
      currentSectionPercent: 0,
      chapters: [],
    };
  }
  return calculateSectionsProgress(sections as ReportModelSection[], studentHtml);
}

function calculateSectionsProgress(
  sections: ReportModelSection[],
  studentHtml: string,
): ReportModelProgressSnapshot {
  const all = buildTree(sections);
  const roots = all.filter((s) => s.parentId === null);
  const headings = extractHeadings(studentHtml);
  const chapters = roots.map((root) => computeNodeProgress(root, all, studentHtml, headings));

  const overallPercent =
    chapters.length === 0
      ? 0
      : Math.round(chapters.reduce((sum, c) => sum + c.progressPercent, 0) / chapters.length);

  const inProgress = chapters.find((c) => c.status === 'in_progress');
  const firstIncomplete = chapters.find((c) => c.status !== 'completed');
  const current = inProgress ?? firstIncomplete ?? chapters[chapters.length - 1] ?? null;

  return {
    overallPercent,
    currentSectionId: current?.sectionId ?? null,
    currentSectionTitle: current?.title ?? null,
    currentSectionPercent: current?.progressPercent ?? 0,
    chapters,
  };
}

export function flattenModelSections(sections: ReportModelSection[]): ReportModelSection[] {
  return buildTree(sections);
}

export function findModelSection(
  sections: ReportModelSection[],
  sectionId: string,
): ReportModelSection | undefined {
  return sections.find((s) => s.id === sectionId);
}
