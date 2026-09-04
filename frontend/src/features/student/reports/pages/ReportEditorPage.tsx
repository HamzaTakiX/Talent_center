import { FunctionComponent, useCallback, useRef, useState } from 'react';
import type { Editor } from '@tiptap/core';
import { useNavigate, useParams } from 'react-router-dom';
import { jsPDF } from 'jspdf';

import { useAdminTheme } from '../../../admin/dashboard/context/AdminThemeContext';
import { STUDENT_REPORTS_PATH } from '../constants/routes';
import { usePageAnalysis } from '../hooks/usePageAnalysis';
import { useReportPlatform } from '../hooks/useReportPlatform';
import type { AnalysisIssue, AnalysisMode } from '../types/pageAnalysis';
import ReportAnalyticsBar from '../components/editor/ReportAnalyticsBar';
import ReportEditorTopBar from '../components/editor/ReportEditorTopBar';
import ReportExitDialog from '../components/editor/ReportExitDialog';
import ReportExportCenter from '../components/editor/ReportExportCenter';
import ReportMainEditor from '../components/editor/ReportMainEditor';
import ReportModelComparePane from '../components/editor/ReportModelComparePane';
import ReportProgressSidebar from '../components/editor/ReportProgressSidebar';
import ReportRightPanel from '../components/editor/ReportRightPanel';
import ReportVersionHistoryPanel from '../components/editor/ReportVersionHistoryPanel';

