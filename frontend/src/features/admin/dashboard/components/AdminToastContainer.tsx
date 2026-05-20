import { FunctionComponent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AdminToastItem, useAdminToast } from '../context/AdminToastContext';

const variantConfig: Record<
  AdminToastItem['variant'],
  { icon: typeof CheckCircle2; className: string; titleKey: string }
> = {
  success: {
    icon: CheckCircle2,
    className: 'admin-toast--success',
    titleKey: 'admin.toast.successTitle',
  },
  error: {
    icon: AlertCircle,
    className: 'admin-toast--error',
    titleKey: 'admin.toast.errorTitle',
  },
  info: {
    icon: Info,
    className: 'admin-toast--info',
    titleKey: 'admin.toast.infoTitle',
  },
  warning: {
    icon: AlertTriangle,
    className: 'admin-toast--warning',
    titleKey: 'admin.toast.warningTitle',
  },
};

const AdminToastContainer: FunctionComponent = () => {
  const { t } = useTranslation();
  const { toasts, dismissToast } = useAdminToast();

  return (
    <div
      className="admin-toast-stack pointer-events-none fixed end-3 top-[4.5rem] z-[var(--admin-z-toast)] flex w-[min(100vw-1.5rem,400px)] flex-col gap-2.5 sm:end-5"
      aria-live="polite"
      aria-relevant="additions"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const { icon: Icon, className, titleKey } = variantConfig[toast.variant];
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, x: 28, scale: 0.94 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 28, scale: 0.94 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              className={`admin-toast pointer-events-auto ${className}`}
              role={toast.variant === 'error' ? 'alert' : 'status'}
            >
              <span className="admin-toast__icon-wrap" aria-hidden>
                <Icon className="admin-toast__icon" strokeWidth={2.25} />
              </span>
              <div className="admin-toast__body min-w-0 flex-1">
                <p className="admin-toast__title">{t(titleKey)}</p>
                <p className="admin-toast__message">{toast.message}</p>
              </div>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                className="admin-toast-close shrink-0 rounded-lg p-1.5 transition-colors"
                aria-label={t('common.close')}
              >
                <X className="h-4 w-4" strokeWidth={2} aria-hidden />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default AdminToastContainer;
