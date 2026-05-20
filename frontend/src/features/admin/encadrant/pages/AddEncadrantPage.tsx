import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAdminBackLabel } from '../../i18n/useAdminCopy';
import AdminFormPageShell from '../../ui/AdminFormPageShell';
import EncadrantAccountForm from '../components/EncadrantAccountForm';

const FORM_PREFIX = 'admin.forms.createEncadrant';

const AddEncadrantPage: FunctionComponent = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const backLabel = useAdminBackLabel('encadrants');
  const goBack = () => navigate('/admin/encadrants');

  return (
    <AdminFormPageShell
      backLabel={backLabel}
      onBack={goBack}
      heroTitle={t(`${FORM_PREFIX}.title`)}
      heroSubtitle={t(`${FORM_PREFIX}.subtitle`)}
    >
      <EncadrantAccountForm mode="create" hidePanelHeader onCancel={goBack} onSaved={goBack} />
    </AdminFormPageShell>
  );
};

export default AddEncadrantPage;