const ReportEditorPage: FunctionComponent = () => {
  const { reportId = 'rpt-main-2026' } = useParams<{ reportId: string }>();
  const navigate = useNavigate();
  const { theme } = useAdminTheme();
  const platform = useReportPlatform(reportId);
  const analysis = usePageAnalysis(reportId);
  const editorRef = useRef<Editor | null>(null);

  const [isExporting, setIsExporting] = useState(false);
  const [exitOpen, setExitOpen] = useState(false);
  const [rightPanelBeforeCompare, setRightPanelBeforeCompare] = useState(true);
  const [pageCount, setPageCount] = useState(1);
  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  const [navigateToHeading, setNavigateToHeading] = useState<{
    title: string;
    level: 1 | 2 | 3;
    token: number;
  } | null>(null);
  const [highlightIssue, setHighlightIssue] = useState<{
    quote: string;
    pageNumber: number;
    token: number;
  } | null>(null);
  const [activeOutlineId, setActiveOutlineId] = useState<string | null>(null);

  const compareOpen = platform.modelGuidePanelOpen;

  const handleEditorReady = useCallback((editor: Editor | null) => {
    editorRef.current = editor;
  }, []);

  const closeCompare = useCallback(() => {
    platform.setModelGuidePanelOpen(false);
    platform.setRightPanelOpen(rightPanelBeforeCompare);
  }, [platform, rightPanelBeforeCompare]);

  const openCompare = useCallback(() => {
    setRightPanelBeforeCompare(platform.rightPanelOpen);
    platform.setRightPanelOpen(false);
    platform.setModelGuidePanelOpen(true);
  }, [platform]);

  const leaveEditor = useCallback(() => {
    navigate(STUDENT_REPORTS_PATH);
  }, [navigate]);

  const requestQuit = useCallback(() => {
    if (platform.autoSaveEnabled) {
      platform.flushPendingSave();
      leaveEditor();
      return;
    }
    if (platform.isDirty) {
      setExitOpen(true);
      return;
    }
    leaveEditor();
  }, [
    leaveEditor,
    platform.autoSaveEnabled,
    platform.flushPendingSave,
    platform.isDirty,
  ]);

  const handleSaveAndQuit = useCallback(() => {
    platform.saveNow();
    setExitOpen(false);
    leaveEditor();
  }, [leaveEditor, platform.saveNow]);

  const handleDiscardAndQuit = useCallback(() => {
    platform.discardChanges();
    setExitOpen(false);
    leaveEditor();
  }, [leaveEditor, platform.discardChanges]);

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

  const runAnalyze = useCallback(
    (mode: AnalysisMode = 'full') => {
      void analysis.runAnalysis(editorRef.current, mode, currentPageNumber);
    },
    [analysis, currentPageNumber],
  );

  const handleViewIssue = useCallback((issue: AnalysisIssue) => {
    setHighlightIssue({
      quote: issue.quote || '',
      pageNumber: issue.pageNumber || currentPageNumber,
      token: Date.now(),
    });
  }, [currentPageNumber]);

  const bodyClass = [
    'student-report-editor-body',
    compareOpen ? 'student-report-editor-body--compare' : '',
    !platform.rightPanelOpen && !compareOpen ? 'student-report-editor-body--expanded' : '',
  ]
    .filter(Boolean)
    .join(' ');

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
        modelCompareOpen={compareOpen}
        onTitleChange={platform.setTitle}
        onAutoSaveChange={platform.setAutoSave}
        onSave={platform.saveNow}
        onExportPdf={() => void exportPdf()}
        onExportDocx={exportDocx}
        onOpenModelGuide={compareOpen ? closeCompare : openCompare}
        onTogglePanel={() => {
          if (compareOpen) return;
          platform.setRightPanelOpen((v) => !v);
        }}
        onQuit={requestQuit}
      />

      <ReportAnalyticsBar
        analytics={platform.analytics}
        pageCount={pageCount}
        maxPages={platform.modelGuide?.maxPages}
      />

      <div className={bodyClass}>
        {!compareOpen && (
          <ReportProgressSidebar
            reportId={reportId}
            model={platform.modelGuide}
            studentHtml={platform.report.content}
            pageCount={pageCount}
            selectedSectionId={activeOutlineId}
            onSelectSection={(section) => {
              setActiveOutlineId(section.id);
              setNavigateToHeading({
                title: section.title,
                level: section.level,
                token: Date.now(),
              });
            }}
          />
        )}

        <ReportMainEditor
          content={platform.report.content}
          onContentChange={platform.updateContent}
          onPageCountChange={setPageCount}
          onCurrentPageChange={setCurrentPageNumber}
          onEditorReady={handleEditorReady}
          navigateToHeading={navigateToHeading}
          highlightIssue={highlightIssue}
          comments={platform.report.comments}
          onOpenComments={() => {
            if (compareOpen) closeCompare();
            platform.setRightPanelOpen(true);
          }}
        />

        {compareOpen ? (
          <ReportModelComparePane
            model={platform.modelGuide}
            loadState={platform.modelGuideState}
            focusSectionId={null}
            onClose={closeCompare}
            onRetry={platform.refreshModelGuide}
          />
        ) : (
          platform.rightPanelOpen && (
            <ReportRightPanel
              comments={platform.report.comments}
              onResolve={(id) => platform.updateComment(id, { resolved: true })}
              onMarkFixed={(id) => platform.updateComment(id, { fixed: true })}
              onReply={platform.replyToComment}
              reviewerState={analysis.state}
              reviewerResult={analysis.result}
              reviewerError={analysis.error}
              reviewerIssues={analysis.visibleIssues}
              reviewerLoading={analysis.isLoading}
              currentPageNumber={currentPageNumber}
              onAnalyzePage={() => runAnalyze('full')}
              onAnalyzeMode={(mode) => runAnalyze(mode)}
              onViewIssue={handleViewIssue}
              onIgnoreIssue={analysis.ignoreIssue}
            />
          )
        )}
      </div>

      <ReportVersionHistoryPanel
        open={platform.versionPanelOpen}
        onClose={() => platform.setVersionPanelOpen(false)}
        versions={platform.report.versions}
        onRestore={platform.restoreVersion}
      />

      <ReportExportCenter
        open={platform.exportPanelOpen}
        onClose={() => platform.setExportPanelOpen(false)}
        onExportPdf={() => void exportPdf()}
        onExportDocx={exportDocx}
        onPrint={platform.exportPrint}
        isExporting={isExporting}
      />

      <ReportExitDialog
        open={exitOpen}
        onCancel={() => setExitOpen(false)}
        onSaveAndQuit={handleSaveAndQuit}
        onDiscardAndQuit={handleDiscardAndQuit}
      />
    </div>
  );
};

export default ReportEditorPage;
