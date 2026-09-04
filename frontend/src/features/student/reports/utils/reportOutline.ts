import type { ReportOutlineItem } from '../types/reportOutline';
import type { ReportModelSection } from '../types/reportModelGuide';

let outlineIdCounter = 0;

export function createOutlineId(prefix = 'out'): string {
  outlineIdCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${outlineIdCounter}`;
}

/** Seed student sommaire from the assigned pedagogical model. */
export function outlineFromModelSections(sections: ReportModelSection[]): ReportOutlineItem[] {
  return [...sections]
    .sort((a, b) => a.order - b.order || a.level - b.level)
    .map((s) => ({
      id: s.id,
      parentId: s.parentId,
      title: s.title,
      order: s.order,
      level: s.level,
    }));
}

function cleanTocLine(raw: string): string | null {
  let line = raw.replace(/\u00a0/g, ' ').trim();
  if (!line) return null;

  // Skip page footers / author lines / orphan page numbers
  if (/^page\s+\d+\s*\/\s*\d+/i.test(line)) return null;
  if (/mémoire de projet|fin d['']études/i.test(line)) return null;
  if (/^[a-z].*\d{4}-\d{4}/i.test(line) && line.length > 30) return null;
  if (/^\d{1,3}$/.test(line)) return null;

  // Strip trailing page number and leader dots
  line = line
    .replace(/\.{2,}\s*\d+\s*$/u, '')
    .replace(/\s+\d+\s*$/u, '')
    .replace(/[.…·•]+$/u, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!line || line.length < 2) return null;
  return line;
}

function detectLevel(title: string): 1 | 2 | 3 {
  const t = title.trim();

  // I.2.1 / II.3.10 / III.5.2
  if (/^(?:[IVXLC]+|\d+)\.\d+\.\d+/i.test(t)) return 3;
  // I.2 / II.3 / 1.2
  if (/^(?:[IVXLC]+|\d+)\.\d+\b/i.test(t)) return 2;
  // CHAPITRE / INTRODUCTION / CONCLUSION / WEBOGRAPHIE / ANNEXES
  if (
    /^(chapitre|introduction|conclusion|webographie|bibliographie|annexes?|résumé|abstract)\b/i.test(
      t,
    )
  ) {
    return 1;
  }
  // Roman chapter alone or numbered "1. Title"
  if (/^[IVXLC]+\s*[:.—-]/i.test(t)) return 1;
  if (/^\d+[.)]\s+\S/.test(t)) return 1;

  return 1;
}

/**
 * Parses a pasted academic TOC (leader dots + page numbers) into a hierarchical outline.
 */
export function parseTocText(text: string): ReportOutlineItem[] {
  const lines = text
    .split(/\r?\n/)
    .map(cleanTocLine)
    .filter((v): v is string => Boolean(v));

  const items: ReportOutlineItem[] = [];
  const stack: Array<{ id: string; level: 1 | 2 | 3 }> = [];

  lines.forEach((title, index) => {
    const level = detectLevel(title);
    while (stack.length > 0 && stack[stack.length - 1].level >= level) {
      stack.pop();
    }
    const parentId = stack.length > 0 ? stack[stack.length - 1].id : null;
    const id = createOutlineId('toc');
    items.push({
      id,
      parentId,
      title,
      order: index + 1,
      level,
    });
    stack.push({ id, level });
  });

  return items;
}

export function renameOutlineItem(
  items: ReportOutlineItem[],
  id: string,
  title: string,
): ReportOutlineItem[] {
  const next = title.trim();
  if (!next) return items;
  return items.map((item) => (item.id === id ? { ...item, title: next } : item));
}

export function removeOutlineItem(
  items: ReportOutlineItem[],
  id: string,
): ReportOutlineItem[] {
  const removeIds = new Set<string>();
  const collect = (target: string) => {
    removeIds.add(target);
    items.forEach((item) => {
      if (item.parentId === target) collect(item.id);
    });
  };
  collect(id);
  return items
    .filter((item) => !removeIds.has(item.id))
    .map((item, index) => ({ ...item, order: index + 1 }));
}

export function addOutlineItem(
  items: ReportOutlineItem[],
  options?: { parentId?: string | null; title?: string; level?: 1 | 2 | 3; afterId?: string },
): ReportOutlineItem[] {
  const parentId = options?.parentId ?? null;
  const parent = parentId ? items.find((i) => i.id === parentId) : null;
  const level = options?.level ?? (parent ? (Math.min(3, parent.level + 1) as 1 | 2 | 3) : 1);
  const id = createOutlineId('out');
  const title = options?.title?.trim() || 'Nouvelle section';

  const afterIndex = options?.afterId
    ? items.findIndex((i) => i.id === options.afterId)
    : -1;

  const nextItem: ReportOutlineItem = {
    id,
    parentId,
    title,
    order: items.length + 1,
    level,
  };

  const next =
    afterIndex >= 0
      ? [...items.slice(0, afterIndex + 1), nextItem, ...items.slice(afterIndex + 1)]
      : [...items, nextItem];

  return next.map((item, index) => ({ ...item, order: index + 1 }));
}
