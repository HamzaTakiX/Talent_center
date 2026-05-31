import { FunctionComponent, useCallback, useState } from 'react';
import type { Editor } from '@tiptap/react';
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  Image,
  Italic,
  Link,
  List,
  ListOrdered,
  Minus,
  Palette,
  Quote,
  Redo2,
  Strikethrough,
  Subscript,
  Superscript,
  Table,
  Underline,
  Undo2,
  type LucideIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import EditorColorPicker from './EditorColorPicker';
import EditorFontFamilyControl from './EditorFontFamilyControl';
import EditorFontSizeControl from './EditorFontSizeControl';
import ImageInsertModal from './ImageInsertModal';
import LinkInsertModal from './LinkInsertModal';
import TableBuilderModal from './TableBuilderModal';
import {
  applyFontFamily,
  applyFontSize,
  applyHighlightColor,
  applyTextColor,
  insertLink,
  insertReportFigure,
  insertTable,
  removeHighlight,
} from './editorCommands';
import {
  HIGHLIGHT_PRESETS,
  TEXT_COLOR_PRESETS,
} from './editorConstants';
import { useEditorFormatState } from './useEditorFormatState';

interface ReportEditorToolbarProps {
  editor: Editor | null;
  onContentSync: () => void;
}

const ReportEditorToolbar: FunctionComponent<ReportEditorToolbarProps> = ({
  editor,
  onContentSync,
}) => {
  const { t } = useTranslation();
  const format = useEditorFormatState(editor);
  const [linkOpen, setLinkOpen] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);
  const [tableOpen, setTableOpen] = useState(false);

  const run = useCallback(
    (action: (ed: Editor) => void) => {
      if (!editor) return;
      action(editor);
      onContentSync();
    },
    [editor, onContentSync],
  );

  const preventEditorBlur = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  const formatBtn = useCallback(
    (key: string, Icon: LucideIcon, label: string, active: boolean, onClick: () => void) => (
      <button
        key={key}
        type="button"
        className={`student-report-toolbar-btn ${active ? 'is-active' : ''}`}
        title={label}
        aria-label={label}
        aria-pressed={active}
        disabled={!editor}
        onMouseDown={preventEditorBlur}
        onClick={onClick}
      >
        <Icon className="h-4 w-4" aria-hidden />
      </button>
    ),
    [editor],
  );

  const handleLinkInsert = (url: string, text: string, newTab: boolean) => {
    run((ed) => insertLink(ed, url, text, newTab));
  };

  const handleImageInsert = (src: string) => {
    run((ed) => insertReportFigure(ed, src));
  };

  const handleTableInsert = (rows: number, cols: number) => {
    run((ed) => insertTable(ed, rows, cols));
  };

  const openLinkModal = () => {
    editor?.commands.focus();
    setLinkOpen(true);
  };

  return (
    <>
      <div className="student-report-editor-toolbar" role="toolbar" aria-label={t('student.encadrant.reportEditor.toolbarAria')}>
        <div className="student-report-toolbar-group">
          <button
            type="button"
            className="student-report-toolbar-btn"
            title={t('student.encadrant.reportEditor.undo')}
            aria-label={t('student.encadrant.reportEditor.undo')}
            disabled={!editor || !format.canUndo}
            onMouseDown={preventEditorBlur}
            onClick={() => run((ed) => { ed.chain().focus().undo().run(); })}
          >
            <Undo2 className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            className="student-report-toolbar-btn"
            title={t('student.encadrant.reportEditor.redo')}
            aria-label={t('student.encadrant.reportEditor.redo')}
            disabled={!editor || !format.canRedo}
            onMouseDown={preventEditorBlur}
            onClick={() => run((ed) => { ed.chain().focus().redo().run(); })}
          >
            <Redo2 className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <span className="student-report-toolbar-divider" aria-hidden />

        <div className="student-report-toolbar-group">
          <EditorFontFamilyControl
            value={format.fontFamily}
            disabled={!editor}
            ariaLabel={t('student.reports.editor.fontFamily')}
            searchPlaceholder={t('student.reports.editor.fontSearch')}
            onSelect={(family) => run((ed) => applyFontFamily(ed, family))}
          />

          <EditorFontSizeControl
            value={format.fontSize}
            disabled={!editor}
            ariaLabel={t('student.reports.editor.fontSize')}
            customPlaceholder={t('student.reports.editor.customSize')}
            onSelect={(size) => run((ed) => applyFontSize(ed, size))}
          />
        </div>

        <span className="student-report-toolbar-divider" aria-hidden />

        {formatBtn('h1', Heading1, t('student.encadrant.reportEditor.heading1'), editor?.isActive('heading', { level: 1 }) ?? false, () =>
          run((ed) => {
            ed.chain().focus().toggleHeading({ level: 1 }).run();
          }),
        )}
        {formatBtn('h2', Heading2, t('student.encadrant.reportEditor.heading2'), editor?.isActive('heading', { level: 2 }) ?? false, () =>
          run((ed) => {
            ed.chain().focus().toggleHeading({ level: 2 }).run();
          }),
        )}
        {formatBtn('h3', Heading3, t('student.reports.editor.heading3'), editor?.isActive('heading', { level: 3 }) ?? false, () =>
          run((ed) => {
            ed.chain().focus().toggleHeading({ level: 3 }).run();
          }),
        )}

        <span className="student-report-toolbar-divider" aria-hidden />

        {formatBtn('bold', Bold, t('student.encadrant.reportEditor.bold'), format.bold, () =>
          run((ed) => {
            ed.chain().focus().toggleBold().run();
          }),
        )}
        {formatBtn('italic', Italic, t('student.encadrant.reportEditor.italic'), format.italic, () =>
          run((ed) => {
            ed.chain().focus().toggleItalic().run();
          }),
        )}
        {formatBtn('underline', Underline, t('student.encadrant.reportEditor.underline'), format.underline, () =>
          run((ed) => {
            ed.chain().focus().toggleUnderline().run();
          }),
        )}
        {formatBtn('strike', Strikethrough, t('student.reports.editor.strikethrough'), format.strikethrough, () =>
          run((ed) => {
            ed.chain().focus().toggleStrike().run();
          }),
        )}
        {formatBtn('sub', Subscript, t('student.reports.editor.subscript'), format.subscript, () =>
          run((ed) => {
            ed.chain().focus().toggleSubscript().run();
          }),
        )}
        {formatBtn('sup', Superscript, t('student.reports.editor.superscript'), format.superscript, () =>
          run((ed) => {
            ed.chain().focus().toggleSuperscript().run();
          }),
        )}
        {formatBtn('code', Code, t('student.reports.editor.inlineCode'), format.inlineCode, () =>
          run((ed) => {
            ed.chain().focus().toggleCode().run();
          }),
        )}

        <span className="student-report-toolbar-divider" aria-hidden />

        <EditorColorPicker
          label={t('student.reports.editor.textColor')}
          value={format.color}
          presets={TEXT_COLOR_PRESETS}
          icon={<Palette className="h-4 w-4" aria-hidden />}
          disabled={!editor}
          onBeforeOpen={() => editor?.commands.focus()}
          onApply={(color) => run((ed) => applyTextColor(ed, color))}
        />
        <EditorColorPicker
          label={t('student.reports.editor.highlight')}
          value={format.highlight ?? '#fef08a'}
          presets={HIGHLIGHT_PRESETS}
          icon={<Highlighter className="h-4 w-4" aria-hidden />}
          disabled={!editor}
          allowClear
          onBeforeOpen={() => editor?.commands.focus()}
          onApply={(color) => run((ed) => applyHighlightColor(ed, color))}
          onClear={() => run(removeHighlight)}
        />

        <span className="student-report-toolbar-divider" aria-hidden />

        {formatBtn('left', AlignLeft, t('student.encadrant.reportEditor.alignLeft'), format.align === 'left', () =>
          run((ed) => {
            ed.chain().focus().setTextAlign('left').run();
          }),
        )}
        {formatBtn('center', AlignCenter, t('student.encadrant.reportEditor.alignCenter'), format.align === 'center', () =>
          run((ed) => {
            ed.chain().focus().setTextAlign('center').run();
          }),
        )}
        {formatBtn('right', AlignRight, t('student.encadrant.reportEditor.alignRight'), format.align === 'right', () =>
          run((ed) => {
            ed.chain().focus().setTextAlign('right').run();
          }),
        )}
        {formatBtn('justify', AlignJustify, t('student.reports.editor.alignJustify'), format.align === 'justify', () =>
          run((ed) => {
            ed.chain().focus().setTextAlign('justify').run();
          }),
        )}

        <span className="student-report-toolbar-divider" aria-hidden />

        {formatBtn('bullet', List, t('student.encadrant.reportEditor.bulletList'), editor?.isActive('bulletList') ?? false, () =>
          run((ed) => {
            ed.chain().focus().toggleBulletList().run();
          }),
        )}
        {formatBtn('ordered', ListOrdered, t('student.encadrant.reportEditor.numberedList'), editor?.isActive('orderedList') ?? false, () =>
          run((ed) => {
            ed.chain().focus().toggleOrderedList().run();
          }),
        )}
        {formatBtn('quote', Quote, t('student.reports.editor.blockquote'), editor?.isActive('blockquote') ?? false, () =>
          run((ed) => {
            ed.chain().focus().toggleBlockquote().run();
          }),
        )}

        <span className="student-report-toolbar-divider" aria-hidden />

        <button
          type="button"
          className="student-report-toolbar-btn"
          disabled={!editor}
          title={t('student.reports.editor.insertLink')}
          aria-label={t('student.reports.editor.insertLink')}
          onMouseDown={(e) => e.preventDefault()}
          onClick={openLinkModal}
        >
          <Link className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="student-report-toolbar-btn"
          disabled={!editor}
          title={t('student.reports.editor.insertImage')}
          aria-label={t('student.reports.editor.insertImage')}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            editor?.commands.focus();
            setImageOpen(true);
          }}
        >
          <Image className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="student-report-toolbar-btn"
          disabled={!editor}
          title={t('student.reports.editor.insertTable')}
          aria-label={t('student.reports.editor.insertTable')}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            editor?.commands.focus();
            setTableOpen(true);
          }}
        >
          <Table className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="student-report-toolbar-btn"
          disabled={!editor}
          title={t('student.reports.editor.insertCode')}
          aria-label={t('student.reports.editor.insertCode')}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() =>
            run((ed) => {
              ed.chain().focus().toggleCodeBlock().run();
            })
          }
        >
          <Code className="h-4 w-4" />
        </button>
        {formatBtn('hr', Minus, t('student.encadrant.reportEditor.horizontalRule'), false, () =>
          run((ed) => {
            ed.chain().focus().setHorizontalRule().run();
          }),
        )}
      </div>

      <LinkInsertModal open={linkOpen} onClose={() => setLinkOpen(false)} onInsert={handleLinkInsert} />
      <ImageInsertModal open={imageOpen} onClose={() => setImageOpen(false)} onInsert={handleImageInsert} />
      <TableBuilderModal open={tableOpen} onClose={() => setTableOpen(false)} onInsert={handleTableInsert} />
    </>
  );
};

export default ReportEditorToolbar;
