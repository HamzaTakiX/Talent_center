/**
 * @deprecated Legacy module — formatting now handled by TipTap (reportEditorExtensions.ts).
 * Kept for backward compatibility with cached dev-server module graphs.
 */
export {
  DEFAULT_FONT_FAMILY,
  DEFAULT_FONT_SIZE,
  DEFAULT_TEXT_COLOR,
  FONT_FAMILY_PRESETS,
  FONT_SIZE_PRESETS,
  HIGHLIGHT_PRESETS,
  TEXT_COLOR_PRESETS,
} from './editorConstants';

export {
  colorsMatch,
  normalizeHex,
  parseColorInput,
  rgbToHexFromComputed,
} from './editorColorUtils';

export { resolveFontFamilyLabel, resolveFontFamilyValue } from './editorFontUtils';

export type { EditorFormatState } from './useEditorFormatState';
export { readEditorFormatState, useEditorFormatState } from './useEditorFormatState';
