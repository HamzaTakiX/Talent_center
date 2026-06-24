import {
  createContext,
  FunctionComponent,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

export type AdminToastVariant = 'success' | 'error' | 'info' | 'warning';

export interface AdminToastItem {
  id: string;
  message: string;
  variant: AdminToastVariant;
}

interface AdminToastContextValue {
  toasts: AdminToastItem[];
  showToast: (message: string, variant?: AdminToastVariant) => void;
  dismissToast: (id: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
}

const AdminToastContext = createContext<AdminToastContextValue | null>(null);

const TOAST_DURATION_MS = 4200;

export const AdminToastProvider: FunctionComponent<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<AdminToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, variant: AdminToastVariant = 'info') => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setToasts((prev) => [...prev, { id, message, variant }]);
      window.setTimeout(() => dismissToast(id), TOAST_DURATION_MS);
    },
    [dismissToast]
  );

  const success = useCallback((message: string) => showToast(message, 'success'), [showToast]);
  const error = useCallback((message: string) => showToast(message, 'error'), [showToast]);
  const warning = useCallback((message: string) => showToast(message, 'warning'), [showToast]);

  const value = useMemo(
    () => ({ toasts, showToast, dismissToast, success, error, warning }),
    [toasts, showToast, dismissToast, success, error, warning]
  );

  return <AdminToastContext.Provider value={value}>{children}</AdminToastContext.Provider>;
};

export const useAdminToast = (): AdminToastContextValue => {
  const ctx = useContext(AdminToastContext);
  if (ctx == null) {
    throw new Error('useAdminToast must be used within AdminToastProvider');
  }
  return ctx;
};

const noopAdminToast: AdminToastContextValue = {
  toasts: [],
  showToast: () => undefined,
  dismissToast: () => undefined,
  success: () => undefined,
  error: () => undefined,
  warning: () => undefined,
};

/** Safe for student portal pages that reuse admin inbox components without a toast provider. */
export const useOptionalAdminToast = (): AdminToastContextValue => {
  return useContext(AdminToastContext) ?? noopAdminToast;
};
