import {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { Editor } from '@tiptap/core';
import { EditorContent, useEditor } from '@tiptap/react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import EditorFloatingControls from './EditorFloatingControls';
import ReportCommentPins from './ReportCommentPins';
import ReportEditorToolbar from './ReportEditorToolbar';
import {
  extractImageFromClipboard,
  insertReportFigure,
  isReportFigureSelected,
  isTableSelected,
  readFileAsDataUrl,
} from './editorCommands';
import { getReportEditorExtensions } from './reportEditorExtensions';
import type { ReportComment } from '../../types';
import {
  detectCurrentPageNumber,
  highlightQuoteInEditor,
} from '../../utils/extractReportPage';

interface ReportMainEditorProps {
  content: string;
  onContentChange: (html: string) => void;
  onPageCountChange?: (pageCount: number) => void;
  onCurrentPageChange?: (pageNumber: number) => void;
  onEditorReady?: (editor: Editor | null) => void;
  /** When set, scroll (or insert) the matching heading in the student report. */
  navigateToHeading?: { title: string; level: 1 | 2 | 3; token: number } | null;
  /** Navigate to an analysis issue quote and highlight it. */
  highlightIssue?: { quote: string; pageNumber: number; token: number } | null;
  comments?: ReportComment[];
  onOpenComments?: () => void;
}

type FloatControl = 'image' | 'table' | null;

const EMPTY_DOC = '<p></p>';

function normalizeHeadingText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/^\d+([.\-)]\d+)*[.\-)]?\s*/g, '')
    .replace(/^(?:[ivxlc]+)\.?\d*(?:\.\d+)*\s*/i, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const ReportMainEditor: FunctionComponent<ReportMainEditorProps> = ({
  content,
  onContentChange,
  onPageCountChange,
  onCurrentPageChange,
  onEditorReady,
  navigateToHeading = null,
  highlightIssue = null,
  comments = [],
  onOpenComments,
}) => {
  const { t } = useTranslation();
  const [floatControl, setFloatControl] = useState<FloatControl>(null);
  const lastEmittedHtml = useRef(content);
  const isExternalUpdate = useRef(false);
  const pagesRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const writingAreaLabel = t('student.reports.editor.writingAreaAria');
  const pageFooterLabel = t('student.reports.editor.pageFooter');
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
      if (onCurrentPageChange) {
        onCurrentPageChange(detectCurrentPageNumber(ed, canvasRef.current));
      }
    },
  });

  useEffect(() => {
    onEditorReady?.(editor ?? null);
    return () => onEditorReady?.(null);
  }, [editor, onEditorReady]);

  useEffect(() => {
    if (!editor) return;
    editor.commands.updateFooterContent('', pageFooterLabel);
  }, [editor, pageFooterLabel]);

  useEffect(() => {
    if (!editor || !onPageCountChange) return;

    const countPages = () => {
      const breaks = editor.view.dom.querySelectorAll('.rm-page-break').length;
      onPageCountChange(Math.max(1, breaks || 1));
      if (onCurrentPageChange) {
        onCurrentPageChange(detectCurrentPageNumber(editor, canvasRef.current));
      }
    };

    countPages();
    const observer = new MutationObserver(countPages);
    observer.observe(editor.view.dom, { childList: true, subtree: true });
    const interval = window.setInterval(countPages, 800);

    return () => {
      observer.disconnect();
      window.clearInterval(interval);
    };
  }, [editor, onPageCountChange, onCurrentPageChange]);

  useEffect(() => {
    if (!editor || !highlightIssue?.quote) return;
    highlightQuoteInEditor(editor, highlightIssue.quote, highlightIssue.pageNumber);
  }, [editor, highlightIssue]);

  useEffect(() => {
    if (!editor || !navigateToHeading?.title) return;

    const wantRaw = navigateToHeading.title.trim().toLowerCase();
    const target = normalizeHeadingText(navigateToHeading.title);
    let foundPos: number | null = null;

    const consider = (nodeText: string, pos: number, strict: boolean) => {
      if (foundPos !== null) return;
      const raw = nodeText.trim().toLowerCase();
      const text = normalizeHeadingText(nodeText);
      if (!text && !raw) return;
      if (strict) {
        if (raw === wantRaw || text === target) foundPos = pos;
        return;
      }
      if (
        raw === wantRaw ||
        text === target ||
        (text && target && (text.includes(target) || target.includes(text)))
      ) {
        foundPos = pos;
      }
    };

    editor.state.doc.descendants((node, pos) => {
      if (foundPos !== null) return false;
      if (node.type.name === 'heading') consider(node.textContent || '', pos, true);
    });

    if (foundPos === null) {
      editor.state.doc.descendants((node, pos) => {
        if (foundPos !== null) return false;
        if (node.type.name === 'heading') consider(node.textContent || '', pos, false);
      });
    }

    if (foundPos === null) {
      const level = navigateToHeading.level;
      editor
        .chain()
        .focus('end')
        .insertContent(`<h${level}>${navigateToHeading.title}</h${level}><p></p>`)
        .run();
      const html = editor.getHTML();
      lastEmittedHtml.current = html;
      onContentChange(html);

      editor.state.doc.descendants((node, pos) => {
        if (foundPos !== null) return false;
        if (node.type.name === 'heading' && (node.textContent || '').trim() === navigateToHeading.title) {
          foundPos = pos;
          return false;
        }
      });
    }

    if (foundPos !== null) {
      const pos = foundPos;
      editor.commands.focus();
      editor.commands.setTextSelection(pos + 1);
      requestAnimationFrame(() => {
        const dom = editor.view.nodeDOM(pos);
        if (dom instanceof HTMLElement) {
          dom.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          editor.view.dispatch(editor.state.tr.scrollIntoView());
        }
      });
    }
  }, [editor, navigateToHeading, onContentChange]);

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
        ref={canvasRef}
        className="student-report-editor-canvas"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => void handleDrop(e)}
        onScroll={() => {
          if (editor && onCurrentPageChange) {
            onCurrentPageChange(detectCurrentPageNumber(editor, canvasRef.current));
          }
        }}
      >
        <motion.div
          ref={pagesRef}
          className="student-report-pages"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <EditorContent editor={editor} onPaste={handlePaste} />
          <ReportCommentPins
            containerRef={pagesRef}
            comments={comments}
            contentRevision={content}
            onOpenComments={onOpenComments}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default ReportMainEditor;
