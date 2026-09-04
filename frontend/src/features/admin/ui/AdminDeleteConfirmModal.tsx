import { FunctionComponent, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Loader2, Trash2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { easePremium } from '../dashboard/ui/animations';
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
      // Error already toasted; keep modal open for retry.
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (submitting) return;
    onClose();
  };

  return (
    <AdminModal
      open={open}
      onClose={handleClose}
      title={title}
      maxWidthClass="max-w-[440px]"
      closeAriaLabel={t('common.close')}
      headerIcon={Trash2}
      headerIconColor="#ef4444"
      headerIconBg="color-mix(in srgb, #ef4444 14%, var(--admin-bg-elevated))"
      modalClassName="admin-delete-modal"
      bodyClassName="admin-delete-modal__body"
      footer={
        <div className="admin-delete-modal__footer">
          <button
            type="button"
            className="admin-module-toolbar__btn"
            onClick={handleClose}
            disabled={submitting}
          >
            <X className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
            <span>{t('common.cancel')}</span>
          </button>
          <button
            type="button"
            className="admin-module-toolbar__btn admin-module-toolbar__btn--danger"
            onClick={() => void handleConfirm()}
            disabled={submitting}
            aria-busy={submitting}
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
            ) : (
              <Trash2 className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
            )}
            <span>
              {submitting
                ? t('admin.common.delete.deleting')
                : (confirmLabel ?? t('admin.common.delete.confirm'))}
            </span>
          </button>
        </div>
      }
    >
      <div className="admin-delete-modal__content">
        <motion.div
          className="admin-delete-modal__visual"
          initial={{ opacity: 0, scale: 0.72 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, ease: easePremium, delay: 0.05 }}
          aria-hidden
        >
          <span className="admin-delete-modal__ring admin-delete-modal__ring--outer" />
          <span className="admin-delete-modal__ring admin-delete-modal__ring--inner" />
          <motion.span
            className="admin-delete-modal__icon-wrap"
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <AlertTriangle className="admin-delete-modal__icon" strokeWidth={1.75} />
          </motion.span>
        </motion.div>

        <motion.p
          className="admin-delete-modal__description"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: easePremium, delay: 0.12 }}
        >
          {description}
        </motion.p>

        <motion.div
          className="admin-delete-modal__warning"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, ease: easePremium, delay: 0.18 }}
          role="note"
        >
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
          <span>
            {t('admin.common.delete.irreversible', {
              defaultValue: 'This action cannot be undone.',
            })}
          </span>
        </motion.div>
      </div>
    </AdminModal>
  );
};

export default AdminDeleteConfirmModal;
