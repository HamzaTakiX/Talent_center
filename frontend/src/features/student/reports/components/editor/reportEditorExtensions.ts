import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import { Table } from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyleKit } from '@tiptap/extension-text-style';
import StarterKit from '@tiptap/starter-kit';

import { ReportFigure } from './ReportFigureExtension';

export function getReportEditorExtensions() {
  return [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] },
      code: { HTMLAttributes: { class: 'student-report-inline-code' } },
      undoRedo: { depth: 200 },
      link: {
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: { rel: 'noopener noreferrer' },
      },
    }),
    TextStyleKit.configure({
      textStyle: { mergeNestedSpanStyles: true },
      backgroundColor: false,
    }),
    Highlight.configure({ multicolor: true }),
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    Subscript,
    Superscript,
    ReportFigure,
    Image.configure({
      inline: false,
      allowBase64: true,
      HTMLAttributes: { class: 'student-report-inline-image' },
    }),
    Table.configure({
      resizable: false,
      HTMLAttributes: { class: 'student-report-table' },
    }),
    TableRow,
    TableHeader,
    TableCell,
    Placeholder.configure({ placeholder: '' }),
  ];
}
