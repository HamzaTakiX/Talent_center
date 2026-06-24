import {
  FunctionComponent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAdminTheme } from '../../dashboard/context/AdminThemeContext';

const PICKER_WIDTH = 320;
const MENU_GAP = 8;

interface AdminModernDatePickerProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  disabled?: boolean;
  placeholder?: string;
  'aria-invalid'?: boolean;
  'aria-label'?: string;
}

function parseIsoDate(value: string): Date | null {
  if (!value) return null;
  const [y, m, d] = value.split('-').map(Number);
  if (!y || !m || !d) return null;
  const date = new Date(y, m - 1, d);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isBeforeDay(a: Date, b: Date): boolean {
  const da = new Date(a.getFullYear(), a.getMonth(), a.getDate());
  const db = new Date(b.getFullYear(), b.getMonth(), b.getDate());
  return da.getTime() < db.getTime();
}

function isAfterDay(a: Date, b: Date): boolean {
  const da = new Date(a.getFullYear(), a.getMonth(), a.getDate());
  const db = new Date(b.getFullYear(), b.getMonth(), b.getDate());
  return da.getTime() > db.getTime();
}

function buildCalendarDays(viewYear: number, viewMonth: number): (Date | null)[] {
  const first = new Date(viewYear, viewMonth, 1);
  const startOffset = first.getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (Date | null)[] = [];

  for (let i = 0; i < startOffset; i += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(viewYear, viewMonth, day));
  }

  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

const AdminModernDatePicker: FunctionComponent<AdminModernDatePickerProps> = ({
  id: idProp,
  value,
  onChange,
  min,
  max,
  disabled = false,
  placeholder = 'dd/mm/yyyy',
  'aria-invalid': ariaInvalid,
  'aria-label': ariaLabel,
}) => {
  const { t, i18n } = useTranslation();
  const { theme } = useAdminTheme();
  const isRtl = i18n.dir() === 'rtl';
  const locale = i18n.language?.startsWith('ar')
    ? 'ar-MA'
    : i18n.language?.startsWith('en')
      ? 'en-GB'
      : 'fr-FR';

  const autoId = useId();
  const id = idProp ?? autoId;
  const panelId = `${id}-panel`;

  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; placement: 'bottom' | 'top' } | null>(null);
  const [draft, setDraft] = useState(value);
  const [viewDate, setViewDate] = useState(() => parseIsoDate(value) ?? new Date());

  const selected = parseIsoDate(value);
  const draftDate = parseIsoDate(draft);
  const minDate = min ? parseIsoDate(min) : null;
  const maxDate = max ? parseIsoDate(max) : null;
  const today = new Date();

  const weekdayLabels = Array.from({ length: 7 }, (_, i) =>
    new Intl.DateTimeFormat(locale, { weekday: 'narrow' }).format(new Date(2024, 0, i)),
  );

  const monthLabel = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(viewDate);
  const headerDate = draftDate ?? selected ?? today;
  const headerDisplay = new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(headerDate);

  const displayValue = selected
    ? new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: 'numeric' }).format(selected)
    : '';

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const panelHeight = panelRef.current?.offsetHeight ?? 380;
    const spaceBelow = window.innerHeight - rect.bottom - MENU_GAP;
    const spaceAbove = rect.top - MENU_GAP;
    const openBelow = spaceBelow >= panelHeight || spaceBelow >= spaceAbove;

    const left = Math.min(
      Math.max(MENU_GAP, rect.left),
      window.innerWidth - PICKER_WIDTH - MENU_GAP,
    );

    const top = openBelow
      ? rect.bottom + MENU_GAP
      : Math.max(MENU_GAP, rect.top - panelHeight - MENU_GAP);

    setCoords({ top, left, placement: openBelow ? 'bottom' : 'top' });
  }, []);

  const close = useCallback(() => setOpen(false), []);

  const openPicker = useCallback(() => {
    if (disabled) return;
    setDraft(value);
    setViewDate(parseIsoDate(value) ?? new Date());
    setOpen(true);
  }, [disabled, value]);

  const confirm = useCallback(() => {
    if (draft) onChange(draft);
    close();
    triggerRef.current?.focus();
  }, [draft, onChange, close]);

  const cancel = useCallback(() => {
    setDraft(value);
    close();
    triggerRef.current?.focus();
  }, [value, close]);

  useLayoutEffect(() => {
    if (!open) {
      setCoords(null);
      return;
    }
    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      cancel();
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open, cancel]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') cancel();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, cancel]);

  const isDisabledDay = (day: Date) => {
    if (minDate && isBeforeDay(day, minDate)) return true;
    if (maxDate && isAfterDay(day, maxDate)) return true;
    return false;
  };

  const onTriggerKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open) openPicker();
    }
    if (e.key === 'Escape' && open) {
      e.preventDefault();
      cancel();
    }
  };

  const shiftMonth = (delta: number) => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  };

  const calendarDays = buildCalendarDays(viewDate.getFullYear(), viewDate.getMonth());

  const panel = createPortal(
    <AnimatePresence>
      {open && coords ? (
        <motion.div
          key={panelId}
          ref={panelRef}
          id={panelId}
          role="dialog"
          aria-modal="true"
          aria-label={t('admin.forms.createAnnouncement.publication.datePicker.title', {
            defaultValue: 'Sélectionner une date',
          })}
          data-admin-theme={theme}
          dir={isRtl ? 'rtl' : 'ltr'}
          className="admin-modern-date-picker__panel"
          style={{
            position: 'fixed',
            top: coords.top,
            left: coords.left,
            width: PICKER_WIDTH,
            zIndex: 'var(--admin-z-dropdown)',
          } as CSSProperties}
          initial={{ opacity: 0, y: coords.placement === 'bottom' ? -8 : 8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: coords.placement === 'bottom' ? -4 : 4, scale: 0.98 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="admin-modern-date-picker__header">
            <span className="admin-modern-date-picker__header-label">
              {t('admin.forms.createAnnouncement.publication.datePicker.title', {
                defaultValue: 'Sélectionner une date',
              })}
            </span>
            <p className="admin-modern-date-picker__header-date">{headerDisplay}</p>
          </div>

          <div className="admin-modern-date-picker__nav">
            <span className="admin-modern-date-picker__month" aria-live="polite">
              {monthLabel}
            </span>
            <div className="admin-modern-date-picker__nav-actions">
              <button
                type="button"
                className="admin-modern-date-picker__nav-btn"
                onClick={() => shiftMonth(-1)}
                aria-label={t('admin.forms.createAnnouncement.publication.datePicker.prevMonth', {
                  defaultValue: 'Mois précédent',
                })}
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={2} aria-hidden />
              </button>
              <button
                type="button"
                className="admin-modern-date-picker__nav-btn"
                onClick={() => shiftMonth(1)}
                aria-label={t('admin.forms.createAnnouncement.publication.datePicker.nextMonth', {
                  defaultValue: 'Mois suivant',
                })}
              >
                <ChevronRight className="h-4 w-4" strokeWidth={2} aria-hidden />
              </button>
            </div>
          </div>

          <div className="admin-modern-date-picker__weekdays" aria-hidden>
            {weekdayLabels.map((label, i) => (
              <span key={`${label}-${i}`} className="admin-modern-date-picker__weekday">
                {label}
              </span>
            ))}
          </div>

          <div className="admin-modern-date-picker__grid" role="grid">
            {calendarDays.map((day, index) => {
              if (!day) {
                return <span key={`empty-${index}`} className="admin-modern-date-picker__cell" aria-hidden />;
              }

              const disabledDay = isDisabledDay(day);
              const isSelected = draftDate ? isSameDay(day, draftDate) : false;
              const isToday = isSameDay(day, today);

              return (
                <button
                  key={toIsoDate(day)}
                  type="button"
                  role="gridcell"
                  disabled={disabledDay}
                  className={[
                    'admin-modern-date-picker__day',
                    isSelected ? 'is-selected' : '',
                    isToday ? 'is-today' : '',
                    disabledDay ? 'is-disabled' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => !disabledDay && setDraft(toIsoDate(day))}
                  aria-pressed={isSelected}
                  aria-label={new Intl.DateTimeFormat(locale, {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  }).format(day)}
                >
                  <span>{day.getDate()}</span>
                </button>
              );
            })}
          </div>

          <div className="admin-modern-date-picker__footer">
            <button type="button" className="admin-modern-date-picker__action" onClick={cancel}>
              {t('admin.forms.createAnnouncement.publication.datePicker.cancel', {
                defaultValue: 'Annuler',
              })}
            </button>
            <button
              type="button"
              className="admin-modern-date-picker__action admin-modern-date-picker__action--primary"
              onClick={confirm}
              disabled={!draft}
            >
              {t('admin.forms.createAnnouncement.publication.datePicker.confirm', {
                defaultValue: 'OK',
              })}
            </button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );

  return (
    <div
      className={[
        'admin-modern-date-picker',
        open ? 'admin-modern-date-picker--open' : '',
        disabled ? 'admin-modern-date-picker--disabled' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-invalid={ariaInvalid}
        className="admin-modern-date-picker__trigger"
        onClick={() => (open ? close() : openPicker())}
        onKeyDown={onTriggerKeyDown}
      >
        <span
          className={[
            'admin-modern-date-picker__value',
            !displayValue ? 'admin-modern-date-picker__value--placeholder' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {displayValue || placeholder}
        </span>
        <Calendar className="admin-modern-date-picker__icon" strokeWidth={1.75} aria-hidden />
      </button>
      {panel}
    </div>
  );
};

export default AdminModernDatePicker;
