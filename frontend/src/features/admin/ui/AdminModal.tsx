import { FunctionComponent, ReactNode, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAdminTheme } from '../dashboard/context/AdminThemeContext';
import { easePremium } from '../dashboard/ui/animations';

interface AdminModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidthClass?: string;
  dir?: 'ltr' | 'rtl';
  closeAriaLabel?: string;
}

const AdminModal: FunctionComponent<AdminModalProps> = ({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidthClass = 'max-w-[680px]',
  dir,
  closeAriaLabel = 'Close',
}) => {
  const { theme } = useAdminTheme();
  const { i18n } = useTranslation();
  const resolvedDir = dir ?? (i18n.dir() === 'rtl' ? 'rtl' : 'ltr');

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="admin-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          role="presentation"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-modal-title"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.28, ease: easePremium }}
            className={`admin-modal ${maxWidthClass}`}
            data-admin-theme={theme}
            dir={resolvedDir}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <div className="admin-modal-header__content min-w-0">
                <h3 id="admin-modal-title" className="admin-modal-header__title">
                  {title}
                </h3>
                {description ? (
                  <p className="admin-modal-header__description">{description}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="admin-modal-close"
                aria-label={closeAriaLabel}
              >
                <X className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>
            <div className="admin-modal-body">{children}</div>
            {footer ? <div className="admin-modal-footer">{footer}</div> : null}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AdminModal;
