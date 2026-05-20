import { useState } from 'react';
import { reportProgress, reportSections } from '../data/reportMock';
import { REPORT_WORKSPACE_GRID } from '../constants/reportLayout';
import ReportSidebar from './ReportSidebar';
import ReportEditorPanel from './ReportEditorPanel';

export default function ReportWorkspace() {
  const [activeSectionId, setActiveSectionId] = useState(reportSections[0].id);

  return (
    <div className={REPORT_WORKSPACE_GRID}>
      <ReportSidebar
        sections={reportSections}
        progress={reportProgress}
        activeSectionId={activeSectionId}
        onSelectSection={setActiveSectionId}
      />
      <ReportEditorPanel activeSectionId={activeSectionId} />
    </div>
  );
}
