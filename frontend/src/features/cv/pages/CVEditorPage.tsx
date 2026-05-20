import { FunctionComponent } from 'react';
import CvQuickBuilderEmbed from '../components/CvQuickBuilderEmbed';
import CvEditorShell from '../components/CvEditorShell';

const CVEditorPage: FunctionComponent = () => (
  <CvEditorShell>
    <CvQuickBuilderEmbed className="min-h-0 flex-1" />
  </CvEditorShell>
);

export default CVEditorPage;
