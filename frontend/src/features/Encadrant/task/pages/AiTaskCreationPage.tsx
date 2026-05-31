import { FunctionComponent } from 'react';
import EncadrantLayout from '../../components/EncadrantLayout';
import AiTaskCreationForm from '../components/AiTaskCreationForm';
import { AI_TASK_PAGE_ROOT } from '../constants/aiTaskCreationLayout';

const AiTaskCreationPage: FunctionComponent = () => (
  <EncadrantLayout headerTitle="Task" headerSubtitle="Encadrant Portal">
    <div id="encadrant-ai-task-creation-root" className={AI_TASK_PAGE_ROOT}>
      <AiTaskCreationForm />
    </div>
  </EncadrantLayout>
);

export default AiTaskCreationPage;
