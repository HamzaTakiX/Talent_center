/**
 * @deprecated Use editorCommands.ts instead.
 * Kept for backward compatibility with cached dev-server module graphs.
 */
export {
  addTableColumn,
  addTableRow,
  applyFontFamily,
  applyFontSize,
  applyHighlightColor,
  applyTextColor,
  deleteTableColumn,
  deleteTableRow,
  extractImageFromClipboard,
  insertLink,
  insertReportFigure,
  insertTable,
  isReportFigureSelected,
  isTableSelected,
  mergeTableCells,
  normalizeFontSize,
  readFileAsDataUrl,
  removeHighlight,
  removeSelectedFigure,
  splitTableCell,
  updateFigureAlign,
  updateFigureWidth,
} from './editorCommands';

export {
  FONT_FAMILY_PRESETS,
  FONT_SIZE_PRESETS,
  HIGHLIGHT_PRESETS,
  TEXT_COLOR_PRESETS,
} from './editorConstants';

export { parseColorInput, resolveFontFamilyValue } from './editorColorUtils';

export type { EditorFormatState } from './useEditorFormatState';

/** @deprecated Use insertReportFigure(editor, src) instead. */
export function buildImageFigure(src: string): string {
  return `<figure class="student-report-figure is-center" data-align="center" contenteditable="false"><img src="${src}" alt="" draggable="false" style="width:100%;max-width:480px" /><figcaption class="student-report-figure__caption student-report-figure__caption--empty"></figcaption></figure>`;
}

/** @deprecated Use insertTable(editor, rows, cols) instead. */
export function buildTableHtml(rows: number, cols: number): string {
  let html = '<table class="student-report-table"><tbody>';
  for (let r = 0; r < rows; r += 1) {
    html += '<tr>';
    for (let c = 0; c < cols; c += 1) {
      html += r === 0 ? '<th></th>' : '<td></td>';
    }
    html += '</tr>';
  }
  html += '</tbody></table><p></p>';
  return html;
}
