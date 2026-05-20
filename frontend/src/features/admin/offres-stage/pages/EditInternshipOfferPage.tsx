import { FunctionComponent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useAdminBackLabel } from '../../i18n/useAdminCopy';
import AdminFormPageShell from '../../ui/AdminFormPageShell';
import CreateInternshipOfferForm from '../components/CreateInternshipOfferForm';
import { internshipOffersMockData } from '../data/internshipOffersMockData';

const FORM_PREFIX = 'admin.forms.createOffer';

const EditInternshipOfferPage: FunctionComponent = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const backLabel = useAdminBackLabel('offers');
  const goBack = () => navigate('/admin/internship-offers');

  const offer = useMemo(
    () => internshipOffersMockData.find((o) => o.id === id),
    [id],
  );

  if (!offer) {
    return (
      <AdminFormPageShell backLabel={backLabel} onBack={goBack}>
        <p className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface-muted)]/30 px-4 py-6 text-sm text-[var(--admin-text-secondary)]">
          {t('admin.common.notFound.offer')}
        </p>
      </AdminFormPageShell>
    );
  }

  return (
    <AdminFormPageShell
      backLabel={backLabel}
      onBack={goBack}
      heroTitle={t(`${FORM_PREFIX}.editTitle`)}
      heroSubtitle={t(`${FORM_PREFIX}.editSubtitle`)}
      breadcrumbs={[
        { label: t('admin.common.breadcrumbs.offers'), onClick: goBack },
        { label: offer.title },
      ]}
    >
      <CreateInternshipOfferForm
        hidePanelHeader
        variant="edit"
        initialValues={{
          offerTitle: offer.title,
          company: offer.company,
          deadline: offer.deadline,
          location: '',
          offerType: '',
          duration: '',
          description: '',
          skills: '',
          tags: '',
        }}
        onCancel={goBack}
        onPublish={goBack}
      />
    </AdminFormPageShell>
  );
};

export default EditInternshipOfferPage;
