import { FunctionComponent, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import AdminLayout from '../../dashboard/components/AdminLayout';
import { staggerContainer } from '../../dashboard/ui/animations';
import CreateOfferStudio from '../components/create/CreateOfferStudio';
import OfferStudioLoadingSkeleton from '../components/create/OfferStudioLoadingSkeleton';
import { useStageOfferDetail } from '../hooks/useStageOffers';
import { mapBackendStatusToUi, mapStageDetailToCreateOfferForm } from '../../../shared/utils/stageMappers';
import '../styles/create-offer-studio.css';

const EditInternshipOfferPage: FunctionComponent = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const goBack = () => navigate('/admin/internship-offers');
  const { data: offer, loading, error } = useStageOfferDetail(id);

  const initialForm = useMemo(
    () => (offer ? mapStageDetailToCreateOfferForm(offer) : undefined),
    [offer],
  );

  if (loading) {
    return (
      <AdminLayout>
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="admin-page mx-auto w-full min-w-0 max-w-[1680px] font-inter"
        >
          <OfferStudioLoadingSkeleton />
        </motion.div>
      </AdminLayout>
    );
  }

  if (error || !offer || !initialForm || !id) {
    return (
      <AdminLayout>
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="admin-page mx-auto w-full min-w-0 max-w-[1680px] font-inter"
        >
          <div className="offer-studio-page">
            <p className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface-muted)]/30 px-4 py-6 text-sm text-[var(--admin-text-secondary)]">
              {error ?? t('admin.common.notFound.offer')}
            </p>
          </div>
        </motion.div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="admin-page mx-auto w-full min-w-0 max-w-[1680px] font-inter"
      >
        <CreateOfferStudio
          mode="edit"
          offerId={id}
          initialForm={initialForm}
          offerStatus={mapBackendStatusToUi(offer.status)}
          lastUpdatedAt={offer.updated_at ?? offer.created_at ?? null}
          onBack={goBack}
        />
      </motion.div>
    </AdminLayout>
  );
};

export default EditInternshipOfferPage;
