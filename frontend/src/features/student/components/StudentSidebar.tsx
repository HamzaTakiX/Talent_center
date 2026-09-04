import { FunctionComponent, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ChevronDown,
  Compass,
  MessageSquare,
  Clock,
  Heart,
  FileText,
  CalendarDays,
  CheckSquare,
  Users,
  Video,
  FilePenLine,
  PenLine,
  LucideIcon,
} from 'lucide-react';
import escaLogoLight from '../../auth/assets/images/common/Logo_ESCA.png';
import escaLogoDark from '../../auth/assets/images/common/logo-esca.png';
import { useAuth } from '../../auth/hooks/useAuth';
import { useAdminTheme } from '../../admin/dashboard/context/AdminThemeContext';
import AdminUserIdentity from '../../admin/dashboard/components/AdminUserIdentity';
import AdminLogoutButton from '../../admin/dashboard/components/AdminLogoutButton';
import {
  STUDENT_NAV_ITEMS,
  getActiveSectionFromPath,
  getChildPath,
  getSectionPath,
  isChildNavActive,
  sectionToExpandForPath,
  type StudentNavChildId,
  type StudentNavSectionId,
} from '../config/studentNavConfig';
import { STUDENT_NAV_CHAT_SCOPES, resolveChatNavUnread } from '../../shared/contextual-chat/config/chatNavModuleMap';
import { useChatUnread } from '../../shared/contextual-chat/context/ChatUnreadContext';
import NavChatUnreadBadge from '../../shared/contextual-chat/components/NavChatUnreadBadge';

const subIconMap: Record<StudentNavChildId, LucideIcon> = {
  cvBuilder: PenLine,
  cvAnalysis: FileText,
  aiCareerCoach: Compass,
  interviewSimulator: Users,
  chat: MessageSquare,
  history: Clock,
  favorites: Heart,
  agenda: CalendarDays,
  task: CheckSquare,
  workspace: Users,
  meetings: Video,
  report: FilePenLine,
};

interface SidebarMenuButtonProps {
  active: boolean;
  icon: LucideIcon;
  label: string;
  expandable?: boolean;
  expanded?: boolean;
  unreadCount?: number;
  onClick: () => void;
}

