import type { Editor } from '@tiptap/core';

import type { ExtractedPagePayload, OutlineContextItem } from '../types/pageAnalysis';

const PAGE_BREAK_SELECTOR = '.rm-page-break';
const EXCERPT_MAX = 600;

function isPageBreak(el: Element): boolean {
  return el.classList?.contains('rm-page-break') === true;
}

/**
 * Split ProseMirror DOM top-level blocks into pages using PaginationPlus breaks.
 * Page breaks typically appear as siblings marking the end of a page.
 */
export function getPageSegments(editorDom: HTMLElement): HTMLElement[][] {
  const children = Array.from(editorDom.children) as HTMLElement[];
  if (children.length === 0) return [[]];

  const pages: HTMLElement[][] = [];
  let current: HTMLElement[] = [];

  for (const child of children) {
    if (isPageBreak(child)) {
      pages.push(current);
      current = [];
      continue;
    }
    current.push(child);
  }
  pages.push(current);

  // PaginationPlus often inserts a trailing break → empty last page
  while (pages.length > 1 && pages[pages.length - 1].length === 0) {
    pages.pop();
  }
  if (pages.length === 0) pages.push([]);
  return pages;
}

export function getPageCountFromDom(editorDom: HTMLElement): number {
  const breaks = editorDom.querySelectorAll(PAGE_BREAK_SELECTOR).length;
  return Math.max(1, breaks || 1);
}

/** 1-based page containing the current selection (or most visible page). */
export function detectCurrentPageNumber(
  editor: Editor,
  scrollContainer?: HTMLElement | null,
): number {
  const dom = editor.view.dom as HTMLElement;
  const pages = getPageSegments(dom);
  if (pages.length <= 1) return 1;

  try {
    const { from } = editor.state.selection;
    const selDom = editor.view.domAtPos(from).node;
    const selEl =
      selDom.nodeType === Node.TEXT_NODE
        ? (selDom.parentElement as HTMLElement | null)
        : (selDom as HTMLElement);

    if (selEl) {
      for (let i = 0; i < pages.length; i += 1) {
        if (pages[i].some((block) => block.contains(selEl) || block === selEl)) {
          return i + 1;
        }
      }
    }
  } catch {
    /* fall through to visibility */
  }

  const container = scrollContainer ?? dom.closest('.student-report-editor-canvas');
  if (container) {
    const containerRect = container.getBoundingClientRect();
    let bestPage = 1;
    let bestScore = -Infinity;
    pages.forEach((blocks, idx) => {
      if (blocks.length === 0) return;
      const first = blocks[0].getBoundingClientRect();
      const last = blocks[blocks.length - 1].getBoundingClientRect();
      const top = first.top;
      const bottom = last.bottom;
      const visible = Math.min(bottom, containerRect.bottom) - Math.max(top, containerRect.top);
      if (visible > bestScore) {
        bestScore = visible;
        bestPage = idx + 1;
      }
    });
    return bestPage;
  }

  return 1;
}

function collectFromBlocks(blocks: HTMLElement[]) {
  const headings: string[] = [];
  const figures: string[] = [];
  const tables: string[] = [];
  const captions: string[] = [];
  const htmlParts: string[] = [];
  const textParts: string[] = [];

  for (const block of blocks) {
    htmlParts.push(block.outerHTML);
    const text = (block.innerText || block.textContent || '').trim();
    if (text) textParts.push(text);

    if (/^H[1-6]$/i.test(block.tagName)) {
      headings.push(text);
    }
    block.querySelectorAll('h1,h2,h3,h4,h5,h6').forEach((h) => {
      const t = (h.textContent || '').trim();
      if (t && !headings.includes(t)) headings.push(t);
    });

    if (block.matches('figure.student-report-figure') || block.querySelector('figure.student-report-figure')) {
      const figs = block.matches('figure.student-report-figure')
        ? [block]
        : Array.from(block.querySelectorAll('figure.student-report-figure'));
      figs.forEach((fig) => {
        const cap = (fig.querySelector('figcaption')?.textContent || '').trim();
        if (cap) {
          figures.push(cap);
          captions.push(cap);
        } else {
          figures.push('(figure sans légende)');
        }
      });
    }

    if (block.matches('table') || block.querySelector('table')) {
      const label =
        block.querySelector('caption')?.textContent?.trim() ||
        text.split('\n')[0]?.slice(0, 120) ||
        '(tableau)';
      tables.push(label);
      if (block.querySelector('caption')?.textContent?.trim()) {
        captions.push(block.querySelector('caption')!.textContent!.trim());
      }
    }
  }

  return {
    html: htmlParts.join(''),
    text: textParts.join('\n\n'),
    headings,
    figures,
    tables,
    captions,
  };
}

