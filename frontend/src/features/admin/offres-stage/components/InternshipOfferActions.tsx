import { FunctionComponent, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { adminCrudRoutes } from '../../shared/navigation/adminCrudRoutes';
import { stageApi } from '../../../shared/api/stageApi';
import { useAdminToast } from '../../dashboard/context/AdminToastContext';
import AdminDeleteConfirmModal from '../../ui/AdminDeleteConfirmModal';
import AdminRowActions from '../../ui/AdminRowActions';
import { InternshipOffer } from '../types';
import { parseStageActionError } from '../utils/parseStageActionError';
import InternshipOfferDetailModal from './InternshipOfferDetailModal';

interface InternshipOfferActionsProps {
  offer: InternshipOffer;
  variant?: 'mobile' | 'desktop';
  onView?: (offer: InternshipOffer) => void;
  onRefresh?: () => void | Promise<void>;
}

const InternshipOfferActions: FunctionComponent<InternshipOfferActionsProps> = ({
  offer,
  variant = 'desktop',
  onView,
  onRefresh,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const toast = useAdminToast();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);

  const notifyError = useCallback(
    (message: string) => {
      const resolved = message.startsWith('admin.') ? t(message) : message;
      toast.showToast(resolved, 'error');
    },
    [t, toast],
  );

  const handleDelete = useCallback(async () => {
    try {
      await stageApi.action(offer.id, 'delete');
      toast.showToast(t('admin.modules.offers.actions.delete.success'), 'success');
      await onRefresh?.();
    } catch (err) {
      notifyError(parseStageActionError(err, 'admin.modules.offers.actions.delete.errors.failed'));
      throw err;
    }
  }, [offer.id, notifyError, onRefresh, t, toast]);

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
      <InternshipOfferDetailModal
        open={viewOpen}
        offer={viewOpen ? offer : null}
        onClose={() => setViewOpen(false)}
        onEdit={(id) => {
          setViewOpen(false);
          navigate(adminCrudRoutes.internshipOfferEdit(id));
        }}
      />
      <AdminRowActions
        variant={variant}
        onView={() => (onView ? onView(offer) : setViewOpen(true))}
        onEdit={() => navigate(adminCrudRoutes.internshipOfferEdit(offer.id))}
        onDelete={() => setDeleteOpen(true)}
      />
    </>
  );
};

export default InternshipOfferActions;
