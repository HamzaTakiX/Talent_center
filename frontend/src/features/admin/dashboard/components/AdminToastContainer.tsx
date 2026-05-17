import { FunctionComponent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AdminToastItem, useAdminToast } from '../context/AdminToastContext';

const variantConfig: Record<
  AdminToastItem['variant'],
  { icon: typeof CheckCircle2; className: string }
> = {
  success: {
    icon: CheckCircle2,
    className: 'admin-toast--success',
  },
  error: {
    icon: AlertCircle,
    className: 'admin-toast--error',
  },
  info: {
    icon: Info,
    className: 'admin-toast--info',
  },
};

const AdminToastContainer: FunctionComponent = () => {
  const { t } = useTranslation();
  const { toasts, dismissToast } = useAdminToast();

  return (
    <div
      className="admin-toast-stack pointer-events-none fixed right-3 top-[4.5rem] z-[200] flex w-[min(100vw-1.5rem,380px)] flex-col gap-2 sm:right-5"
      aria-live="polite"
      aria-relevant="additions"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const { icon: Icon, className } = variantConfig[toast.variant];
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, x: 24, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 24, scale: 0.96 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className={`admin-toast pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-admin-lg ${className}`}
              role="status"
            >
              <Icon className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
              <p className="min-w-0 flex-1 text-sm font-medium leading-snug">{toast.message}</p>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                className="admin-toast-close -mr-1 shrink-0 rounded-lg p-1 transition-colors"
                aria-label={t('common.close')}
              >
                <X className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default AdminToastContainer;
