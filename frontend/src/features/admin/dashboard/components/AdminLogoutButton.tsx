import { FunctionComponent, useState } from 'react';
import { motion } from 'framer-motion';
import { LogOut, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../auth/hooks/useAuth';

interface AdminLogoutButtonProps {
  variant?: 'default' | 'sidebar';
  onLoggedOut?: () => void;
}

const AdminLogoutButton: FunctionComponent<AdminLogoutButtonProps> = ({
  variant = 'default',
  onLoggedOut,
}) => {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const logoutLabel = isLoggingOut ? t('admin.userMenu.loggingOut') : t('admin.userMenu.logout');

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      onLoggedOut?.();
      await logout();
    } catch (error) {
      console.error('Logout failed', error);
      setIsLoggingOut(false);
    }
  };

  if (variant === 'sidebar') {
    return (
      <motion.button
        type="button"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        disabled={isLoggingOut}
        onClick={handleLogout}
        className="admin-btn-filled flex h-9 w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:text-red-400"
      >
        {isLoggingOut ? (
          <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
        ) : (
          <LogOut className="h-4 w-4 shrink-0" strokeWidth={2} />
        )}
        <span>{logoutLabel}</span>
      </motion.button>
    );
  }

  return (
    <motion.div className="flex justify-center">
      <motion.button
        type="button"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        disabled={isLoggingOut}
        onClick={handleLogout}
        className="flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 font-semibold text-white shadow-admin-md transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoggingOut ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <LogOut className="h-5 w-5" />
        )}
        <span>{logoutLabel}</span>
      </motion.button>
    </motion.div>
  );
};

export default AdminLogoutButton;
