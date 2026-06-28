import { FunctionComponent } from 'react';
import StudentLayout from '../../../components/StudentLayout';
import CvBuilderWorkspace from '../components/CvBuilderWorkspace';
import { CV_BUILDER_PAGE_ROOT } from '../constants/cvBuilderLayout';

const CvBuilderPage: FunctionComponent = () => (
  <StudentLayout mainFillHeight contentFlush>
    <div id="student-cv-builder-root" className={CV_BUILDER_PAGE_ROOT}>
      <CvBuilderWorkspace />
    </div>
  </StudentLayout>
);

export default CvBuilderPage;
