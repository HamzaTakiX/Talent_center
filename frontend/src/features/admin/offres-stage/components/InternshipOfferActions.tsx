import { FunctionComponent, useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { adminCrudRoutes } from '../../shared/navigation/adminCrudRoutes';
import AdminDeleteConfirmModal from '../../ui/AdminDeleteConfirmModal';
import AdminRowActionsMenu from '../../ui/AdminRowActionsMenu';
import { InternshipOffer } from '../types';
import { useStageOfferMutation } from '../hooks/useStageOfferMutation';

interface InternshipOfferActionsProps {
  offer: InternshipOffer;
  onView?: (offer: InternshipOffer) => void;
}

const ARCHIVABLE_STATUSES: InternshipOffer['status'][] = ['Active', 'Expired', 'Closed'];

const InternshipOfferActions: FunctionComponent<InternshipOfferActionsProps> = ({
  offer,
  onView,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { archiveOffer, restoreOffer, deleteOffer } = useStageOfferMutation();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const canArchive = useMemo(() => ARCHIVABLE_STATUSES.includes(offer.status), [offer.status]);
  const canRestore = offer.status === 'Archived';

  const handleArchive = useCallback(async () => {
    await archiveOffer(offer);
  }, [archiveOffer, offer]);

  const handleRestore = useCallback(async () => {
    await restoreOffer(offer);
  }, [offer, restoreOffer]);

  const handleDelete = useCallback(async () => {
    await deleteOffer(offer);
  }, [deleteOffer, offer]);

  const handleView = useCallback(() => {
    if (onView) {
      onView(offer);
      return;
    }
    navigate(adminCrudRoutes.internshipOfferView(offer.id));
  }, [navigate, offer, onView]);

  return (
    <>
      <AdminDeleteConfirmModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title={t('admin.modules.offers.actions.delete.title')}
        description={t('admin.modules.offers.actions.delete.description')}
        confirmLabel={t('admin.modules.offers.actions.delete.confirm')}
      />
      <AdminRowActionsMenu
        ariaLabel={t('admin.modules.offers.actions.menuAria', { title: offer.title })}
        onView={handleView}
        onEdit={() => navigate(adminCrudRoutes.internshipOfferEdit(offer.id))}
        onArchive={canArchive ? handleArchive : undefined}
        onRestore={canRestore ? handleRestore : undefined}
        onDelete={() => setDeleteOpen(true)}
      />
    </>
  );
};

export default InternshipOfferActions;
