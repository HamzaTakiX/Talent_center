import { FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminBackLabel } from '../../i18n/useAdminCopy';
import AdminFormPageShell from '../../ui/AdminFormPageShell';
import StudentAccountForm from '../components/StudentAccountForm';

const CreateStudentPage: FunctionComponent = () => {
  const navigate = useNavigate();
  const backLabel = useAdminBackLabel('students');
  const goBack = () => navigate('/admin/students');

  return (
    <AdminFormPageShell backLabel={backLabel} onBack={goBack} hideBack>
      <StudentAccountForm
        mode="create"
        stickyActions={false}
        backLabel={backLabel}
        onCancel={goBack}
        onSaved={goBack}
      />
    </AdminFormPageShell>
  );
};

export default CreateStudentPage;