function excerpt(text: string, max = EXCERPT_MAX): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
}

function inferChapterSection(
  pageHeadings: string[],
  outline: OutlineContextItem[],
): { chapterTitle: string; sectionTitle: string } {
  const sectionTitle = pageHeadings[0] || outline.find((o) => o.level >= 2)?.title || '';
  const chapterTitle =
    outline.find((o) => o.level === 1)?.title ||
    pageHeadings.find((h) => /chapitre|introduction|conclusion/i.test(h)) ||
    '';
  return { chapterTitle, sectionTitle };
}

function outlineFromEditor(editor: Editor): OutlineContextItem[] {
  const items: OutlineContextItem[] = [];
  editor.state.doc.descendants((node) => {
    if (node.type.name === 'heading') {
      const title = node.textContent.trim();
      if (!title) return;
      const level = Math.min(3, Math.max(1, Number(node.attrs.level) || 1)) as 1 | 2 | 3;
      const numberMatch = title.match(/^(\d+(?:\.\d+)*)\b/);
      items.push({
        level,
        title,
        number: numberMatch?.[1],
      });
    }
  });
  return items.slice(0, 80);
}

export function extractReportPage(
  editor: Editor,
  pageNumber?: number,
  scrollContainer?: HTMLElement | null,
): ExtractedPagePayload {
  const dom = editor.view.dom as HTMLElement;
  const pages = getPageSegments(dom);
  const current = Math.min(
    Math.max(1, pageNumber ?? detectCurrentPageNumber(editor, scrollContainer)),
    pages.length,
  );
  const idx = current - 1;
  const collected = collectFromBlocks(pages[idx] || []);
  const prev = idx > 0 ? collectFromBlocks(pages[idx - 1]).text : '';
  const next = idx < pages.length - 1 ? collectFromBlocks(pages[idx + 1]).text : '';
  const outline = outlineFromEditor(editor);
  const { chapterTitle, sectionTitle } = inferChapterSection(collected.headings, outline);

  return {
    pageNumber: current,
    pageId: `page-${current}`,
    text: collected.text,
    html: collected.html,
    headings: collected.headings,
    figures: collected.figures,
    tables: collected.tables,
    captions: collected.captions,
    context: {
      chapterTitle,
      sectionTitle,
      previousExcerpt: excerpt(prev),
      nextExcerpt: excerpt(next),
      outline,
    },
  };
}

/** Scroll the editor so page N is in view (1-based). */
export function scrollEditorToPage(editor: Editor, pageNumber: number): void {
  const pages = getPageSegments(editor.view.dom as HTMLElement);
  const idx = Math.min(Math.max(1, pageNumber), pages.length) - 1;
  const first = pages[idx]?.[0];
  if (first) {
    first.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

/**
 * Find quote text in the document, select it, scroll, and apply a temporary highlight.
 * Returns true if the quote was found.
 */
export function highlightQuoteInEditor(editor: Editor, quote: string, pageNumber?: number): boolean {
  const needle = quote.trim();
  if (!needle || needle.startsWith('(')) {
    if (pageNumber) scrollEditorToPage(editor, pageNumber);
    return false;
  }

  const docText = editor.state.doc.textContent;
  const normDoc = docText;
  const idx = normDoc.indexOf(needle);
  if (idx < 0) {
    // softer: try first 40 chars
    const short = needle.slice(0, 40);
    const softIdx = short.length >= 8 ? normDoc.indexOf(short) : -1;
    if (softIdx < 0) {
      if (pageNumber) scrollEditorToPage(editor, pageNumber);
      return false;
    }
    return highlightRangeByTextOffset(editor, softIdx, softIdx + short.length);
  }
  return highlightRangeByTextOffset(editor, idx, idx + needle.length);
}

function highlightRangeByTextOffset(editor: Editor, fromText: number, toText: number): boolean {
  let textOffset = 0;
  let fromPos: number | null = null;
  let toPos: number | null = null;

  editor.state.doc.descendants((node, pos) => {
    if (fromPos !== null && toPos !== null) return false;
    if (!node.isText || !node.text) return;
    const start = textOffset;
    const end = textOffset + node.text.length;
    if (fromPos === null && fromText >= start && fromText < end) {
      fromPos = pos + (fromText - start);
    }
    if (toPos === null && toText > start && toText <= end) {
      toPos = pos + (toText - start);
    }
    if (toPos === null && toText > end && fromPos !== null) {
      // continue
    }
    textOffset = end;
  });

  if (fromPos === null || toPos === null || toPos <= fromPos) return false;

  editor
    .chain()
    .focus()
    .setTextSelection({ from: fromPos, to: toPos })
    .run();

  requestAnimationFrame(() => {
    editor.view.dispatch(editor.state.tr.scrollIntoView());
  });
  return true;
}
