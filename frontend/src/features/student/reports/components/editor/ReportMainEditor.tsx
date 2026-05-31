import { FunctionComponent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import EditorFloatingControls from './EditorFloatingControls';
import ReportEditorToolbar from './ReportEditorToolbar';
import {
  extractImageFromClipboard,
  insertReportFigure,
  isReportFigureSelected,
  isTableSelected,
  readFileAsDataUrl,
} from './editorCommands';
import { getReportEditorExtensions } from './reportEditorExtensions';

interface ReportMainEditorProps {
  content: string;
  onContentChange: (html: string) => void;
}

type FloatControl = 'image' | 'table' | null;

const EMPTY_DOC = '<p></p>';

const ReportMainEditor: FunctionComponent<ReportMainEditorProps> = ({ content, onContentChange }) => {
  const { t } = useTranslation();
  const [floatControl, setFloatControl] = useState<FloatControl>(null);
  const lastEmittedHtml = useRef(content);
  const isExternalUpdate = useRef(false);
  const writingAreaLabel = t('student.reports.editor.writingAreaAria');
  const extensions = useMemo(() => getReportEditorExtensions(), []);

  const editor = useEditor({
    extensions,
    immediatelyRender: true,
    content: content || EMPTY_DOC,
    editorProps: {
      attributes: {
        class: 'student-report-writing-area',
        role: 'textbox',
        'aria-multiline': 'true',
        'aria-label': writingAreaLabel,
      },
    },
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML();
      lastEmittedHtml.current = html;
      onContentChange(html);
    },
    onSelectionUpdate: ({ editor: ed }) => {
      if (isReportFigureSelected(ed)) setFloatControl('image');
      else if (isTableSelected(ed)) setFloatControl('table');
      else setFloatControl(null);
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (content === lastEmittedHtml.current) return;
    isExternalUpdate.current = true;
    editor.commands.setContent(content || EMPTY_DOC, { emitUpdate: false });
    lastEmittedHtml.current = content;
    isExternalUpdate.current = false;
  }, [content, editor]);

  const handlePaste = useCallback(
    async (event: React.ClipboardEvent) => {
      if (!editor) return;
      const imageFile = extractImageFromClipboard(event.nativeEvent);
      if (imageFile) {
        event.preventDefault();
        const src = await readFileAsDataUrl(imageFile);
        insertReportFigure(editor, src);
      }
    },
    [editor],
  );

  const handleDrop = useCallback(
    async (event: React.DragEvent) => {
      event.preventDefault();
      if (!editor) return;
      const file = event.dataTransfer.files[0];
      if (file?.type.startsWith('image/')) {
        const src = await readFileAsDataUrl(file);
        insertReportFigure(editor, src);
      }
    },
    [editor],
  );

  const syncFromEditor = useCallback(() => {
    if (!editor) return;
    const html = editor.getHTML();
    lastEmittedHtml.current = html;
    onContentChange(html);
  }, [editor, onContentChange]);

  return (
    <div className="student-report-main">
      <ReportEditorToolbar editor={editor} onContentSync={syncFromEditor} />

      {floatControl && editor && (
        <EditorFloatingControls
          type={floatControl}
          onImageAlign={(align) => {
            editor.chain().focus().updateReportFigure({ align }).run();
            syncFromEditor();
          }}
          onImageResize={(width) => {
            editor.chain().focus().updateReportFigure({ width }).run();
            syncFromEditor();
          }}
          onImageCaption={() => {
            editor.commands.focus();
          }}
          onImageRemove={() => {
            editor.chain().focus().removeReportFigure().run();
            setFloatControl(null);
            syncFromEditor();
          }}
          onTableAddRow={() => {
            editor.chain().focus().addRowAfter().run();
            syncFromEditor();
          }}
          onTableDeleteRow={() => {
            editor.chain().focus().deleteRow().run();
            syncFromEditor();
          }}
          onTableAddCol={() => {
            editor.chain().focus().addColumnAfter().run();
            syncFromEditor();
          }}
          onTableDeleteCol={() => {
            editor.chain().focus().deleteColumn().run();
            syncFromEditor();
          }}
          onTableMerge={() => {
            editor.chain().focus().mergeCells().run();
            syncFromEditor();
          }}
          onTableSplit={() => {
            editor.chain().focus().splitCell().run();
            syncFromEditor();
          }}
        />
      )}

      <div
        className="student-report-editor-canvas"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => void handleDrop(e)}
      >
        <motion.div
          className="student-report-editor-paper"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <EditorContent editor={editor} onPaste={handlePaste} />
        </motion.div>
      </div>
    </div>
  );
};

export default ReportMainEditor;
