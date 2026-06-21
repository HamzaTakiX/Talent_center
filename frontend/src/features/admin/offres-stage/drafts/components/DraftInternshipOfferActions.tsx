import { FunctionComponent, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Send } from 'lucide-react';
import { adminCrudRoutes } from '../../../shared/navigation/adminCrudRoutes';
import { stageApi } from '../../../../shared/api/stageApi';
import { useAdminToast } from '../../../dashboard/context/AdminToastContext';
import AdminDeleteConfirmModal from '../../../ui/AdminDeleteConfirmModal';
import AdminRowActions from '../../../ui/AdminRowActions';
import {
  adminTableBtnMobileSuccess,
  adminTableBtnSuccess,
} from '../../../ui/adminTableButtons';
import { InternshipOffer } from '../../types';
import { parseStageActionError } from '../../utils/parseStageActionError';
import InternshipOfferDetailModal from '../../components/InternshipOfferDetailModal';
import DraftOfferPublishModal from './DraftOfferPublishModal';

interface DraftInternshipOfferActionsProps {
  offer: InternshipOffer;
  variant?: 'mobile' | 'desktop';
  onView?: (offer: InternshipOffer) => void;
  onRefresh?: () => void | Promise<void>;
}

const DraftInternshipOfferActions: FunctionComponent<DraftInternshipOfferActionsProps> = ({
  offer,
  variant = 'desktop',
  onView,
  onRefresh,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const toast = useAdminToast();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);

  const btnPublish = variant === 'mobile' ? adminTableBtnMobileSuccess : adminTableBtnSuccess;

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
      <div
        className={
          variant === 'mobile'
            ? 'flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end'
            : 'flex flex-wrap items-center justify-end gap-2'
        }
      >
        <AdminRowActions
          variant={variant}
          onView={() => (onView ? onView(offer) : setViewOpen(true))}
          onEdit={() => navigate(adminCrudRoutes.internshipOfferEdit(offer.id))}
          onDelete={() => setDeleteOpen(true)}
        />
        <button
          type="button"
          className={btnPublish}
          onClick={() => setPublishOpen(true)}
        >
          <Send className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
          <span>{t('admin.modules.offers.draftsPage.publish.action')}</span>
        </button>
      </div>
    </>
  );
};

export default DraftInternshipOfferActions;
