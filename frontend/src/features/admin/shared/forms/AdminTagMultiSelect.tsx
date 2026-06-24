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
import { Check, ChevronDown, Loader2, Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAdminTheme } from '../../dashboard/context/AdminThemeContext';
import { useAdminDropdownOpenState } from '../../ui/hooks/useAdminDropdownOpenState';
import { useAdminDropdownPosition } from '../../ui/hooks/useAdminDropdownPosition';
import { useAdminDropdownScrollChain } from '../../ui/hooks/useAdminDropdownScrollChain';
import { adminFormLabelClass, adminFormRequiredClass } from './adminFormClasses';

export interface TagOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface TagOptionGroup {
  label: string;
  options: TagOption[];
}

interface AdminTagMultiSelectProps {
  id: string;
  label: string;
  hint?: string;
  values: string[];
  options?: TagOption[];
  groups?: TagOptionGroup[];
  onChange: (values: string[]) => void;
  disabled?: boolean;
  loading?: boolean;
  searchable?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabledHint?: string;
  required?: boolean;
  error?: string;
}

const AdminTagMultiSelect: FunctionComponent<AdminTagMultiSelectProps> = ({
  id,
  label,
  hint,
  values,
  options = [],
  groups,
  onChange,
  disabled = false,
  loading = false,
  searchable = true,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  disabledHint,
  required = false,
  error,
}) => {
  const { t, i18n } = useTranslation();
  const { theme } = useAdminTheme();
  const autoId = useId();
  const controlId = id || autoId;
  const listboxId = `${controlId}-listbox`;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const { open, setOpen, close } = useAdminDropdownOpenState(controlId);

  const resolvedPlaceholder =
    placeholder ?? t('admin.forms.academicScope.selectPlaceholder');
  const resolvedSearchPh =
    searchPlaceholder ?? t('admin.forms.academicScope.searchPlaceholder');
  const resolvedEmpty = emptyMessage ?? t('admin.forms.academicScope.emptyOptions');
  const resolvedDisabledHint =
    disabledHint ?? t('admin.forms.academicScope.disabledHint');

  const selectedSet = useMemo(() => new Set(values), [values]);
  const useGroups = Boolean(groups?.length);

  const allOptions = useMemo(
    () => (useGroups ? (groups ?? []).flatMap((group) => group.options) : options),
    [useGroups, groups, options],
  );

  const filtered = useMemo(() => {
    if (!searchable || !query.trim()) return options;
    const q = query.trim().toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query, searchable]);

  const filteredGroups = useMemo(() => {
    if (!useGroups) return [];
    const source = groups ?? [];
    if (!searchable || !query.trim()) return source;
    const q = query.trim().toLowerCase();
    return source
      .map((group) => ({
        label: group.label,
        options: group.options.filter(
          (option) =>
            option.label.toLowerCase().includes(q) || group.label.toLowerCase().includes(q),
        ),
      }))
      .filter((group) => group.options.length > 0);
  }, [useGroups, groups, query, searchable]);

  const menuOptions = useGroups
    ? filteredGroups.flatMap((group) => group.options)
    : filtered;

  const coords = useAdminDropdownPosition(open, triggerRef, menuRef);
  useAdminDropdownScrollChain(open && Boolean(coords), menuRef, optionsRef, triggerRef);

  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  const toggleValue = useCallback(
    (value: string) => {
      if (selectedSet.has(value)) {
        onChange(values.filter((v) => v !== value));
      } else {
        onChange([...values, value]);
      }
      close();
      triggerRef.current?.focus();
    },
    [close, onChange, selectedSet, values],
  );

  const removeValue = (value: string) => {
    onChange(values.filter((v) => v !== value));
  };

  useEffect(() => {
    if (!open) return;
    const idx = menuOptions.findIndex((o) => !o.disabled);
    setActiveIndex(idx >= 0 ? idx : 0);
  }, [open, menuOptions]);

  useEffect(() => {
    if (open && searchable) {
      requestAnimationFrame(() => searchRef.current?.focus());
    }
  }, [open, searchable]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      close();
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open, close]);

  const onTriggerKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;
    switch (e.key) {
      case 'ArrowDown':
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (!open) setOpen(true);
        else setActiveIndex((i) => Math.min(i + 1, menuOptions.length - 1));
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
          while (next < menuOptions.length && menuOptions[next]?.disabled) next += 1;
          return Math.min(next, menuOptions.length - 1);
        });
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((i) => {
          let next = i - 1;
          while (next >= 0 && menuOptions[next]?.disabled) next -= 1;
          return Math.max(next, 0);
        });
        break;
      case 'Enter':
        e.preventDefault();
        if (!menuOptions[activeIndex]?.disabled) {
          toggleValue(menuOptions[activeIndex].value);
        }
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

  const labelByValue = useMemo(() => {
    const map = new Map<string, string>();
    allOptions.forEach((o) => map.set(o.value, o.label));
    return map;
  }, [allOptions]);

  const isRtl = i18n.dir() === 'rtl';
  const triggerLabel = disabled
    ? resolvedDisabledHint
    : values.length
      ? t('admin.forms.academicScope.selectedCount', { count: values.length })
      : resolvedPlaceholder;

  const menu = createPortal(
    <AnimatePresence>
      {open && !disabled && coords ? (
        <motion.div
          key={listboxId}
          ref={menuRef}
          id={listboxId}
          role="listbox"
          aria-multiselectable
          data-admin-theme={theme}
          dir={isRtl ? 'rtl' : 'ltr'}
          className={`admin-custom-select__menu admin-custom-select__menu--${coords.placement} admin-tag-multi-select__menu`}
          style={{
            position: 'fixed',
            top: coords.top,
            left: coords.left,
            width: coords.width,
            maxHeight: coords.maxHeight,
            zIndex: 'var(--admin-z-dropdown)',
            '--admin-dropdown-max-height': `${coords.maxHeight}px`,
          } as React.CSSProperties}
          initial={{ opacity: 0, y: coords.placement === 'bottom' ? -6 : 6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: coords.placement === 'bottom' ? -4 : 4, scale: 0.98 }}
          transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
          onKeyDown={onMenuKeyDown}
        >
          {searchable ? (
            <div className="admin-custom-select__search-wrap">
              <Search className="admin-custom-select__search-icon" strokeWidth={2} aria-hidden />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={resolvedSearchPh}
                className="admin-custom-select__search-input"
                aria-label={resolvedSearchPh}
                dir={isRtl ? 'rtl' : 'ltr'}
              />
            </div>
          ) : null}
          <div ref={optionsRef} className="admin-custom-select__options" role="presentation">
            {menuOptions.length === 0 ? (
              <div className="admin-custom-select__empty">{resolvedEmpty}</div>
            ) : useGroups ? (
              (() => {
                let optionIndex = 0;
                return filteredGroups.map((group) => (
                  <div key={group.label} className="admin-custom-select__option-group" role="presentation">
                    <div className="admin-custom-select__group-label">{group.label}</div>
                    {group.options.map((opt) => {
                      const index = optionIndex;
                      optionIndex += 1;
                      const checked = selectedSet.has(opt.value);
                      const isActive = index === activeIndex;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          role="option"
                          aria-selected={checked}
                          disabled={opt.disabled}
                          className={[
                            'admin-custom-select__option',
                            'admin-tag-multi-select__option',
                            checked && 'admin-custom-select__option--selected',
                            isActive && 'admin-custom-select__option--active',
                            opt.disabled && 'admin-custom-select__option--disabled',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                          onMouseEnter={() => setActiveIndex(index)}
                          onClick={() => !opt.disabled && toggleValue(opt.value)}
                        >
                          <span
                            className={[
                              'admin-tag-multi-select__checkbox',
                              checked && 'admin-tag-multi-select__checkbox--checked',
                            ]
                              .filter(Boolean)
                              .join(' ')}
                            aria-hidden
                          >
                            {checked ? (
                              <Check
                                className="admin-tag-multi-select__checkbox-icon"
                                strokeWidth={2.5}
                              />
                            ) : null}
                          </span>
                          <span className="admin-custom-select__option-label">{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                ));
              })()
            ) : (
              filtered.map((opt, index) => {
                const checked = selectedSet.has(opt.value);
                const isActive = index === activeIndex;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="option"
                    aria-selected={checked}
                    disabled={opt.disabled}
                    className={[
                      'admin-custom-select__option',
                      'admin-tag-multi-select__option',
                      checked && 'admin-custom-select__option--selected',
                      isActive && 'admin-custom-select__option--active',
                      opt.disabled && 'admin-custom-select__option--disabled',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => !opt.disabled && toggleValue(opt.value)}
                  >
                    <span
                      className={[
                        'admin-tag-multi-select__checkbox',
                        checked && 'admin-tag-multi-select__checkbox--checked',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      aria-hidden
                    >
                      {checked ? (
                        <Check className="admin-tag-multi-select__checkbox-icon" strokeWidth={2.5} />
                      ) : null}
                    </span>
                    <span className="admin-custom-select__option-label">{opt.label}</span>
                  </button>
                );
              })
            )}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );

  return (
    <div
      className={[
        'admin-form-field flex flex-col gap-1.5',
        error ? 'admin-form-field--error' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <label htmlFor={controlId} className={adminFormLabelClass}>
        <span>{label}</span>
        {required ? (
          <span className={adminFormRequiredClass} aria-hidden>
            *
          </span>
        ) : null}
      </label>
      {hint && !error ? (
        <p className="-mt-1 text-xs text-[var(--admin-text-secondary)]">{hint}</p>
      ) : null}

      <div
        className={[
          'admin-custom-select',
          'admin-tag-multi-select',
          'admin-custom-select--default',
          open && 'admin-custom-select--open',
          (disabled || loading) && 'admin-custom-select--disabled',
          error && 'admin-custom-select--error',
        ]
          .filter(Boolean)
          .join(' ')}
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {values.length > 0 ? (
          <div className="admin-tag-multi-select__chips" role="list" aria-label={label}>
            {values.map((val) => (
              <span key={val} className="admin-tag-multi-select__chip" role="listitem">
                <span className="admin-tag-multi-select__chip-label">
                  {labelByValue.get(val) ?? val}
                </span>
                {!disabled ? (
                  <button
                    type="button"
                    className="admin-tag-multi-select__chip-remove"
                    onClick={() => removeValue(val)}
                    aria-label={t('admin.forms.academicScope.removeChip', {
                      label: labelByValue.get(val) ?? val,
                    })}
                  >
                    <X className="admin-tag-multi-select__chip-remove-icon" strokeWidth={2} aria-hidden />
                  </button>
                ) : null}
              </span>
            ))}
          </div>
        ) : null}

        <button
          ref={triggerRef}
          id={controlId}
          type="button"
          disabled={disabled || loading}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? listboxId : undefined}
          aria-label={label}
          className="admin-custom-select__trigger"
          onClick={() => !disabled && !loading && setOpen((v) => !v)}
          onKeyDown={onTriggerKeyDown}
        >
          <span
            className={[
              'admin-custom-select__value',
              !values.length && !disabled && 'admin-custom-select__value--placeholder',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {triggerLabel}
          </span>
          <span className="admin-custom-select__chevron-wrap" aria-hidden>
            {loading ? (
              <Loader2 className="admin-tag-multi-select__loader animate-spin" strokeWidth={2} />
            ) : (
              <ChevronDown className="admin-custom-select__chevron" strokeWidth={2} />
            )}
          </span>
        </button>
        {menu}
      </div>
      {error ? <p className="admin-form-field-error">{error}</p> : null}
    </div>
  );
};

export default AdminTagMultiSelect;
