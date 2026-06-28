import {
  FunctionComponent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { Archive, ArchiveRestore, Loader2, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { CoachConversation } from '../types/careerCoach';

interface CareerCoachConversationItemProps {
  conversation: CoachConversation;
  isActive: boolean;
  preview: string;
  isArchivedList?: boolean;
  onSelect: () => void;
  onRename: (title: string) => void;
  onArchive: () => void;
  onUnarchive: () => void;
  onDelete: () => void;
}

const CareerCoachConversationItem: FunctionComponent<CareerCoachConversationItemProps> = ({
  conversation,
  isActive,
  preview,
  isArchivedList = false,
  onSelect,
  onRename,
  onArchive,
  onUnarchive,
  onDelete,
}) => {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(preview);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const menuWrapRef = useRef<HTMLDivElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const menuPanelRef = useRef<HTMLDivElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);

  const updateMenuPosition = useCallback(() => {
    const button = menuBtnRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const menuWidth = 168;
    const viewportPadding = 8;
    const left = Math.min(
      Math.max(viewportPadding, rect.right - menuWidth),
      window.innerWidth - menuWidth - viewportPadding,
    );

    setMenuPosition({
      top: rect.bottom + 6,
      left,
    });
  }, []);

  useLayoutEffect(() => {
    if (!menuOpen) return undefined;

    updateMenuPosition();

    const handleReposition = () => updateMenuPosition();
    window.addEventListener('resize', handleReposition);
    window.addEventListener('scroll', handleReposition, true);

    return () => {
      window.removeEventListener('resize', handleReposition);
      window.removeEventListener('scroll', handleReposition, true);
    };
  }, [menuOpen, updateMenuPosition]);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (menuWrapRef.current?.contains(target)) return;
      if (menuPanelRef.current?.contains(target)) return;
      setMenuOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (isRenaming) {
      setRenameValue(conversation.title || preview);
      renameInputRef.current?.focus();
      renameInputRef.current?.select();
    }
  }, [conversation.title, isRenaming, preview]);

  const startRename = useCallback(() => {
    setMenuOpen(false);
    setIsRenaming(true);
  }, []);

  const cancelRename = useCallback(() => {
    setIsRenaming(false);
    setRenameValue(conversation.title || preview);
  }, [conversation.title, preview]);

  const submitRename = useCallback(() => {
    const trimmed = renameValue.trim();
    if (!trimmed) {
      cancelRename();
      return;
    }
    onRename(trimmed);
    setIsRenaming(false);
  }, [cancelRename, onRename, renameValue]);

  const handleRenameKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        submitRename();
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        cancelRename();
      }
    },
    [cancelRename, submitRename],
  );

  const handleArchive = useCallback(() => {
    setMenuOpen(false);
    onArchive();
  }, [onArchive]);

  const handleUnarchive = useCallback(() => {
    setMenuOpen(false);
    onUnarchive();
  }, [onUnarchive]);

  const handleDelete = useCallback(() => {
    setMenuOpen(false);
    onDelete();
  }, [onDelete]);

  const isPending = conversation.isPending;

  return (
    <li
      className={`sr-acc-sidebar__row${isActive ? ' sr-acc-sidebar__row--active' : ''}${
        isRenaming ? ' sr-acc-sidebar__row--renaming' : ''
      }${menuOpen ? ' sr-acc-sidebar__row--menu-open' : ''}${isPending ? ' sr-acc-sidebar__row--pending' : ''}`}
    >
      {isRenaming ? (
        <div className="sr-acc-sidebar__rename">
          <input
            ref={renameInputRef}
            type="text"
            className="sr-acc-sidebar__rename-input"
            value={renameValue}
            onChange={(event) => setRenameValue(event.target.value)}
            onKeyDown={handleRenameKeyDown}
            onBlur={submitRename}
            placeholder={t('student.internshipOffers.careerCoach.history.renamePlaceholder')}
            aria-label={t('student.internshipOffers.careerCoach.history.renamePlaceholder')}
          />
        </div>
      ) : (
        <>
          <button
            type="button"
            className="sr-acc-sidebar__item"
            onClick={onSelect}
            disabled={isPending}
            aria-current={isActive ? 'true' : undefined}
          >
            <span className="sr-acc-sidebar__item-title">
              {isPending ? (
                <Loader2 size={14} className="sr-acc-sidebar__item-spinner" aria-hidden />
              ) : null}
              {preview}
            </span>
          </button>

          {!isPending ? (
          <div className="sr-acc-sidebar__menu-wrap" ref={menuWrapRef}>
            <button
              ref={menuBtnRef}
              type="button"
              className={`sr-acc-sidebar__menu-btn${menuOpen ? ' sr-acc-sidebar__menu-btn--open' : ''}`}
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={t('student.internshipOffers.careerCoach.history.moreActions')}
              aria-expanded={menuOpen}
              aria-haspopup="menu"
            >
              <MoreVertical size={16} aria-hidden />
            </button>

            {menuOpen
              ? createPortal(
                  <div
                    ref={menuPanelRef}
                    className="sr-acc-sidebar__menu sr-acc-sidebar__menu--portal"
                    role="menu"
                    style={{ top: menuPosition.top, left: menuPosition.left }}
                  >
                    <button
                      type="button"
                      role="menuitem"
                      className="sr-acc-sidebar__menu-item"
                      onClick={startRename}
                    >
                      <Pencil size={15} aria-hidden />
                      {t('student.internshipOffers.careerCoach.history.rename')}
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      className="sr-acc-sidebar__menu-item"
                      onClick={isArchivedList ? handleUnarchive : handleArchive}
                    >
                      {isArchivedList ? (
                        <ArchiveRestore size={15} aria-hidden />
                      ) : (
                        <Archive size={15} aria-hidden />
                      )}
                      {isArchivedList
                        ? t('student.internshipOffers.careerCoach.history.unarchive')
                        : t('student.internshipOffers.careerCoach.history.archive')}
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      className="sr-acc-sidebar__menu-item sr-acc-sidebar__menu-item--danger"
                      onClick={handleDelete}
                    >
                      <Trash2 size={15} aria-hidden />
                      {t('student.internshipOffers.careerCoach.history.delete')}
                    </button>
                  </div>,
                  document.body,
                )
              : null}
          </div>
          ) : null}
        </>
      )}
    </li>
  );
};

export default CareerCoachConversationItem;
