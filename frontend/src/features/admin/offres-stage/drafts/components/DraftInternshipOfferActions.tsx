import { FunctionComponent, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Send } from 'lucide-react';
import { adminCrudRoutes } from '../../../shared/navigation/adminCrudRoutes';
import { useAdminToast } from '../../../dashboard/context/AdminToastContext';
import AdminDeleteConfirmModal from '../../../ui/AdminDeleteConfirmModal';
import AdminRowActionsMenu from '../../../ui/AdminRowActionsMenu';
import { adminTableBtnSuccess } from '../../../ui/adminTableButtons';
import { InternshipOffer } from '../../types';
import { useStageOfferMutation } from '../../hooks/useStageOfferMutation';
import DraftOfferPublishModal from './DraftOfferPublishModal';

interface DraftInternshipOfferActionsProps {
  offer: InternshipOffer;
  onView?: (offer: InternshipOffer) => void;
  onRefresh?: () => void | Promise<void>;
}

const DraftInternshipOfferActions: FunctionComponent<DraftInternshipOfferActionsProps> = ({
  offer,
  onView,
  onRefresh,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const toast = useAdminToast();
  const { deleteOffer } = useStageOfferMutation();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);

  const notifyError = useCallback(
    (message: string) => {
      const resolved = message.startsWith('admin.') ? t(message) : message;
      toast.showToast(resolved, 'error');
    },
    [t, toast],
  );

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
      <DraftOfferPublishModal
        open={publishOpen}
        offerId={offer.id}
        offerTitle={offer.title}
        onClose={() => setPublishOpen(false)}
        onPublished={async () => {
          await onRefresh?.();
        }}
        onCompleteOffer={(id) => navigate(adminCrudRoutes.internshipOfferEdit(id))}
        onError={notifyError}
        onSuccess={(message) => toast.showToast(message, 'success')}
      />
      <div className="admin-offers-table__actions-row flex items-center justify-end gap-1.5">
        <button
          type="button"
          className={`${adminTableBtnSuccess} shrink-0`}
          onClick={() => setPublishOpen(true)}
        >
          <Send className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
          <span>{t('admin.modules.offers.draftsPage.publish.action')}</span>
        </button>
        <AdminRowActionsMenu
          ariaLabel={t('admin.modules.offers.actions.menuAria', { title: offer.title })}
          onView={handleView}
          onEdit={() => navigate(adminCrudRoutes.internshipOfferEdit(offer.id))}
          onDelete={() => setDeleteOpen(true)}
        />
      </div>
    </>
  );
};

export default DraftInternshipOfferActions;