const SidebarMenuButton: FunctionComponent<SidebarMenuButtonProps> = ({
  active,
  icon: IconComponent,
  label,
  expandable,
  expanded,
  unreadCount = 0,
  onClick,
}) => (
  <button type="button" onClick={onClick} className={`admin-nav-item ${active ? 'admin-nav-item-active' : ''}`}>
    <IconComponent
      className={`relative h-4 w-4 shrink-0 ${active ? 'text-[var(--admin-brand)]' : 'text-[var(--admin-text-secondary)]'}`}
      strokeWidth={1.75}
    />
    <motion.div layout className="flex min-w-0 flex-1 items-center">
      <span className="relative truncate leading-5 text-inherit">{label}</span>
    </motion.div>
    {!expandable && unreadCount > 0 ? <NavChatUnreadBadge count={unreadCount} /> : null}
    {expandable && !expanded && unreadCount > 0 ? <NavChatUnreadBadge count={unreadCount} /> : null}
    {expandable && (
      <ChevronDown
        className={`relative h-4 w-4 shrink-0 text-[var(--admin-text-muted)] transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
        strokeWidth={1.5}
      />
    )}
  </button>
);

interface SidebarSubButtonProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
  childId: StudentNavChildId;
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

interface StudentSidebarFooterProps {
  onLogout?: () => void;
}

const StudentSidebarFooter: FunctionComponent<StudentSidebarFooterProps> = ({ onLogout }) => {
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

interface StudentSidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const StudentSidebar: FunctionComponent<StudentSidebarProps> = ({ mobileOpen, onMobileClose }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useAdminTheme();
  const pathname = location.pathname;
  const escaLogo = theme === 'dark' ? escaLogoDark : escaLogoLight;
  const { getScopedUnread } = useChatUnread();

  const [manuallyExpanded, setManuallyExpanded] = useState<StudentNavSectionId[]>([]);
  const [manuallyCollapsed, setManuallyCollapsed] = useState<StudentNavSectionId[]>([]);

  const activeSection = getActiveSectionFromPath(pathname);
  const routeExpandedSection = sectionToExpandForPath(pathname);

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

  useEffect(() => {
    if (routeExpandedSection) {
      setManuallyCollapsed((prev) => prev.filter((id) => id !== routeExpandedSection));
    }
  }, [routeExpandedSection]);

  const isSectionExpanded = (id: StudentNavSectionId) => {
    const keptOpenByRoute = routeExpandedSection === id && !manuallyCollapsed.includes(id);
    const openedByUser = manuallyExpanded.includes(id);
    return keptOpenByRoute || openedByUser;
  };

  const toggleSectionExpand = (id: StudentNavSectionId) => {
    if (routeExpandedSection === id) {
      setManuallyCollapsed((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
      );
    } else {
      setManuallyExpanded((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
      );
    }
  };

  const navLabel = (id: StudentNavSectionId | StudentNavChildId) => t(`student.nav.${id}`);

  return (
    <>
      <button
        type="button"
        aria-label={t('student.nav.closeMenu')}
        onClick={onMobileClose}
        className={`fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          mobileOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />
      <aside
        className={`admin-glass-sidebar fixed inset-y-0 left-0 z-50 flex h-screen w-[272px] flex-none flex-col overflow-hidden shadow-admin-lg lg:relative lg:z-auto lg:translate-x-0 lg:shadow-none ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
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
              {t('student.header.defaultSubtitle')}
            </span>
          </div>
        </motion.div>

        <nav className="admin-scroll flex flex-1 flex-col gap-1 overflow-x-hidden overflow-y-auto px-2 py-3">
          {STUDENT_NAV_ITEMS.map((item) => {
            const ItemIcon = item.icon;
            const isActive = activeSection === item.id;
            const isExpanded = item.expandable ? isSectionExpanded(item.id) : false;
            const sectionPath = getSectionPath(item.id);
            const sectionChatScope = STUDENT_NAV_CHAT_SCOPES[item.id];
            const sectionUnread = resolveChatNavUnread(sectionChatScope, getScopedUnread);

            return (
              <motion.div key={item.id} layout="position" className="w-full min-w-0">
                {item.showResourcesLabelBefore && (
                  <p className="mb-1 mt-3 px-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--admin-text-muted)]">
                    {t('student.nav.resources')}
                  </p>
                )}

                <SidebarMenuButton
                  active={isActive || (activeSection === item.id && !item.expandable)}
                  icon={ItemIcon}
                  label={navLabel(item.id)}
                  expandable={item.expandable}
                  expanded={isExpanded}
                  unreadCount={sectionUnread}
                  onClick={() => {
                    if (sectionPath) navigate(sectionPath);
                    if (item.expandable) toggleSectionExpand(item.id);
                    onMobileClose();
                  }}
                />

                {item.expandable && isExpanded && item.children && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="ml-3 mt-1 flex min-w-0 flex-col gap-0.5 border-l border-[var(--admin-border)] pl-3"
                  >
                    {item.children.map((child) => {
                      const subPath = getChildPath(item.id, child);
                      const isSubActive = isChildNavActive(item.id, child, pathname);
                      const chatScope = child === 'chat' ? STUDENT_NAV_CHAT_SCOPES[item.id] : undefined;
                      const unreadCount = resolveChatNavUnread(chatScope, getScopedUnread);
                      return (
                        <SidebarSubButton
                          key={child}
                          childId={child}
                          label={navLabel(child)}
                          active={isSubActive}
                          unreadCount={unreadCount}
                          onClick={
                            subPath
                              ? () => {
                                  navigate(subPath);
                                  onMobileClose();
                                }
                              : undefined
                          }
                        />
                      );
                    })}
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </nav>

        <StudentSidebarFooter onLogout={onMobileClose} />
      </aside>
    </>
  );
};

export default StudentSidebar;
