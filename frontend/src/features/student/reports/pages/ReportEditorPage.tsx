import { FunctionComponent, useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';
import { jsPDF } from 'jspdf';

import { useAdminTheme } from '../../../admin/dashboard/context/AdminThemeContext';
import { useReportPlatform } from '../hooks/useReportPlatform';
import ReportAnalyticsBar from '../components/editor/ReportAnalyticsBar';
import ReportEditorTopBar from '../components/editor/ReportEditorTopBar';
import ReportExportCenter from '../components/editor/ReportExportCenter';
import ReportMainEditor from '../components/editor/ReportMainEditor';
import ReportReferencesManager from '../components/editor/ReportReferencesManager';
import ReportRightPanel from '../components/editor/ReportRightPanel';
import ReportVersionHistoryPanel from '../components/editor/ReportVersionHistoryPanel';

const ReportEditorPage: FunctionComponent = () => {
  const { reportId = 'rpt-main-2026' } = useParams<{ reportId: string }>();
  const { theme } = useAdminTheme();
  const platform = useReportPlatform(reportId);
  const [isExporting, setIsExporting] = useState(false);

  const exportPdf = useCallback(async () => {
    setIsExporting(true);
    try {
      const container = document.createElement('div');
      container.innerHTML = platform.report.content;
      container.style.cssText = 'position:fixed;left:-9999px;width:800px;padding:40px;font-family:Inter,sans-serif;';
      document.body.appendChild(container);
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
      pdf.html(container, {
        callback: (doc) => {
          doc.save(`${platform.report.title}.pdf`);
          document.body.removeChild(container);
        },
        margin: [40, 40, 40, 40],
        width: 520,
      });
    } finally {
      setIsExporting(false);
    }
  }, [platform.report]);

  const exportDocx = useCallback(() => {
    const blob = new Blob(
      [`<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${platform.report.content}</body></html>`],
      { type: 'application/msword' },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${platform.report.title}.doc`;
    a.click();
    URL.revokeObjectURL(url);
  }, [platform.report]);

  return (
    <div
      data-admin-theme={theme}
      className="student-report-app flex h-[100dvh] w-full flex-col overflow-hidden font-inter antialiased"
    >
      <ReportEditorTopBar
        title={platform.report.title}
        autoSaveState={platform.autoSaveState}
        autoSaveEnabled={platform.autoSaveEnabled}
        savedLabel={platform.savedLabel}
        rightPanelOpen={platform.rightPanelOpen}
        onTitleChange={platform.setTitle}
        onAutoSaveChange={platform.setAutoSave}
        onSave={platform.saveNow}
        onExportPdf={() => void exportPdf()}
        onExportDocx={exportDocx}
        onOpenVersions={() => platform.setVersionPanelOpen(true)}
        onOpenReferences={() => platform.setReferencesPanelOpen(true)}
        onTogglePanel={() => platform.setRightPanelOpen((v) => !v)}
      />

      <ReportAnalyticsBar analytics={platform.analytics} />

      <div className={`student-report-editor-body ${platform.rightPanelOpen ? '' : 'student-report-editor-body--expanded'}`}>
        <ReportMainEditor
          content={platform.report.content}
          onContentChange={platform.updateContent}
        />

        {platform.rightPanelOpen && (
          <ReportRightPanel
            comments={platform.report.comments}
            onResolve={(id) => platform.updateComment(id, { resolved: true })}
            onMarkFixed={(id) => platform.updateComment(id, { fixed: true })}
            onReply={platform.replyToComment}
          />
        )}
      </div>

      <ReportVersionHistoryPanel
        open={platform.versionPanelOpen}
        onClose={() => platform.setVersionPanelOpen(false)}
        versions={platform.report.versions}
        onRestore={platform.restoreVersion}
      />

      <ReportReferencesManager
        open={platform.referencesPanelOpen}
        onClose={() => platform.setReferencesPanelOpen(false)}
        references={platform.report.references}
        onAdd={platform.addReference}
        onRemove={platform.removeReference}
      />

      <ReportExportCenter
        open={platform.exportPanelOpen}
        onClose={() => platform.setExportPanelOpen(false)}
        onExportPdf={() => void exportPdf()}
        onExportDocx={exportDocx}
        onPrint={platform.exportPrint}
        isExporting={isExporting}
      />
    </div>
  );
};

export default ReportEditorPage;
