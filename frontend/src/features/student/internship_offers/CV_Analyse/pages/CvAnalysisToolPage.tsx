import { FunctionComponent, useState } from 'react';
import StudentLayout from '../../../components/StudentLayout';
import CvAnalysisToolMain from '../components/CvAnalysisToolMain';
import CvAiAssistantMain from '../components/CvAiAssistantMain';
import { CV_ANALYSIS_TOOL_PAGE_ROOT } from '../constants/cvAnalysisToolLayout';
import { CV_ASSISTANT_VIEWPORT_SHELL } from '../constants/cvAiAssistantLayout';

type CvAnalysisView = 'selection' | 'assistant';

const CvAnalysisToolPage: FunctionComponent = () => {
  const [view, setView] = useState<CvAnalysisView>('selection');

  return (
    <StudentLayout>
      <div
        id="student-cv-analysis-tool-root"
        className={view === 'assistant' ? CV_ASSISTANT_VIEWPORT_SHELL : CV_ANALYSIS_TOOL_PAGE_ROOT}
      >
        {view === 'selection' ? (
          <CvAnalysisToolMain onAnalyze={() => setView('assistant')} />
        ) : (
          <CvAiAssistantMain />
        )}
      </div>
    </StudentLayout>
  );
};

export default CvAnalysisToolPage;
