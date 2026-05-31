import type { Editor } from '@tiptap/react';

import { parseColorInput } from './editorColorUtils';

export function normalizeFontSize(size: string): string {
  const trimmed = size.trim();
  if (!trimmed) return '17px';
  return trimmed.endsWith('px') ? trimmed : `${trimmed}px`;
}

export function insertTable(editor: Editor, rows: number, cols: number): void {
  editor
    .chain()
    .focus()
    .insertTable({ rows, cols, withHeaderRow: true })
    .run();
}

export function insertReportFigure(editor: Editor, src: string): void {
  editor.chain().focus().insertReportFigure({ src }).run();
}

export function insertLink(
  editor: Editor,
  url: string,
  text: string,
  newTab: boolean,
): void {
  const { from, to, empty } = editor.state.selection;
  const selectedText = editor.state.doc.textBetween(from, to, ' ');
  const label = text.trim() || selectedText || url;
  const target = newTab ? '_blank' : null;
  const rel = newTab ? 'noopener noreferrer' : null;

  if (empty) {
    editor
      .chain()
      .focus()
      .insertContent({
        type: 'text',
        text: label,
        marks: [{ type: 'link', attrs: { href: url, target, rel } }],
      })
      .run();
    return;
  }

  if (text.trim() && text.trim() !== selectedText) {
    editor
      .chain()
      .focus()
      .insertContentAt({ from, to }, text.trim())
      .setTextSelection({ from, to: from + text.trim().length })
      .setLink({ href: url, target })
      .run();
    return;
  }

  editor.chain().focus().setLink({ href: url, target }).run();
}

export function applyTextColor(editor: Editor, color: string): void {
  const parsed = parseColorInput(color) ?? color;
  editor.chain().focus().setColor(parsed).run();
}

export function applyHighlightColor(editor: Editor, color: string): void {
  const parsed = parseColorInput(color) ?? color;
  editor.chain().focus().setHighlight({ color: parsed }).run();
}

export function removeHighlight(editor: Editor): void {
  editor.chain().focus().unsetHighlight().run();
}

export function applyFontSize(editor: Editor, size: string): void {
  editor.chain().focus().setFontSize(normalizeFontSize(size)).run();
}

export function applyFontFamily(editor: Editor, family: string): void {
  editor.chain().focus().setFontFamily(family).run();
}

export async function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function extractImageFromClipboard(event: ClipboardEvent): File | null {
  const items = event.clipboardData?.items;
  if (!items) return null;
  for (const item of items) {
    if (item.type.startsWith('image/')) {
      return item.getAsFile();
    }
  }
  return null;
}

export function isReportFigureSelected(editor: Editor): boolean {
  return editor.isActive('reportFigure');
}

export function isTableSelected(editor: Editor): boolean {
  return editor.isActive('table');
}

export function updateFigureAlign(editor: Editor, align: 'left' | 'center' | 'right'): void {
  editor.chain().focus().updateReportFigure({ align }).run();
}

export function updateFigureWidth(editor: Editor, width: number): void {
  editor.chain().focus().updateReportFigure({ width }).run();
}

export function removeSelectedFigure(editor: Editor): void {
  editor.chain().focus().removeReportFigure().run();
}

export function addTableRow(editor: Editor, before = false): void {
  if (before) editor.chain().focus().addRowBefore().run();
  else editor.chain().focus().addRowAfter().run();
}

export function deleteTableRow(editor: Editor): void {
  editor.chain().focus().deleteRow().run();
}

export function addTableColumn(editor: Editor, before = false): void {
  if (before) editor.chain().focus().addColumnBefore().run();
  else editor.chain().focus().addColumnAfter().run();
}

export function deleteTableColumn(editor: Editor): void {
  editor.chain().focus().deleteColumn().run();
}

export function mergeTableCells(editor: Editor): void {
  editor.chain().focus().mergeCells().run();
}

export function splitTableCell(editor: Editor): void {
  editor.chain().focus().splitCell().run();
}
