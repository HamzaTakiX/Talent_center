import { FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminBackLabel } from '../../i18n/useAdminCopy';
import AdminFormPageShell from '../../ui/AdminFormPageShell';
import EncadrantAccountForm from '../components/EncadrantAccountForm';

const AddEncadrantPage: FunctionComponent = () => {
  const navigate = useNavigate();
  const backLabel = useAdminBackLabel('encadrants');
  const goBack = () => navigate('/admin/encadrants');

  return (
    <AdminFormPageShell backLabel={backLabel} onBack={goBack} hideBack>
      <EncadrantAccountForm
        mode="create"
        backLabel={backLabel}
        onCancel={goBack}
        onSaved={goBack}
      />
    </AdminFormPageShell>
  );
};

export default AddEncadrantPage;
