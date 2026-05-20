import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAdminBackLabel } from '../../i18n/useAdminCopy';
import AdminFormPageShell from '../../ui/AdminFormPageShell';
import AdministratorAccountForm from '../components/AdministratorAccountForm';

const FORM_PREFIX = 'admin.forms.createAdministrator';

const CreateAdministratorPage: FunctionComponent = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const backLabel = useAdminBackLabel('administrators');
  const goBack = () => navigate('/admin/admins');

  return (
    <AdminFormPageShell
      backLabel={backLabel}
      onBack={goBack}
      heroTitle={t(`${FORM_PREFIX}.title`)}
      heroSubtitle={t(`${FORM_PREFIX}.subtitle`)}
      breadcrumbs={[
        { label: t('admin.common.breadcrumbs.administrators'), onClick: goBack },
        { label: t('admin.common.breadcrumbs.newAdministrator') },
      ]}
    >
      <AdministratorAccountForm hidePanelHeader mode="create" onCancel={goBack} onSaved={goBack} />
    </AdminFormPageShell>
  );
};

export default CreateAdministratorPage;
