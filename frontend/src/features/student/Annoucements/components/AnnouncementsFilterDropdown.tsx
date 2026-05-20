import { FunctionComponent, useEffect, useRef, useState } from 'react';
import { ChevronDown, type LucideIcon } from 'lucide-react';
import {
  ALL_ANNOUNCEMENTS_FILTER_BTN,
  ALL_ANNOUNCEMENTS_FILTER_BTN_OPEN,
  ANNOUNCEMENT_MENU_ITEM,
  ANNOUNCEMENT_MENU_PANEL,
} from '../constants/allAnnouncementsStyles';

interface FilterOption {
  value: string;
  label: string;
}

interface AnnouncementsFilterDropdownProps {
  label: string;
  icon: LucideIcon;
  value: string;
  options: readonly FilterOption[];
  onChange: (value: string) => void;
  ariaLabel: string;
}

const AnnouncementsFilterDropdown: FunctionComponent<AnnouncementsFilterDropdownProps> = ({
  label,
  icon: Icon,
  value,
  options,
  onChange,
  ariaLabel,
}) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value)?.label ?? label;

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
    <div ref={rootRef} className="relative min-w-0 w-full sm:w-auto sm:shrink-0">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        className={`${ALL_ANNOUNCEMENTS_FILTER_BTN} ${open ? ALL_ANNOUNCEMENTS_FILTER_BTN_OPEN : ''}`}
      >
        <Icon
          className="size-3.5 shrink-0 text-[#6b7280] max-[429px]:size-3 sm:size-4"
          strokeWidth={1.75}
          aria-hidden
        />
        <span className="min-w-0 truncate">{value === 'all' ? label : selected}</span>
        <ChevronDown
          className={`size-3.5 shrink-0 text-[var(--admin-text-muted)] transition-transform duration-200 sm:size-4 ${open ? 'rotate-180' : ''}`}
          strokeWidth={2}
          aria-hidden
        />
      </button>

      {open ? (
        <div
          role="listbox"
          className={`${ANNOUNCEMENT_MENU_PANEL} left-0 right-0 w-full min-w-0 max-[429px]:max-w-none sm:left-auto sm:right-0 sm:w-[min(100vw-2rem,220px)] sm:min-w-[200px]`}
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={value === option.value}
              className={`${ANNOUNCEMENT_MENU_ITEM} ${value === option.value ? 'bg-[#f5f3ff] text-[#6d28d9]' : ''}`}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default AnnouncementsFilterDropdown;
