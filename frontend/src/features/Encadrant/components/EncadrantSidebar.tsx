import { FunctionComponent, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import escaLogoLight from '../../auth/assets/images/common/Logo_ESCA.png';
import escaLogoDark from '../../auth/assets/images/common/logo-esca.png';
import { useAuth } from '../../auth/hooks/useAuth';
import { useAdminTheme } from '../../admin/dashboard/context/AdminThemeContext';
import AdminUserIdentity from '../../admin/dashboard/components/AdminUserIdentity';
import AdminLogoutButton from '../../admin/dashboard/components/AdminLogoutButton';
import { ENCADRANT_NAV_ITEMS } from '../constants/navigation';
import { ENCADRANT_CHAT_PATH } from '../constants/routes';
import { isEncadrantNavActive } from '../utils/encadrantPageTitle';
import { ENCADRANT_PORTAL_CHAT_SCOPE, resolveChatNavUnread } from '../../shared/contextual-chat/config/chatNavModuleMap';
import { useChatUnread } from '../../shared/contextual-chat/context/ChatUnreadContext';
import NavChatUnreadBadge from '../../shared/contextual-chat/components/NavChatUnreadBadge';

interface EncadrantSidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const EncadrantSidebarFooter: FunctionComponent<{ onLogout?: () => void }> = ({ onLogout }) => {
  const { user } = useAuth();
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="admin-sidebar-footer box-border flex w-full shrink-0 flex-col gap-2 border-t border-[var(--admin-border)] px-3 pb-3 pt-3"
    >
      <AdminUserIdentity user={user} avatarSize="sm" variant="stacked" className="w-full" />
      <AdminLogoutButton variant="sidebar" onLoggedOut={onLogout} />
    </motion.div>
  );
};

const EncadrantSidebar: FunctionComponent<EncadrantSidebarProps> = ({
  mobileOpen,
  onMobileClose,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { theme } = useAdminTheme();
  const escaLogo = theme === 'dark' ? escaLogoDark : escaLogoLight;
  const { getScopedUnread } = useChatUnread();
  const encadrantDeskUnread = resolveChatNavUnread(ENCADRANT_PORTAL_CHAT_SCOPE, getScopedUnread);
  const encadrantModuleUnread = getScopedUnread('encadrant');
  const encadrantChatUnread = encadrantDeskUnread + encadrantModuleUnread;

  useEffect(() => {
    onMobileClose();
  }, [pathname, onMobileClose]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  return (
    <>
      <button
        type="button"
        aria-label={t('encadrant.nav.closeMenu')}
        onClick={onMobileClose}
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          mobileOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />
      <aside
        className={`admin-glass-sidebar !border-r-0 border-e border-[var(--admin-border)] fixed inset-y-0 z-50 flex h-screen w-[272px] flex-none flex-col overflow-hidden shadow-admin-lg ltr:left-0 rtl:right-0 lg:relative lg:z-auto lg:translate-x-0 lg:shadow-none ${
          mobileOpen
            ? 'translate-x-0'
            : 'max-lg:ltr:-translate-x-full max-lg:rtl:translate-x-full'
        }`}
      >
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="box-border flex h-14 flex-none items-center gap-3 border-b border-[var(--admin-border)] px-4 sm:h-[68px]"
        >
          <img
            src={escaLogo}
            alt={t('admin.brand.logoAlt')}
            className="h-9 w-auto shrink-0 object-contain sm:h-10"
          />
          <div className="flex min-w-0 flex-col">
            <span className="text-sm font-semibold leading-tight tracking-tight text-[var(--admin-text)]">
              {t('admin.brand.title')}
            </span>
            <span className="text-xs font-medium leading-tight text-[var(--admin-text-secondary)]">
              {t('encadrant.header.defaultSubtitle')}
            </span>
          </div>
        </motion.div>

        <nav className="admin-scroll flex flex-1 flex-col gap-1 overflow-x-hidden overflow-y-auto px-2 py-3">
          {ENCADRANT_NAV_ITEMS.map((item) => {
            const ItemIcon = item.icon;
            const isActive = isEncadrantNavActive(item.path, pathname);

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  navigate(item.path);
                  onMobileClose();
                }}
                aria-current={isActive ? 'page' : undefined}
                className={`admin-nav-item ${isActive ? 'admin-nav-item-active' : ''}`}
              >
                <ItemIcon
                  className={`relative h-4 w-4 shrink-0 ${
                    isActive ? 'text-[var(--admin-brand)]' : 'text-[var(--admin-text-secondary)]'
                  }`}
                  strokeWidth={1.75}
                />
                <span className="min-w-0 flex-1 truncate leading-5 text-inherit">
                  {t(`encadrant.nav.${item.id}`)}
                </span>
                {item.path === ENCADRANT_CHAT_PATH && encadrantChatUnread > 0 ? (
                  <NavChatUnreadBadge count={encadrantChatUnread} />
                ) : null}
              </button>
            );
          })}
        </nav>

        <EncadrantSidebarFooter onLogout={onMobileClose} />
      </aside>
    </>
  );
};

export default EncadrantSidebar;
