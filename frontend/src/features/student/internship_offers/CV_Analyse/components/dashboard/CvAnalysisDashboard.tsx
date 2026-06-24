import { FunctionComponent, useCallback, useEffect } from 'react';
import type { CvAnalysisDashboardData } from '../../types/cvAnalysisDashboard';
import { useCvAnalysisDashboard } from '../../hooks/useCvAnalysisDashboard';
import CvAnalysisNavSidebar from './CvAnalysisNavSidebar';
import CvAnalysisMainContent from './CvAnalysisMainContent';
import { CvAnalysisEmptyState, CvAnalysisErrorState, CvAnalysisAnalyzingState, CvAnalysisSkeleton } from './CvAnalysisStates';

interface CvAnalysisDashboardProps {
  initialState?: 'loading' | 'empty' | 'success' | 'error';
}

const CvAnalysisDashboard: FunctionComponent<CvAnalysisDashboardProps> = ({
  initialState = 'success',
}) => {
  const {
    viewState,
    data,
    analysisStatus,
    activeSection,
    expandedMatchId,
    setExpandedMatchId,
    expandedRecId,
    setExpandedRecId,
    scrollToSection,
    reanalyze,
    retry,
    registerSectionObserver,
    openImportDialog,
    fileInputRef,
    handleImportFileChange,
  } = useCvAnalysisDashboard({ initialState });

  useEffect(() => {
    if (viewState === 'success') {
      const timer = window.setTimeout(() => registerSectionObserver(), 400);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [viewState, registerSectionObserver]);

  const handleToggleMatch = useCallback(
    (id: string) => setExpandedMatchId((prev) => (prev === id ? null : id)),
    [setExpandedMatchId],
  );

  const handleToggleRec = useCallback(
    (id: string) => setExpandedRecId((prev) => (prev === id ? null : id)),
    [setExpandedRecId],
  );

  const handleUpload = useCallback(() => {
    openImportDialog();
  }, [openImportDialog]);

  if (viewState === 'loading') {
    return <CvAnalysisSkeleton />;
  }

  if (viewState === 'empty') {
    return (
      <div className="sr-cva__root sr-cva" id="student-cv-analysis-dashboard">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={handleImportFileChange}
        />
        <CvAnalysisEmptyState onUpload={openImportDialog} />
      </div>
    );
  }

  if (viewState === 'analyzing' && !data) {
    return <CvAnalysisAnalyzingState />;
  }

  if (viewState === 'error') {
    return (
      <div className="sr-cva__root sr-cva">
        <CvAnalysisErrorState onRetry={retry} />
      </div>
    );
  }

  if (!data) return <CvAnalysisSkeleton />;

  return (
    <div className="sr-cva__root sr-cva" id="student-cv-analysis-dashboard">
      <div className="sr-cva__grid">
        <CvAnalysisNavSidebar activeSection={activeSection} onNavigate={scrollToSection} />

        <CvAnalysisMainContent
          data={data as CvAnalysisDashboardData}
          analysisStatus={analysisStatus}
          isAnalyzing={viewState === 'analyzing'}
          expandedMatchId={expandedMatchId}
          onToggleMatch={handleToggleMatch}
          expandedRecId={expandedRecId}
          onToggleRec={handleToggleRec}
          onReanalyze={reanalyze}
          onImport={handleUpload}
          fileInputRef={fileInputRef}
          onImportFileChange={handleImportFileChange}
        />
      </div>
    </div>
  );
};

export default CvAnalysisDashboard;
