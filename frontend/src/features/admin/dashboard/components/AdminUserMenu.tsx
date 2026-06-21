import { FunctionComponent, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, LogOut, Settings, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../auth/hooks/useAuth';
import AdminUserAvatar from './AdminUserAvatar';
import AdminUserIdentity from './AdminUserIdentity';

interface AdminUserMenuProps {
  /** Base path for profile/settings (default: admin). */
  profileBasePath?: string;
}

const AdminUserMenu: FunctionComponent<AdminUserMenuProps> = ({
  profileBasePath = '/admin/profile',
}) => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const close = () => setOpen(false);

  const goToAccountSection = (section: 'profile' | 'settings') => {
    close();
    navigate(`${profileBasePath}#${section}`);
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    close();
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed', error);
      setIsLoggingOut(false);
    }
  };

  return (
    <div ref={rootRef} className="relative ms-1 border-s border-[var(--admin-border)] ps-2 sm:ps-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={t('admin.userMenu.aria')}
        className={`inline-flex rounded-full p-0.5 transition-colors hover:bg-[var(--admin-brand-muted)] ${
          open ? 'bg-[var(--admin-brand-muted)] ring-2 ring-[var(--admin-brand-muted)]' : ''
        }`}
      >
        <AdminUserAvatar user={user} size="sm" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            aria-label={t('admin.userMenu.aria')}
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="admin-user-dropdown absolute end-0 top-[calc(100%+10px)] z-50 w-[min(100vw-24px,260px)] overflow-hidden rounded-2xl border border-[var(--admin-border)] shadow-admin-lg"
          >
            <div className="admin-user-dropdown-header border-b border-[var(--admin-border)] px-3.5 py-2.5">
              <AdminUserIdentity user={user} avatarSize="md" variant="stacked" />
            </div>

            <div className="p-1.5" role="none">
              <button
                type="button"
                role="menuitem"
                onClick={() => goToAccountSection('profile')}
                className="admin-user-menu-item flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start text-sm text-[var(--admin-text)] transition-colors"
              >
                <User className="h-4 w-4 shrink-0 text-[var(--admin-brand)]" strokeWidth={1.75} />
                {t('admin.userMenu.profile')}
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => goToAccountSection('settings')}
                className="admin-user-menu-item flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start text-sm text-[var(--admin-text)] transition-colors"
              >
                <Settings className="h-4 w-4 shrink-0 text-[var(--admin-brand)]" strokeWidth={1.75} />
                {t('admin.userMenu.settings')}
              </button>
              <div className="my-1 h-px bg-[var(--admin-border)]" role="separator" />
              <button
                type="button"
                role="menuitem"
                disabled={isLoggingOut}
                onClick={handleLogout}
                className="admin-user-menu-item admin-user-menu-item--danger flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoggingOut ? (
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin" strokeWidth={2} />
                ) : (
                  <LogOut className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                )}
                {isLoggingOut ? t('admin.userMenu.loggingOut') : t('admin.userMenu.logout')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminUserMenu;
