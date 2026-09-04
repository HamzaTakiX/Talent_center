import { FunctionComponent, ReactNode } from 'react';
import { Eye, Loader2, MessageSquare, Pencil } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AdminModal from './AdminModal';
import AdminDetailGrid, { type AdminDetailSection } from './AdminDetailGrid';
import {
  adminFormBtnPrimaryClass,
  adminFormBtnSecondaryClass,
} from '../shared/forms/adminFormClasses';

export interface AdminEntityDetailModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  sections: AdminDetailSection[];
  onEdit?: () => void;
  /** Opens platform desk chat — rendered as a standard footer secondary button. */
  onSendMessage?: () => void;
  sendMessageLoading?: boolean;
  sendMessageLabel?: string;
  maxWidthClass?: string;
  headerContent?: ReactNode;
  showReadOnlyBanner?: boolean;
  /** Optional icon shown in the modal header bar (uses AdminModal branded header). */
  headerIcon?: LucideIcon;
  /** Optional extra control(s) in the footer, before the edit action. */
  footerExtra?: ReactNode;
  /** Extra content after the read-only fields (credentials, etc.). */
  afterSections?: ReactNode;
}

const AdminEntityDetailModal: FunctionComponent<AdminEntityDetailModalProps> = ({
  open,
  onClose,
  title,
  description,
  sections,
  onEdit,
  onSendMessage,
  sendMessageLoading = false,
  sendMessageLabel,
  maxWidthClass = 'max-w-[720px]',
  headerContent,
  showReadOnlyBanner = true,
  headerIcon,
  footerExtra,
  afterSections,
}) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';

  const footer = onEdit || footerExtra || onSendMessage ? (
    <>
      <button type="button" className={adminFormBtnSecondaryClass} onClick={onClose}>
        {t('admin.common.detailModal.close')}
      </button>
      {onSendMessage ? (
        <button
          type="button"
          className={adminFormBtnSecondaryClass}
          onClick={onSendMessage}
          disabled={sendMessageLoading}
        >
          {sendMessageLoading ? (
            <Loader2 className="h-4 w-4 shrink-0 animate-spin" strokeWidth={1.75} aria-hidden />
          ) : (
            <MessageSquare className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
          )}
          {sendMessageLoading
            ? t('admin.common.detailModal.student.openingChat')
            : sendMessageLabel ?? t('admin.common.detailModal.student.sendMessage')}
        </button>
      ) : null}
      {footerExtra}
      {onEdit ? (
        <button
          type="button"
          className={adminFormBtnPrimaryClass}
          onClick={() => onEdit()}
        >
          <Pencil className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
          {t('admin.common.actions.edit')}
        </button>
      ) : null}
    </>
  ) : undefined;

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      footer={footer}
      maxWidthClass={maxWidthClass}
      dir={isRtl ? 'rtl' : 'ltr'}
      closeAriaLabel={t('admin.common.detailModal.close')}
      headerIcon={headerIcon}
    >
      {headerContent}
      {showReadOnlyBanner ? (
        <div className="admin-detail-modal-banner">
          <span className="admin-detail-modal-banner__icon-wrap" aria-hidden>
            <Eye className="admin-detail-modal-banner__icon" strokeWidth={1.75} />
          </span>
          <p className="admin-detail-modal-hint">{t('admin.common.detailModal.readOnlyHint')}</p>
        </div>
      ) : null}
      <AdminDetailGrid sections={sections} />
      {afterSections}
    </AdminModal>
  );
};

export default AdminEntityDetailModal;
