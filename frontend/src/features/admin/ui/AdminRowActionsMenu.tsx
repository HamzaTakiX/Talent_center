import {
  FunctionComponent,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import { createPortal } from 'react-dom';
import {
  Archive,
  ArchiveRestore,
  CheckCircle,
  Copy,
  Download,
  Eye,
  MoreVertical,
  Pencil,
  Trash2,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAdminTheme } from '../dashboard/context/AdminThemeContext';
import { useAdminDropdownOpenState } from './hooks/useAdminDropdownOpenState';

export type AdminRowActionsMenuItem = {
  key: string;
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  tone?: 'default' | 'danger';
};

interface AdminRowActionsMenuProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onArchive?: () => void;
  onRestore?: () => void;
  onDownload?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  extraItems?: AdminRowActionsMenuItem[];
  /** Accessible label for the trigger button */
  ariaLabel?: string;
}

const MENU_GAP = 4;
const MENU_MIN_WIDTH = 168;

const AdminRowActionsMenu: FunctionComponent<AdminRowActionsMenuProps> = ({
  onView,
  onEdit,
  onDelete,
  onDuplicate,
  onArchive,
  onRestore,
  onDownload,
  onApprove,
  onReject,
  extraItems = [],
  ariaLabel,
}) => {
  const { t, i18n } = useTranslation();
  const { theme } = useAdminTheme();
  const isRtl = i18n.dir() === 'rtl';
  const menuId = useId();
  const { open, setOpen, close } = useAdminDropdownOpenState(menuId);
  const [menuStyle, setMenuStyle] = useState<CSSProperties | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const items: AdminRowActionsMenuItem[] = [
    onView != null
      ? { key: 'view', label: t('admin.common.actions.view'), icon: Eye, onClick: onView }
      : null,
    onEdit != null
      ? { key: 'edit', label: t('admin.common.actions.edit'), icon: Pencil, onClick: onEdit }
      : null,
    ...extraItems,
    onDuplicate != null
      ? {
          key: 'duplicate',
          label: t('admin.announcementsModule.scheduled.actions.duplicate'),
          icon: Copy,
          onClick: onDuplicate,
        }
      : null,
    onDownload != null
      ? {
          key: 'download',
          label: t('admin.common.actions.download'),
          icon: Download,
          onClick: onDownload,
        }
      : null,
    onApprove != null
      ? {
          key: 'approve',
          label: t('admin.common.actions.approve'),
          icon: CheckCircle,
          onClick: onApprove,
        }
      : null,
    onReject != null
      ? {
          key: 'reject',
          label: t('admin.common.actions.reject'),
          icon: X,
          onClick: onReject,
          tone: 'danger',
        }
      : null,
    onArchive != null
      ? {
          key: 'archive',
          label: t('admin.common.actions.archive'),
          icon: Archive,
          onClick: onArchive,
        }
      : null,
    onRestore != null
      ? {
          key: 'restore',
          label: t('admin.common.actions.restore'),
          icon: ArchiveRestore,
          onClick: onRestore,
        }
      : null,
    onDelete != null
      ? {
          key: 'delete',
          label: t('admin.common.actions.delete'),
          icon: Trash2,
          onClick: onDelete,
          tone: 'danger',
        }
      : null,
  ].filter((item): item is AdminRowActionsMenuItem => item != null);

  const updateMenuPosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const menuWidth = Math.max(menuRef.current?.offsetWidth ?? MENU_MIN_WIDTH, MENU_MIN_WIDTH);
    const menuHeight = menuRef.current?.offsetHeight ?? 0;
    const viewportPad = 8;

    let top = rect.bottom + MENU_GAP;
    if (top + menuHeight > window.innerHeight - viewportPad && rect.top - menuHeight - MENU_GAP > viewportPad) {
      top = rect.top - menuHeight - MENU_GAP;
    }

    const rawLeft = isRtl ? rect.left : rect.right - menuWidth;
    const left = Math.min(
      Math.max(viewportPad, rawLeft),
      window.innerWidth - menuWidth - viewportPad,
    );

    setMenuStyle({
      position: 'fixed',
      top,
      left,
      minWidth: `${MENU_MIN_WIDTH}px`,
      visibility: 'visible',
      pointerEvents: 'auto',
      zIndex: 'var(--admin-z-dropdown)',
    });
  }, [isRtl]);

  useLayoutEffect(() => {
    if (!open) {
      setMenuStyle(null);
      return;
    }

    updateMenuPosition();
    const raf = requestAnimationFrame(updateMenuPosition);

    window.addEventListener('resize', updateMenuPosition);
    window.addEventListener('scroll', updateMenuPosition, true);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', updateMenuPosition);
      window.removeEventListener('scroll', updateMenuPosition, true);
    };
  }, [open, items.length, updateMenuPosition]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      close();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, close]);

  if (items.length === 0) return null;

  const menuPortal = open
    ? createPortal(
        <div
          ref={menuRef}
          role="menu"
          data-admin-theme={theme}
          dir={isRtl ? 'rtl' : 'ltr'}
          style={
            menuStyle ?? {
              position: 'fixed',
              top: 0,
              left: 0,
              visibility: 'hidden',
              pointerEvents: 'none',
              minWidth: `${MENU_MIN_WIDTH}px`,
              zIndex: 'var(--admin-z-dropdown)',
            }
          }
          className="admin-chat-dropdown admin-row-actions-menu__panel admin-row-actions-menu__panel--portal overflow-hidden rounded-xl border border-[var(--admin-border)] py-1 shadow-admin-lg"
        >
          {items.map(({ key, label, icon: Icon, onClick, tone = 'default' }) => (
            <button
              key={key}
              type="button"
              role="menuitem"
              className={`admin-chat-menu-item admin-row-actions-menu__item flex w-full items-center gap-2.5 px-3 py-2 text-start text-sm ${
                tone === 'danger' ? 'admin-row-actions-menu__item--danger' : ''
              }`}
              onClick={() => {
                close();
                onClick();
              }}
            >
              <span className="flex h-4 w-4 shrink-0 items-center justify-center text-[var(--admin-text-secondary)]">
                <Icon className="size-4" strokeWidth={1.75} aria-hidden />
              </span>
              <span className="min-w-0 flex-1 truncate font-medium">{label}</span>
            </button>
          ))}
        </div>,
        document.body,
      )
    : null;

  return (
    <>
      <div className="admin-row-actions-menu relative inline-flex shrink-0">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          aria-haspopup="menu"
          aria-label={ariaLabel ?? t('admin.common.actions.menuAria')}
          className={`admin-icon-btn admin-icon-btn--md admin-row-actions-menu__trigger !size-8 border-0 ${
            open ? 'admin-row-actions-menu__trigger--open' : ''
          }`}
        >
          <MoreVertical className="size-[18px]" strokeWidth={1.75} aria-hidden />
        </button>
      </div>
      {menuPortal}
    </>
  );
};

export default AdminRowActionsMenu;
