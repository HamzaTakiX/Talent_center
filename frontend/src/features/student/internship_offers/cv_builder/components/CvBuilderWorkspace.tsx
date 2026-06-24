import { FunctionComponent } from 'react';
import CvQuickBuilderEmbed from '../../../../cv/components/CvQuickBuilderEmbed';
import CvEditorToolbar from '../../../../cv/components/CvEditorToolbar';
import CvAiConfigBanner from '../../../../cv/components/ai/CvAiConfigBanner';
import CvAiOverviewPanel from '../../../../cv/components/ai/CvAiOverviewPanel';
import CvAiValidationPanel from '../../../../cv/components/ai/CvAiValidationPanel';
import '../../../../cv/styles/cv-ai-insights.css';

const CvBuilderWorkspace: FunctionComponent = () => (
  <div data-cv-editor-shell className="flex h-full min-h-0 w-full flex-col overflow-hidden">
    <CvAiConfigBanner />
    <CvEditorToolbar />
    <div className="cv-editor-main relative min-h-0 flex-1 flex flex-col overflow-hidden">
      <CvQuickBuilderEmbed className="min-h-0 flex-1" />
      <CvAiOverviewPanel />
      <CvAiValidationPanel />
    </div>
  </div>
);

export default CvBuilderWorkspace;
