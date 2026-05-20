import { FunctionComponent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AdminModal from './AdminModal';

interface AdminDeleteConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  description: string;
  confirmLabel?: string;
}

const AdminDeleteConfirmModal: FunctionComponent<AdminDeleteConfirmModalProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
}) => {
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await onConfirm();
      onClose();
    } catch {
      // Erreur déjà signalée (toast) ; garder la modale ouverte pour réessayer.
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title={title}
      maxWidthClass="max-w-md"
      closeAriaLabel={t('common.close')}
      footer={
        <div className="flex w-full flex-wrap justify-end gap-2">
          <button
            type="button"
            className="admin-module-toolbar__btn"
            onClick={onClose}
            disabled={submitting}
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            className="admin-table-btn admin-table-btn--danger min-w-[120px]"
            onClick={() => void handleConfirm()}
            disabled={submitting}
          >
            {submitting ? '…' : (confirmLabel ?? t('admin.common.delete.confirm'))}
          </button>
        </div>
      }
    >
      <p className="text-sm text-[var(--admin-text-secondary)]">{description}</p>
    </AdminModal>
  );
};

export default AdminDeleteConfirmModal;
