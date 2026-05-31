import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ReportEditorTabId, ReportSectionItem } from '../types';
import { reportEditorTabs, reportSections } from '../data/reportMock';
import { REPORT_EDITOR_CARD } from '../constants/reportLayout';
import ReportEditorTabs from './ReportEditorTabs';
import ReportEditorHeader from './ReportEditorHeader';
import ReportEditorToolbar from './ReportEditorToolbar';

interface ReportEditorPanelProps {
  activeSectionId: string;
}

export default function ReportEditorPanel({ activeSectionId }: ReportEditorPanelProps) {
  const { t } = useTranslation();
  const [activeTabId, setActiveTabId] = useState<ReportEditorTabId>('editor');

  const activeSection: ReportSectionItem = useMemo(
    () => reportSections.find((s) => s.id === activeSectionId) ?? reportSections[0],
    [activeSectionId],
  );

  const commentsCount = reportEditorTabs.find((tab) => tab.id === 'comments')?.count ?? 0;

  return (
    <article className={REPORT_EDITOR_CARD}>
      <ReportEditorTabs
        tabs={reportEditorTabs}
        activeTabId={activeTabId}
        onTabChange={setActiveTabId}
      />

      {activeTabId === 'editor' && (
        <div className="flex min-h-0 flex-1 flex-col">
          <ReportEditorHeader section={activeSection} />
          <ReportEditorToolbar />
          <div
            className="mx-3 mb-3 mt-0 min-h-[280px] flex-1 rounded-lg border border-solid border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] sm:mx-4 sm:mb-4 sm:min-h-0"
            role="textbox"
            aria-label={t('student.encadrant.reportEditor.writingAreaAria', { section: activeSection.title })}
            contentEditable
            suppressContentEditableWarning
          />
        </div>
      )}

      {activeTabId === 'preview' && (
        <div className="flex flex-1 flex-col items-center justify-center px-4 py-16">
          <p className="m-0 font-inter text-sm text-[var(--admin-text-muted)]">
            {t('student.encadrant.reportEditor.previewSoon')}
          </p>
        </div>
      )}

      {activeTabId === 'comments' && (
        <div className="flex flex-1 flex-col items-center justify-center px-4 py-16">
          <p className="m-0 font-inter text-sm text-[var(--admin-text-muted)]">
            {t('student.encadrant.reportEditor.commentsSoon', { count: commentsCount })}
          </p>
        </div>
      )}
    </article>
  );
}
