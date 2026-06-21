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
import { useTranslation } from 'react-i18next';
import { useAdminDropdownPosition } from '../../../ui/hooks/useAdminDropdownPosition';
import { useAdminDropdownScrollChain } from '../../../ui/hooks/useAdminDropdownScrollChain';
import { useAdminTheme } from '../../../dashboard/context/AdminThemeContext';
import { AdminFormField } from '../../../shared/forms/AdminFormPrimitives';
import { formatAcademicCode, humanizeAcademicLabel } from '../../utils/academicStructureDisplay';

const PREFIX = 'admin.modules.academicStructure.form';

export interface AcademicEntitySelectOption {
  value: string;
  code: string;
  name: string;
  active?: boolean;
  archived?: boolean;
  disabled?: boolean;
}

interface AcademicStructureEntitySelectProps {
  id: string;
  label: string;
  value: string;
  options: AcademicEntitySelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  disabled?: boolean;
}

const AcademicStructureEntitySelect: FunctionComponent<AcademicStructureEntitySelectProps> = ({
  id,
  label,
  value,
  options,
  onChange,
  placeholder,
  required,
  error,
  hint,
  disabled = false,
}) => {
  const { t, i18n } = useTranslation();
  const { theme } = useAdminTheme();
  const isRtl = i18n.dir() === 'rtl';
  const autoId = useId();
  const listboxId = `${id || autoId}-listbox`;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const selected = options.find((o) => o.value === value);
  const resolvedPlaceholder = placeholder ?? t(`${PREFIX}.select.placeholder`);

  const filtered = useMemo(() => {
    if (!query.trim()) return options;
    const q = query.trim().toLowerCase();
    return options.filter(
      (o) =>
        o.name.toLowerCase().includes(q) ||
        o.code.toLowerCase().includes(q) ||
        o.value.toLowerCase().includes(q),
    );
  }, [options, query]);

  const coords = useAdminDropdownPosition(open, triggerRef, menuRef);
  useAdminDropdownScrollChain(open && Boolean(coords), menuRef, optionsRef, triggerRef);

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
    [filtered, onChange, close],
  );

  useEffect(() => {
    if (!open) return;
    const idx = filtered.findIndex((o) => o.value === value && !o.disabled);
    setActiveIndex(idx >= 0 ? idx : filtered.findIndex((o) => !o.disabled));
  }, [open, filtered, value]);

  useEffect(() => {
    if (open) requestAnimationFrame(() => searchRef.current?.focus());
  }, [open]);

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
        setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
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
          ref={menuRef}
          id={listboxId}
          role="listbox"
          aria-label={label}
          data-admin-theme={theme}
          dir={isRtl ? 'rtl' : 'ltr'}
          className={`academic-entity-select__menu admin-custom-select__menu admin-custom-select__menu--${coords.placement}`}
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
          <div className="admin-custom-select__search-wrap">
            <Search className="admin-custom-select__search-icon" strokeWidth={2} aria-hidden />
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t(`${PREFIX}.select.search`)}
              className="admin-custom-select__search-input"
              aria-label={t(`${PREFIX}.select.search`)}
            />
          </div>
          <div ref={optionsRef} className="admin-custom-select__options" role="presentation">
            {filtered.length === 0 ? (
              <div className="admin-custom-select__empty">{t(`${PREFIX}.select.empty`)}</div>
            ) : (
              filtered.map((opt, index) => {
                const isSelected = opt.value === value;
                const isActive = index === activeIndex;
                const statusLabel = opt.archived
                  ? t('admin.modules.academicStructure.status.archived')
                  : opt.active === false
                    ? t('admin.modules.academicStructure.status.inactive')
                    : t('admin.modules.academicStructure.status.active');

                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    disabled={opt.disabled}
                    className={[
                      'admin-custom-select__option',
                      'academic-entity-select__option',
                      isSelected && 'admin-custom-select__option--selected',
                      isActive && 'admin-custom-select__option--active',
                      opt.disabled && 'admin-custom-select__option--disabled',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => selectAt(index)}
                  >
                    <span className="academic-entity-select__option-main">
                      <span className="academic-entity-select__option-code">
                        {formatAcademicCode(opt.code)}
                      </span>
                      <span className="academic-entity-select__option-name">
                        {humanizeAcademicLabel(opt.name)}
                      </span>
                    </span>
                    <span className="academic-entity-select__option-meta">
                      <span
                        className={`academic-entity-select__status ${
                          opt.archived
                            ? 'academic-entity-select__status--archived'
                            : opt.active === false
                              ? 'academic-entity-select__status--inactive'
                              : 'academic-entity-select__status--active'
                        }`}
                      >
                        {statusLabel}
                      </span>
                      {isSelected ? (
                        <Check className="academic-entity-select__check" strokeWidth={2.5} aria-hidden />
                      ) : null}
                    </span>
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
    <AdminFormField
      htmlFor={id}
      label={label}
      required={required}
      hint={hint}
      error={error ? t(`${PREFIX}.validation.${error}`) : undefined}
    >
      <div
        className={[
          'academic-entity-select',
          open && 'academic-entity-select--open',
          disabled && 'academic-entity-select--disabled',
          error && 'academic-entity-select--error',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <button
          ref={triggerRef}
          id={id}
          type="button"
          disabled={disabled}
          aria-label={label}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? listboxId : undefined}
          className="academic-entity-select__trigger"
          onClick={() => !disabled && setOpen((v) => !v)}
          onKeyDown={onTriggerKeyDown}
        >
          {selected ? (
            <span className="academic-entity-select__value">
              <span className="academic-entity-select__value-code">
                {formatAcademicCode(selected.code)}
              </span>
              <span className="academic-entity-select__value-name">
                {humanizeAcademicLabel(selected.name)}
              </span>
            </span>
          ) : (
            <span className="academic-entity-select__placeholder">{resolvedPlaceholder}</span>
          )}
          <ChevronDown className="academic-entity-select__chevron" strokeWidth={2} aria-hidden />
        </button>
        {menu}
      </div>
    </AdminFormField>
  );
};

export default AcademicStructureEntitySelect;
