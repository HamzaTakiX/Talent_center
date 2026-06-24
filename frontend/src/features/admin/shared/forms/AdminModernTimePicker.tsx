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
  type RefObject,
} from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAdminTheme } from '../../dashboard/context/AdminThemeContext';

const PICKER_WIDTH = 260;
const MENU_GAP = 8;

interface AdminModernTimePickerProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  'aria-invalid'?: boolean;
  'aria-label'?: string;
}

function parseTime(value: string): { hours: number; minutes: number } | null {
  if (!value) return null;
  const [h, m] = value.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) return null;
  return { hours: h, minutes: m };
}

function formatTime(hours: number, minutes: number): string {
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

const AdminModernTimePicker: FunctionComponent<AdminModernTimePickerProps> = ({
  id: idProp,
  value,
  onChange,
  disabled = false,
  placeholder = '--:--',
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
  const hoursColRef = useRef<HTMLDivElement>(null);
  const minutesColRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; placement: 'bottom' | 'top' } | null>(null);
  const [draftHours, setDraftHours] = useState(8);
  const [draftMinutes, setDraftMinutes] = useState(0);

  const parsed = parseTime(value);
  const draftValue = formatTime(draftHours, draftMinutes);

  const formatDisplay = (time: string) => {
    const p = parseTime(time);
    if (!p) return '';
    const date = new Date(2000, 0, 1, p.hours, p.minutes);
    return new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(date);
  };

  const displayValue = parsed ? formatDisplay(value) : '';

  const scrollToSelected = useCallback(() => {
    const scrollCol = (col: HTMLDivElement | null, selected: number) => {
      const btn = col?.querySelector<HTMLButtonElement>(`[data-value="${selected}"]`);
      btn?.scrollIntoView({ block: 'center' });
    };
    scrollCol(hoursColRef.current, draftHours);
    scrollCol(minutesColRef.current, draftMinutes);
  }, [draftHours, draftMinutes]);

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const panelHeight = panelRef.current?.offsetHeight ?? 320;
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
    const p = parseTime(value);
    setDraftHours(p?.hours ?? 8);
    setDraftMinutes(p?.minutes ?? 0);
    setOpen(true);
  }, [disabled, value]);

  const confirm = useCallback(() => {
    onChange(formatTime(draftHours, draftMinutes));
    close();
    triggerRef.current?.focus();
  }, [draftHours, draftMinutes, onChange, close]);

  const cancel = useCallback(() => {
    const p = parseTime(value);
    setDraftHours(p?.hours ?? 8);
    setDraftMinutes(p?.minutes ?? 0);
    close();
    triggerRef.current?.focus();
  }, [value, close]);

  useLayoutEffect(() => {
    if (!open) {
      setCoords(null);
      return;
    }
    updatePosition();
    requestAnimationFrame(scrollToSelected);
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open, updatePosition, scrollToSelected]);

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

  const renderColumn = (
    label: string,
    items: number[],
    selected: number,
    onSelect: (v: number) => void,
    colRef: RefObject<HTMLDivElement>,
  ) => (
    <div className="admin-modern-time-picker__column" role="group" aria-label={label}>
      <span className="admin-modern-time-picker__column-label">{label}</span>
      <div ref={colRef} className="admin-modern-time-picker__scroll">
        {items.map((item) => {
          const isSelected = item === selected;
          return (
            <button
              key={item}
              type="button"
              data-value={item}
              className={['admin-modern-time-picker__option', isSelected ? 'is-selected' : '']
                .filter(Boolean)
                .join(' ')}
              onClick={() => onSelect(item)}
              aria-pressed={isSelected}
            >
              {String(item).padStart(2, '0')}
            </button>
          );
        })}
      </div>
    </div>
  );

  const panel = createPortal(
    <AnimatePresence>
      {open && coords ? (
        <motion.div
          key={panelId}
          ref={panelRef}
          id={panelId}
          role="dialog"
          aria-modal="true"
          aria-label={t('admin.forms.createAnnouncement.publication.timePicker.title', {
            defaultValue: 'Sélectionner une heure',
          })}
          data-admin-theme={theme}
          dir={isRtl ? 'rtl' : 'ltr'}
          className="admin-modern-time-picker__panel"
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
          <div className="admin-modern-time-picker__header">
            <span className="admin-modern-time-picker__header-label">
              {t('admin.forms.createAnnouncement.publication.timePicker.title', {
                defaultValue: 'Sélectionner une heure',
              })}
            </span>
            <p className="admin-modern-time-picker__header-time">{formatDisplay(draftValue)}</p>
          </div>

          <div className="admin-modern-time-picker__columns">
            {renderColumn(
              t('admin.forms.createAnnouncement.publication.timePicker.hours', { defaultValue: 'Heures' }),
              HOURS,
              draftHours,
              setDraftHours,
              hoursColRef,
            )}
            <span className="admin-modern-time-picker__separator" aria-hidden>
              :
            </span>
            {renderColumn(
              t('admin.forms.createAnnouncement.publication.timePicker.minutes', { defaultValue: 'Minutes' }),
              MINUTES,
              draftMinutes,
              setDraftMinutes,
              minutesColRef,
            )}
          </div>

          <div className="admin-modern-time-picker__footer">
            <button type="button" className="admin-modern-time-picker__action" onClick={cancel}>
              {t('admin.forms.createAnnouncement.publication.timePicker.cancel', {
                defaultValue: 'Annuler',
              })}
            </button>
            <button
              type="button"
              className="admin-modern-time-picker__action admin-modern-time-picker__action--primary"
              onClick={confirm}
            >
              {t('admin.forms.createAnnouncement.publication.timePicker.confirm', {
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
        'admin-modern-time-picker',
        open ? 'admin-modern-time-picker--open' : '',
        disabled ? 'admin-modern-time-picker--disabled' : '',
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
        className="admin-modern-time-picker__trigger"
        onClick={() => (open ? close() : openPicker())}
        onKeyDown={onTriggerKeyDown}
      >
        <span
          className={[
            'admin-modern-time-picker__value',
            !displayValue ? 'admin-modern-time-picker__value--placeholder' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {displayValue || placeholder}
        </span>
        <Clock className="admin-modern-time-picker__icon" strokeWidth={1.75} aria-hidden />
      </button>
      {panel}
    </div>
  );
};

export default AdminModernTimePicker;
