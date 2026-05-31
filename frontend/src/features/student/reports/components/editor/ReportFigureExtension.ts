import { Node, mergeAttributes } from '@tiptap/core';

export type FigureAlign = 'left' | 'center' | 'right';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    reportFigure: {
      insertReportFigure: (attrs: { src: string; align?: FigureAlign; width?: number; caption?: string }) => ReturnType;
      updateReportFigure: (attrs: Partial<{ align: FigureAlign; width: number; caption: string }>) => ReturnType;
      removeReportFigure: () => ReturnType;
    };
  }
}

export const ReportFigure = Node.create({
  name: 'reportFigure',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      src: { default: null },
      align: { default: 'center' as FigureAlign },
      width: { default: 480 },
      caption: { default: '' },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'figure.student-report-figure',
        getAttrs: (node) => {
          const el = node as HTMLElement;
          const img = el.querySelector('img');
          const cap = el.querySelector('figcaption');
          const widthMatch = img?.style.maxWidth?.match(/(\d+)/);
          return {
            src: img?.getAttribute('src'),
            align: (el.dataset.align as FigureAlign) || 'center',
            width: widthMatch ? Number(widthMatch[1]) : 480,
            caption: cap?.textContent?.trim() ?? '',
          };
        },
      },
    ];
  },

  renderHTML({ node }) {
    const { src, align, width, caption } = node.attrs as {
      src: string;
      align: FigureAlign;
      width: number;
      caption: string;
    };
    const capClass = caption
      ? 'student-report-figure__caption'
      : 'student-report-figure__caption student-report-figure__caption--empty';

    return [
      'figure',
      mergeAttributes({
        class: `student-report-figure is-${align}`,
        'data-align': align,
        contenteditable: 'false',
      }),
      [
        'img',
        {
          src,
          alt: '',
          draggable: 'false',
          style: `width:100%;max-width:${width}px`,
        },
      ],
      ['figcaption', { class: capClass }, caption],
    ];
  },

  addCommands() {
    return {
      insertReportFigure:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: {
              align: 'center',
              width: 480,
              caption: '',
              ...attrs,
            },
          }),
      updateReportFigure:
        (attrs) =>
        ({ commands }) =>
          commands.updateAttributes(this.name, attrs),
      removeReportFigure:
        () =>
        ({ commands }) =>
          commands.deleteSelection(),
    };
  },
});
