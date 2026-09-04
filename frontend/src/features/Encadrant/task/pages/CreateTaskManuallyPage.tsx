import { FunctionComponent } from 'react';
import EncadrantLayout from '../../components/EncadrantLayout';
import CreateTaskManuallyForm from '../components/CreateTaskManuallyForm';
import { CREATE_TASK_PAGE_ROOT } from '../constants/createTaskManuallyLayout';

const CreateTaskManuallyPage: FunctionComponent = () => (
  <EncadrantLayout>
    <div id="encadrant-create-task-manually-root" className={CREATE_TASK_PAGE_ROOT}>
      <CreateTaskManuallyForm />
    </div>
  </EncadrantLayout>
);

export default CreateTaskManuallyPage;
