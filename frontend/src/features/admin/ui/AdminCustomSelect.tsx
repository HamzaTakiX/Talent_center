import {
  FunctionComponent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown, Search } from 'lucide-react';
import { useAdminDropdownPosition } from './hooks/useAdminDropdownPosition';
import { useAdminTheme } from '../dashboard/context/AdminThemeContext';

export interface AdminSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export type AdminSelectVariant = 'compact' | 'default';

export interface AdminCustomSelectProps {
  value: string;
  options: readonly AdminSelectOption[];
  onChange: (value: string) => void;
  variant?: AdminSelectVariant;
  placeholder?: string;
  disabled?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
  wrapperClassName?: string;
  id?: string;
  'aria-label'?: string;
}

const AdminCustomSelect: FunctionComponent<AdminCustomSelectProps> = ({
  value,
  options,
  onChange,
  variant = 'compact',
  placeholder = 'Select…',
  disabled = false,
  searchable = false,
  searchPlaceholder = 'Search…',
  emptyMessage = 'No options',
  className = '',
  wrapperClassName = '',
  id: idProp,
  'aria-label': ariaLabel,
}) => {
  const { theme } = useAdminTheme();
  const autoId = useId();
  const id = idProp ?? autoId;
  const listboxId = `${id}-listbox`;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const selected = options.find((o) => o.value === value);
  const label = selected?.label ?? placeholder;

  const filtered = useMemo(() => {
    if (!searchable || !query.trim()) return [...options];
    const q = query.trim().toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query, searchable]);

  const coords = useAdminDropdownPosition(open, triggerRef, menuRef);

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
  }, []);

  const selectAt = useCallback(
    (index: number) => {
      const opt = filtered[index];
      if (!opt || opt.disabled) return;
      onChange(opt.value);
      close();
      triggerRef.current?.focus();
    },
    [filtered, onChange, close]
  );

  useEffect(() => {
    if (!open) return;
    const idx = filtered.findIndex((o) => o.value === value && !o.disabled);
    setActiveIndex(idx >= 0 ? idx : filtered.findIndex((o) => !o.disabled));
  }, [open, filtered, value]);

  useEffect(() => {
    if (open && searchable) {
      requestAnimationFrame(() => searchRef.current?.focus());
    }
  }, [open, searchable]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t) || menuRef.current?.contains(t)) return;
      close();
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open, close]);

  const onTriggerKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    switch (e.key) {
      case 'ArrowDown':
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (!open) setOpen(true);
        else setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (open) setActiveIndex((i) => Math.max(i - 1, 0));
        break;
      case 'Escape':
        if (open) {
          e.preventDefault();
          close();
        }
        break;
      default:
        break;
    }
  };

  const onMenuKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((i) => {
          let next = i + 1;
          while (next < filtered.length && filtered[next]?.disabled) next += 1;
          return Math.min(next, filtered.length - 1);
        });
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((i) => {
          let next = i - 1;
          while (next >= 0 && filtered[next]?.disabled) next -= 1;
          return Math.max(next, 0);
        });
        break;
      case 'Home':
        e.preventDefault();
        setActiveIndex(filtered.findIndex((o) => !o.disabled));
        break;
      case 'End':
        e.preventDefault();
        for (let i = filtered.length - 1; i >= 0; i -= 1) {
          if (!filtered[i]?.disabled) {
            setActiveIndex(i);
            break;
          }
        }
        break;
      case 'Enter':
        e.preventDefault();
        selectAt(activeIndex);
        break;
      case 'Escape':
        e.preventDefault();
        close();
        triggerRef.current?.focus();
        break;
      default:
        break;
    }
  };

  const menu = createPortal(
    <AnimatePresence>
      {open && coords ? (
        <motion.div
          key={listboxId}
          ref={menuRef}
          id={listboxId}
          role="listbox"
          aria-label={ariaLabel}
          data-admin-theme={theme}
          className={`admin-custom-select__menu admin-custom-select__menu--${coords.placement}`}
              style={{
                position: 'fixed',
                top: coords.top,
                left: coords.left,
                width: coords.width,
                maxHeight: coords.maxHeight,
                zIndex: 'var(--admin-z-dropdown)',
              }}
              initial={{ opacity: 0, y: coords.placement === 'bottom' ? -6 : 6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: coords.placement === 'bottom' ? -4 : 4, scale: 0.98 }}
              transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
              onKeyDown={onMenuKeyDown}
            >
              {searchable && (
                <div className="admin-custom-select__search-wrap">
                  <Search className="admin-custom-select__search-icon" strokeWidth={2} aria-hidden />
                  <input
                    ref={searchRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="admin-custom-select__search-input"
                    aria-label={searchPlaceholder}
                  />
                </div>
              )}
              <div className="admin-custom-select__options" role="presentation">
                {filtered.length === 0 ? (
                  <div className="admin-custom-select__empty">{emptyMessage}</div>
                ) : (
                  filtered.map((opt, index) => {
                    const isSelected = opt.value === value;
                    const isActive = index === activeIndex;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        disabled={opt.disabled}
                        className={[
                          'admin-custom-select__option',
                          isSelected && 'admin-custom-select__option--selected',
                          isActive && 'admin-custom-select__option--active',
                          opt.disabled && 'admin-custom-select__option--disabled',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => selectAt(index)}
                      >
                        <span className="admin-custom-select__option-label">{opt.label}</span>
                        {isSelected && (
                          <Check className="admin-custom-select__option-check" strokeWidth={2.5} aria-hidden />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  );

  return (
    <div
      className={[
        'admin-custom-select',
        `admin-custom-select--${variant}`,
        open && 'admin-custom-select--open',
        disabled && 'admin-custom-select--disabled',
        wrapperClassName,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        aria-label={ariaLabel ?? label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        className="admin-custom-select__trigger"
        onClick={() => !disabled && setOpen((v) => !v)}
        onKeyDown={onTriggerKeyDown}
      >
        <span className={`admin-custom-select__value ${!selected ? 'admin-custom-select__value--placeholder' : ''}`}>
          {label}
        </span>
        <span className="admin-custom-select__chevron-wrap" aria-hidden>
          <ChevronDown className="admin-custom-select__chevron" strokeWidth={2} />
        </span>
      </button>
      {menu}
    </div>
  );
};

export default AdminCustomSelect;
