import { FunctionComponent, ReactNode, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Archive,
  ArchiveRestore,
  Clock,
  MoreVertical,
  Paperclip,
  Search,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export type ChatConversationMenuProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  archived?: boolean;
  showArchive?: boolean;
  searchActive?: boolean;
  onOpenAttachments: () => void;
  onOpenSearch: () => void;
  onOpenHistory: () => void;
  onArchive?: () => void;
  onUnarchive?: () => void;
  className?: string;
  triggerClassName?: string;
};

function useClickOutside(
  ref: React.RefObject<HTMLElement | null>,
  onOutside: () => void,
  active: boolean,
) {
  useEffect(() => {
    if (!active) return;
    const handler = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) onOutside();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onOutside();
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', onKey);
    };
  }, [ref, onOutside, active]);
}

const MenuDivider: FunctionComponent = () => (
  <div className="chat-conversation-menu__divider" role="separator" />
);

const MenuSectionLabel: FunctionComponent<{ children: ReactNode }> = ({ children }) => (
  <p className="chat-conversation-menu__section-label" role="presentation">
    {children}
  </p>
);

const MenuItem: FunctionComponent<{
  icon: ReactNode;
  label: string;
  description?: string;
  onClick: () => void;
  active?: boolean;
  variant?: 'default' | 'destructive' | 'success';
}> = ({ icon, label, description, onClick, active, variant = 'default' }) => (
  <button
    type="button"
    role="menuitem"
    onClick={onClick}
    className={`admin-chat-menu-item chat-conversation-menu__item flex w-full items-start gap-3 text-start ${
      active ? 'admin-chat-menu-item--active' : ''
    } ${variant !== 'default' ? `chat-conversation-menu__item--${variant}` : ''}`}
  >
    <span className="chat-conversation-menu__item-icon shrink-0">{icon}</span>
    <span className="min-w-0 flex-1">
      <span className="chat-conversation-menu__item-label block truncate text-[var(--admin-text)]">
        {label}
      </span>
      {description ? (
        <span className="chat-conversation-menu__item-desc block truncate">{description}</span>
      ) : null}
    </span>
  </button>
);

const ChatConversationMenu: FunctionComponent<ChatConversationMenuProps> = ({
  open,
  onOpenChange,
  archived = false,
  showArchive = true,
  searchActive = false,
  onOpenAttachments,
  onOpenSearch,
  onOpenHistory,
  onArchive,
  onUnarchive,
  className = '',
  triggerClassName = '',
}) => {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => onOpenChange(false), open);

  const closeAnd = (action: () => void) => {
    action();
    onOpenChange(false);
  };

  const archiveEnabled = showArchive && (archived ? onUnarchive : onArchive);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        aria-label={t('admin.chat.moreActions')}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => onOpenChange(!open)}
        className={`isi-icon-btn chat-conversation-menu__trigger ${open ? 'chat-conversation-menu__trigger--open' : ''} ${triggerClassName}`}
      >
        <MoreVertical className="size-4" strokeWidth={2} aria-hidden />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="admin-chat-dropdown chat-conversation-menu__panel absolute end-0 top-[calc(100%+8px)] z-50 overflow-hidden"
          >
            {archived ? (
              <>
                <div className="chat-conversation-menu__archived-notice" role="status">
                  <Archive className="size-3.5 shrink-0" strokeWidth={2} aria-hidden />
                  <span>{t('admin.chat.conversationArchivedNotice')}</span>
                </div>
                <MenuDivider />
              </>
            ) : null}

            <MenuSectionLabel>{t('admin.chat.menuSectionExplore')}</MenuSectionLabel>
            <MenuItem
              icon={<Paperclip className="h-3.5 w-3.5" strokeWidth={2} />}
              label={t('admin.chat.sharedAttachments')}
              description={t('admin.chat.sharedAttachmentsHint', {
                defaultValue: 'Fichiers partagés dans ce fil',
              })}
              onClick={() => closeAnd(onOpenAttachments)}
            />
            <MenuItem
              icon={<Search className="h-3.5 w-3.5" strokeWidth={2} />}
              label={t('admin.chat.searchInConversationLabel')}
              description={t('admin.chat.openSearch')}
              onClick={() => closeAnd(onOpenSearch)}
              active={searchActive}
            />
            <MenuItem
              icon={<Clock className="h-3.5 w-3.5" strokeWidth={2} />}
              label={t('admin.chat.conversationHistory')}
              description={t('admin.chat.conversationHistoryHint', {
                defaultValue: 'Repères et événements du fil',
              })}
              onClick={() => closeAnd(onOpenHistory)}
            />

            {archiveEnabled ? (
              <>
                <MenuDivider />
                <MenuSectionLabel>{t('admin.chat.menuSectionInbox')}</MenuSectionLabel>
                <MenuItem
                  icon={
                    archived ? (
                      <ArchiveRestore className="h-3.5 w-3.5" strokeWidth={2} />
                    ) : (
                      <Archive className="h-3.5 w-3.5" strokeWidth={2} />
                    )
                  }
                  label={
                    archived
                      ? t('admin.chat.unarchiveConversation')
                      : t('admin.chat.archiveConversation')
                  }
                  description={
                    archived
                      ? t('admin.chat.unarchiveConversationHint')
                      : t('admin.chat.archiveConversationHint')
                  }
                  variant={archived ? 'success' : 'destructive'}
                  onClick={() =>
                    closeAnd(() => {
                      if (archived) onUnarchive?.();
                      else onArchive?.();
                    })
                  }
                />
              </>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default ChatConversationMenu;
