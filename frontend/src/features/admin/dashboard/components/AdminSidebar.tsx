import { FunctionComponent, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronDown, MessageSquare, Clock, Archive, FileText, FilePenLine, CalendarDays, Brain, Upload, Settings2, BookOpen, LucideIcon } from 'lucide-react';
import escaLogoLight from '../../../auth/assets/images/common/Logo_ESCA.png';
import escaLogoDark from '../../../auth/assets/images/common/logo-esca.png';
import { useAuth } from '../../../auth/hooks/useAuth';
import { useAdminTheme } from '../context/AdminThemeContext';
import AdminUserIdentity from './AdminUserIdentity';
import AdminLogoutButton from './AdminLogoutButton';
import {
  ADMIN_NAV_ITEMS,
  getActiveSectionFromPath,
  getChildPath,
  getSectionPath,
  isChildNavActive,
  sectionToExpandForPath,
  type AdminNavChildId,
  type AdminNavSectionId,
} from '../config/adminNavConfig';
import { ADMIN_NAV_CHAT_MODULES } from '../../../shared/contextual-chat/config/chatNavModuleMap';
import { useChatUnread } from '../../../shared/contextual-chat/context/ChatUnreadContext';
import NavChatUnreadBadge from '../../../shared/contextual-chat/components/NavChatUnreadBadge';

const subIconMap: Record<AdminNavChildId, LucideIcon> = {
  catalog: BookOpen,
  chat: MessageSquare,
  drafts: FilePenLine,
  history: Clock,
  archived: Archive,
  reports: FileText,
  meetings: CalendarDays,
  smartAssignment: Brain,
  imports: Upload,
  config: Settings2,
};

interface SidebarMenuButtonProps {
  active: boolean;
  icon: LucideIcon;
  label: string;
  expandable?: boolean;
  expanded?: boolean;
  onClick: () => void;
}

const SidebarMenuButton: FunctionComponent<SidebarMenuButtonProps> = ({
  active,
  icon: IconComponent,
  label,
  expandable,
  expanded,
  onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`admin-nav-item ${active ? 'admin-nav-item-active' : ''}`}
  >
    <IconComponent
      className={`relative h-4 w-4 shrink-0 ${active ? 'text-[var(--admin-brand)]' : 'text-[var(--admin-text-secondary)]'}`}
      strokeWidth={1.75}
    />
    <div className="flex min-w-0 flex-1 items-center">
      <span className="relative truncate leading-5 text-inherit">{label}</span>
    </div>
    {expandable && (
      <ChevronDown
        className={`relative h-4 w-4 shrink-0 text-[var(--admin-text-muted)] transition-transform ${expanded ? 'rotate-180' : ''}`}
        strokeWidth={1.5}
      />
    )}
  </button>
);

interface SidebarSubButtonProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
  childId: AdminNavChildId;
  unreadCount?: number;
}

const SidebarSubButton: FunctionComponent<SidebarSubButtonProps> = ({
  label,
  active,
  onClick,
  childId,
  unreadCount = 0,
}) => {
  const SubIcon = subIconMap[childId] ?? MessageSquare;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`admin-nav-item ml-1 pl-3 text-[13px] ${active ? 'admin-nav-item-active' : ''}`}
    >
      <SubIcon
        className={`relative h-3.5 w-3.5 shrink-0 ${active ? 'text-[var(--admin-brand)]' : 'text-[var(--admin-text-muted)]'}`}
        strokeWidth={1.75}
      />
      <span className="min-w-0 flex-1 truncate leading-5 text-inherit">{label}</span>
      {childId === 'chat' && unreadCount > 0 ? <NavChatUnreadBadge count={unreadCount} /> : null}
    </button>
  );
};

interface AdminSidebarFooterProps {
  onLogout?: () => void;
}

