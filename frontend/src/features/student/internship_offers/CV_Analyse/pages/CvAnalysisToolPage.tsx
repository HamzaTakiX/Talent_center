import { FunctionComponent } from 'react';
import StudentLayout from '../../../components/StudentLayout';
import CvAnalysisDashboard from '../components/dashboard/CvAnalysisDashboard';
import { CV_ANALYSIS_TOOL_PAGE_ROOT } from '../constants/cvAnalysisToolLayout';

const CvAnalysisToolPage: FunctionComponent = () => {
  return (
    <StudentLayout>
      <div id="student-cv-analysis-tool-root" className={CV_ANALYSIS_TOOL_PAGE_ROOT}>
        <CvAnalysisDashboard />
      </div>
    </StudentLayout>
  );
};

export default CvAnalysisToolPage;
