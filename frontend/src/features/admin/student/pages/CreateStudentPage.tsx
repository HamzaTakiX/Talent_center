import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAdminBackLabel } from '../../i18n/useAdminCopy';
import AdminFormPageShell from '../../ui/AdminFormPageShell';
import StudentAccountForm from '../components/StudentAccountForm';

const FORM_PREFIX = 'admin.forms.createStudent';

const CreateStudentPage: FunctionComponent = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const backLabel = useAdminBackLabel('students');
  const goBack = () => navigate('/admin/students');

  return (
    <AdminFormPageShell
      backLabel={backLabel}
      onBack={goBack}
      heroTitle={t(`${FORM_PREFIX}.title`)}
      heroSubtitle={t(`${FORM_PREFIX}.subtitle`)}
      breadcrumbs={[
        { label: t('admin.common.breadcrumbs.students'), onClick: goBack },
        { label: t('admin.common.breadcrumbs.newStudent') },
      ]}
    >
      <StudentAccountForm hidePanelHeader mode="create" onCancel={goBack} onSaved={goBack} />
    </AdminFormPageShell>
  );
};

export default CreateStudentPage;
