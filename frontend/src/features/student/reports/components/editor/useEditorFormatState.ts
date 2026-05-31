import type { Editor } from '@tiptap/react';
import { useCallback, useEffect, useState } from 'react';

import {
  DEFAULT_FONT_FAMILY,
  DEFAULT_FONT_SIZE,
  DEFAULT_TEXT_COLOR,
} from './editorConstants';
import { resolveFontFamilyValue } from './editorColorUtils';

export interface EditorFormatState {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
  subscript: boolean;
  superscript: boolean;
  inlineCode: boolean;
  fontFamily: string;
  fontSize: string;
  color: string;
  highlight: string | null;
  align: 'left' | 'center' | 'right' | 'justify';
  canUndo: boolean;
  canRedo: boolean;
}

const DEFAULT_STATE: EditorFormatState = {
  bold: false,
  italic: false,
  underline: false,
  strikethrough: false,
  subscript: false,
  superscript: false,
  inlineCode: false,
  fontFamily: DEFAULT_FONT_FAMILY,
  fontSize: DEFAULT_FONT_SIZE,
  color: DEFAULT_TEXT_COLOR,
  highlight: null,
  align: 'left',
  canUndo: false,
  canRedo: false,
};

function readAlign(editor: Editor): EditorFormatState['align'] {
  if (editor.isActive({ textAlign: 'center' })) return 'center';
  if (editor.isActive({ textAlign: 'right' })) return 'right';
  if (editor.isActive({ textAlign: 'justify' })) return 'justify';
  return 'left';
}

export function readEditorFormatState(editor: Editor | null): EditorFormatState {
  if (!editor) return DEFAULT_STATE;

  const textStyle = editor.getAttributes('textStyle');
  const highlight = editor.getAttributes('highlight');

  return {
    bold: editor.isActive('bold'),
    italic: editor.isActive('italic'),
    underline: editor.isActive('underline'),
    strikethrough: editor.isActive('strike'),
    subscript: editor.isActive('subscript'),
    superscript: editor.isActive('superscript'),
    inlineCode: editor.isActive('code'),
    fontFamily: resolveFontFamilyValue(textStyle.fontFamily || DEFAULT_FONT_FAMILY),
    fontSize: textStyle.fontSize || DEFAULT_FONT_SIZE,
    color: textStyle.color || DEFAULT_TEXT_COLOR,
    highlight: highlight.color ?? null,
    align: readAlign(editor),
    canUndo: editor.can().undo(),
    canRedo: editor.can().redo(),
  };
}

export function useEditorFormatState(editor: Editor | null): EditorFormatState {
  const [state, setState] = useState<EditorFormatState>(() => readEditorFormatState(editor));

  const refresh = useCallback(() => {
    setState(readEditorFormatState(editor));
  }, [editor]);

  useEffect(() => {
    if (!editor) return undefined;

    refresh();
    editor.on('selectionUpdate', refresh);
    editor.on('transaction', refresh);

    return () => {
      editor.off('selectionUpdate', refresh);
      editor.off('transaction', refresh);
    };
  }, [editor, refresh]);

  return state;
}
