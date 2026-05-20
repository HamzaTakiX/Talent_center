import { FunctionComponent, useEffect, useRef, useState } from 'react';
import {
  Bookmark,
  EyeOff,
  MoreVertical,
  ThumbsUp,
  VolumeX,
} from 'lucide-react';
import {
  ANNOUNCEMENT_MENU_ITEM,
  ANNOUNCEMENT_MENU_PANEL,
} from '../constants/allAnnouncementsStyles';

interface AnnouncementActionMenuProps {
  announcementId: string;
}

const menuItems = [
  { label: 'Save', icon: Bookmark },
  { label: 'Favor this type', icon: ThumbsUp },
  { label: 'Mute this type', icon: VolumeX },
  { label: 'Hide', icon: EyeOff },
] as const;

const AnnouncementActionMenu: FunctionComponent<AnnouncementActionMenuProps> = ({
  announcementId,
}) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Actions for announcement ${announcementId}`}
        className={`inline-flex size-8 items-center justify-center rounded-full border-0 bg-transparent text-[#6b7280] transition-colors hover:text-[var(--admin-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed]/25 ${open ? 'text-[var(--admin-text)]' : ''}`}
      >
        <MoreVertical className="size-[18px]" strokeWidth={1.75} aria-hidden />
      </button>

      {open ? (
        <div
          role="menu"
          className={ANNOUNCEMENT_MENU_PANEL}
          style={{ right: 0, left: 'auto' }}
        >
          {menuItems.map(({ label, icon: Icon }) => (
            <button
              key={label}
              type="button"
              role="menuitem"
              className={ANNOUNCEMENT_MENU_ITEM}
              onClick={() => setOpen(false)}
            >
              <Icon className="size-4 shrink-0 text-[#6b7280]" strokeWidth={1.75} aria-hidden />
              <span className="min-w-0 truncate">{label}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default AnnouncementActionMenu;
