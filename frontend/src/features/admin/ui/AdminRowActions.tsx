import { FunctionComponent } from 'react';
import { CheckCircle, Download, Eye, Pencil, Trash2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  adminTableBtn,
  adminTableBtnDelete,
  adminTableBtnDanger,
  adminTableBtnMobile,
  adminTableBtnMobileDanger,
  adminTableBtnMobilePrimary,
  adminTableBtnMobileSuccess,
  adminTableBtnPrimary,
  adminTableBtnSuccess,
} from './adminTableButtons';

interface AdminRowActionsProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onDownload?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  variant?: 'mobile' | 'desktop';
}

const AdminRowActions: FunctionComponent<AdminRowActionsProps> = ({
  onView,
  onEdit,
  onDelete,
  onDownload,
  onApprove,
  onReject,
  variant = 'desktop',
}) => {
  const { t } = useTranslation();
  const btnClass = variant === 'mobile' ? adminTableBtnMobile : adminTableBtn;
  const btnPrimary = variant === 'mobile' ? adminTableBtnMobilePrimary : adminTableBtnPrimary;
  const btnSuccess = variant === 'mobile' ? adminTableBtnMobileSuccess : adminTableBtnSuccess;
  const btnDanger = variant === 'mobile' ? adminTableBtnMobileDanger : adminTableBtnDanger;

  return (
    <div
      className={
        variant === 'mobile'
          ? 'flex flex-wrap gap-2'
          : 'flex flex-wrap items-center justify-end gap-2'
      }
    >
      {onView != null && (
        <button type="button" className={btnClass} onClick={onView}>
          <Eye className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
          <span>{t('admin.common.actions.view')}</span>
        </button>
      )}
      {onEdit != null && (
        <button type="button" className={btnClass} onClick={onEdit}>
          <Pencil className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
          <span>{t('admin.common.actions.edit')}</span>
        </button>
      )}
      {onDownload != null && (
        <button
          type="button"
          className={onApprove == null && onReject == null ? btnPrimary : btnClass}
          onClick={onDownload}
        >
          <Download className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
          <span>{t('admin.common.actions.download')}</span>
        </button>
      )}
      {onApprove != null && (
        <button type="button" className={btnSuccess} onClick={onApprove}>
          <CheckCircle className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
          <span>{t('admin.common.actions.approve')}</span>
        </button>
      )}
      {onReject != null && (
        <button type="button" className={btnDanger} onClick={onReject}>
          <X className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
          <span>{t('admin.common.actions.reject')}</span>
        </button>
      )}
      {onDelete != null && (
        <button type="button" className={adminTableBtnDelete} onClick={onDelete}>
          <Trash2 className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
          <span>{t('admin.common.actions.delete')}</span>
        </button>
      )}
    </div>
  );
};

export default AdminRowActions;
