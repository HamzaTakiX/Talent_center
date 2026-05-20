import { BarChart3, History, Save, Send } from 'lucide-react';
import type { ReportSectionItem } from '../types';
import { reportSectionStatusSubtitle } from '../data/reportBadgeMaps';
import { REPORT_OUTLINE_BTN, REPORT_PRIMARY_BTN } from '../constants/reportStyles';

interface ReportEditorHeaderProps {
  section: ReportSectionItem;
}

export default function ReportEditorHeader({ section }: ReportEditorHeaderProps) {
  const subtitleStatus = reportSectionStatusSubtitle[section.status];

  return (
    <header className="flex w-full min-w-0 flex-col gap-3 border-b border-solid border-[var(--admin-border)] px-3 py-3 sm:px-4 sm:py-4">
      <div className="flex w-full min-w-0 flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="m-0 font-inter text-lg font-semibold leading-7 text-[var(--admin-text)] sm:text-xl">
            {section.title}
          </h1>
          <p className="m-0 mt-0.5 font-inter text-[13px] leading-5 text-[var(--admin-text-muted)]">
            {section.wordCount} mots • {subtitleStatus}
          </p>
        </div>
        <div className="flex w-full min-w-0 flex-wrap items-center justify-start gap-2 lg:w-auto lg:shrink-0 lg:justify-end">
          <button type="button" className={REPORT_OUTLINE_BTN}>
            <History className="h-4 w-4 shrink-0" aria-hidden />
            Versions
          </button>
          <button type="button" className={REPORT_OUTLINE_BTN}>
            <BarChart3 className="h-4 w-4 shrink-0" aria-hidden />
            Analyse
          </button>
          <button type="button" className={REPORT_OUTLINE_BTN}>
            <Save className="h-4 w-4 shrink-0" aria-hidden />
            Enregistrer
          </button>
          <button type="button" className={REPORT_PRIMARY_BTN}>
            <Send className="h-4 w-4 shrink-0" aria-hidden />
            Soumettre
          </button>
        </div>
      </div>
    </header>
  );
}
