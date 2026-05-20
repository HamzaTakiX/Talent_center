import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAdminBackLabel } from '../../i18n/useAdminCopy';
import AdminFormPageShell from '../../ui/AdminFormPageShell';
import CreateInternshipOfferForm from '../components/CreateInternshipOfferForm';

const FORM_PREFIX = 'admin.forms.createOffer';

const CreateInternshipOfferPage: FunctionComponent = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const backLabel = useAdminBackLabel('offers');
  const goBack = () => navigate('/admin/internship-offers');

  return (
    <AdminFormPageShell
      backLabel={backLabel}
      onBack={goBack}
      heroTitle={t(`${FORM_PREFIX}.title`)}
      heroSubtitle={t(`${FORM_PREFIX}.subtitle`)}
    >
      <CreateInternshipOfferForm hidePanelHeader onCancel={goBack} onPublish={goBack} />
    </AdminFormPageShell>
  );
};

export default CreateInternshipOfferPage;