const AdminSidebarFooter: FunctionComponent<AdminSidebarFooterProps> = ({ onLogout }) => {
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

interface AdminSidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const AdminSidebar: FunctionComponent<AdminSidebarProps> = ({ mobileOpen, onMobileClose }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useAdminTheme();
  const pathname = location.pathname;
  const escaLogo = theme === 'dark' ? escaLogoDark : escaLogoLight;
  const { getModuleUnread } = useChatUnread();

  const [manuallyExpanded, setManuallyExpanded] = useState<AdminNavSectionId[]>([]);
  const [manuallyCollapsed, setManuallyCollapsed] = useState<AdminNavSectionId[]>([]);
  const [primaryNavOverride, setPrimaryNavOverride] = useState<AdminNavSectionId | null>(null);

  const activeSection = primaryNavOverride ?? getActiveSectionFromPath(pathname);
  const routeExpandedSection = sectionToExpandForPath(pathname);

  useEffect(() => {
    setPrimaryNavOverride(null);
  }, [pathname]);

  useEffect(() => {
    if (routeExpandedSection) {
      setManuallyCollapsed((prev) => prev.filter((id) => id !== routeExpandedSection));
    }
  }, [routeExpandedSection]);

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

  const isSectionExpanded = (id: AdminNavSectionId) => {
    const keptOpenByRoute = routeExpandedSection === id && !manuallyCollapsed.includes(id);
    const openedByUser = manuallyExpanded.includes(id);
    return keptOpenByRoute || openedByUser;
  };

  const toggleSectionExpand = (id: AdminNavSectionId) => {
    if (routeExpandedSection === id) {
      setManuallyCollapsed((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      );
    } else {
      setManuallyExpanded((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      );
    }
  };

  const navLabel = (id: AdminNavSectionId | AdminNavChildId) => t(`admin.nav.${id}`);

  return (
    <>
      <button
        type="button"
        aria-label={t('admin.nav.closeMenu')}
        onClick={onMobileClose}
        className={`fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          mobileOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />
      <aside
        className={`admin-glass-sidebar fixed inset-y-0 left-0 z-50 flex h-screen w-[272px] flex-none flex-col overflow-hidden shadow-admin-lg transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] lg:relative lg:z-auto lg:translate-x-0 lg:shadow-none ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="box-border flex h-14 flex-none items-center gap-3 border-b border-[var(--admin-border)] px-4 sm:h-[68px]">
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
              {t('admin.brand.subtitle')}
            </span>
          </div>
        </div>

        <nav className="admin-scroll flex flex-1 flex-col gap-1 overflow-x-hidden overflow-y-auto px-2 py-3">
          {ADMIN_NAV_ITEMS.map((item) => {
            const ItemIconComponent = item.icon;
            const isActive = activeSection === item.id;
            const isExpanded = isSectionExpanded(item.id);
            const sectionPath = getSectionPath(item.id);

            return (
              <div key={item.id} className="w-full min-w-0">
                <SidebarMenuButton
                  active={isActive}
                  icon={ItemIconComponent}
                  label={navLabel(item.id)}
                  expandable={item.expandable}
                  expanded={isExpanded}
                  onClick={() => {
                    if (sectionPath) navigate(sectionPath);
                    else if (!item.expandable) setPrimaryNavOverride(item.id);
                    if (item.expandable) toggleSectionExpand(item.id);
                  }}
                />

                {item.expandable && isExpanded && (
                  <motion.div className="ml-3 mt-1 flex min-w-0 flex-col gap-0.5 border-l border-[var(--admin-border)] pl-3">
                    {item.children?.map((child) => {
                      const subPath = getChildPath(item.id, child);
                      const isSubActive = isChildNavActive(item.id, child, pathname);
                      const chatModule = child === 'chat' ? ADMIN_NAV_CHAT_MODULES[item.id] : undefined;
                      const unreadCount = chatModule ? getModuleUnread(chatModule) : 0;
                      return (
                        <SidebarSubButton
                          key={child}
                          childId={child}
                          label={navLabel(child)}
                          active={isSubActive}
                          unreadCount={unreadCount}
                          onClick={subPath !== undefined ? () => navigate(subPath) : undefined}
                        />
                      );
                    })}
                  </motion.div>
                )}
              </div>
            );
          })}
        </nav>

        <AdminSidebarFooter onLogout={onMobileClose} />
      </aside>
    </>
  );
};

export default AdminSidebar;
