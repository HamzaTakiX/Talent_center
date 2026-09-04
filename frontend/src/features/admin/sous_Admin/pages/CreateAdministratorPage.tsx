import { FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminBackLabel } from '../../i18n/useAdminCopy';
import AdminFormPageShell from '../../ui/AdminFormPageShell';
import AdministratorAccountForm from '../components/AdministratorAccountForm';

const CreateAdministratorPage: FunctionComponent = () => {
  const navigate = useNavigate();
  const backLabel = useAdminBackLabel('administrators');
  const goBack = () => navigate('/admin/admins');

  return (
    <AdminFormPageShell backLabel={backLabel} onBack={goBack} hideBack>
      <AdministratorAccountForm
        mode="create"
        backLabel={backLabel}
        onCancel={goBack}
        onSaved={goBack}
      />
    </AdminFormPageShell>
  );
};

export default CreateAdministratorPage;
